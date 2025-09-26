import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Verifying real data sources...');
    
    const fcsApiKey = Deno.env.get('FCS_API_KEY')!;
    const verificationResults = [];

    // Test 1: FCS API Connection
    try {
      console.log('📡 Testing FCS API connection...');
      const fcsTestUrl = `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&date=today`;
      const fcsResponse = await fetch(fcsTestUrl);
      
      const fcsData = await fcsResponse.json();
      
      verificationResults.push({
        provider: 'FCS_API',
        status: fcsResponse.ok ? 'SUCCESS' : 'FAILED',
        httpStatus: fcsResponse.status,
        apiStatus: fcsData.status,
        message: fcsData.info || fcsData.message || 'No message',
        eventCount: Array.isArray(fcsData.response) ? fcsData.response.length : 0,
        sampleEvent: Array.isArray(fcsData.response) && fcsData.response.length > 0 ? 
          {
            title: fcsData.response[0].event || fcsData.response[0].name,
            country: fcsData.response[0].country,
            impact: fcsData.response[0].impact,
            date: fcsData.response[0].date
          } : null,
        rawResponse: JSON.stringify(fcsData).slice(0, 500)
      });
    } catch (error) {
      verificationResults.push({
        provider: 'FCS_API',
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error),
        message: 'Connection failed completely'
      });
    }

    // Test 2: FCS API with different parameters
    try {
      console.log('📡 Testing FCS API with weekly data...');
      const fcsWeekUrl = `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&date=this_week`;
      const weekResponse = await fetch(fcsWeekUrl);
      const weekData = await weekResponse.json();
      
      verificationResults.push({
        provider: 'FCS_API_WEEK',
        status: weekResponse.ok ? 'SUCCESS' : 'FAILED',
        httpStatus: weekResponse.status,
        apiStatus: weekData.status,
        eventCount: Array.isArray(weekData.response) ? weekData.response.length : 0,
        message: weekData.info || 'Weekly data test'
      });
    } catch (error) {
      verificationResults.push({
        provider: 'FCS_API_WEEK',
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 3: Check FCS API Key validity
    try {
      console.log('🔑 Testing FCS API key validity...');
      const keyTestUrl = `https://fcsapi.com/api-v3/forex/profile?access_key=${fcsApiKey}`;
      const keyResponse = await fetch(keyTestUrl);
      const keyData = await keyResponse.json();
      
      verificationResults.push({
        provider: 'FCS_API_KEY_TEST',
        status: keyResponse.ok && keyData.status ? 'VALID' : 'INVALID',
        httpStatus: keyResponse.status,
        apiStatus: keyData.status,
        message: keyData.info || keyData.message || 'Key validation test',
        planInfo: keyData.response || null
      });
    } catch (error) {
      verificationResults.push({
        provider: 'FCS_API_KEY_TEST',
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 4: Alternative free sources
    try {
      console.log('🌐 Testing alternative free sources...');
      
      // Test Yahoo Finance API (free)
      const yahooResponse = await fetch('https://query1.finance.yahoo.com/v1/finance/search?q=EURUSD%3DX');
      
      verificationResults.push({
        provider: 'YAHOO_FINANCE',
        status: yahooResponse.ok ? 'AVAILABLE' : 'UNAVAILABLE',
        httpStatus: yahooResponse.status,
        message: yahooResponse.ok ? 'Alternative data source available' : 'Yahoo Finance blocked'
      });
    } catch (error) {
      verificationResults.push({
        provider: 'YAHOO_FINANCE',
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Summary Analysis
    const workingSources = verificationResults.filter(r => r.status === 'SUCCESS' || r.status === 'VALID');
    const realDataAvailable = workingSources.some(s => s.eventCount && s.eventCount > 0);

    console.log(`✅ Verification complete. Working sources: ${workingSources.length}`);

    return new Response(JSON.stringify({ 
      success: true,
      verificationResults,
      summary: {
        workingSourcesCount: workingSources.length,
        realDataAvailable,
        primarySourceWorking: verificationResults.find(r => r.provider === 'FCS_API')?.status === 'SUCCESS',
        apiKeyValid: verificationResults.find(r => r.provider === 'FCS_API_KEY_TEST')?.status === 'VALID',
        alternativeSourcesAvailable: verificationResults.filter(r => r.provider.includes('YAHOO')).some(r => r.status === 'AVAILABLE'),
        recommendedAction: realDataAvailable ? 
          'Real data available - economic calendar should work normally' :
          'No real data sources available - check API key or use alternative providers'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Verification function error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});