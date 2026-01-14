import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const FALLBACK_ORIGIN = 'https://aasakira.lovable.app';
const ALLOWED_ORIGINS = new Set<string>([
  FALLBACK_ORIGIN,
  'https://id-preview--57fa0788-a98e-40af-8b0d-0f179f03c633.lovable.app',
]);

function fromBase64Url(input: string) {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return atob(b64);
}

function parseState(stateRaw: string | null): { userId: string | null; origin: string } {
  if (!stateRaw) return { userId: null, origin: FALLBACK_ORIGIN };

  // Backwards compatible: state used to be user_id
  let userId: string | null = stateRaw;
  let origin = FALLBACK_ORIGIN;

  try {
    const decoded = fromBase64Url(stateRaw);
    const parsed = JSON.parse(decoded);
    if (parsed?.uid && typeof parsed.uid === 'string') userId = parsed.uid;
    if (parsed?.r && typeof parsed.r === 'string' && ALLOWED_ORIGINS.has(parsed.r)) {
      origin = parsed.r;
    }
  } catch {
    // ignore
  }

  return { userId, origin };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateRaw = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  const { userId, origin } = parseState(stateRaw);

  console.log('🔵 cTrader OAuth callback received:', { code: !!code, hasState: !!stateRaw, error });

  if (error) {
    console.error('❌ OAuth error:', error, errorDescription);
    const redirectUrl = `${origin}/journal?ctrader_error=${encodeURIComponent(errorDescription || error)}`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': redirectUrl },
    });
  }

  if (!code || !userId) {
    console.error('❌ Missing code or state parameter');
    const redirectUrl = `${origin}/journal?ctrader_error=missing_parameters`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': redirectUrl },
    });
  }

  try {
    const clientId = Deno.env.get('CTRADER_CLIENT_ID');
    const clientSecret = Deno.env.get('CTRADER_CLIENT_SECRET');
    const redirectUri = 'https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1/ctrader-callback';

    if (!clientId || !clientSecret) {
      throw new Error('cTrader credentials not configured');
    }

    // Exchange code for access token
    console.log('🔄 Exchanging code for token...');
    const tokenResponse = await fetch('https://openapi.ctrader.com/apps/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtained successfully');

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;

    // Fetch trading accounts
    console.log('🔄 Fetching trading accounts...');
    const accountsResponse = await fetch('https://api.spotware.com/connect/tradingaccounts', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('❌ Failed to fetch accounts:', errorText);
      throw new Error(`Failed to fetch accounts: ${errorText}`);
    }

    const accountsData = await accountsResponse.json();
    const accountsCount = Array.isArray(accountsData) ? accountsData.length : (accountsData?.length || 0);
    console.log('✅ Accounts fetched:', accountsCount);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store connection in database
    const { error: insertError } = await supabase
      .from('ctrader_connections')
      .upsert({
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        accounts: accountsData,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (insertError) {
      console.error('❌ Failed to store connection:', insertError);
      throw insertError;
    }

    console.log('✅ Connection stored successfully');

    const successUrl = `${origin}/journal?ctrader_connected=true&accounts=${accountsCount}`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': successUrl },
    });
  } catch (error) {
    console.error('❌ Error in cTrader callback:', error);
    const errorUrl = `${origin}/journal?ctrader_error=${encodeURIComponent(error.message)}`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': errorUrl },
    });
  }
});
