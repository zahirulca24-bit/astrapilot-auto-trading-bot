from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class TickerIngest(BaseModel):
    type: Literal["ticker"]
    provider: Literal["bybit"] = "bybit"
    symbol: str = Field(pattern=r"^[A-Z0-9]{2,20}$")
    eventTime: datetime
    receivedTime: datetime
    bid: Decimal = Field(gt=0)
    ask: Decimal = Field(gt=0)
    last: Decimal = Field(gt=0)
    sequence: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_spread(self) -> "TickerIngest":
        if self.ask < self.bid:
            raise ValueError("ask must be greater than or equal to bid")
        return self


class CandleIngest(BaseModel):
    type: Literal["candle"]
    provider: Literal["bybit"] = "bybit"
    symbol: str = Field(pattern=r"^[A-Z0-9]{2,20}$")
    timeframe: Literal["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1d"]
    openTime: datetime
    closeTime: datetime
    open: Decimal = Field(gt=0)
    high: Decimal = Field(gt=0)
    low: Decimal = Field(gt=0)
    close: Decimal = Field(gt=0)
    volume: Decimal = Field(ge=0)
    closed: bool
    receivedTime: datetime

    @model_validator(mode="after")
    def validate_candle(self) -> "CandleIngest":
        if not self.closed:
            raise ValueError("open candles are not accepted for persistence")
        if self.closeTime <= self.openTime:
            raise ValueError("closeTime must be after openTime")
        if self.high < max(self.open, self.close, self.low):
            raise ValueError("high is inconsistent with OHLC values")
        if self.low > min(self.open, self.close, self.high):
            raise ValueError("low is inconsistent with OHLC values")
        return self


class IngestAccepted(BaseModel):
    accepted: bool
    queued: bool
    event_type: Literal["ticker", "candle"]
