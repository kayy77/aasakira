
-- Premium: scope insert/update to owner
DROP POLICY IF EXISTS "insert_subscription" ON public."Premium";
DROP POLICY IF EXISTS "update_own_subscription" ON public."Premium";

CREATE POLICY "insert_own_subscription" ON public."Premium"
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public."Premium"
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR email = auth.email())
  WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "service_role_manage_premium" ON public."Premium"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- api_response_audit: remove public SELECT
DROP POLICY IF EXISTS "Audit data is viewable by everyone" ON public.api_response_audit;
DROP POLICY IF EXISTS "Service role can manage audit data" ON public.api_response_audit;
CREATE POLICY "service_role_manage_api_audit" ON public.api_response_audit
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- consensus_audit: restrict to service_role
DROP POLICY IF EXISTS "Service role can manage consensus audit" ON public.consensus_audit;
CREATE POLICY "service_role_manage_consensus_audit" ON public.consensus_audit
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- incoming_signals: restrict to service_role
DROP POLICY IF EXISTS "Service role can manage all signals" ON public.incoming_signals;
CREATE POLICY "service_role_manage_incoming_signals" ON public.incoming_signals
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- signals: remove public insert/update, keep service_role + user SELECT
DROP POLICY IF EXISTS "Service can insert signals for users" ON public.signals;
DROP POLICY IF EXISTS "Service can update signal outcomes" ON public.signals;
DROP POLICY IF EXISTS "Service role can manage all signals" ON public.signals;
CREATE POLICY "service_role_manage_signals" ON public.signals
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- subscription_events: remove public insert
DROP POLICY IF EXISTS "Service can insert subscription events" ON public.subscription_events;
DROP POLICY IF EXISTS "Service role can manage subscription events" ON public.subscription_events;
CREATE POLICY "service_role_manage_subscription_events" ON public.subscription_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- user_profiles: add WITH CHECK on UPDATE to prevent user_id takeover
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
