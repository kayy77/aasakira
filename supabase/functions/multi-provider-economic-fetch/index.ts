import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataProvider {
  name: string;
  priority: number;
  weight: number;
  fetchEvents: (params?: any) => Promise<EconomicEventRaw[]>;
}

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
  volatilityScore?: number;
  aiAnalysis?: AIAnalysis;
}

interface AIAnalysis {
  preEventForecast: {
    prediction: string;
    confidence: number;
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    reasoning: string;
  };
  postEventReaction?: {
    summary: string;
    marketImpact: string;
    tradeSetup: string;
  };
  volatilityPrediction: number;
  affectedPairs: string[];
}

class MultiProviderDataMesh {
  private providers: DataProvider[] = [];
  private supabase: any;
  private openAiKey: string;

  constructor(supabaseClient: any, openAiKey: string) {
    this.supabase = supabaseClient;
    this.openAiKey = openAiKey;
    this.initializeProviders();
  }

  private initializeProviders() {
    // FCS API Provider
    this.providers.push({
      name: 'FCS',
      priority: 1,
      weight: 0.35,
      fetchEvents: this.fetchFCSEvents.bind(this)
    });

    // Trading Economics Provider
    this.providers.push({
      name: 'TradingEconomics',
      priority: 2,
      weight: 0.30,
      fetchEvents: this.fetchTradingEconomicsEvents.bind(this)
    });

    // Investing.com Provider (backup)
    this.providers.push({
      name: 'Investing',
      priority: 3,
      weight: 0.20,
      fetchEvents: this.fetchInvestingEvents.bind(this)
    });

    // Twelve Data Provider
    this.providers.push({
      name: 'TwelveData',
      priority: 4,
      weight: 0.15,
      fetchEvents: this.fetchTwelveDataEvents.bind(this)
    });
  }

  private async fetchFCSEvents(): Promise<EconomicEventRaw[]> {
    const fcsApiKey = Deno.env.get('FCS_API_KEY');
    if (!fcsApiKey) return [];

    const endpoints = [
      `https://fcsapi.com/api-v3/forex/economy_calendar?access_key=${fcsApiKey}&from=${new Date().toISOString().split('T')[0]}&to=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
      `https://fcsapi.com/api-v3/forex/economy_calendar?access_key=${fcsApiKey}&country=US,GB,EU,JP,AU,CA&from=${new Date().toISOString().split('T')[0]}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status && data.response && Array.isArray(data.response) && data.response.length > 0) {
            return data.response.map((event: any) => ({
              id: `fcs_${event.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: event.event || event.name || 'Economic Event',
              country: event.country || 'Unknown',
              currency: event.currency || 'USD',
              impact: this.mapImpact(event.impact),
              forecast: event.forecast ? String(event.forecast) : null,
              previous: event.previous ? String(event.previous) : null,
              actual: event.actual ? String(event.actual) : null,
              date: this.parseEventDate(event.date),
              source: 'FCS',
              confidence: 0.90
            }));
          }
        }
      } catch (error) {
        console.log(`FCS endpoint failed: ${error.message}`);
      }
    }
    return [];
  }

  private async fetchTradingEconomicsEvents(): Promise<EconomicEventRaw[]> {
    try {
      // Note: Would need Trading Economics API key for real implementation
      const response = await fetch('https://api.tradingeconomics.com/calendar?c=guest:guest&format=json', {
        signal: AbortSignal.timeout(8000)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.slice(0, 20).map((event: any) => ({
            id: `te_${event.CalendarId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: event.Event || 'Economic Event',
            country: event.Country || 'Unknown',
            currency: event.Currency || 'USD',
            impact: this.mapImpact(event.Importance),
            forecast: event.Forecast ? String(event.Forecast) : null,
            previous: event.Previous ? String(event.Previous) : null,
            actual: event.Actual ? String(event.Actual) : null,
            date: this.parseEventDate(event.Date),
            source: 'TradingEconomics',
            confidence: 0.85
          }));
        }
      }
    } catch (error) {
      console.log(`Trading Economics failed: ${error.message}`);
    }
    return [];
  }

  private async fetchInvestingEvents(): Promise<EconomicEventRaw[]> {
    // Placeholder for Investing.com scraping or API
    return [];
  }

  private async fetchTwelveDataEvents(): Promise<EconomicEventRaw[]> {
    // Placeholder for Twelve Data API
    return [];
  }

  private mapImpact(impact: any): 'HIGH' | 'MEDIUM' | 'LOW' {
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

  private parseEventDate(dateInput: any): string {
    try {
      if (!dateInput) return new Date().toISOString();
      if (typeof dateInput === 'string') {
        const date = new Date(dateInput);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      }
      return new Date().toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  async fetchWithConsensus(): Promise<EconomicEventRaw[]> {
    console.log('🚀 Multi-Provider Data Mesh Started');
    
    // Fetch from all providers in parallel
    const providerPromises = this.providers.map(async (provider) => {
      try {
        console.log(`📡 Fetching from ${provider.name}...`);
        const events = await provider.fetchEvents();
        console.log(`✅ ${provider.name}: ${events.length} events`);
        return { provider: provider.name, weight: provider.weight, events };
      } catch (error) {
        console.log(`❌ ${provider.name} failed: ${error.message}`);
        return { provider: provider.name, weight: provider.weight, events: [] };
      }
    });

    const results = await Promise.all(providerPromises);
    
    // Combine and deduplicate events using weighted consensus
    const consensusEvents = this.createWeightedConsensus(results);
    
    // Enhance with AI analysis
    const enhancedEvents = await this.enhanceWithAI(consensusEvents);
    
    console.log(`🎯 Final consensus: ${enhancedEvents.length} events with AI analysis`);
    return enhancedEvents;
  }

  private createWeightedConsensus(results: any[]): EconomicEventRaw[] {
    const eventMap = new Map<string, any>();
    
    results.forEach(({ provider, weight, events }) => {
      events.forEach((event: EconomicEventRaw) => {
        const key = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '')}_${event.currency}_${event.date.split('T')[0]}`;
        
        if (!eventMap.has(key)) {
          eventMap.set(key, {
            ...event,
            sources: [{ provider, weight, confidence: event.confidence }],
            weightedConfidence: event.confidence * weight
          });
        } else {
          const existing = eventMap.get(key);
          existing.sources.push({ provider, weight, confidence: event.confidence });
          existing.weightedConfidence += event.confidence * weight;
          
          // Use data from highest confidence source
          if (event.confidence > existing.confidence) {
            eventMap.set(key, {
              ...event,
              sources: existing.sources,
              weightedConfidence: existing.weightedConfidence
            });
          }
        }
      });
    });

    return Array.from(eventMap.values())
      .map(event => ({
        ...event,
        confidence: Math.min(event.weightedConfidence, 1.0)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private async enhanceWithAI(events: EconomicEventRaw[]): Promise<EconomicEventRaw[]> {
    if (!this.openAiKey) return events;

    const enhancementPromises = events.slice(0, 10).map(async (event) => {
      try {
        const aiAnalysis = await this.generateAIAnalysis(event);
        return { ...event, aiAnalysis };
      } catch (error) {
        console.log(`AI analysis failed for ${event.title}: ${error.message}`);
        return event;
      }
    });

    const enhancedEvents = await Promise.all(enhancementPromises);
    return [...enhancedEvents, ...events.slice(10)];
  }

  private async generateAIAnalysis(event: EconomicEventRaw): Promise<AIAnalysis> {
    const prompt = `Analyze this economic event for forex trading:
Event: ${event.title}
Country: ${event.country}
Currency: ${event.currency}
Impact: ${event.impact}
Forecast: ${event.forecast}
Previous: ${event.previous}

Provide:
1. Pre-event prediction with confidence (0-1)
2. Market bias (BULLISH/BEARISH/NEUTRAL)
3. Volatility score (1-10)
4. Top 3 affected currency pairs
5. Brief reasoning

Respond in JSON format.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert forex market analyst. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.3
      }),
    });

    if (!response.ok) throw new Error('AI analysis failed');
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(aiResponse);
      return {
        preEventForecast: {
          prediction: parsed.prediction || 'No prediction available',
          confidence: parsed.confidence || 0.5,
          bias: parsed.bias || 'NEUTRAL',
          reasoning: parsed.reasoning || 'Analysis unavailable'
        },
        volatilityPrediction: parsed.volatilityScore || 5,
        affectedPairs: parsed.affectedPairs || [`${event.currency}/USD`]
      };
    } catch (parseError) {
      return {
        preEventForecast: {
          prediction: `${event.impact} impact expected for ${event.title}`,
          confidence: 0.6,
          bias: 'NEUTRAL',
          reasoning: 'AI analysis parsing failed'
        },
        volatilityPrediction: event.impact === 'HIGH' ? 8 : event.impact === 'MEDIUM' ? 5 : 3,
        affectedPairs: [`${event.currency}/USD`]
      };
    }
  }
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

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const mesh = new MultiProviderDataMesh(supabase, openAiKey);
    
    // Clear previous events
    await supabase
      .from('economic_events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Fetch with multi-provider consensus
    const consensusEvents = await mesh.fetchWithConsensus();
    
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
        source: `Multi-Provider (${event.sources?.map(s => s.provider).join(', ') || event.source})`
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('economic_events')
        .insert(eventsForDB)
        .select('id');

      if (!insertError && insertedData) {
        insertedEvents = insertedData.length;
        
        // Insert AI analysis
        for (let i = 0; i < insertedData.length && i < consensusEvents.length; i++) {
          const event = consensusEvents[i];
          if (event.aiAnalysis) {
            const { error: analysisError } = await supabase
              .from('event_analysis')
              .insert({
                event_id: insertedData[i].id,
                ai_summary: event.aiAnalysis.preEventForecast.reasoning,
                market_sentiment: event.aiAnalysis.preEventForecast.bias,
                trade_opportunity: `Monitor ${event.aiAnalysis.affectedPairs.join(', ')} for ${event.aiAnalysis.volatilityPrediction}/10 volatility`,
                volatility_level: event.impact,
                affected_pairs: event.aiAnalysis.affectedPairs,
                confidence_score: event.aiAnalysis.preEventForecast.confidence
              });

            if (!analysisError) analysisCount++;
          }
        }
      }
    }

    const qualityScore = consensusEvents.length > 0 
      ? consensusEvents.reduce((sum, e) => sum + (e.confidence || 0.5), 0) / consensusEvents.length
      : 1.0;

    return new Response(JSON.stringify({
      success: true,
      eventsProcessed: insertedEvents,
      analysisGenerated: analysisCount,
      consensusQuality: qualityScore,
      providersUsed: consensusEvents.length > 0 ? consensusEvents[0]?.sources?.length || 1 : 0,
      message: consensusEvents.length > 0 ? 'Multi-provider consensus achieved' : 'No events available'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Multi-provider fetch failed:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Multi-provider economic data fetch failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});