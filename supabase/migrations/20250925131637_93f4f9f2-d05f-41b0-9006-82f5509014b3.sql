-- Add entry_price column to trade_setups table
ALTER TABLE public.trade_setups 
ADD COLUMN entry_price NUMERIC;