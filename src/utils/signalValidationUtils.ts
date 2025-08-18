// Signal Validation Utilities - Bulletproof Checks
// Prevents catastrophic failures like 0.8 pip stops and stale prices

export interface PriceQuote {
  bid: number;
  ask: number;
  timestamp: number;
  quality?: 'GOLD' | 'SILVER' | 'BRONZE';
  spreadPips?: number;
}

export interface ValidationContext {
  symbol: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  direction: 'BUY' | 'SELL';
  evidenceScore: number;
  atrM5?: number;
  spread?: number;
  session?: string;
  htfMomentum?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  priceQuote?: PriceQuote;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  details?: any;
}

// Pip calculation utility
export function pips(symbol: string, priceDiff: number): number {
  const pipFactor = symbol.endsWith('JPY') ? 100 : 10000;
  return Math.abs(priceDiff) * pipFactor;
}

// Minimum stop loss distance calculator - BROKER REALITY VERSION
export function minSLPipsFor(symbol: string, atrPipsM5: number, spreadPips: number): number {
  const config = SYMBOL_CONFIG[symbol as keyof typeof SYMBOL_CONFIG] || { minSL: 12 };
  const base = config.minSL; // Use broker-tested minimums
  const atrBased = Math.round(0.25 * atrPipsM5); // 25% of M5 ATR for structure buffer
  const spreadBased = Math.ceil(spreadPips + (0.1 * atrPipsM5)); // Spread + 10% ATR buffer
  const brokerBuffer = Math.ceil(base * 0.2); // 20% buffer on top of minimum
  
  return Math.max(base, atrBased, spreadBased) + brokerBuffer;
}

// Broker-first symbol mapping and pip tables
export const SYMBOL_CONFIG = {
  'USDJPY': { broker_symbol: 'USDJPY.pro', pip: 0.01, digits: 3, minSL: 15, spreadThreshold: 1.2 },
  'EURUSD': { broker_symbol: 'EURUSD.ecn', pip: 0.0001, digits: 5, minSL: 8, spreadThreshold: 1.0 },
  'GBPUSD': { broker_symbol: 'GBPUSD.ecn', pip: 0.0001, digits: 5, minSL: 10, spreadThreshold: 1.5 },
  'AUDUSD': { broker_symbol: 'AUDUSD.ecn', pip: 0.0001, digits: 5, minSL: 8, spreadThreshold: 1.2 },
  'NZDUSD': { broker_symbol: 'NZDUSD.ecn', pip: 0.0001, digits: 5, minSL: 10, spreadThreshold: 1.5 },
  'USDCAD': { broker_symbol: 'USDCAD.ecn', pip: 0.0001, digits: 5, minSL: 8, spreadThreshold: 1.2 },
  'USDCHF': { broker_symbol: 'USDCHF.ecn', pip: 0.0001, digits: 5, minSL: 8, spreadThreshold: 1.2 },
  'XAUUSD': { broker_symbol: 'XAUUSD.m', pip: 0.10, digits: 2, minSL: 150, spreadThreshold: 30 }
};

// Session volatility requirements (ATR M5 baselines in pips)
export const ATR_BASELINES = {
  'EURUSD': 5, 'GBPUSD': 7, 'USDJPY': 6, 'AUDUSD': 5,
  'NZDUSD': 6, 'USDCAD': 5, 'USDCHF': 4, 'XAUUSD': 150
};

// Get pair-specific minimum SL distance - BULLETPROOF VERSION
export function pairMinSL(symbol: string): number {
  const config = SYMBOL_CONFIG[symbol as keyof typeof SYMBOL_CONFIG];
  return config ? config.minSL : 12; // Default for unlisted pairs
}

// Comprehensive signal validation
export function validateSignalRobustness(ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // 1. Stop Loss Distance Check (CRITICAL)
  const slPips = pips(ctx.symbol, ctx.entry - ctx.stopLoss);
  const atrPipsM5 = ctx.atrM5 ? pips(ctx.symbol, ctx.atrM5) : 15; // Default ATR if not provided
  const spreadPips = ctx.spread ? pips(ctx.symbol, ctx.spread) : 1.5; // Default spread
  
  const minPips = minSLPipsFor(ctx.symbol, atrPipsM5, spreadPips);
  
  if (slPips < minPips) {
    errors.push({
      code: 'SL_TOO_TIGHT',
      message: `Stop loss ${slPips.toFixed(1)} pips is below minimum ${minPips} pips`,
      severity: 'CRITICAL',
      details: { slPips, minPips, atrPipsM5, spreadPips }
    });
  }
  
  // 2. Risk-to-Reward Bounds Check - CONSERVATIVE WINS-FIRST
  const rr = Math.abs((ctx.takeProfit - ctx.entry) / (ctx.entry - ctx.stopLoss));
  if (rr < 1 || rr > 2) { // Capped at 1:2 for higher win rate
    errors.push({
      code: 'RR_OUT_OF_BOUNDS',
      message: `Risk-to-reward ${rr.toFixed(2)} outside conservative range (1:1 to 1:2)`,
      severity: 'CRITICAL', // Upgraded to CRITICAL for strict enforcement
      details: { actualRR: rr, minRR: 1, maxRR: 2 }
    });
  }
  
  // 3. Price Integrity and Age Check - TIGHTENED RULES
  if (ctx.priceQuote) {
    const now = Date.now();
    const age = now - ctx.priceQuote.timestamp;
    
    if (age > 800) { // Reduced from 1000ms to 800ms max age
      errors.push({
        code: 'PRICE_STALE',
        message: `Price quote is ${age}ms old, exceeds 800ms limit`,
        severity: 'CRITICAL',
        details: { age, maxAge: 800 }
      });
    }
    
    if (ctx.priceQuote.quality && ctx.priceQuote.quality !== 'GOLD') {
      errors.push({
        code: 'PRICE_QUALITY_LOW',
        message: `Price quality ${ctx.priceQuote.quality} below GOLD standard`,
        severity: 'HIGH',
        details: { quality: ctx.priceQuote.quality }
      });
    }
    
    // Check if price already moved past stop loss
    if (ctx.direction === 'BUY' && ctx.priceQuote.bid <= ctx.stopLoss) {
      errors.push({
        code: 'PRICE_PAST_SL',
        message: `Current bid ${ctx.priceQuote.bid} already at/below stop loss ${ctx.stopLoss}`,
        severity: 'CRITICAL',
        details: { currentBid: ctx.priceQuote.bid, stopLoss: ctx.stopLoss }
      });
    }
    
    if (ctx.direction === 'SELL' && ctx.priceQuote.ask >= ctx.stopLoss) {
      errors.push({
        code: 'PRICE_PAST_SL',
        message: `Current ask ${ctx.priceQuote.ask} already at/above stop loss ${ctx.stopLoss}`,
        severity: 'CRITICAL',
        details: { currentAsk: ctx.priceQuote.ask, stopLoss: ctx.stopLoss }
      });
    }
  }
  
  // 4. Evidence Score Check - WINS-FIRST REQUIREMENTS  
  if (ctx.evidenceScore < 85) { // Raised to 85 for higher win rate
    errors.push({
      code: 'LOW_CONFLUENCE',
      message: `Evidence score ${ctx.evidenceScore} below minimum threshold of 85`,
      severity: 'CRITICAL',
      details: { evidenceScore: ctx.evidenceScore, minRequired: 85 }
    });
  }
  
  // 5. HTF Momentum Conflict Check
  if (ctx.htfMomentum) {
    const signalBullish = ctx.direction === 'BUY';
    const htfBullish = ctx.htfMomentum === 'BULLISH';
    
    if (signalBullish !== htfBullish && ctx.htfMomentum !== 'NEUTRAL') {
      errors.push({
        code: 'HTF_MOMENTUM_CONFLICT',
        message: `Signal direction ${ctx.direction} conflicts with HTF momentum ${ctx.htfMomentum}`,
        severity: 'MEDIUM',
        details: { signalDirection: ctx.direction, htfMomentum: ctx.htfMomentum }
      });
    }
  }
  
  // 6. Session and Volatility Check - ENHANCED REGIME FILTERING
  if (ctx.session === 'ASIAN') {
    const atrPips = ctx.atrM5 ? pips(ctx.symbol, ctx.atrM5) : 0;
    const baseline = ATR_BASELINES[ctx.symbol as keyof typeof ATR_BASELINES] || 8;
    
    if (atrPips < baseline) {
      errors.push({
        code: 'ASIAN_LOW_VOLATILITY',
        message: `Asian session with low volatility: ${atrPips.toFixed(1)} < ${baseline} pips`,
        severity: 'CRITICAL',
        details: { session: ctx.session, atrPips, baseline }
      });
    }
    
    if (rr > 1.5) { // Asian session max 1:1.5
      errors.push({
        code: 'ASIAN_SESSION_HIGH_RR',
        message: `Asian session R:R ${rr.toFixed(2)} exceeds 1:1.5 limit`,
        severity: 'CRITICAL',
        details: { session: ctx.session, currentRR: rr, maxAsianRR: 1.5 }
      });
    }
  }

  // 7. Spread Check for Execution
  if (ctx.spread && ctx.priceQuote?.spreadPips) {
    const config = SYMBOL_CONFIG[ctx.symbol as keyof typeof SYMBOL_CONFIG];
    const threshold = config?.spreadThreshold || 2.0;
    
    if (ctx.priceQuote.spreadPips > threshold) {
      errors.push({
        code: 'SPREAD_TOO_WIDE',
        message: `Spread ${ctx.priceQuote.spreadPips.toFixed(1)} pips exceeds ${threshold} pip threshold`,
        severity: 'CRITICAL',
        details: { spreadPips: ctx.priceQuote.spreadPips, threshold }
      });
    }
  }
  
  return errors;
}

// Quick validation for critical errors only
export function quickValidateSignal(ctx: ValidationContext): boolean {
  const errors = validateSignalRobustness(ctx);
  const criticalErrors = errors.filter(e => e.severity === 'CRITICAL');
  return criticalErrors.length === 0;
}

// Get critical errors only
export function getCriticalErrors(ctx: ValidationContext): ValidationError[] {
  const errors = validateSignalRobustness(ctx);
  return errors.filter(e => e.severity === 'CRITICAL');
}

// Auto-adjust signal parameters to fix common issues
export function autoAdjustSignal(ctx: ValidationContext): ValidationContext | null {
  const errors = validateSignalRobustness(ctx);
  let adjusted = { ...ctx };
  
  // Fix tight stop loss
  const slTightError = errors.find(e => e.code === 'SL_TOO_TIGHT');
  if (slTightError && slTightError.details) {
    const { minPips } = slTightError.details;
    const pipValue = ctx.symbol.endsWith('JPY') ? 0.01 : 0.0001;
    const newStopDistance = (minPips * pipValue);
    
    if (ctx.direction === 'BUY') {
      adjusted.stopLoss = ctx.entry - newStopDistance;
      adjusted.takeProfit = ctx.entry + (newStopDistance * 1.5); // 1:1.5 RR
    } else {
      adjusted.stopLoss = ctx.entry + newStopDistance;
      adjusted.takeProfit = ctx.entry - (newStopDistance * 1.5);
    }
  }
  
  // Fix R:R bounds - CONSERVATIVE WINS-FIRST  
  const rrError = errors.find(e => e.code === 'RR_OUT_OF_BOUNDS');
  if (rrError) {
    const stopDistance = Math.abs(adjusted.entry - adjusted.stopLoss);
    const conservativeRR = ctx.session === 'ASIAN' ? 1.5 : 2.0; // Cap based on session
    
    if (ctx.direction === 'BUY') {
      adjusted.takeProfit = adjusted.entry + (stopDistance * conservativeRR);
    } else {
      adjusted.takeProfit = adjusted.entry - (stopDistance * conservativeRR);
    }
  }
  
  // Verify adjusted signal is valid
  const adjustedErrors = getCriticalErrors(adjusted);
  return adjustedErrors.length === 0 ? adjusted : null;
}