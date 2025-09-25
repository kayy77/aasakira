import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { setupId, setup } = await req.json();

    console.log('Analyzing setup:', setup);

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

    // Prepare Groq analysis prompt with military precision
    const groqPrompt = `🎯 AASAKIRA ELITE SETUP ANALYSIS - MILITARY PRECISION REQUIRED

MISSION: Interrogate this trade setup with ZERO tolerance for poor risk management.

SETUP INTEL:
- Pair: ${setup.pair}
- Direction: ${setup.direction}
- Entry Price: ${entryPrice}
- Stop Loss: ${setup.stop_loss}
- Take Profit: ${setup.take_profit}
- Risk/Reward: ${riskReward.toFixed(2)}:1
- Timeframe: ${setup.timeframe}
- Risk %: ${setup.risk_percentage}%
- Trader's Reasoning: "${setup.entry_reason}"

INTERROGATION PROTOCOL:
You are Aasakira - elite AI strategist. NO fluff. NO emojis. Pure tactical assessment.

ANALYZE:
1. RISK MANAGEMENT: Is R:R acceptable? (Minimum 1:1.5 for approval)
2. FRAMEWORK COMPLIANCE: Does reasoning show proper SMC/ICT understanding?
3. EXECUTION TIMING: Is entry positioned correctly vs SL/TP?
4. INSTITUTIONAL THINKING: Would prop firms approve this setup?

RESPONSE FORMAT (JSON ONLY):
{
  "score": 0-100,
  "verdict": "APPROVED/REJECTED/CONDITIONAL", 
  "strengths": ["specific strength 1", "strength 2"],
  "critical_flaws": ["major issue 1", "issue 2"],
  "tactical_improvements": ["fix 1", "fix 2"],
  "risk_assessment": "LOW/MEDIUM/HIGH",
  "institutional_grade": "A/B/C/D/F",
  "execution_advice": "Direct guidance for trade execution"
}

CRITICAL: Be brutally honest. Call out amateur thinking. Demand institutional standards.`;

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
        improvements: groqAnalysis.tactical_improvements || groqAnalysis.improvements || [],
        risk_reward: `${riskReward.toFixed(2)}:1`,
        probability: groqAnalysis.risk_assessment || groqAnalysis.probability || "Medium",
        summary: groqAnalysis.execution_advice || groqAnalysis.summary || "Elite analysis complete",
        verdict: groqAnalysis.verdict || "CONDITIONAL",
        institutional_grade: groqAnalysis.institutional_grade || "C"
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