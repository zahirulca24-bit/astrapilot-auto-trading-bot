from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.db.manager import DatabaseManager, DatabaseStatus


def test_liveness_contract(client: TestClient) -> None:
    response = client.get("/health/live")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "AstraPilot API"
    assert payload["version"] == "0.2.0"


def test_readiness_is_ready_when_no_required_dependencies(client: TestClient) -> None:
    response = client.get("/health/ready", headers={"X-Request-ID": "test-request"})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "test-request"
    payload = response.json()
    assert payload["ready"] is True
    assert payload["status"] == "ok"
    assert payload["request_id"] == "test-request"
    assert payload["checks"]["database"]["state"] == "disabled"


def test_health_exposes_boundary_state_without_external_calls(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] == "offline_research"
    assert payload["dependencies"]["market_data_gateway"]["state"] == "disabled"
    assert payload["dependencies"]["paper_trading"]["state"] == "disabled"


def test_readiness_fails_closed_when_required_database_is_unconfigured(monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_REQUIRED", "true")

    from app.core.config import get_settings
    from app.main import create_app

    get_settings.cache_clear()
    with TestClient(create_app()) as test_client:
        response = test_client.get("/health/ready")

    assert response.status_code == 503
    payload = response.json()
    assert payload["ready"] is False
    assert payload["status"] == "unavailable"
    assert payload["checks"]["database"]["state"] == "not_configured"


def test_readiness_returns_200_when_db_manager_is_ready(monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_REQUIRED", "true")

    from app.core.config import get_settings
    from app.main import create_app

    get_settings.cache_clear()
    app = create_app()

    mock_manager = MagicMock(spec=DatabaseManager)
    mock_manager.status.return_value = DatabaseStatus(
        configured=True, required=True, ready=True, latency_ms=1.0, migration_version=2, reason=None
    )
    app.state.db_manager = mock_manager

    with TestClient(app) as test_client:
        response = test_client.get("/health/ready")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ready"] is True
    assert payload["checks"]["database"]["state"] == "ok"


def test_readiness_returns_503_when_db_manager_is_not_ready(monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_REQUIRED", "true")

    from app.core.config import get_settings
    from app.main import create_app

    get_settings.cache_clear()
    app = create_app()

    mock_manager = MagicMock(spec=DatabaseManager)
    mock_manager.status.return_value = DatabaseStatus(
        configured=True, required=True, ready=False, latency_ms=None, migration_version=0, reason="ConnectionError"
    )
    app.state.db_manager = mock_manager

    with TestClient(app) as test_client:
        response = test_client.get("/health/ready")

    assert response.status_code == 503
    payload = response.json()
    assert payload["ready"] is False
    assert payload["checks"]["database"]["state"] == "unavailable"
