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
    console.log('🔍 Debugging FCS API endpoints...');
    
    const fcsApiKey = Deno.env.get('FCS_API_KEY')!;
    const testResults = [];

    // Test 1: Basic Profile Check
    try {
      console.log('📡 Testing FCS profile endpoint...');
      const profileUrl = `https://fcsapi.com/api-v3/forex/profile?access_key=${fcsApiKey}`;
      const profileResponse = await fetch(profileUrl);
      const profileData = await profileResponse.json();
      
      testResults.push({
        test: 'Profile Check',
        url: profileUrl,
        status: profileResponse.status,
        success: profileResponse.ok,
        data: profileData
      });
    } catch (error) {
      testResults.push({
        test: 'Profile Check',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 2: Economy Calendar with different parameters
    const economyEndpoints = [
      `https://fcsapi.com/api-v3/forex/economy?country=us&access_key=${fcsApiKey}`,
      `https://fcsapi.com/api-v3/forex/economy?country=USD&access_key=${fcsApiKey}`,
      `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&date=today`,
      `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&country=US&date=today`,
    ];

    for (const [index, url] of economyEndpoints.entries()) {
      try {
        console.log(`📡 Testing endpoint ${index + 1}: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        
        testResults.push({
          test: `Economy Endpoint ${index + 1}`,
          url: url.replace(fcsApiKey, 'HIDDEN'),
          status: response.status,
          success: response.ok,
          eventCount: Array.isArray(data.response) ? data.response.length : 0,
          apiStatus: data.status,
          message: data.info || data.msg || data.message,
          sampleData: Array.isArray(data.response) && data.response.length > 0 ? data.response[0] : null,
          rawResponse: JSON.stringify(data).slice(0, 300)
        });
      } catch (error) {
        testResults.push({
          test: `Economy Endpoint ${index + 1}`,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    console.log(`✅ FCS API debug complete. Found ${testResults.length} test results`);

    return new Response(JSON.stringify({ 
      success: true,
      testResults,
      summary: {
        totalTests: testResults.length,
        successfulTests: testResults.filter(r => r.success).length,
        workingEndpoints: testResults.filter(r => r.eventCount && r.eventCount > 0).length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 FCS debug error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});