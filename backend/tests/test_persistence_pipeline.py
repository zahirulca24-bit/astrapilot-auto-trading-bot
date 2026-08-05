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


def test_queue_retries_transient_failure_then_completes() -> None:
    queue = PersistenceWriteQueue(max_pending=1, workers=1, max_retries=2, backoff_seconds=0)
    attempts = 0

    def transient() -> None:
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            raise RuntimeError("temporary database outage")

    assert queue.submit(transient) is True
    metrics = queue.close(wait=True)
    assert attempts == 3
    assert metrics.retried == 2
    assert metrics.completed == 1
    assert metrics.failed == 0


def test_queue_isolates_failed_write_after_retry_budget() -> None:
    queue = PersistenceWriteQueue(max_pending=2, workers=1, max_retries=1, backoff_seconds=0)

    def fail() -> None:
        raise RuntimeError("database unavailable")

    assert queue.submit(fail) is True
    metrics = queue.close(wait=True)
    assert metrics.retried == 1
    assert metrics.failed == 1
    assert metrics.in_flight == 0
