import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const fcsApiKey = Deno.env.get('FCS_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting economic events fetch...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch economic events from FCS API
    console.log('📡 Fetching events from FCS API...');
    
    const apiResponse = await fetch(`https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&date=today,tomorrow,week`);
    
    if (!apiResponse.ok) {
      console.error('❌ FCS API error:', apiResponse.status, apiResponse.statusText);
      throw new Error(`FCS API failed: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    const rawEvents = apiData.response || [];
    console.log(`📊 Received ${rawEvents.length} raw events from FCS API`);
    
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
        if (!event.date) {
          console.log(`⚠️ Event missing date:`, event);
          return false;
        }
        
        // FCS API uses Unix timestamp
        let eventDate;
        try {
          if (typeof event.date === 'number') {
            eventDate = new Date(event.date * 1000); // Convert Unix timestamp to milliseconds
          } else if (typeof event.date === 'string') {
            eventDate = new Date(event.date);
          } else {
            eventDate = new Date(event.date);
          }
          
          // Validate the date
          if (isNaN(eventDate.getTime())) {
            console.log(`❌ Invalid date for event: ${event.date}`, event);
            return false;
          }
          
          const isInRange = eventDate >= now && eventDate <= futureLimit;
          console.log(`📊 Event "${event.event}" - Date: ${eventDate.toISOString()}, InRange: ${isInRange}`);
          
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
          if (typeof event.date === 'number') {
            eventDate = new Date(event.date * 1000);
          } else if (typeof event.date === 'string') {
            eventDate = new Date(event.date);
          } else {
            eventDate = new Date(event.date);
          }
          
          if (isNaN(eventDate.getTime())) {
            eventDate = new Date(); // Fallback to now if parsing fails
          }
        } catch (error) {
          eventDate = new Date(); // Fallback to now if parsing fails
        }
        
        return {
          event_name: event.event || 'Unknown Event',
          country: event.country || 'Unknown',
          currency: event.currency || 'USD',
          forecast: event.forecast ? String(event.forecast) : null,
          previous: event.previous ? String(event.previous) : null,
          actual: event.actual ? String(event.actual) : null,
          event_time: eventDate.toISOString(),
          importance: event.impact === '1' ? 'LOW' : 
                     event.impact === '2' ? 'MEDIUM' : 
                     event.impact === '3' ? 'HIGH' : 'MEDIUM',
          category: event.category || 'Economic',
          source: 'fcs_api'
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

    // Generate basic analysis for each new event (simplified for now)
    for (const event of insertedEvents || []) {
      try {
        console.log(`🤖 Generating basic analysis for: ${event.event_name}`);
        
        // Create a simple analysis without OpenAI for now
        const analysis = {
          summary: `${event.importance} impact ${event.event_name} event for ${event.currency}. Expected impact on ${event.currency} pairs.`,
          sentiment: event.importance === 'HIGH' ? 'BULLISH' : 
                    event.importance === 'MEDIUM' ? 'NEUTRAL' : 'NEUTRAL',
          affected_pairs: [`${event.currency}/USD`, `EUR/${event.currency}`].filter(pair => pair !== 'USD/USD'),
          volatility: event.importance,
          trade_opportunity: event.importance === 'HIGH' ? 'Monitor for volatility spikes around event time' : 
                           event.importance === 'MEDIUM' ? 'Moderate impact expected' : 'Low impact expected',
          confidence: event.importance === 'HIGH' ? 0.80 : 0.65
        };

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
          console.log(`✅ Basic analysis saved for ${event.event_name}`);
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