ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS broker_position_id text,
  ADD COLUMN IF NOT EXISTS broker_account_id text,
  ADD COLUMN IF NOT EXISTS executed_via text;