from pathlib import Path


MIGRATION = Path(__file__).parents[1] / "migrations" / "002_market_data_schema.sql"


def test_market_data_schema_contains_required_tables() -> None:
    sql = MIGRATION.read_text(encoding="utf-8").lower()
    for table in (
        "symbols",
        "symbol_universe_history",
        "ticker_snapshots",
        "ohlcv_candles",
        "feed_health_events",
    ):
        assert f"create table if not exists {table}" in sql


def test_candle_identity_and_integrity_constraints_are_present() -> None:
    sql = MIGRATION.read_text(encoding="utf-8").lower()
    assert "unique (symbol_id, timeframe, open_time)" in sql
    assert "check (close_time > open_time)" in sql
    assert "check (volume >= 0)" in sql
    assert "check (high >= greatest(open, close, low))" in sql
    assert "check (low <= least(open, close, high))" in sql


def test_market_data_schema_has_query_indexes() -> None:
    sql = MIGRATION.read_text(encoding="utf-8").lower()
    for index in (
        "idx_universe_active_rank",
        "idx_ticker_symbol_time",
        "idx_candle_symbol_tf_time",
        "idx_candle_closed_time",
        "idx_feed_health_time",
        "idx_feed_health_provider_state",
    ):
        assert f"index if not exists {index}" in sql


def test_schema_preserves_approved_timeframes_and_top_twenty_boundary() -> None:
    sql = MIGRATION.read_text(encoding="utf-8").lower()
    assert "rank between 1 and 20" in sql
    for timeframe in ("1m", "3m", "5m", "15m", "30m", "1h", "4h", "1d"):
        assert f"'{timeframe}'" in sql
