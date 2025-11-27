import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalMonitoring {
  signal_id: string;
  current_price: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  direction: 'BUY' | 'SELL';
  status: 'ACTIVE' | 'INVALIDATED' | 'TP_HIT' | 'SL_HIT';
  invalidation_reasons: string[];
  distance_to_tp: number;
  distance_to_sl: number;
  structural_break: boolean;
  recommendation: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

async function fetchLivePrice(symbol: string) {
  try {
    let polygonSymbol: string;
    let twelveDataSymbol: string;
    
    if (symbol === 'XAUUSD') {
      polygonSymbol = 'C:XAUUSD';
      twelveDataSymbol = 'XAU/USD';
    } else if (symbol === 'US30') {
      polygonSymbol = 'I:DJI';
      twelveDataSymbol = 'DJI';
    } else {
      return null;
    }
    
    // Try Polygon first
    if (Deno.env.get('POLYGON_API_KEY')) {
      const response = await fetch(
        `https://api.polygon.io/v2/last/trade/${polygonSymbol}?apikey=${Deno.env.get('POLYGON_API_KEY')}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results?.p) {
          return data.results.p;
        }
      }
    }
    
    // Try Twelve Data
    if (Deno.env.get('TWELVE_DATA_API_KEY')) {
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${twelveDataSymbol}&apikey=${Deno.env.get('TWELVE_DATA_API_KEY')}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.price) {
          return parseFloat(data.price);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

function analyzeSignal(
  currentPrice: number,
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  direction: 'BUY' | 'SELL'
): SignalMonitoring {
  const invalidationReasons: string[] = [];
  let status: 'ACTIVE' | 'INVALIDATED' | 'TP_HIT' | 'SL_HIT' = 'ACTIVE';
  let structuralBreak = false;

  // Calculate distances
  const distanceToTP = direction === 'BUY' 
    ? ((takeProfit - currentPrice) / currentPrice) * 100
    : ((currentPrice - takeProfit) / currentPrice) * 100;
    
  const distanceToSL = direction === 'BUY'
    ? ((currentPrice - stopLoss) / currentPrice) * 100
    : ((stopLoss - currentPrice) / currentPrice) * 100;

  // Check if TP hit
  if (direction === 'BUY' && currentPrice >= takeProfit) {
    status = 'TP_HIT';
  } else if (direction === 'SELL' && currentPrice <= takeProfit) {
    status = 'TP_HIT';
  }

  // Check if SL hit
  if (direction === 'BUY' && currentPrice <= stopLoss) {
    status = 'SL_HIT';
    invalidationReasons.push('Stop loss triggered');
  } else if (direction === 'SELL' && currentPrice >= stopLoss) {
    status = 'SL_HIT';
    invalidationReasons.push('Stop loss triggered');
  }

  // Check for structural break (price moved beyond entry in wrong direction)
  const wrongDirectionMove = direction === 'BUY' 
    ? currentPrice < entryPrice * 0.995 // 0.5% below entry
    : currentPrice > entryPrice * 1.005; // 0.5% above entry
    
  if (wrongDirectionMove && status === 'ACTIVE') {
    structuralBreak = true;
    invalidationReasons.push('Price broke structure opposite to trade direction');
  }

  // Check price stalling (price too close to entry for too long - simplified)
  const priceStalling = Math.abs((currentPrice - entryPrice) / entryPrice) < 0.001; // Less than 0.1% movement
  if (priceStalling && status === 'ACTIVE') {
    invalidationReasons.push('Price stalling near entry - consider monitoring closely');
  }

  // Set invalidated status if there are structural issues
  if (structuralBreak && status === 'ACTIVE') {
    status = 'INVALIDATED';
  }

  // Generate recommendation
  let recommendation = '';
  if (status === 'TP_HIT') {
    recommendation = '✅ Take Profit hit! Trade completed successfully.';
  } else if (status === 'SL_HIT') {
    recommendation = '❌ Stop Loss hit. Trade closed with loss.';
  } else if (status === 'INVALIDATED') {
    recommendation = '⚠️ Signal invalidated. Consider closing position.';
  } else if (distanceToTP < 10 && distanceToTP > 0) {
    recommendation = '🎯 Close to Take Profit! Monitor for exit.';
  } else if (distanceToSL < 20 && distanceToSL > 0) {
    recommendation = '⚡ Approaching Stop Loss. Consider risk management.';
  } else {
    recommendation = '✨ Signal still valid. Continue monitoring.';
  }

  return {
    signal_id: '',
    current_price: currentPrice,
    entry_price: entryPrice,
    stop_loss: stopLoss,
    take_profit: takeProfit,
    direction,
    status,
    invalidation_reasons,
    distance_to_tp: distanceToTP,
    distance_to_sl: distanceToSL,
    structural_break: structuralBreak,
    recommendation
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting live signal monitoring...');

    // Get all active signals (last 24 hours, not marked as completed)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: signals, error } = await supabase
      .from('signals')
      .select('*')
      .eq('signal_type', 'LIVE')
      .eq('status', 'APPROVED')
      .gte('created_at', twentyFourHoursAgo)
      .is('outcome', null);

    if (error) throw error;

    console.log(`📊 Monitoring ${signals?.length || 0} active signals`);

    const monitoringResults = [];

    for (const signal of signals || []) {
      console.log(`🔍 Monitoring ${signal.pair}...`);
      
      const currentPrice = await fetchLivePrice(signal.pair);
      
      if (!currentPrice) {
        console.log(`⚠️ No price data for ${signal.pair}`);
        continue;
      }

      const analysis = analyzeSignal(
        currentPrice,
        signal.entry_price,
        signal.stop_loss,
        signal.take_profit,
        signal.direction
      );

      analysis.signal_id = signal.id;

      // Update signal consensus with monitoring data
      const updatedConsensus = {
        ...(signal.consensus || {}),
        monitoring: {
          last_check: new Date().toISOString(),
          current_price: currentPrice,
          status: analysis.status,
          distance_to_tp: analysis.distance_to_tp,
          distance_to_sl: analysis.distance_to_sl,
          structural_break: analysis.structural_break,
          invalidation_reasons: analysis.invalidation_reasons,
          recommendation: analysis.recommendation
        }
      };

      // Update signal outcome if TP/SL hit
      let updateData: any = {
        consensus: updatedConsensus
      };

      if (analysis.status === 'TP_HIT') {
        updateData.outcome = 'WIN';
        updateData.outcome_price = currentPrice;
        updateData.outcome_time = new Date().toISOString();
        const pipsGained = signal.direction === 'BUY'
          ? (currentPrice - signal.entry_price) * (signal.pair === 'XAUUSD' ? 10 : 1)
          : (signal.entry_price - currentPrice) * (signal.pair === 'XAUUSD' ? 10 : 1);
        updateData.pips_result = pipsGained;
      } else if (analysis.status === 'SL_HIT') {
        updateData.outcome = 'LOSS';
        updateData.outcome_price = currentPrice;
        updateData.outcome_time = new Date().toISOString();
        const pipsLost = signal.direction === 'BUY'
          ? (currentPrice - signal.entry_price) * (signal.pair === 'XAUUSD' ? 10 : 1)
          : (signal.entry_price - currentPrice) * (signal.pair === 'XAUUSD' ? 10 : 1);
        updateData.pips_result = pipsLost;
      }

      // Save monitoring data
      const { error: updateError } = await supabase
        .from('signals')
        .update(updateData)
        .eq('id', signal.id);

      if (updateError) {
        console.error(`Error updating signal ${signal.id}:`, updateError);
      } else {
        console.log(`✅ Updated ${signal.pair}: ${analysis.status} - ${analysis.recommendation}`);
      }

      monitoringResults.push({
        signal_id: signal.id,
        pair: signal.pair,
        analysis
      });
    }

    console.log(`✅ Monitoring complete: ${monitoringResults.length} signals analyzed`);

    return new Response(JSON.stringify({
      success: true,
      monitored: monitoringResults.length,
      results: monitoringResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in monitor-live-signals:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
