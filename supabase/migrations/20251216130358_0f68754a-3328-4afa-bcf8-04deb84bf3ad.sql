-- Create table to store Telegram channel messages
CREATE TABLE public.telegram_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id bigint NOT NULL,
  channel_id bigint NOT NULL,
  raw_text text,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  edited boolean NOT NULL DEFAULT false,
  original_date timestamp with time zone,
  edit_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, channel_id)
);

-- Enable RLS
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

-- Public read access (for displaying signals)
CREATE POLICY "Telegram messages are viewable by everyone" 
ON public.telegram_messages 
FOR SELECT 
USING (true);

-- Service role can manage messages
CREATE POLICY "Service role can manage telegram messages" 
ON public.telegram_messages 
FOR ALL 
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_telegram_messages_channel_timestamp ON public.telegram_messages(channel_id, timestamp DESC);

-- Trigger for updated_at
CREATE TRIGGER update_telegram_messages_updated_at
BEFORE UPDATE ON public.telegram_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();