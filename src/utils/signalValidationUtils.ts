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

// Minimum stop loss distance calculator
export function minSLPipsFor(symbol: string, atrPipsM5: number, spreadPips: number): number {
  const base = symbol.endsWith('JPY') ? 10 : 8; // Base minimum for pair type
  const atrBased = Math.round(0.35 * atrPipsM5); // 35% of M5 ATR
  const spreadBased = Math.ceil(1.2 * spreadPips); // 20% above spread
  
  return Math.max(base, atrBased, spreadBased);
}

// Get pair-specific minimum SL distance
export function pairMinSL(symbol: string): number {
  const majors = ['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF'];
  const jpyPairs = ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY', 'NZDJPY', 'CADJPY', 'CHFJPY'];
  
  if (jpyPairs.some(pair => symbol.includes(pair.slice(0, 6)))) {
    return 10; // JPY pairs need larger stops
  }
  
  if (majors.includes(symbol)) {
    return 6; // Major pairs
  }
  
  return 8; // Minor pairs and exotics
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
  
  // 2. Risk-to-Reward Bounds Check
  const rr = Math.abs((ctx.takeProfit - ctx.entry) / (ctx.entry - ctx.stopLoss));
  if (rr < 1 || rr > 3) {
    errors.push({
      code: 'RR_OUT_OF_BOUNDS',
      message: `Risk-to-reward ${rr.toFixed(2)} outside acceptable range (1:1 to 1:3)`,
      severity: 'HIGH',
      details: { actualRR: rr, minRR: 1, maxRR: 3 }
    });
  }
  
  // 3. Price Integrity and Age Check
  if (ctx.priceQuote) {
    const now = Date.now();
    const age = now - ctx.priceQuote.timestamp;
    
    if (age > 1000) { // 1 second max age
      errors.push({
        code: 'PRICE_STALE',
        message: `Price quote is ${age}ms old, exceeds 1000ms limit`,
        severity: 'CRITICAL',
        details: { age, maxAge: 1000 }
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
  
  // 4. Evidence Score Check
  if (ctx.evidenceScore < 75) {
    errors.push({
      code: 'LOW_CONFLUENCE',
      message: `Evidence score ${ctx.evidenceScore} below minimum threshold of 75`,
      severity: 'HIGH',
      details: { evidenceScore: ctx.evidenceScore, minRequired: 75 }
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
  
  // 6. Session and Volatility Check
  if (ctx.session === 'ASIAN' && rr > 2) {
    errors.push({
      code: 'ASIAN_SESSION_HIGH_RR',
      message: `Asian session detected with aggressive R:R ${rr.toFixed(2)}, reducing to max 1:2`,
      severity: 'MEDIUM',
      details: { session: ctx.session, currentRR: rr, maxAsianRR: 2 }
    });
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
  
  // Fix R:R bounds
  const rrError = errors.find(e => e.code === 'RR_OUT_OF_BOUNDS');
  if (rrError) {
    const stopDistance = Math.abs(adjusted.entry - adjusted.stopLoss);
    if (ctx.direction === 'BUY') {
      adjusted.takeProfit = adjusted.entry + (stopDistance * 2); // Cap at 1:2
    } else {
      adjusted.takeProfit = adjusted.entry - (stopDistance * 2);
    }
  }
  
  // Verify adjusted signal is valid
  const adjustedErrors = getCriticalErrors(adjusted);
  return adjustedErrors.length === 0 ? adjusted : null;
}