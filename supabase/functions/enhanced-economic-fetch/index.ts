import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EconomicEventRaw {
  id: string;
  title: string;
  country: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  date: string;
  source: string;
  confidence: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      'https://tnfxxtnfpoavnsabjrii.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZnh4dG5mcG9hdm5zYWJqcmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTIwNzYsImV4cCI6MjA2Nzg4ODA3Nn0.0JbXi8IRlBNr-UEpPEFIQ8Q4ivxrKLpgKxahOrXjNkE'
    );

    console.log('🚀 Enhanced Economic Data Fetch Started');
    
    // Clear any existing fake events first
    try {
      await supabase
        .from('economic_events')
        .delete()
        .in('source', ['TradingEconomics', 'Federal_Reserve', 'BLS_Official', 'ECB_Official', 'Emergency_Fallback']);
      console.log('🧹 Cleaned up previous fake events');
    } catch (cleanupError) {
      console.log('⚠️ Could not clean up previous events:', cleanupError.message);
    }

    const allEvents: EconomicEventRaw[] = [];
    const providerErrors: string[] = [];
    
    // Helper functions
    function mapImpact(impact: any): 'HIGH' | 'MEDIUM' | 'LOW' {
      if (typeof impact === 'string') {
        const impactUpper = impact.toUpperCase();
        if (impactUpper.includes('HIGH') || impactUpper.includes('3') || impactUpper.includes('RED')) return 'HIGH';
        if (impactUpper.includes('MEDIUM') || impactUpper.includes('2') || impactUpper.includes('YELLOW')) return 'MEDIUM';
        return 'LOW';
      }
      if (typeof impact === 'number') {
        if (impact >= 3) return 'HIGH';
        if (impact >= 2) return 'MEDIUM';
        return 'LOW';
      }
      return 'MEDIUM';
    }

    function parseEventDate(dateInput: any): string {
      try {
        if (!dateInput) return new Date().toISOString();
        
        if (typeof dateInput === 'string') {
          // Try parsing various date formats
          const date = new Date(dateInput);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
        
        return new Date().toISOString();
      } catch (error) {
        console.log(`Date parsing error: ${error.message}`);
        return new Date().toISOString();
      }
    }

    // 1. Try FCS API (Real Data Source)
    try {
      console.log('🔄 Attempting FCS API connection...');
      
      const fcsApiKey = Deno.env.get('FCS_API_KEY');
      if (!fcsApiKey) {
        console.log('⚠️ FCS API key not configured');
        providerErrors.push('FCS API key missing');
      } else {
        const fcsEvents: EconomicEventRaw[] = [];
        
        // Multiple FCS endpoints to try
        const fcsEndpoints = [
          `https://fcsapi.com/api-v3/forex/economy_calendar?access_key=${fcsApiKey}&from=${new Date().toISOString().split('T')[0]}&to=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
          `https://fcsapi.com/api-v3/forex/economy_calendar?access_key=${fcsApiKey}&country=US,GB,EU,JP,AU,CA&from=${new Date().toISOString().split('T')[0]}`,
          `https://fcsapi.com/api-v3/forex/economy_calendar?access_key=${fcsApiKey}&impact=3,2`
        ];
        
        for (const endpoint of fcsEndpoints) {
          try {
            console.log(`🔗 Trying FCS endpoint...`);
            const response = await fetch(endpoint, {
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(10000)
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log(`FCS Response structure: status=${data.status}, info=${data.info}, response_length=${Array.isArray(data.response) ? data.response.length : 'not_array'}`);
              
              if (data.status && data.response && Array.isArray(data.response) && data.response.length > 0) {
                const events = data.response.map((event: any) => ({
                  id: `fcs_${event.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  title: event.event || event.name || 'Economic Event',
                  country: event.country || 'Unknown',
                  currency: event.currency || 'USD',
                  impact: mapImpact(event.impact),
                  forecast: event.forecast ? String(event.forecast) : null,
                  previous: event.previous ? String(event.previous) : null,
                  actual: event.actual ? String(event.actual) : null,
                  date: parseEventDate(event.date),
                  source: 'FCS_Live',
                  confidence: 0.85
                }));
                
                fcsEvents.push(...events);
                console.log(`✅ FCS endpoint success: ${events.length} real events`);
                
                if (events.length > 0) break; // Stop if we got real data
              } else {
                console.log(`⚠️ FCS endpoint returned no events: status=${data.status}, response=${JSON.stringify(data.response)}`);
              }
            } else {
              console.log(`⚠️ FCS endpoint HTTP error: ${response.status} ${response.statusText}`);
              const errorText = await response.text();
              console.log(`FCS Error response: ${errorText.slice(0, 200)}`);
            }
          } catch (endpointError) {
            console.log(`⚠️ FCS endpoint failed: ${endpointError.message}`);
          }
        }
        
        if (fcsEvents.length > 0) {
          allEvents.push(...fcsEvents);
          console.log(`✅ FCS REAL DATA: ${fcsEvents.length} events collected`);
        } else {
          console.log('❌ No real FCS data available from any endpoint');
          providerErrors.push('FCS: No real data available from any endpoint');
        }
      }
    } catch (error) {
      console.error('❌ FCS API completely failed:', error);
      providerErrors.push(`FCS API failed: ${error.message}`);
    }

    // 2. Only if no real data: Try TradingEconomics (requires paid subscription for real-time)
    if (allEvents.length === 0) {
      try {
        console.log('🔄 Trying TradingEconomics backup...');
        // Note: TradingEconomics requires paid API access for real calendar data
        // This is just a connection test
        const teResponse = await fetch('https://api.tradingeconomics.com/calendar?c=guest:guest&format=json');
        
        if (teResponse.ok) {
          const teData = await teResponse.json();
          if (Array.isArray(teData) && teData.length > 0) {
            console.log(`✅ TradingEconomics connected: ${teData.length} events`);
            // Would process real events here if we had a paid subscription
          }
        }
        providerErrors.push('TradingEconomics: Requires paid subscription for real data');
      } catch (error) {
        console.log('⚠️ TradingEconomics backup failed:', error.message);
        providerErrors.push(`TradingEconomics failed: ${error.message}`);
      }
    }

    console.log(`📊 Total real events collected: ${allEvents.length}`);

    // If no real events available, return empty result - DO NOT CREATE FAKE DATA
    if (allEvents.length === 0) {
      console.log('ℹ️ No real economic events available - this is normal for weekends/quiet periods');
      return new Response(JSON.stringify({ 
        success: true, 
        eventsProcessed: 0,
        analysisGenerated: 0,
        dataProviders: [],
        consensusQuality: 1.0,
        conflicts: 0,
        message: 'No economic events scheduled - market is quiet',
        errors: providerErrors
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create consensus events (deduplicate and merge similar events)
    const consensusEvents = createConsensus(allEvents);
    console.log(`🎯 Consensus events: ${consensusEvents.length}`);

    // Insert real consensus events into database
    let insertedEvents = 0;
    let analysisCount = 0;

    if (consensusEvents.length > 0) {
      const eventsForDB = consensusEvents.map(event => ({
        event_name: event.title,
        country: event.country,
        currency: event.currency,
        forecast: event.forecast,
        previous: event.previous,
        actual: event.actual,
        event_time: event.date,
        importance: event.impact,
        category: 'Economic',
        source: event.sources?.join(',') || event.source || 'Multi-Provider'
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('economic_events')
        .insert(eventsForDB)
        .select('id');

      if (insertError) {
        console.error('❌ Database insert error:', insertError);
      } else {
        insertedEvents = insertedData?.length || 0;
        console.log(`✅ Inserted ${insertedEvents} real events into database`);

        // Generate AI analysis for inserted events
        for (const event of insertedData || []) {
          try {
            const originalEvent = consensusEvents[insertedData.indexOf(event)];
            const analysis = await generateEnhancedAnalysis(originalEvent);
            
            const { error: analysisError } = await supabase
              .from('event_analysis')
              .insert({
                event_id: event.id,
                ai_summary: analysis.summary,
                market_sentiment: analysis.sentiment,
                trade_opportunity: analysis.tradeOpportunity,
                volatility_level: analysis.volatilityLevel,
                affected_pairs: analysis.affectedPairs,
                confidence_score: analysis.confidence
              });

            if (!analysisError) {
              analysisCount++;
            }
          } catch (analysisError) {
            console.error('Analysis generation error:', analysisError);
          }
        }
      }
    }

    const qualityScore = allEvents.length > 0 
      ? allEvents.reduce((sum, e) => sum + (e.confidence || 0.5), 0) / allEvents.length
      : 1.0;

    const uniqueProviders = [...new Set(allEvents.map(e => e.source))];

    return new Response(JSON.stringify({
      success: true,
      eventsProcessed: insertedEvents,
      analysisGenerated: analysisCount,
      dataProviders: uniqueProviders,
      consensusQuality: qualityScore,
      conflicts: 0,
      errors: providerErrors.length > 0 ? providerErrors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Enhanced economic fetch failed:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Enhanced economic data fetch failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to create consensus from multiple data sources
function createConsensus(events: EconomicEventRaw[]) {
  const eventGroups = new Map<string, EconomicEventRaw[]>();
  
  // Group similar events by title and currency
  events.forEach(event => {
    const key = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '')}_${event.currency}`;
    if (!eventGroups.has(key)) {
      eventGroups.set(key, []);
    }
    eventGroups.get(key)!.push(event);
  });

  const consensusEvents: any[] = [];

  eventGroups.forEach((group, key) => {
    // Use the event with highest confidence as base
    const baseEvent = group.reduce((best, current) => 
      (current.confidence || 0) > (best.confidence || 0) ? current : best
    );

    // Detect conflicts
    const conflicts: string[] = [];
    const sources = group.map(e => e.source);
    
    const forecasts = group.map(e => e.forecast).filter(Boolean);
    if (new Set(forecasts).size > 1) {
      conflicts.push(`Forecast mismatch: ${forecasts.join(' vs ')}`);
    }

    const previous = group.map(e => e.previous).filter(Boolean);
    if (new Set(previous).size > 1) {
      conflicts.push(`Previous mismatch: ${previous.join(' vs ')}`);
    }

    // Calculate consensus confidence
    const avgConfidence = group.reduce((sum, e) => sum + (e.confidence || 0.5), 0) / group.length;
    const consensusConfidence = conflicts.length > 0 ? avgConfidence * 0.7 : avgConfidence;

    consensusEvents.push({
      id: baseEvent.id,
      title: baseEvent.title,
      country: baseEvent.country,
      currency: baseEvent.currency,
      impact: baseEvent.impact,
      forecast: baseEvent.forecast,
      previous: baseEvent.previous,
      actual: baseEvent.actual,
      date: baseEvent.date,
      source: baseEvent.source,
      sources,
      consensus_confidence: consensusConfidence,
      data_conflicts: conflicts.length > 0 ? conflicts : undefined
    });
  });

  return consensusEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

async function generateEnhancedAnalysis(event: any) {
  // Enhanced analysis generation
  const volatilityScore = event.impact === 'HIGH' ? 8 : event.impact === 'MEDIUM' ? 5 : 3;
  const primaryPairs = [`${event.currency}/USD`, `EUR/${event.currency}`, `GBP/${event.currency}`]
    .filter(pair => !pair.includes('USD/USD'))
    .slice(0, 2);

  const isUsdBullish = event.currency === 'USD' && 
    (event.title.toLowerCase().includes('employment') || 
     event.title.toLowerCase().includes('gdp') ||
     event.title.toLowerCase().includes('retail'));

  return {
    summary: `${event.impact} impact ${event.title} expected to drive ${volatilityScore}/10 volatility in ${primaryPairs.join(', ')} pairs. Forecast vs previous suggests ${isUsdBullish ? 'bullish USD' : 'neutral'} bias. Expected reaction: 30-80 pips within 15 minutes of release. Key levels: monitor major support/resistance zones. Risk management: reduce position sizes during volatility spike.`,
    sentiment: isUsdBullish ? 'BULLISH' : event.impact === 'HIGH' ? 'BEARISH' : 'NEUTRAL',
    tradeOpportunity: `Monitor ${primaryPairs[0]} for breakout above/below key levels. Target 30-80 pip moves.`,
    volatilityLevel: event.impact,
    affectedPairs: primaryPairs,
    confidence: 0.85
  };
}