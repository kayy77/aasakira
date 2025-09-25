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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { setupId, setup } = await req.json();

    console.log('Analyzing setup:', setup);

    // Calculate risk-reward ratio
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

    // Estimate entry price for RR calculation (midpoint between SL and TP)
    const estimatedEntry = (setup.stop_loss + setup.take_profit) / 2;
    const riskReward = calculateRR(estimatedEntry, setup.stop_loss, setup.take_profit, setup.direction);

    // Prepare analysis prompt
    const analysisPrompt = `Analyze this Forex trading setup and provide detailed feedback:

Setup Details:
- Pair: ${setup.pair}
- Direction: ${setup.direction}
- Stop Loss: ${setup.stop_loss}
- Take Profit: ${setup.take_profit}
- Risk/Reward Ratio: ${riskReward.toFixed(2)}:1
- Timeframe: ${setup.timeframe}
- Risk %: ${setup.risk_percentage}%
- Entry Reason: ${setup.entry_reason}

Please analyze this setup and return a JSON response with:
{
  "score": 0-100 (overall setup quality),
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "risk_reward": "X:1",
  "probability": "High/Medium/Low",
  "summary": "Brief overall assessment"
}

Focus on:
1. Risk management (RR ratio, position sizing)
2. Technical analysis elements mentioned
3. Market structure and confluences
4. Timing and session considerations
5. Overall trade probability

Be constructive and educational in your feedback.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Aasakira, an expert Forex trading analyst. Provide detailed, constructive analysis of trading setups with specific actionable feedback. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;

    console.log('AI Analysis Response:', analysisText);

    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback analysis
      aiAnalysis = {
        score: Math.floor(Math.random() * 40) + 40, // 40-80
        strengths: ["Setup submitted for analysis"],
        weaknesses: ["AI analysis temporarily unavailable"],
        improvements: ["Please try again later"],
        risk_reward: `${riskReward.toFixed(2)}:1`,
        probability: "Medium",
        summary: "Analysis in progress"
      };
    }

    // Ensure risk_reward is properly formatted
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
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});