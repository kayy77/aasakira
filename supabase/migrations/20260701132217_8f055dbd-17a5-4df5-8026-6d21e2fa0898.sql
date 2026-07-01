-- 1. Extend user_profiles with lifecycle fields
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_status  text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS onboarding_step    int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trader_type        text,
  ADD COLUMN IF NOT EXISTS trial_started_at   timestamptz;

-- Grandfather existing premium users
UPDATE public.user_profiles
   SET onboarding_status = 'premium'
 WHERE COALESCE(is_premium, false) = true
   AND onboarding_status = 'pending';

-- 2. Verification requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  status      text NOT NULL DEFAULT 'submitted',
  broker      text,
  notes       text,
  reviewer_id uuid,
  reviewed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.verification_requests TO authenticated;
GRANT ALL ON public.verification_requests TO service_role;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own requests read"    ON public.verification_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own requests insert"  ON public.verification_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin update requests" ON public.verification_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_verification_requests_updated
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Verification screenshots (evidence uploads)
CREATE TABLE IF NOT EXISTS public.verification_screenshots (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     uuid NOT NULL REFERENCES public.verification_requests(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL,
  kind           text NOT NULL,           -- broker_signup | deposit_proof | id_document | other
  storage_path   text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.verification_screenshots TO authenticated;
GRANT ALL ON public.verification_screenshots TO service_role;
ALTER TABLE public.verification_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own screenshots read"   ON public.verification_screenshots FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own screenshots insert" ON public.verification_screenshots FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own screenshots delete" ON public.verification_screenshots FOR DELETE TO authenticated USING (user_id = auth.uid());