-- Add thread_id and reply tracking to telegram_messages
ALTER TABLE telegram_messages 
ADD COLUMN IF NOT EXISTS thread_id bigint,
ADD COLUMN IF NOT EXISTS reply_to_message_id bigint;

-- Create active_trades table for tracking live trades
CREATE TABLE IF NOT EXISTS active_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_message_id uuid REFERENCES telegram_messages(id),
  original_message_id bigint NOT NULL,
  channel_id bigint NOT NULL,
  
  -- Trade details
  pair text NOT NULL,
  direction text NOT NULL,
  entry_price numeric,
  stop_loss numeric,
  tp1 numeric,
  tp2 numeric,
  tp3 numeric,
  
  -- Status tracking
  tp1_hit boolean DEFAULT false,
  tp2_hit boolean DEFAULT false,
  tp3_hit boolean DEFAULT false,
  be_activated boolean DEFAULT false,
  
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'STOPPED_OUT')),
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  
  raw_text text
);

-- Enable RLS
ALTER TABLE active_trades ENABLE ROW LEVEL SECURITY;

-- Create policies for active_trades
CREATE POLICY "Active trades are viewable by everyone" 
ON active_trades FOR SELECT USING (true);

CREATE POLICY "Service role can manage active trades" 
ON active_trades FOR ALL USING (true);

-- Add index for quick lookup of active trade
CREATE INDEX idx_active_trades_status ON active_trades(status);
CREATE INDEX idx_active_trades_original_message ON active_trades(original_message_id, channel_id);

-- Enable realtime for active_trades
ALTER PUBLICATION supabase_realtime ADD TABLE active_trades;