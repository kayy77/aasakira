-- Canonical onboarding / verification state machine
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_state') THEN
    CREATE TYPE public.verification_state AS ENUM (
      'NOT_STARTED',
      'UPLOADED',
      'PENDING_REVIEW',
      'VERIFIED',
      'REJECTED'
    );
  END IF;
END $$;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS verification_uploaded_at timestamptz;

ALTER TABLE public.verification_requests
  ADD COLUMN IF NOT EXISTS uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS verified_by text;

-- Move legacy values into the canonical five-state model before adding constraints.
UPDATE public.user_profiles
SET onboarding_status = CASE
  WHEN onboarding_status IN ('broker_verified', 'trial_active', 'member', 'premium', 'admin', 'VERIFIED') THEN 'VERIFIED'
  WHEN onboarding_status IN ('broker_submitted', 'needs_review', 'submitted', 'PENDING_REVIEW') THEN 'PENDING_REVIEW'
  WHEN onboarding_status IN ('uploaded', 'UPLOADED') THEN 'UPLOADED'
  WHEN onboarding_status IN ('rejected', 'REJECTED') THEN 'REJECTED'
  ELSE 'NOT_STARTED'
END,
verified_at = CASE
  WHEN onboarding_status IN ('broker_verified', 'trial_active', 'member', 'premium', 'admin', 'VERIFIED') THEN COALESCE(verified_at, now())
  ELSE verified_at
END,
verified_by = CASE
  WHEN onboarding_status IN ('broker_verified', 'trial_active', 'member', 'premium', 'admin', 'VERIFIED') THEN COALESCE(verified_by, 'legacy_migration')
  ELSE verified_by
END,
updated_at = now();

UPDATE public.verification_requests
SET review_status = CASE
  WHEN status IN ('broker_verified', 'VERIFIED', 'approved') THEN 'approved'
  WHEN status IN ('needs_review', 'rejected', 'REJECTED') THEN 'rejected'
  WHEN status IN ('broker_submitted', 'submitted', 'PENDING_REVIEW') THEN 'pending_review'
  ELSE review_status
END,
uploaded_at = COALESCE(uploaded_at, created_at),
updated_at = now();

ALTER TABLE public.user_profiles
  ALTER COLUMN onboarding_status SET DEFAULT 'NOT_STARTED';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_onboarding_status_canonical'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_onboarding_status_canonical
      CHECK (onboarding_status IN ('NOT_STARTED', 'UPLOADED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'verification_requests_review_status_valid'
  ) THEN
    ALTER TABLE public.verification_requests
      ADD CONSTRAINT verification_requests_review_status_valid
      CHECK (review_status IN ('not_started', 'uploaded', 'pending_review', 'approved', 'rejected'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.verification_state_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_id uuid,
  from_status text,
  to_status text NOT NULL,
  event text NOT NULL,
  actor text NOT NULL DEFAULT 'system',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.verification_state_events TO authenticated;
GRANT ALL ON public.verification_state_events TO service_role;

ALTER TABLE public.verification_state_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'verification_state_events' AND policyname = 'Users can read their own verification state events'
  ) THEN
    CREATE POLICY "Users can read their own verification state events"
      ON public.verification_state_events
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_verification_state_events_user_created
  ON public.verification_state_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user_created
  ON public.verification_requests (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_verification_state_event(
  p_user_id uuid,
  p_request_id uuid,
  p_from_status text,
  p_to_status text,
  p_event text,
  p_actor text DEFAULT 'system',
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.verification_state_events (
    user_id,
    request_id,
    from_status,
    to_status,
    event,
    actor,
    details
  ) VALUES (
    p_user_id,
    p_request_id,
    p_from_status,
    p_to_status,
    p_event,
    COALESCE(p_actor, 'system'),
    COALESCE(p_details, '{}'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_user_profile_verification_state_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_service boolean := COALESCE(auth.role(), '') = 'service_role';
  v_is_admin boolean := public.has_role(auth.uid(), 'admin');
  v_old_status text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT v_is_service AND NOT v_is_admin THEN
      NEW.onboarding_status := 'NOT_STARTED';
      NEW.verified_at := NULL;
      NEW.verified_by := NULL;
      NEW.rejection_reason := NULL;
      NEW.verification_uploaded_at := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF v_is_service OR v_is_admin THEN
    RETURN NEW;
  END IF;

  IF NEW.onboarding_status IS DISTINCT FROM OLD.onboarding_status
     OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
     OR NEW.verified_by IS DISTINCT FROM OLD.verified_by
     OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
     OR NEW.verification_uploaded_at IS DISTINCT FROM OLD.verification_uploaded_at THEN
    RAISE EXCEPTION 'Verification status is server-managed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_user_profile_verification_state_security_trigger ON public.user_profiles;
CREATE TRIGGER enforce_user_profile_verification_state_security_trigger
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_user_profile_verification_state_security();

-- Durable logs for the backfill/normalization.
INSERT INTO public.verification_state_events (user_id, from_status, to_status, event, actor, details)
SELECT user_id, NULL, onboarding_status, 'state_machine_normalized', 'migration', jsonb_build_object('source', 'legacy_backfill')
FROM public.user_profiles
ON CONFLICT DO NOTHING;