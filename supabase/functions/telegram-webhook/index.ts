import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // GET request - List raw messages
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const channelId = url.searchParams.get('channel_id');

      let query = supabase
        .from('telegram_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, messages: data, count: data?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST request - Telegram webhook (receive messages from bot)
    if (req.method === 'POST') {
      const update = await req.json();
      console.log('📨 Received Telegram update:', JSON.stringify(update, null, 2));

      // Handle channel posts
      const message = update.channel_post || update.edited_channel_post || update.message;
      const isEdited = !!update.edited_channel_post || !!update.edited_message;

      if (!message) {
        console.log('⚠️ No message in update');
        return new Response(
          JSON.stringify({ success: true, message: 'No processable message' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const messageData = {
        message_id: message.message_id,
        channel_id: message.chat?.id || message.sender_chat?.id,
        raw_text: message.text || message.caption || '',
        timestamp: new Date().toISOString(),
        edited: isEdited,
        original_date: message.date ? new Date(message.date * 1000).toISOString() : null,
        edit_date: message.edit_date ? new Date(message.edit_date * 1000).toISOString() : null,
      };

      console.log('💾 Storing message:', messageData);

      // Upsert message (update if exists, insert if new)
      const { data, error } = await supabase
        .from('telegram_messages')
        .upsert(messageData, {
          onConflict: 'message_id,channel_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error storing message:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Message stored successfully:', data?.id);
      return new Response(
        JSON.stringify({ success: true, message_id: data?.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});