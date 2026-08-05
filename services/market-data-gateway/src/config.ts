import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4100),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  PROVIDER_MODE: z.enum(['disabled', 'fixture', 'bybit-rest', 'bybit-websocket']).default('disabled'),
  STALE_AFTER_MS: z.coerce.number().int().positive().default(15000),
  BYBIT_REST_BASE_URL: z.string().url().default('https://api.bybit.com'),
  BYBIT_REST_TIMEOUT_MS: z.coerce.number().int().min(500).max(30000).default(5000),
  BYBIT_REST_MAX_RETRIES: z.coerce.number().int().min(0).max(3).default(2),
  BYBIT_REST_BACKOFF_MS: z.coerce.number().int().min(50).max(10000).default(250),
  BYBIT_REST_MIN_INTERVAL_MS: z.coerce.number().int().min(50).max(5000).default(150),
  BYBIT_REST_CACHE_TTL_MS: z.coerce.number().int().min(0).max(3600000).default(5000),
  BYBIT_WS_URL: z.string().url().default('wss://stream.bybit.com/v5/public/linear'),
  BYBIT_WS_HEARTBEAT_MS: z.coerce.number().int().min(5000).max(60000).default(20000),
  BYBIT_WS_RECONNECT_BASE_MS: z.coerce.number().int().min(100).max(10000).default(500),
  BYBIT_WS_RECONNECT_MAX_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
});

export type GatewayConfig = {
  nodeEnv: 'development' | 'test' | 'production'; host: string; port: number; corsOrigins: string[];
  providerMode: 'disabled' | 'fixture' | 'bybit-rest' | 'bybit-websocket'; staleAfterMs: number;
  bybitRestBaseUrl: string; bybitRestTimeoutMs: number; bybitRestMaxRetries: number; bybitRestBackoffMs: number; bybitRestMinIntervalMs: number; bybitRestCacheTtlMs: number;
  bybitWsUrl?: string; bybitWsHeartbeatMs?: number; bybitWsReconnectBaseMs?: number; bybitWsReconnectMaxMs?: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  const p = schema.parse(env);
  return { nodeEnv:p.NODE_ENV, host:p.HOST, port:p.PORT, corsOrigins:p.CORS_ORIGINS.split(',').map(v=>v.trim()).filter(Boolean), providerMode:p.PROVIDER_MODE, staleAfterMs:p.STALE_AFTER_MS,
    bybitRestBaseUrl:p.BYBIT_REST_BASE_URL, bybitRestTimeoutMs:p.BYBIT_REST_TIMEOUT_MS, bybitRestMaxRetries:p.BYBIT_REST_MAX_RETRIES, bybitRestBackoffMs:p.BYBIT_REST_BACKOFF_MS, bybitRestMinIntervalMs:p.BYBIT_REST_MIN_INTERVAL_MS, bybitRestCacheTtlMs:p.BYBIT_REST_CACHE_TTL_MS,
    bybitWsUrl:p.BYBIT_WS_URL, bybitWsHeartbeatMs:p.BYBIT_WS_HEARTBEAT_MS, bybitWsReconnectBaseMs:p.BYBIT_WS_RECONNECT_BASE_MS, bybitWsReconnectMaxMs:p.BYBIT_WS_RECONNECT_MAX_MS };
}
