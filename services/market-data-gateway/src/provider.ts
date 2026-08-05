import type { GatewayStatus, MarketEvent } from './contracts.js';

export type EventHandler = (event: MarketEvent) => void | Promise<void>;

export interface PublicMarketDataProvider {
  readonly name: string;
  readonly publicDataOnly: true;
  start(onEvent: EventHandler): Promise<void>;
  stop(): Promise<void>;
  subscribe(symbols: string[]): Promise<void>;
  unsubscribe(symbols: string[]): Promise<void>;
  status(): Omit<GatewayStatus, 'service' | 'version' | 'staleAfterMs'>;
}

export class DisabledProvider implements PublicMarketDataProvider {
  readonly name = 'disabled';
  readonly publicDataOnly = true as const;

  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  async subscribe(): Promise<void> {}
  async unsubscribe(): Promise<void> {}

  status(): Omit<GatewayStatus, 'service' | 'version' | 'staleAfterMs'> {
    return {
      state: 'disabled',
      provider: null,
      publicDataOnly: true,
      exchangeCredentialsAccepted: false,
      lastEventAt: null,
      symbols: [],
      subscriptions: 0,
      reason: 'No public market-data provider is configured.',
    };
  }
}

export class FixtureProvider implements PublicMarketDataProvider {
  readonly name = 'fixture';
  readonly publicDataOnly = true as const;
  private symbols = new Set<string>();
  private running = false;
  private lastEventAt: string | null = null;

  async start(): Promise<void> { this.running = true; }
  async stop(): Promise<void> { this.running = false; }
  async subscribe(symbols: string[]): Promise<void> { symbols.forEach((symbol) => this.symbols.add(symbol)); }
  async unsubscribe(symbols: string[]): Promise<void> { symbols.forEach((symbol) => this.symbols.delete(symbol)); }

  emit(event: MarketEvent, onEvent: EventHandler): Promise<void> {
    this.lastEventAt = event.receivedTime;
    return Promise.resolve(onEvent(event));
  }

  status(): Omit<GatewayStatus, 'service' | 'version' | 'staleAfterMs'> {
    return {
      state: this.running ? 'connected' : 'stopped',
      provider: this.name,
      publicDataOnly: true,
      exchangeCredentialsAccepted: false,
      lastEventAt: this.lastEventAt,
      symbols: [...this.symbols].sort(),
      subscriptions: this.symbols.size,
      reason: this.running ? null : 'Fixture provider is stopped.',
    };
  }
}
