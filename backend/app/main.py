from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.market_data_ingest import router as market_data_ingest_router
from app.api.routes.research import router as research_router
from app.core.config import get_settings
from app.core.middleware import RequestIdMiddleware
from app.db.manager import DatabaseManager
from app.db.persistence import MarketDataRepository
from app.db.write_queue import PersistenceWriteQueue


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    database_manager = DatabaseManager(settings)
    app.state.settings = settings
    app.state.database_manager = database_manager
    app.state.database_startup_error = None
    app.state.market_data_repository = None
    app.state.persistence_write_queue = None

    if settings.database_url is not None:
        try:
            database_manager.open()
            if database_manager.pool is not None:
                app.state.market_data_repository = MarketDataRepository(database_manager.pool)
                app.state.persistence_write_queue = PersistenceWriteQueue(
                    max_pending=settings.persistence_queue_max_pending,
                    workers=settings.persistence_queue_workers,
                    max_retries=settings.persistence_queue_max_retries,
                    backoff_seconds=settings.persistence_queue_backoff_seconds,
                    max_backoff_seconds=settings.persistence_queue_max_backoff_seconds,
                )
        except Exception as exc:  # startup boundary must not leak credentials
            app.state.database_startup_error = type(exc).__name__

    try:
        yield
    finally:
        queue = app.state.persistence_write_queue
        if queue is not None:
            queue.close(wait=True)
        database_manager.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="AstraPilot offline research and local paper-simulation API foundation.",
        docs_url="/docs" if settings.app_env != "production" else None,
        redoc_url=None,
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "X-Request-ID"],
    )
    app.include_router(health_router)
    app.include_router(market_data_ingest_router)
    app.include_router(research_router)
    return app


app = create_app()
