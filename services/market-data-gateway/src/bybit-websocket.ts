import WebSocket from 'ws';
import type { GatewayStatus, MarketEvent } from './contracts.js';
import { CircuitBreaker, EventOrderGuard, type ReliabilityMetrics } from './feed-reliability.js';
import type { EventHandler, PublicMarketDataProvider } from './provider.js';

type TickerEvent = Extract<MarketEvent, { type: 'ticker' }>;
type CandleEvent = Extract<MarketEvent, { type: 'candle' }>;
const TF_TO_BYBIT: Record<string, string> = { '1m':'1','3m':'3','5m':'5','15m':'15','30m':'30','1h':'60','4h':'240','1d':'D' };
const BYBIT_TO_TF = Object.fromEntries(Object.entries(TF_TO_BYBIT).map(([k,v])=>[v,k]));

type WsFactory = (url: string) => WebSocket;
type Options = {
  url?: string;
  heartbeatMs?: number;
  staleAfterMs?: number;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
  circuitFailureThreshold?: number;
  circuitCooldownMs?: number;
  websocketFactory?: WsFactory;
  now?: () => number;
  random?: () => number;
};

export class BybitPublicWebSocketProvider implements PublicMarketDataProvider {
  readonly name = 'bybit-public-websocket';
  readonly publicDataOnly = true as const;
  private readonly url: string;
  private readonly heartbeatMs: number;
  private readonly staleAfterMs: number;
  private readonly reconnectBaseMs: number;
  private readonly reconnectMaxMs: number;
  private readonly websocketFactory: WsFactory;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly orderGuard = new EventOrderGuard();
  private readonly circuit: CircuitBreaker;
  private socket: WebSocket | null = null;
  private onEvent: EventHandler = async () => undefined;
  private symbols = new Set<string>();
  private state: GatewayStatus['state'] = 'stopped';
  private lastEventAt: string | null = null;
  private lastDisconnectAt: string | null = null;
  private heartbeat: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempt = 0;
  private reconnects = 0;
  private duplicateEvents = 0;
  private outOfOrderEvents = 0;
  private acceptedEvents = 0;
  private stopped = true;
  private tickerState = new Map<string, { bid?: number; ask?: number; last?: number }>();

  constructor(options: Options = {}) {
    this.url = options.url ?? 'wss://stream.bybit.com/v5/public/linear';
    this.heartbeatMs = options.heartbeatMs ?? 20_000;
    this.staleAfterMs = options.staleAfterMs ?? 15_000;
    this.reconnectBaseMs = options.reconnectBaseMs ?? 500;
    this.reconnectMaxMs = options.reconnectMaxMs ?? 30_000;
    this.websocketFactory = options.websocketFactory ?? ((url) => new WebSocket(url));
    this.now = options.now ?? Date.now;
    this.random = options.random ?? Math.random;
    this.circuit = new CircuitBreaker(options.circuitFailureThreshold ?? 5, options.circuitCooldownMs ?? 30_000);
  }

  async start(onEvent: EventHandler): Promise<void> { this.onEvent = onEvent; this.stopped = false; this.connect(); }
  async stop(): Promise<void> {
    this.stopped = true; this.state = 'stopped';
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close(); this.socket = null;
  }
  async subscribe(symbols: string[]): Promise<void> {
    const normalized = symbols.map((symbol) => symbol.toUpperCase());
    normalized.forEach((symbol) => this.symbols.add(symbol));
    this.sendSubscription('subscribe', normalized);
  }
  async unsubscribe(symbols: string[]): Promise<void> {
    const normalized = symbols.map((symbol) => symbol.toUpperCase());
    normalized.forEach((symbol) => this.symbols.delete(symbol));
    this.sendSubscription('unsubscribe', normalized);
  }

  status(): Omit<GatewayStatus,'service'|'version'|'staleAfterMs'> {
    const now = this.now();
    const stale = this.state === 'connected' && this.lastEventAt !== null && now - Date.parse(this.lastEventAt) > this.staleAfterMs;
    const state = stale ? 'stale' : this.state;
    return {
      state,
      provider:this.name,
      publicDataOnly:true,
      exchangeCredentialsAccepted:false,
      lastEventAt:this.lastEventAt,
      symbols:[...this.symbols].sort(),
      subscriptions:this.symbols.size,
      reason: state === 'connected' ? null : state === 'stale' ? 'No normalized market event arrived within the stale threshold.' : `WebSocket state: ${state}`,
    };
  }

  reliability(): ReliabilityMetrics {
    const now = this.now();
    const openUntil = this.circuit.openUntil();
    return {
      reconnects: this.reconnects,
      duplicateEvents: this.duplicateEvents,
      outOfOrderEvents: this.outOfOrderEvents,
      acceptedEvents: this.acceptedEvents,
      circuitState: this.circuit.state(now),
      circuitOpenUntil: openUntil === null ? null : new Date(openUntil).toISOString(),
      lastDisconnectAt: this.lastDisconnectAt,
    };
  }

  private connect(): void {
    if (this.stopped) return;
    const now = this.now();
    if (!this.circuit.canAttempt(now)) {
      this.state = 'degraded';
      this.scheduleReconnect();
      return;
    }
    this.state = 'starting';
    const ws = this.websocketFactory(this.url); this.socket = ws;
    ws.on('open', () => {
      this.state = 'connected'; this.reconnectAttempt = 0; this.circuit.recordSuccess();
      this.sendSubscription('subscribe', [...this.symbols]);
      if (this.heartbeat) clearInterval(this.heartbeat);
      this.heartbeat = setInterval(() => this.send({ op: 'ping' }), this.heartbeatMs);
    });
    ws.on('message', (raw) => { void this.handleMessage(raw.toString()); });
    ws.on('error', () => { this.state = 'degraded'; });
    ws.on('close', () => {
      if (this.heartbeat) clearInterval(this.heartbeat);
      this.heartbeat = null; this.socket = null;
      const closedAt = this.now();
      this.lastDisconnectAt = new Date(closedAt).toISOString();
      this.circuit.recordFailure(closedAt);
      if (!this.stopped) this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.state = 'degraded';
    this.reconnects += 1;
    const base = Math.min(this.reconnectMaxMs, this.reconnectBaseMs * 2 ** this.reconnectAttempt++);
    const circuitUntil = this.circuit.openUntil();
    const circuitDelay = circuitUntil === null ? 0 : Math.max(0, circuitUntil - this.now());
    const delay = Math.max(circuitDelay, Math.round(base * (0.8 + this.random() * 0.4)));
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private sendSubscription(op: 'subscribe'|'unsubscribe', symbols: string[]): void {
    if (!symbols.length) return;
    const args = symbols.flatMap((symbol) => [`tickers.${symbol}`, ...Object.values(TF_TO_BYBIT).map((tf) => `kline.${tf}.${symbol}`)]);
    this.send({ op, args });
  }
  private send(payload: unknown): void { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload)); }

  private async handleMessage(raw: string): Promise<void> {
    let message: unknown;
    try { message = JSON.parse(raw); } catch { return; }
    const now = this.now();
    const event = normalizeBybitWebSocketMessage(message, this.tickerState, now);
    if (!event) return;
    const result = this.orderGuard.accept(event, now);
    if (result === 'duplicate') { this.duplicateEvents += 1; return; }
    if (result === 'out-of-order') { this.outOfOrderEvents += 1; return; }
    this.acceptedEvents += 1;
    this.lastEventAt = new Date(now).toISOString();
    await this.onEvent(event);
  }
}

export function normalizeBybitWebSocketMessage(message: unknown, tickerState = new Map<string, { bid?: number; ask?: number; last?: number }>(), receivedMs = Date.now()): MarketEvent | null {
  const msg = message as any;
  if (typeof msg?.topic !== 'string') return null;
  if (msg.topic.startsWith('tickers.')) {
    const data = Array.isArray(msg.data) ? msg.data[0] : msg.data;
    const symbol = data?.symbol ?? msg.topic.split('.')[1];
    const prev = tickerState.get(symbol) ?? {};
    const next = {
      ...(data?.bid1Price ? { bid: Number(data.bid1Price) } : prev.bid !== undefined ? { bid: prev.bid } : {}),
      ...(data?.ask1Price ? { ask: Number(data.ask1Price) } : prev.ask !== undefined ? { ask: prev.ask } : {}),
      ...(data?.lastPrice ? { last: Number(data.lastPrice) } : prev.last !== undefined ? { last: prev.last } : {}),
    };
    if (!next.bid || !next.ask || !next.last) return null;
    tickerState.set(symbol, next);
    return { type:'ticker', provider:'bybit', symbol, eventTime:new Date(Number(msg.ts ?? receivedMs)).toISOString(), receivedTime:new Date(receivedMs).toISOString(), bid:next.bid, ask:next.ask, last:next.last, sequence:Number.isInteger(msg.cs) ? msg.cs : null } satisfies TickerEvent;
  }
  if (msg.topic.startsWith('kline.')) {
    const data = Array.isArray(msg.data) ? msg.data[0] : null;
    if (!data) return null;
    const [, interval, symbol] = msg.topic.split('.');
    const timeframe = BYBIT_TO_TF[interval] as CandleEvent['timeframe'] | undefined;
    if (!timeframe) return null;
    return { type:'candle', provider:'bybit', symbol, timeframe, openTime:new Date(Number(data.start)).toISOString(), closeTime:new Date(Number(data.end)).toISOString(), open:Number(data.open), high:Number(data.high), low:Number(data.low), close:Number(data.close), volume:Number(data.volume), closed:Boolean(data.confirm), receivedTime:new Date(receivedMs).toISOString() } satisfies CandleEvent;
  }
  return null;
}
