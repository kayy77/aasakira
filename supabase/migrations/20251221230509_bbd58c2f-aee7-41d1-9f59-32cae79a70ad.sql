-- Add dynamic take_profits column and pips tracking to active_trades
ALTER TABLE public.active_trades 
ADD COLUMN IF NOT EXISTS take_profits jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pips_realized numeric DEFAULT 0;