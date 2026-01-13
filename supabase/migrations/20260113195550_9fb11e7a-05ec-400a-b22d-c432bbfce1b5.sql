-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage cTrader connections" ON public.ctrader_connections;