# AstraPilot

**Automated Crypto Trading with Risk-First Execution**

AstraPilot is a greenfield crypto trading research and local paper-trading platform. The project is being built phase by phase with strict architecture, safety, testing, and approval controls.

## Current project status

| Area | Status |
| --- | --- |
| Frontend Foundation | Complete |
| Backend Phase 1 — Foundation + Health Contract | Merged |
| Backend Phase 2 — Public Market Data Gateway Contract | Merged |
| Backend Phase 3 — Real Public Market Data Adapter | Planning only |
| Python Trading Engines | Not started |
| Live / Demo / Testnet Trading | Not authorized |

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

## Phase 3 — Real Public Market Data Adapter

Phase 3 is divided into three separately approved pull requests.

### PR 3.1 — Public REST Adapter

Planned scope:

- Public exchange REST client
- Symbol metadata
- Ticker snapshots
- Historical candle retrieval
- Timeout and retry policy
- Rate-limit handling
- Contract normalization
- REST contract tests

Not included:

- WebSocket streaming
- Persistence
- Trading logic
- Private exchange endpoints

### PR 3.2 — Public WebSocket Adapter

Planned scope:

- Public WebSocket connection
- Ticker stream
- Candle stream
- Trade stream
- Subscribe and unsubscribe controls
- Heartbeat
- Reconnect with backoff
- Duplicate-event protection
- Stream contract tests

Not included:

- Order execution
- Private channels
- API credentials
- Portfolio or risk logic

### PR 3.3 — Feed Reliability and Gateway Integration

Planned scope:

- REST and WebSocket integration
- Sequence-gap detection
- Stale-feed detection
- REST recovery after WebSocket gaps
- Provider and connection health
- Controlled shutdown
- End-to-end gateway tests
- Backend readiness integration

Not included:

- Historical persistence
- Scanner
- Signal generation
- Risk engine
- Paper trading
- Live, demo, or testnet order execution

## Approval and delivery workflow

Every new phase or engine follows this sequence:

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
- Local paper-trading simulation after its future approval

Currently prohibited:

- Exchange API keys
- Private account endpoints
- Real balances
- Real order submission
- Demo or testnet exchange order submission
- Deposits, withdrawals, or transfers
- Browser-to-exchange connections
- Live-funds controls

## Repository structure

```text
backend/
  app/                         # FastAPI application and health contracts
  tests/                       # Python backend tests

services/
  market-data-gateway/         # Node.js/TypeScript public data gateway

src/                           # React frontend
  adapters/
  components/
  hooks/
  lib/
  pages/
  routes/
  services/
  types/
```

## Existing backend endpoints

### FastAPI backend

```text
GET /health/live
GET /health/ready
GET /health
```

### Market-data gateway contract

```text
GET    /health/live
GET    /health/ready
GET    /status
GET    /contracts
POST   /subscriptions
DELETE /subscriptions
```

## Frontend status

The frontend foundation includes:

- Responsive application shell
- Desktop and mobile navigation
- Dashboard V1
- Four KPI cards
- Equity and drawdown chart
- Recent signals table
- Required actions panel
- Approved route table
- Placeholder pages for deferred modules
- Local demo adapter isolated from UI components

The current frontend remains a presentation and navigation layer only.

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

Backend Phase 2 is merged. Phase 3 has not started.

The next authorized action is discussion and approval of **PR 3.1 — Public REST Adapter**. No Phase 3 coding may begin before owner approval.
