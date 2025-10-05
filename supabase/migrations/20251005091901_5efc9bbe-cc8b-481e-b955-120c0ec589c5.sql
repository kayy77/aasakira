-- Fix search_path for the check_and_increment_usage function
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id uuid,
  p_feature text,
  p_daily_limit integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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