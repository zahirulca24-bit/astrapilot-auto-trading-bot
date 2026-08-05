# AstraPilot UI Prototype

A clean, production-oriented **frontend shell** for an offline research and
local paper-trading application. This repository is a **frontend prototype
only** — no backend or market-data gateway is included.

## Scope of this build

This batch implements:

1. **Global App Shell** — sidebar, header, context bar, offline boundary banner.
2. **Dashboard V1** — four sections only (KPI row, equity & drawdown chart,
   recent signals table, required actions panel).
3. **Shared UI components** — reusable building blocks for future pages.
4. **Placeholder routes** — approved sidebar entries that are not yet built
   render a consistent "Not implemented in current UI batch" page.

The remaining pages are intentionally **not** designed yet.

## Sidebar route count

The current primary sidebar contains:

- **16 primary sidebar routes**
- **1 implemented route:** Dashboard
- **15 primary placeholder routes**

### Nested detail routes

Nested detail routes are **not implemented in this batch**. The following are
deferred:

- Signal Detail
- Strategy Version Detail
- Backtest Result

## What this build does NOT do

- No backend implementation.
- No market-data gateway.
- No exchange API keys.
- No private exchange endpoints.
- No real order submission.
- No demo / testnet order submission.
- No live-funds controls.
- No browser-side exchange WebSocket connections.
- No "Connect Exchange", "API Key", "Deposit", "Withdraw", "Live Trading",
  "Testnet Trading", or "Real Balance" UI.

Public market-data integration will be added later through a separate
Node.js market-data gateway. Until then, the UI uses a clearly labeled
**local demo adapter** with sample presentation values only.

## Tech stack

- React 18 + TypeScript (strict mode)
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React Router v6
- Lightweight Charts (equity / drawdown chart)
- Zustand (UI state only — sidebar collapse + mobile drawer)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # eslint
```

## Environment variables

All variables are **empty placeholders**. Nothing in this build reads them;
they exist so future services can be wired in without restructuring the app.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Future REST API gateway base URL. |
| `VITE_MARKET_DATA_GATEWAY_URL` | Future Node.js market-data gateway URL. |
| `VITE_SSE_URL` | Future Server-Sent Events stream URL. |

## Approved route table

| Sidebar label | Path | Status |
| --- | --- | --- |
| Dashboard | `/app/dashboard` | Implemented |
| Dataset Library | `/app/data` | Placeholder |
| Dataset Import | `/app/data/import` | Placeholder |
| Market Explorer | `/app/markets` | Placeholder |
| Scanner | `/app/scanner` | Placeholder |
| Signal Queue | `/app/signals` | Placeholder |
| Strategy Library | `/app/strategies` | Placeholder |
| Backtests | `/app/backtests` | Placeholder |
| Simulator | `/app/simulator` | Placeholder |
| Simulated Orders | `/app/simulator/orders` | Placeholder |
| Portfolio | `/app/simulator/positions` | Placeholder |
| Risk Center | `/app/risk` | Placeholder |
| Journal | `/app/journal` | Placeholder |
| Alerts and Health | `/app/alerts-health` | Placeholder |
| Audit and Decisions | `/app/audit-decisions` | Placeholder |
| Settings and Governance | `/app/settings-governance` | Placeholder |

Unknown `/app/*` routes render a "Page not found" page inside the App Shell.
Unknown root-level routes redirect to `/app/dashboard`.

## Project structure

```
src/
  adapters/        # demo-data.ts — the ONLY place mock values live
  components/
    layout/        # AppShell, Sidebar (+ MobileSidebar), Header, ContextBar
    common/        # reusable shared components
    dashboard/     # dashboard-specific sections + chart
    ui/            # shadcn/ui primitives
  pages/           # DashboardPage, NotImplementedPage, NotFoundPage
  routes/          # nav-config + route table
  services/        # service interfaces (dashboard, market-data, risk, system-status)
  hooks/           # use-async, use-ui-store
  types/           # domain.ts — typed frontend interfaces
  lib/             # cn() utility
```

### Data architecture

- UI components import **types** and **services** only — never the demo adapter.
- Demo data is isolated in `src/adapters/demo-data.ts`.
- Swapping to real REST/SSE services later means replacing the service
  implementations in `src/services/*`; page components do not change.

## Design tokens

| Token | Value |
| --- | --- |
| App background | `#08111F` |
| Sidebar / header | `#0D1726` |
| Primary surface | `#111D2E` |
| Elevated surface | `#172437` |
| Hover surface | `#1D2C42` |
| Border | `#26364D` |
| Primary text | `#F2F6FC` |
| Secondary text | `#B7C3D4` |
| Muted text | `#7F8DA3` |
| Success | `#35C48B` |
| Warning | `#F4B740` |
| Critical | `#F06464` |
| Simulation | `#5EA6F7` |
| AI advisory | `#B58CFF` |
| Boundary blocked | `#F28E5B` |

Typography: **Inter** for UI, **JetBrains Mono** for prices, IDs, and numeric data.

## Mobile sidebar behavior

- Below 640px the sidebar is hidden by default.
- The header menu button opens it as an overlay drawer (~272px) with a dark
  backdrop.
- Clicking a navigation item, pressing Escape, or clicking the backdrop closes
  the drawer. Body scrolling is locked while it is open.
- On tablet (≥ 640px) and desktop, the existing expanded (248px) / collapsed
  (72px) rail behavior is preserved.

## Known limitations

- Only the Dashboard is implemented; all other primary routes are placeholders.
- All data is sample presentation data from the local demo adapter.
- No market-data gateway, REST API, or SSE stream is connected.
- Global search and alerts buttons are present but non-functional in this batch.
- Workspace control is a single non-interactive label — switching is not available.
- Risk values are neutral placeholders; no governance thresholds are implied.
- Evidence drawer and confirmation dialog are provided as shared components but
  not yet wired into any page action (no critical actions exist on the dashboard).

## Confirmation

No exchange connectivity, live trading, testnet trading, or real-funds
functionality was added to this build.
