import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a trading signal parser. Your job is to extract structured trading signal data from raw Telegram messages.

RULES:
1. Ignore all emojis, hashtags, and promotional text
2. Normalize symbols: XAU/USD → XAUUSD, EUR/USD → EURUSD, NAS100 → NAS100, US30 → US30, BTC/USD → BTCUSD
3. Direction must be exactly "LONG" or "SHORT" (map BUY→LONG, SELL→SHORT)
4. Extract numeric values for entry, stop loss, and take profit levels
5. If multiple TP levels exist, extract all of them in order (TP1, TP2, TP3, etc.)
6. If ANY required field (symbol, direction, entry_price, stop_loss, at least one take_profit) is missing or unclear, mark as REJECTED

IMPORTANT: Be strict about extraction. If the message is not a clear trading signal, reject it.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { raw_text, telegram_message_id, original_message_id, channel_id } = await req.json();

    if (!raw_text) {
      return new Response(
        JSON.stringify({ success: false, error: 'raw_text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📊 Parsing signal:', raw_text.substring(0, 100));

    // Call Lovable AI to parse the signal
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Parse this trading signal message:\n\n${raw_text}` }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_signal',
              description: 'Extract structured trading signal data from the message',
              parameters: {
                type: 'object',
                properties: {
                  symbol: {
                    type: 'string',
                    description: 'Trading symbol normalized (e.g., XAUUSD, EURUSD, BTCUSDT)'
                  },
                  direction: {
                    type: 'string',
                    enum: ['LONG', 'SHORT'],
                    description: 'Trade direction (LONG or SHORT)'
                  },
                  entry_price: {
                    type: 'number',
                    description: 'Entry price level'
                  },
                  stop_loss: {
                    type: 'number',
                    description: 'Stop loss price level'
                  },
                  take_profit_levels: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Array of take profit levels in order (TP1, TP2, TP3, etc.)'
                  },
                  is_valid_signal: {
                    type: 'boolean',
                    description: 'Whether this is a valid trading signal with all required fields'
                  },
                  rejection_reason: {
                    type: 'string',
                    description: 'Reason for rejection if not a valid signal'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score from 0-100'
                  }
                },
                required: ['is_valid_signal', 'confidence'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_signal' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded, try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('🤖 AI response:', JSON.stringify(aiData, null, 2));

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const parsedData = JSON.parse(toolCall.function.arguments);
    console.log('📋 Parsed data:', parsedData);

    // Build the parsed signal record
    const signalRecord: any = {
      raw_text,
      telegram_message_id: telegram_message_id || null,
      symbol: parsedData.symbol || null,
      direction: parsedData.direction || null,
      entry_price: parsedData.entry_price || null,
      stop_loss: parsedData.stop_loss || null,
      take_profit_levels: parsedData.take_profit_levels || [],
      confidence: parsedData.confidence || 0,
      parsed_at: new Date().toISOString(),
    };

    // Determine status
    const isValid = parsedData.is_valid_signal && 
        signalRecord.symbol && 
        signalRecord.direction && 
        signalRecord.entry_price && 
        signalRecord.stop_loss &&
        signalRecord.take_profit_levels?.length > 0;

    if (isValid) {
      signalRecord.status = 'PARSED';
      signalRecord.rejection_reason = null;
    } else {
      signalRecord.status = 'REJECTED';
      signalRecord.rejection_reason = parsedData.rejection_reason || 
        'Missing required fields (symbol, direction, entry, SL, or TP)';
    }

    console.log('💾 Storing signal record:', signalRecord);

    // Store in parsed_signals
    const { data: parsedSignalData, error: parsedError } = await supabase
      .from('parsed_signals')
      .insert(signalRecord)
      .select()
      .single();

    if (parsedError) {
      console.error('❌ Database error (parsed_signals):', parsedError);
      throw parsedError;
    }

    console.log('✅ Signal stored:', parsedSignalData.id, 'Status:', parsedSignalData.status);

    // If valid signal, also create an active_trade
    if (isValid && original_message_id && channel_id) {
      // First, close any existing active trades
      const { error: closeError } = await supabase
        .from('active_trades')
        .update({ 
          status: 'CLOSED', 
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('status', 'ACTIVE');

      if (closeError) {
        console.error('⚠️ Error closing previous trades:', closeError);
      }

      // Create new active trade
      const tpLevels = parsedData.take_profit_levels || [];
      const activeTradeData = {
        telegram_message_id: telegram_message_id,
        original_message_id: original_message_id,
        channel_id: channel_id,
        pair: parsedData.symbol,
        direction: parsedData.direction,
        entry_price: parsedData.entry_price,
        stop_loss: parsedData.stop_loss,
        tp1: tpLevels[0] || null,
        tp2: tpLevels[1] || null,
        tp3: tpLevels[2] || null,
        status: 'ACTIVE',
        raw_text: raw_text,
      };

      console.log('🎯 Creating active trade:', activeTradeData);

      const { data: activeTradeResult, error: activeError } = await supabase
        .from('active_trades')
        .insert(activeTradeData)
        .select()
        .single();

      if (activeError) {
        console.error('❌ Error creating active trade:', activeError);
      } else {
        console.log('✅ Active trade created:', activeTradeResult.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        signal: parsedSignalData,
        parsed: signalRecord.status === 'PARSED'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Parse error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
