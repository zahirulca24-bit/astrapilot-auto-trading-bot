import { z } from 'zod';

export const symbolSchema = z.string().regex(/^[A-Z0-9]{2,20}$/);
export const timeframeSchema = z.enum(['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d']);

export const tickerSchema = z.object({
  type: z.literal('ticker'),
  provider: z.string().min(1),
  symbol: symbolSchema,
  eventTime: z.string().datetime(),
  receivedTime: z.string().datetime(),
  bid: z.number().positive(),
  ask: z.number().positive(),
  last: z.number().positive(),
  sequence: z.number().int().nonnegative().nullable(),
});

export const candleSchema = z.object({
  type: z.literal('candle'),
  provider: z.string().min(1),
  symbol: symbolSchema,
  timeframe: timeframeSchema,
  openTime: z.string().datetime(),
  closeTime: z.string().datetime(),
  open: z.number().positive(),
  high: z.number().positive(),
  low: z.number().positive(),
  close: z.number().positive(),
  volume: z.number().nonnegative(),
  closed: z.boolean(),
  receivedTime: z.string().datetime(),
});

export const tradeSchema = z.object({
  type: z.literal('trade'),
  provider: z.string().min(1),
  symbol: symbolSchema,
  tradeId: z.string().min(1),
  eventTime: z.string().datetime(),
  receivedTime: z.string().datetime(),
  price: z.number().positive(),
  quantity: z.number().positive(),
  side: z.enum(['buy', 'sell', 'unknown']),
});

export const marketEventSchema = z.discriminatedUnion('type', [tickerSchema, candleSchema, tradeSchema]);
export type MarketEvent = z.infer<typeof marketEventSchema>;

export type GatewayState = 'disabled' | 'starting' | 'connected' | 'degraded' | 'stale' | 'stopped';

export type GatewayStatus = {
  service: 'astrapilot-market-data-gateway';
  version: string;
  state: GatewayState;
  provider: string | null;
  publicDataOnly: true;
  exchangeCredentialsAccepted: false;
  lastEventAt: string | null;
  staleAfterMs: number;
  symbols: string[];
  subscriptions: number;
  reason: string | null;
};
