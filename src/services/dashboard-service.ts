// Dashboard service.
//
// Components depend on this interface, not on the demo adapter.
// A future implementation can replace `demoAdapter` with REST/SSE calls
// without touching page components.

import { demoAdapter } from '@/adapters/demo-data';
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

const latency = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const dashboardService: DashboardService = {
  async getSummary() {
    await latency();
    return demoAdapter.getDashboardSummary();
  },
  async getPortfolio(range) {
    await latency();
    return demoAdapter.getPortfolioSnapshot(range);
  },
  async getRecentSignals() {
    await latency();
    return demoAdapter.getRecentSignals();
  },
  async getRequiredActions() {
    await latency();
    return demoAdapter.getRequiredActions();
  },
};
