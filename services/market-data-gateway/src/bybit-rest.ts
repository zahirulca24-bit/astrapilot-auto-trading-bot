import { z } from 'zod';
import type { GatewayConfig } from './config.js';
import { candleSchema, symbolSchema, tickerSchema, timeframeSchema } from './contracts.js';

const intervals: Record<z.infer<typeof timeframeSchema>, string> = {
  '1m': '1', '3m': '3', '5m': '5', '15m': '15', '30m': '30', '1h': '60', '4h': '240', '1d': 'D',
};
const stableBases = new Set(['USDC', 'USDE', 'FDUSD', 'TUSD', 'DAI', 'PYUSD']);

type FetchLike = typeof fetch;
type CacheEntry<T> = { expiresAt: number; value: T };

export class BybitRestError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number) { super(message); }
}

export class BybitRestClient {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private nextRequestAt = 0;
  constructor(private readonly config: GatewayConfig, private readonly fetchImpl: FetchLike = fetch) {}

  private async request<T>(path: string, query: Record<string, string>): Promise<T> {
    const url = new URL(path, this.config.bybitRestBaseUrl);
    Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
    const cacheKey = url.toString();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;

    let lastError: unknown;
    for (let attempt = 0; attempt <= this.config.bybitRestMaxRetries; attempt += 1) {
      const waitMs = Math.max(0, this.nextRequestAt - Date.now());
      if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
      this.nextRequestAt = Date.now() + this.config.bybitRestMinIntervalMs;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.bybitRestTimeoutMs);
      try {
        const response = await this.fetchImpl(url, { signal: controller.signal, headers: { accept: 'application/json' } });
        if (response.status === 403 || response.status === 429 || response.status >= 500) {
          throw new BybitRestError('provider_unavailable', `Bybit HTTP ${response.status}`, response.status);
        }
        if (!response.ok) throw new BybitRestError('provider_rejected', `Bybit HTTP ${response.status}`, response.status);
        const payload = await response.json() as { retCode?: number; retMsg?: string; result?: T };
        if (payload.retCode !== 0 || payload.result === undefined) {
          throw new BybitRestError('provider_payload_error', payload.retMsg ?? 'Invalid Bybit response');
        }
        this.cache.set(cacheKey, { expiresAt: Date.now() + this.config.bybitRestCacheTtlMs, value: payload.result });
        return payload.result;
      } catch (error) {
        lastError = error;
        const retryable = error instanceof BybitRestError
          ? error.status === 403 || error.status === 429 || (error.status ?? 0) >= 500
          : true;
        if (!retryable || attempt === this.config.bybitRestMaxRetries) break;
        const backoff = this.config.bybitRestBackoffMs * (2 ** attempt) + Math.floor(Math.random() * 100);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      } finally { clearTimeout(timeout); }
    }
    throw lastError instanceof Error ? lastError : new BybitRestError('provider_unavailable', 'Bybit request failed');
  }

  async topSymbols(limit = 20): Promise<Array<{ symbol: string; turnover24h: number }>> {
    const [instruments, tickers] = await Promise.all([
      this.request<{ list: Array<{ symbol: string; status: string; quoteCoin: string; baseCoin: string; contractType: string }> }>('/v5/market/instruments-info', { category: 'linear', limit: '1000' }),
      this.request<{ list: Array<{ symbol: string; turnover24h: string }> }>('/v5/market/tickers', { category: 'linear' }),
    ]);
    const allowed = new Set(instruments.list.filter((item) => item.status === 'Trading' && item.quoteCoin === 'USDT' && item.contractType === 'LinearPerpetual' && !stableBases.has(item.baseCoin)).map((item) => item.symbol));
    return tickers.list.filter((item) => allowed.has(item.symbol)).map((item) => ({ symbol: item.symbol, turnover24h: Number(item.turnover24h) })).filter((item) => Number.isFinite(item.turnover24h)).sort((a, b) => b.turnover24h - a.turnover24h).slice(0, Math.min(limit, 20));
  }

  async ticker(symbolInput: string) {
    const symbol = symbolSchema.parse(symbolInput.toUpperCase());
    const result = await this.request<{ list: Array<{ symbol: string; bid1Price: string; ask1Price: string; lastPrice: string }> }>('/v5/market/tickers', { category: 'linear', symbol });
    const row = result.list[0];
    if (!row) throw new BybitRestError('symbol_not_found', `No ticker for ${symbol}`);
    const now = new Date().toISOString();
    return tickerSchema.parse({ type: 'ticker', provider: 'bybit', symbol, eventTime: now, receivedTime: now, bid: Number(row.bid1Price), ask: Number(row.ask1Price), last: Number(row.lastPrice), sequence: null });
  }

  async candles(symbolInput: string, timeframeInput: string, limitInput = 200) {
    const symbol = symbolSchema.parse(symbolInput.toUpperCase());
    const timeframe = timeframeSchema.parse(timeframeInput);
    const limit = Math.max(1, Math.min(limitInput, 1000));
    const result = await this.request<{ list: string[][] }>('/v5/market/kline', { category: 'linear', symbol, interval: intervals[timeframe], limit: String(limit) });
    const receivedTime = new Date().toISOString();
    const durationMs = timeframe === '1d' ? 86_400_000 : Number(intervals[timeframe]) * 60_000;
    return result.list.map((row) => {
      const openMs = Number(row[0]);
      const closeMs = openMs + durationMs;
      return candleSchema.parse({ type: 'candle', provider: 'bybit', symbol, timeframe, openTime: new Date(openMs).toISOString(), closeTime: new Date(closeMs).toISOString(), open: Number(row[1]), high: Number(row[2]), low: Number(row[3]), close: Number(row[4]), volume: Number(row[5]), closed: Date.now() >= closeMs, receivedTime });
    }).sort((a, b) => Date.parse(a.openTime) - Date.parse(b.openTime));
  }
}
