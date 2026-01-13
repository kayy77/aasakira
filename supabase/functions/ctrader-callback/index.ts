import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // Contains user_id
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  console.log('🔵 cTrader OAuth callback received:', { code: !!code, state, error });

  if (error) {
    console.error('❌ OAuth error:', error, errorDescription);
    const redirectUrl = `https://aasakira.uk/journal?ctrader_error=${encodeURIComponent(errorDescription || error)}`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': redirectUrl }
    });
  }

  if (!code || !state) {
    console.error('❌ Missing code or state parameter');
    const redirectUrl = `https://aasakira.uk/journal?ctrader_error=missing_parameters`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': redirectUrl }
    });
  }

  try {
    const clientId = Deno.env.get('CTRADER_CLIENT_ID');
    const clientSecret = Deno.env.get('CTRADER_CLIENT_SECRET');
    const redirectUri = 'https://aasakira.uk/api/ctrader/callback';

    if (!clientId || !clientSecret) {
      throw new Error('cTrader credentials not configured');
    }

    // Exchange code for access token
    console.log('🔄 Exchanging code for token...');
    const tokenResponse = await fetch('https://openapi.ctrader.com/apps/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
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
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('❌ Failed to fetch accounts:', errorText);
      throw new Error(`Failed to fetch accounts: ${errorText}`);
    }

    const accountsData = await accountsResponse.json();
    console.log('✅ Accounts fetched:', accountsData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store connection in database
    const { error: insertError } = await supabase
      .from('ctrader_connections')
      .upsert({
        user_id: state,
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

    // Redirect back to journal with success
    const successUrl = `https://aasakira.uk/journal?ctrader_connected=true&accounts=${accountsData.length || 0}`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': successUrl }
    });

  } catch (error) {
    console.error('❌ Error in cTrader callback:', error);
    const errorUrl = `https://aasakira.uk/journal?ctrader_error=${encodeURIComponent(error.message)}`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, 'Location': errorUrl }
    });
  }
});
