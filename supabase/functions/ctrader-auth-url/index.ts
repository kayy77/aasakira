import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function toBase64Url(input: string) {
  const b64 = btoa(input);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, redirectTo } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientId = Deno.env.get('CTRADER_CLIENT_ID');
    if (!clientId) {
      console.error('❌ CTRADER_CLIENT_ID not configured');
      return new Response(JSON.stringify({ error: 'cTrader integration not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const redirectUri = 'https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1/ctrader-callback';
    const scope = 'trading accounts';

    const statePayload = {
      uid: userId,
      r: typeof redirectTo === 'string' ? redirectTo : undefined,
      ts: Date.now(),
    };

    const state = toBase64Url(JSON.stringify(statePayload));

    const authUrl = `https://openapi.ctrader.com/apps/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

    console.log('🔗 Generated cTrader auth URL');

    return new Response(JSON.stringify({ authUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error generating auth URL:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
