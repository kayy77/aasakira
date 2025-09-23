import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FINNHUB_KEY = Deno.env.get("FINNHUB_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting Finnhub economic events fetch...");
    
    const today = new Date().toISOString().split('T')[0];
    const url = `https://finnhub.io/api/v1/calendar/economic?from=${today}&to=${today}&token=${FINNHUB_KEY}`;
    
    console.log(`📡 Fetching from Finnhub: ${url.replace(FINNHUB_KEY, 'HIDDEN_KEY')}`);
    
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`❌ Finnhub fetch error: ${res.status}`);
      return new Response(`Finnhub fetch error: ${res.status}`, { 
        status: 500,
        headers: corsHeaders 
      });
    }
    
    const data = await res.json();
    console.log(`📊 Finnhub response:`, data);
    
    if (!data || !data.economicCalendar || data.economicCalendar.length === 0) {
      console.log("📅 No events for today");
      return new Response("No events for today", { 
        status: 200,
        headers: corsHeaders 
      });
    }
    
    const events = data.economicCalendar.map((ev: any) => ({
      event_name: ev.event,
      country: ev.country,
      currency: ev.country, // Map country to currency for now
      importance: ev.importance === 3 ? "HIGH" : ev.importance === 2 ? "MEDIUM" : "LOW",
      forecast: ev.forecast?.toString() ?? null,
      actual: ev.actual?.toString() ?? null,
      previous: ev.previous?.toString() ?? null,
      event_time: new Date(ev.date).toISOString(),
      source: "Finnhub",
      category: "Economic"
    }));

    console.log(`📝 Prepared ${events.length} events for insert`);

    const { error } = await supabase.from("economic_events").insert(events);
    if (error) {
      console.error("❌ Supabase insert error:", error);
      return new Response(`Insert error: ${error.message}`, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log(`✅ Successfully inserted ${events.length} events`);
    return new Response(`Inserted ${events.length} events`, { 
      status: 200,
      headers: corsHeaders 
    });
  } catch (e) {
    console.error("❌ Error fetching economic events:", e);
    return new Response(`Error: ${e.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});