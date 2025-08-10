-- Create signals table with audit columns for comprehensive signal tracking
CREATE TABLE public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('BUY', 'SELL')),
  entry_price DECIMAL,
  stop_loss DECIMAL,
  take_profit DECIMAL,
  risk_reward_ratio DECIMAL,
  confidence DECIMAL CHECK (confidence >= 0 AND confidence <= 100),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WEAK')),
  ui_label TEXT,
  rejection_reasons TEXT[],
  
  -- AI Consensus Data
  ai_votes JSONB DEFAULT '[]'::jsonb,
  raw_ai_responses JSONB DEFAULT '[]'::jsonb,
  consensus JSONB DEFAULT '{}'::jsonb,
  weighted_ai_score INTEGER DEFAULT 0,
  max_ai_score INTEGER DEFAULT 0,
  
  -- Filter & Strategy Data
  filters JSONB DEFAULT '[]'::jsonb,
  strategy_results JSONB DEFAULT '[]'::jsonb,
  confluence_bucket INTEGER DEFAULT 0,
  
  -- Decision Audit
  decision JSONB DEFAULT '{}'::jsonb,
  expected_value DECIMAL,
  
  -- Metadata
  session_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_signals_created_at ON public.signals(created_at DESC),
  INDEX idx_signals_status ON public.signals(status),
  INDEX idx_signals_pair ON public.signals(pair),
  INDEX idx_signals_confluence_bucket ON public.signals(confluence_bucket)
);

-- Create consensus audit table for debugging
CREATE TABLE public.consensus_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES public.signals(id) ON DELETE CASCADE,
  request_payload JSONB NOT NULL,
  raw_response JSONB,
  parse_time_ms INTEGER,
  latency_ms INTEGER,
  status TEXT NOT NULL,
  provider_name TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_consensus_audit_signal_id ON public.consensus_audit(signal_id),
  INDEX idx_consensus_audit_created_at ON public.consensus_audit(created_at DESC),
  INDEX idx_consensus_audit_provider ON public.consensus_audit(provider_name)
);

-- Enable RLS
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consensus_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signals (users can view approved signals, admins can see all)
CREATE POLICY "Users can view approved signals" 
ON public.signals FOR SELECT 
USING (status = 'APPROVED');

CREATE POLICY "Service role can manage all signals" 
ON public.signals FOR ALL 
USING (true);

-- RLS Policies for consensus audit (admin only)
CREATE POLICY "Service role can manage consensus audit" 
ON public.consensus_audit FOR ALL 
USING (true);

-- Update trigger for signals
CREATE TRIGGER update_signals_updated_at
  BEFORE UPDATE ON public.signals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();