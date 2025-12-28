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

    console.log('🚀 SETUP SCANNER V1 - Analyzing setup:', setup.pair, setup.direction);
    
    const symbol = setup.pair;
    const baseCurrency = symbol.substring(0, 3);
    const quoteCurrency = symbol.substring(3, 6);
    
    // V1 Scanner fields with defaults
    const marketStructure = setup.market_structure || 'unknown';
    const liquiditySweep = setup.liquidity_sweep || 'none';
    const sessionContext = setup.session_context || 'unknown';
    
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
    const pipMultiplier = symbol.includes('JPY') ? 100 : (symbol === 'XAUUSD' ? 10 : 10000);
    const priceDeviation = Math.abs(livePrice.price - entryPrice) * pipMultiplier;
    
    // Rules-based validation flags
    const ruleChecks = {
      rrValid: originalRR >= 1.5,
      structureAligned: (setup.direction === 'BUY' && marketStructure === 'bullish') || 
                        (setup.direction === 'SELL' && marketStructure === 'bearish'),
      liquidityConfirmed: liquiditySweep === 'confirmed',
      sessionOptimal: ['london', 'newyork', 'london_ny_overlap'].includes(sessionContext),
      priceNear: priceDeviation < 30
    };
    
    console.log('💰 Analysis:', {
      userEntry: entryPrice,
      livePrice: livePrice.price,
      originalRR: originalRR.toFixed(2),
      liveRR: liveRR.toFixed(2),
      priceDeviation: priceDeviation.toFixed(1),
      ruleChecks
    });

    // Build V1 Scanner prompt - reality-first approach
    const analysisPrompt = `You are an elite ICT/SMC trading analyst. Analyze this user-provided trading setup with precision and brutal honesty.

SETUP DETAILS:
- Pair: ${setup.pair} (${baseCurrency}/${quoteCurrency})
- Direction: ${setup.direction}
- Entry Price: ${entryPrice}
- Stop Loss: ${setup.stop_loss}
- Take Profit: ${setup.take_profit}
- Original R:R: ${originalRR.toFixed(2)}:1
- Timeframe: ${setup.timeframe}
- Risk %: ${setup.risk_percentage}%

V1 SCANNER CONTEXT (User Identified):
- Market Structure: ${marketStructure.toUpperCase()}
- Liquidity Sweep: ${liquiditySweep.toUpperCase()}
- Session Context: ${sessionContext.replace('_', ' ').toUpperCase()}
- Entry Reason: "${setup.entry_reason}"

LIVE MARKET DATA:
- Current Price: ${livePrice.price} (Source: ${livePrice.source})
- Price Deviation: ${priceDeviation.toFixed(1)} pips from planned entry
- Live R:R: ${liveRR.toFixed(2)}:1

RULES-BASED VALIDATION:
${ruleChecks.rrValid ? '✅' : '❌'} R:R Ratio >= 1.5:1 (Required)
${ruleChecks.structureAligned ? '✅' : '⚠️'} Direction aligned with market structure
${ruleChecks.liquidityConfirmed ? '✅' : '⚠️'} Liquidity sweep confirmed
${ruleChecks.sessionOptimal ? '✅' : '⚠️'} Optimal trading session
${ruleChecks.priceNear ? '✅' : '⚠️'} Entry within 30 pips of current price

ANALYZE THIS SETUP:
1. Does the direction make sense given the stated market structure?
2. Is the liquidity sweep assessment valid for this setup type?
3. Is the session appropriate for this pair?
4. Is the entry reason showing proper ICT/SMC analysis?
5. Are the SL and TP levels logical?

You MUST respond with ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
  "verdict": "<APPROVED|CONDITIONAL|REJECTED>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "critical_flaws": ["<flaw 1 if any>"],
  "tactical_improvements": ["<improvement 1>", "<improvement 2>"],
  "risk_assessment": "<LOW|MEDIUM|HIGH>",
  "institutional_grade": "<A|B|C|D|F>",
  "execution_advice": "<specific execution guidance based on setup>",
  "structure_analysis": "<assessment of stated market structure>",
  "liquidity_analysis": "<assessment of liquidity sweep claim>",
  "session_analysis": "<assessment of session timing>",
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
          { role: 'system', content: 'You are an expert ICT/SMC trading analyst. Always respond with valid JSON only, no markdown.' },
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
      // Provide fallback analysis based on rule checks
      const passedChecks = Object.values(ruleChecks).filter(Boolean).length;
      const baseScore = Math.round((passedChecks / 5) * 100);
      
      aiAnalysis = {
        score: baseScore,
        verdict: passedChecks >= 4 ? 'APPROVED' : passedChecks >= 2 ? 'CONDITIONAL' : 'REJECTED',
        strengths: ruleChecks.rrValid ? ['Acceptable risk-reward ratio'] : [],
        critical_flaws: !ruleChecks.rrValid ? ['R:R ratio below 1.5:1 minimum'] : [],
        tactical_improvements: ['Review entry against current market structure'],
        risk_assessment: passedChecks >= 4 ? 'LOW' : passedChecks >= 2 ? 'MEDIUM' : 'HIGH',
        institutional_grade: passedChecks >= 4 ? 'B' : passedChecks >= 2 ? 'C' : 'D',
        execution_advice: 'Review setup parameters before execution',
        structure_analysis: `Market structure: ${marketStructure}`,
        liquidity_analysis: `Liquidity sweep: ${liquiditySweep}`,
        session_analysis: `Session: ${sessionContext}`,
        confidence_level: 50
      };
    }

    // Enrich analysis with live data and V1 context
    const enrichedAnalysis = {
      ...aiAnalysis,
      risk_reward: `${originalRR.toFixed(2)}:1`,
      live_risk_reward: `${liveRR.toFixed(2)}:1`,
      live_price: livePrice.price,
      price_source: livePrice.source,
      price_deviation_pips: priceDeviation,
      v1_context: {
        market_structure: marketStructure,
        liquidity_sweep: liquiditySweep,
        session_context: sessionContext,
        rule_checks: ruleChecks
      },
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

    console.log('✅ V1 Scanner analysis complete');

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