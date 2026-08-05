from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.core.config import get_settings
from app.core.middleware import RequestIdMiddleware
from app.db.manager import DatabaseManager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    # Allow tests to pre-inject a mock db_manager before lifespan starts
    existing = getattr(app.state, "db_manager", None)
    if existing is None:
        db_manager = DatabaseManager(settings)
        db_manager.open()
        app.state.db_manager = db_manager
    else:
        db_manager = None
    try:
        yield
    finally:
        if db_manager is not None:
            db_manager.close()
            app.state.db_manager = None


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
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "OPTIONS"],
        allow_headers=["Content-Type", "X-Request-ID"],
    )
    app.include_router(health_router)
    return app


app = create_app()
