CREATE TABLE IF NOT EXISTS dataset_registry (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    row_count BIGINT NOT NULL CHECK (row_count >= 0),
    symbol_count INTEGER NOT NULL CHECK (symbol_count >= 0),
    fingerprint TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('staged', 'validated', 'approved', 'rejected')),
    first_timestamp TIMESTAMPTZ,
    last_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dataset_registry_status ON dataset_registry(status);
CREATE INDEX IF NOT EXISTS idx_dataset_registry_updated_at ON dataset_registry(updated_at DESC);
