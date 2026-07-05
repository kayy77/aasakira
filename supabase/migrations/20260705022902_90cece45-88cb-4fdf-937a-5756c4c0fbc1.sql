
-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.copy_mode AS ENUM ('fixed_lot','risk_percent','balance_multiplier');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.copy_relationship_status AS ENUM ('active','paused','stopped');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.copy_event_type AS ENUM ('OPEN','MODIFY','PARTIAL_CLOSE','FULL_CLOSE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.copy_job_status AS ENUM ('pending','processing','completed','failed','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.follower_conn_status AS ENUM ('connected','connecting','syncing','disconnected','error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ MASTER ACCOUNTS ============
CREATE TABLE public.master_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  broker text,
  server text,
  account_number text,
  status text NOT NULL DEFAULT 'active',
  balance numeric,
  equity numeric,
  growth numeric,
  drawdown numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.master_accounts TO authenticated;
GRANT ALL ON public.master_accounts TO service_role;
ALTER TABLE public.master_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view masters" ON public.master_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage masters" ON public.master_accounts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ FOLLOWER ACCOUNTS ============
CREATE TABLE public.follower_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number text NOT NULL,
  server text NOT NULL,
  broker text,
  encrypted_password bytea,
  encryption_iv bytea,
  connection_status public.follower_conn_status NOT NULL DEFAULT 'connecting',
  last_sync_at timestamptz,
  last_error text,
  balance numeric,
  equity numeric,
  currency text DEFAULT 'USD',
  leverage integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follower_accounts TO authenticated;
GRANT ALL ON public.follower_accounts TO service_role;
ALTER TABLE public.follower_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own follower accounts" ON public.follower_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all follower accounts" ON public.follower_accounts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ============ COPY RELATIONSHIPS ============
CREATE TABLE public.copy_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_account_id uuid NOT NULL REFERENCES public.master_accounts(id) ON DELETE CASCADE,
  follower_account_id uuid NOT NULL REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  copy_mode public.copy_mode NOT NULL DEFAULT 'fixed_lot',
  copy_config jsonb NOT NULL DEFAULT '{"lot_size":0.01}'::jsonb,
  status public.copy_relationship_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (master_account_id, follower_account_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copy_relationships TO authenticated;
GRANT ALL ON public.copy_relationships TO service_role;
ALTER TABLE public.copy_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own copy relationships" ON public.copy_relationships FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all copy relationships" ON public.copy_relationships FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ============ COPY EVENTS ============
CREATE TABLE public.copy_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_account_id uuid NOT NULL REFERENCES public.master_accounts(id) ON DELETE CASCADE,
  event_type public.copy_event_type NOT NULL,
  master_ticket text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.copy_events TO authenticated;
GRANT ALL ON public.copy_events TO service_role;
ALTER TABLE public.copy_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view copy events" ON public.copy_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage copy events" ON public.copy_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ COPY JOBS ============
CREATE TABLE public.copy_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_event_id uuid NOT NULL REFERENCES public.copy_events(id) ON DELETE CASCADE,
  copy_relationship_id uuid NOT NULL REFERENCES public.copy_relationships(id) ON DELETE CASCADE,
  follower_account_id uuid NOT NULL REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.copy_job_status NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  planned_volume numeric,
  executed_volume numeric,
  executed_price numeric,
  broker_ticket text,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_copy_jobs_status ON public.copy_jobs(status) WHERE status IN ('pending','processing');
GRANT SELECT ON public.copy_jobs TO authenticated;
GRANT ALL ON public.copy_jobs TO service_role;
ALTER TABLE public.copy_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own copy jobs" ON public.copy_jobs FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ COPY ACTIVITY ============
CREATE TABLE public.copy_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_account_id uuid REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  master_account_id uuid REFERENCES public.master_accounts(id) ON DELETE SET NULL,
  copy_job_id uuid REFERENCES public.copy_jobs(id) ON DELETE SET NULL,
  action text NOT NULL,
  symbol text,
  volume numeric,
  price numeric,
  result text,
  pnl numeric,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_copy_activity_user ON public.copy_activity(user_id, occurred_at DESC);
GRANT SELECT ON public.copy_activity TO authenticated;
GRANT ALL ON public.copy_activity TO service_role;
ALTER TABLE public.copy_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own copy activity" ON public.copy_activity FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ EXECUTION LOGS ============
CREATE TABLE public.execution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_job_id uuid REFERENCES public.copy_jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_exec_logs_job ON public.execution_logs(copy_job_id);
GRANT SELECT ON public.execution_logs TO authenticated;
GRANT ALL ON public.execution_logs TO service_role;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own execution logs" ON public.execution_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ RISK PROFILES ============
CREATE TABLE public.risk_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_account_id uuid NOT NULL UNIQUE REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_daily_drawdown_pct numeric NOT NULL DEFAULT 5,
  max_drawdown_pct numeric NOT NULL DEFAULT 15,
  max_lot_size numeric NOT NULL DEFAULT 1.0,
  max_open_trades integer NOT NULL DEFAULT 10,
  min_margin_level numeric NOT NULL DEFAULT 200,
  equity_floor numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_profiles TO authenticated;
GRANT ALL ON public.risk_profiles TO service_role;
ALTER TABLE public.risk_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own risk profile" ON public.risk_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ COPY SETTINGS ============
CREATE TABLE public.copy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_account_id uuid NOT NULL UNIQUE REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_pause_on_drawdown boolean NOT NULL DEFAULT true,
  notifications jsonb NOT NULL DEFAULT '{"email":true,"telegram":false}'::jsonb,
  whitelist_symbols text[] DEFAULT '{}',
  blacklist_symbols text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copy_settings TO authenticated;
GRANT ALL ON public.copy_settings TO service_role;
ALTER TABLE public.copy_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own copy settings" ON public.copy_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ SYNC STATUS ============
CREATE TABLE public.sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_account_id uuid NOT NULL UNIQUE REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_heartbeat timestamptz,
  latency_ms integer,
  error_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.sync_status TO authenticated;
GRANT ALL ON public.sync_status TO service_role;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sync status" ON public.sync_status FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ TRADE MODIFICATIONS & CLOSURES ============
CREATE TABLE public.trade_modifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_job_id uuid REFERENCES public.copy_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_ticket text,
  old_sl numeric, new_sl numeric,
  old_tp numeric, new_tp numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trade_modifications TO authenticated;
GRANT ALL ON public.trade_modifications TO service_role;
ALTER TABLE public.trade_modifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own modifications" ON public.trade_modifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.trade_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_job_id uuid REFERENCES public.copy_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_ticket text,
  close_type text NOT NULL,
  volume_closed numeric,
  close_price numeric,
  pnl numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trade_closures TO authenticated;
GRANT ALL ON public.trade_closures TO service_role;
ALTER TABLE public.trade_closures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own closures" ON public.trade_closures FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ AI HOOK TABLES ============
CREATE TABLE public.ai_copy_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_account_id uuid REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_copy_insights TO authenticated;
GRANT ALL ON public.ai_copy_insights TO service_role;
ALTER TABLE public.ai_copy_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own copy insights" ON public.ai_copy_insights FOR SELECT TO authenticated USING (auth.uid()=user_id);

CREATE TABLE public.ai_risk_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_account_id uuid REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_risk_reports TO authenticated;
GRANT ALL ON public.ai_risk_reports TO service_role;
ALTER TABLE public.ai_risk_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own risk reports" ON public.ai_risk_reports FOR SELECT TO authenticated USING (auth.uid()=user_id);

CREATE TABLE public.ai_trader_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_account_id uuid REFERENCES public.follower_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_trader_scores TO authenticated;
GRANT ALL ON public.ai_trader_scores TO service_role;
ALTER TABLE public.ai_trader_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own trader scores" ON public.ai_trader_scores FOR SELECT TO authenticated USING (auth.uid()=user_id);

-- ============ UPDATED_AT TRIGGERS ============
CREATE TRIGGER trg_master_accounts_updated BEFORE UPDATE ON public.master_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_follower_accounts_updated BEFORE UPDATE ON public.follower_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_copy_relationships_updated BEFORE UPDATE ON public.copy_relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_copy_jobs_updated BEFORE UPDATE ON public.copy_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_risk_profiles_updated BEFORE UPDATE ON public.risk_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_copy_settings_updated BEFORE UPDATE ON public.copy_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
