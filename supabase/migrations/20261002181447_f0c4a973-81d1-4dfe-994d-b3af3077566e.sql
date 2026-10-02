ALTER TABLE public.academy_progress
  ADD COLUMN IF NOT EXISTS task_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS task_source text,
  ADD COLUMN IF NOT EXISTS task_evidence jsonb;