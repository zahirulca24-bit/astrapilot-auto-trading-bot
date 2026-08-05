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
    database_manager = DatabaseManager(settings)
    app.state.database_manager = database_manager
    app.state.database_startup_error = None

    if settings.database_url is not None:
        try:
            database_manager.open()
        except Exception as exc:  # startup boundary must not leak credentials
            app.state.database_startup_error = type(exc).__name__

    try:
        yield
    finally:
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
