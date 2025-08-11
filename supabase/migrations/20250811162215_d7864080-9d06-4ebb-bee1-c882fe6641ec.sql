-- Add new columns to signals table for enhanced orchestrator
ALTER TABLE signals
  ADD COLUMN IF NOT EXISTS raw_ai_responses jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS consensus jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS filters jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS strategy_results jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS decision jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}'::jsonb;

-- Create consensus audit table for provider tracking
CREATE TABLE IF NOT EXISTS consensus_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id uuid REFERENCES signals(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  provider_name text NOT NULL,
  request_payload jsonb NOT NULL,
  raw_response jsonb,
  status text NOT NULL,
  latency_ms integer,
  error_message text
);

-- Enable RLS on consensus_audit
ALTER TABLE consensus_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage consensus audit
CREATE POLICY "Service role can manage consensus audit" 
ON consensus_audit 
FOR ALL 
USING (true);