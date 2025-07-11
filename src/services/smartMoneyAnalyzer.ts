
import { MarketData, CandleData } from './marketDataService';

interface SignalCriteria {
  hasBreakOfStructure: boolean;
  hasFVG: boolean;
  hasLiquiditySweep: boolean;
  hasConfluence: boolean;
  riskRewardRatio: number;
}

interface AnalysisResult {
  signal: any | null;
  criteria: SignalCriteria;
  confidence: number;
}

class SmartMoneyAnalyzer {
  analyzeForSignal(marketData: MarketData): AnalysisResult {
    const { candles, pair, currentPrice } = marketData;
    
    if (candles.length < 20) {
      return { signal: null, criteria: this.getEmptyCriteria(), confidence: 0 };
    }

    const recent = candles.slice(-20); // Last 20 candles
    const criteria = this.analyzeCriteria(recent, currentPrice);
    
    if (!this.isHighProbabilitySetup(criteria)) {
      return { signal: null, criteria, confidence: 0 };
    }

    const signal = this.generateSignal(marketData, criteria);
    const confidence = this.calculateConfidence(criteria);

    return { signal, criteria, confidence };
  }

  private analyzeCriteria(candles: CandleData[], currentPrice: number): SignalCriteria {
    return {
      hasBreakOfStructure: this.detectBreakOfStructure(candles),
      hasFVG: this.detectFairValueGap(candles),
      hasLiquiditySweep: this.detectLiquiditySweep(candles),
      hasConfluence: this.detectConfluence(candles, currentPrice),
      riskRewardRatio: this.calculatePotentialRR(candles, currentPrice)
    };
  }

  private detectBreakOfStructure(candles: CandleData[]): boolean {
    // Look for higher highs/lower lows indicating structure break
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    const recentHigh = Math.max(...highs.slice(-5));
    const previousHigh = Math.max(...highs.slice(-15, -5));
    
    const recentLow = Math.min(...lows.slice(-5));
    const previousLow = Math.min(...lows.slice(-15, -5));
    
    // Bullish BoS: Recent high > Previous high
    const bullishBos = recentHigh > previousHigh;
    // Bearish BoS: Recent low < Previous low  
    const bearishBos = recentLow < previousLow;
    
    return bullishBos || bearishBos;
  }

  private detectFairValueGap(candles: CandleData[]): boolean {
    // Look for imbalance - gap between candles
    for (let i = candles.length - 10; i < candles.length - 2; i++) {
      const prev = candles[i - 1];
      const current = candles[i];
      const next = candles[i + 1];
      
      if (!prev || !current || !next) continue;
      
      // Bullish FVG: Previous high < Next low
      const bullishFVG = prev.high < next.low;
      // Bearish FVG: Previous low > Next high
      const bearishFVG = prev.low > next.high;
      
      if (bullishFVG || bearishFVG) {
        return true;
      }
    }
    return false;
  }

  private detectLiquiditySweep(candles: CandleData[]): boolean {
    // Look for quick wick movements that sweep liquidity
    const recent = candles.slice(-10);
    
    for (const candle of recent) {
      const bodySize = Math.abs(candle.close - candle.open);
      const upperWick = candle.high - Math.max(candle.open, candle.close);
      const lowerWick = Math.min(candle.open, candle.close) - candle.low;
      
      // Large wick compared to body indicates liquidity sweep
      const hasLargeLowerWick = lowerWick > bodySize * 2;
      const hasLargeUpperWick = upperWick > bodySize * 2;
      
      if (hasLargeLowerWick || hasLargeUpperWick) {
        return true;
      }
    }
    return false;
  }

  private detectConfluence(candles: CandleData[], currentPrice: number): boolean {
    // Check if current price is near support/resistance levels
    const allPrices = candles.flatMap(c => [c.high, c.low, c.close]);
    const priceHistory = [...new Set(allPrices)].sort((a, b) => a - b);
    
    // Find nearby significant levels (within 0.1% for forex)
    const tolerance = currentPrice * 0.001;
    const nearbyLevels = priceHistory.filter(price => 
      Math.abs(price - currentPrice) < tolerance
    );
    
    return nearbyLevels.length > 0;
  }

  private calculatePotentialRR(candles: CandleData[], currentPrice: number): number {
    const atr = this.calculateATR(candles.slice(-14)); // 14-period ATR
    const stopDistance = atr * 1.5;
    const profitDistance = atr * 3;
    
    return profitDistance / stopDistance;
  }

  private calculateATR(candles: CandleData[]): number {
    let trSum = 0;
    
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const previous = candles[i - 1];
      
      const tr = Math.max(
        current.high - current.low,
        Math.abs(current.high - previous.close),
        Math.abs(current.low - previous.close)
      );
      
      trSum += tr;
    }
    
    return trSum / (candles.length - 1);
  }

  private isHighProbabilitySetup(criteria: SignalCriteria): boolean {
    let score = 0;
    
    if (criteria.hasBreakOfStructure) score += 3;
    if (criteria.hasFVG) score += 2;
    if (criteria.hasLiquiditySweep) score += 2;
    if (criteria.hasConfluence) score += 1;
    if (criteria.riskRewardRatio >= 2) score += 2;
    
    // Require minimum score of 6/10 for signal generation
    return score >= 6;
  }

  private generateSignal(marketData: MarketData, criteria: SignalCriteria): any {
    const { pair, currentPrice, candles } = marketData;
    const atr = this.calculateATR(candles.slice(-14));
    
    // Determine direction based on structure
    const direction = this.determineDirection(candles);
    const entry = currentPrice;
    
    const stopDistance = atr * 1.5;
    const profitDistance = atr * 3;
    
    const stopLoss = direction === 'BUY' 
      ? entry - stopDistance 
      : entry + stopDistance;
      
    const takeProfit = direction === 'BUY'
      ? entry + profitDistance
      : entry - profitDistance;
    
    const reasons = [];
    if (criteria.hasBreakOfStructure) reasons.push('Break of Structure confirmed');
    if (criteria.hasFVG) reasons.push('Fair Value Gap detected');
    if (criteria.hasLiquiditySweep) reasons.push('Liquidity sweep identified');
    if (criteria.hasConfluence) reasons.push('Key level confluence');
    
    return {
      id: Date.now(),
      pair,
      type: direction,
      entry: Number(entry.toFixed(pair === 'XAUUSD' ? 2 : 5)),
      stopLoss: Number(stopLoss.toFixed(pair === 'XAUUSD' ? 2 : 5)),
      takeProfit: Number(takeProfit.toFixed(pair === 'XAUUSD' ? 2 : 5)),
      status: 'active',
      timestamp: new Date().toISOString(),
      timeframe: 'M5',
      risk: this.calculateRiskLevel(criteria.riskRewardRatio),
      analysis: `Institutional ${direction.toLowerCase()} setup detected with ${reasons.length} confluence factors. Smart money positioning suggests ${direction === 'BUY' ? 'accumulation' : 'distribution'} phase.`,
      reason: reasons.join(' + ')
    };
  }

  private determineDirection(candles: CandleData[]): 'BUY' | 'SELL' {
    const recent = candles.slice(-5);
    const bullishCandles = recent.filter(c => c.close > c.open).length;
    const bearishCandles = recent.filter(c => c.close < c.open).length;
    
    // Also consider price momentum
    const priceChange = recent[recent.length - 1].close - recent[0].open;
    
    if (bullishCandles > bearishCandles && priceChange > 0) {
      return 'BUY';
    }
    return 'SELL';
  }

  private calculateRiskLevel(rr: number): 'Low' | 'Medium' | 'High' {
    if (rr >= 3) return 'Low';
    if (rr >= 2) return 'Medium';
    return 'High';
  }

  private calculateConfidence(criteria: SignalCriteria): number {
    let confidence = 60; // Base confidence
    
    if (criteria.hasBreakOfStructure) confidence += 15;
    if (criteria.hasFVG) confidence += 10;
    if (criteria.hasLiquiditySweep) confidence += 10;
    if (criteria.hasConfluence) confidence += 5;
    if (criteria.riskRewardRatio >= 2.5) confidence += 10;
    
    return Math.min(confidence, 95); // Cap at 95%
  }

  private getEmptyCriteria(): SignalCriteria {
    return {
      hasBreakOfStructure: false,
      hasFVG: false,
      hasLiquiditySweep: false,
      hasConfluence: false,
      riskRewardRatio: 0
    };
  }
}

export const smartMoneyAnalyzer = new SmartMoneyAnalyzer();
export type { SignalCriteria, AnalysisResult };
