import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.js';
import { candleSchema, tickerSchema } from '../src/contracts.js';
import { FixtureProvider } from '../src/provider.js';

const config = {
  nodeEnv: 'test' as const,
  host: '127.0.0.1',
  port: 4100,
  corsOrigins: ['http://localhost:5173'],
  providerMode: 'fixture' as const,
  staleAfterMs: 15000,
};

test('ticker contract accepts normalized public data', () => {
  const result = tickerSchema.parse({
    type: 'ticker', provider: 'fixture', symbol: 'BTCUSDT',
    eventTime: '2026-08-05T08:00:00.000Z', receivedTime: '2026-08-05T08:00:00.100Z',
    bid: 100, ask: 101, last: 100.5, sequence: 1,
  });
  assert.equal(result.symbol, 'BTCUSDT');
});

test('candle contract preserves closed-candle state', () => {
  const result = candleSchema.parse({
    type: 'candle', provider: 'fixture', symbol: 'ETHUSDT', timeframe: '5m',
    openTime: '2026-08-05T08:00:00.000Z', closeTime: '2026-08-05T08:05:00.000Z',
    open: 100, high: 105, low: 99, close: 104, volume: 25, closed: true,
    receivedTime: '2026-08-05T08:05:00.100Z',
  });
  assert.equal(result.closed, true);
});

test('disabled gateway is live but not ready', async () => {
  const app = await buildApp({ config: { ...config, providerMode: 'disabled' } });
  await app.ready();
  assert.equal((await app.inject({ method: 'GET', url: '/health/live' })).statusCode, 200);
  assert.equal((await app.inject({ method: 'GET', url: '/health/ready' })).statusCode, 503);
  await app.close();
});

test('fixture provider supports controlled subscriptions without exchange credentials', async () => {
  const app = await buildApp({ config, provider: new FixtureProvider() });
  await app.ready();
  const response = await app.inject({ method: 'POST', url: '/subscriptions', payload: { symbols: ['BTCUSDT', 'ETHUSDT'] } });
  assert.equal(response.statusCode, 202);
  const body = response.json();
  assert.deepEqual(body.status.symbols, ['BTCUSDT', 'ETHUSDT']);
  assert.equal(body.status.exchangeCredentialsAccepted, false);
  await app.close();
});

test('invalid symbols are rejected', async () => {
  const app = await buildApp({ config, provider: new FixtureProvider() });
  await app.ready();
  const response = await app.inject({ method: 'POST', url: '/subscriptions', payload: { symbols: ['btc/usdt'] } });
  assert.equal(response.statusCode, 422);
  await app.close();
});
