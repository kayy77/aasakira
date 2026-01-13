-- Create cTrader connections table
CREATE TABLE public.ctrader_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accounts JSONB DEFAULT '[]'::jsonb,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ctrader_connections ENABLE ROW LEVEL SECURITY;

-- Users can only view their own connection
CREATE POLICY "Users can view their own cTrader connection"
ON public.ctrader_connections
FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Users can insert their own connection
CREATE POLICY "Users can insert their own cTrader connection"
ON public.ctrader_connections
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own connection
CREATE POLICY "Users can update their own cTrader connection"
ON public.ctrader_connections
FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Users can delete their own connection
CREATE POLICY "Users can delete their own cTrader connection"
ON public.ctrader_connections
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Service role can manage all connections (for edge functions)
CREATE POLICY "Service role can manage cTrader connections"
ON public.ctrader_connections
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ctrader_connections_updated_at
BEFORE UPDATE ON public.ctrader_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_ctrader_connections_user_id ON public.ctrader_connections(user_id);