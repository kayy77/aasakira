import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface SignalValidationRequest {
  symbol: string;
  direction: "buy" | "sell";
  entry: number;
  stop: number;
  target: number;
  livePrice: number;
  session: string;
  smartMoneySentiment?: "buy" | "sell" | "neutral";
  liquidityZones?: number[];
  fvgZones?: number[];
  volumeSpike: boolean;
  rsiValue: number;
  confidence: number;
  filtersPassed: string[];
}

interface ValidationResponse {
  valid: boolean;
  adjustments: string[];
  warnings: string[];
  enhancedConfidence?: number;
  suggestedTP?: number;
  suggestedSL?: number;
}

// Smart Money Sentiment API Integration
async function getSmartMoneySentiment(symbol: string): Promise<"buy" | "sell" | "neutral"> {
  try {
    // Placeholder for actual sentiment API integration
    // You can integrate with Santiment, CoinGlass, or similar
    const response = await fetch(`https://api.example-sentiment.com/v1/sentiment/${symbol}`, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY', // Add to Supabase secrets
      }
    });
    
    if (!response.ok) return "neutral";
    
    const data = await response.json();
    return data.sentiment || "neutral";
  } catch (error) {
    console.error("Smart money sentiment error:", error);
    return "neutral";
  }
}

// Volume Profile API Integration
async function getLiquidityZones(symbol: string): Promise<{ liquidityZones: number[], fvgZones: number[] }> {
  try {
    // Placeholder for TradingView webhook or volume profile API
    const response = await fetch(`https://api.example-volume.com/v1/zones/${symbol}`, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
      }
    });
    
    if (!response.ok) return { liquidityZones: [], fvgZones: [] };
    
    const data = await response.json();
    return {
      liquidityZones: data.liquidityZones || [],
      fvgZones: data.fvgZones || []
    };
  } catch (error) {
    console.error("Liquidity zones error:", error);
    return { liquidityZones: [], fvgZones: [] };
  }
}

// Real-time price validation
async function validateLivePrice(symbol: string, currentPrice: number): Promise<{ valid: boolean, actualPrice?: number }> {
  try {
    // Using Polygon.io or TwelveData for price validation
    const response = await fetch(`https://api.polygon.io/v2/last/trade/${symbol}?apikey=YOUR_POLYGON_KEY`);
    
    if (!response.ok) return { valid: false };
    
    const data = await response.json();
    const actualPrice = data.results?.price || currentPrice;
    
    // Allow 0.001 tolerance (0.1 pip for most pairs)
    const tolerance = 0.001;
    const valid = Math.abs(currentPrice - actualPrice) <= tolerance;
    
    return { valid, actualPrice };
  } catch (error) {
    console.error("Price validation error:", error);
    return { valid: false };
  }
}

// Advanced signal validation logic
function validateSignalLogic(signal: SignalValidationRequest): ValidationResponse {
  const adjustments: string[] = [];
  const warnings: string[] = [];
  let valid = true;
  let enhancedConfidence = signal.confidence;

  // 1. Price Validation
  const riskReward = Math.abs(signal.target - signal.entry) / Math.abs(signal.stop - signal.entry);
  if (riskReward < 1.8) {
    adjustments.push("Risk/Reward too low - minimum 1.8:1 required for institutional grade");
    valid = false;
  }

  // 2. Session Filter
  const deadSessions = ["Sydney", "Tokyo"];
  if (deadSessions.includes(signal.session) && signal.filtersPassed.length < 5) {
    adjustments.push("Low liquidity session requires 5+ filter confluence");
    valid = false;
  }

  // 3. Smart Money Sentiment Contradiction
  if (signal.smartMoneySentiment && signal.smartMoneySentiment !== signal.direction) {
    adjustments.push("Contradicts smart money sentiment - major institutions are positioned opposite");
    enhancedConfidence = Math.max(enhancedConfidence - 25, 0);
    if (enhancedConfidence < 50) valid = false;
  }

  // 4. Liquidity Zone Validation
  if (signal.liquidityZones && signal.liquidityZones.length > 0) {
    const targetInLiquidity = signal.liquidityZones.some(zone => 
      Math.abs(signal.target - zone) < 0.0020 // Within 2 pips of liquidity
    );
    
    if (targetInLiquidity) {
      adjustments.push("Take Profit targets liquidity pool - high probability of reversal");
      // Suggest adjusted TP
      const adjustment = signal.direction === "buy" ? 0.0030 : -0.0030;
      const suggestedTP = signal.target + adjustment;
      warnings.push(`Consider TP at ${suggestedTP.toFixed(5)} to avoid liquidity trap`);
    }
  }

  // 5. RSI Validation
  const rsiNeutral = signal.rsiValue > 45 && signal.rsiValue < 55;
  const hasRsiDivergence = signal.filtersPassed.includes("RSI Divergence");
  
  if (rsiNeutral && !hasRsiDivergence) {
    adjustments.push("RSI in neutral zone without divergence - lacks momentum");
    valid = false;
  }

  // 6. Volume Confirmation
  if (!signal.volumeSpike && signal.filtersPassed.length < 5) {
    warnings.push("No volume spike detected - monitor for institutional participation");
    enhancedConfidence = Math.max(enhancedConfidence - 10, 0);
  }

  // 7. Structure Validation
  const hasStructure = signal.filtersPassed.some(filter => 
    ["BOS", "Liquidity Sweep", "FVG"].includes(filter)
  );
  
  if (!hasStructure) {
    adjustments.push("No confirmed market structure shift - entry lacks institutional backing");
    valid = false;
  }

  // 8. Entry Price Alignment
  const entryPriceGap = Math.abs(signal.entry - signal.livePrice);
  if (entryPriceGap > 0.0010) { // More than 1 pip difference
    warnings.push("Entry price not aligned with current live price");
  }

  return {
    valid,
    adjustments,
    warnings,
    enhancedConfidence: enhancedConfidence !== signal.confidence ? enhancedConfidence : undefined
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const signal: SignalValidationRequest = await req.json();

    // Validate required fields
    if (!signal.symbol || !signal.direction || !signal.entry || !signal.stop || !signal.target) {
      return new Response(
        JSON.stringify({ error: 'Missing required signal parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enhanced validation with external APIs
    const [
      priceValidation,
      smartMoneySentiment,
      liquidityData
    ] = await Promise.all([
      validateLivePrice(signal.symbol, signal.livePrice),
      getSmartMoneySentiment(signal.symbol),
      getLiquidityZones(signal.symbol)
    ]);

    // Enrich signal data with external sources
    const enrichedSignal = {
      ...signal,
      smartMoneySentiment: signal.smartMoneySentiment || smartMoneySentiment,
      liquidityZones: signal.liquidityZones || liquidityData.liquidityZones,
      fvgZones: signal.fvgZones || liquidityData.fvgZones
    };

    // Run comprehensive validation
    const validation = validateSignalLogic(enrichedSignal);

    // Add price validation results
    if (!priceValidation.valid) {
      validation.adjustments.push("Live price validation failed - price feed may be stale");
      validation.valid = false;
    }

    // Log validation results for analytics
    console.log('Signal Validation Result:', {
      symbol: signal.symbol,
      valid: validation.valid,
      adjustments: validation.adjustments.length,
      warnings: validation.warnings.length,
      originalConfidence: signal.confidence,
      enhancedConfidence: validation.enhancedConfidence
    });

    return new Response(
      JSON.stringify(validation),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Webhook validation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        valid: false,
        adjustments: ['Internal validation error - signal rejected for safety']
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})