from functools import lru_cache

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AstraPilot API"
    app_env: str = "development"
    app_version: str = "0.2.0"
    api_v1_prefix: str = "/api/v1"
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    offline_research_mode: bool = True
    paper_trading_enabled: bool = False
    market_data_gateway_enabled: bool = False
    market_data_ingest_enabled: bool = False
    database_required: bool = False
    database_url: SecretStr | None = None
    database_pool_min_size: int = Field(default=1, ge=1, le=10)
    database_pool_max_size: int = Field(default=5, ge=1, le=20)
    database_connect_timeout_seconds: int = Field(default=10, ge=1, le=60)
    persistence_queue_max_pending: int = Field(default=1000, ge=1, le=100000)
    persistence_queue_workers: int = Field(default=2, ge=1, le=16)
    persistence_queue_max_retries: int = Field(default=2, ge=0, le=10)
    persistence_queue_backoff_seconds: float = Field(default=0.1, ge=0, le=30)
    persistence_queue_max_backoff_seconds: float = Field(default=1.0, ge=0, le=120)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("api_v1_prefix")
    @classmethod
    def validate_api_prefix(cls, value: str) -> str:
        if not value.startswith("/"):
            raise ValueError("API_V1_PREFIX must start with '/'")
        return value.rstrip("/")

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: SecretStr | None) -> SecretStr | None:
        if value is None:
            return None
        url = value.get_secret_value()
        if not url.startswith(("postgresql://", "postgres://")):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")
        if "sslmode=require" not in url and "sslmode=verify-full" not in url:
            raise ValueError("DATABASE_URL must require SSL")
        return value

    @field_validator("database_pool_max_size")
    @classmethod
    def validate_pool_bounds(cls, value: int, info) -> int:
        minimum = info.data.get("database_pool_min_size", 1)
        if value < minimum:
            raise ValueError("DATABASE_POOL_MAX_SIZE must be >= DATABASE_POOL_MIN_SIZE")
        return value

    @field_validator("persistence_queue_max_backoff_seconds")
    @classmethod
    def validate_backoff_bounds(cls, value: float, info) -> float:
        minimum = info.data.get("persistence_queue_backoff_seconds", 0.1)
        if value < minimum:
            raise ValueError("PERSISTENCE_QUEUE_MAX_BACKOFF_SECONDS must be >= PERSISTENCE_QUEUE_BACKOFF_SECONDS")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
