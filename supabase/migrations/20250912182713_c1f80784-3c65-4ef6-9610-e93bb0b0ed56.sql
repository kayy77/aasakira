-- Add missing fields to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN lot_size DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN fees DECIMAL(10,2) DEFAULT 0,
ADD COLUMN feelings TEXT DEFAULT NULL,
ADD COLUMN mistakes TEXT DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.journal_entries.lot_size IS 'Position size for calculating actual P&L';
COMMENT ON COLUMN public.journal_entries.fees IS 'Trading fees/commission';
COMMENT ON COLUMN public.journal_entries.feelings IS 'Emotional state during trade';
COMMENT ON COLUMN public.journal_entries.mistakes IS 'Lessons learned or mistakes made';