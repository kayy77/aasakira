-- Add Telegram linking columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_id bigint UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_username text,
ADD COLUMN IF NOT EXISTS telegram_link_code text,
ADD COLUMN IF NOT EXISTS telegram_link_expires timestamp with time zone;

-- Create index for faster lookup by telegram_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram_id ON public.user_profiles(telegram_id);

-- Create index for code lookup during linking
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram_link_code ON public.user_profiles(telegram_link_code) WHERE telegram_link_code IS NOT NULL;