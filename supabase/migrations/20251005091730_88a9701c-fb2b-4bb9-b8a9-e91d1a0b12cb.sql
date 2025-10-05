-- Add missing fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS plan_type text,
ADD COLUMN IF NOT EXISTS trial_end timestamptz,
ADD COLUMN IF NOT EXISTS premium_expires_at timestamptz;

-- Create subscription events audit table
CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_event_id text UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on subscription_events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage subscription events
CREATE POLICY "Service role can manage subscription events"
ON subscription_events
FOR ALL
USING (true);

-- Create user_usage table for tracking feature usage
CREATE TABLE IF NOT EXISTS user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  usage_count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature, usage_date)
);

-- Enable RLS on user_usage
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view their own usage"
ON user_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Service role can manage usage
CREATE POLICY "Service role can manage usage"
ON user_usage
FOR ALL
USING (true);

-- Function to check and increment usage
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id uuid,
  p_feature text,
  p_daily_limit integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_usage integer;
  v_is_premium boolean;
BEGIN
  -- Check if user is premium
  SELECT status = 'active' INTO v_is_premium
  FROM subscriptions
  WHERE user_id = p_user_id
  LIMIT 1;

  -- Premium users have unlimited access
  IF v_is_premium THEN
    RETURN jsonb_build_object('allowed', true, 'is_premium', true, 'remaining', -1);
  END IF;

  -- Get current usage for today
  SELECT COALESCE(usage_count, 0) INTO v_current_usage
  FROM user_usage
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND usage_date = CURRENT_DATE;

  -- Check if limit exceeded
  IF v_current_usage >= p_daily_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'is_premium', false,
      'remaining', 0,
      'limit', p_daily_limit
    );
  END IF;

  -- Increment usage
  INSERT INTO user_usage (user_id, feature, usage_date, usage_count)
  VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature, usage_date)
  DO UPDATE SET
    usage_count = user_usage.usage_count + 1,
    updated_at = now();

  RETURN jsonb_build_object(
    'allowed', true,
    'is_premium', false,
    'remaining', p_daily_limit - (v_current_usage + 1),
    'limit', p_daily_limit
  );
END;
$$;