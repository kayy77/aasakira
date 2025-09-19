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

    // Prepare comprehensive analysis prompt
    const tradeAnalysis = `
TRADE PERFORMANCE ANALYSIS - BE BRUTALLY HONEST

Current Trade:
- Pair: ${entry.pair}
- Direction: ${entry.direction}
- Entry: $${entry.entry_price}
- Exit: ${entry.exit_price ? `$${entry.exit_price}` : 'STILL OPEN'}
- Strategy: ${entry.strategy || 'NO STRATEGY SPECIFIED'}
- Result: ${entry.result_pips ? `${entry.result_pips} pips` : 'PENDING'}
- Lot Size: ${entry.lot_size || 'NOT SPECIFIED'}
- Real P&L: ${realPnL ? `$${realPnL.toFixed(2)}` : 'UNKNOWN'}
- Risk Level: ${riskAnalysis}
- Fees: $${entry.fees || 0}
- Notes: ${entry.notes || 'NO NOTES'}
- Feelings: ${entry.feelings || 'NOT RECORDED'}
- Lessons: ${entry.mistakes || 'NONE NOTED'}

Trader Performance Context:
- Total Closed Trades: ${closedTrades.length}
- Win Rate: ${winRate.toFixed(1)}%
- Total Pips: ${totalPips > 0 ? '+' : ''}${totalPips}
- Avg Win: ${avgWin.toFixed(1)} pips
- Avg Loss: ${avgLoss.toFixed(1)} pips
- Risk:Reward Ratio: ${avgLoss > 0 ? (avgWin/avgLoss).toFixed(2) : 'N/A'}

ANALYSIS REQUIREMENTS:
1. 🚨 HARSH REALITY CHECK: Point out obvious mistakes, poor risk management, or bad habits
2. 📊 PERFORMANCE CRITIQUE: How does this trade fit their overall performance pattern?
3. 💰 RISK ASSESSMENT: Is their position sizing appropriate? Are they risking too much?
4. 🎯 EXECUTION ANALYSIS: Was entry/exit timing optimal? Strategy followed correctly?
5. 🧠 PSYCHOLOGICAL ASSESSMENT: Based on notes/feelings, what mental state issues exist?
6. 📈 SPECIFIC IMPROVEMENTS: 3 concrete actions they must take
7. ⭐ RATING: Grade this trade A-F and justify why

Be direct, critical, and focus on real improvement. Don't sugarcoat poor performance.
Maximum 300 words. No fluff.
`;

    // Call OpenAI API for analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a ruthlessly honest elite trading mentor. Your job is to identify weaknesses, call out mistakes, and provide brutal but constructive feedback. Traders need harsh reality checks to improve, not false encouragement. Be direct, specific, and critical when performance is poor.'
          },
          {
            role: 'user',
            content: tradeAnalysis
          }
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiResponse = await openAIResponse.json();
    const feedback = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ feedback }), {
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