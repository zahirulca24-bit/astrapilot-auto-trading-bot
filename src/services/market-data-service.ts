// Market-data service.
//
// Placeholder for the future Node.js market-data gateway integration.
// The browser never talks to any exchange directly. When the gateway exists,
// replace this implementation with REST/SSE calls against
// VITE_MARKET_DATA_GATEWAY_URL / VITE_SSE_URL.

import { demoAdapter } from '@/adapters/demo-data';
import type { MarketDataStatus } from '@/types/domain';

export interface MarketDataService {
  getStatus(): Promise<MarketDataStatus>;
}

const latency = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const marketDataService: MarketDataService = {
  async getStatus() {
    await latency();
    return demoAdapter.getSystemStatus().marketData;
  },
};
