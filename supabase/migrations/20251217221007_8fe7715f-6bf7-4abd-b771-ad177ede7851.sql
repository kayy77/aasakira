-- Add unique constraint on message_id + channel_id for upsert to work
ALTER TABLE telegram_messages 
ADD CONSTRAINT telegram_messages_message_channel_unique 
UNIQUE (message_id, channel_id);