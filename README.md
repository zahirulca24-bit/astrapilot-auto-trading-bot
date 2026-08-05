# AstraPilot

**Automated Crypto Trading with Risk-First Execution**

AstraPilot is a greenfield crypto trading research and local paper-trading platform. The project is being built phase by phase with strict architecture, safety, testing, and approval controls.

## Current project status

**Last updated:** 06 August 2026, 21:18 UTC (Issue #10 checkpoint audit)

| Area | Status |
| --- | --- |
| Frontend Foundation | Complete |
| Backend Phase 1 — Foundation + Health Contract | Merged |
| Backend Phase 2 — Public Market Data Gateway Contract | Merged |
| Backend Phase 3 — Real Public Market Data Adapter | Complete and merged |
| Phase 4.1 — Neon PostgreSQL Database Foundation | Complete (migration applied) |
| Phase 4.2 — Market-Data Schema | Complete (schema in canonical migration path) |
| Phase 4.3 — Gateway Persistence Wiring | Complete (queue + retry wired) |
| Python Trading Engines | Not started |
| Live / Demo / Testnet Trading | Not authorized |

## Phase 3 completion record

Phase 3 was completed through three separately approved pull requests.

### PR 3.1 — Bybit Public REST Adapter

Status: **Merged**

Delivered:

- Bybit V5 public REST client
- Active linear USDT perpetual filtering
- Dynamic Top-20 universe by 24-hour turnover
- Stablecoin-base and inactive-contract exclusion
- Public ticker normalization
- Historical OHLCV normalization
- Closed/open candle classification
- Request spacing, timeout, retry, backoff and jitter
- Short-lived response cache
- Structured provider errors
- REST contract tests

### PR 3.2 — Bybit Public WebSocket Adapter

Status: **Merged**

Delivered:

- Bybit public linear WebSocket connection
- Dynamic Top-20 ticker and candle subscriptions
- Supported timeframes: 1m, 3m, 5m, 15m, 30m, 1h, 4h and 1d
- Heartbeat support
- Exponential reconnect backoff with jitter
- Automatic re-subscription after reconnect
- Ticker snapshot/delta merging
- Closed-candle mapping
- Duplicate-event suppression
- Feed status and last-event tracking
- WebSocket normalization tests

### PR 3.3 — Feed Reliability and REST Recovery

Status: **Merged**

Delivered:

- WebSocket stale-feed detection
- Bounded duplicate-event suppression
- Out-of-order ticker sequence rejection
- Out-of-order candle rejection by symbol/timeframe
- Reconnect metrics and disconnect timestamps
- Circuit breaker with closed, open and half-open states
- Cooldown-aware reconnect handling
- Top-20 subscription restore verification
- Public REST candle gap recovery
- Recovery calculation with a 1,000-candle safety limit
- Reliability status endpoint
- Reliability and recovery tests

### Phase 3 completion timestamp

```text
Date: 06 August 2026
Time: 01:10 AM
Time Zone: Asia/Dhaka (UTC+06:00)
Status: PHASE 3 COMPLETE AND MERGED
```

## Architecture boundary

### Node.js / TypeScript

Used only for the public market-data collection gateway:

- Public REST market data
- Public WebSocket market data
- Symbol and timeframe validation
- Subscription management
- Heartbeat and reconnect handling
- Rate-limit and timeout handling
- Feed normalization
- Stale-feed and sequence-gap detection
- REST gap recovery
- Circuit breaker and reliability metrics
- Gateway health and status

Node.js is not allowed to own trading decisions, strategy logic, risk logic, portfolio accounting, or order execution.

### Python

Used for all core analytical and trading engines:

- Historical data processing and storage
- Strategy Engine
- Scanner Engine
- Signal Engine
- Risk Engine
- Paper Trading Engine
- Portfolio and Ledger Engine
- Backtest Engine
- Reconciliation Engine

The Python backend remains the authority for business logic and trading decisions.

## Existing backend endpoints

### FastAPI backend

```text
GET /health/live
GET /health/ready
GET /health
```

### Market-data gateway

```text
GET    /health/live
GET    /health/ready
GET    /status
GET    /contracts
GET    /reliability
GET    /market-data/universe
GET    /market-data/ticker/:symbol
GET    /market-data/candles/:symbol
GET    /market-data/recovery/:symbol
POST   /subscriptions
DELETE /subscriptions
```

## Phase 4 — Neon PostgreSQL Persistence

Planned sequence:

1. PR 4.1 — Database Foundation
2. PR 4.2 — Market Data Schema
3. PR 4.3 — Persistence Pipeline
4. PR 4.4 — Recovery and Verification

Neon rules:

- SSL-required connection
- Connection string stored only in local `.env` and approved GitHub Secrets
- No database credentials committed to the repository
- Frontend never connects directly to Neon
- Validated normalized events only
- Idempotent candle upserts
- Unique candle key: symbol + timeframe + open time

Phase 4 coding requires separate owner approval.

## Approval and delivery workflow

```text
Plan
→ Owner Review
→ Owner Approval
→ Agent Coding
→ Automated Tests
→ Architecture and Security Audit
→ Fixes
→ Final Verification
→ Owner Approval
→ Merge
→ Phase Lock
```

Project rules:

- No phase starts without an approved plan.
- No new engine starts without owner discussion and approval.
- No silent scope expansion.
- One PR must be completed and merged before the next PR begins.
- CI must be green before merge.
- Frontend never owns business or trading logic.
- Node.js never owns trading decisions or order execution.
- Python remains the core engine authority.

## Safety boundary

Currently allowed:

- Public market data without credentials
- Local research
- Backtesting
- Local paper-trading simulation after future approval
- Local application testing
- Neon PostgreSQL use after Phase 4 approval

Currently prohibited:

- Exchange API keys
- Private account endpoints
- Real balances
- Real order submission
- Demo or testnet exchange order submission
- Deposits, withdrawals, or transfers
- Browser-to-exchange connections
- Live-funds controls
- Cloud application deployment until separately approved

## Repository structure

```text
backend/
  app/
  tests/

services/
  market-data-gateway/

src/
  adapters/
  components/
  hooks/
  lib/
  pages/
  routes/
  services/
  types/
```

## Development commands

### Frontend

```bash
npm install
npm run dev
npm run build
npm run lint
```

### Python backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
PYTHONPATH=. pytest -q
```

### Market-data gateway

```bash
cd services/market-data-gateway
npm install
npm run typecheck
npm test
npm run build
```

## Current stop condition

Phase 3 is complete and merged.

The next proposed action is **Phase 4.1 — Neon PostgreSQL Database Foundation**, subject to separate owner review and coding approval.
