-- Add premium and Stripe fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS plan_type TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Create index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON public.user_profiles(stripe_customer_id);

-- Create subscription events audit table
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_event_id TEXT,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on subscription_events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own events
CREATE POLICY "Users can view own subscription events" 
ON public.subscription_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for service role to insert events
CREATE POLICY "Service can insert subscription events" 
ON public.subscription_events 
FOR INSERT 
WITH CHECK (true);