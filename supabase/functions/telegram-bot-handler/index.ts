import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Missing TELEGRAM_BOT_TOKEN');
      return new Response(
        JSON.stringify({ success: false, error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const update = await req.json();
    console.log('📨 Bot received update:', JSON.stringify(update, null, 2));

    const message = update.message;
    if (!message || !message.text) {
      return new Response(
        JSON.stringify({ success: true, message: 'No text message' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const chatId = message.chat.id;
    const telegramId = message.from.id;
    const telegramUsername = message.from.username || null;
    const text = message.text.trim();

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
        `🏯 Welcome to Aasakira Trading AI!\n\n` +
        `I'm your personal trading mentor with memory.\n\n` +
        `To get started, link your account:\n` +
        `1. Go to aasakira.uk and sign in\n` +
        `2. Go to Profile → Link Telegram\n` +
        `3. Send me the code: /link AAS-XXXX\n\n` +
        `Once linked, you can:\n` +
        `• Journal trades via chat\n` +
        `• Get AI coaching with full history\n` +
        `• Receive personalized signals`
      );
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle /link command
    if (text.startsWith('/link ')) {
      const code = text.replace('/link ', '').trim().toUpperCase();
      
      console.log(`🔗 Link attempt: telegram_id=${telegramId}, code=${code}`);
      
      // Find user with this code
      const { data: profile, error: findError } = await supabase
        .from('user_profiles')
        .select('id, user_id, telegram_link_code, telegram_link_expires')
        .eq('telegram_link_code', code)
        .maybeSingle();

      if (findError) {
        console.error('Error finding profile:', findError);
        await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
          `❌ An error occurred. Please try again.`
        );
        return new Response(
          JSON.stringify({ success: false, error: findError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!profile) {
        await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
          `❌ Invalid link code.\n\n` +
          `Please generate a new code at aasakira.uk → Profile → Link Telegram`
        );
        return new Response(
          JSON.stringify({ success: true, message: 'Invalid code' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if code expired
      if (profile.telegram_link_expires && new Date(profile.telegram_link_expires) < new Date()) {
        await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
          `⏰ This link code has expired.\n\n` +
          `Please generate a new code at aasakira.uk → Profile → Link Telegram`
        );
        return new Response(
          JSON.stringify({ success: true, message: 'Code expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Link the account
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          telegram_id: telegramId,
          telegram_username: telegramUsername,
          telegram_link_code: null,
          telegram_link_expires: null
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
          `❌ Failed to link account. Please try again.`
        );
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`✅ Successfully linked telegram_id=${telegramId} to user_id=${profile.user_id}`);

      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
        `✅ Account linked successfully!\n\n` +
        `🏯 Welcome to Aasakira, warrior.\n\n` +
        `You can now:\n` +
        `• Send trade journals as messages\n` +
        `• Ask me anything about trading\n` +
        `• Get personalized coaching\n\n` +
        `Try: "I just took a GBPUSD long at 1.2650, SL 1.2600, TP 1.2750"`
      );

      return new Response(
        JSON.stringify({ success: true, message: 'Account linked' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is linked
    const { data: linkedProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (!linkedProfile) {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
        `🔗 Please link your account first!\n\n` +
        `Go to aasakira.uk → Profile → Link Telegram`
      );
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User is linked - acknowledge message (AI coaching to be implemented)
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
      `📝 Got it! AI coaching coming soon.\n\n` +
      `Your message has been recorded and will be available in your account history.`
    );

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Bot handler error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to send Telegram message:', error);
  }
  
  return response;
}
