import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration - Only listen to Signals topic
const TARGET_CHAT_ID = -1002187927163;
const SIGNALS_THREAD_ID = 2895;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabaseUrl = Deno.env.get('SUPABASE_URL');

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

      // Handle channel posts and group messages
      const message = update.channel_post || update.edited_channel_post || update.message || update.edited_message;
      const isEdited = !!update.edited_channel_post || !!update.edited_message;

      if (!message) {
        console.log('⚠️ No message in update');
        return new Response(
          JSON.stringify({ success: true, message: 'No processable message' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const chatId = message.chat?.id || message.sender_chat?.id;
      const threadId = message.message_thread_id || null;
      const rawReplyToMessageId = message.reply_to_message?.message_id || null;

      // CRITICAL FIX: In Telegram topics, reply_to_message_id = thread_id means it's a TOP-LEVEL post
      // A REAL reply to another message will have reply_to_message_id DIFFERENT from thread_id
      const isReplyToThread = rawReplyToMessageId === threadId;
      const replyToMessageId = isReplyToThread ? null : rawReplyToMessageId;

      console.log(`📍 Message from chat: ${chatId}, thread: ${threadId}, raw_reply_to: ${rawReplyToMessageId}, actual_reply_to: ${replyToMessageId}, is_topic_post: ${isReplyToThread}`);

      // Filter: Only process messages from Signals topic
      if (chatId !== TARGET_CHAT_ID) {
        console.log(`⏭️ Ignoring message from chat ${chatId} (not target chat ${TARGET_CHAT_ID})`);
        return new Response(
          JSON.stringify({ success: true, message: 'Message from non-target chat ignored' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (threadId !== SIGNALS_THREAD_ID) {
        console.log(`⏭️ Ignoring message from thread ${threadId} (not Signals thread ${SIGNALS_THREAD_ID})`);
        return new Response(
          JSON.stringify({ success: true, message: 'Message from non-Signals thread ignored' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const rawText = message.text || message.caption || '';
      
      const messageData = {
        message_id: message.message_id,
        channel_id: chatId,
        thread_id: threadId,
        reply_to_message_id: replyToMessageId, // null if it's a topic post, actual ID if reply
        raw_text: rawText,
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

      // Process the message based on whether it's a reply or new signal
      if (rawText && rawText.trim().length > 0) {
        if (replyToMessageId) {
          // This is a REAL reply to a signal message - it's a trade UPDATE (TP hit, SL, BE, Close)
          console.log(`🔄 Processing trade update reply to message ${replyToMessageId}...`);
          
          try {
            const updateResponse = await fetch(`${supabaseUrl}/functions/v1/process-trade-update`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              },
              body: JSON.stringify({
                reply_text: rawText,
                reply_to_message_id: replyToMessageId,
                channel_id: chatId,
                telegram_message_id: data?.id,
              }),
            });

            const updateResult = await updateResponse.json();
            console.log('📊 Trade update result:', updateResult);
          } catch (updateError) {
            console.error('⚠️ Trade update failed (non-blocking):', updateError);
          }
        } else {
          // This is a top-level message in the topic - check if it's a NEW SIGNAL
          console.log('🔄 Processing potential new trade signal...');
          
          try {
            const parseResponse = await fetch(`${supabaseUrl}/functions/v1/parse-signal`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              },
              body: JSON.stringify({
                raw_text: rawText,
                telegram_message_id: data?.id,
                original_message_id: message.message_id,
                channel_id: chatId,
              }),
            });

            const parseResult = await parseResponse.json();
            console.log('📊 Parse result:', parseResult);
          } catch (parseError) {
            console.error('⚠️ Signal parsing failed (non-blocking):', parseError);
          }
        }
      }

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
