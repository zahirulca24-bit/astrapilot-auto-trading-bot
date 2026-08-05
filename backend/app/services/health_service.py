from datetime import UTC, datetime

from app.core.config import Settings
from app.db.manager import DatabaseManager
from app.schemas.health import DependencyHealth, HealthState


class HealthService:
    def __init__(self, settings: Settings, db_manager: DatabaseManager | None = None) -> None:
        self.settings = settings
        self._db_manager = db_manager

    @staticmethod
    def now() -> datetime:
        return datetime.now(UTC)

    def mode(self) -> str:
        return "offline_research" if self.settings.offline_research_mode else "unsupported"

    def dependency_checks(self) -> dict[str, DependencyHealth]:
        if self._db_manager is not None:
            db_status = self._db_manager.status()
            if not db_status.configured:
                db_state = HealthState.NOT_CONFIGURED if db_status.required else HealthState.DISABLED
                db_detail = "DATABASE_URL is not configured."
            elif db_status.ready:
                db_state = HealthState.OK
                db_detail = f"Database ready; migration version {db_status.migration_version}."
            else:
                db_state = HealthState.UNAVAILABLE
                db_detail = db_status.reason or "Database is not reachable."
            database_health = DependencyHealth(
                state=db_state,
                required=db_status.required,
                detail=db_detail,
            )
        else:
            database_health = DependencyHealth(
                state=HealthState.NOT_CONFIGURED if self.settings.database_required else HealthState.DISABLED,
                required=self.settings.database_required,
                detail=(
                    "Database contract is required but not configured."
                    if self.settings.database_required
                    else "Database integration is deferred; no connection attempted."
                ),
            )

        return {
            "database": database_health,
            "market_data_gateway": DependencyHealth(
                state=(HealthState.NOT_CONFIGURED if self.settings.market_data_gateway_enabled else HealthState.DISABLED),
                required=False,
                detail=(
                    "Gateway flag is enabled but no gateway client exists in Phase 1."
                    if self.settings.market_data_gateway_enabled
                    else "Public market-data gateway is deferred; no exchange call attempted."
                ),
            ),
            "paper_trading": DependencyHealth(
                state=HealthState.NOT_CONFIGURED if self.settings.paper_trading_enabled else HealthState.DISABLED,
                required=False,
                detail=(
                    "Paper-trading flag is enabled but engine is not implemented in Phase 1."
                    if self.settings.paper_trading_enabled
                    else "Paper-trading engine is deferred and cannot execute orders."
                ),
            ),
        }

    def readiness(self) -> tuple[bool, HealthState, dict[str, DependencyHealth]]:
        checks = self.dependency_checks()
        blocking = [check for check in checks.values() if check.required and check.state != HealthState.OK]
        ready = not blocking
        return ready, HealthState.OK if ready else HealthState.UNAVAILABLE, checks
