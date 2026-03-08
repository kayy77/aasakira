const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');

  if (!botToken || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Missing env vars' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook`;

  // Set the webhook
  const setRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  });

  const setResult = await setRes.json();

  // Get webhook info
  const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
  const infoResult = await infoRes.json();

  return new Response(
    JSON.stringify({
      set_webhook: setResult,
      webhook_info: infoResult,
      configured_url: webhookUrl,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
