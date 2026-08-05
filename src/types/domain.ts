// AstraPilot domain types.
// These describe the shape of data the UI consumes.
// Components import only these types — never the demo adapter directly.

export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export type SignalGrade = 'A+' | 'A' | 'B+';

export type SignalStatus =
  | 'Risk Review'
  | 'Watch Only'
  | 'New'
  | 'Stale';

export type Severity = 'critical' | 'warning' | 'info';

export type Mode = 'LOCAL PAPER' | 'RESEARCH';

export interface KpiCardData {
  id: string;
  label: string;
  value: string;
  /** Secondary status line shown under the value. */
  status: string;
  /** Source label or timestamp, e.g. "paper-engine · 12:04:31". */
  source: string;
  trend?: 'up' | 'down' | 'flat';
  href: string;
}

export interface DashboardSummary {
  generatedAt: string;
  mode: Mode;
  kpis: KpiCardData[];
}

export interface PortfolioSnapshot {
  equity: number;
  equitySeries: EquityPoint[];
  drawdownSeries: DrawdownPoint[];
  source: string;
  watermark: string;
}

export interface EquityPoint {
  time: number; // unix seconds
  equity: number;
}

export interface DrawdownPoint {
  time: number; // unix seconds
  drawdown: number; // negative percent, e.g. -3.2
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | 'ALL';

export interface SignalSummary {
  id: string;
  grade: SignalGrade;
  symbol: string;
  strategy: string;
  rr: number;
  status: SignalStatus;
  createdAt: string;
}

export interface RequiredAction {
  id: string;
  severity: Severity;
  title: string;
  reason: string;
  timestamp: string;
  /** Route or anchor the "Open details" action resolves to. */
  detailsHref: string;
}

export type ConnectionState = 'connected' | 'degraded' | 'disconnected' | 'offline';

export interface MarketDataStatus {
  state: ConnectionState;
  lastTick: string;
  symbolsTracked: number;
  source: string;
}

export interface RiskStatus {
  state: ConnectionState;
  /** Neutral human-readable summary, e.g. "Awaiting authoritative risk service". */
  summary: string;
}

export interface SseStatus {
  state: ConnectionState;
  lastEvent: string;
  channel: string;
}

export interface DatasetStatus {
  state: ConnectionState;
  datasets: number;
  lastImport: string;
}

export interface SystemStatus {
  mode: Mode;
  marketData: MarketDataStatus;
  risk: RiskStatus;
  sse: SseStatus;
  datasets: DatasetStatus;
  portfolio: {
    quoteAsset: string;
    balance: number;
  };
}
