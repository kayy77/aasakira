-- Create tables for data verification and heartbeat monitoring

-- Data source heartbeat tracking
CREATE TABLE IF NOT EXISTS public.data_source_heartbeat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,
  last_check TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'FAILED', 'DEGRADED')),
  error_message TEXT,
  events_count INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event verification and cross-checking
CREATE TABLE IF NOT EXISTS public.event_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_title TEXT NOT NULL,
  event_currency TEXT NOT NULL,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  matches_count INTEGER NOT NULL DEFAULT 1,
  sources TEXT[] NOT NULL DEFAULT '{}',
  conflicts TEXT[] DEFAULT '{}',
  consensus_score NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (consensus_score >= 0 AND consensus_score <= 1),
  forecast_value TEXT,
  previous_value TEXT,
  actual_value TEXT,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API response audit trail
CREATE TABLE IF NOT EXISTS public.api_response_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  http_status INTEGER,
  response_size_bytes INTEGER,
  response_time_ms INTEGER,
  events_parsed INTEGER DEFAULT 0,
  raw_sample JSONB, -- Store sample of raw response for debugging
  success BOOLEAN NOT NULL DEFAULT false,
  error_details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_source_heartbeat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_response_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for transparency)
CREATE POLICY "Heartbeat data is viewable by everyone" 
ON public.data_source_heartbeat 
FOR SELECT 
USING (true);

CREATE POLICY "Verification data is viewable by everyone" 
ON public.event_verification 
FOR SELECT 
USING (true);

CREATE POLICY "Audit data is viewable by everyone" 
ON public.api_response_audit 
FOR SELECT 
USING (true);

-- Service role can manage all verification data
CREATE POLICY "Service role can manage heartbeat data" 
ON public.data_source_heartbeat 
FOR ALL 
USING (true);

CREATE POLICY "Service role can manage verification data" 
ON public.event_verification 
FOR ALL 
USING (true);

CREATE POLICY "Service role can manage audit data" 
ON public.api_response_audit 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_heartbeat_source ON public.data_source_heartbeat(source_name);
CREATE INDEX IF NOT EXISTS idx_heartbeat_check_time ON public.data_source_heartbeat(last_check DESC);
CREATE INDEX IF NOT EXISTS idx_verification_event ON public.event_verification(event_title, event_currency, event_time);
CREATE INDEX IF NOT EXISTS idx_verification_score ON public.event_verification(consensus_score DESC);
CREATE INDEX IF NOT EXISTS idx_audit_source_time ON public.api_response_audit(source_name, timestamp DESC);

-- Create function to update heartbeat timestamps
CREATE OR REPLACE FUNCTION public.update_heartbeat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for heartbeat table
DROP TRIGGER IF EXISTS update_heartbeat_updated_at_trigger ON public.data_source_heartbeat;
CREATE TRIGGER update_heartbeat_updated_at_trigger
BEFORE UPDATE ON public.data_source_heartbeat
FOR EACH ROW
EXECUTE FUNCTION public.update_heartbeat_updated_at();