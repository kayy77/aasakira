-- Update economic_events table with proper structure and indexes
DROP TABLE IF EXISTS economic_events CASCADE;

CREATE TABLE economic_events (
  id bigint generated always as identity primary key,
  event_id text unique,
  title text not null,
  country text,
  currency text,
  impact text, -- Low/Medium/High
  forecast text,
  actual text,
  previous text,
  event_time timestamptz,
  source text,
  relevance numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_economic_events_time ON economic_events (event_time);
CREATE INDEX IF NOT EXISTS idx_economic_events_source ON economic_events (source);
CREATE INDEX IF NOT EXISTS idx_economic_events_currency ON economic_events (currency);
CREATE INDEX IF NOT EXISTS idx_economic_events_impact ON economic_events (impact);

-- Enable RLS
ALTER TABLE economic_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Economic events are viewable by everyone" 
ON economic_events 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage economic events" 
ON economic_events 
FOR ALL 
USING (true);