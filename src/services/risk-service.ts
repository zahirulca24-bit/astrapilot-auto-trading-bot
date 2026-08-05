// Risk service.
//
// Placeholder for risk-engine integration. Values currently come from the
// local demo adapter. Swap the implementation for REST calls against
// VITE_API_BASE_URL when the backend exists.

import { demoAdapter } from '@/adapters/demo-data';
import type { RiskStatus } from '@/types/domain';

export interface RiskService {
  getStatus(): Promise<RiskStatus>;
}

const latency = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const riskService: RiskService = {
  async getStatus() {
    await latency();
    return demoAdapter.getSystemStatus().risk;
  },
};
