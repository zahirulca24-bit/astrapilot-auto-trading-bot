from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from app.db.manager import DatabaseManager

router = APIRouter(prefix="/api", tags=["research"])


def _pool(request: Request):
    manager = getattr(request.app.state, "database_manager", None)
    if not isinstance(manager, DatabaseManager) or manager.pool is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable",
        )
    return manager.pool


@router.get("/datasets")
def list_datasets(request: Request) -> dict[str, object]:
    pool = _pool(request)
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, source, timeframe, row_count, symbol_count,
                       fingerprint, status, first_timestamp, last_timestamp,
                       created_at, updated_at
                FROM dataset_registry
                ORDER BY updated_at DESC
                LIMIT 200
                """
            )
            rows = cursor.fetchall()
    datasets = [
        {
            "id": row[0],
            "name": row[1],
            "source": row[2],
            "timeframe": row[3],
            "rowCount": row[4],
            "symbolCount": row[5],
            "fingerprint": row[6],
            "status": row[7],
            "firstTimestamp": row[8],
            "lastTimestamp": row[9],
            "createdAt": row[10],
            "updatedAt": row[11],
        }
        for row in rows
    ]
    return {"datasets": datasets, "count": len(datasets)}


@router.get("/dashboard/summary")
def dashboard_summary(request: Request) -> dict[str, object]:
    pool = _pool(request)
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    (SELECT count(*) FROM dataset_registry WHERE status = 'approved') AS approved_datasets,
                    (SELECT coalesce(sum(row_count), 0) FROM dataset_registry WHERE status = 'approved') AS validated_rows,
                    (SELECT count(*) FROM symbols WHERE status = 'active') AS active_symbols,
                    (SELECT max(event_time) FROM ticker_snapshots) AS last_ticker_at,
                    (SELECT max(close_time) FROM ohlcv_candles WHERE closed = true) AS last_closed_candle_at
                """
            )
            row = cursor.fetchone()
    if row is None:
        raise HTTPException(status_code=500, detail="Dashboard aggregate query returned no row")
    return {
        "datasets": {"approved": row[0], "validatedRows": row[1]},
        "marketData": {
            "activeSymbols": row[2],
            "lastTickerAt": row[3],
            "lastClosedCandleAt": row[4],
        },
        "simulation": {
            "equity": None,
            "drawdown": None,
            "openPositions": None,
            "recentSignals": [],
            "available": False,
            "reason": "Simulation and signal aggregate endpoints are not implemented yet.",
        },
    }
