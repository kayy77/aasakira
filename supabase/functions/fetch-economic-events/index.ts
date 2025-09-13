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
    
    // Log first few events to debug structure
    if (rawEvents.length > 0) {
      console.log(`🔍 Sample raw event:`, JSON.stringify(rawEvents[0], null, 2));
    }

    // Filter and transform events (today + next 30 days for broader capture)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    const futureLimit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Next 30 days
    
    console.log(`📅 Filtering events from ${now.toISOString()} to ${futureLimit.toISOString()}`);
    
    const processedEvents = rawEvents
      .filter((event: any) => {
        if (!event.Date) {
          console.log(`⚠️ Event missing date:`, event);
          return false;
        }
        
        // Try multiple date parsing approaches
        let eventDate;
        try {
          // Trading Economics often uses formats like "2025-01-13T15:30:00" or "2025-01-13 15:30:00"
          if (typeof event.Date === 'string') {
            // Handle various formats
            const dateStr = event.Date.replace(' ', 'T'); // Convert space to T if needed
            eventDate = new Date(dateStr);
          } else {
            eventDate = new Date(event.Date);
          }
          
          // Validate the date
          if (isNaN(eventDate.getTime())) {
            console.log(`❌ Invalid date for event: ${event.Date}`, event);
            return false;
          }
          
          const isInRange = eventDate >= now && eventDate <= futureLimit;
          console.log(`📊 Event "${event.Event}" - Date: ${eventDate.toISOString()}, InRange: ${isInRange}`);
          
          return isInRange;
          
        } catch (dateError) {
          console.error(`❌ Date parsing error for event:`, event, dateError);
          return false;
        }
      })
      .map((event: any) => {
        // Use the same robust date parsing as in the filter
        let eventDate;
        try {
          if (typeof event.Date === 'string') {
            const dateStr = event.Date.replace(' ', 'T');
            eventDate = new Date(dateStr);
          } else {
            eventDate = new Date(event.Date);
          }
          
          if (isNaN(eventDate.getTime())) {
            eventDate = new Date(); // Fallback to now if parsing fails
          }
        } catch (error) {
          eventDate = new Date(); // Fallback to now if parsing fails
        }
        
        return {
          event_name: event.Event || 'Unknown Event',
          country: event.Country || 'Unknown',
          currency: event.Currency || 'USD',
          forecast: event.Forecast ? String(event.Forecast) : null,
          previous: event.Previous ? String(event.Previous) : null,
          actual: event.Actual ? String(event.Actual) : null,
          event_time: eventDate.toISOString(),
          importance: event.Impact === 'Low' ? 'LOW' : 
                     event.Impact === 'Medium' ? 'MEDIUM' : 
                     event.Impact === 'High' ? 'HIGH' : 'MEDIUM',
          category: event.Category || 'Economic',
          source: 'trading_economics'
        };
      })
      .slice(0, 50); // Limit to 50 most relevant events

    console.log(`📊 Processing ${processedEvents.length} economic events...`);

    if (processedEvents.length === 0) {
      console.log('⚠️ No events to process after filtering');
      return new Response(JSON.stringify({ 
        success: true, 
        eventsProcessed: 0,
        message: 'No new events found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for existing events to avoid duplicates
    const existingEventsQuery = await supabase
      .from('economic_events')
      .select('event_name, event_time, country')
      .gte('event_time', now.toISOString())
      .lte('event_time', futureLimit.toISOString());

    const existingEvents = existingEventsQuery.data || [];
    const existingKeys = new Set(
      existingEvents.map(e => `${e.event_name}-${e.event_time}-${e.country}`)
    );

    // Filter out events that already exist
    const newEvents = processedEvents.filter(event => {
      const key = `${event.event_name}-${event.event_time}-${event.country}`;
      return !existingKeys.has(key);
    });

    console.log(`📊 ${newEvents.length} new events to insert (${processedEvents.length - newEvents.length} duplicates filtered)`);

    if (newEvents.length === 0) {
      console.log('✅ All events already exist in database');
      return new Response(JSON.stringify({ 
        success: true, 
        eventsProcessed: 0,
        message: 'All events already exist'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert events into database
    const { data: insertedEvents, error: insertError } = await supabase
      .from('economic_events')
      .insert(newEvents)
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