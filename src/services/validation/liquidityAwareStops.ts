// Liquidity-Aware Stop Placement - Place Stops Like Prop Desks
// Stops go BEYOND opposing liquidity + ATR buffer, not arbitrary pips

export interface LiquidityLevel {
  price: number;
  strength: 'WEAK' | 'MEDIUM' | 'STRONG' | 'INSTITUTIONAL';
  type: 'SWING_HIGH' | 'SWING_LOW' | 'ORDER_BLOCK' | 'LIQUIDITY_POOL' | 'EQUAL_HIGHS' | 'EQUAL_LOWS';
  timeframe: string;
  confirmations: number;
  volume?: number;
}

export interface StopPlacementData {
  symbol: string;
  side: 'BUY' | 'SELL';
  entry: number;
  currentATR: number;
  timeframe: string;
  session: 'ASIA' | 'LONDON' | 'NY';
  nearbyLiquidity: LiquidityLevel[];
  spread: number;
}

export interface StopPlacementResult {
  recommendedSL: number;
  reasoning: string[];
  riskPips: number;
  beyondLiquidityPips: number;
  qualityScore: number; // 0-100
  alternative?: {
    sl: number;
    reasoning: string;
  };
}

export class LiquidityAwareStops {
  private static readonly MIN_BEYOND_LIQUIDITY = 5; // minimum pips beyond liquidity
  private static readonly ATR_MULTIPLIERS = {
    'ASIA': 0.4,   // lower volatility
    'LONDON': 0.3, // optimal
    'NY': 0.3      // high liquidity
  };

  static calculateOptimalStop(data: StopPlacementData): StopPlacementResult {
    console.log(`🛡️ LIQUIDITY STOP CALC: ${data.symbol} ${data.side} | Entry: ${data.entry} | ATR: ${data.currentATR}`);
    
    const result: StopPlacementResult = {
      recommendedSL: 0,
      reasoning: [],
      riskPips: 0,
      beyondLiquidityPips: 0,
      qualityScore: 0
    };

    // STEP 1: Identify critical opposing liquidity
    const opposingLiquidity = this.findOpposingLiquidity(data);
    
    if (opposingLiquidity.length === 0) {
      // No clear liquidity - use ATR-based stop
      return this.calculateATRBasedStop(data);
    }

    // STEP 2: Find strongest/nearest opposing level
    const criticalLevel = this.findCriticalLevel(opposingLiquidity, data);
    result.reasoning.push(`Critical ${criticalLevel.type} at ${criticalLevel.price} (${criticalLevel.strength})`);

    // STEP 3: Calculate distance beyond critical level
    const beyondDistance = this.calculateBeyondDistance(data, criticalLevel);
    const pipFactor = this.getPipFactor(data.symbol);
    
    // STEP 4: Place stop beyond liquidity + buffer
    const stopPrice = data.side === 'BUY'
      ? criticalLevel.price - (beyondDistance / pipFactor)
      : criticalLevel.price + (beyondDistance / pipFactor);

    result.recommendedSL = stopPrice;
    result.riskPips = Math.abs(data.entry - stopPrice) * pipFactor;
    result.beyondLiquidityPips = beyondDistance;

    // STEP 5: Quality assessment
    result.qualityScore = this.assessStopQuality(data, criticalLevel, result.riskPips);
    
    result.reasoning.push(`Stop placed ${beyondDistance.toFixed(1)} pips beyond ${criticalLevel.type}`);
    result.reasoning.push(`Total risk: ${result.riskPips.toFixed(1)} pips`);

    // STEP 6: Alternative if stop is too wide
    if (result.riskPips > data.currentATR * 2) {
      result.alternative = this.calculateTighterAlternative(data, criticalLevel);
    }

    console.log(`🛡️ Stop calculated: ${result.recommendedSL} | Risk: ${result.riskPips.toFixed(1)} pips | Quality: ${result.qualityScore}`);
    
    return result;
  }

  private static findOpposingLiquidity(data: StopPlacementData): LiquidityLevel[] {
    return data.nearbyLiquidity.filter(level => {
      if (data.side === 'BUY') {
        // For BUY trades, opposing liquidity is below entry
        return level.price < data.entry;
      } else {
        // For SELL trades, opposing liquidity is above entry
        return level.price > data.entry;
      }
    });
  }

  private static findCriticalLevel(levels: LiquidityLevel[], data: StopPlacementData): LiquidityLevel {
    // Sort by proximity to entry first
    const sortedByDistance = levels.sort((a, b) => {
      const distA = Math.abs(a.price - data.entry);
      const distB = Math.abs(b.price - data.entry);
      return distA - distB;
    });

    // Find the strongest level among closest ones
    const strengthOrder = ['INSTITUTIONAL', 'STRONG', 'MEDIUM', 'WEAK'];
    
    for (const strength of strengthOrder) {
      const levelOfStrength = sortedByDistance.find(l => l.strength === strength);
      if (levelOfStrength) {
        return levelOfStrength;
      }
    }

    // Fallback to nearest level
    return sortedByDistance[0];
  }

  private static calculateBeyondDistance(data: StopPlacementData, criticalLevel: LiquidityLevel): number {
    const baseDistance = this.MIN_BEYOND_LIQUIDITY;
    const atrMultiplier = this.ATR_MULTIPLIERS[data.session];
    const atrBuffer = data.currentATR * atrMultiplier;
    
    // Strength-based multipliers
    const strengthMultiplier = {
      'WEAK': 1.0,
      'MEDIUM': 1.2,
      'STRONG': 1.5,
      'INSTITUTIONAL': 2.0
    }[criticalLevel.strength];

    // Type-based adjustments
    const typeMultiplier = {
      'SWING_HIGH': 1.0,
      'SWING_LOW': 1.0,
      'ORDER_BLOCK': 1.3,
      'LIQUIDITY_POOL': 1.5,
      'EQUAL_HIGHS': 1.4,
      'EQUAL_LOWS': 1.4
    }[criticalLevel.type];

    const calculatedDistance = (baseDistance + atrBuffer) * strengthMultiplier * typeMultiplier;
    
    // Minimum safe distance
    return Math.max(calculatedDistance, 8);
  }

  private static assessStopQuality(data: StopPlacementData, criticalLevel: LiquidityLevel, riskPips: number): number {
    let score = 50; // base score

    // Strength bonus
    const strengthBonus = {
      'WEAK': 0,
      'MEDIUM': 10,
      'STRONG': 20,
      'INSTITUTIONAL': 30
    }[criticalLevel.strength];
    score += strengthBonus;

    // ATR relationship bonus
    const atrRatio = riskPips / data.currentATR;
    if (atrRatio >= 0.8 && atrRatio <= 1.5) {
      score += 20; // optimal ATR ratio
    } else if (atrRatio > 1.5) {
      score -= 10; // too wide
    } else {
      score -= 15; // too tight
    }

    // Session bonus
    if (data.session === 'LONDON' || data.session === 'NY') {
      score += 10; // better liquidity
    }

    // Timeframe confirmation bonus
    if (criticalLevel.timeframe === 'H1' || criticalLevel.timeframe === 'H4') {
      score += 15; // higher timeframe levels more reliable
    }

    return Math.max(0, Math.min(100, score));
  }

  private static calculateTighterAlternative(data: StopPlacementData, criticalLevel: LiquidityLevel): { sl: number; reasoning: string } {
    // Place stop at 50% of the distance to liquidity
    const pipFactor = this.getPipFactor(data.symbol);
    const distanceToLiquidity = Math.abs(data.entry - criticalLevel.price) * pipFactor;
    const tighterDistance = distanceToLiquidity * 0.7; // 70% of distance

    const tighterSL = data.side === 'BUY'
      ? data.entry - (tighterDistance / pipFactor)
      : data.entry + (tighterDistance / pipFactor);

    return {
      sl: tighterSL,
      reasoning: `Tighter alternative: ${tighterDistance.toFixed(1)} pips (70% to liquidity) - higher risk but better R:R`
    };
  }

  private static calculateATRBasedStop(data: StopPlacementData): StopPlacementResult {
    const atrMultiplier = this.ATR_MULTIPLIERS[data.session];
    const stopDistance = Math.max(data.currentATR * atrMultiplier, 8); // minimum 8 pips
    const pipFactor = this.getPipFactor(data.symbol);

    const stopPrice = data.side === 'BUY'
      ? data.entry - (stopDistance / pipFactor)
      : data.entry + (stopDistance / pipFactor);

    return {
      recommendedSL: stopPrice,
      reasoning: [`No clear liquidity levels found`, `ATR-based stop: ${stopDistance.toFixed(1)} pips`],
      riskPips: stopDistance,
      beyondLiquidityPips: 0,
      qualityScore: 60 // decent but not liquidity-aware
    };
  }

  private static getPipFactor(symbol: string): number {
    return symbol.includes('JPY') ? 100 : 10000;
  }

  // Utility method to create sample liquidity data for testing
  static createSampleLiquidity(symbol: string, entry: number, side: 'BUY' | 'SELL'): LiquidityLevel[] {
    const pipFactor = symbol.includes('JPY') ? 100 : 10000;
    const levels: LiquidityLevel[] = [];

    if (side === 'BUY') {
      // Add liquidity levels below entry for BUY trades
      levels.push({
        price: entry - (15 / pipFactor),
        strength: 'MEDIUM',
        type: 'SWING_LOW',
        timeframe: 'M15',
        confirmations: 2
      });
      
      levels.push({
        price: entry - (25 / pipFactor),
        strength: 'STRONG',
        type: 'ORDER_BLOCK',
        timeframe: 'H1',
        confirmations: 3
      });
    } else {
      // Add liquidity levels above entry for SELL trades
      levels.push({
        price: entry + (15 / pipFactor),
        strength: 'MEDIUM',
        type: 'SWING_HIGH',
        timeframe: 'M15',
        confirmations: 2
      });
      
      levels.push({
        price: entry + (25 / pipFactor),
        strength: 'STRONG',
        type: 'ORDER_BLOCK',
        timeframe: 'H1',
        confirmations: 3
      });
    }

    return levels;
  }
}

export const liquidityAwareStops = LiquidityAwareStops;