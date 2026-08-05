import WebSocket from 'ws';
import type { CandleEvent, GatewayStatus, MarketEvent, TickerEvent } from './contracts.js';
import type { EventHandler, PublicMarketDataProvider } from './provider.js';

const TF_TO_BYBIT: Record<string, string> = { '1m':'1','3m':'3','5m':'5','15m':'15','30m':'30','1h':'60','4h':'240','1d':'D' };
const BYBIT_TO_TF = Object.fromEntries(Object.entries(TF_TO_BYBIT).map(([k,v])=>[v,k]));

type WsFactory = (url: string) => WebSocket;

type Options = {
  url?: string;
  heartbeatMs?: number;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
  websocketFactory?: WsFactory;
  now?: () => number;
  random?: () => number;
};

export class BybitPublicWebSocketProvider implements PublicMarketDataProvider {
  readonly name = 'bybit-public-websocket';
  readonly publicDataOnly = true as const;
  private readonly url: string;
  private readonly heartbeatMs: number;
  private readonly reconnectBaseMs: number;
  private readonly reconnectMaxMs: number;
  private readonly websocketFactory: WsFactory;
  private readonly now: () => number;
  private readonly random: () => number;
  private socket: WebSocket | null = null;
  private onEvent: EventHandler = async () => undefined;
  private symbols = new Set<string>();
  private state: GatewayStatus['state'] = 'stopped';
  private lastEventAt: string | null = null;
  private heartbeat: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempt = 0;
  private stopped = true;
  private tickerState = new Map<string, { bid?: number; ask?: number; last?: number }>();
  private seen = new Map<string, number>();

  constructor(options: Options = {}) {
    this.url = options.url ?? 'wss://stream.bybit.com/v5/public/linear';
    this.heartbeatMs = options.heartbeatMs ?? 20_000;
    this.reconnectBaseMs = options.reconnectBaseMs ?? 500;
    this.reconnectMaxMs = options.reconnectMaxMs ?? 30_000;
    this.websocketFactory = options.websocketFactory ?? ((url) => new WebSocket(url));
    this.now = options.now ?? Date.now;
    this.random = options.random ?? Math.random;
  }

  async start(onEvent: EventHandler): Promise<void> {
    this.onEvent = onEvent;
    this.stopped = false;
    this.connect();
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.state = 'stopped';
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }

  async subscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.symbols.add(s));
    this.sendSubscription('subscribe', symbols);
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.symbols.delete(s));
    this.sendSubscription('unsubscribe', symbols);
  }

  status(): Omit<GatewayStatus,'service'|'version'|'staleAfterMs'> {
    return {
      state: this.state,
      provider: this.name,
      publicDataOnly: true,
      exchangeCredentialsAccepted: false,
      lastEventAt: this.lastEventAt,
      symbols: [...this.symbols].sort(),
      subscriptions: this.symbols.size,
      reason: this.state === 'connected' ? null : `WebSocket state: ${this.state}`,
    };
  }

  private connect(): void {
    if (this.stopped) return;
    this.state = 'starting';
    const ws = this.websocketFactory(this.url);
    this.socket = ws;
    ws.on('open', () => {
      this.state = 'connected';
      this.reconnectAttempt = 0;
      this.sendSubscription('subscribe', [...this.symbols]);
      this.heartbeat = setInterval(() => this.send({ op: 'ping' }), this.heartbeatMs);
    });
    ws.on('message', (raw) => { void this.handleMessage(raw.toString()); });
    ws.on('error', () => { this.state = 'degraded'; });
    ws.on('close', () => {
      if (this.heartbeat) clearInterval(this.heartbeat);
      this.heartbeat = null;
      this.socket = null;
      if (!this.stopped) this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    this.state = 'degraded';
    const base = Math.min(this.reconnectMaxMs, this.reconnectBaseMs * 2 ** this.reconnectAttempt++);
    const delay = Math.round(base * (0.8 + this.random() * 0.4));
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private sendSubscription(op: 'subscribe'|'unsubscribe', symbols: string[]): void {
    if (!symbols.length) return;
    const args = symbols.flatMap((s) => [`tickers.${s}`, ...Object.values(TF_TO_BYBIT).map((tf) => `kline.${tf}.${s}`)]);
    this.send({ op, args });
  }

  private send(payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload));
  }

  private async handleMessage(raw: string): Promise<void> {
    let msg: any;
    try { msg = JSON.parse(raw); } catch { return; }
    if (!msg.topic) return;
    const event = normalizeBybitWebSocketMessage(msg, this.tickerState, this.now());
    if (!event) return;
    const key = event.type === 'ticker' ? `t:${event.symbol}:${event.sequence ?? event.eventTime}` : `c:${event.symbol}:${event.timeframe}:${event.openTime}:${event.close}`;
    const now = this.now();
    const previous = this.seen.get(key);
    if (previous && now - previous < 60_000) return;
    this.seen.set(key, now);
    this.lastEventAt = new Date(now).toISOString();
    await this.onEvent(event);
  }
}

export function normalizeBybitWebSocketMessage(
  msg: any,
  tickerState = new Map<string, { bid?: number; ask?: number; last?: number }>(),
  receivedMs = Date.now(),
): MarketEvent | null {
  if (typeof msg?.topic !== 'string') return null;
  if (msg.topic.startsWith('tickers.')) {
    const data = Array.isArray(msg.data) ? msg.data[0] : msg.data;
    const symbol = data?.symbol ?? msg.topic.split('.')[1];
    const prev = tickerState.get(symbol) ?? {};
    const next = {
      bid: data?.bid1Price ? Number(data.bid1Price) : prev.bid,
      ask: data?.ask1Price ? Number(data.ask1Price) : prev.ask,
      last: data?.lastPrice ? Number(data.lastPrice) : prev.last,
    };
    if (!next.bid || !next.ask || !next.last) return null;
    tickerState.set(symbol, next);
    return {
      type:'ticker', provider:'bybit', symbol,
      eventTime:new Date(Number(msg.ts ?? receivedMs)).toISOString(),
      receivedTime:new Date(receivedMs).toISOString(),
      bid:next.bid, ask:next.ask, last:next.last,
      sequence:Number.isInteger(msg.cs) ? msg.cs : null,
    } satisfies TickerEvent;
  }
  if (msg.topic.startsWith('kline.')) {
    const data = Array.isArray(msg.data) ? msg.data[0] : null;
    if (!data) return null;
    const [, interval, symbol] = msg.topic.split('.');
    const timeframe = BYBIT_TO_TF[interval];
    if (!timeframe) return null;
    return {
      type:'candle', provider:'bybit', symbol, timeframe: timeframe as CandleEvent['timeframe'],
      openTime:new Date(Number(data.start)).toISOString(),
      closeTime:new Date(Number(data.end) + 1).toISOString(),
      open:Number(data.open), high:Number(data.high), low:Number(data.low), close:Number(data.close),
      volume:Number(data.volume), closed:Boolean(data.confirm), receivedTime:new Date(receivedMs).toISOString(),
    } satisfies CandleEvent;
  }
  return null;
}
