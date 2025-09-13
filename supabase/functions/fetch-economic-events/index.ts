import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting economic events fetch...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch economic events from Trading Economics API
    console.log('📡 Fetching events from Trading Economics API...');
    
    const apiResponse = await fetch('https://api.tradingeconomics.com/calendar?c=guest:guest&f=json');
    
    if (!apiResponse.ok) {
      console.error('❌ Trading Economics API error:', apiResponse.status, apiResponse.statusText);
      throw new Error(`Trading Economics API failed: ${apiResponse.status}`);
    }

    const rawEvents = await apiResponse.json();
    console.log(`📊 Received ${rawEvents.length} raw events from Trading Economics`);

    // Filter and transform events (today + next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const processedEvents = rawEvents
      .filter((event: any) => {
        if (!event.Date) return false;
        const eventDate = new Date(event.Date);
        return eventDate >= now && eventDate <= nextWeek;
      })
      .map((event: any) => ({
        event_name: event.Event || 'Unknown Event',
        country: event.Country || 'Unknown',
        currency: event.Currency || 'USD',
        forecast: event.Forecast ? String(event.Forecast) : null,
        previous: event.Previous ? String(event.Previous) : null,
        actual: event.Actual ? String(event.Actual) : null,
        event_time: new Date(event.Date).toISOString(),
        importance: event.Impact === 'Low' ? 'LOW' : 
                   event.Impact === 'Medium' ? 'MEDIUM' : 
                   event.Impact === 'High' ? 'HIGH' : 'MEDIUM',
        category: event.Category || 'Economic',
        source: 'trading_economics'
      }))
      .slice(0, 50); // Limit to 50 most relevant events

    console.log(`📊 Processing ${processedEvents.length} economic events...`);

    // Insert events into database (use insert with ignore duplicates since we don't have a unique constraint)
    const { data: insertedEvents, error: insertError } = await supabase
      .from('economic_events')
      .insert(processedEvents)
      .select();

    if (insertError) {
      console.error('❌ Error inserting events:', insertError);
      throw insertError;
    }

    console.log(`✅ Inserted ${insertedEvents?.length} events into database`);

    // Generate AI analysis for each new event
    for (const event of insertedEvents || []) {
      try {
        console.log(`🤖 Generating AI analysis for: ${event.event_name}`);
        
        const analysisPrompt = `
        You are an elite trading mentor analyzing economic events for their market impact.
        
        Event: ${event.event_name}
        Country: ${event.country}
        Currency: ${event.currency}
        Forecast: ${event.forecast}
        Previous: ${event.previous}
        Importance: ${event.importance}
        Category: ${event.category}
        
        Provide a concise analysis (max 80 words) including:
        1. Market sentiment (BULLISH/BEARISH/NEUTRAL for ${event.currency})
        2. Key affected currency pairs
        3. Expected volatility level (LOW/MEDIUM/HIGH)
        4. Trade opportunity type (scalp/swing/avoid)
        
        Format your response as JSON:
        {
          "summary": "Brief market impact explanation",
          "sentiment": "BULLISH|BEARISH|NEUTRAL",
          "affected_pairs": ["EUR/USD", "GBP/USD"],
          "volatility": "LOW|MEDIUM|HIGH", 
          "trade_opportunity": "Specific trading advice",
          "confidence": 0.85
        }
        `;

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert forex market analyst. Always respond with valid JSON.' },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (!aiResponse.ok) {
          console.error('❌ OpenAI API error:', await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices[0].message.content;
        
        let analysis;
        try {
          analysis = JSON.parse(aiContent);
        } catch (parseError) {
          console.error('❌ Failed to parse AI response as JSON:', aiContent);
          // Fallback analysis
          analysis = {
            summary: `${event.importance} impact event for ${event.currency}. Monitor closely.`,
            sentiment: event.importance === 'HIGH' ? 'BULLISH' : 'NEUTRAL',
            affected_pairs: [`${event.currency}/USD`],
            volatility: event.importance,
            trade_opportunity: event.importance === 'HIGH' ? 'Monitor for breakouts' : 'Low impact expected',
            confidence: 0.70
          };
        }

        // Insert analysis into database
        const { error: analysisError } = await supabase
          .from('event_analysis')
          .upsert({
            event_id: event.id,
            ai_summary: analysis.summary,
            market_sentiment: analysis.sentiment,
            trade_opportunity: analysis.trade_opportunity,
            volatility_level: analysis.volatility,
            affected_pairs: analysis.affected_pairs,
            confidence_score: analysis.confidence
          });

        if (analysisError) {
          console.error('❌ Error inserting analysis:', analysisError);
        } else {
          console.log(`✅ AI analysis saved for ${event.event_name}`);
        }

      } catch (analysisError) {
        console.error(`❌ Failed to analyze event ${event.event_name}:`, analysisError);
      }
    }

    console.log('🎉 Economic events fetch completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      eventsProcessed: insertedEvents?.length || 0,
      message: 'Economic events updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in fetch-economic-events function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});