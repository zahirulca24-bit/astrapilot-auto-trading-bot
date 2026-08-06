export type CapabilityState = 'available' | 'unavailable' | 'local-only';

export type RouteCapability = {
  route: string;
  dependencies: string[];
  state: CapabilityState;
  reason: string;
};

export const routeCapabilities: RouteCapability[] = [
  { route: '/app/dashboard', dependencies: ['dashboard summary API'], state: 'unavailable', reason: 'No verified dashboard aggregate contract is connected.' },
  { route: '/app/data', dependencies: ['dataset registry API'], state: 'unavailable', reason: 'Dataset registry endpoint is not connected.' },
  { route: '/app/data/import', dependencies: ['local import/preflight API'], state: 'local-only', reason: 'Import remains local and requires validated backend wiring.' },
  { route: '/app/markets', dependencies: ['public market gateway'], state: 'unavailable', reason: 'Browser-to-gateway client is not connected.' },
  { route: '/app/scanner', dependencies: ['scanner API', 'closed-candle dataset'], state: 'unavailable', reason: 'Scanner contract is not connected.' },
  { route: '/app/signals', dependencies: ['signal queue API'], state: 'unavailable', reason: 'Signal queue contract is not connected.' },
  { route: '/app/strategies', dependencies: ['strategy registry API'], state: 'unavailable', reason: 'Strategy registry contract is not connected.' },
  { route: '/app/backtests', dependencies: ['backtest API', 'dataset registry API'], state: 'unavailable', reason: 'Backtest execution contract is not connected.' },
  { route: '/app/simulator', dependencies: ['local simulator API'], state: 'local-only', reason: 'Simulation must remain local-only and is not connected yet.' },
  { route: '/app/simulator/orders', dependencies: ['local simulated-order ledger'], state: 'local-only', reason: 'Order ledger is not connected.' },
  { route: '/app/simulator/positions', dependencies: ['local portfolio ledger'], state: 'local-only', reason: 'Portfolio ledger is not connected.' },
  { route: '/app/risk', dependencies: ['risk-state API'], state: 'unavailable', reason: 'Risk contract is not connected.' },
  { route: '/app/journal', dependencies: ['journal API'], state: 'unavailable', reason: 'Journal contract is not connected.' },
  { route: '/app/alerts-health', dependencies: ['health API', 'persistence status API'], state: 'unavailable', reason: 'Operational health client is not connected.' },
  { route: '/app/audit-decisions', dependencies: ['decision register API'], state: 'unavailable', reason: 'Governance register is not connected.' },
  { route: '/app/settings-governance', dependencies: ['read-only settings API'], state: 'unavailable', reason: 'Settings contract is not connected; secrets remain excluded.' },
];

export function getRouteCapability(route: string): RouteCapability | undefined {
  return routeCapabilities.find((item) => item.route === route);
}
