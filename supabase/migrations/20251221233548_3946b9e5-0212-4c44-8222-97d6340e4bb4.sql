-- Add outcome column to active_trades for proper classification
ALTER TABLE public.active_trades 
ADD COLUMN IF NOT EXISTS outcome text DEFAULT NULL;

-- Add a comment explaining the outcome values
COMMENT ON COLUMN public.active_trades.outcome IS 'Trade outcome: WIN (all TPs hit), PARTIAL (some TPs hit then SL), LOSS (SL hit with no TPs), BE (breakeven)';