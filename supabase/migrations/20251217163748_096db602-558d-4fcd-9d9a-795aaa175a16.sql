-- Create table for normalized/parsed trading signals
CREATE TABLE public.parsed_signals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_message_id uuid REFERENCES public.telegram_messages(id) ON DELETE CASCADE,
  raw_text text NOT NULL,
  
  -- Parsed signal data
  symbol text,
  direction text, -- BUY or SELL
  entry_price numeric,
  stop_loss numeric,
  take_profit_levels numeric[], -- Array of TP levels
  
  -- Parsing metadata
  status text NOT NULL DEFAULT 'PENDING', -- PARSED, REJECTED, PENDING
  rejection_reason text,
  confidence numeric,
  parsed_at timestamp with time zone,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parsed_signals ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Parsed signals are viewable by everyone" 
ON public.parsed_signals 
FOR SELECT 
USING (true);

-- Service role can manage
CREATE POLICY "Service role can manage parsed signals" 
ON public.parsed_signals 
FOR ALL 
USING (true);

-- Indexes for efficient queries
CREATE INDEX idx_parsed_signals_status ON public.parsed_signals(status);
CREATE INDEX idx_parsed_signals_symbol ON public.parsed_signals(symbol);
CREATE INDEX idx_parsed_signals_created ON public.parsed_signals(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_parsed_signals_updated_at
BEFORE UPDATE ON public.parsed_signals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();