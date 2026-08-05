import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeBybitWebSocketMessage } from '../src/bybit-websocket.js';

test('normalizes Bybit ticker snapshot', () => {
  const event = normalizeBybitWebSocketMessage({
    topic: 'tickers.BTCUSDT', type: 'snapshot', ts: 1_720_000_000_000, cs: 42,
    data: { symbol: 'BTCUSDT', bid1Price: '60000.1', ask1Price: '60000.2', lastPrice: '60000.15' },
  }, new Map(), 1_720_000_000_100);
  assert.equal(event?.type, 'ticker');
  if (event?.type !== 'ticker') return;
  assert.equal(event.symbol, 'BTCUSDT');
  assert.equal(event.bid, 60000.1);
  assert.equal(event.sequence, 42);
});

test('merges Bybit ticker delta with prior state', () => {
  const state = new Map<string, { bid?: number; ask?: number; last?: number }>();
  normalizeBybitWebSocketMessage({ topic:'tickers.ETHUSDT', ts:1, data:{ symbol:'ETHUSDT', bid1Price:'3000', ask1Price:'3001', lastPrice:'3000.5' } }, state, 10);
  const event = normalizeBybitWebSocketMessage({ topic:'tickers.ETHUSDT', ts:2, data:{ symbol:'ETHUSDT', lastPrice:'3002' } }, state, 20);
  assert.equal(event?.type, 'ticker');
  if (event?.type !== 'ticker') return;
  assert.equal(event.bid, 3000);
  assert.equal(event.ask, 3001);
  assert.equal(event.last, 3002);
});

test('normalizes closed Bybit candle', () => {
  const event = normalizeBybitWebSocketMessage({
    topic:'kline.15.BTCUSDT', ts:1_720_000_900_000,
    data:[{ start:1_720_000_000_000, end:1_720_000_899_999, interval:'15', open:'60000', high:'60100', low:'59900', close:'60050', volume:'12.5', confirm:true }],
  }, new Map(), 1_720_000_900_100);
  assert.equal(event?.type, 'candle');
  if (event?.type !== 'candle') return;
  assert.equal(event.timeframe, '15m');
  assert.equal(event.closed, true);
  assert.equal(event.closeTime, '2024-07-03T09:35:00.000Z');
});

test('ignores unsupported messages', () => {
  assert.equal(normalizeBybitWebSocketMessage({ op:'pong' }), null);
  assert.equal(normalizeBybitWebSocketMessage({ topic:'publicTrade.BTCUSDT', data:[] }), null);
});
