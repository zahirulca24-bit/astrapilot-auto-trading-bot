import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from '../src/config.js';
import { PersistenceSink } from '../src/persistence-sink.js';

const ticker = {
  type: 'ticker' as const,
  provider: 'bybit',
  symbol: 'BTCUSDT',
  eventTime: '2026-08-06T00:00:00.000Z',
  receivedTime: '2026-08-06T00:00:00.100Z',
  bid: 100,
  ask: 101,
  last: 100.5,
  sequence: 1,
};

const candle = {
  type: 'candle' as const,
  provider: 'bybit',
  symbol: 'BTCUSDT',
  timeframe: '1m' as const,
  openTime: '2026-08-06T00:00:00.000Z',
  closeTime: '2026-08-06T00:01:00.000Z',
  receivedTime: '2026-08-06T00:01:00.100Z',
  open: 100,
  high: 102,
  low: 99,
  close: 101,
  volume: 10,
  closed: true,
};

function config() {
  return loadConfig({
    NODE_ENV: 'test',
    PERSISTENCE_BASE_URL: 'http://127.0.0.1:8000',
    PERSISTENCE_MAX_RETRIES: '2',
    PERSISTENCE_BACKOFF_MS: '0',
    PERSISTENCE_TIMEOUT_MS: '1000',
  });
}

test('retries transient persistence failure and drains on close', async () => {
  let attempts = 0;
  const fakeFetch: typeof fetch = async () => {
    attempts += 1;
    return new Response(null, { status: attempts < 3 ? 503 : 202 });
  };
  const sink = new PersistenceSink(config(), fakeFetch);
  assert.equal(sink.submit(ticker), true);
  const metrics = await sink.close();
  assert.equal(attempts, 3);
  assert.equal(metrics.retried, 2);
  assert.equal(metrics.completed, 1);
  assert.equal(metrics.failed, 0);
});

test('rejects open candles before any network write', async () => {
  let calls = 0;
  const fakeFetch: typeof fetch = async () => {
    calls += 1;
    return new Response(null, { status: 202 });
  };
  const sink = new PersistenceSink(config(), fakeFetch);
  assert.equal(sink.submit({ ...candle, closed: false }), false);
  const metrics = await sink.close();
  assert.equal(calls, 0);
  assert.equal(metrics.submitted, 0);
});
