CREATE TABLE IF NOT EXISTS symbols (
    id bigserial PRIMARY KEY,
    symbol text NOT NULL UNIQUE,
    exchange text NOT NULL DEFAULT 'bybit',
    market_type text NOT NULL DEFAULT 'linear-usdt-perpetual',
    base_asset text NOT NULL,
    quote_asset text NOT NULL DEFAULT 'USDT',
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (symbol = upper(symbol)),
    CHECK (base_asset = upper(base_asset)),
    CHECK (quote_asset = upper(quote_asset))
);

CREATE TABLE IF NOT EXISTS symbol_universe_history (
    id bigserial PRIMARY KEY,
    symbol_id bigint NOT NULL REFERENCES symbols(id) ON DELETE CASCADE,
    rank integer NOT NULL CHECK (rank BETWEEN 1 AND 20),
    quote_turnover numeric(30, 8) NOT NULL CHECK (quote_turnover >= 0),
    selected_at timestamptz NOT NULL,
    removed_at timestamptz,
    CHECK (removed_at IS NULL OR removed_at >= selected_at),
    UNIQUE (symbol_id, selected_at)
);

CREATE TABLE IF NOT EXISTS ticker_snapshots (
    id bigserial PRIMARY KEY,
    symbol_id bigint NOT NULL REFERENCES symbols(id) ON DELETE CASCADE,
    event_time timestamptz NOT NULL,
    received_time timestamptz NOT NULL,
    bid numeric(30, 12) NOT NULL CHECK (bid > 0),
    ask numeric(30, 12) NOT NULL CHECK (ask > 0),
    last numeric(30, 12) NOT NULL CHECK (last > 0),
    sequence bigint,
    source text NOT NULL DEFAULT 'websocket',
    CHECK (ask >= bid),
    UNIQUE (symbol_id, event_time, source)
);

CREATE TABLE IF NOT EXISTS ohlcv_candles (
    id bigserial PRIMARY KEY,
    symbol_id bigint NOT NULL REFERENCES symbols(id) ON DELETE CASCADE,
    timeframe text NOT NULL CHECK (timeframe IN ('1m','3m','5m','15m','30m','1h','4h','1d')),
    open_time timestamptz NOT NULL,
    close_time timestamptz NOT NULL,
    open numeric(30, 12) NOT NULL CHECK (open > 0),
    high numeric(30, 12) NOT NULL CHECK (high > 0),
    low numeric(30, 12) NOT NULL CHECK (low > 0),
    close numeric(30, 12) NOT NULL CHECK (close > 0),
    volume numeric(38, 12) NOT NULL CHECK (volume >= 0),
    closed boolean NOT NULL DEFAULT false,
    source text NOT NULL DEFAULT 'websocket',
    received_time timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (close_time > open_time),
    CHECK (high >= GREATEST(open, close, low)),
    CHECK (low <= LEAST(open, close, high)),
    UNIQUE (symbol_id, timeframe, open_time)
);

CREATE TABLE IF NOT EXISTS feed_health_events (
    id bigserial PRIMARY KEY,
    provider text NOT NULL,
    state text NOT NULL CHECK (state IN ('starting','connected','degraded','stale','stopped')),
    event_type text NOT NULL,
    symbol_id bigint REFERENCES symbols(id) ON DELETE SET NULL,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_universe_active_rank
    ON symbol_universe_history (selected_at DESC, rank)
    WHERE removed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ticker_symbol_time
    ON ticker_snapshots (symbol_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_candle_symbol_tf_time
    ON ohlcv_candles (symbol_id, timeframe, open_time DESC);
CREATE INDEX IF NOT EXISTS idx_candle_closed_time
    ON ohlcv_candles (timeframe, open_time DESC)
    WHERE closed = true;
CREATE INDEX IF NOT EXISTS idx_feed_health_time
    ON feed_health_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_health_provider_state
    ON feed_health_events (provider, state, occurred_at DESC);
