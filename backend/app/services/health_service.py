from datetime import UTC, datetime

from app.core.config import Settings
from app.schemas.health import DependencyHealth, HealthState


class HealthService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @staticmethod
    def now() -> datetime:
        return datetime.now(UTC)

    def mode(self) -> str:
        return "offline_research" if self.settings.offline_research_mode else "unsupported"

    def dependency_checks(self) -> dict[str, DependencyHealth]:
        return {
            "database": DependencyHealth(
                state=HealthState.NOT_CONFIGURED if self.settings.database_required else HealthState.DISABLED,
                required=self.settings.database_required,
                detail=(
                    "Database contract is required but not configured in Phase 1."
                    if self.settings.database_required
                    else "Database integration is deferred; no connection attempted."
                ),
            ),
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
