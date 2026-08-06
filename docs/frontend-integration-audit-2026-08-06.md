# Frontend Integration Audit — 2026-08-06

## Scope

Approved navigation routes, route registration, shared operational UI, action semantics, responsive table behavior, and frontend-to-backend contract visibility.

## Confirmed findings

### P1 — Misleading active controls

Multiple pages rendered buttons and filters as actionable even though no handler or backend client existed. This created false affordances and made unavailable operations look operational.

**Correction:** shared research controls now default to disabled, include `aria-disabled`, and disclose why the action is unavailable. Dataset registry filters are also disabled until the registry API is connected.

### P1 — Dataset navigation buttons did nothing

Dataset Library displayed “Import dataset” and “Open Dataset Import” as plain buttons without navigation behavior.

**Correction:** both actions are now real React Router links to `/app/data/import`.

### P1 — Backend mapping was implicit

There was no central, reviewable record of which route depends on which backend contract or whether the capability is public-data, local-only, or unavailable.

**Correction:** `src/lib/frontend-capabilities.ts` now records route dependencies, operating state, and the reason a capability is unavailable.

### P2 — Dynamic placeholder routing remained after placeholder removal

The router still generated placeholder routes from navigation configuration even though all approved pages had been implemented. This created an unnecessary second source of route truth and could silently mask a missing page.

**Correction:** the router now uses one explicit implemented route manifest. Unknown `/app/*` paths render the in-shell Not Found page.

### P2 — Wide tables clipped instead of scrolling

The shared research table container used hidden overflow, which could conceal columns on laptop-width screens.

**Correction:** horizontal overflow is now enabled and the empty-state row preserves the same minimum width as the header.

### P2 — Empty-state copy overclaimed integration

The shared copy said the screen was connected to the workflow while backend contracts were not actually connected.

**Correction:** the default empty state now states that the route exists but the backend contract is not connected.

## Backend-mapping gaps still open

The current UI does not yet contain verified clients for dashboard aggregates, dataset registry/import, market gateway, scanner, signals, strategies, backtests, local simulator ledgers, risk, journal, health/persistence status, decision register, or read-only settings.

These gaps are intentionally disclosed rather than mocked. Secrets, exchange credentials, private endpoints, demo/testnet exchange orders, and live-funds execution remain outside the browser boundary.

## Verification gate

Before merge, run:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

Then visually review all approved routes at laptop and desktop widths. This audit did not claim those commands were executed through the GitHub connector.
