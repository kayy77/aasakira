// Sniper-Grade Confirmation Engine
// Only fires when ALL institutional conditions are met

export interface MicroStructureData {
  symbol: string;
  m1Candles: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
  }>;
  m5Candles: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
  }>;
  orderFlowDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  liquidityStacked: 'BUY_SIDE' | 'SELL_SIDE' | 'BALANCED';
  volumeProfile: 'INCREASING' | 'DECREASING' | 'STABLE';
  bigMoneyFootprint: 'ACCUMULATING' | 'DISTRIBUTING' | 'ABSENT';
}

export interface SniperConfirmation {
  liquiditySweep: {
    occurred: boolean;
    sweepType: 'BUYSIDE' | 'SELLSIDE' | 'NONE';
    sweptLevel: number;
    sweepCandle: number; // index
    rejectionWick: boolean;
    wickSize: number; // in pips
  };
  microBOS: {
    m1Confirmed: boolean;
    m5Confirmed: boolean;
    consecutiveCloses: number;
    bosCandle: number; // index
  };
  retestQuality: {
    occurred: boolean;
    retestLevel: number;
    rejectionStrength: 'WEAK' | 'MEDIUM' | 'STRONG';
    volumeConfirmation: boolean;
  };
  orderFlow: {
    direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number; // 0-100
    bigMoneyPresent: boolean;
    liquidityImbalance: boolean;
  };
  timeRemaining: number; // candles until signal expires
}

export interface SniperResult {
  confirmed: boolean;
  entryMethod: 'LIMIT_RETEST' | 'STOP_BREAKOUT' | 'MARKET_URGENT' | 'CANCEL';
  entryPrice: number;
  entryTimeframe: 'M1' | 'M5' | 'M15';
  expiryCandles: number;
  confidenceScore: number; // 0-100
  rejectionReasons: string[];
  orderFlowSupport: boolean;
}

export class SniperConfirmationEngine {
  private static readonly MIN_WICK_SIZE = 8; // pips
  private static readonly MIN_CONSECUTIVE_CLOSES = 2;
  private static readonly MAX_SIGNAL_LIFE = 20; // candles before expiry
  private static readonly MIN_CONFIDENCE = 85;

  static analyzeSniperEntry(data: MicroStructureData): SniperResult {
    const result: SniperResult = {
      confirmed: false,
      entryMethod: 'CANCEL',
      entryPrice: 0,
      entryTimeframe: 'M5',
      expiryCandles: 0,
      confidenceScore: 0,
      rejectionReasons: [],
      orderFlowSupport: false
    };

    // Step 1: Detect Liquidity Sweep
    const sweepAnalysis = this.detectLiquiditySweep(data);
    if (!sweepAnalysis.occurred) {
      result.rejectionReasons.push('NO_LIQUIDITY_SWEEP');
      return result;
    }

    // Step 2: Verify Rejection Wick
    if (!sweepAnalysis.rejectionWick || sweepAnalysis.wickSize < this.MIN_WICK_SIZE) {
      result.rejectionReasons.push('WEAK_REJECTION_WICK');
      return result;
    }

    // Step 3: Wait for Micro BOS
    const bosAnalysis = this.detectMicroBOS(data, sweepAnalysis.sweepType);
    if (!bosAnalysis.m1Confirmed || !bosAnalysis.m5Confirmed) {
      result.rejectionReasons.push('NO_MICRO_BOS_CONFIRMATION');
      return result;
    }

    // Step 4: Analyze Retest Quality
    const retestAnalysis = this.analyzeRetestQuality(data, sweepAnalysis);
    if (!retestAnalysis.occurred || retestAnalysis.rejectionStrength === 'WEAK') {
      result.rejectionReasons.push('POOR_RETEST_QUALITY');
      return result;
    }

    // Step 5: Order Flow Confirmation
    const orderFlowSupport = this.validateOrderFlow(data, sweepAnalysis.sweepType);
    if (!orderFlowSupport.bigMoneyPresent) {
      result.rejectionReasons.push('NO_BIG_MONEY_SUPPORT');
      return result;
    }

    // Calculate confidence and entry method
    const confidence = this.calculateConfidence(sweepAnalysis, bosAnalysis, retestAnalysis, orderFlowSupport);
    
    if (confidence >= this.MIN_CONFIDENCE) {
      result.confirmed = true;
      result.entryMethod = this.determineEntryMethod(retestAnalysis, orderFlowSupport);
      result.entryPrice = this.calculateOptimalEntry(data, retestAnalysis);
      result.entryTimeframe = bosAnalysis.m1Confirmed ? 'M1' : 'M5';
      result.expiryCandles = this.MAX_SIGNAL_LIFE - (bosAnalysis.bosCandle - sweepAnalysis.sweepCandle);
      result.confidenceScore = confidence;
      result.orderFlowSupport = true;
    } else {
      result.rejectionReasons.push('INSUFFICIENT_CONFIDENCE');
    }

    return result;
  }

  private static detectLiquiditySweep(data: MicroStructureData): SniperConfirmation['liquiditySweep'] {
    const m5Candles = data.m5Candles.slice(-10); // Last 10 M5 candles
    const result: SniperConfirmation['liquiditySweep'] = {
      occurred: false,
      sweepType: 'NONE',
      sweptLevel: 0,
      sweepCandle: -1,
      rejectionWick: false,
      wickSize: 0
    };

    // Look for sweep pattern in recent candles
    for (let i = m5Candles.length - 3; i >= 0; i--) {
      const candle = m5Candles[i];
      const prevHigh = Math.max(...m5Candles.slice(0, i).map(c => c.high));
      const prevLow = Math.min(...m5Candles.slice(0, i).map(c => c.low));

      // Detect buyside sweep
      if (candle.high > prevHigh) {
        const wickSize = (candle.high - Math.max(candle.open, candle.close)) * 10000; // Convert to pips
        if (wickSize >= this.MIN_WICK_SIZE) {
          result.occurred = true;
          result.sweepType = 'BUYSIDE';
          result.sweptLevel = candle.high;
          result.sweepCandle = i;
          result.rejectionWick = true;
          result.wickSize = wickSize;
          break;
        }
      }

      // Detect sellside sweep
      if (candle.low < prevLow) {
        const wickSize = (Math.min(candle.open, candle.close) - candle.low) * 10000;
        if (wickSize >= this.MIN_WICK_SIZE) {
          result.occurred = true;
          result.sweepType = 'SELLSIDE';
          result.sweptLevel = candle.low;
          result.sweepCandle = i;
          result.rejectionWick = true;
          result.wickSize = wickSize;
          break;
        }
      }
    }

    return result;
  }

  private static detectMicroBOS(data: MicroStructureData, sweepType: string): SniperConfirmation['microBOS'] {
    const m1Candles = data.m1Candles.slice(-20);
    const m5Candles = data.m5Candles.slice(-5);
    
    const result = {
      m1Confirmed: false,
      m5Confirmed: false,
      consecutiveCloses: 0,
      bosCandle: -1
    };

    const direction = sweepType === 'BUYSIDE' ? 'DOWN' : 'UP';
    
    // Check M1 BOS
    let consecutiveM1 = 0;
    for (let i = m1Candles.length - 1; i >= 1; i--) {
      const current = m1Candles[i];
      const prev = m1Candles[i - 1];
      
      if (direction === 'DOWN' && current.close < prev.close) {
        consecutiveM1++;
      } else if (direction === 'UP' && current.close > prev.close) {
        consecutiveM1++;
      } else {
        break;
      }
    }

    // Check M5 BOS
    let consecutiveM5 = 0;
    for (let i = m5Candles.length - 1; i >= 1; i--) {
      const current = m5Candles[i];
      const prev = m5Candles[i - 1];
      
      if (direction === 'DOWN' && current.close < prev.close) {
        consecutiveM5++;
      } else if (direction === 'UP' && current.close > prev.close) {
        consecutiveM5++;
      } else {
        break;
      }
    }

    result.m1Confirmed = consecutiveM1 >= this.MIN_CONSECUTIVE_CLOSES;
    result.m5Confirmed = consecutiveM5 >= 1; // At least 1 M5 close
    result.consecutiveCloses = Math.max(consecutiveM1, consecutiveM5);
    result.bosCandle = m1Candles.length - consecutiveM1;

    return result;
  }

  private static analyzeRetestQuality(data: MicroStructureData, sweep: SniperConfirmation['liquiditySweep']): SniperConfirmation['retestQuality'] {
    const recentCandles = data.m5Candles.slice(-5);
    const latestCandle = recentCandles[recentCandles.length - 1];
    
    const result: SniperConfirmation['retestQuality'] = {
      occurred: false,
      retestLevel: 0,
      rejectionStrength: 'WEAK',
      volumeConfirmation: false
    };

    // Check if price has retested the swept level area
    const sweepLevel = sweep.sweptLevel;
    const retestThreshold = Math.abs(sweepLevel * 0.0002); // 2 pips threshold

    for (const candle of recentCandles) {
      if (Math.abs(candle.close - sweepLevel) <= retestThreshold) {
        result.occurred = true;
        result.retestLevel = candle.close;
        
        // Analyze rejection strength
        const bodySize = Math.abs(candle.close - candle.open);
        const totalRange = candle.high - candle.low;
        const wickRatio = (totalRange - bodySize) / totalRange;
        
        if (wickRatio > 0.6 && candle.volume > (data.m5Candles.slice(-10).reduce((sum, c) => sum + c.volume, 0) / 10)) {
          result.rejectionStrength = 'STRONG';
          result.volumeConfirmation = true;
        } else if (wickRatio > 0.4) {
          result.rejectionStrength = 'MEDIUM';
        }
        
        break;
      }
    }

    return result;
  }

  private static validateOrderFlow(data: MicroStructureData, sweepType: string): SniperConfirmation['orderFlow'] {
    const result = {
      direction: data.orderFlowDirection,
      strength: 0,
      bigMoneyPresent: false,
      liquidityImbalance: false
    };

    // Validate order flow direction matches setup
    const expectedDirection = sweepType === 'BUYSIDE' ? 'BEARISH' : 'BULLISH';
    if (data.orderFlowDirection === expectedDirection) {
      result.strength += 30;
    }

    // Check for big money footprint
    if (data.bigMoneyFootprint === 'ACCUMULATING' || data.bigMoneyFootprint === 'DISTRIBUTING') {
      result.bigMoneyPresent = true;
      result.strength += 40;
    }

    // Check liquidity stacking
    if (data.liquidityStacked !== 'BALANCED') {
      result.liquidityImbalance = true;
      result.strength += 30;
    }

    return result;
  }

  private static calculateConfidence(
    sweep: SniperConfirmation['liquiditySweep'],
    bos: SniperConfirmation['microBOS'],
    retest: SniperConfirmation['retestQuality'],
    orderFlow: SniperConfirmation['orderFlow']
  ): number {
    let confidence = 0;

    // Base confidence from sweep quality
    confidence += Math.min(sweep.wickSize * 2, 30); // Max 30 from wick

    // BOS strength
    confidence += bos.consecutiveCloses * 10; // Max 20-30

    // Retest quality
    if (retest.rejectionStrength === 'STRONG') confidence += 25;
    else if (retest.rejectionStrength === 'MEDIUM') confidence += 15;

    // Order flow support
    confidence += orderFlow.strength * 0.4; // Max ~32

    return Math.min(confidence, 100);
  }

  private static determineEntryMethod(
    retest: SniperConfirmation['retestQuality'],
    orderFlow: SniperConfirmation['orderFlow']
  ): SniperResult['entryMethod'] {
    if (retest.rejectionStrength === 'STRONG' && orderFlow.bigMoneyPresent) {
      return 'LIMIT_RETEST';
    } else if (orderFlow.liquidityImbalance) {
      return 'STOP_BREAKOUT';
    } else {
      return 'MARKET_URGENT';
    }
  }

  private static calculateOptimalEntry(data: MicroStructureData, retest: SniperConfirmation['retestQuality']): number {
    const latestCandle = data.m5Candles[data.m5Candles.length - 1];
    
    // For limit orders, place at retest level
    if (retest.occurred) {
      return retest.retestLevel;
    }
    
    // Fallback to current close
    return latestCandle.close;
  }

  // Utility to create mock data for testing
  static createMockData(symbol: string): MicroStructureData {
    const basePrice = symbol.includes('JPY') ? 147.5 : 1.0856;
    
    return {
      symbol,
      m1Candles: Array.from({ length: 20 }, (_, i) => ({
        open: basePrice + (Math.random() - 0.5) * 0.001,
        high: basePrice + Math.random() * 0.002,
        low: basePrice - Math.random() * 0.002,
        close: basePrice + (Math.random() - 0.5) * 0.001,
        volume: 1000 + Math.random() * 500,
        timestamp: Date.now() - (20 - i) * 60000
      })),
      m5Candles: Array.from({ length: 10 }, (_, i) => ({
        open: basePrice + (Math.random() - 0.5) * 0.003,
        high: basePrice + Math.random() * 0.004,
        low: basePrice - Math.random() * 0.004,
        close: basePrice + (Math.random() - 0.5) * 0.003,
        volume: 5000 + Math.random() * 2000,
        timestamp: Date.now() - (10 - i) * 300000
      })),
      orderFlowDirection: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
      liquidityStacked: Math.random() > 0.33 ? 'BUY_SIDE' : Math.random() > 0.5 ? 'SELL_SIDE' : 'BALANCED',
      volumeProfile: Math.random() > 0.33 ? 'INCREASING' : Math.random() > 0.5 ? 'DECREASING' : 'STABLE',
      bigMoneyFootprint: Math.random() > 0.5 ? 'ACCUMULATING' : Math.random() > 0.7 ? 'DISTRIBUTING' : 'ABSENT'
    };
  }
}

export const sniperConfirmationEngine = new SniperConfirmationEngine();