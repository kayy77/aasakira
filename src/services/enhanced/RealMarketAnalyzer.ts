// 🧠 REAL MARKET STRUCTURE ANALYZER
// Analyzes actual OHLC data for trading setups

import type { MarketData, CandleData } from '@/services/marketDataService';

export interface MarketStructureAnalysis {
  confirming: string[];
  conflicting: string[];
  volumeStrong: boolean;
  aligned: boolean;
  liquidityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ConfluenceAnalysis {
  score: number;
  hasStructureBreak: boolean;
  hasVolumeSpike: boolean;
  liquidityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export class RealMarketAnalyzer {
  
  analyzeRealMarketStructure(data: MarketData): MarketStructureAnalysis {
    const candles = data.candles;
    if (candles.length < 20) {
      return {
        confirming: [],
        conflicting: ['5m'],
        volumeStrong: false,
        aligned: false,
        liquidityLevel: 'LOW'
      };
    }

    // Analyze last 20 candles for structure
    const recent = candles.slice(-20);
    const volumeAnalysis = this.analyzeVolume(recent);
    const priceStructure = this.analyzePriceStructure(recent);
    const liquidityLevel = this.analyzeLiquidityLevel(recent);

    return {
      confirming: priceStructure.bullish ? ['1h', '4h'] : priceStructure.bearish ? ['1h'] : [],
      conflicting: priceStructure.mixed ? ['5m'] : [],
      volumeStrong: volumeAnalysis.hasSpike,
      aligned: priceStructure.bullish || priceStructure.bearish,
      liquidityLevel
    };
  }

  detectRealSetupType(data: MarketData): string {
    const candles = data.candles;
    if (candles.length < 10) return 'Unknown';

    const recent = candles.slice(-10);
    const priceAction = this.analyzePriceAction(recent);
    
    if (priceAction.hasBreakout) return 'Structure Break';
    if (priceAction.hasReversal) return 'Reversal Pattern';
    if (priceAction.hasRetest) return 'Retest Setup';
    if (priceAction.hasInstitutional) return 'Institutional Candle';
    
    return 'Price Action';
  }

  determineRealDirection(data: MarketData): 'BUY' | 'SELL' {
    const candles = data.candles;
    if (candles.length < 5) return 'BUY';

    const recent = candles.slice(-5);
    const lastCandle = recent[recent.length - 1];
    const prevCandle = recent[recent.length - 2];

    // Simple direction based on recent price action
    const momentum = this.calculateMomentum(recent);
    const structureBias = this.getStructureBias(recent);

    if (momentum > 0 && structureBias === 'BULLISH') return 'BUY';
    if (momentum < 0 && structureBias === 'BEARISH') return 'SELL';
    
    // Fallback to close vs close comparison
    return lastCandle.close > prevCandle.close ? 'BUY' : 'SELL';
  }

  calculateRealConfluence(data: MarketData): ConfluenceAnalysis {
    const candles = data.candles;
    if (candles.length < 20) {
      return {
        score: 30,
        hasStructureBreak: false,
        hasVolumeSpike: false,
        liquidityLevel: 'LOW',
        direction: 'NEUTRAL'
      };
    }

    let score = 0;
    const recent = candles.slice(-20);
    
    // Structure Break Analysis (25 points)
    const structureBreak = this.detectStructureBreak(recent);
    if (structureBreak.detected) score += 25;

    // Volume Spike Analysis (15 points)
    const volumeSpike = this.detectVolumeSpike(recent);
    if (volumeSpike.detected) score += 15;

    // Price Action Quality (20 points)
    const priceQuality = this.analyzePriceQuality(recent);
    score += priceQuality.score;

    // Momentum Alignment (15 points)
    const momentum = this.analyzeMomentumAlignment(recent);
    score += momentum.score;

    // Liquidity Analysis (10 points)
    const liquidity = this.analyzeLiquidityLevel(recent);
    if (liquidity === 'HIGH') score += 10;
    else if (liquidity === 'MEDIUM') score += 5;

    // Session Quality (10 points)
    const currentHour = new Date().getUTCHours();
    const isGoodSession = (currentHour >= 8 && currentHour <= 17) || (currentHour >= 13 && currentHour <= 22);
    if (isGoodSession) score += 10;

    const direction = this.getOverallDirection(recent);

    return {
      score,
      hasStructureBreak: structureBreak.detected,
      hasVolumeSpike: volumeSpike.detected,
      liquidityLevel: liquidity,
      direction
    };
  }

  private analyzeVolume(candles: CandleData[]): { hasSpike: boolean; avgVolume: number } {
    const volumes = candles.map(c => c.volume || 0);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const lastVolume = volumes[volumes.length - 1];
    
    return {
      hasSpike: lastVolume > avgVolume * 1.5, // 50% above average
      avgVolume
    };
  }

  private analyzePriceStructure(candles: CandleData[]): { bullish: boolean; bearish: boolean; mixed: boolean } {
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);

    // Simple trend analysis
    const firstHalf = closes.slice(0, Math.floor(closes.length / 2));
    const secondHalf = closes.slice(Math.floor(closes.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const trendStrength = Math.abs(secondAvg - firstAvg) / firstAvg;
    
    return {
      bullish: secondAvg > firstAvg && trendStrength > 0.001, // 0.1% minimum move
      bearish: secondAvg < firstAvg && trendStrength > 0.001,
      mixed: trendStrength <= 0.001
    };
  }

  private analyzeLiquidityLevel(candles: CandleData[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    const volumes = candles.map(c => c.volume || 0);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const ranges = candles.map(c => c.high - c.low);
    const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
    
    // High liquidity: good volume and reasonable ranges
    if (avgVolume > 1000 && avgRange > 0) return 'HIGH';
    if (avgVolume > 500 || avgRange > 0) return 'MEDIUM';
    return 'LOW';
  }

  private analyzePriceAction(candles: CandleData[]): {
    hasBreakout: boolean;
    hasReversal: boolean;
    hasRetest: boolean;
    hasInstitutional: boolean;
  } {
    const recent = candles.slice(-5);
    const ranges = recent.map(c => c.high - c.low);
    const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
    const lastRange = ranges[ranges.length - 1];

    return {
      hasBreakout: lastRange > avgRange * 1.5, // Large range candle
      hasReversal: this.detectReversalPattern(recent),
      hasRetest: this.detectRetestPattern(recent),
      hasInstitutional: this.detectInstitutionalCandle(recent)
    };
  }

  private calculateMomentum(candles: CandleData[]): number {
    if (candles.length < 2) return 0;
    
    const firstPrice = candles[0].close;
    const lastPrice = candles[candles.length - 1].close;
    
    return (lastPrice - firstPrice) / firstPrice;
  }

  private getStructureBias(candles: CandleData[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const closes = candles.map(c => c.close);
    const ascending = closes.every((close, i) => i === 0 || close >= closes[i - 1]);
    const descending = closes.every((close, i) => i === 0 || close <= closes[i - 1]);
    
    if (ascending) return 'BULLISH';
    if (descending) return 'BEARISH';
    return 'NEUTRAL';
  }

  private detectStructureBreak(candles: CandleData[]): { detected: boolean; type: string } {
    if (candles.length < 10) return { detected: false, type: 'insufficient_data' };
    
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    const recentHigh = Math.max(...highs.slice(-5));
    const previousHigh = Math.max(...highs.slice(-15, -5));
    const recentLow = Math.min(...lows.slice(-5));
    const previousLow = Math.min(...lows.slice(-15, -5));
    
    const highBreak = recentHigh > previousHigh * 1.001; // 0.1% break
    const lowBreak = recentLow < previousLow * 0.999;
    
    return {
      detected: highBreak || lowBreak,
      type: highBreak ? 'higher_high' : lowBreak ? 'lower_low' : 'none'
    };
  }

  private detectVolumeSpike(candles: CandleData[]): { detected: boolean; intensity: number } {
    const volumes = candles.map(c => c.volume || 0);
    if (volumes.every(v => v === 0)) return { detected: false, intensity: 0 };
    
    const avgVolume = volumes.slice(0, -3).reduce((a, b) => a + b, 0) / (volumes.length - 3);
    const recentVolume = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    const intensity = avgVolume > 0 ? recentVolume / avgVolume : 1;
    
    return {
      detected: intensity > 1.5, // 50% above average
      intensity
    };
  }

  private analyzePriceQuality(candles: CandleData[]): { score: number; quality: string } {
    const ranges = candles.map(c => c.high - c.low);
    const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
    const consistency = ranges.filter(r => Math.abs(r - avgRange) / avgRange < 0.5).length / ranges.length;
    
    let score = 0;
    if (consistency > 0.7) score += 10; // Consistent ranges
    if (avgRange > 0) score += 10; // Has movement
    
    return {
      score,
      quality: consistency > 0.7 ? 'high' : consistency > 0.5 ? 'medium' : 'low'
    };
  }

  private analyzeMomentumAlignment(candles: CandleData[]): { score: number; direction: string } {
    const momentum = this.calculateMomentum(candles);
    const strength = Math.abs(momentum);
    
    let score = 0;
    if (strength > 0.002) score += 15; // Strong momentum (0.2%)
    else if (strength > 0.001) score += 10; // Medium momentum
    else if (strength > 0.0005) score += 5; // Weak momentum
    
    return {
      score,
      direction: momentum > 0 ? 'bullish' : momentum < 0 ? 'bearish' : 'neutral'
    };
  }

  private getOverallDirection(candles: CandleData[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const momentum = this.calculateMomentum(candles);
    const bias = this.getStructureBias(candles);
    
    if (momentum > 0.001 && bias === 'BULLISH') return 'BULLISH';
    if (momentum < -0.001 && bias === 'BEARISH') return 'BEARISH';
    return 'NEUTRAL';
  }

  private detectReversalPattern(candles: CandleData[]): boolean {
    if (candles.length < 3) return false;
    
    const last3 = candles.slice(-3);
    const [first, middle, last] = last3;
    
    // Simple reversal: V-shaped or inverted V
    const isVPattern = middle.low < first.low && middle.low < last.low && last.close > first.close;
    const isInvertedV = middle.high > first.high && middle.high > last.high && last.close < first.close;
    
    return isVPattern || isInvertedV;
  }

  private detectRetestPattern(candles: CandleData[]): boolean {
    if (candles.length < 5) return false;
    
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    // Look for price returning to test a previous level
    const recentHigh = Math.max(...highs.slice(-3));
    const previousHigh = Math.max(...highs.slice(-8, -3));
    
    return Math.abs(recentHigh - previousHigh) / previousHigh < 0.002; // Within 0.2%
  }

  private detectInstitutionalCandle(candles: CandleData[]): boolean {
    if (candles.length < 2) return false;
    
    const lastCandle = candles[candles.length - 1];
    const prevCandles = candles.slice(-5, -1);
    const avgRange = prevCandles.reduce((sum, c) => sum + (c.high - c.low), 0) / prevCandles.length;
    
    const currentRange = lastCandle.high - lastCandle.low;
    
    // Institutional candle: significantly larger than average with strong close
    const isLargeRange = currentRange > avgRange * 1.5;
    const isStrongClose = Math.abs(lastCandle.close - lastCandle.open) / currentRange > 0.6;
    
    return isLargeRange && isStrongClose;
  }
}

export const realMarketAnalyzer = new RealMarketAnalyzer();