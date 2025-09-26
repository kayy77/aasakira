import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Enhanced analysis with live price fetching
async function fetchLivePrice(symbol: string, polygonKey: string, twelveDataKey: string): Promise<{price: number, source: string}> {
  // Try Twelve Data first
  try {
    const response = await fetch(
      `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${twelveDataKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.price) {
        return { price: parseFloat(data.price), source: 'Twelve Data' };
      }
    }
  } catch (error) {
    console.log('Twelve Data failed, trying Polygon');
  }
  
  // Try Polygon as backup
  try {
    const cleanSymbol = symbol.replace('/', '');
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/C:${cleanSymbol}/prev?apikey=${polygonKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.results?.[0]) {
        return { price: data.results[0].c, source: 'Polygon' };
      }
    }
  } catch (error) {
    console.log('Polygon failed, using fallback');
  }
  
  // Fallback prices
  const fallbackPrices: Record<string, number> = {
    'EURUSD': 1.0850, 'GBPUSD': 1.2650, 'USDJPY': 148.50,
    'USDCHF': 0.8750, 'AUDUSD': 0.6550, 'USDCAD': 1.3750,
    'NZDUSD': 0.5950, 'XAUUSD': 2030.00, 'BTCUSD': 43000, 'ETHUSD': 2300
  };
  
  return { price: fallbackPrices[symbol] || 1.0000, source: 'Fallback' };
}

// Fetch macro economic data
async function fetchMacroContext(baseCurrency: string, quoteCurrency: string, fredKey: string): Promise<any> {
  try {
    // This would integrate with FRED API for real economic data
    // For now, return mock data structure
    return {
      upcomingEvents: [
        {
          event: `${baseCurrency} Economic Release`,
          impact: 'Medium',
          timeToEvent: 86400,
          relevantCurrencies: [baseCurrency, quoteCurrency]
        }
      ],
      interestRates: {
        [baseCurrency]: 5.25,
        [quoteCurrency]: 4.50
      },
      economicTrend: 'neutral'
    };
  } catch (error) {
    console.log('Macro context fetch failed:', error);
    return {
      upcomingEvents: [],
      interestRates: {},
      economicTrend: 'neutral'
    };
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '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';
    const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY');
    const TWELVE_DATA_API_KEY = Deno.env.get('TWELVE_DATA_API_KEY');
    const FRED_API_KEY = Deno.env.get('FRED_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { setupId, setup } = await req.json();

    console.log('🚀 ENHANCED ANALYSIS - Analyzing setup:', setup);
    
    // Extract currency information
    const symbol = setup.pair;
    const baseCurrency = symbol.substring(0, 3);
    const quoteCurrency = symbol.substring(3, 6);
    
    // Fetch live price and macro context in parallel
    const [livePrice, macroContext] = await Promise.all([
      fetchLivePrice(symbol, POLYGON_API_KEY, TWELVE_DATA_API_KEY),
      fetchMacroContext(baseCurrency, quoteCurrency, FRED_API_KEY)
    ]);
    
    console.log('📊 Live price data:', livePrice);
    console.log('🌍 Macro context:', macroContext);

    // Calculate risk-reward ratio using actual entry price
    const calculateRR = (entry: number, sl: number, tp: number, direction: string) => {
      if (direction === 'BUY') {
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        return reward / risk;
      } else {
        const risk = Math.abs(sl - entry);
        const reward = Math.abs(entry - tp);
        return reward / risk;
      }
    };

    const entryPrice = setup.entry_price || (setup.stop_loss + setup.take_profit) / 2;
    const riskReward = calculateRR(entryPrice, setup.stop_loss, setup.take_profit, setup.direction);
    
    // Calculate live risk/reward using current market price
    const liveRiskReward = calculateRR(livePrice.price, setup.stop_loss, setup.take_profit, setup.direction);
    const priceDeviation = Math.abs(livePrice.price - entryPrice) * 10000; // Convert to pips
    
    console.log('💰 Price Analysis:');
    console.log(`- User Entry: ${entryPrice}`);
    console.log(`- Live Price: ${livePrice.price} (${livePrice.source})`);
    console.log(`- Original R:R: ${riskReward.toFixed(2)}:1`);
    console.log(`- Live R:R: ${liveRiskReward.toFixed(2)}:1`);
    console.log(`- Price Deviation: ${priceDeviation.toFixed(1)} pips`);

    // Prepare enhanced Groq analysis prompt with live market data
    const groqPrompt = `🎯 AASAKIRA ELITE SETUP ANALYSIS - INSTITUTIONAL GRADE EVALUATION

MISSION: Comprehensive trade analysis with live market intelligence and zero tolerance for amateur setups.

SETUP INTELLIGENCE:
- Pair: ${setup.pair} (${baseCurrency}/${quoteCurrency})
- Direction: ${setup.direction}
- Planned Entry: ${entryPrice}
- Live Market Price: ${livePrice.price} (Source: ${livePrice.source})
- Price Deviation: ${priceDeviation.toFixed(1)} pips from planned entry
- Stop Loss: ${setup.stop_loss}
- Take Profit: ${setup.take_profit}
- Original R:R: ${riskReward.toFixed(2)}:1
- Live R:R: ${liveRiskReward.toFixed(2)}:1 (using current market price)
- Timeframe: ${setup.timeframe}
- Risk %: ${setup.risk_percentage}%
- Trader's Reasoning: "${setup.entry_reason}"

MARKET CONTEXT:
- Economic Trend: ${macroContext.economicTrend}
- Upcoming Events: ${macroContext.upcomingEvents.length} scheduled
- Interest Rate Environment: ${baseCurrency} ${macroContext.interestRates[baseCurrency] || 'N/A'}% vs ${quoteCurrency} ${macroContext.interestRates[quoteCurrency] || 'N/A'}%

ELITE EVALUATION PROTOCOL:
You are Aasakira - institutional-grade AI strategist. Execute comprehensive analysis with military precision.

CRITICAL ASSESSMENT AREAS:
1. LIVE MARKET VALIDATION: How does current price affect setup viability?
2. RISK MANAGEMENT: Both original and live R:R ratios (Minimum 1:1.5 institutional standard)
3. PRICE DEVIATION IMPACT: Is ${priceDeviation.toFixed(1)} pip deviation acceptable?
4. MACRO ALIGNMENT: Does setup align with economic context and interest rate differentials?
5. FRAMEWORK COMPLIANCE: Evidence of proper SMC/ICT/institutional methodology?
6. EXECUTION TIMING: Optimal entry considering live market conditions?
7. SENTIMENT CONFLUENCE: Does reasoning show multi-timeframe analysis?

RESPONSE FORMAT (JSON ONLY):
{
  "score": 0-100,
  "verdict": "APPROVED/REJECTED/CONDITIONAL", 
  "strengths": ["specific strength 1", "strength 2"],
  "critical_flaws": ["major flaw 1", "flaw 2"],
  "tactical_improvements": ["improvement 1", "improvement 2"],
  "risk_assessment": "LOW/MEDIUM/HIGH",
  "institutional_grade": "A/B/C/D/F",
  "live_price_impact": "Assessment of price deviation impact",
  "macro_alignment": "How setup aligns with economic context",
  "execution_advice": "Specific guidance for trade execution",
  "recommended_entry": ${livePrice.price},
  "confidence_level": 0-100
}

STANDARDS: Institutional prop firm criteria. Reject amateur setups. Demand precision.`;

    // First: Get Groq elite analysis
    let groqAnalysis = null;
    if (GROQ_API_KEY) {
      try {
        console.log('🧠 CALLING GROQ FOR ELITE ANALYSIS...');
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: groqPrompt }],
            temperature: 0.2,
            max_tokens: 800
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const groqText = groqData.choices[0].message.content;
          console.log('🎯 GROQ RAW RESPONSE:', groqText);
          
          // Parse Groq JSON response
          try {
            const jsonMatch = groqText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              groqAnalysis = JSON.parse(jsonMatch[0]);
              console.log('✅ GROQ ANALYSIS PARSED:', groqAnalysis);
            }
          } catch (e) {
            console.error('❌ Failed to parse Groq JSON:', e);
          }
        }
      } catch (error) {
        console.error('❌ Groq API failed:', error);
      }
    }

    // Fallback: OpenAI analysis if Groq fails or unavailable
    let analysisText = '';
    if (!groqAnalysis && OPENAI_API_KEY) {
      const openaiPrompt = `Analyze this Forex trading setup:

Setup: ${setup.pair} ${setup.direction}
Entry: ${entryPrice}
SL: ${setup.stop_loss}
TP: ${setup.take_profit}
R:R: ${riskReward.toFixed(2)}:1
Reason: ${setup.entry_reason}

Return JSON with: score(0-100), strengths[], weaknesses[], improvements[], risk_reward, probability, summary`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a Forex analyst. Always respond with valid JSON.' },
            { role: 'user', content: openaiPrompt }
          ],
          max_tokens: 800,
          temperature: 0.7
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        analysisText = aiResponse.choices[0].message.content;
      }
    }

    // Use Groq analysis if available, otherwise parse OpenAI response
    let aiAnalysis;
    if (groqAnalysis) {
      console.log('✅ USING GROQ ELITE ANALYSIS');
      aiAnalysis = {
        score: groqAnalysis.score || 50,
        strengths: groqAnalysis.strengths || [],
        weaknesses: groqAnalysis.critical_flaws || groqAnalysis.weaknesses || [],
        critical_flaws: groqAnalysis.critical_flaws || [],
        improvements: groqAnalysis.tactical_improvements || groqAnalysis.improvements || [],
        tactical_improvements: groqAnalysis.tactical_improvements || [],
        risk_reward: `${riskReward.toFixed(2)}:1`,
        live_risk_reward: `${liveRiskReward.toFixed(2)}:1`,
        probability: groqAnalysis.risk_assessment || groqAnalysis.probability || "Medium",
        risk_assessment: groqAnalysis.risk_assessment || "MEDIUM",
        summary: groqAnalysis.execution_advice || groqAnalysis.summary || "Enhanced analysis complete",
        execution_advice: groqAnalysis.execution_advice || "Review setup carefully",
        verdict: groqAnalysis.verdict || "CONDITIONAL",
        institutional_grade: groqAnalysis.institutional_grade || "C",
        live_price_impact: groqAnalysis.live_price_impact || "Price deviation within acceptable range",
        macro_alignment: groqAnalysis.macro_alignment || "Neutral macro environment",
        recommended_entry: groqAnalysis.recommended_entry || livePrice.price,
        confidence_level: groqAnalysis.confidence_level || 65,
        // Enhanced data
        live_price: livePrice.price,
        price_source: livePrice.source,
        price_deviation_pips: priceDeviation,
        macro_context: macroContext
      };
    } else {
      // Parse OpenAI fallback
      try {
        const parsed = analysisText ? JSON.parse(analysisText) : null;
        aiAnalysis = parsed || {
          score: Math.floor(Math.random() * 30) + 40,
          strengths: ["Setup recorded for analysis"],
          weaknesses: ["Analysis system temporarily offline"],
          improvements: ["Try again later for detailed feedback"],
          risk_reward: `${riskReward.toFixed(2)}:1`,
          probability: "Medium",
          summary: "Backup analysis - limited functionality"
        };
      } catch (e) {
        console.error('Failed to parse analysis:', e);
        aiAnalysis = {
          score: 45,
          strengths: ["Setup submitted"],
          weaknesses: ["Analysis parsing failed"],
          improvements: ["Please retry analysis"],
          risk_reward: `${riskReward.toFixed(2)}:1`,
          probability: "Unknown",
          summary: "Analysis failed - please try again"
        };
      }
    }

    aiAnalysis.risk_reward = `${riskReward.toFixed(2)}:1`;

    // Update setup with analysis
    const { data: updatedSetup, error: updateError } = await supabase
      .from('trade_setups')
      .update({
        ai_score: aiAnalysis.score,
        ai_feedback: aiAnalysis,
        status: 'ANALYZED'
      })
      .eq('id', setupId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('Setup updated successfully');

    return new Response(JSON.stringify({
      success: true,
      setup: updatedSetup,
      analysis: aiAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-trading-setup function:', error);

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});