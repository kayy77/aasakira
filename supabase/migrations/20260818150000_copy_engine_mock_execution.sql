-- ============================================================
-- Copy engine: idempotency, mock-execution trade linkage, risk math baseline
-- ============================================================

-- ---------- 1. COPY_JOBS IDEMPOTENCY ----------
-- Deterministic key so a retried dispatch (same copy_event + follower) can
-- never create a second job / second trade.
ALTER TABLE public.copy_jobs ADD COLUMN IF NOT EXISTS idempotency_key text;

UPDATE public.copy_jobs
SET idempotency_key = copy_event_id::text || ':' || follower_account_id::text
WHERE idempotency_key IS NULL;

ALTER TABLE public.copy_jobs ALTER COLUMN idempotency_key SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.copy_jobs ADD CONSTRAINT copy_jobs_idempotency_key_key UNIQUE (idempotency_key);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- 2. COPY_EVENTS DEDUPE ----------
-- A generated fallback ticket lets us put a real (non-partial) unique
-- constraint on (master, event_type, ticket) so PostgREST upserts work,
-- while still letting ticket-less manual/test events insert freely.
ALTER TABLE public.copy_events ADD COLUMN IF NOT EXISTS dedupe_ticket text
  GENERATED ALWAYS AS (COALESCE(master_ticket, 'evt-' || id::text)) STORED;

DO $$ BEGIN
  ALTER TABLE public.copy_events
    ADD CONSTRAINT uq_copy_events_dedupe UNIQUE (master_account_id, event_type, dedupe_ticket);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- 3. TRADE_HISTORY: SUPPORT COPY (FOLLOWER) FILLS ----------
-- trade_history was originally scoped to trading_accounts (myfxbook-linked
-- personal accounts). Copy trades belong to follower_accounts instead, so
-- account_id becomes optional and follower_account_id is added alongside it.
ALTER TABLE public.trade_history ALTER COLUMN account_id DROP NOT NULL;

ALTER TABLE public.trade_history ADD COLUMN IF NOT EXISTS follower_account_id uuid
  REFERENCES public.follower_accounts(id) ON DELETE CASCADE;
ALTER TABLE public.trade_history ADD COLUMN IF NOT EXISTS copy_job_id uuid
  REFERENCES public.copy_jobs(id) ON DELETE SET NULL;
ALTER TABLE public.trade_history ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'master';

DO $$ BEGIN
  ALTER TABLE public.trade_history ADD CONSTRAINT trade_history_source_chk CHECK (source IN ('master','copy'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.trade_history
    ADD CONSTRAINT trade_history_account_ref_chk CHECK (account_id IS NOT NULL OR follower_account_id IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_trade_history_follower_ticket
  ON public.trade_history (follower_account_id, external_ticket) WHERE follower_account_id IS NOT NULL;

-- Fast "does this follower have an open position in symbol X" lookup, used
-- by MODIFY / PARTIAL_CLOSE / FULL_CLOSE events to find the trade to act on.
CREATE INDEX IF NOT EXISTS idx_trade_history_follower_open
  ON public.trade_history (follower_account_id, symbol, open_time DESC) WHERE close_time IS NULL;

-- ---------- 4. MOCK-TESTABLE BALANCE BASELINE ----------
-- Risk engine drawdown/equity-floor checks need real numbers to compare
-- against. Give freshly-connected follower accounts a mock starting balance
-- instead of NULL so those checks are exercisable with $0 real data.
ALTER TABLE public.follower_accounts ALTER COLUMN balance SET DEFAULT 10000;
ALTER TABLE public.follower_accounts ALTER COLUMN equity SET DEFAULT 10000;

UPDATE public.follower_accounts SET balance = 10000 WHERE balance IS NULL;
UPDATE public.follower_accounts SET equity = 10000 WHERE equity IS NULL;

-- ---------- 5. WIRE THE JOB PROCESSOR INTO PG_CRON ----------
-- copy-job-processor previously only ran when an admin clicked "Run
-- Processor Now" in the admin UI — jobs sat pending indefinitely otherwise.
-- Poll it every 10 seconds for Phase 1. At higher throughput this should
-- move to a Postgres LISTEN/NOTIFY-driven worker (trigger on copy_jobs
-- insert -> NOTIFY -> a long-running worker process) or an external queue
-- (e.g. SQS/Cloud Tasks), so jobs are picked up the instant they're created
-- instead of on a polling interval.
--
-- copy-job-processor has verify_jwt = false (see supabase/config.toml),
-- same pattern already used for heartbeat-monitor, so this cron call needs
-- no bearer token at all.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'copy-job-processor-every-10-seconds',
  '10 seconds',
  $$
  SELECT net.http_post(
    url := 'https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1/copy-job-processor',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
