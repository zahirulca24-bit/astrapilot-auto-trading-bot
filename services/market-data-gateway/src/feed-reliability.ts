import type { MarketEvent } from './contracts.js';

export type ReliabilityMetrics = {
  reconnects: number;
  duplicateEvents: number;
  outOfOrderEvents: number;
  acceptedEvents: number;
  circuitState: 'closed' | 'open' | 'half-open';
  circuitOpenUntil: string | null;
  lastDisconnectAt: string | null;
};

export class EventOrderGuard {
  private readonly seen = new Map<string, number>();
  private readonly latestSequence = new Map<string, number>();
  private readonly latestCandleOpen = new Map<string, number>();

  accept(event: MarketEvent, nowMs: number): 'accepted' | 'duplicate' | 'out-of-order' {
    const key = this.eventKey(event);
    const previous = this.seen.get(key);
    if (previous !== undefined && nowMs - previous < 60_000) return 'duplicate';

    if (event.type === 'ticker' && event.sequence !== null) {
      const sequenceKey = `ticker:${event.symbol}`;
      const latest = this.latestSequence.get(sequenceKey);
      if (latest !== undefined && event.sequence < latest) return 'out-of-order';
      this.latestSequence.set(sequenceKey, event.sequence);
    }

    if (event.type === 'candle') {
      const candleKey = `candle:${event.symbol}:${event.timeframe}`;
      const openMs = Date.parse(event.openTime);
      const latest = this.latestCandleOpen.get(candleKey);
      if (latest !== undefined && openMs < latest) return 'out-of-order';
      this.latestCandleOpen.set(candleKey, openMs);
    }

    this.seen.set(key, nowMs);
    if (this.seen.size > 10_000) {
      for (const [candidate, timestamp] of this.seen) {
        if (nowMs - timestamp > 60_000) this.seen.delete(candidate);
      }
    }
    return 'accepted';
  }

  private eventKey(event: MarketEvent): string {
    if (event.type === 'ticker') return `t:${event.symbol}:${event.sequence ?? event.eventTime}`;
    if (event.type === 'candle') return `c:${event.symbol}:${event.timeframe}:${event.openTime}:${event.closeTime}:${event.close}`;
    return `x:${event.symbol}:${event.eventTime}:${event.tradeId}`;
  }
}

export class CircuitBreaker {
  private failures = 0;
  private openedAt: number | null = null;

  constructor(
    private readonly failureThreshold = 5,
    private readonly cooldownMs = 30_000,
  ) {}

  recordSuccess(): void {
    this.failures = 0;
    this.openedAt = null;
  }

  recordFailure(nowMs: number): void {
    this.failures += 1;
    if (this.failures >= this.failureThreshold && this.openedAt === null) this.openedAt = nowMs;
  }

  state(nowMs: number): 'closed' | 'open' | 'half-open' {
    if (this.openedAt === null) return 'closed';
    return nowMs - this.openedAt >= this.cooldownMs ? 'half-open' : 'open';
  }

  canAttempt(nowMs: number): boolean {
    return this.state(nowMs) !== 'open';
  }

  openUntil(): number | null {
    return this.openedAt === null ? null : this.openedAt + this.cooldownMs;
  }
}

const TIMEFRAME_MS: Record<string, number> = {
  '1m': 60_000,
  '3m': 180_000,
  '5m': 300_000,
  '15m': 900_000,
  '30m': 1_800_000,
  '1h': 3_600_000,
  '4h': 14_400_000,
  '1d': 86_400_000,
};

export function recoveryLimit(timeframe: string, lastOpenTime: string, nowMs = Date.now()): number {
  const interval = TIMEFRAME_MS[timeframe];
  if (!interval) throw new Error(`Unsupported timeframe: ${timeframe}`);
  const lastMs = Date.parse(lastOpenTime);
  if (!Number.isFinite(lastMs)) throw new Error('Invalid lastOpenTime');
  const missing = Math.max(1, Math.ceil((nowMs - lastMs) / interval) + 1);
  return Math.min(1000, missing);
}
