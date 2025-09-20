import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { entry } = await req.json();

    // Get user's trading history for context
    const { data: userTrades } = await supabaseClient
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_time', { ascending: false })
      .limit(10);

    // Calculate performance metrics
    const closedTrades = userTrades?.filter(t => t.status === 'CLOSED') || [];
    const winRate = closedTrades.length > 0 ? 
      (closedTrades.filter(t => (t.result_pips || 0) > 0).length / closedTrades.length * 100) : 0;
    
    const totalPips = closedTrades.reduce((sum, t) => sum + (t.result_pips || 0), 0);
    const avgWin = closedTrades.filter(t => (t.result_pips || 0) > 0)
      .reduce((sum, t, _, arr) => sum + (t.result_pips || 0) / arr.length, 0);
    const avgLoss = closedTrades.filter(t => (t.result_pips || 0) < 0)
      .reduce((sum, t, _, arr) => sum + Math.abs(t.result_pips || 0) / arr.length, 0);

    // Calculate real P&L
    const calculateRealPnL = (pips, lotSize, fees) => {
      if (!pips || !lotSize) return 0;
      
      let pipValue = 1; // Default pip value
      if (entry.pair?.includes('JPY')) {
        pipValue = lotSize * 1000; // JPY pairs
      } else if (entry.pair?.includes('XAU') || entry.pair?.includes('GOLD')) {
        pipValue = lotSize * 100; // Gold
      } else if (entry.pair?.includes('XAG') || entry.pair?.includes('SILVER')) {
        pipValue = lotSize * 5000; // Silver  
      } else {
        pipValue = lotSize * 10; // Standard forex
      }
      
      return (pips * pipValue) - (fees || 0);
    };

    const realPnL = entry.result_pips && entry.lot_size ? 
      calculateRealPnL(entry.result_pips, entry.lot_size, entry.fees || 0) : null;

    // Risk analysis
    const riskAnalysis = entry.lot_size ? 
      (entry.lot_size > 1 ? 'HIGH RISK' : entry.lot_size > 0.1 ? 'MODERATE RISK' : 'LOW RISK') : 'UNKNOWN RISK';

    // Enhanced risk-reward calculation
    const calculateRiskReward = () => {
      if (!entry.entry_price || !entry.exit_price || !entry.result_pips) return 'N/A';
      
      const entryPrice = parseFloat(entry.entry_price);
      const exitPrice = parseFloat(entry.exit_price);
      const pips = parseFloat(entry.result_pips);
      
      // Estimate stop loss distance (assume 2:1 RR target)
      const estimatedStopDistance = Math.abs(pips) / 2;
      const actualRR = Math.abs(pips) / estimatedStopDistance;
      
      return actualRR.toFixed(2);
    };

    // Market context analysis
    const getMarketContext = () => {
      const hour = new Date(entry.entry_time).getHours();
      if (hour >= 2 && hour < 5) return 'SYDNEY SESSION - Lower liquidity';
      if (hour >= 8 && hour < 12) return 'LONDON SESSION - High volatility';
      if (hour >= 13 && hour < 17) return 'LONDON/NY OVERLAP - Peak activity';
      if (hour >= 17 && hour < 21) return 'NEW YORK SESSION - Good liquidity';
      return 'OFF-HOURS - Reduced activity';
    };

    // Recent pattern analysis
    const recentTrades = userTrades?.slice(0, 5) || [];
    const recentWins = recentTrades.filter(t => (t.result_pips || 0) > 0).length;
    const recentLosses = recentTrades.filter(t => (t.result_pips || 0) < 0).length;
    const streak = recentWins > recentLosses ? `${recentWins} wins` : `${recentLosses} losses`;

    // Prepare comprehensive analysis prompt
    const tradeAnalysis = `
ELITE TRADING PERFORMANCE AUDIT - BRUTAL HONESTY REQUIRED

═══ CURRENT TRADE BREAKDOWN ═══
📊 Trade Details:
- Asset: ${entry.pair} (${getMarketContext()})
- Direction: ${entry.direction}
- Entry: $${entry.entry_price} | Exit: ${entry.exit_price ? `$${entry.exit_price}` : 'STILL OPEN'}
- Strategy: ${entry.strategy || '❌ NO STRATEGY DEFINED - RED FLAG'}
- Result: ${entry.result_pips ? `${entry.result_pips > 0 ? '+' : ''}${entry.result_pips} pips` : 'PENDING'}
- Position Size: ${entry.lot_size || '❌ UNSPECIFIED - RISK MANAGEMENT FAILURE'}
- Risk:Reward: ${calculateRiskReward()}
- Real P&L: ${realPnL ? `$${realPnL.toFixed(2)}` : '❌ UNKNOWN - POOR TRACKING'}
- Risk Category: ${riskAnalysis}
- Trading Costs: $${entry.fees || 0}

🧠 Psychology & Execution:
- Mental State: ${entry.feelings || '❌ EMOTIONS NOT TRACKED'}
- Trade Notes: ${entry.notes || '❌ NO DOCUMENTATION - UNPROFESSIONAL'}
- Identified Mistakes: ${entry.mistakes || '❌ NO SELF-REFLECTION RECORDED'}

═══ TRADER PROFILE ANALYSIS ═══
📈 Performance Metrics:
- Total Trades Completed: ${closedTrades.length}
- Win Rate: ${winRate.toFixed(1)}% ${winRate < 50 ? '❌ BELOW BREAK-EVEN' : winRate > 60 ? '✅ SOLID' : '⚠️ MARGINAL'}
- Net Pips: ${totalPips > 0 ? '+' : ''}${totalPips} ${totalPips < 0 ? '❌ LOSING MONEY' : '✅'}
- Average Win: ${avgWin.toFixed(1)} pips | Average Loss: ${avgLoss.toFixed(1)} pips
- Risk:Reward Ratio: ${avgLoss > 0 ? (avgWin/avgLoss).toFixed(2) + (avgWin/avgLoss < 1.5 ? ' ❌ TERRIBLE RR' : ' ✅') : 'INSUFFICIENT DATA'}
- Recent Pattern (Last 5): ${streak} ${recentLosses > 3 ? '❌ LOSING STREAK' : ''}

═══ MANDATORY ANALYSIS FRAMEWORK ═══
Your analysis must address ALL 7 areas with brutal honesty:

1. 🚨 REALITY CHECK: What went wrong? Poor execution, bad timing, emotion-driven decisions?
2. 📊 PATTERN ANALYSIS: Does this trade show improvement or regression in their skills?
3. 💰 RISK EVALUATION: Is position sizing destroying their account? Too aggressive/conservative?
4. 🎯 EXECUTION GRADE: Entry/exit quality, strategy adherence, timing
5. 🧠 PSYCHOLOGY AUDIT: Mental state issues, emotional control, discipline failures
6. 📈 ACTION PLAN: 3 specific, measurable improvements they MUST implement immediately
7. ⭐ TRADE GRADE: A-F rating with harsh justification

CRITICAL INSTRUCTIONS:
- Be ruthlessly honest - losing traders need harsh reality, not comfort
- Focus on actionable improvements, not generic advice
- Call out specific failures and bad habits
- Maximum 350 words - every word must add value
- Use direct, professional language that forces self-reflection`;

    // Call OpenAI API for analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an elite institutional trading mentor with 20+ years experience. Your analysis combines brutal honesty with actionable insights. You identify patterns, expose weaknesses, and provide specific solutions. Your feedback has helped thousands of traders achieve consistent profitability through disciplined execution and proper risk management. Be direct, analytical, and focus on measurable improvements.'
          },
          {
            role: 'user',
            content: tradeAnalysis
          }
        ],
        max_completion_tokens: 450,
        top_p: 0.95,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API Error:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        error: errorText
      });
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const aiResponse = await openAIResponse.json();
    console.log('AI Analysis Generated:', {
      trade_id: entry.id,
      pair: entry.pair,
      result_pips: entry.result_pips,
      feedback_length: aiResponse.choices[0].message.content.length
    });

    const feedback = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ 
      feedback,
      analysis_metadata: {
        trade_pair: entry.pair,
        performance_context: `${winRate.toFixed(1)}% win rate, ${totalPips} total pips`,
        model_used: 'gpt-5-mini-2025-08-07'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-feedback function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate AI feedback' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});