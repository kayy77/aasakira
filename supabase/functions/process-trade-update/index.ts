import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dynamic TP pattern - matches TP followed by any number
const TP_PATTERN = /\btp\s*(\d+)\b/gi;
const BE_PATTERN = /\bbe\b|breakeven|break\s*even/i;
const SL_PATTERN = /\bsl\b|stop\s*loss|stopped\s*out|sl\s*hit/i;
const CLOSE_PATTERN = /\bclose[d]?\b|closed\s*runners?|manually\s*closed|exit/i;

// Calculate pips based on direction
function calculatePips(entryPrice: number, targetPrice: number, direction: string, pair: string): number {
  const diff = direction === 'LONG' ? targetPrice - entryPrice : entryPrice - targetPrice;
  
  // Determine pip multiplier based on pair
  // JPY pairs and indices have different pip values
  const isJpyPair = pair.includes('JPY');
  const isIndex = ['NAS100', 'US30', 'SPX500', 'US500'].some(idx => pair.includes(idx));
  const isGold = pair.includes('XAU');
  
  let pipMultiplier = 10000; // Standard forex pairs
  if (isJpyPair) pipMultiplier = 100;
  if (isIndex) pipMultiplier = 1;
  if (isGold) pipMultiplier = 10;
  
  return Math.round(diff * pipMultiplier * 10) / 10; // Round to 1 decimal
}

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
      console.log('❌ Missing required fields:', { reply_text: !!reply_text, reply_to_message_id, channel_id });
      return new Response(
        JSON.stringify({ success: false, error: 'reply_text, reply_to_message_id, and channel_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Processing trade update: "${reply_text}" for original message ${reply_to_message_id} in channel ${channel_id}`);

    // Find the active trade that matches this reply
    const { data: trade, error: findError } = await supabase
      .from('active_trades')
      .select('*')
      .eq('original_message_id', reply_to_message_id)
      .eq('channel_id', channel_id)
      .single();

    if (findError || !trade) {
      console.log(`⚠️ No active trade found for original_message_id ${reply_to_message_id}:`, findError?.message);
      
      const { data: allTrades } = await supabase
        .from('active_trades')
        .select('id, original_message_id, channel_id, pair, status')
        .limit(5);
      console.log('📋 Current active trades:', JSON.stringify(allTrades, null, 2));
      
      return new Response(
        JSON.stringify({ success: false, error: 'No trade found for this message', reply_to_message_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found trade: ${trade.id} | ${trade.pair} | Status: ${trade.status}`);

    // Get current take_profits array or build from legacy columns
    let takeProfits: Array<{ level: number; price: number; hit: boolean; pips: number | null }> = 
      trade.take_profits || [];
    
    // Fallback to legacy columns if take_profits is empty
    if (takeProfits.length === 0) {
      const legacyTps = [
        { level: 1, price: trade.tp1, hit: trade.tp1_hit || false },
        { level: 2, price: trade.tp2, hit: trade.tp2_hit || false },
        { level: 3, price: trade.tp3, hit: trade.tp3_hit || false },
      ].filter(tp => tp.price !== null);
      
      takeProfits = legacyTps.map(tp => ({
        level: tp.level,
        price: tp.price,
        hit: tp.hit,
        pips: null
      }));
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    const detectedUpdates: string[] = [];
    let totalPipsRealized = trade.pips_realized || 0;

    // Check for dynamic TP hits
    let match;
    const tpMatches: number[] = [];
    while ((match = TP_PATTERN.exec(reply_text)) !== null) {
      tpMatches.push(parseInt(match[1], 10));
    }

    // Process each matched TP
    for (const tpLevel of tpMatches) {
      const tpIndex = takeProfits.findIndex(tp => tp.level === tpLevel);
      if (tpIndex !== -1 && !takeProfits[tpIndex].hit) {
        takeProfits[tpIndex].hit = true;
        
        // Calculate pips for this TP
        if (trade.entry_price && takeProfits[tpIndex].price) {
          const pips = calculatePips(
            trade.entry_price,
            takeProfits[tpIndex].price,
            trade.direction,
            trade.pair
          );
          takeProfits[tpIndex].pips = pips;
          totalPipsRealized += pips;
          console.log(`✅ TP${tpLevel} hit: +${pips} pips`);
        }
        
        detectedUpdates.push(`TP${tpLevel}_HIT`);

        // Update legacy columns for compatibility
        if (tpLevel === 1) updates.tp1_hit = true;
        if (tpLevel === 2) updates.tp2_hit = true;
        if (tpLevel === 3) updates.tp3_hit = true;
      }
    }

    // Check for BE
    if (BE_PATTERN.test(reply_text)) {
      updates.be_activated = true;
      detectedUpdates.push('BE_ACTIVATED');
      console.log('🔄 Breakeven activated');
    }

    // Check for SL
    if (SL_PATTERN.test(reply_text)) {
      updates.status = 'STOPPED_OUT';
      updates.closed_at = new Date().toISOString();
      detectedUpdates.push('STOPPED_OUT');
      console.log('❌ Stop loss hit - trade closed');
    }

    // Check for close (if not already stopped out)
    if (CLOSE_PATTERN.test(reply_text) && updates.status !== 'STOPPED_OUT') {
      updates.status = 'CLOSED';
      updates.closed_at = new Date().toISOString();
      detectedUpdates.push('CLOSED');
      console.log('✅ Trade manually closed');
    }

    if (detectedUpdates.length === 0) {
      console.log(`⚠️ No update patterns matched in: "${reply_text}"`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No update patterns matched',
          reply_text 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update take_profits and pips_realized
    updates.take_profits = takeProfits;
    updates.pips_realized = totalPipsRealized;

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

    console.log(`✅ Trade ${updatedTrade.id} updated:`, detectedUpdates.join(', '), `| Total pips: ${totalPipsRealized}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        trade: updatedTrade,
        updates_applied: detectedUpdates,
        pips_realized: totalPipsRealized
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