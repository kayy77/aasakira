-- Create signal outcomes table for learning feedback
CREATE TABLE IF NOT EXISTS signal_outcomes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id text NOT NULL UNIQUE,
  pair text NOT NULL,
  direction text NOT NULL,
  entry_price numeric NOT NULL,
  stop_loss numeric NOT NULL,
  take_profit numeric NOT NULL,
  entry_time timestamp with time zone NOT NULL,
  outcome text DEFAULT 'PENDING',
  exit_price numeric,
  exit_time timestamp with time zone,
  pips_gained numeric,
  rr_achieved numeric,
  duration_hours integer,
  ai_votes jsonb NOT NULL DEFAULT '[]'::jsonb,
  confluence_score numeric NOT NULL,
  session_type text NOT NULL,
  strategy_used text[] DEFAULT '{}',
  market_conditions jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create learning metrics table for storing AI performance data
CREATE TABLE IF NOT EXISTS learning_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metrics jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE signal_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for service role to manage learning data
CREATE POLICY "Service role can manage signal outcomes" 
ON signal_outcomes 
FOR ALL 
USING (true);

CREATE POLICY "Service role can manage learning metrics" 
ON learning_metrics 
FOR ALL 
USING (true);

-- Create index for efficient learning queries
CREATE INDEX IF NOT EXISTS idx_signal_outcomes_outcome ON signal_outcomes(outcome);
CREATE INDEX IF NOT EXISTS idx_signal_outcomes_session ON signal_outcomes(session_type);
CREATE INDEX IF NOT EXISTS idx_signal_outcomes_pair ON signal_outcomes(pair);
CREATE INDEX IF NOT EXISTS idx_signal_outcomes_created_at ON signal_outcomes(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_signal_outcomes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_signal_outcomes_updated_at
  BEFORE UPDATE ON signal_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_signal_outcomes_updated_at();