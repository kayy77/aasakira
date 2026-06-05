
-- ============================================================
-- 1. ROLES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('member', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-assign 'member' on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- ============================================================
-- 2. TRADING ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trading_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'myfxbook',   -- myfxbook | mt5 | mt4 | ctrader | tradelocker
  provider_account_id text,                     -- e.g. myfxbook account id
  account_name text NOT NULL,
  account_login text,
  broker text,
  server text,
  currency text DEFAULT 'USD',
  leverage int,
  status text NOT NULL DEFAULT 'connecting',    -- connecting | active | error | disconnected
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_accounts TO authenticated;
GRANT ALL ON public.trading_accounts TO service_role;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ta_owner_all" ON public.trading_accounts;
CREATE POLICY "ta_owner_all" ON public.trading_accounts
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ta_admin_read" ON public.trading_accounts;
CREATE POLICY "ta_admin_read" ON public.trading_accounts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_trading_accounts_user ON public.trading_accounts(user_id);

CREATE TRIGGER trg_trading_accounts_updated
  BEFORE UPDATE ON public.trading_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 3. ACCOUNT SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.account_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric,
  equity numeric,
  open_pl numeric,
  growth_pct numeric,
  abs_gain_pct numeric,
  daily_pct numeric,
  monthly_pct numeric,
  drawdown_pct numeric,
  profit numeric,
  captured_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_snapshots TO authenticated;
GRANT ALL ON public.account_snapshots TO service_role;
ALTER TABLE public.account_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "snap_owner_all" ON public.account_snapshots;
CREATE POLICY "snap_owner_all" ON public.account_snapshots
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_snap_account_time ON public.account_snapshots(account_id, captured_at DESC);

-- ============================================================
-- 4. TRADE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trade_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_ticket text,
  symbol text,
  side text,            -- buy | sell
  lots numeric,
  open_price numeric,
  close_price numeric,
  open_time timestamptz,
  close_time timestamptz,
  pips numeric,
  profit numeric,
  commission numeric,
  swap numeric,
  comment text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, external_ticket)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trade_history TO authenticated;
GRANT ALL ON public.trade_history TO service_role;
ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "th_owner_all" ON public.trade_history;
CREATE POLICY "th_owner_all" ON public.trade_history
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_trade_history_account ON public.trade_history(account_id, close_time DESC);

-- ============================================================
-- 5. PERFORMANCE METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL DEFAULT 'all',  -- all | 30d | 7d | today
  trades int DEFAULT 0,
  wins int DEFAULT 0,
  losses int DEFAULT 0,
  win_rate numeric,
  profit_factor numeric,
  avg_win numeric,
  avg_loss numeric,
  best_trade numeric,
  worst_trade numeric,
  total_pips numeric,
  total_profit numeric,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, period)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_metrics TO authenticated;
GRANT ALL ON public.performance_metrics TO service_role;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pm_owner_all" ON public.performance_metrics;
CREATE POLICY "pm_owner_all" ON public.performance_metrics
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. AI INFRASTRUCTURE (scaffolding only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  kind text NOT NULL,           -- pattern | risk | session | psychology | other
  title text NOT NULL,
  body text,
  score numeric,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_insights TO authenticated;
GRANT ALL ON public.ai_insights TO service_role;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_owner_all" ON public.ai_insights;
CREATE POLICY "ai_owner_all" ON public.ai_insights
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.trader_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  breakdown jsonb,
  computed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trader_scores TO authenticated;
GRANT ALL ON public.trader_scores TO service_role;
ALTER TABLE public.trader_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ts_owner_all" ON public.trader_scores;
CREATE POLICY "ts_owner_all" ON public.trader_scores
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  summary text,
  metrics jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reviews TO authenticated;
GRANT ALL ON public.weekly_reviews TO service_role;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr_owner_all" ON public.weekly_reviews;
CREATE POLICY "wr_owner_all" ON public.weekly_reviews
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.daily_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  review_date date NOT NULL,
  summary text,
  metrics jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, review_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_reviews TO authenticated;
GRANT ALL ON public.daily_reviews TO service_role;
ALTER TABLE public.daily_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dr_owner_all" ON public.daily_reviews;
CREATE POLICY "dr_owner_all" ON public.daily_reviews
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
