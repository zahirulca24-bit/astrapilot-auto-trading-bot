from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Literal

from psycopg_pool import ConnectionPool


@dataclass(frozen=True)
class TickerRecord:
    symbol: str
    event_time: datetime
    received_time: datetime
    bid: Decimal
    ask: Decimal
    last: Decimal
    sequence: int | None = None
    source: str = "websocket"
    exchange: str = "bybit"
    market_type: str = "linear-usdt-perpetual"


@dataclass(frozen=True)
class CandleRecord:
    symbol: str
    timeframe: str
    open_time: datetime
    close_time: datetime
    received_time: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    closed: bool = True
    source: str = "websocket"
    exchange: str = "bybit"
    market_type: str = "linear-usdt-perpetual"


@dataclass(frozen=True)
class FeedHealthRecord:
    provider: str
    state: Literal["starting", "connected", "degraded", "stale", "stopped"]
    event_type: str
    occurred_at: datetime
    details: dict[str, object]
    symbol: str | None = None


class MarketDataRepository:
    def __init__(self, pool: ConnectionPool) -> None:
        self.pool = pool

    @staticmethod
    def _assets(symbol: str) -> tuple[str, str]:
        normalized = symbol.upper()
        if not normalized.endswith("USDT") or len(normalized) <= 4:
            raise ValueError("only canonical USDT symbols are supported")
        return normalized[:-4], "USDT"

    def _resolve_symbol_id(self, cursor: object, symbol: str, exchange: str, market_type: str) -> int:
        base_asset, quote_asset = self._assets(symbol)
        cursor.execute(
            """
            INSERT INTO symbols(symbol, exchange, market_type, base_asset, quote_asset, status)
            VALUES (%s, %s, %s, %s, %s, 'active')
            ON CONFLICT (symbol) DO UPDATE SET
                exchange = EXCLUDED.exchange,
                market_type = EXCLUDED.market_type,
                base_asset = EXCLUDED.base_asset,
                quote_asset = EXCLUDED.quote_asset,
                status = 'active',
                updated_at = now()
            RETURNING id
            """,
            (symbol.upper(), exchange, market_type, base_asset, quote_asset),
        )
        row = cursor.fetchone()
        if row is None:
            raise RuntimeError("symbol upsert returned no id")
        return int(row[0])

    def persist_ticker(self, record: TickerRecord) -> None:
        with self.pool.connection() as connection:
            with connection.cursor() as cursor:
                symbol_id = self._resolve_symbol_id(cursor, record.symbol, record.exchange, record.market_type)
                cursor.execute(
                    """
                    INSERT INTO ticker_snapshots(
                        symbol_id, event_time, received_time, bid, ask, last, sequence, source
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (symbol_id, event_time, source) DO UPDATE SET
                        received_time = EXCLUDED.received_time,
                        bid = EXCLUDED.bid,
                        ask = EXCLUDED.ask,
                        last = EXCLUDED.last,
                        sequence = EXCLUDED.sequence
                    """,
                    (symbol_id, record.event_time, record.received_time, record.bid, record.ask,
                     record.last, record.sequence, record.source),
                )
            connection.commit()

    def persist_candle(self, record: CandleRecord) -> None:
        if not record.closed:
            raise ValueError("open candles must not be persisted")
        with self.pool.connection() as connection:
            with connection.cursor() as cursor:
                symbol_id = self._resolve_symbol_id(cursor, record.symbol, record.exchange, record.market_type)
                cursor.execute(
                    """
                    INSERT INTO ohlcv_candles(
                        symbol_id, timeframe, open_time, close_time, open, high, low,
                        close, volume, closed, source, received_time
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, true, %s, %s)
                    ON CONFLICT (symbol_id, timeframe, open_time) DO UPDATE SET
                        close_time = EXCLUDED.close_time,
                        open = EXCLUDED.open,
                        high = EXCLUDED.high,
                        low = EXCLUDED.low,
                        close = EXCLUDED.close,
                        volume = EXCLUDED.volume,
                        closed = true,
                        source = EXCLUDED.source,
                        received_time = EXCLUDED.received_time,
                        updated_at = now()
                    """,
                    (symbol_id, record.timeframe, record.open_time, record.close_time, record.open,
                     record.high, record.low, record.close, record.volume, record.source,
                     record.received_time),
                )
            connection.commit()

    def persist_feed_health(self, record: FeedHealthRecord) -> None:
        with self.pool.connection() as connection:
            with connection.cursor() as cursor:
                symbol_id = None
                if record.symbol is not None:
                    symbol_id = self._resolve_symbol_id(
                        cursor, record.symbol, "bybit", "linear-usdt-perpetual"
                    )
                cursor.execute(
                    """
                    INSERT INTO feed_health_events(
                        provider, state, event_type, symbol_id, details, occurred_at
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (record.provider, record.state, record.event_type, symbol_id,
                     record.details, record.occurred_at),
                )
            connection.commit()
