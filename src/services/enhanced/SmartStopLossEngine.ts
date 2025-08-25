// Smart Stop-Loss Engine - Structure-Based SL Placement
// Places stops based on market structure, not arbitrary pips

export interface MarketStructure {
  recentSwingHigh: number;
  recentSwingLow: number;
  liquiditySweepZone?: number;
  fvgOrigin?: number;
  invalidationLevel: number;
}

export interface ATRData {
  current: number;
  average: number; // 14-period average
  session: 'ASIA' | 'LONDON' | 'NY';
  volatilityState: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';
}

export interface SmartStopData {
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  marketStructure: MarketStructure;
  atrData: ATRData;
  maxRiskPercent: number; // 1-2% max risk
  accountSize: number;
}

export interface SmartStopResult {
  stopLoss: number;
  riskPips: number;
  riskPercent: number;
  positionSize: number;
  placement: 'STRUCTURE_BASED' | 'LIQUIDITY_BUFFER' | 'FVG_PROTECTION' | 'ATR_FALLBACK';
  reasoning: string[];
  qualityScore: number;
  alternative?: {
    stopLoss: number;
    reasoning: string;
    positionSize: number;
  };
}

export class SmartStopLossEngine {
  private static readonly LIQUIDITY_BUFFER_PIPS = {
    'EURUSD': { min: 5, max: 15 },
    'GBPUSD': { min: 8, max: 20 },
    'USDJPY': { min: 8, max: 18 },
    'NAS100': { min: 15, max: 40 },
    'XAUUSD': { min: 20, max: 50 }
  };

  private static readonly VOLATILITY_MULTIPLIERS = {
    'LOW': 1.0,
    'NORMAL': 1.0,
    'HIGH': 1.25,
    'EXTREME': 1.5
  };

  // 🔑 1. Structure-Based SL (Primary Method)
  static calculateStructureBasedStop(data: SmartStopData): SmartStopResult {
    console.log(`🛡️ SMART SL: ${data.symbol} ${data.direction} | Entry: ${data.entry}`);
    
    const result: SmartStopResult = {
      stopLoss: 0,
      riskPips: 0,
      riskPercent: 0,
      positionSize: 0,
      placement: 'STRUCTURE_BASED',
      reasoning: [],
      qualityScore: 0
    };

    // STEP 1: Identify invalidation level based on market structure
    const invalidationLevel = this.getInvalidationLevel(data);
    result.reasoning.push(`Invalidation level: ${invalidationLevel.toFixed(5)}`);

    // STEP 2: Apply liquidity buffer protection
    const bufferedStop = this.applyLiquidityBuffer(data, invalidationLevel);
    result.reasoning.push(`Liquidity buffer applied: ${this.getLiquidityBufferSize(data)} pips`);

    // STEP 3: Apply volatility filter if needed
    const volatilityAdjustedStop = this.applyVolatilityFilter(data, bufferedStop);
    if (data.atrData.volatilityState !== 'NORMAL') {
      result.reasoning.push(`Volatility adjustment: ${data.atrData.volatilityState} (${this.VOLATILITY_MULTIPLIERS[data.atrData.volatilityState]}x)`);
    }

    // STEP 4: Risk management - calculate position size
    const pipFactor = this.getPipFactor(data.symbol);
    const riskPips = Math.abs(data.entry - volatilityAdjustedStop) * pipFactor;
    const riskAmount = data.accountSize * (data.maxRiskPercent / 100);
    const positionSize = riskAmount / (riskPips * this.getPipValue(data.symbol));

    result.stopLoss = volatilityAdjustedStop;
    result.riskPips = riskPips;
    result.riskPercent = data.maxRiskPercent;
    result.positionSize = positionSize;
    result.qualityScore = this.assessStopQuality(data, riskPips);

    // STEP 5: Alternative if stop is too wide
    if (riskPips > data.atrData.current * 2.5) {
      result.alternative = this.calculateReducedRiskAlternative(data, riskPips);
      result.reasoning.push(`Alternative provided: stop too wide (${riskPips.toFixed(1)} pips)`);
    }

    result.reasoning.push(`Final SL: ${result.stopLoss.toFixed(5)} | Risk: ${riskPips.toFixed(1)} pips | Size: ${positionSize.toFixed(2)} lots`);

    console.log(`🛡️ Smart SL Result: ${result.stopLoss.toFixed(5)} | ${riskPips.toFixed(1)} pips | Quality: ${result.qualityScore}`);
    
    return result;
  }

  // 🔑 2. Get Invalidation Level (Structure-Based)
  private static getInvalidationLevel(data: SmartStopData): number {
    const { marketStructure, direction, entry } = data;

    if (direction === 'BUY') {
      // For BUY: invalidation is below recent swing low
      if (marketStructure.fvgOrigin && marketStructure.fvgOrigin < entry) {
        // If entry from FVG, use FVG origin as invalidation
        return marketStructure.fvgOrigin;
      }
      
      if (marketStructure.liquiditySweepZone && marketStructure.liquiditySweepZone < entry) {
        // If liquidity was swept, use sweep zone
        return marketStructure.liquiditySweepZone;
      }
      
      // Default: recent swing low
      return marketStructure.recentSwingLow;
    } else {
      // For SELL: invalidation is above recent swing high
      if (marketStructure.fvgOrigin && marketStructure.fvgOrigin > entry) {
        return marketStructure.fvgOrigin;
      }
      
      if (marketStructure.liquiditySweepZone && marketStructure.liquiditySweepZone > entry) {
        return marketStructure.liquiditySweepZone;
      }
      
      // Default: recent swing high
      return marketStructure.recentSwingHigh;
    }
  }

  // 🔑 3. Apply Liquidity Buffer (Stop Hunt Protection)
  private static applyLiquidityBuffer(data: SmartStopData, invalidationLevel: number): number {
    const bufferPips = this.getLiquidityBufferSize(data);
    const pipFactor = this.getPipFactor(data.symbol);
    
    if (data.direction === 'BUY') {
      // Place stop below invalidation level
      return invalidationLevel - (bufferPips / pipFactor);
    } else {
      // Place stop above invalidation level  
      return invalidationLevel + (bufferPips / pipFactor);
    }
  }

  // 🔑 4. Apply Volatility Filter
  private static applyVolatilityFilter(data: SmartStopData, bufferedStop: number): number {
    const { atrData, entry, direction } = data;
    
    // Only widen if ATR > average (high volatility)
    if (atrData.current <= atrData.average) {
      return bufferedStop; // No adjustment needed
    }

    const volatilityMultiplier = this.VOLATILITY_MULTIPLIERS[atrData.volatilityState];
    if (volatilityMultiplier === 1.0) {
      return bufferedStop;
    }

    // Calculate additional distance for high volatility
    const currentDistance = Math.abs(entry - bufferedStop);
    const additionalDistance = currentDistance * (volatilityMultiplier - 1.0);
    
    if (direction === 'BUY') {
      return bufferedStop - additionalDistance;
    } else {
      return bufferedStop + additionalDistance;
    }
  }

  // Helper Methods
  private static getLiquidityBufferSize(data: SmartStopData): number {
    const buffers = this.LIQUIDITY_BUFFER_PIPS[data.symbol as keyof typeof this.LIQUIDITY_BUFFER_PIPS];
    if (!buffers) return 10; // default buffer
    
    // Use larger buffer during high volatility sessions
    const isHighVolatilitySession = data.atrData.session === 'NY' || data.atrData.session === 'LONDON';
    return isHighVolatilitySession ? buffers.max : buffers.min;
  }

  private static assessStopQuality(data: SmartStopData, riskPips: number): number {
    let score = 50;

    // ATR relationship (optimal: 0.8-1.5x ATR)
    const atrRatio = riskPips / data.atrData.current;
    if (atrRatio >= 0.8 && atrRatio <= 1.5) {
      score += 30;
    } else if (atrRatio > 2.0) {
      score -= 20; // too wide
    } else if (atrRatio < 0.5) {
      score -= 25; // too tight
    }

    // Structure quality
    if (data.marketStructure.fvgOrigin) {
      score += 15; // FVG-based stops are higher quality
    }
    
    if (data.marketStructure.liquiditySweepZone) {
      score += 20; // Liquidity sweep context is excellent
    }

    // Session bonus
    if (data.atrData.session === 'LONDON' || data.atrData.session === 'NY') {
      score += 10;
    }

    // Risk management bonus
    if (data.maxRiskPercent <= 1.5) {
      score += 10; // conservative risk
    }

    return Math.max(0, Math.min(100, score));
  }

  private static calculateReducedRiskAlternative(data: SmartStopData, originalRiskPips: number): { stopLoss: number; reasoning: string; positionSize: number } {
    // Reduce position size instead of tightening stop
    const targetRiskPips = data.atrData.current * 1.5; // More reasonable risk
    const pipFactor = this.getPipFactor(data.symbol);
    
    const alternativeStop = data.direction === 'BUY'
      ? data.entry - (targetRiskPips / pipFactor)
      : data.entry + (targetRiskPips / pipFactor);
    
    const riskAmount = data.accountSize * (data.maxRiskPercent / 100);
    const alternativePositionSize = riskAmount / (targetRiskPips * this.getPipValue(data.symbol));
    
    return {
      stopLoss: alternativeStop,
      reasoning: `Reduced position size to ${alternativePositionSize.toFixed(2)} lots for ${targetRiskPips.toFixed(1)} pip risk`,
      positionSize: alternativePositionSize
    };
  }

  private static getPipFactor(symbol: string): number {
    return symbol.includes('JPY') ? 100 : 10000;
  }

  private static getPipValue(symbol: string): number {
    // Simplified pip values (should be calculated based on account currency)
    if (symbol.includes('JPY')) return 0.0001;
    if (symbol === 'NAS100') return 1.0;
    if (symbol === 'XAUUSD') return 0.01;
    return 0.0001;
  }

  // Factory method to create sample market structure data
  static createSampleMarketStructure(symbol: string, entry: number, direction: 'BUY' | 'SELL'): MarketStructure {
    const pipFactor = this.getPipFactor(symbol);
    
    if (direction === 'BUY') {
      return {
        recentSwingHigh: entry + (30 / pipFactor),
        recentSwingLow: entry - (25 / pipFactor),
        liquiditySweepZone: entry - (15 / pipFactor), // Recent sweep below
        fvgOrigin: entry - (20 / pipFactor), // FVG origin
        invalidationLevel: entry - (25 / pipFactor)
      };
    } else {
      return {
        recentSwingHigh: entry + (25 / pipFactor),
        recentSwingLow: entry - (30 / pipFactor),
        liquiditySweepZone: entry + (15 / pipFactor), // Recent sweep above
        fvgOrigin: entry + (20 / pipFactor), // FVG origin
        invalidationLevel: entry + (25 / pipFactor)
      };
    }
  }

  static createSampleATRData(session: 'ASIA' | 'LONDON' | 'NY'): ATRData {
    const baseATR = session === 'ASIA' ? 12 : session === 'LONDON' ? 18 : 22;
    const current = baseATR + (Math.random() - 0.5) * 8;
    const average = baseATR;
    
    let volatilityState: ATRData['volatilityState'] = 'NORMAL';
    if (current > average * 1.5) volatilityState = 'EXTREME';
    else if (current > average * 1.25) volatilityState = 'HIGH';
    else if (current < average * 0.8) volatilityState = 'LOW';

    return {
      current,
      average,
      session,
      volatilityState
    };
  }
}

export const smartStopLossEngine = SmartStopLossEngine;