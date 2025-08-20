// Deterministic SMC/ICT Filter Engine
// Core algorithmic implementations for institutional signal validation

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface Swing {
  index: number;
  type: 'high' | 'low';
  price: number;
  strength: number;
}

export interface BOSResult {
  valid: boolean;
  direction: 'bullish' | 'bearish' | null;
  confidence: number;
  reason: string;
}

export interface FVGResult {
  valid: boolean;
  zones: Array<{ from: number; to: number; index: number; strength: number }>;
  strength: number;
}

export interface LiquiditySweepResult {
  valid: boolean;
  type: 'buy' | 'sell' | null;
  level: number;
  confidence: number;
}

export interface OrderBlockResult {
  valid: boolean;
  level: number;
  strength: number;
  direction: 'bullish' | 'bearish' | null;
}

export class DeterministicFilters {
  
  /**
   * Find swing highs and lows using strict algorithmic detection
   */
  static findSwings(candles: Candle[], lookback: number = 20): Swing[] {
    if (candles.length < lookback * 2 + 1) return [];
    
    const swings: Swing[] = [];
    
    for (let i = lookback; i < candles.length - lookback; i++) {
      const current = candles[i];
      let isSwingHigh = true;
      let isSwingLow = true;
      let highStrength = 0;
      let lowStrength = 0;
      
      // Check both sides of current candle
      for (let k = 1; k <= lookback; k++) {
        const leftCandle = candles[i - k];
        const rightCandle = candles[i + k];
        
        // Swing high detection
        if (leftCandle.high >= current.high || rightCandle.high >= current.high) {
          isSwingHigh = false;
        } else {
          highStrength += Math.abs(current.high - Math.max(leftCandle.high, rightCandle.high));
        }
        
        // Swing low detection
        if (leftCandle.low <= current.low || rightCandle.low <= current.low) {
          isSwingLow = false;
        } else {
          lowStrength += Math.abs(Math.min(leftCandle.low, rightCandle.low) - current.low);
        }
      }
      
      if (isSwingHigh) {
        swings.push({
          index: i,
          type: 'high',
          price: current.high,
          strength: highStrength
        });
      }
      
      if (isSwingLow) {
        swings.push({
          index: i,
          type: 'low',
          price: current.low,
          strength: lowStrength
        });
      }
    }
    
    return swings.sort((a, b) => a.index - b.index);
  }

  /**
   * Detect Break of Structure (BOS) with enhanced validation
   */
  static detectBOS(candles: Candle[], minBreakDistance: number = 0.0005): BOSResult {
    if (candles.length < 30) {
      return { valid: false, direction: null, confidence: 0, reason: 'insufficient_data' };
    }
    
    const swings = this.findSwings(candles, 6);
    if (swings.length < 4) {
      return { valid: false, direction: null, confidence: 0, reason: 'insufficient_swings' };
    }
    
    // Get recent swing patterns
    const recentSwings = swings.slice(-4);
    const lastSwing = recentSwings[recentSwings.length - 1];
    const penultimateSwing = recentSwings[recentSwings.length - 2];
    
    // Find previous swing of same type
    const prevSameTypeSwing = recentSwings
      .slice(0, -1)
      .reverse()
      .find(swing => swing.type === lastSwing.type);
    
    if (!prevSameTypeSwing) {
      return { valid: false, direction: null, confidence: 0, reason: 'no_previous_swing' };
    }
    
    let confidence = 0;
    let direction: 'bullish' | 'bearish' | null = null;
    
    // Bullish BOS: Higher High
    if (lastSwing.type === 'high' && lastSwing.price > prevSameTypeSwing.price + minBreakDistance) {
      direction = 'bullish';
      confidence = Math.min(95, 60 + (lastSwing.strength / prevSameTypeSwing.strength) * 30);
    }
    
    // Bearish BOS: Lower Low
    if (lastSwing.type === 'low' && lastSwing.price < prevSameTypeSwing.price - minBreakDistance) {
      direction = 'bearish';
      confidence = Math.min(95, 60 + (lastSwing.strength / prevSameTypeSwing.strength) * 30);
    }
    
    // Validate with volume confirmation
    const recentCandles = candles.slice(-10);
    const avgVolume = recentCandles.reduce((sum, c) => sum + c.volume, 0) / recentCandles.length;
    const breakCandle = candles[lastSwing.index];
    
    if (breakCandle.volume > avgVolume * 1.2) {
      confidence += 10;
    }
    
    return {
      valid: confidence >= 70,
      direction,
      confidence: Math.round(confidence),
      reason: confidence >= 70 ? 'confirmed_structure_break' : 'weak_break_signal'
    };
  }

  /**
   * Detect Fair Value Gap (FVG) with FVG Confirmation Rule (Entry Upgrade)
   */
  static detectFVG(candles: Candle[], atr: number, minGapSize: number = 0.0003): FVGResult & {
    confirmationStage: 'DETECTED' | 'CONFIRMED' | 'RETESTING' | 'READY';
    candleClosedAboveFVG?: boolean;
    candleClosedBelowFVG?: boolean;
    retestDetected?: boolean;
  } {
    if (candles.length < 5) {
      return { 
        valid: false, 
        zones: [], 
        strength: 0,
        confirmationStage: 'DETECTED'
      };
    }
    
    const zones: Array<{ 
      from: number; 
      to: number; 
      index: number; 
      strength: number;
      direction: 'bullish' | 'bearish';
      confirmed: boolean;
      retestReady: boolean;
    }> = [];
    
    // Look for 3-candle FVG patterns
    for (let i = 2; i < candles.length; i++) {
      const candle1 = candles[i - 2];
      const candle2 = candles[i - 1]; // Middle candle creating the gap
      const candle3 = candles[i];
      
      // Bullish FVG: candle1.high < candle3.low
      const bullishGapSize = candle3.low - candle1.high;
      if (bullishGapSize > minGapSize && bullishGapSize < atr * 2) {
        const strength = Math.min(100, (bullishGapSize / atr) * 50 + (candle2.volume / candle1.volume) * 25);
        
        // Check for confirmation: candle closed above FVG
        let confirmed = false;
        let retestReady = false;
        
        // Look for candles that closed above the FVG zone
        for (let j = i + 1; j < candles.length; j++) {
          const futureCandle = candles[j];
          
          // Bullish confirmation: candle closes above the FVG high
          if (futureCandle.close > candle3.low && !confirmed) {
            confirmed = true;
          }
          
          // If confirmed, check for retest (price pulling back into FVG zone)
          if (confirmed && futureCandle.low <= candle3.low && futureCandle.high >= candle1.high) {
            retestReady = true;
            break; // Found retest opportunity
          }
        }
        
        zones.push({
          from: candle1.high,
          to: candle3.low,
          index: i,
          strength: Math.round(strength),
          direction: 'bullish',
          confirmed,
          retestReady
        });
      }
      
      // Bearish FVG: candle1.low > candle3.high
      const bearishGapSize = candle1.low - candle3.high;
      if (bearishGapSize > minGapSize && bearishGapSize < atr * 2) {
        const strength = Math.min(100, (bearishGapSize / atr) * 50 + (candle2.volume / candle1.volume) * 25);
        
        // Check for confirmation: candle closed below FVG
        let confirmed = false;
        let retestReady = false;
        
        // Look for candles that closed below the FVG zone
        for (let j = i + 1; j < candles.length; j++) {
          const futureCandle = candles[j];
          
          // Bearish confirmation: candle closes below the FVG low
          if (futureCandle.close < candle3.high && !confirmed) {
            confirmed = true;
          }
          
          // If confirmed, check for retest (price pulling back into FVG zone)
          if (confirmed && futureCandle.high >= candle3.high && futureCandle.low <= candle1.low) {
            retestReady = true;
            break; // Found retest opportunity
          }
        }
        
        zones.push({
          from: candle3.high,
          to: candle1.low,
          index: i,
          strength: Math.round(strength),
          direction: 'bearish',
          confirmed,
          retestReady
        });
      }
    }
    
    // Filter for zones that meet institutional criteria
    // Only accept FVGs with confirmation and retest opportunity
    const institutionalZones = zones.filter(zone => 
      zone.strength >= 60 && zone.confirmed && zone.retestReady
    );
    
    // Also keep high-strength zones waiting for confirmation
    const pendingZones = zones.filter(zone => 
      zone.strength >= 70 && !zone.confirmed
    );
    
    const validZones = [...institutionalZones, ...pendingZones].slice(-3);
    
    const avgStrength = validZones.length > 0 
      ? validZones.reduce((sum, zone) => sum + zone.strength, 0) / validZones.length 
      : 0;
    
    // Determine confirmation stage
    let confirmationStage: 'DETECTED' | 'CONFIRMED' | 'RETESTING' | 'READY' = 'DETECTED';
    const hasConfirmedZones = institutionalZones.length > 0;
    const hasPendingZones = pendingZones.length > 0;
    
    if (hasConfirmedZones) {
      confirmationStage = 'READY'; // Ready for institutional entry
    } else if (hasPendingZones) {
      confirmationStage = 'CONFIRMED'; // Waiting for retest
    }
    
    return {
      valid: institutionalZones.length > 0, // Only valid if we have confirmed + retested zones
      zones: validZones,
      strength: Math.round(avgStrength),
      confirmationStage,
      candleClosedAboveFVG: zones.some(z => z.direction === 'bullish' && z.confirmed),
      candleClosedBelowFVG: zones.some(z => z.direction === 'bearish' && z.confirmed),
      retestDetected: institutionalZones.length > 0
    };
  }

  /**
   * Detect Liquidity Sweep with confirmation
   */
  static detectLiquiditySweep(candles: Candle[], atr: number): LiquiditySweepResult {
    if (candles.length < 10) {
      return { valid: false, type: null, level: 0, confidence: 0 };
    }
    
    const recent = candles.slice(-8);
    const swings = this.findSwings(candles, 5);
    
    if (swings.length < 2) {
      return { valid: false, type: null, level: 0, confidence: 0 };
    }
    
    // Get recent highs and lows
    const recentHigh = Math.max(...recent.map(c => c.high));
    const recentLow = Math.min(...recent.map(c => c.low));
    const previousHigh = Math.max(...candles.slice(-15, -8).map(c => c.high));
    const previousLow = Math.min(...candles.slice(-15, -8).map(c => c.low));
    
    let sweepType: 'buy' | 'sell' | null = null;
    let confidence = 0;
    let level = 0;
    
    // Check for buy-side liquidity sweep (break above previous high then reverse)
    const breakAboveDistance = recentHigh - previousHigh;
    if (breakAboveDistance > atr * 0.1) {
      const lastCandle = recent[recent.length - 1];
      const reversalStrength = (recentHigh - lastCandle.close) / breakAboveDistance;
      
      if (reversalStrength > 0.3) {
        sweepType = 'buy';
        level = recentHigh;
        confidence = Math.min(90, 50 + reversalStrength * 40);
      }
    }
    
    // Check for sell-side liquidity sweep (break below previous low then reverse)
    const breakBelowDistance = previousLow - recentLow;
    if (breakBelowDistance > atr * 0.1) {
      const lastCandle = recent[recent.length - 1];
      const reversalStrength = (lastCandle.close - recentLow) / breakBelowDistance;
      
      if (reversalStrength > 0.3) {
        sweepType = 'sell';
        level = recentLow;
        confidence = Math.min(90, 50 + reversalStrength * 40);
      }
    }
    
    return {
      valid: confidence >= 60,
      type: sweepType,
      level,
      confidence: Math.round(confidence)
    };
  }

  /**
   * Detect Order Block with institutional logic
   */
  static detectOrderBlock(candles: Candle[], atr: number): OrderBlockResult {
    if (candles.length < 15) {
      return { valid: false, level: 0, strength: 0, direction: null };
    }
    
    const recent = candles.slice(-10);
    let bestOrderBlock: OrderBlockResult = { valid: false, level: 0, strength: 0, direction: null };
    
    // Look for significant rejection patterns
    for (let i = 1; i < recent.length - 1; i++) {
      const candle = recent[i];
      const prevCandle = recent[i - 1];
      const nextCandle = recent[i + 1];
      
      const bodySize = Math.abs(candle.close - candle.open);
      const upperWick = candle.high - Math.max(candle.open, candle.close);
      const lowerWick = Math.min(candle.open, candle.close) - candle.low;
      
      // Bullish Order Block: Strong rejection from lows with volume
      if (lowerWick > bodySize * 1.5 && candle.volume > prevCandle.volume * 1.1) {
        const strength = Math.min(100, (lowerWick / atr) * 30 + (candle.volume / prevCandle.volume) * 25);
        
        if (strength > bestOrderBlock.strength) {
          bestOrderBlock = {
            valid: strength >= 65,
            level: candle.low,
            strength: Math.round(strength),
            direction: 'bullish'
          };
        }
      }
      
      // Bearish Order Block: Strong rejection from highs with volume
      if (upperWick > bodySize * 1.5 && candle.volume > prevCandle.volume * 1.1) {
        const strength = Math.min(100, (upperWick / atr) * 30 + (candle.volume / prevCandle.volume) * 25);
        
        if (strength > bestOrderBlock.strength) {
          bestOrderBlock = {
            valid: strength >= 65,
            level: candle.high,
            strength: Math.round(strength),
            direction: 'bearish'
          };
        }
      }
    }
    
    return bestOrderBlock;
  }

  /**
   * Calculate comprehensive confluence score
   */
  static calculateConfluence(
    bos: BOSResult,
    fvg: FVGResult,
    liquiditySweep: LiquiditySweepResult,
    orderBlock: OrderBlockResult,
    sessionMultiplier: number = 1.0
  ): { score: number; bucket: number; breakdown: Record<string, number> } {
    
    const weights = {
      bos: 1.2,
      fvg: 1.0,
      liquiditySweep: 1.2,
      orderBlock: 1.1,
      session: 0.8
    };
    
    const scores = {
      bos: bos.valid ? (bos.confidence / 100) * weights.bos : 0,
      fvg: fvg.valid ? (fvg.strength / 100) * weights.fvg : 0,
      liquiditySweep: liquiditySweep.valid ? (liquiditySweep.confidence / 100) * weights.liquiditySweep : 0,
      orderBlock: orderBlock.valid ? (orderBlock.strength / 100) * weights.orderBlock : 0,
      session: sessionMultiplier * weights.session
    };
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxPossible = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const normalizedScore = totalScore / maxPossible;
    
    const bucket = Math.round(normalizedScore * 6);
    
    return {
      score: Math.round(normalizedScore * 100),
      bucket: Math.max(0, Math.min(6, bucket)),
      breakdown: {
        breakOfStructure: Math.round(scores.bos * 100),
        fairValueGap: Math.round(scores.fvg * 100),
        liquiditySweep: Math.round(scores.liquiditySweep * 100),
        orderBlock: Math.round(scores.orderBlock * 100),
        sessionTiming: Math.round(scores.session * 100)
      }
    };
  }
}