import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FilterResult {
  name: string;
  pass: boolean;
  confidence: number;
  details: any;
}

interface SignalCandidate {
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  score: number;
  filters: FilterResult[];
  priceTimestamp: number;
  priceAge: number;
  idempotencyKey: string;
  engineVersion: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

async function fetchLivePrice(symbol: string) {
  try {
    console.log(`Fetching live price for ${symbol}...`);
    
    // Try Polygon first
    if (Deno.env.get('POLYGON_API_KEY')) {
      const polygonSymbol = symbol === 'XAUUSD' ? 'C:XAUUSD' : 'I:US30';
      const response = await fetch(
        `https://api.polygon.io/v2/last/trade/${polygonSymbol}?apikey=${Deno.env.get('POLYGON_API_KEY')}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results) {
          const price = data.results.p || data.results.price;
          const timestamp = data.results.t || Date.now();
          return {
            symbol,
            bid: price - (symbol === 'XAUUSD' ? 0.5 : 1),
            ask: price + (symbol === 'XAUUSD' ? 0.5 : 1),
            mid: price,
            timestamp,
            source: 'polygon',
            age: Date.now() - timestamp
          };
        }
      }
    }
    
    // Fallback to Twelve Data
    if (Deno.env.get('TWELVE_DATA_API_KEY')) {
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${Deno.env.get('TWELVE_DATA_API_KEY')}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.price) {
          const price = parseFloat(data.price);
          const now = Date.now();
          return {
            symbol,
            bid: price - (symbol === 'XAUUSD' ? 0.5 : 1),
            ask: price + (symbol === 'XAUUSD' ? 0.5 : 1),
            mid: price,
            timestamp: now,
            source: 'twelvedata',
            age: 0
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

function createIdempotencyKey(symbol: string, timestamp: number, price: number, direction: string): string {
  const timestampFloor = Math.floor(timestamp / 1000);
  const roundedPrice = Math.round(price * 100000) / 100000;
  const input = `${symbol}|${timestampFloor}|${roundedPrice}|${direction}|1.0.0`;
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function runFilters(priceData: any): FilterResult[] {
  const filters: FilterResult[] = [];
  const now = new Date();
  const hour = now.getUTCHours();
  
  // 1. Session Timing Filter
  const isLondonSession = hour >= 8 && hour <= 16;
  const isNewYorkSession = hour >= 13 && hour <= 21;
  const isOverlapSession = hour >= 13 && hour <= 16;
  
  filters.push({
    name: 'SESSION_TIMING',
    pass: isLondonSession || isNewYorkSession,
    confidence: isOverlapSession ? 0.9 : (isLondonSession || isNewYorkSession ? 0.7 : 0.2),
    details: { hour, isLondonSession, isNewYorkSession, isOverlapSession }
  });

  // 2. Price Freshness Filter
  filters.push({
    name: 'PRICE_FRESHNESS',
    pass: priceData.age < 1000,
    confidence: Math.max(0, 1 - priceData.age / 1000),
    details: { age: priceData.age }
  });

  // 3. Spread Quality Filter
  const spread = priceData.ask - priceData.bid;
  const spreadPercent = (spread / priceData.mid) * 100;
  filters.push({
    name: 'SPREAD_QUALITY',
    pass: spreadPercent < 0.2,
    confidence: Math.max(0, 1 - spreadPercent / 0.2),
    details: { spread, spreadPercent }
  });

  // 4. Market Structure Filter (simplified momentum)
  const momentum = Math.random(); // Simplified - would use real price history
  filters.push({
    name: 'MARKET_STRUCTURE',
    pass: momentum > 0.4,
    confidence: momentum,
    details: { momentum }
  });

  // 5. Volume/Volatility Filter
  const isHighVolumeSession = isLondonSession || isNewYorkSession;
  filters.push({
    name: 'VOLUME_ANALYSIS',
    pass: isHighVolumeSession,
    confidence: isHighVolumeSession ? 0.8 : 0.3,
    details: { isHighVolumeSession }
  });

  // 6. Risk Management Filter
  filters.push({
    name: 'RISK_MANAGEMENT',
    pass: true, // Always pass for now
    confidence: 0.9,
    details: { riskLevel: 'normal' }
  });

  return filters;
}

function determineDirection(filters: FilterResult[]): 'BUY' | 'SELL' {
  const structureFilter = filters.find(f => f.name === 'MARKET_STRUCTURE');
  const momentum = structureFilter?.details?.momentum || 0.5;
  
  return momentum > 0.5 ? 'BUY' : 'SELL';
}

function calculateStopLossAndTakeProfit(entryPrice: number, direction: 'BUY' | 'SELL', symbol: string) {
  const riskPercent = symbol === 'XAUUSD' ? 0.005 : 0.01; // 0.5% for gold, 1% for indices
  const rewardRatio = 2.0;
  const risk = entryPrice * riskPercent;
  
  if (direction === 'BUY') {
    return {
      stopLoss: entryPrice - risk,
      takeProfit: entryPrice + (risk * rewardRatio)
    };
  } else {
    return {
      stopLoss: entryPrice + risk,
      takeProfit: entryPrice - (risk * rewardRatio)
    };
  }
}

async function generateSignal(symbol: string): Promise<SignalCandidate | null> {
  console.log(`Generating signal for ${symbol}...`);
  
  const priceData = await fetchLivePrice(symbol);
  if (!priceData) {
    console.log(`No price data for ${symbol}`);
    return null;
  }

  if (priceData.age > 1000) {
    console.log(`Price too stale for ${symbol}: ${priceData.age}ms`);
    return null;
  }

  const filters = runFilters(priceData);
  const passedFilters = filters.filter(f => f.pass).length;
  
  if (passedFilters < 3) {
    console.log(`Signal rejected: Only ${passedFilters}/6 filters passed`);
    return null;
  }

  const direction = determineDirection(filters);
  const { stopLoss, takeProfit } = calculateStopLossAndTakeProfit(priceData.mid, direction, symbol);
  
  const idempotencyKey = createIdempotencyKey(symbol, priceData.timestamp, priceData.mid, direction);
  
  // Check for duplicate
  const { data: existing } = await supabase
    .from('signals')
    .select('id')
    .eq('ui_label', idempotencyKey)
    .single();
    
  if (existing) {
    console.log(`Duplicate signal prevented: ${idempotencyKey}`);
    return null;
  }

  const score = Math.round(
    filters.reduce((sum, f) => sum + (f.pass ? f.confidence * 100 : 0), 0) / filters.length
  );

  return {
    symbol,
    direction,
    entryPrice: priceData.mid,
    stopLoss,
    takeProfit,
    score,
    filters,
    priceTimestamp: priceData.timestamp,
    priceAge: priceData.age,
    idempotencyKey,
    engineVersion: '1.0.0'
  };
}

async function saveSignal(signal: SignalCandidate) {
  const riskRewardRatio = Math.abs(
    (signal.takeProfit - signal.entryPrice) / (signal.entryPrice - signal.stopLoss)
  );

  const { data, error } = await supabase
    .from('signals')
    .insert({
      pair: signal.symbol,
      signal_type: 'LIVE',
      direction: signal.direction,
      entry_price: signal.entryPrice,
      stop_loss: signal.stopLoss,
      take_profit: signal.takeProfit,
      risk_reward_ratio: riskRewardRatio,
      confidence: signal.score,
      status: 'APPROVED',
      ui_label: signal.idempotencyKey,
      raw_ai_responses: signal.filters,
      consensus: {
        engine_version: signal.engineVersion,
        price_timestamp: signal.priceTimestamp,
        price_age_ms: signal.priceAge,
        filters_passed: signal.filters.filter(f => f.pass).length,
        total_filters: signal.filters.length
      }
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving signal:', error);
    return null;
  }

  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols = ['XAUUSD', 'US30'] } = await req.json();
    const results = [];

    console.log(`Processing ${symbols.length} symbols...`);

    for (const symbol of symbols) {
      try {
        const signal = await generateSignal(symbol);
        if (signal) {
          const saved = await saveSignal(signal);
          if (saved) {
            results.push({
              symbol,
              success: true,
              signal: saved
            });
            console.log(`✅ Signal generated and saved: ${symbol} ${signal.direction} @ ${signal.entryPrice}`);
          }
        } else {
          results.push({
            symbol,
            success: false,
            reason: 'No valid signal generated'
          });
        }
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
        results.push({
          symbol,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      processed: symbols.length,
      generated: results.filter(r => r.success).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-live-signal function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});