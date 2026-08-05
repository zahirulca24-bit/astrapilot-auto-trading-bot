import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { BybitRestClient, BybitRestError } from './bybit-rest.js';
import type { GatewayConfig } from './config.js';
import { loadConfig } from './config.js';
import { symbolSchema, timeframeSchema } from './contracts.js';
import { DisabledProvider, FixtureProvider, type PublicMarketDataProvider } from './provider.js';

const subscriptionSchema = z.object({ symbols: z.array(symbolSchema).min(1).max(100) });
const candleQuerySchema = z.object({ timeframe: timeframeSchema, limit: z.coerce.number().int().min(1).max(1000).default(200) });

function buildStatus(provider: PublicMarketDataProvider, config: GatewayConfig) {
  const providerStatus = provider.status();
  const lastEventMs = providerStatus.lastEventAt ? Date.parse(providerStatus.lastEventAt) : null;
  const stale = lastEventMs !== null && Date.now() - lastEventMs > config.staleAfterMs;
  return { service: 'astrapilot-market-data-gateway' as const, version: '0.2.0', ...providerStatus,
    state: stale && providerStatus.state === 'connected' ? 'stale' as const : providerStatus.state,
    staleAfterMs: config.staleAfterMs,
    reason: stale ? 'Last normalized market event exceeded the stale threshold.' : providerStatus.reason };
}

export function createProvider(config: GatewayConfig): PublicMarketDataProvider {
  return config.providerMode === 'fixture' ? new FixtureProvider() : new DisabledProvider();
}

export async function buildApp(options?: { config?: GatewayConfig; provider?: PublicMarketDataProvider; restClient?: BybitRestClient }): Promise<FastifyInstance> {
  const config = options?.config ?? loadConfig();
  const provider = options?.provider ?? createProvider(config);
  const restClient = options?.restClient ?? new BybitRestClient(config);
  const app = Fastify({ logger: false, requestIdHeader: 'x-request-id' });

  await app.register(cors, { origin: (origin, callback) => {
    if (!origin || config.corsOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Origin not allowed'), false);
  } });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof BybitRestError) return reply.code(error.status && error.status < 500 ? error.status : 503).send({ error: error.code, message: error.message });
    if (error instanceof z.ZodError) return reply.code(422).send({ error: 'validation_error', details: error.flatten() });
    return reply.code(500).send({ error: 'internal_error' });
  });

  app.addHook('onReady', async () => { await provider.start(async () => undefined); });
  app.addHook('onClose', async () => { await provider.stop(); });

  app.get('/health/live', async () => ({ status: 'ok', service: 'astrapilot-market-data-gateway' }));
  app.get('/health/ready', async (_request, reply) => {
    const status = buildStatus(provider, config);
    const ready = status.state === 'connected' || status.state === 'degraded' || config.providerMode === 'bybit-rest';
    return reply.code(ready ? 200 : 503).send({ ready, status, rest: config.providerMode === 'bybit-rest' });
  });
  app.get('/status', async () => ({ ...buildStatus(provider, config), restProvider: config.providerMode === 'bybit-rest' ? 'bybit' : null }));
  app.get('/contracts', async () => ({ version: '1.1.0', eventTypes: ['ticker', 'candle', 'trade'], timeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'], transport: { rest: true, sse: false, websocket: false }, boundary: { publicDataOnly: true, exchangeCredentialsAccepted: false, orderExecution: false } }));

  app.get('/market-data/universe', async () => ({ provider: 'bybit', market: 'linear-usdt-perpetual', limit: 20, symbols: await restClient.topSymbols(20) }));
  app.get('/market-data/ticker/:symbol', async (request) => restClient.ticker(symbolSchema.parse((request.params as { symbol: string }).symbol.toUpperCase())));
  app.get('/market-data/candles/:symbol', async (request) => {
    const symbol = symbolSchema.parse((request.params as { symbol: string }).symbol.toUpperCase());
    const query = candleQuerySchema.parse(request.query);
    return { provider: 'bybit', symbol, timeframe: query.timeframe, candles: await restClient.candles(symbol, query.timeframe, query.limit) };
  });

  app.post('/subscriptions', async (request, reply) => {
    const parsed = subscriptionSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(422).send({ error: 'invalid_subscription', details: parsed.error.flatten() });
    await provider.subscribe(parsed.data.symbols);
    return reply.code(202).send({ accepted: true, status: buildStatus(provider, config) });
  });
  app.delete('/subscriptions', async (request, reply) => {
    const parsed = subscriptionSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(422).send({ error: 'invalid_subscription', details: parsed.error.flatten() });
    await provider.unsubscribe(parsed.data.symbols);
    return reply.send({ accepted: true, status: buildStatus(provider, config) });
  });
  return app;
}
