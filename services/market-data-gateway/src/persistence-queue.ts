/**
 * Persistence queue: routes normalized MarketEvents from the gateway into a
 * repository with bounded retry / exponential back-off so that transient
 * database errors do not drop events immediately and do not block the feed.
 */

import type { MarketEvent } from './contracts.js';

export interface PersistenceRepository {
  persistTicker(event: Extract<MarketEvent, { type: 'ticker' }>): Promise<void>;
  persistCandle(event: Extract<MarketEvent, { type: 'candle' }>): Promise<void>;
}

export interface PersistenceQueueOptions {
  maxAttempts?: number;
  retryBaseMs?: number;
  retryMaxMs?: number;
  maxPending?: number;
  /** Called when an event is permanently dropped after all retry attempts. */
  onDropped?: (event: MarketEvent, error: unknown) => void;
}

type PendingWrite = () => Promise<void>;

async function withRetry(
  op: () => Promise<void>,
  maxAttempts: number,
  baseMs: number,
  maxMs: number,
): Promise<void> {
  let delay = baseMs;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await op();
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxMs);
    }
  }
}

export class PersistenceWriteQueue {
  private readonly repo: PersistenceRepository;
  private readonly maxAttempts: number;
  private readonly retryBaseMs: number;
  private readonly retryMaxMs: number;
  private readonly maxPending: number;
  private readonly onDropped: (event: MarketEvent, error: unknown) => void;

  private pending = 0;
  private submitted = 0;
  private completed = 0;
  private failed = 0;
  private rejected = 0;

  constructor(repo: PersistenceRepository, options: PersistenceQueueOptions = {}) {
    this.repo = repo;
    this.maxAttempts = options.maxAttempts ?? 3;
    this.retryBaseMs = options.retryBaseMs ?? 100;
    this.retryMaxMs = options.retryMaxMs ?? 5000;
    this.maxPending = options.maxPending ?? 1000;
    this.onDropped = options.onDropped ?? (() => undefined);
  }

  enqueue(event: MarketEvent): boolean {
    if (event.type !== 'ticker' && event.type !== 'candle') return false;
    if (this.pending >= this.maxPending) {
      this.rejected++;
      return false;
    }

    this.pending++;
    this.submitted++;

    const write: PendingWrite =
      event.type === 'ticker'
        ? () => this.repo.persistTicker(event as Extract<MarketEvent, { type: 'ticker' }>)
        : () =>
            (event as Extract<MarketEvent, { type: 'candle' }>).closed
              ? this.repo.persistCandle(event as Extract<MarketEvent, { type: 'candle' }>)
              : Promise.resolve();

    withRetry(write, this.maxAttempts, this.retryBaseMs, this.retryMaxMs)
      .then(() => {
        this.completed++;
      })
      .catch((err: unknown) => {
        this.failed++;
        this.onDropped(event, err);
      })
      .finally(() => {
        this.pending--;
      });

    return true;
  }

  metrics() {
    return {
      submitted: this.submitted,
      completed: this.completed,
      failed: this.failed,
      rejected: this.rejected,
      pending: this.pending,
    };
  }
}
