ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS external_transaction_id text UNIQUE;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS webhook_received_at timestamptz;