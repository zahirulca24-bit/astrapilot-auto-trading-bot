CREATE TABLE IF NOT EXISTS database_metadata (
    singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
    service_name text NOT NULL DEFAULT 'astrapilot-backend',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO database_metadata (singleton)
VALUES (true)
ON CONFLICT (singleton) DO NOTHING;
