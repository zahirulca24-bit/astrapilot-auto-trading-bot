from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Literal

from psycopg_pool import ConnectionPool


@dataclass(frozen=True)
class TickerRecord:
    exchange: str
    market_type: str
    symbol: str
    event_time: datetime
    last_price: Decimal
    bid_price: Decimal | None = None
    ask_price: Decimal | None = None
    volume_24h: Decimal | None = None
    turnover_24h: Decimal | None = None
    source: str = "public"


@dataclass(frozen=True)
class CandleRecord:
    exchange: str
    market_type: str
    symbol: str
    timeframe: str
    open_time: datetime
    close_time: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    turnover: Decimal | None = None
    is_closed: bool = True
    source: str = "public"


@dataclass(frozen=True)
class FeedHealthRecord:
    exchange: str
    market_type: str
    symbol: str | None
    event_type: str
    severity: Literal["info", "warning", "error", "critical"]
    observed_at: datetime
    details: dict[str, object]


class MarketDataRepository:
    def __init__(self, pool: ConnectionPool) -> None:
        self.pool = pool

    def _resolve_symbol_id(self, cursor: object, exchange: str, market_type: str, symbol: str) -> int:
        cursor.execute(
            """
            INSERT INTO symbols(exchange, market_type, symbol, is_active)
            VALUES (%s, %s, %s, true)
            ON CONFLICT (exchange, market_type, symbol)
            DO UPDATE SET is_active = true, updated_at = now()
            RETURNING id
            """,
            (exchange, market_type, symbol),
        )
        row = cursor.fetchone()
        if row is None:
            raise RuntimeError("symbol upsert returned no id")
        return int(row[0])

    def persist_ticker(self, record: TickerRecord) -> None:
        with self.pool.connection() as connection:
            with connection.cursor() as cursor:
                symbol_id = self._resolve_symbol_id(cursor, record.exchange, record.market_type, record.symbol)
                cursor.execute(
                    """
                    INSERT INTO ticker_snapshots(
                        symbol_id, event_time, last_price, bid_price, ask_price,
                        volume_24h, turnover_24h, source
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (symbol_id, event_time)
                    DO UPDATE SET
                        last_price = EXCLUDED.last_price,
                        bid_price = EXCLUDED.bid_price,
                        ask_price = EXCLUDED.ask_price,
                        volume_24h = EXCLUDED.volume_24h,
                        turnover_24h = EXCLUDED.turnover_24h,
                        source = EXCLUDED.source
                    """,
                    (
                        symbol_id,
                        record.event_time,
                        record.last_price,
                        record.bid_price,
                        record.ask_price,
                        record.volume_24h,
                        record.turnover_24h,
                        record.source,
                    ),
                )
            connection.commit()

    def persist_candle(self, record: CandleRecord) -> None:
        if not record.is_closed:
            raise ValueError("open candles must not be persisted")
        with self.pool.connection() as connection:
            with connection.cursor() as cursor:
                symbol_id = self._resolve_symbol_id(cursor, record.exchange, record.market_type, record.symbol)
                cursor.execute(
                    """
                    INSERT INTO ohlcv_candles(
                        symbol_id, timeframe, open_time, close_time, open, high, low,
                        close, volume, turnover, is_closed, source
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true, %s)
                    ON CONFLICT (symbol_id, timeframe, open_time)
                    DO UPDATE SET
                        close_time = EXCLUDED.close_time,
                        open = EXCLUDED.open,
                        high = EXCLUDED.high,
                        low = EXCLUDED.low,
                        close = EXCLUDED.close,
                        volume = EXCLUDED.volume,
                        turnover = EXCLUDED.turnover,
                        is_closed = true,
                        source = EXCLUDED.source
                    """,
                    (
                        symbol_id,
                        record.timeframe,
                        record.open_time,
                        record.close_time,
                        record.open,
                        record.high,
                        record.low,
                        record.close,
                        record.volume,
                        record.turnover,
                        record.source,
                    ),
                )
            connection.commit()

    def persist_feed_health(self, record: FeedHealthRecord) -> None:
        with self.pool.connection() as connection:
            with connection.cursor() as cursor:
                symbol_id = None
                if record.symbol is not None:
                    symbol_id = self._resolve_symbol_id(
                        cursor, record.exchange, record.market_type, record.symbol
                    )
                cursor.execute(
                    """
                    INSERT INTO feed_health_events(
                        symbol_id, exchange, market_type, event_type, severity,
                        observed_at, details
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        symbol_id,
                        record.exchange,
                        record.market_type,
                        record.event_type,
                        record.severity,
                        record.observed_at,
                        record.details,
                    ),
                )
            connection.commit()
