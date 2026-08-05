import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4100),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  PROVIDER_MODE: z.enum(['disabled', 'fixture']).default('disabled'),
  STALE_AFTER_MS: z.coerce.number().int().positive().default(15000),
});

export type GatewayConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  corsOrigins: string[];
  providerMode: 'disabled' | 'fixture';
  staleAfterMs: number;
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
  };
}
