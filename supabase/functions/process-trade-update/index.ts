import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keywords to detect trade updates
const UPDATE_PATTERNS = {
  TP1: /\btp\s*1\b|tp1/i,
  TP2: /\btp\s*2\b|tp2/i,
  TP3: /\btp\s*3\b|tp3/i,
  BE: /\bbe\b|breakeven|break\s*even/i,
  SL: /\bsl\b|stop\s*loss|stopped\s*out/i,
  CLOSE: /\bclose[d]?\b|closed\s*runners?|manually\s*closed/i,
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

    const { reply_text, reply_to_message_id, channel_id, telegram_message_id } = await req.json();

    if (!reply_text || !reply_to_message_id || !channel_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'reply_text, reply_to_message_id, and channel_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Processing trade update: "${reply_text}" for message ${reply_to_message_id}`);

    // Find the active trade that matches this reply
    const { data: trade, error: findError } = await supabase
      .from('active_trades')
      .select('*')
      .eq('original_message_id', reply_to_message_id)
      .eq('channel_id', channel_id)
      .single();

    if (findError || !trade) {
      console.log(`⚠️ No active trade found for message ${reply_to_message_id}:`, findError);
      return new Response(
        JSON.stringify({ success: false, error: 'No trade found for this message' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found trade:`, trade.id, trade.pair, trade.status);

    // Detect what type of update this is
    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    let updateType = 'UNKNOWN';

    if (UPDATE_PATTERNS.TP1.test(reply_text)) {
      updates.tp1_hit = true;
      updateType = 'TP1_HIT';
      console.log('✅ TP1 hit detected');
    }

    if (UPDATE_PATTERNS.TP2.test(reply_text)) {
      updates.tp2_hit = true;
      updateType = 'TP2_HIT';
      console.log('✅ TP2 hit detected');
    }

    if (UPDATE_PATTERNS.TP3.test(reply_text)) {
      updates.tp3_hit = true;
      updateType = 'TP3_HIT';
      console.log('✅ TP3 hit detected');
    }

    if (UPDATE_PATTERNS.BE.test(reply_text)) {
      updates.be_activated = true;
      updateType = 'BE_ACTIVATED';
      console.log('🔄 Breakeven activated');
    }

    if (UPDATE_PATTERNS.SL.test(reply_text)) {
      updates.status = 'STOPPED_OUT';
      updates.closed_at = new Date().toISOString();
      updateType = 'STOPPED_OUT';
      console.log('❌ Stop loss hit - trade closed');
    }

    if (UPDATE_PATTERNS.CLOSE.test(reply_text) && updates.status !== 'STOPPED_OUT') {
      updates.status = 'CLOSED';
      updates.closed_at = new Date().toISOString();
      updateType = 'CLOSED';
      console.log('✅ Trade manually closed');
    }

    // Apply updates
    const { data: updatedTrade, error: updateError } = await supabase
      .from('active_trades')
      .update(updates)
      .eq('id', trade.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating trade:', updateError);
      throw updateError;
    }

    console.log(`✅ Trade updated:`, updatedTrade.id, 'Type:', updateType);

    return new Response(
      JSON.stringify({ 
        success: true, 
        trade: updatedTrade,
        update_type: updateType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Trade update error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
