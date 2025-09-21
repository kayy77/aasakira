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
    console.log('🔍 Testing FCS API directly...');
    
    const fcsApiKey = Deno.env.get('FCS_API_KEY')!;
    console.log(`🔑 API Key available: ${fcsApiKey ? 'YES' : 'NO'}`);
    
    if (!fcsApiKey) {
      return new Response(JSON.stringify({ 
        error: 'FCS_API_KEY environment variable not found',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const testResults = [];

    // Test 1: FCS Profile (to verify API key)
    try {
      console.log('📊 Testing FCS Profile API...');
      const profileUrl = `https://fcsapi.com/api-v3/forex/profile?access_key=${fcsApiKey}`;
      const profileResponse = await fetch(profileUrl);
      const profileData = await profileResponse.json();
      
      testResults.push({
        test: 'Profile API',
        url: profileUrl,
        httpStatus: profileResponse.status,
        apiStatus: profileData.status,
        message: profileData.info || profileData.message,
        data: profileData
      });
    } catch (error) {
      testResults.push({
        test: 'Profile API',
        error: error.message
      });
    }

    // Test 2: Economic Calendar - Today
    try {
      console.log('📅 Testing Economic Calendar - Today...');
      const todayUrl = `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&date=today`;
      const todayResponse = await fetch(todayUrl);
      const todayData = await todayResponse.json();
      
      testResults.push({
        test: 'Calendar Today',
        url: todayUrl,
        httpStatus: todayResponse.status,
        apiStatus: todayData.status,
        message: todayData.info || todayData.message,
        eventCount: Array.isArray(todayData.response) ? todayData.response.length : 0,
        sampleEvents: Array.isArray(todayData.response) ? todayData.response.slice(0, 3) : null,
        data: todayData
      });
    } catch (error) {
      testResults.push({
        test: 'Calendar Today',
        error: error.message
      });
    }

    // Test 3: Economic Calendar - Tomorrow
    try {
      console.log('📅 Testing Economic Calendar - Tomorrow...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];
      
      const tomorrowUrl = `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&date=${tomorrowDate}`;
      const tomorrowResponse = await fetch(tomorrowUrl);
      const tomorrowData = await tomorrowResponse.json();
      
      testResults.push({
        test: 'Calendar Tomorrow',
        url: tomorrowUrl,
        httpStatus: tomorrowResponse.status,
        apiStatus: tomorrowData.status,
        message: tomorrowData.info || tomorrowData.message,
        eventCount: Array.isArray(tomorrowData.response) ? tomorrowData.response.length : 0,
        sampleEvents: Array.isArray(tomorrowData.response) ? tomorrowData.response.slice(0, 5) : null,
        data: tomorrowData
      });
    } catch (error) {
      testResults.push({
        test: 'Calendar Tomorrow',
        error: error.message
      });
    }

    // Test 4: Economic Calendar - This Week
    try {
      console.log('📅 Testing Economic Calendar - This Week...');
      const weekUrl = `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&date=this_week`;
      const weekResponse = await fetch(weekUrl);
      const weekData = await weekResponse.json();
      
      testResults.push({
        test: 'Calendar This Week',
        url: weekUrl,
        httpStatus: weekResponse.status,
        apiStatus: weekData.status,
        message: weekData.info || weekData.message,
        eventCount: Array.isArray(weekData.response) ? weekData.response.length : 0,
        sampleEvents: Array.isArray(weekData.response) ? weekData.response.slice(0, 5) : null,
        data: weekData
      });
    } catch (error) {
      testResults.push({
        test: 'Calendar This Week',
        error: error.message
      });
    }

    // Test 5: Alternative date format
    try {
      console.log('📅 Testing Alternative Date Format...');
      const altUrl = `https://fcsapi.com/api-v3/forex/calendar?access_key=${fcsApiKey}&from=2025-09-21&to=2025-09-23`;
      const altResponse = await fetch(altUrl);
      const altData = await altResponse.json();
      
      testResults.push({
        test: 'Calendar Date Range',
        url: altUrl,
        httpStatus: altResponse.status,
        apiStatus: altData.status,
        message: altData.info || altData.message,
        eventCount: Array.isArray(altData.response) ? altData.response.length : 0,
        sampleEvents: Array.isArray(altData.response) ? altData.response.slice(0, 5) : null,
        data: altData
      });
    } catch (error) {
      testResults.push({
        test: 'Calendar Date Range',
        error: error.message
      });
    }

    console.log('✅ All FCS API tests completed');

    const workingTests = testResults.filter(t => t.httpStatus === 200 && t.apiStatus === true);
    const realEventsFound = testResults.some(t => t.eventCount && t.eventCount > 0);

    return new Response(JSON.stringify({ 
      success: true,
      testResults,
      summary: {
        totalTests: testResults.length,
        workingTests: workingTests.length,
        realEventsFound,
        recommendation: realEventsFound ? 
          'FCS API is working and returning real events' : 
          'FCS API connected but no events returned - may need different date parameters'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 FCS API test error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});