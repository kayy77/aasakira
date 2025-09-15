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
    console.log('🚀 Starting economic events fetch...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fcsApiKey = Deno.env.get('FCS_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch economic events from FCS API
    console.log('📡 Fetching events from FCS API...');
    
    const apiUrl = `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&date=today`;
    console.log('📍 API URL:', apiUrl);
    
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      console.error('❌ FCS API error:', apiResponse.status, apiResponse.statusText);
      throw new Error(`FCS API failed: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    console.log('📊 FCS API Response:', apiData);
    
    if (!apiData || !apiData.response) {
      console.log('⚠️ No response data from FCS API');
      return new Response(JSON.stringify({ 
        success: true, 
        eventsProcessed: 0,
        message: 'No events returned from FCS API'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const rawEvents = apiData.response || [];
    console.log(`📊 Received ${rawEvents.length} raw events from FCS API`);
    
    if (rawEvents.length === 0) {
      console.log('⚠️ No events in response array');
      return new Response(JSON.stringify({ 
        success: true, 
        eventsProcessed: 0,
        message: 'No events found in FCS API response'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transform events for database
    const processedEvents = rawEvents.map((event: any) => {
      // Parse date - FCS API may use different formats
      let eventDate = new Date();
      if (event.date) {
        try {
          // Try parsing as Unix timestamp first, then as string
          if (typeof event.date === 'number') {
            eventDate = new Date(event.date * 1000);
          } else {
            eventDate = new Date(event.date);
          }
          
          if (isNaN(eventDate.getTime())) {
            eventDate = new Date();
          }
        } catch (error) {
          console.log(`⚠️ Date parsing failed for event: ${event.event}`);
          eventDate = new Date();
        }
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
    });

    // Insert events into database
    const { data: insertedEvents, error: insertError } = await supabase
      .from('economic_events')
      .insert(processedEvents)
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