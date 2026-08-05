// System status service — aggregates the context-bar state.
import { demoAdapter } from '@/adapters/demo-data';
import type { SystemStatus } from '@/types/domain';

export interface SystemStatusService {
  get(): Promise<SystemStatus>;
}

const latency = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const systemStatusService: SystemStatusService = {
  async get() {
    await latency();
    return demoAdapter.getSystemStatus();
  },
};
