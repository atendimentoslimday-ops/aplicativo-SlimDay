-- ============================================================
-- SECURITY FIX: Remove client-side INSERT policy from purchases
-- Purchases must ONLY be inserted server-side (via Edge Function
-- webhook handler with the service_role key), never from the browser.
-- ============================================================

-- Drop the insecure client-side insert policy
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.purchases;

-- Ensure RLS is still enabled (defensive)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can only READ their own purchases (unchanged)
-- The SELECT policy already exists and is correct.

-- Add a policy that allows only service_role (server) to insert purchases.
-- In Supabase, service_role bypasses RLS by default, but we add
-- this note here to make the intent explicit in the migration history.
-- No additional INSERT policy is created for authenticated users.

-- Block UPDATE and DELETE from clients as well (defense-in-depth)
DROP POLICY IF EXISTS "Users can update their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can delete their own purchases" ON public.purchases;

-- Add a column to link the purchase to the Kirvano transaction ID
-- so we can verify the webhook is legitimate and avoid replay attacks.
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS external_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP WITH TIME ZONE;

-- Unique constraint prevents duplicate webhook replays
CREATE UNIQUE INDEX IF NOT EXISTS purchases_external_transaction_id_key
  ON public.purchases (external_transaction_id)
  WHERE external_transaction_id IS NOT NULL;

-- Also secure the cycle_unlocked field: clients should NOT be able to
-- directly update cycle_unlocked on their own profile without a purchase.
-- We add a function-based check that only allows unlocking via server.
-- For now, we restrict it via a security trigger.

CREATE OR REPLACE FUNCTION public.prevent_client_cycle_unlock()
RETURNS TRIGGER AS $$
BEGIN
  -- If cycle_unlocked is being set to TRUE in an UPDATE from the client
  -- but there is no confirmed purchase record for this user, block it.
  IF NEW.cycle_unlocked = TRUE AND OLD.cycle_unlocked = FALSE THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.purchases
      WHERE user_id = NEW.user_id
        AND status = 'completed'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: no confirmed purchase found for this user.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS check_cycle_unlock_on_profile_update ON public.profiles;

CREATE TRIGGER check_cycle_unlock_on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_cycle_unlock();
