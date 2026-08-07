// Dashboard legacy detail service.
//
// Real research/market-data aggregates are loaded through src/lib/api.ts.
// These legacy detail methods intentionally fail closed until approved
// portfolio, signal, and required-action backend contracts exist.

import type {
  DashboardSummary,
  PortfolioSnapshot,
  RequiredAction,
  SignalSummary,
  TimeRange,
} from '@/types/domain';

export interface DashboardService {
  getSummary(): Promise<DashboardSummary>;
  getPortfolio(range: TimeRange): Promise<PortfolioSnapshot>;
  getRecentSignals(): Promise<SignalSummary[]>;
  getRequiredActions(): Promise<RequiredAction[]>;
}

const unavailable = (contract: string): never => {
  throw new Error(`${contract} is unavailable until its approved backend contract is implemented.`);
};

export const dashboardService: DashboardService = {
  async getSummary() {
    return unavailable('Legacy dashboard KPI summary');
  },
  async getPortfolio(_range) {
    return unavailable('Portfolio/equity history');
  },
  async getRecentSignals() {
    return unavailable('Recent signals');
  },
  async getRequiredActions() {
    return unavailable('Required actions');
  },
};
