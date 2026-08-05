import assert from 'node:assert/strict';
import test from 'node:test';
import { CircuitBreaker, EventOrderGuard, recoveryLimit } from '../src/feed-reliability.js';
import type { MarketEvent } from '../src/contracts.js';

function ticker(sequence: number): MarketEvent {
  return {
    type: 'ticker', provider: 'bybit', symbol: 'BTCUSDT',
    eventTime: '2026-08-05T18:00:00.000Z', receivedTime: '2026-08-05T18:00:00.100Z',
    bid: 100, ask: 101, last: 100.5, sequence,
  };
}

function candle(openTime: string): MarketEvent {
  return {
    type: 'candle', provider: 'bybit', symbol: 'BTCUSDT', timeframe: '5m',
    openTime, closeTime: new Date(Date.parse(openTime) + 300_000).toISOString(),
    open: 100, high: 105, low: 99, close: 104, volume: 10, closed: true,
    receivedTime: '2026-08-05T18:10:00.000Z',
  };
}

test('event guard rejects duplicate and out-of-order ticker events', () => {
  const guard = new EventOrderGuard();
  assert.equal(guard.accept(ticker(10), 1_000), 'accepted');
  assert.equal(guard.accept(ticker(10), 2_000), 'duplicate');
  assert.equal(guard.accept(ticker(9), 3_000), 'out-of-order');
  assert.equal(guard.accept(ticker(11), 4_000), 'accepted');
});

test('event guard rejects older candles after a newer candle', () => {
  const guard = new EventOrderGuard();
  assert.equal(guard.accept(candle('2026-08-05T18:05:00.000Z'), 1_000), 'accepted');
  assert.equal(guard.accept(candle('2026-08-05T18:00:00.000Z'), 2_000), 'out-of-order');
});

test('circuit breaker opens and moves to half-open after cooldown', () => {
  const breaker = new CircuitBreaker(2, 1_000);
  breaker.recordFailure(0);
  assert.equal(breaker.state(100), 'closed');
  breaker.recordFailure(100);
  assert.equal(breaker.state(200), 'open');
  assert.equal(breaker.canAttempt(500), false);
  assert.equal(breaker.state(1_100), 'half-open');
  breaker.recordSuccess();
  assert.equal(breaker.state(1_200), 'closed');
});

test('recovery limit is bounded and includes overlap candle', () => {
  assert.equal(recoveryLimit('5m', '2026-08-05T18:00:00.000Z', Date.parse('2026-08-05T18:20:00.000Z')), 5);
  assert.equal(recoveryLimit('1m', '2020-01-01T00:00:00.000Z', Date.parse('2026-08-05T18:20:00.000Z')), 1000);
});
