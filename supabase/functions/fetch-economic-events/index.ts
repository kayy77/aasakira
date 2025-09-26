import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FINNHUB_KEY = Deno.env.get("FINNHUB_KEY") || "";
const FCS_KEY = Deno.env.get("FCS_API_KEY") || "";
const TE_KEY = Deno.env.get("TRADINGECONOMICS_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// helper: safe fetch with timeout
async function safeFetch(url: string, opts: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// parse date helper (normalizes various formats)
function parseEventTime(raw: any) {
  if (!raw) return null;
  // raw may be UNIX (seconds) or ISO string
  if (typeof raw === "number") {
    // assume seconds
    return new Date(raw * 1000).toISOString();
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString();
  // fallback: try numeric string
  const asNum = Number(raw);
  if (!isNaN(asNum)) return new Date(asNum * 1000).toISOString();
  return null;
}

// normalize impact to Low/Medium/High
function mapImpactFromProvider(raw: any) {
  if (raw === undefined || raw === null) return "Medium";
  const s = String(raw).toLowerCase();
  if (s.includes("high") || s === "3" || s === "3.0") return "High";
  if (s.includes("medium") || s === "2" || s === "2.0") return "Medium";
  return "Low";
}

// dedupe helper - key by event_id | title+time
function dedupeEvents(events: any[]) {
  const map = new Map();
  for (const e of events) {
    const key = e.event_id ? `id:${e.event_id}` : `t:${(e.title||"").slice(0,120)}|${e.event_time || ""}`;
    if (!map.has(key)) map.set(key, e);
    // prefer higher impact if duplicate
    else {
      const existing = map.get(key);
      const order: { [key: string]: number } = { High: 3, Medium: 2, Low: 1 };
      if ((order[e.impact] || 2) > (order[existing.impact] || 2)) map.set(key, e);
    }
  }
  return [...map.values()];
}

// fetch Finnhub calendar (from..to date strings)
async function fetchFinnhub(from: string, to: string) {
  if (!FINNHUB_KEY) return [];
  const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${FINNHUB_KEY}`;
  try {
    const res = await safeFetch(url);
    if (!res.ok) throw new Error(`Finnhub ${res.status}`);
    const json = await res.json();
    const items = (json?.economicCalendar || []);
    return items.map((ev: any) => ({
      event_id: ev.id?.toString() || null,
      title: ev.event,
      country: ev.country,
      currency: ev.currency || null,
      impact: mapImpactFromProvider(ev.importance),
      forecast: ev.forecast?.toString() ?? null,
      actual: ev.actual?.toString() ?? null,
      previous: ev.previous?.toString() ?? null,
      event_time: parseEventTime(ev.date || ev.time),
      source: "finnhub",
      relevance: 0.5
    }));
  } catch (err) {
    console.warn("Finnhub fetch failed:", (err as Error)?.message || err);
    return [];
  }
}

// fetch FCS calendar
async function fetchFCS(from: string, to: string) {
  if (!FCS_KEY) return [];
  const url = `https://fcsapi.com/api-v3/forex/calendar?access_key=${FCS_KEY}&from=${from}&to=${to}`;
  try {
    const res = await safeFetch(url);
    if (!res.ok) throw new Error(`FCS ${res.status}`);
    const json = await res.json();
    const list = json?.response || [];
    return list.map((ev: any) => ({
      event_id: ev.id?.toString() || null,
      title: ev.event || ev.title || ev.name,
      country: ev.country,
      currency: ev.currency || null,
      impact: mapImpactFromProvider(ev.importance || ev.impact),
      forecast: ev.forecast ?? null,
      actual: ev.actual ?? null,
      previous: ev.previous ?? null,
      event_time: parseEventTime(ev.date || ev.time),
      source: "fcs",
      relevance: 0.5
    }));
  } catch (err) {
    console.warn("FCS fetch failed:", (err as Error)?.message || err);
    return [];
  }
}

// tradingeconomics fallback
async function fetchTradingEconomics(from: string, to: string) {
  if (!TE_KEY) return [];
  const url = `https://api.tradingeconomics.com/calendar?from=${from}&to=${to}&c=${encodeURIComponent(TE_KEY)}&f=json`;
  try {
    const res = await safeFetch(url);
    if (!res.ok) throw new Error(`TE ${res.status}`);
    const json = await res.json();
    return (json || []).map((ev: any) => ({
      event_id: ev.EventId?.toString() || null,
      title: ev.Event || ev.event,
      country: ev.Country || ev.country,
      currency: ev.Currency || null,
      impact: mapImpactFromProvider(ev.Importance || ev.importance),
      forecast: ev.Forecast ?? null,
      actual: ev.Actual ?? null,
      previous: ev.Previous ?? null,
      event_time: parseEventTime(ev.Date || ev.date),
      source: "tradingeconomics",
      relevance: 0.6
    }));
  } catch (err) {
    console.warn("TradingEconomics fetch failed:", (err as Error)?.message || err);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // fetch window: today +/- 1 day (avoid empty days)
    const today = new Date();
    const from = new Date(today.getTime() - 24*60*60*1000).toISOString().split("T")[0];
    const to = new Date(today.getTime() + 24*60*60*1000).toISOString().split("T")[0];

    console.log(`Fetching calendar from ${from} to ${to}`);

    const [fcs, finnhub, te] = await Promise.all([
      fetchFCS(from, to),
      fetchFinnhub(from, to),
      fetchTradingEconomics(from, to)
    ]);

    let combined = [...fcs, ...finnhub, ...te];

    // filter out entries without event_time
    combined = combined.filter(e => e.title && e.event_time);

    if (combined.length === 0) {
      console.log("No events fetched from providers");
      return new Response(JSON.stringify({ success: true, eventsProcessed: 0, message: "No events retrieved" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // dedupe & normalize fields
    const deduped = dedupeEvents(combined).map(ev => ({
      event_id: ev.event_id || (`evt_${(ev.title||'').slice(0,60)}_${ev.event_time}`),
      title: ev.title,
      country: ev.country || null,
      currency: ev.currency || null,
      impact: ev.impact || "Medium",
      forecast: ev.forecast ?? null,
      previous: ev.previous ?? null,
      actual: ev.actual ?? null,
      event_time: ev.event_time,
      source: ev.source || "mixed",
      relevance: ev.relevance ?? 0.5,
      updated_at: new Date().toISOString()
    }));

    // upsert into Supabase (on conflict event_id)
    const { error: upsertError, data: inserted } = await supabase
      .from("economic_events")
      .upsert(deduped, { onConflict: "event_id" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(JSON.stringify({ success: false, error: upsertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Inserted/Updated ${(inserted as any)?.length ?? deduped.length} events`);
    return new Response(JSON.stringify({ success: true, eventsProcessed: (inserted as any)?.length ?? deduped.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Fetcher error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});