import type { MarketEvent } from './contracts.js';
import type { GatewayConfig } from './config.js';

type SinkMetrics = {
  submitted: number;
  completed: number;
  failed: number;
  rejected: number;
  retried: number;
  inFlight: number;
};

export class PersistenceSink {
  private readonly pending = new Set<Promise<void>>();
  private closed = false;
  private metricsState: SinkMetrics = { submitted: 0, completed: 0, failed: 0, rejected: 0, retried: 0, inFlight: 0 };

  constructor(private readonly config: GatewayConfig, private readonly fetchImpl: typeof fetch = fetch) {}

  get enabled(): boolean { return this.config.persistenceBaseUrl !== undefined; }

  submit(event: MarketEvent): boolean {
    if (!this.enabled || this.closed || event.type === 'trade') return false;
    if (event.type === 'candle' && !event.closed) return false;
    if (this.pending.size >= this.config.persistenceMaxPending) {
      this.metricsState.rejected += 1;
      return false;
    }
    this.metricsState.submitted += 1;
    const task = this.persistWithRetry(event)
      .then(() => { this.metricsState.completed += 1; })
      .catch(() => { this.metricsState.failed += 1; })
      .finally(() => {
        this.pending.delete(task);
        this.metricsState.inFlight = this.pending.size;
      });
    this.pending.add(task);
    this.metricsState.inFlight = this.pending.size;
    return true;
  }

  private async persistWithRetry(event: Extract<MarketEvent, { type: 'ticker' | 'candle' }>): Promise<void> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.config.persistenceMaxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.persistenceTimeoutMs);
      try {
        const base = this.config.persistenceBaseUrl as string;
        const response = await this.fetchImpl(new URL(`/internal/market-data/${event.type}`, base), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(event),
          signal: controller.signal,
        });
        if (response.ok) return;
        if (response.status < 500 && response.status !== 429) throw new Error(`persistence rejected ${response.status}`);
        lastError = new Error(`persistence unavailable ${response.status}`);
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timeout);
      }
      if (attempt < this.config.persistenceMaxRetries) {
        this.metricsState.retried += 1;
        const delay = this.config.persistenceBackoffMs * (2 ** attempt);
        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError instanceof Error ? lastError : new Error('persistence failed');
  }

  metrics(): SinkMetrics { return { ...this.metricsState, inFlight: this.pending.size }; }

  async close(): Promise<SinkMetrics> {
    this.closed = true;
    await Promise.allSettled([...this.pending]);
    return this.metrics();
  }
}
