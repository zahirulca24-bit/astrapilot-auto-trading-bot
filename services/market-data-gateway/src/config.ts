import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4100),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  PROVIDER_MODE: z.enum(['disabled', 'fixture', 'bybit-rest']).default('disabled'),
  STALE_AFTER_MS: z.coerce.number().int().positive().default(15000),
  BYBIT_REST_BASE_URL: z.string().url().default('https://api.bybit.com'),
  BYBIT_REST_TIMEOUT_MS: z.coerce.number().int().min(500).max(30000).default(5000),
  BYBIT_REST_MAX_RETRIES: z.coerce.number().int().min(0).max(3).default(2),
  BYBIT_REST_BACKOFF_MS: z.coerce.number().int().min(50).max(10000).default(250),
  BYBIT_REST_MIN_INTERVAL_MS: z.coerce.number().int().min(50).max(5000).default(150),
  BYBIT_REST_CACHE_TTL_MS: z.coerce.number().int().min(0).max(3600000).default(5000),
});

export type GatewayConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  corsOrigins: string[];
  providerMode: 'disabled' | 'fixture' | 'bybit-rest';
  staleAfterMs: number;
  bybitRestBaseUrl: string;
  bybitRestTimeoutMs: number;
  bybitRestMaxRetries: number;
  bybitRestBackoffMs: number;
  bybitRestMinIntervalMs: number;
  bybitRestCacheTtlMs: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  const parsed = schema.parse(env);
  return {
    nodeEnv: parsed.NODE_ENV,
    host: parsed.HOST,
    port: parsed.PORT,
    corsOrigins: parsed.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean),
    providerMode: parsed.PROVIDER_MODE,
    staleAfterMs: parsed.STALE_AFTER_MS,
    bybitRestBaseUrl: parsed.BYBIT_REST_BASE_URL,
    bybitRestTimeoutMs: parsed.BYBIT_REST_TIMEOUT_MS,
    bybitRestMaxRetries: parsed.BYBIT_REST_MAX_RETRIES,
    bybitRestBackoffMs: parsed.BYBIT_REST_BACKOFF_MS,
    bybitRestMinIntervalMs: parsed.BYBIT_REST_MIN_INTERVAL_MS,
    bybitRestCacheTtlMs: parsed.BYBIT_REST_CACHE_TTL_MS,
  };
}
