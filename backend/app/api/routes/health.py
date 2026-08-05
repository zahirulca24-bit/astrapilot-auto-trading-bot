from fastapi import APIRouter, Depends, Request, Response, status

from app.core.config import Settings, get_settings
from app.schemas.health import HealthResponse, HealthState, LivenessResponse, ReadinessResponse
from app.services.health_service import HealthService

router = APIRouter(tags=["health"])


@router.get("/health/live", response_model=LivenessResponse)
def liveness(settings: Settings = Depends(get_settings)) -> LivenessResponse:
    service = HealthService(settings)
    return LivenessResponse(status=HealthState.OK, service=settings.app_name, version=settings.app_version, timestamp=service.now())


@router.get("/health/ready", response_model=ReadinessResponse)
def readiness(request: Request, response: Response, settings: Settings = Depends(get_settings)) -> ReadinessResponse:
    service = HealthService(settings)
    ready, health_status, checks = service.readiness()
    if not ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return ReadinessResponse(status=health_status, ready=ready, service=settings.app_name, timestamp=service.now(), request_id=request.state.request_id, checks=checks)


@router.get("/health", response_model=HealthResponse)
def health(request: Request, settings: Settings = Depends(get_settings)) -> HealthResponse:
    service = HealthService(settings)
    ready, health_status, checks = service.readiness()
    return HealthResponse(service=settings.app_name, status=health_status if ready else HealthState.DEGRADED, timestamp=service.now(), version=settings.app_version, environment=settings.app_env, mode=service.mode(), request_id=request.state.request_id, dependencies=checks)
