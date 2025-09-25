-- Create trade_setups table for setup scanner
CREATE TABLE public.trade_setups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('BUY', 'SELL')),
  entry_reason TEXT NOT NULL,
  stop_loss NUMERIC NOT NULL,
  take_profit NUMERIC NOT NULL,
  timeframe TEXT DEFAULT '1H',
  risk_percentage NUMERIC DEFAULT 2.0,
  screenshot_url TEXT,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_feedback JSONB DEFAULT '{}',
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ANALYZED', 'SAVED_TO_JOURNAL')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trade_setups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own setups"
ON public.trade_setups
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setups"
ON public.trade_setups
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setups"
ON public.trade_setups
FOR UPDATE
USING (auth.uid() = user_id);

-- Create storage bucket for setup screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('setup-screenshots', 'setup-screenshots', false);

-- Create storage policies for setup screenshots
CREATE POLICY "Users can view their own setup screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'setup-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own setup screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'setup-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own setup screenshots"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'setup-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own setup screenshots"
ON storage.objects
FOR DELETE
USING (bucket_id = 'setup-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trade_setups_updated_at
BEFORE UPDATE ON public.trade_setups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();