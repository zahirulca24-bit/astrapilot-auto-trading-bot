from __future__ import annotations

from datetime import UTC, datetime, timedelta
from decimal import Decimal
from threading import Event

import pytest

from app.db.persistence import CandleRecord, MarketDataRepository
from app.db.write_queue import PersistenceWriteQueue


def test_symbol_asset_parsing_is_canonical() -> None:
    assert MarketDataRepository._assets("btcusdt") == ("BTC", "USDT")
    with pytest.raises(ValueError):
        MarketDataRepository._assets("BTCUSD")


def test_open_candle_is_rejected_before_database_access() -> None:
    repository = MarketDataRepository(pool=None)  # type: ignore[arg-type]
    opened = datetime(2026, 8, 6, tzinfo=UTC)
    record = CandleRecord(
        symbol="BTCUSDT",
        timeframe="1m",
        open_time=opened,
        close_time=opened + timedelta(minutes=1),
        received_time=opened + timedelta(minutes=1),
        open=Decimal("100"),
        high=Decimal("101"),
        low=Decimal("99"),
        close=Decimal("100.5"),
        volume=Decimal("10"),
        closed=False,
    )
    with pytest.raises(ValueError, match="open candles"):
        repository.persist_candle(record)


def test_queue_rejects_when_capacity_is_exhausted() -> None:
    gate = Event()
    queue = PersistenceWriteQueue(max_pending=1, workers=1)
    assert queue.submit(lambda: gate.wait(timeout=1)) is True
    assert queue.submit(lambda: None) is False
    gate.set()
    metrics = queue.close(wait=True)
    assert metrics.submitted == 1
    assert metrics.completed == 1
    assert metrics.rejected == 1
    assert metrics.failed == 0


def test_queue_isolates_failed_write() -> None:
    queue = PersistenceWriteQueue(max_pending=2, workers=1, max_attempts=1)

    def fail() -> None:
        raise RuntimeError("database unavailable")

    assert queue.submit(fail) is True
    metrics = queue.close(wait=True)
    assert metrics.failed == 1
    assert metrics.in_flight == 0


def test_queue_retries_transient_failure_and_succeeds() -> None:
    """Operation that fails once then succeeds should complete, not fail."""
    attempts: list[int] = []

    def flaky() -> None:
        attempts.append(1)
        if len(attempts) < 2:
            raise RuntimeError("transient error")

    queue = PersistenceWriteQueue(max_pending=2, workers=1, max_attempts=3, retry_base_delay=0.0)
    assert queue.submit(flaky) is True
    metrics = queue.close(wait=True)
    assert metrics.completed == 1
    assert metrics.failed == 0
    assert len(attempts) == 2


def test_queue_retry_is_bounded_and_eventually_fails() -> None:
    """Operation that always fails is retried max_attempts times then counted as failed."""
    attempts: list[int] = []

    def always_fail() -> None:
        attempts.append(1)
        raise RuntimeError("persistent error")

    queue = PersistenceWriteQueue(max_pending=2, workers=1, max_attempts=3, retry_base_delay=0.0)
    assert queue.submit(always_fail) is True
    metrics = queue.close(wait=True)
    assert metrics.failed == 1
    assert metrics.completed == 0
    assert len(attempts) == 3  # bounded to max_attempts


def test_queue_success_after_multiple_retries_is_counted_completed() -> None:
    """Queue metrics reflect completed for an operation that needed retries."""
    gate = Event()
    attempts: list[int] = []

    def flaky_then_ok() -> None:
        attempts.append(1)
        if len(attempts) < 3:
            raise RuntimeError("transient")
        gate.set()

    queue = PersistenceWriteQueue(max_pending=2, workers=1, max_attempts=5, retry_base_delay=0.0)
    assert queue.submit(flaky_then_ok) is True
    gate.wait(timeout=5)
    metrics = queue.close(wait=True)
    assert metrics.completed == 1
    assert metrics.failed == 0
