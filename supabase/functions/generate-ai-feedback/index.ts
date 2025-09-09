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

    // Prepare trade analysis prompt
    const tradeAnalysis = `
Trade Analysis Request:
- Pair: ${entry.pair}
- Direction: ${entry.direction}
- Entry: ${entry.entry_price}
- Exit: ${entry.exit_price || 'Still Open'}
- Strategy: ${entry.strategy}
- Result: ${entry.result_pips ? `${entry.result_pips} pips` : 'Pending'}
- Notes: ${entry.notes || 'No notes provided'}

Please provide concise feedback covering:
1. Trade setup quality (1-2 sentences)
2. Risk management assessment (1-2 sentences) 
3. One key improvement suggestion
4. Overall rating: Excellent/Good/Average/Poor

Keep response under 150 words and focus on actionable insights.
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
            content: 'You are an expert forex trading mentor. Provide concise, actionable feedback on trades to help traders improve. Be encouraging but honest about areas for improvement.'
          },
          {
            role: 'user',
            content: tradeAnalysis
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
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