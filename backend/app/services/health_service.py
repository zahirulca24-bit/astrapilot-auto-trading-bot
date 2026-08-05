from datetime import UTC, datetime

from app.core.config import Settings
from app.db.manager import DatabaseManager
from app.schemas.health import DependencyHealth, HealthState


class HealthService:
    def __init__(
        self,
        settings: Settings,
        database_manager: DatabaseManager | None = None,
        database_startup_error: str | None = None,
    ) -> None:
        self.settings = settings
        self.database_manager = database_manager
        self.database_startup_error = database_startup_error

    @staticmethod
    def now() -> datetime:
        return datetime.now(UTC)

    def mode(self) -> str:
        return "offline_research" if self.settings.offline_research_mode else "unsupported"

    def _database_check(self) -> DependencyHealth:
        if self.database_startup_error is not None:
            return DependencyHealth(
                state=HealthState.UNAVAILABLE,
                required=self.settings.database_required,
                detail=f"Database startup failed: {self.database_startup_error}",
            )

        if self.database_manager is None:
            return DependencyHealth(
                state=(
                    HealthState.NOT_CONFIGURED
                    if self.settings.database_required
                    else HealthState.DISABLED
                ),
                required=self.settings.database_required,
                detail=(
                    "Database manager is unavailable."
                    if self.settings.database_required
                    else "Database is optional and not configured."
                ),
            )

        database_status = self.database_manager.status()
        if database_status.ready:
            detail = "Database ready"
            if database_status.latency_ms is not None:
                detail += f" ({database_status.latency_ms} ms)"
            detail += f"; schema_version={database_status.migration_version}"
            return DependencyHealth(
                state=HealthState.OK,
                required=database_status.required,
                detail=detail,
            )

        state = (
            HealthState.NOT_CONFIGURED
            if not database_status.configured
            else HealthState.UNAVAILABLE
        )
        return DependencyHealth(
            state=state,
            required=database_status.required,
            detail=database_status.reason or "Database is not ready.",
        )

    def dependency_checks(self) -> dict[str, DependencyHealth]:
        return {
            "database": self._database_check(),
            "market_data_gateway": DependencyHealth(
                state=(
                    HealthState.NOT_CONFIGURED
                    if self.settings.market_data_gateway_enabled
                    else HealthState.DISABLED
                ),
                required=False,
                detail=(
                    "Gateway flag is enabled but gateway integration is not attached to this API process."
                    if self.settings.market_data_gateway_enabled
                    else "Public market-data gateway is disabled."
                ),
            ),
            "paper_trading": DependencyHealth(
                state=(
                    HealthState.NOT_CONFIGURED
                    if self.settings.paper_trading_enabled
                    else HealthState.DISABLED
                ),
                required=False,
                detail=(
                    "Paper-trading flag is enabled but engine is not implemented."
                    if self.settings.paper_trading_enabled
                    else "Paper-trading engine is disabled and cannot execute orders."
                ),
            ),
        }

    def readiness(self) -> tuple[bool, HealthState, dict[str, DependencyHealth]]:
        checks = self.dependency_checks()
        blocking = [
            check
            for check in checks.values()
            if check.required and check.state != HealthState.OK
        ]
        ready = not blocking
        return ready, HealthState.OK if ready else HealthState.UNAVAILABLE, checks
