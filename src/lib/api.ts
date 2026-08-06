export const backendBaseUrl = (import.meta.env.VITE_BACKEND_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
export const gatewayBaseUrl = (import.meta.env.VITE_MARKET_GATEWAY_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export type ApiState = 'idle' | 'loading' | 'success' | 'error' | 'unconfigured';

export type BackendHealth = {
  service: string;
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  mode: string;
  request_id: string;
  dependencies: Record<string, { state?: string; detail?: string; message?: string }>;
};

export type GatewayStatus = {
  service: string;
  version: string;
  state: string;
  provider?: string;
  lastEventAt?: string | null;
  staleAfterMs?: number;
  reason?: string | null;
  persistence?: { enabled: boolean; metrics: Record<string, number> };
};

export type MarketUniverse = {
  provider: string;
  market: string;
  limit: number;
  symbols: Array<string | { symbol?: string; turnover24h?: string | number; lastPrice?: string | number }>;
};

async function getJson<T>(baseUrl: string, path: string, signal?: AbortSignal): Promise<T> {
  if (!baseUrl) throw new Error('API base URL is not configured.');
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  backendHealth: (signal?: AbortSignal) => getJson<BackendHealth>(backendBaseUrl, '/health', signal),
  backendReadiness: (signal?: AbortSignal) => getJson<Record<string, unknown>>(backendBaseUrl, '/health/ready', signal),
  gatewayStatus: (signal?: AbortSignal) => getJson<GatewayStatus>(gatewayBaseUrl, '/status', signal),
  gatewayReadiness: (signal?: AbortSignal) => getJson<Record<string, unknown>>(gatewayBaseUrl, '/health/ready', signal),
  marketUniverse: (signal?: AbortSignal) => getJson<MarketUniverse>(gatewayBaseUrl, '/market-data/universe', signal),
};
