-- Add signal persistence and outcome tracking
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS outcome TEXT DEFAULT 'PENDING';
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS outcome_price NUMERIC;
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS outcome_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS pips_result NUMERIC;
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS rr_achieved NUMERIC;

-- Enable RLS for user-specific signal access
CREATE POLICY "Users can view their own signals" 
ON public.signals 
FOR SELECT 
USING (auth.uid() = user_id OR status = 'APPROVED');

CREATE POLICY "Service can insert signals for users" 
ON public.signals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update signal outcomes" 
ON public.signals 
FOR UPDATE 
USING (true);