CREATE TABLE public.academy_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track text NOT NULL,
  lesson_id text NOT NULL,
  step_index integer NOT NULL,
  step_text text NOT NULL,
  note text NOT NULL DEFAULT '',
  trade_key text,
  trade_label text,
  trade_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, track, lesson_id, step_index)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_journal TO authenticated;
GRANT ALL ON public.academy_journal TO service_role;
ALTER TABLE public.academy_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own academy journal" ON public.academy_journal FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_academy_journal_updated_at BEFORE UPDATE ON public.academy_journal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();