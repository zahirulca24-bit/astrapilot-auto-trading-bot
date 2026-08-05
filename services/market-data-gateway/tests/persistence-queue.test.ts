import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.js';
import type { MarketEvent } from '../src/contracts.js';
import type { PersistenceRepository } from '../src/persistence-queue.js';
import { PersistenceWriteQueue } from '../src/persistence-queue.js';
import { FixtureProvider } from '../src/provider.js';

const baseConfig = {
  nodeEnv: 'test' as const,
  host: '127.0.0.1',
  port: 4200,
  corsOrigins: ['http://localhost:5173'],
  providerMode: 'fixture' as const,
  staleAfterMs: 15000,
  bybitRestBaseUrl: 'https://api.bybit.com',
  bybitRestTimeoutMs: 5000,
  bybitRestMaxRetries: 2,
  bybitRestBackoffMs: 250,
  bybitRestMinIntervalMs: 150,
  bybitRestCacheTtlMs: 5000,
};

function tickerEvent(): Extract<MarketEvent, { type: 'ticker' }> {
  return {
    type: 'ticker',
    provider: 'fixture',
    symbol: 'BTCUSDT',
    eventTime: '2026-08-05T08:00:00.000Z',
    receivedTime: '2026-08-05T08:00:00.100Z',
    bid: 100,
    ask: 101,
    last: 100.5,
    sequence: 1,
  };
}

function closedCandleEvent(): Extract<MarketEvent, { type: 'candle' }> {
  return {
    type: 'candle',
    provider: 'fixture',
    symbol: 'BTCUSDT',
    timeframe: '5m',
    openTime: '2026-08-05T08:00:00.000Z',
    closeTime: '2026-08-05T08:05:00.000Z',
    open: 100,
    high: 105,
    low: 99,
    close: 104,
    volume: 25,
    closed: true,
    receivedTime: '2026-08-05T08:05:00.100Z',
  };
}

test('persistence queue routes ticker event to repository', async () => {
  const persisted: MarketEvent[] = [];
  const repo: PersistenceRepository = {
    async persistTicker(event) { persisted.push(event); },
    async persistCandle(event) { persisted.push(event); },
  };

  const queue = new PersistenceWriteQueue(repo, { maxAttempts: 1 });
  assert.equal(queue.enqueue(tickerEvent()), true);

  // Allow microtask queue to settle
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0]!.type, 'ticker');
  const m = queue.metrics();
  assert.equal(m.submitted, 1);
  assert.equal(m.completed, 1);
  assert.equal(m.failed, 0);
});

test('persistence queue routes closed candle event to repository', async () => {
  const persisted: MarketEvent[] = [];
  const repo: PersistenceRepository = {
    async persistTicker(event) { persisted.push(event); },
    async persistCandle(event) { persisted.push(event); },
  };

  const queue = new PersistenceWriteQueue(repo, { maxAttempts: 1 });
  assert.equal(queue.enqueue(closedCandleEvent()), true);

  await new Promise((r) => setTimeout(r, 20));
  assert.equal(persisted.length, 1);
  assert.equal(persisted[0]!.type, 'candle');
});

test('persistence queue skips open candles without error', async () => {
  const persisted: MarketEvent[] = [];
  const repo: PersistenceRepository = {
    async persistTicker(event) { persisted.push(event); },
    async persistCandle(event) { persisted.push(event); },
  };

  const queue = new PersistenceWriteQueue(repo, { maxAttempts: 1 });
  const openCandle: Extract<MarketEvent, { type: 'candle' }> = { ...closedCandleEvent(), closed: false };
  assert.equal(queue.enqueue(openCandle), true);

  await new Promise((r) => setTimeout(r, 20));
  assert.equal(persisted.length, 0);
  const m = queue.metrics();
  assert.equal(m.submitted, 1);
  assert.equal(m.completed, 1);
});

test('persistence queue retries transient failure and succeeds', async () => {
  let callCount = 0;
  const repo: PersistenceRepository = {
    async persistTicker() {
      callCount++;
      if (callCount < 2) throw new Error('transient');
    },
    async persistCandle() {},
  };

  const queue = new PersistenceWriteQueue(repo, { maxAttempts: 3, retryBaseMs: 0 });
  queue.enqueue(tickerEvent());

  await new Promise((r) => setTimeout(r, 50));
  assert.equal(callCount, 2);
  const m = queue.metrics();
  assert.equal(m.completed, 1);
  assert.equal(m.failed, 0);
});

test('persistence queue fails event after exhausting all retry attempts', async () => {
  let callCount = 0;
  const dropped: unknown[] = [];
  const repo: PersistenceRepository = {
    async persistTicker() {
      callCount++;
      throw new Error('persistent error');
    },
    async persistCandle() {},
  };

  const queue = new PersistenceWriteQueue(repo, {
    maxAttempts: 3,
    retryBaseMs: 0,
    onDropped: (_event, err) => dropped.push(err),
  });
  queue.enqueue(tickerEvent());

  await new Promise((r) => setTimeout(r, 50));
  assert.equal(callCount, 3); // bounded to maxAttempts
  const m = queue.metrics();
  assert.equal(m.failed, 1);
  assert.equal(m.completed, 0);
  assert.equal(dropped.length, 1);
});

test('persistence queue rejects events when capacity is exceeded', () => {
  const repo: PersistenceRepository = {
    persistTicker: () => new Promise(() => undefined), // never resolves
    persistCandle: () => new Promise(() => undefined),
  };

  const queue = new PersistenceWriteQueue(repo, { maxPending: 1 });
  assert.equal(queue.enqueue(tickerEvent()), true);
  assert.equal(queue.enqueue(tickerEvent()), false);
  const m = queue.metrics();
  assert.equal(m.rejected, 1);
});

test('gateway wires events to persistence repo via buildApp', async () => {
  const persisted: MarketEvent[] = [];
  const repo: PersistenceRepository = {
    async persistTicker(event) { persisted.push(event); },
    async persistCandle(event) { persisted.push(event); },
  };

  const provider = new FixtureProvider();
  const app = await buildApp({ config: baseConfig, provider, persistenceRepo: repo });
  await app.ready();

  // Subscribe and emit a ticker through the FixtureProvider's onEvent callback
  await app.inject({ method: 'POST', url: '/subscriptions', payload: { symbols: ['BTCUSDT'] } });

  // Directly emit via the provider (simulates exchange push)
  // We need to get the onEvent handler that was registered — use a second FixtureProvider trick
  // by injecting the event via the public emit path
  const emitProvider = provider as FixtureProvider & { _onEvent?: (e: MarketEvent) => void };
  // Call start again to capture the handler (it re-assigns internally)
  let capturedHandler: ((event: MarketEvent) => void | Promise<void>) | undefined;
  const origStart = provider.start.bind(provider);
  provider.start = async (onEvent) => {
    capturedHandler = onEvent;
    return origStart(onEvent);
  };

  // Use inject to trigger the onReady hook which calls provider.start
  // Since app is already ready, trigger via a fresh buildApp
  const persisted2: MarketEvent[] = [];
  const repo2: PersistenceRepository = {
    async persistTicker(event) { persisted2.push(event); },
    async persistCandle(event) { persisted2.push(event); },
  };
  const provider2 = new FixtureProvider();
  let captured2: ((e: MarketEvent) => void | Promise<void>) | undefined;
  const app2 = await buildApp({
    config: baseConfig,
    provider: {
      ...provider2,
      name: 'fixture',
      publicDataOnly: true as const,
      start: async (onEvent) => {
        captured2 = onEvent;
        await provider2.start(onEvent);
      },
      stop: provider2.stop.bind(provider2),
      subscribe: provider2.subscribe.bind(provider2),
      unsubscribe: provider2.unsubscribe.bind(provider2),
      status: provider2.status.bind(provider2),
    },
    persistenceRepo: repo2,
  });
  await app2.ready();

  assert.ok(captured2, 'onEvent handler must be captured by start()');
  await captured2!(tickerEvent());
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(persisted2.length, 1);
  assert.equal(persisted2[0]!.type, 'ticker');

  await app.close();
  await app2.close();
});

test('persistence metrics endpoint returns queue state', async () => {
  const repo: PersistenceRepository = {
    async persistTicker() {},
    async persistCandle() {},
  };

  const provider = new FixtureProvider();
  let captured: ((e: MarketEvent) => void | Promise<void>) | undefined;
  const app = await buildApp({
    config: baseConfig,
    provider: {
      name: 'fixture',
      publicDataOnly: true as const,
      start: async (onEvent) => {
        captured = onEvent;
        await provider.start(onEvent);
      },
      stop: provider.stop.bind(provider),
      subscribe: provider.subscribe.bind(provider),
      unsubscribe: provider.unsubscribe.bind(provider),
      status: provider.status.bind(provider),
    },
    persistenceRepo: repo,
  });
  await app.ready();

  assert.ok(captured);
  await captured!(tickerEvent());
  await new Promise((r) => setTimeout(r, 20));

  const response = await app.inject({ method: 'GET', url: '/persistence/metrics' });
  assert.equal(response.statusCode, 200);
  const body = response.json() as { submitted: number; completed: number };
  assert.equal(body.submitted, 1);
  assert.equal(body.completed, 1);

  await app.close();
});
