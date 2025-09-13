-- Create economic events table
CREATE TABLE public.economic_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL,
  forecast TEXT,
  previous TEXT,
  actual TEXT,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  importance TEXT NOT NULL CHECK (importance IN ('LOW', 'MEDIUM', 'HIGH')),
  category TEXT,
  source TEXT DEFAULT 'trading_economics',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create economic event analysis table for AI insights
CREATE TABLE public.event_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.economic_events(id),
  ai_summary TEXT NOT NULL,
  market_sentiment TEXT NOT NULL CHECK (market_sentiment IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  trade_opportunity TEXT,
  volatility_level TEXT CHECK (volatility_level IN ('LOW', 'MEDIUM', 'HIGH')),
  affected_pairs TEXT[],
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.economic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for economic events (public readable)
CREATE POLICY "Economic events are viewable by everyone" 
ON public.economic_events 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage economic events" 
ON public.economic_events 
FOR ALL 
USING (true);

-- Create policies for event analysis
CREATE POLICY "Event analysis is viewable by everyone" 
ON public.event_analysis 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage event analysis" 
ON public.event_analysis 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_economic_events_time ON public.economic_events(event_time);
CREATE INDEX idx_economic_events_importance ON public.economic_events(importance);
CREATE INDEX idx_economic_events_country ON public.economic_events(country);
CREATE INDEX idx_event_analysis_event_id ON public.event_analysis(event_id);

-- Create function to update timestamps
CREATE TRIGGER update_economic_events_updated_at
BEFORE UPDATE ON public.economic_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_analysis_updated_at
BEFORE UPDATE ON public.event_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();