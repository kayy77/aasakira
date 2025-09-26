import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataSource {
  name: string;
  url: string;
  headers: Record<string, string>;
  timeout: number;
}

class HeartbeatMonitor {
  private supabase: any;
  private sources: DataSource[] = [];

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    this.initializeSources();
  }

  private initializeSources() {
    // FCS API Health Check
    const fcsKey = Deno.env.get('FCS_API_KEY');
    if (fcsKey) {
      this.sources.push({
        name: 'FCS',
        url: `https://fcsapi.com/api-v3/profile?access_key=${fcsKey}`,
        headers: { 'Accept': 'application/json' },
        timeout: 8000
      });
    }

    // Trading Economics Health Check
    this.sources.push({
      name: 'TradingEconomics', 
      url: 'https://api.tradingeconomics.com/calendar?c=guest:guest&format=json',
      headers: { 'Accept': 'application/json' },
      timeout: 8000
    });

    // Finnhub Health Check
    const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
    if (finnhubKey) {
      this.sources.push({
        name: 'Finnhub',
        url: `https://finnhub.io/api/v1/calendar/economic?token=${finnhubKey}`,
        headers: { 'Accept': 'application/json' },
        timeout: 8000
      });
    }

    // Twelve Data Health Check
    const twelveDataKey = Deno.env.get('TWELVE_DATA_API_KEY');
    if (twelveDataKey) {
      this.sources.push({
        name: 'TwelveData',
        url: `https://api.twelvedata.com/economic_calendar?apikey=${twelveDataKey}`,
        headers: { 'Accept': 'application/json' },
        timeout: 8000
      });
    }

    // Alpha Vantage Health Check
    const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (alphaVantageKey) {
      this.sources.push({
        name: 'AlphaVantage',
        url: `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${alphaVantageKey}&limit=1`,
        headers: { 'Accept': 'application/json' },
        timeout: 8000
      });
    }

    console.log(`💓 Initialized heartbeat monitoring for ${this.sources.length} sources`);
  }

  async performHealthChecks(): Promise<any[]> {
    console.log('💓 Starting heartbeat checks...');
    
    const checkPromises = this.sources.map(async (source) => {
      const startTime = Date.now();
      let result = {
        source: source.name,
        url: source.url,
        status: 'FAILED',
        responseTime: 0,
        httpStatus: 0,
        eventsCount: 0,
        error: null as string | null,
        timestamp: new Date().toISOString()
      };

      try {
        console.log(`🔍 Checking ${source.name}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), source.timeout);

        const response = await fetch(source.url, {
          headers: source.headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        result.responseTime = Date.now() - startTime;
        result.httpStatus = response.status;

        if (response.ok) {
          const data = await response.json();
          result.status = 'ACTIVE';
          
          // Count events based on source structure
          if (source.name === 'FCS' && data.response) {
            result.eventsCount = Array.isArray(data.response) ? data.response.length : 0;
          } else if (source.name === 'TradingEconomics' && Array.isArray(data)) {
            result.eventsCount = data.length;
          } else if (source.name === 'Finnhub' && data.economicCalendar) {
            result.eventsCount = Array.isArray(data.economicCalendar) ? data.economicCalendar.length : 0;
          } else if (source.name === 'TwelveData' && data.data) {
            result.eventsCount = Array.isArray(data.data) ? data.data.length : 0;
          } else if (source.name === 'AlphaVantage' && data.feed) {
            result.eventsCount = Array.isArray(data.feed) ? data.feed.length : 0;
          }

          console.log(`✅ ${source.name}: ${result.responseTime}ms, ${result.eventsCount} events`);
        } else {
          result.error = `HTTP ${response.status}: ${response.statusText}`;
          console.log(`❌ ${source.name}: ${result.error}`);
        }

      } catch (error: any) {
        result.responseTime = Date.now() - startTime;
        result.error = error.name === 'AbortError' ? 'Timeout' : error.message;
        console.log(`❌ ${source.name} failed: ${result.error}`);
      }

      return result;
    });

    const results = await Promise.all(checkPromises);
    await this.storeHeartbeatResults(results);
    await this.storeAuditTrail(results);

    const activeCount = results.filter(r => r.status === 'ACTIVE').length;
    console.log(`💓 Heartbeat complete: ${activeCount}/${results.length} sources active`);

    return results;
  }

  private async storeHeartbeatResults(results: any[]) {
    const heartbeatData = results.map(result => ({
      source_name: result.source,
      last_check: result.timestamp,
      status: result.status,
      error_message: result.error,
      events_count: result.eventsCount,
      response_time_ms: result.responseTime
    }));

    for (const heartbeat of heartbeatData) {
      const { error } = await this.supabase
        .from('data_source_heartbeat')
        .upsert(heartbeat, { 
          onConflict: 'source_name',
          ignoreDuplicates: false 
        });

      if (error) {
        console.log(`Failed to store heartbeat for ${heartbeat.source_name}:`, error);
      }
    }
  }

  private async storeAuditTrail(results: any[]) {
    const auditData = results.map(result => ({
      source_name: result.source,
      endpoint_url: result.url,
      http_status: result.httpStatus,
      response_time_ms: result.responseTime,
      events_parsed: result.eventsCount,
      success: result.status === 'ACTIVE',
      error_details: result.error,
      timestamp: result.timestamp
    }));

    const { error } = await this.supabase
      .from('api_response_audit')
      .insert(auditData);

    if (error) {
      console.log('Failed to store audit trail:', error);
    }
  }

  async getSystemStatus(): Promise<any> {
    const { data: heartbeats, error } = await this.supabase
      .from('data_source_heartbeat')
      .select('*')
      .order('last_check', { ascending: false });

    if (error) {
      throw new Error(`Failed to get system status: ${error.message}`);
    }

    const activeSources = (heartbeats || []).filter((h: any) => h.status === 'ACTIVE');
    const avgResponseTime = activeSources.length > 0 
      ? Math.round(activeSources.reduce((sum: number, h: any) => sum + (h.response_time_ms || 0), 0) / activeSources.length)
      : 0;

    return {
      totalSources: this.sources.length,
      activeSources: activeSources.length,
      failedSources: (heartbeats || []).filter((h: any) => h.status === 'FAILED').length,
      avgResponseTime,
      lastCheck: heartbeats?.[0]?.last_check || null,
      sources: heartbeats || []
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

    const { action } = await req.json().catch(() => ({ action: 'check' }));
    const monitor = new HeartbeatMonitor(supabase);

    if (action === 'status') {
      const status = await monitor.getSystemStatus();
      return new Response(JSON.stringify({
        success: true,
        ...status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default action: perform health checks
    const results = await monitor.performHealthChecks();
    const activeCount = results.filter(r => r.status === 'ACTIVE').length;
    
    return new Response(JSON.stringify({
      success: true,
      message: `Heartbeat monitoring complete: ${activeCount}/${results.length} sources active`,
      activeSources: activeCount,
      totalSources: results.length,
      avgResponseTime: Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length),
      results: results.map(r => ({
        source: r.source,
        status: r.status,
        responseTime: r.responseTime,
        eventsCount: r.eventsCount
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Heartbeat monitoring failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Heartbeat monitoring failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});