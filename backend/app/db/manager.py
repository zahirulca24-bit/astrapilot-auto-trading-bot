from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from time import perf_counter

from psycopg import sql
from psycopg_pool import ConnectionPool

from app.core.config import Settings


@dataclass(frozen=True)
class DatabaseStatus:
    configured: bool
    required: bool
    ready: bool
    latency_ms: float | None
    migration_version: int
    reason: str | None

    def model_dump(self) -> dict[str, object]:
        return asdict(self)


class DatabaseManager:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.pool: ConnectionPool | None = None

    def open(self) -> None:
        if self.settings.database_url is None:
            return
        self.pool = ConnectionPool(
            conninfo=self.settings.database_url.get_secret_value(),
            min_size=self.settings.database_pool_min_size,
            max_size=self.settings.database_pool_max_size,
            timeout=self.settings.database_connect_timeout_seconds,
            open=False,
            kwargs={"autocommit": False},
        )
        self.pool.open(wait=True)

    def close(self) -> None:
        if self.pool is not None:
            self.pool.close()
            self.pool = None

    def status(self) -> DatabaseStatus:
        if self.settings.database_url is None:
            return DatabaseStatus(False, self.settings.database_required, not self.settings.database_required, None, 0, "DATABASE_URL is not configured")
        if self.pool is None:
            return DatabaseStatus(True, self.settings.database_required, False, None, 0, "Database pool is not open")
        started = perf_counter()
        try:
            with self.pool.connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    cursor.execute("SELECT COALESCE(MAX(version), 0) FROM schema_migrations")
                    version = int(cursor.fetchone()[0])
            return DatabaseStatus(True, self.settings.database_required, True, round((perf_counter() - started) * 1000, 2), version, None)
        except Exception as exc:  # health boundary must not leak credentials
            return DatabaseStatus(True, self.settings.database_required, False, None, 0, type(exc).__name__)

    def migrate(self, migrations_dir: Path) -> int:
        if self.pool is None:
            raise RuntimeError("Database pool is not open")
        files = sorted(migrations_dir.glob("*.sql"))
        with self.pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, name text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())")
                cursor.execute("SELECT version FROM schema_migrations")
                applied = {int(row[0]) for row in cursor.fetchall()}
                for path in files:
                    version_text, _, name = path.stem.partition("_")
                    version = int(version_text)
                    if version in applied:
                        continue
                    cursor.execute(sql.SQL(path.read_text(encoding="utf-8")))
                    cursor.execute("INSERT INTO schema_migrations(version, name) VALUES (%s, %s)", (version, name))
            connection.commit()
        return len(files)
