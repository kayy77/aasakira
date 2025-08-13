// Prop-Style Confirmation Engine - Entry Timing Like Trading Desks
// Requires: Sweep → Close Back → IFVG Retest → Micro Trigger → Enter

export interface ConfirmationData {
  symbol: string;
  timeframe: string;
  side: 'BUY' | 'SELL';
  liquiditySweepDetected: boolean;
  closeBackConfirmed: boolean;
  ifvgRetestConfirmed: boolean;
  microTriggerConfirmed: boolean;
  confirmationState: 'NONE' | 'POST_SWEEP_CLOSE' | 'RETEST_CONFIRMED';
  sweepLevel: number;
  ifvgMidpoint: number;
  confirmationCandle: {
    open: number;
    close: number;
    high: number;
    low: number;
    rejected: boolean;
  } | null;
}

export interface ConfirmationResult {
  confirmed: boolean;
  state: 'NONE' | 'POST_SWEEP_CLOSE' | 'RETEST_CONFIRMED';
  entryMethod: 'LIMIT' | 'STOP' | 'MARKET' | 'SKIP';
  entryPrice?: number;
  timeInForce: number; // candles
  reasoning: string[];
}

export class ConfirmationEngine {
  private static readonly RETEST_TOLERANCE = 0.3; // 30% of IFVG range
  private static readonly REJECTION_MIN_PIPS = 2; // minimum rejection size
  private static readonly MAX_TIME_IN_FORCE = 5; // candles

  static analyzeConfirmation(data: ConfirmationData): ConfirmationResult {
    console.log(`🎯 CONFIRMATION ENGINE: ${data.symbol} ${data.side} | Sweep: ${data.liquiditySweepDetected} | Close: ${data.closeBackConfirmed}`);
    
    const result: ConfirmationResult = {
      confirmed: false,
      state: 'NONE',
      entryMethod: 'SKIP',
      timeInForce: 0,
      reasoning: []
    };

    // STEP 1: Check for liquidity sweep
    if (!data.liquiditySweepDetected) {
      result.reasoning.push('No liquidity sweep detected - waiting for structural break');
      return result;
    }

    // STEP 2: Confirm close back in intended direction
    if (!data.closeBackConfirmed) {
      result.reasoning.push('Waiting for close back inside intended direction (ChoCh)');
      result.state = 'NONE';
      return result;
    }

    result.state = 'POST_SWEEP_CLOSE';
    result.reasoning.push('Liquidity swept and closed back - structure broken');

    // STEP 3: Check for IFVG retest
    if (!data.ifvgRetestConfirmed) {
      result.reasoning.push('Waiting for IFVG/OB retest before entry');
      return result;
    }

    result.reasoning.push('IFVG retest confirmed - looking for micro trigger');

    // STEP 4: Micro timeframe rejection confirmation
    if (!data.microTriggerConfirmed || !data.confirmationCandle) {
      result.reasoning.push('Waiting for M1/M5 rejection candle at retest level');
      return result;
    }

    // STEP 5: Validate rejection quality
    const rejectionValid = this.validateRejectionCandle(data);
    if (!rejectionValid.valid) {
      result.reasoning.push(`Rejection invalid: ${rejectionValid.reason}`);
      return result;
    }

    // FULL CONFIRMATION ACHIEVED
    result.confirmed = true;
    result.state = 'RETEST_CONFIRMED';
    result.reasoning.push('Full confirmation sequence complete - ready for entry');

    // Determine entry method and price
    const entrySetup = this.calculateEntrySetup(data);
    result.entryMethod = entrySetup.method;
    result.entryPrice = entrySetup.price;
    result.timeInForce = entrySetup.timeInForce;

    console.log(`🎯 CONFIRMED: ${data.symbol} ${data.side} | Method: ${result.entryMethod} | Price: ${result.entryPrice}`);
    
    return result;
  }

  private static validateRejectionCandle(data: ConfirmationData): { valid: boolean; reason?: string } {
    if (!data.confirmationCandle) {
      return { valid: false, reason: 'No confirmation candle data' };
    }

    const candle = data.confirmationCandle;
    const pipFactor = data.symbol.includes('JPY') ? 100 : 10000;

    // Check if candle actually rejected
    if (!candle.rejected) {
      return { valid: false, reason: 'Candle did not show rejection' };
    }

    // Validate rejection size
    const rejectionSize = data.side === 'BUY' 
      ? (candle.high - candle.close) * pipFactor
      : (candle.close - candle.low) * pipFactor;

    if (rejectionSize < this.REJECTION_MIN_PIPS) {
      return { valid: false, reason: `Rejection too small: ${rejectionSize.toFixed(1)} pips` };
    }

    // Check proximity to IFVG midpoint
    const distanceFromMidpoint = Math.abs(candle.close - data.ifvgMidpoint) * pipFactor;
    const maxDistance = 5; // 5 pips tolerance

    if (distanceFromMidpoint > maxDistance) {
      return { valid: false, reason: `Too far from IFVG midpoint: ${distanceFromMidpoint.toFixed(1)} pips` };
    }

    // Validate candle closed in intended direction
    const closedCorrectly = data.side === 'BUY' 
      ? candle.close > candle.open
      : candle.close < candle.open;

    if (!closedCorrectly) {
      return { valid: false, reason: 'Candle closed against intended direction' };
    }

    return { valid: true };
  }

  private static calculateEntrySetup(data: ConfirmationData): { 
    method: 'LIMIT' | 'STOP' | 'MARKET'; 
    price: number; 
    timeInForce: number;
  } {
    if (!data.confirmationCandle) {
      return { method: 'MARKET', price: data.ifvgMidpoint, timeInForce: 1 };
    }

    const candle = data.confirmationCandle;
    
    // Prefer limit order at IFVG midpoint
    const limitPrice = data.ifvgMidpoint;
    
    // If we're still within tolerance of midpoint, use limit
    const currentDistance = Math.abs(candle.close - limitPrice);
    const pipFactor = data.symbol.includes('JPY') ? 100 : 10000;
    const distancePips = currentDistance * pipFactor;

    if (distancePips <= 3) {
      return {
        method: 'LIMIT',
        price: limitPrice,
        timeInForce: this.MAX_TIME_IN_FORCE
      };
    }

    // If price moved away from midpoint, use stop order beyond confirmation
    const buffer = (2 / pipFactor); // 2 pip buffer
    const stopPrice = data.side === 'BUY'
      ? candle.high + buffer
      : candle.low - buffer;

    return {
      method: 'STOP',
      price: stopPrice,
      timeInForce: 3 // shorter time for stop orders
    };
  }

  // Simulate confirmation data for testing/validation
  static simulateConfirmation(
    symbol: string, 
    side: 'BUY' | 'SELL',
    hasSwept: boolean = true,
    hasClosedBack: boolean = true,
    hasRetested: boolean = true,
    hasMicroTrigger: boolean = true
  ): ConfirmationData {
    const basePrice = side === 'BUY' ? 1.1000 : 1.1100;
    const sweepLevel = side === 'BUY' ? basePrice - 0.0020 : basePrice + 0.0020;
    const ifvgMidpoint = side === 'BUY' ? basePrice - 0.0010 : basePrice + 0.0010;

    return {
      symbol,
      timeframe: 'M15',
      side,
      liquiditySweepDetected: hasSwept,
      closeBackConfirmed: hasClosedBack,
      ifvgRetestConfirmed: hasRetested,
      microTriggerConfirmed: hasMicroTrigger,
      confirmationState: hasMicroTrigger ? 'RETEST_CONFIRMED' : 
                        hasClosedBack ? 'POST_SWEEP_CLOSE' : 'NONE',
      sweepLevel,
      ifvgMidpoint,
      confirmationCandle: hasMicroTrigger ? {
        open: ifvgMidpoint + (side === 'BUY' ? -0.0002 : 0.0002),
        close: ifvgMidpoint + (side === 'BUY' ? 0.0001 : -0.0001),
        high: ifvgMidpoint + (side === 'BUY' ? 0.0003 : 0.0001),
        low: ifvgMidpoint + (side === 'BUY' ? -0.0003 : -0.0001),
        rejected: true
      } : null
    };
  }

  // Quick confirmation check for existing signals
  static quickConfirmationCheck(
    liquiditySweep: boolean,
    closeBack: boolean,
    ifvgRetest: boolean,
    microTrigger: boolean
  ): 'NONE' | 'POST_SWEEP_CLOSE' | 'RETEST_CONFIRMED' {
    if (!liquiditySweep) return 'NONE';
    if (!closeBack) return 'NONE';
    if (!ifvgRetest || !microTrigger) return 'POST_SWEEP_CLOSE';
    return 'RETEST_CONFIRMED';
  }
}

export const confirmationEngine = ConfirmationEngine;