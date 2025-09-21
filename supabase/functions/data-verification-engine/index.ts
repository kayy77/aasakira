import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataSource {
  name: string;
  url: string;
  headers: Record<string, string>;
  parseResponse: (data: any) => VerifiedEvent[];
  priority: number;
}

interface VerifiedEvent {
  title: string;
  country: string;
  currency: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  time: string;
  importance: string;
  source: string;
  confidence: number;
}

interface CrossCheckResult {
  event: VerifiedEvent;
  matches: number;
  conflicts: string[];
  sources: string[];
  consensusScore: number;
  lastUpdated: string;
}

class DataVerificationEngine {
  private supabase: any;
  private sources: DataSource[] = [];

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    this.initializeSources();
  }

  private initializeSources() {
    // FCS API
    const fcsKey = Deno.env.get('FCS_API_KEY');
    if (fcsKey) {
      this.sources.push({
        name: 'FCS',
        url: `https://fcsapi.com/api-v3/forex/economy_calendar?access_key=${fcsKey}&from=${new Date().toISOString().split('T')[0]}`,
        headers: { 'Accept': 'application/json' },
        parseResponse: this.parseFCSResponse.bind(this),
        priority: 1
      });
    }

    // Trading Economics (public endpoint for verification)
    this.sources.push({
      name: 'TradingEconomics',
      url: 'https://api.tradingeconomics.com/calendar?c=guest:guest&format=json',
      headers: { 'Accept': 'application/json' },
      parseResponse: this.parseTEResponse.bind(this),
      priority: 2
    });

    // Finnhub (if key available)
    const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
    if (finnhubKey) {
      this.sources.push({
        name: 'Finnhub',
        url: `https://finnhub.io/api/v1/calendar/economic?token=${finnhubKey}`,
        headers: { 'Accept': 'application/json' },
        parseResponse: this.parseFinnhubResponse.bind(this),
        priority: 3
      });
    }
  }

  private parseFCSResponse(data: any): VerifiedEvent[] {
    if (!data.status || !data.response || !Array.isArray(data.response)) return [];
    
    return data.response.map((event: any) => ({
      title: event.event || event.name || 'Unknown Event',
      country: event.country || 'Unknown',
      currency: event.currency || 'USD',
      forecast: event.forecast ? String(event.forecast) : null,
      previous: event.previous ? String(event.previous) : null,
      actual: event.actual ? String(event.actual) : null,
      time: event.date || new Date().toISOString(),
      importance: this.mapImpact(event.impact),
      source: 'FCS',
      confidence: 0.90
    }));
  }

  private parseTEResponse(data: any): VerifiedEvent[] {
    if (!Array.isArray(data)) return [];
    
    return data.slice(0, 20).map((event: any) => ({
      title: event.Event || 'Unknown Event',
      country: event.Country || 'Unknown',
      currency: event.Currency || 'USD',
      forecast: event.Forecast ? String(event.Forecast) : null,
      previous: event.Previous ? String(event.Previous) : null,
      actual: event.Actual ? String(event.Actual) : null,
      time: event.Date || new Date().toISOString(),
      importance: this.mapImpact(event.Importance),
      source: 'TradingEconomics',
      confidence: 0.85
    }));
  }

  private parseFinnhubResponse(data: any): VerifiedEvent[] {
    if (!data.economicCalendar || !Array.isArray(data.economicCalendar)) return [];
    
    return data.economicCalendar.map((event: any) => ({
      title: event.event || 'Unknown Event',
      country: event.country || 'Unknown',
      currency: 'USD', // Finnhub typically USD-focused
      forecast: event.estimate ? String(event.estimate) : null,
      previous: event.prev ? String(event.prev) : null,
      actual: event.actual ? String(event.actual) : null,
      time: new Date(event.time * 1000).toISOString(),
      importance: this.mapImpact(event.impact),
      source: 'Finnhub',
      confidence: 0.80
    }));
  }

  private mapImpact(impact: any): string {
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

  async performCrossCheck(): Promise<CrossCheckResult[]> {
    console.log('🔍 Starting cross-verification with multiple sources...');
    
    // Fetch from all sources in parallel
    const sourcePromises = this.sources.map(async (source) => {
      try {
        console.log(`📡 Fetching from ${source.name}...`);
        const response = await fetch(source.url, {
          headers: source.headers,
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const events = source.parseResponse(data);
        console.log(`✅ ${source.name}: ${events.length} events verified`);
        
        return { source: source.name, events, success: true };
      } catch (error) {
        console.log(`❌ ${source.name} verification failed: ${error.message}`);
        return { source: source.name, events: [], success: false, error: error.message };
      }
    });

    const results = await Promise.all(sourcePromises);
    const successfulSources = results.filter(r => r.success);

    if (successfulSources.length === 0) {
      throw new Error('No sources available for cross-verification');
    }

    // Cross-check events across sources
    const crossCheckResults = this.performEventMatching(successfulSources);
    
    // Store verification results
    await this.storeVerificationResults(crossCheckResults, results);

    console.log(`🎯 Cross-verification complete: ${crossCheckResults.length} events verified`);
    return crossCheckResults;
  }

  private performEventMatching(sources: any[]): CrossCheckResult[] {
    const eventMap = new Map<string, any>();
    const now = new Date().toISOString();

    // Group similar events from different sources
    sources.forEach(({ source, events }) => {
      events.forEach((event: VerifiedEvent) => {
        const key = this.createEventKey(event);
        
        if (!eventMap.has(key)) {
          eventMap.set(key, {
            baseEvent: event,
            sources: [source],
            forecasts: new Set(event.forecast ? [event.forecast] : []),
            previous: new Set(event.previous ? [event.previous] : []),
            matches: 1,
            conflicts: []
          });
        } else {
          const existing = eventMap.get(key);
          existing.sources.push(source);
          existing.matches++;

          // Check for conflicts
          if (event.forecast && !existing.forecasts.has(event.forecast)) {
            existing.forecasts.add(event.forecast);
            existing.conflicts.push(`Forecast mismatch: ${Array.from(existing.forecasts).join(' vs ')}`);
          }
          if (event.previous && !existing.previous.has(event.previous)) {
            existing.previous.add(event.previous);
            existing.conflicts.push(`Previous mismatch: ${Array.from(existing.previous).join(' vs ')}`);
          }

          // Use highest priority source as base
          if (event.confidence > existing.baseEvent.confidence) {
            existing.baseEvent = event;
          }
        }
      });
    });

    // Convert to CrossCheckResult format
    return Array.from(eventMap.values()).map(item => ({
      event: item.baseEvent,
      matches: item.matches,
      conflicts: item.conflicts,
      sources: item.sources,
      consensusScore: item.conflicts.length === 0 ? 1.0 : Math.max(0.3, 1.0 - (item.conflicts.length * 0.2)),
      lastUpdated: now
    })).sort((a, b) => b.consensusScore - a.consensusScore);
  }

  private createEventKey(event: VerifiedEvent): string {
    const titleNormalized = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dateKey = event.time.split('T')[0];
    return `${titleNormalized}_${event.currency}_${dateKey}`;
  }

  private async storeVerificationResults(crossCheckResults: CrossCheckResult[], sourceResults: any[]) {
    // Store heartbeat status for each source
    const heartbeatPromises = sourceResults.map(async (result) => {
      const { error: heartbeatError } = await this.supabase
        .from('data_source_heartbeat')
        .upsert({
          source_name: result.source,
          last_check: new Date().toISOString(),
          status: result.success ? 'ACTIVE' : 'FAILED',
          error_message: result.error || null,
          events_count: result.events?.length || 0
        }, { onConflict: 'source_name' });

      if (heartbeatError) {
        console.log(`Failed to store heartbeat for ${result.source}:`, heartbeatError);
      }
    });

    await Promise.all(heartbeatPromises);

    // Store cross-check results
    const verificationData = crossCheckResults.map(result => ({
      event_title: result.event.title,
      event_currency: result.event.currency,
      event_time: result.event.time,
      matches_count: result.matches,
      sources: result.sources,
      conflicts: result.conflicts,
      consensus_score: result.consensusScore,
      forecast_value: result.event.forecast,
      previous_value: result.event.previous,
      actual_value: result.event.actual,
      verified_at: new Date().toISOString()
    }));

    if (verificationData.length > 0) {
      const { error: verificationError } = await this.supabase
        .from('event_verification')
        .insert(verificationData);

      if (verificationError) {
        console.log('Failed to store verification results:', verificationError);
      }
    }
  }

  async getVerificationStatus(): Promise<any> {
    // Get latest heartbeat status
    const { data: heartbeats, error: heartbeatError } = await this.supabase
      .from('data_source_heartbeat')
      .select('*')
      .order('last_check', { ascending: false });

    if (heartbeatError) {
      throw new Error(`Failed to get heartbeat status: ${heartbeatError.message}`);
    }

    // Get latest verification results
    const { data: verifications, error: verificationError } = await this.supabase
      .from('event_verification')
      .select('*')
      .order('verified_at', { ascending: false })
      .limit(20);

    if (verificationError) {
      throw new Error(`Failed to get verification results: ${verificationError.message}`);
    }

    return {
      heartbeats: heartbeats || [],
      verifications: verifications || [],
      sourcesActive: (heartbeats || []).filter(h => h.status === 'ACTIVE').length,
      totalSources: this.sources.length,
      lastUpdate: heartbeats?.[0]?.last_check || null
    };
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

    const { action } = await req.json().catch(() => ({ action: 'cross-check' }));
    const engine = new DataVerificationEngine(supabase);

    if (action === 'status') {
      const status = await engine.getVerificationStatus();
      return new Response(JSON.stringify({
        success: true,
        ...status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default action: perform cross-check
    const results = await engine.performCrossCheck();
    
    return new Response(JSON.stringify({
      success: true,
      eventsVerified: results.length,
      highConfidenceEvents: results.filter(r => r.consensusScore >= 0.8).length,
      conflictsDetected: results.filter(r => r.conflicts.length > 0).length,
      sourcesUsed: [...new Set(results.flatMap(r => r.sources))],
      lastUpdated: new Date().toISOString(),
      results: results.slice(0, 10) // Return top 10 for preview
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Data verification failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Data verification engine failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});