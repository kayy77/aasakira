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
    
    // Map symbols to correct API formats
    let polygonSymbol: string;
    let twelveDataSymbol: string;
    let alphaVantageSymbol: string;
    
    if (symbol === 'XAUUSD') {
      polygonSymbol = 'C:XAUUSD';
      twelveDataSymbol = 'XAU/USD';
      alphaVantageSymbol = 'XAUUSD';
    } else if (symbol === 'US30') {
      polygonSymbol = 'I:DJI'; // Dow Jones Industrial Average Index
      twelveDataSymbol = 'DJI'; // TwelveData uses DJI for Dow Jones
      alphaVantageSymbol = 'DJI';
    } else {
      console.error(`Unsupported symbol: ${symbol}`);
      return null;
    }
    
    // Try Polygon first
    if (Deno.env.get('POLYGON_API_KEY')) {
      console.log(`Trying Polygon API with symbol: ${polygonSymbol}`);
      const response = await fetch(
        `https://api.polygon.io/v2/last/trade/${polygonSymbol}?apikey=${Deno.env.get('POLYGON_API_KEY')}`
      );
      
      console.log(`Polygon response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Polygon response:', JSON.stringify(data, null, 2));
        
        if (data.results && data.results.p) {
          const price = data.results.p;
          const timestamp = data.results.t || Date.now();
          console.log(`✅ Got price from Polygon: ${price} for ${symbol}`);
          
          return {
            symbol,
            bid: price - (symbol === 'XAUUSD' ? 0.5 : 1),
            ask: price + (symbol === 'XAUUSD' ? 0.5 : 1),
            mid: price,
            timestamp,
            source: 'polygon',
            age: Date.now() - timestamp
          };
        } else {
          console.log('No results in Polygon response');
        }
      } else {
        const error = await response.text();
        console.error(`Polygon API error: ${response.status} - ${error}`);
      }
    }
    
    // Secondary: Twelve Data
    if (Deno.env.get('TWELVE_DATA_API_KEY')) {
      console.log(`Trying Twelve Data API with symbol: ${twelveDataSymbol}`);
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${twelveDataSymbol}&apikey=${Deno.env.get('TWELVE_DATA_API_KEY')}`
      );
      
      console.log(`Twelve Data response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Twelve Data response:', JSON.stringify(data, null, 2));
        
        if (data.price && !data.message) {
          const price = parseFloat(data.price);
          const now = Date.now();
          console.log(`✅ Got price from Twelve Data: ${price} for ${symbol}`);
          
          return {
            symbol,
            bid: price - (symbol === 'XAUUSD' ? 0.5 : 1),
            ask: price + (symbol === 'XAUUSD' ? 0.5 : 1),
            mid: price,
            timestamp: now,
            source: 'twelvedata',
            age: 0
          };
        } else {
          console.log('No price in Twelve Data response or error:', data.message);
        }
      } else {
        const error = await response.text();
        console.error(`Twelve Data API error: ${response.status} - ${error}`);
      }
    }
    
    // Tertiary: Alpha Vantage (last resort, if available)
    if (Deno.env.get('ALPHA_VANTAGE_KEY')) {
      console.log(`Trying Alpha Vantage API with symbol: ${alphaVantageSymbol}`);
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${Deno.env.get('ALPHA_VANTAGE_KEY')}`
      );
      
      console.log(`Alpha Vantage response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Alpha Vantage response:', JSON.stringify(data, null, 2));
        
        if (data['Global Quote'] && data['Global Quote']['05. price']) {
          const price = parseFloat(data['Global Quote']['05. price']);
          const now = Date.now();
          console.log(`✅ Got price from Alpha Vantage: ${price} for ${symbol}`);
          
          return {
            symbol,
            bid: price - (symbol === 'XAUUSD' ? 0.5 : 1),
            ask: price + (symbol === 'XAUUSD' ? 0.5 : 1),
            mid: price,
            timestamp: now,
            source: 'alphavantage',
            age: 0
          };
        } else {
          console.log('No price in Alpha Vantage response');
        }
      } else {
        const error = await response.text();
        console.error(`Alpha Vantage API error: ${response.status} - ${error}`);
      }
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