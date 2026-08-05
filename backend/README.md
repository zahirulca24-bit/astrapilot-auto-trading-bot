# AstraPilot Backend — Phase 1

FastAPI foundation and deterministic health contract for AstraPilot.

## Implemented

- Application factory and validated environment configuration
- Request ID middleware
- Explicit CORS allowlist
- `GET /health/live`
- `GET /health/ready`
- `GET /health`
- Fail-closed readiness for required-but-unconfigured dependencies
- Automated tests for health contracts and safety boundary

## Not Implemented

- Exchange credentials or private endpoints
- Public market-data gateway
- Database connection
- Paper-trading engine
- Scanner, strategy, portfolio, ledger, or risk engines

## Run

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Test

```bash
pytest
ruff check .
```

The Phase 1 test suite currently contains four passing contract tests.
