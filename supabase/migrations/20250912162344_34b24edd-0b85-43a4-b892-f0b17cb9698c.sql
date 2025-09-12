-- Create table for storing incoming signals from ManyChat and other sources
CREATE TABLE public.incoming_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.incoming_signals ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (for edge function)
CREATE POLICY "Service role can manage all signals"
ON public.incoming_signals
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_incoming_signals_updated_at
BEFORE UPDATE ON public.incoming_signals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();