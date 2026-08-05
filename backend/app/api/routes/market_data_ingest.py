from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from app.db.persistence import CandleRecord, MarketDataRepository, TickerRecord
from app.db.write_queue import PersistenceWriteQueue
from app.schemas.market_data import CandleIngest, IngestAccepted, TickerIngest

router = APIRouter(prefix="/internal/market-data", tags=["internal-market-data"])


def _dependencies(request: Request) -> tuple[MarketDataRepository, PersistenceWriteQueue]:
    settings = request.app.state.settings
    if not settings.market_data_ingest_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    repository = getattr(request.app.state, "market_data_repository", None)
    queue = getattr(request.app.state, "persistence_write_queue", None)
    if repository is None or queue is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Persistence pipeline is unavailable",
        )
    return repository, queue


@router.post("/ticker", response_model=IngestAccepted, status_code=status.HTTP_202_ACCEPTED)
def ingest_ticker(payload: TickerIngest, request: Request) -> IngestAccepted:
    repository, queue = _dependencies(request)
    record = TickerRecord(
        symbol=payload.symbol,
        event_time=payload.eventTime,
        received_time=payload.receivedTime,
        bid=payload.bid,
        ask=payload.ask,
        last=payload.last,
        sequence=payload.sequence,
        source="gateway",
    )
    queued = queue.submit(lambda: repository.persist_ticker(record))
    if not queued:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Persistence queue is full or closed")
    return IngestAccepted(accepted=True, queued=True, event_type="ticker")


@router.post("/candle", response_model=IngestAccepted, status_code=status.HTTP_202_ACCEPTED)
def ingest_candle(payload: CandleIngest, request: Request) -> IngestAccepted:
    repository, queue = _dependencies(request)
    record = CandleRecord(
        symbol=payload.symbol,
        timeframe=payload.timeframe,
        open_time=payload.openTime,
        close_time=payload.closeTime,
        received_time=payload.receivedTime,
        open=payload.open,
        high=payload.high,
        low=payload.low,
        close=payload.close,
        volume=payload.volume,
        closed=payload.closed,
        source="gateway",
    )
    queued = queue.submit(lambda: repository.persist_candle(record))
    if not queued:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Persistence queue is full or closed")
    return IngestAccepted(accepted=True, queued=True, event_type="candle")


@router.get("/metrics")
def persistence_metrics(request: Request) -> dict[str, object]:
    _, queue = _dependencies(request)
    return {"queue": queue.metrics().__dict__}
