-- Add email and weekly_email_enabled to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS weekly_email_enabled BOOLEAN DEFAULT true;

-- Create index for efficient querying of subscribed users
CREATE INDEX IF NOT EXISTS idx_user_profiles_weekly_email 
ON public.user_profiles (weekly_email_enabled) 
WHERE weekly_email_enabled = true;