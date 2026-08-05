# AstraPilot Public Market Data Gateway

Backend Phase 2 establishes the Node.js contract boundary for public market data. It does not connect to an exchange in this phase.

## Scope

- Node.js 20+ and TypeScript
- Fastify service
- Public-data-only provider interface
- Normalized ticker, candle, and trade contracts
- Closed-candle flag in the candle contract
- Controlled symbol subscriptions
- Liveness, readiness, status, and contract endpoints
- Stale-feed state calculation
- Explicit rejection of credential-bearing or order-execution responsibilities

## Endpoints

- `GET /health/live`
- `GET /health/ready`
- `GET /status`
- `GET /contracts`
- `POST /subscriptions`
- `DELETE /subscriptions`

## Local setup

```bash
cd services/market-data-gateway
cp .env.example .env
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

The default `PROVIDER_MODE=disabled` is intentionally not ready. `PROVIDER_MODE=fixture` is available only for deterministic contract testing.

## Safety boundary

This service accepts no API keys or exchange credentials. It exposes no private account endpoint and no order, demo, testnet, live-trading, transfer, or withdrawal capability. Browser clients must not connect directly to an exchange.

## Deferred

- Real public REST adapter
- Real public WebSocket adapter
- Reconnect and backoff implementation
- Sequence-gap recovery
- Persistence
- SSE delivery to frontend
- Historical backfill
- Paper-trading integration
