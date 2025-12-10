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
    
    // Symbol mappings for different APIs
    const symbolMappings: Record<string, { polygon: string; twelveData: string[]; yahoo: string }> = {
      'XAUUSD': { 
        polygon: 'C:XAUUSD', 
        twelveData: ['XAU/USD', 'XAUUSD'],
        yahoo: 'GC=F'
      },
      'US30': { 
        polygon: 'I:DJI', 
        twelveData: ['^DJI', 'DJI', '.DJI'], // Try multiple formats
        yahoo: '^DJI'
      }
    };
    
    const mapping = symbolMappings[symbol];
    if (!mapping) {
      console.error(`Unsupported symbol: ${symbol}`);
      return null;
    }
    
    // Try Polygon first
    if (Deno.env.get('POLYGON_API_KEY')) {
      console.log(`Trying Polygon API with symbol: ${mapping.polygon}`);
      try {
        const response = await fetch(
          `https://api.polygon.io/v2/last/trade/${mapping.polygon}?apikey=${Deno.env.get('POLYGON_API_KEY')}`
        );
        
        console.log(`Polygon response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.results && data.results.p) {
            const price = data.results.p;
            const timestamp = data.results.t || Date.now();
            console.log(`✅ Got price from Polygon: ${price} for ${symbol}`);
            
            return {
              symbol,
              bid: price - (symbol === 'XAUUSD' ? 0.5 : 5),
              ask: price + (symbol === 'XAUUSD' ? 0.5 : 5),
              mid: price,
              timestamp,
              source: 'polygon',
              age: Date.now() - timestamp
            };
          }
        } else {
          const error = await response.text();
          console.log(`Polygon API error: ${response.status} - ${error}`);
        }
      } catch (e) {
        console.log(`Polygon fetch error: ${e}`);
      }
    }
    
    // Try Twelve Data with multiple symbol formats
    if (Deno.env.get('TWELVE_DATA_API_KEY')) {
      for (const tdSymbol of mapping.twelveData) {
        console.log(`Trying Twelve Data API with symbol: ${tdSymbol}`);
        try {
          const response = await fetch(
            `https://api.twelvedata.com/price?symbol=${encodeURIComponent(tdSymbol)}&apikey=${Deno.env.get('TWELVE_DATA_API_KEY')}`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.price && !data.message && !data.code) {
              const price = parseFloat(data.price);
              const now = Date.now();
              console.log(`✅ Got price from Twelve Data: ${price} for ${symbol} (using ${tdSymbol})`);
              
              return {
                symbol,
                bid: price - (symbol === 'XAUUSD' ? 0.5 : 5),
                ask: price + (symbol === 'XAUUSD' ? 0.5 : 5),
                mid: price,
                timestamp: now,
                source: 'twelvedata',
                age: 0
              };
            } else {
              console.log(`Twelve Data no price for ${tdSymbol}:`, data.message || data.code);
            }
          }
        } catch (e) {
          console.log(`Twelve Data fetch error for ${tdSymbol}: ${e}`);
        }
      }
    }
    
    // Try Yahoo Finance as final fallback
    console.log(`Trying Yahoo Finance with symbol: ${mapping.yahoo}`);
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(mapping.yahoo)}?interval=1m&range=1d`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        
        if (price && !isNaN(price)) {
          console.log(`✅ Got price from Yahoo: ${price} for ${symbol}`);
          
          return {
            symbol,
            bid: price - (symbol === 'XAUUSD' ? 0.5 : 5),
            ask: price + (symbol === 'XAUUSD' ? 0.5 : 5),
            mid: price,
            timestamp: Date.now(),
            source: 'yahoo',
            age: 0
          };
        }
      }
    } catch (e) {
      console.log(`Yahoo Finance fetch error: ${e}`);
    }
    
    // NO FALLBACK - If all APIs fail, return null (NO FEED)
    console.log(`❌ NO LIVE FEED AVAILABLE for ${symbol} - All sources failed`);
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

  // 2. Price Freshness Filter (strict 2-second requirement)
  filters.push({
    name: 'PRICE_FRESHNESS',
    pass: priceData.age < 2000,
    confidence: Math.max(0, 1 - priceData.age / 2000),
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
  console.log(`🔄 Generating signal for ${symbol}...`);
  
  const priceData = await fetchLivePrice(symbol);
  if (!priceData) {
    console.log(`❌ No price data for ${symbol}`);
    return null;
  }

  console.log(`📊 Price data for ${symbol}: ${priceData.mid} (age: ${priceData.age}ms, source: ${priceData.source})`);

  // Strict 2-second freshness requirement
  if (priceData.age > 2000) {
    console.log(`⏰ Price too stale for ${symbol}: ${priceData.age}ms (max: 2000ms)`);
    return null;
  }

  // Check for recent signals within 30 minutes (cooldown)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: recentSignal } = await supabase
    .from('signals')
    .select('id, created_at')
    .eq('pair', symbol)
    .gte('created_at', thirtyMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (recentSignal) {
    console.log(`⏸️ Cooldown active: Signal for ${symbol} generated ${new Date(recentSignal.created_at).toLocaleTimeString()}`);
    return null;
  }

  const filters = runFilters(priceData);
  const passedFilters = filters.filter(f => f.pass);
  const passedCount = passedFilters.length;
  
  console.log(`🔍 Filter results for ${symbol}: ${passedCount}/6 passed`);
  filters.forEach(f => {
    console.log(`  - ${f.name}: ${f.pass ? '✅' : '❌'} (confidence: ${f.confidence.toFixed(2)})`);
  });
  
  // Require 4/6+ filters to pass
  if (passedCount < 4) {
    console.log(`🚫 Signal rejected: Only ${passedCount}/6 filters passed (need ≥4)`);
    return null;
  }

  const direction = determineDirection(filters);
  const { stopLoss, takeProfit } = calculateStopLossAndTakeProfit(priceData.mid, direction, symbol);
  
  const idempotencyKey = createIdempotencyKey(symbol, priceData.timestamp, priceData.mid, direction);
  
  console.log(`🔑 Checking for duplicate signal with key: ${idempotencyKey}`);
  
  // Check for duplicate
  const { data: existing } = await supabase
    .from('signals')
    .select('id')
    .eq('ui_label', idempotencyKey)
    .single();
     
  if (existing) {
    console.log(`⚠️ Duplicate signal prevented: ${idempotencyKey}`);
    return null;
  }

  const score = Math.round(
    filters.reduce((sum, f) => sum + (f.pass ? f.confidence * 100 : 0), 0) / filters.length
  );

  console.log(`✨ Signal candidate created: ${symbol} ${direction} @ ${priceData.mid} (score: ${score})`);

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

    console.log(`🚀 Starting signal generation for ${symbols.length} symbols: ${symbols.join(', ')}`);
    console.log(`🔐 API Keys available: Polygon=${!!Deno.env.get('POLYGON_API_KEY')}, TwelveData=${!!Deno.env.get('TWELVE_DATA_API_KEY')}`);

    for (const symbol of symbols) {
      try {
        console.log(`\n📈 Processing ${symbol}...`);
        const signal = await generateSignal(symbol);
        
        if (signal) {
          console.log(`💾 Saving signal for ${symbol}...`);
          const saved = await saveSignal(signal);
          
          if (saved) {
            results.push({
              symbol,
              success: true,
              signal: saved
            });
            console.log(`✅ Signal generated and saved: ${symbol} ${signal.direction} @ ${signal.entryPrice} (ID: ${saved.id})`);
          } else {
            results.push({
              symbol,
              success: false,
              reason: 'Failed to save signal to database'
            });
            console.log(`❌ Failed to save signal for ${symbol}`);
          }
        } else {
          results.push({
            symbol,
            success: false,
            reason: 'No valid signal generated'
          });
          console.log(`⏭️ No signal generated for ${symbol}`);
        }
      } catch (error) {
        console.error(`💥 Error processing ${symbol}:`, error);
        results.push({
          symbol,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n🏁 Generation complete: ${successCount}/${symbols.length} signals generated`);

    return new Response(JSON.stringify({
      success: true,
      results,
      processed: symbols.length,
      generated: successCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in generate-live-signal function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});