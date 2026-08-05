from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class HealthState(StrEnum):
    OK = "ok"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"
    DISABLED = "disabled"
    NOT_CONFIGURED = "not_configured"


class DependencyHealth(BaseModel):
    model_config = ConfigDict(frozen=True)
    state: HealthState
    required: bool
    detail: str


class LivenessResponse(BaseModel):
    model_config = ConfigDict(frozen=True)
    status: HealthState
    service: str
    version: str
    timestamp: datetime


class ReadinessResponse(BaseModel):
    model_config = ConfigDict(frozen=True)
    status: HealthState
    ready: bool
    service: str
    timestamp: datetime
    request_id: str
    checks: dict[str, DependencyHealth]


class HealthResponse(BaseModel):
    model_config = ConfigDict(frozen=True)
    service: str
    status: HealthState
    timestamp: datetime
    version: str
    environment: str
    mode: str
    request_id: str
    dependencies: dict[str, DependencyHealth]
