import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch live price from multiple sources with fallback
async function fetchLivePrice(symbol: string, twelveDataKey?: string): Promise<{price: number, source: string}> {
  console.log(`📊 Fetching live price for ${symbol}...`);
  
  // Symbol mappings for different APIs
  const symbolMappings: Record<string, string> = {
    'XAUUSD': 'XAU/USD',
    'BTCUSD': 'BTC/USD',
    'ETHUSD': 'ETH/USD',
    'EURUSD': 'EUR/USD',
    'GBPUSD': 'GBP/USD',
    'USDJPY': 'USD/JPY',
    'USDCHF': 'USD/CHF',
    'AUDUSD': 'AUD/USD',
    'USDCAD': 'USD/CAD',
    'NZDUSD': 'NZD/USD',
    'EURJPY': 'EUR/JPY',
    'GBPJPY': 'GBP/JPY',
    'EURGBP': 'EUR/GBP',
  };

  const fallbackPrices: Record<string, number> = {
    'EURUSD': 1.0550, 'GBPUSD': 1.2750, 'USDJPY': 149.50,
    'USDCHF': 0.8850, 'AUDUSD': 0.6450, 'USDCAD': 1.4150,
    'NZDUSD': 0.5750, 'EURJPY': 157.80, 'GBPJPY': 190.50,
    'EURGBP': 0.8280, 'XAUUSD': 2650.00, 'BTCUSD': 100000, 'ETHUSD': 3800
  };

  // Try TwelveData API first
  if (twelveDataKey) {
    try {
      const mappedSymbol = symbolMappings[symbol] || symbol;
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${mappedSymbol}&apikey=${twelveDataKey}`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.price && !data.code) {
          console.log(`✅ TwelveData price for ${symbol}: ${data.price}`);
          return { price: parseFloat(data.price), source: 'TwelveData' };
        }
      }
    } catch (error) {
      console.log(`⚠️ TwelveData failed for ${symbol}:`, error);
    }
  }

  // Try Yahoo Finance as backup
  try {
    const yahooSymbol = symbol === 'XAUUSD' ? 'GC=F' : 
                        symbol === 'BTCUSD' ? 'BTC-USD' : 
                        symbol === 'ETHUSD' ? 'ETH-USD' : 
                        `${symbol}=X`;
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`,
      { 
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) {
        console.log(`✅ Yahoo price for ${symbol}: ${price}`);
        return { price: price, source: 'Yahoo Finance' };
      }
    }
  } catch (error) {
    console.log(`⚠️ Yahoo failed for ${symbol}:`, error);
  }

  // Return fallback
  const fallbackPrice = fallbackPrices[symbol] || 1.0000;
  console.log(`⚠️ Using fallback price for ${symbol}: ${fallbackPrice}`);
  return { price: fallbackPrice, source: 'Fallback' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const TWELVE_DATA_API_KEY = Deno.env.get('TWELVE_DATA_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('Missing LOVABLE_API_KEY - please enable Lovable AI');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { setupId, setup } = await req.json();

    console.log('🚀 SETUP SCANNER - Analyzing setup:', setup.pair, setup.direction);
    
    const symbol = setup.pair;
    const baseCurrency = symbol.substring(0, 3);
    const quoteCurrency = symbol.substring(3, 6);
    
    // Fetch live price
    const livePrice = await fetchLivePrice(symbol, TWELVE_DATA_API_KEY);
    console.log('📊 Live price:', livePrice);

    // Calculate risk-reward ratios
    const entryPrice = setup.entry_price || (setup.stop_loss + setup.take_profit) / 2;
    
    const calculateRR = (entry: number, sl: number, tp: number, direction: string) => {
      if (direction === 'BUY') {
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        return risk > 0 ? reward / risk : 0;
      } else {
        const risk = Math.abs(sl - entry);
        const reward = Math.abs(entry - tp);
        return risk > 0 ? reward / risk : 0;
      }
    };

    const originalRR = calculateRR(entryPrice, setup.stop_loss, setup.take_profit, setup.direction);
    const liveRR = calculateRR(livePrice.price, setup.stop_loss, setup.take_profit, setup.direction);
    
    // Calculate price deviation in pips
    const pipMultiplier = symbol.includes('JPY') ? 100 : 10000;
    const priceDeviation = Math.abs(livePrice.price - entryPrice) * pipMultiplier;
    
    console.log('💰 Analysis:', {
      userEntry: entryPrice,
      livePrice: livePrice.price,
      originalRR: originalRR.toFixed(2),
      liveRR: liveRR.toFixed(2),
      priceDeviation: priceDeviation.toFixed(1)
    });

    // Prepare AI analysis prompt
    const analysisPrompt = `You are Aasakira, an elite institutional trading analyst. Analyze this trading setup with precision.

SETUP DETAILS:
- Pair: ${setup.pair} (${baseCurrency}/${quoteCurrency})
- Direction: ${setup.direction}
- Planned Entry: ${entryPrice}
- Live Market Price: ${livePrice.price} (Source: ${livePrice.source})
- Price Deviation: ${priceDeviation.toFixed(1)} pips
- Stop Loss: ${setup.stop_loss}
- Take Profit: ${setup.take_profit}
- Original R:R: ${originalRR.toFixed(2)}:1
- Live R:R: ${liveRR.toFixed(2)}:1
- Timeframe: ${setup.timeframe}
- Risk %: ${setup.risk_percentage}%
- Trader's Reasoning: "${setup.entry_reason}"

EVALUATION CRITERIA:
1. Is the R:R ratio acceptable? (Minimum 1:1.5 recommended)
2. Is the price deviation acceptable? (Generally <30 pips for majors)
3. Does the entry reason show proper analysis?
4. Is the stop loss placement logical?
5. Is the take profit realistic?

You MUST respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
  "verdict": "<APPROVED|CONDITIONAL|REJECTED>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "critical_flaws": ["<flaw 1>", "<flaw 2>"],
  "tactical_improvements": ["<improvement 1>", "<improvement 2>"],
  "risk_assessment": "<LOW|MEDIUM|HIGH>",
  "institutional_grade": "<A|B|C|D|F>",
  "execution_advice": "<specific execution guidance>",
  "live_price_impact": "<assessment of price deviation impact>",
  "recommended_entry": ${livePrice.price},
  "confidence_level": <number 0-100>
}`;

    // Call Lovable AI Gateway
    console.log('🧠 Calling Lovable AI for analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert trading analyst. Always respond with valid JSON only, no markdown.' },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    console.log('🎯 AI Response:', aiContent);

    // Parse AI response
    let aiAnalysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      // Provide fallback analysis
      aiAnalysis = {
        score: originalRR >= 1.5 ? 65 : 45,
        verdict: originalRR >= 1.5 ? 'CONDITIONAL' : 'REJECTED',
        strengths: ['Setup submitted for analysis'],
        critical_flaws: originalRR < 1.5 ? ['R:R ratio below 1.5:1 minimum'] : [],
        tactical_improvements: ['Consider adjusting entry based on live price'],
        risk_assessment: 'MEDIUM',
        institutional_grade: originalRR >= 1.5 ? 'C' : 'D',
        execution_advice: 'Review setup parameters before execution',
        live_price_impact: `Price has moved ${priceDeviation.toFixed(1)} pips from planned entry`,
        recommended_entry: livePrice.price,
        confidence_level: 50
      };
    }

    // Enrich analysis with live data
    const enrichedAnalysis = {
      ...aiAnalysis,
      risk_reward: `${originalRR.toFixed(2)}:1`,
      live_risk_reward: `${liveRR.toFixed(2)}:1`,
      live_price: livePrice.price,
      price_source: livePrice.source,
      price_deviation_pips: priceDeviation,
      analyzed_at: new Date().toISOString()
    };

    // Update setup in database
    const { data: updatedSetup, error: updateError } = await supabase
      .from('trade_setups')
      .update({
        ai_score: enrichedAnalysis.score,
        ai_feedback: enrichedAnalysis,
        status: 'ANALYZED'
      })
      .eq('id', setupId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw updateError;
    }

    console.log('✅ Setup analyzed successfully');

    return new Response(JSON.stringify({
      success: true,
      setup: updatedSetup,
      analysis: enrichedAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in analyze-trading-setup:', error);

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Analysis failed',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
