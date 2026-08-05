import assert from 'node:assert/strict';
import test from 'node:test';
import { BybitRestClient } from '../src/bybit-rest.js';

const config = {
  nodeEnv: 'test' as const,
  host: '127.0.0.1', port: 4100, corsOrigins: [], providerMode: 'bybit-rest' as const, staleAfterMs: 15000,
  bybitRestBaseUrl: 'https://api.bybit.test', bybitRestTimeoutMs: 1000, bybitRestMaxRetries: 0,
  bybitRestBackoffMs: 1, bybitRestMinIntervalMs: 50, bybitRestCacheTtlMs: 0,
};

function response(result: unknown, status = 200): Response {
  return new Response(JSON.stringify({ retCode: 0, retMsg: 'OK', result }), { status, headers: { 'content-type': 'application/json' } });
}

test('selects active USDT linear perpetuals by turnover and excludes stable bases', async () => {
  const fetchMock: typeof fetch = async (input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/instruments-info')) return response({ list: [
      { symbol: 'BTCUSDT', status: 'Trading', quoteCoin: 'USDT', baseCoin: 'BTC', contractType: 'LinearPerpetual' },
      { symbol: 'ETHUSDT', status: 'Trading', quoteCoin: 'USDT', baseCoin: 'ETH', contractType: 'LinearPerpetual' },
      { symbol: 'USDCUSDT', status: 'Trading', quoteCoin: 'USDT', baseCoin: 'USDC', contractType: 'LinearPerpetual' },
      { symbol: 'OLDUSDT', status: 'Settled', quoteCoin: 'USDT', baseCoin: 'OLD', contractType: 'LinearPerpetual' },
    ] });
    return response({ list: [
      { symbol: 'ETHUSDT', turnover24h: '200' }, { symbol: 'BTCUSDT', turnover24h: '500' },
      { symbol: 'USDCUSDT', turnover24h: '999' }, { symbol: 'OLDUSDT', turnover24h: '800' },
    ] });
  };
  const client = new BybitRestClient(config, fetchMock);
  assert.deepEqual(await client.topSymbols(20), [
    { symbol: 'BTCUSDT', turnover24h: 500 }, { symbol: 'ETHUSDT', turnover24h: 200 },
  ]);
});

test('normalizes ticker without credentials', async () => {
  let authorizationSeen = false;
  const fetchMock: typeof fetch = async (_input, init) => {
    authorizationSeen = new Headers(init?.headers).has('authorization');
    return response({ list: [{ symbol: 'BTCUSDT', bid1Price: '100', ask1Price: '101', lastPrice: '100.5' }] });
  };
  const ticker = await new BybitRestClient(config, fetchMock).ticker('btcusdt');
  assert.equal(ticker.symbol, 'BTCUSDT');
  assert.equal(ticker.last, 100.5);
  assert.equal(authorizationSeen, false);
});

test('classifies completed candle and sorts ascending', async () => {
  const old = Date.now() - 600_000;
  const fetchMock: typeof fetch = async () => response({ list: [
    [String(old + 300_000), '2', '4', '1', '3', '20'],
    [String(old), '1', '3', '0.5', '2', '10'],
  ] });
  const candles = await new BybitRestClient(config, fetchMock).candles('BTCUSDT', '5m', 2);
  assert.equal(candles.length, 2);
  assert.equal(candles[0].closed, true);
  assert.ok(Date.parse(candles[0].openTime) < Date.parse(candles[1].openTime));
});
