// Mini-Backtest Simulator for Signal Validation
// Fast pattern matching and historical performance analysis

import { Candle } from './DeterministicFilters';

export interface BacktestConfig {
  lookbackBars: number;
  minSampleSize: number;
  maxSlippage: number;
  commissionPips: number;
}

export interface TradeResult {
  entry: number;
  exit: number;
  exitType: 'SL' | 'TP' | 'TIMEOUT';
  pips: number;
  rr: number;
  barsHeld: number;
}

export interface BacktestResult {
  winRate: number;
  avgRiskReward: number;
  sampleSize: number;
  profitFactor: number;
  maxDrawdown: number;
  avgBarsHeld: number;
  trades: TradeResult[];
}

export interface PatternSignature {
  bosDirection: 'bullish' | 'bearish' | null;
  hasLiquiditySweep: boolean;
  hasFVG: boolean;
  hasOrderBlock: boolean;
  sessionType: 'Asian' | 'London' | 'NewYork';
  pricePosition: 'above_vwap' | 'below_vwap' | 'at_vwap';
}

export class BacktestSimulator {
  private readonly config: BacktestConfig;

  constructor(config: Partial<BacktestConfig> = {}) {
    this.config = {
      lookbackBars: 50,
      minSampleSize: 10,
      maxSlippage: 2, // pips
      commissionPips: 1.5,
      ...config
    };
  }

  /**
   * Run fast backtest simulation for a signal pattern
   */
  async runBacktest(
    candles: Candle[],
    pattern: PatternSignature,
    entry: number,
    stopLoss: number,
    takeProfit: number,
    direction: 'long' | 'short'
  ): Promise<BacktestResult> {
    
    if (candles.length < this.config.lookbackBars + 20) {
      return this.createEmptyResult('insufficient_history');
    }

    console.log(`📊 Running backtest for ${direction} signal...`);
    
    // Find similar historical patterns
    const historicalMatches = this.findSimilarPatterns(candles, pattern);
    
    if (historicalMatches.length < this.config.minSampleSize) {
      console.log(`⚠️ Insufficient pattern matches: ${historicalMatches.length}/${this.config.minSampleSize}`);
      return this.createEmptyResult('insufficient_samples');
    }

    console.log(`🔍 Found ${historicalMatches.length} similar patterns in history`);
    
    // Simulate trades for each match
    const trades: TradeResult[] = [];
    
    for (const match of historicalMatches) {
      const trade = this.simulateTrade(
        candles.slice(match.startIndex, match.startIndex + 30),
        entry,
        stopLoss,
        takeProfit,
        direction,
        match.startIndex
      );
      
      if (trade) {
        trades.push(trade);
      }
    }

    return this.calculateBacktestMetrics(trades);
  }

  /**
   * Find historical patterns similar to current setup
   */
  private findSimilarPatterns(candles: Candle[], targetPattern: PatternSignature): Array<{ startIndex: number; similarity: number }> {
    const matches: Array<{ startIndex: number; similarity: number }> = [];
    const endIndex = candles.length - 30; // Leave room for trade simulation
    
    // Scan through historical data
    for (let i = 20; i < endIndex; i++) {
      const historicalPattern = this.extractPattern(candles, i);
      const similarity = this.calculatePatternSimilarity(historicalPattern, targetPattern);
      
      // Require 70% similarity for pattern match
      if (similarity >= 0.7) {
        matches.push({ startIndex: i, similarity });
      }
    }
    
    // Sort by similarity and take best matches
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Math.min(50, matches.length)); // Max 50 samples for performance
  }

  /**
   * Extract pattern signature from historical point
   */
  private extractPattern(candles: Candle[], index: number): PatternSignature {
    const lookback = candles.slice(Math.max(0, index - 15), index + 1);
    
    // Simplified pattern extraction for speed
    const bosDirection = this.detectSimpleBOS(lookback);
    const hasLiquiditySweep = this.detectSimpleLiquiditySweep(lookback);
    const hasFVG = this.detectSimpleFVG(lookback);
    const hasOrderBlock = this.detectSimpleOrderBlock(lookback);
    const sessionType = this.getSessionFromTimestamp(candles[index].timestamp);
    const pricePosition = this.getPricePosition(lookback);
    
    return {
      bosDirection,
      hasLiquiditySweep,
      hasFVG,
      hasOrderBlock,
      sessionType,
      pricePosition
    };
  }

  /**
   * Calculate similarity between two patterns
   */
  private calculatePatternSimilarity(pattern1: PatternSignature, pattern2: PatternSignature): number {
    let score = 0;
    let maxScore = 0;
    
    // BOS Direction (weight: 3)
    maxScore += 3;
    if (pattern1.bosDirection === pattern2.bosDirection) score += 3;
    else if (pattern1.bosDirection && pattern2.bosDirection) score += 1; // Both have BOS but different direction
    
    // Liquidity Sweep (weight: 2)
    maxScore += 2;
    if (pattern1.hasLiquiditySweep === pattern2.hasLiquiditySweep) score += 2;
    
    // FVG (weight: 2)
    maxScore += 2;
    if (pattern1.hasFVG === pattern2.hasFVG) score += 2;
    
    // Order Block (weight: 2)
    maxScore += 2;
    if (pattern1.hasOrderBlock === pattern2.hasOrderBlock) score += 2;
    
    // Session Type (weight: 2)
    maxScore += 2;
    if (pattern1.sessionType === pattern2.sessionType) score += 2;
    
    // Price Position (weight: 1)
    maxScore += 1;
    if (pattern1.pricePosition === pattern2.pricePosition) score += 1;
    
    return score / maxScore;
  }

  /**
   * Simulate individual trade execution
   */
  private simulateTrade(
    tradeCandles: Candle[],
    entry: number,
    stopLoss: number,
    takeProfit: number,
    direction: 'long' | 'short',
    startIndex: number
  ): TradeResult | null {
    
    if (tradeCandles.length < 5) return null;
    
    const slippageEntry = entry + (direction === 'long' ? this.config.maxSlippage : -this.config.maxSlippage) * 0.0001;
    
    // Simulate bar-by-bar execution
    for (let i = 1; i < tradeCandles.length; i++) {
      const candle = tradeCandles[i];
      
      if (direction === 'long') {
        // Check stop loss hit
        if (candle.low <= stopLoss) {
          const slExit = Math.max(stopLoss - this.config.commissionPips * 0.0001, candle.low);
          return {
            entry: slippageEntry,
            exit: slExit,
            exitType: 'SL',
            pips: (slExit - slippageEntry) * 10000,
            rr: (slExit - slippageEntry) / (slippageEntry - stopLoss),
            barsHeld: i
          };
        }
        
        // Check take profit hit
        if (candle.high >= takeProfit) {
          const tpExit = Math.min(takeProfit - this.config.commissionPips * 0.0001, candle.high);
          return {
            entry: slippageEntry,
            exit: tpExit,
            exitType: 'TP',
            pips: (tpExit - slippageEntry) * 10000,
            rr: (tpExit - slippageEntry) / (slippageEntry - stopLoss),
            barsHeld: i
          };
        }
      } else {
        // Short direction
        if (candle.high >= stopLoss) {
          const slExit = Math.min(stopLoss + this.config.commissionPips * 0.0001, candle.high);
          return {
            entry: slippageEntry,
            exit: slExit,
            exitType: 'SL',
            pips: (slippageEntry - slExit) * 10000,
            rr: (slippageEntry - slExit) / (stopLoss - slippageEntry),
            barsHeld: i
          };
        }
        
        if (candle.low <= takeProfit) {
          const tpExit = Math.max(takeProfit + this.config.commissionPips * 0.0001, candle.low);
          return {
            entry: slippageEntry,
            exit: tpExit,
            exitType: 'TP',
            pips: (slippageEntry - tpExit) * 10000,
            rr: (slippageEntry - tpExit) / (stopLoss - slippageEntry),
            barsHeld: i
          };
        }
      }
    }
    
    // Timeout exit
    const lastCandle = tradeCandles[tradeCandles.length - 1];
    const timeoutExit = lastCandle.close - this.config.commissionPips * 0.0001;
    
    return {
      entry: slippageEntry,
      exit: timeoutExit,
      exitType: 'TIMEOUT',
      pips: direction === 'long' ? 
        (timeoutExit - slippageEntry) * 10000 : 
        (slippageEntry - timeoutExit) * 10000,
      rr: direction === 'long' ?
        (timeoutExit - slippageEntry) / (slippageEntry - stopLoss) :
        (slippageEntry - timeoutExit) / (stopLoss - slippageEntry),
      barsHeld: tradeCandles.length - 1
    };
  }

  /**
   * Calculate comprehensive backtest metrics
   */
  private calculateBacktestMetrics(trades: TradeResult[]): BacktestResult {
    if (trades.length === 0) {
      return this.createEmptyResult('no_trades');
    }

    const winningTrades = trades.filter(t => t.pips > 0);
    const losingTrades = trades.filter(t => t.pips <= 0);
    
    const winRate = winningTrades.length / trades.length;
    const avgRiskReward = trades.reduce((sum, t) => sum + t.rr, 0) / trades.length;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pips, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pips, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
    
    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;
    
    for (const trade of trades) {
      runningPnL += trade.pips;
      peak = Math.max(peak, runningPnL);
      const drawdown = peak - runningPnL;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    const avgBarsHeld = trades.reduce((sum, t) => sum + t.barsHeld, 0) / trades.length;
    
    console.log(`📊 Backtest complete: ${winRate * 100}% win rate, ${avgRiskReward.toFixed(2)} avg RR, ${trades.length} trades`);
    
    return {
      winRate,
      avgRiskReward,
      sampleSize: trades.length,
      profitFactor,
      maxDrawdown,
      avgBarsHeld,
      trades: trades.slice(0, 10) // Return sample of trades
    };
  }

  /**
   * Create empty result with reason
   */
  private createEmptyResult(reason: string): BacktestResult {
    console.log(`📊 Backtest empty result: ${reason}`);
    return {
      winRate: 0,
      avgRiskReward: 0,
      sampleSize: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      avgBarsHeld: 0,
      trades: []
    };
  }

  // Simplified detection methods for pattern matching (performance optimized)
  
  private detectSimpleBOS(candles: Candle[]): 'bullish' | 'bearish' | null {
    if (candles.length < 6) return null;
    
    const recent = candles.slice(-3);
    const older = candles.slice(-6, -3);
    
    const recentHigh = Math.max(...recent.map(c => c.high));
    const recentLow = Math.min(...recent.map(c => c.low));
    const olderHigh = Math.max(...older.map(c => c.high));
    const olderLow = Math.min(...older.map(c => c.low));
    
    if (recentHigh > olderHigh * 1.0005) return 'bullish';
    if (recentLow < olderLow * 0.9995) return 'bearish';
    
    return null;
  }

  private detectSimpleLiquiditySweep(candles: Candle[]): boolean {
    if (candles.length < 5) return false;
    
    const recent = candles.slice(-3);
    const wickSizes = recent.map(c => Math.max(
      c.high - Math.max(c.open, c.close),
      Math.min(c.open, c.close) - c.low
    ));
    
    return Math.max(...wickSizes) > Math.abs(recent[0].close - recent[0].open) * 2;
  }

  private detectSimpleFVG(candles: Candle[]): boolean {
    if (candles.length < 3) return false;
    
    for (let i = 2; i < candles.length; i++) {
      const c1 = candles[i - 2];
      const c3 = candles[i];
      
      if (c1.high < c3.low || c1.low > c3.high) {
        return true;
      }
    }
    
    return false;
  }

  private detectSimpleOrderBlock(candles: Candle[]): boolean {
    if (candles.length < 3) return false;
    
    return candles.some(c => {
      const bodySize = Math.abs(c.close - c.open);
      const upperWick = c.high - Math.max(c.open, c.close);
      const lowerWick = Math.min(c.open, c.close) - c.low;
      
      return Math.max(upperWick, lowerWick) > bodySize * 1.5;
    });
  }

  private getSessionFromTimestamp(timestamp: number): 'Asian' | 'London' | 'NewYork' {
    const hour = new Date(timestamp).getUTCHours();
    
    if (hour >= 0 && hour < 8) return 'Asian';
    if (hour >= 8 && hour < 16) return 'London';
    return 'NewYork';
  }

  private getPricePosition(candles: Candle[]): 'above_vwap' | 'below_vwap' | 'at_vwap' {
    const totalVolume = candles.reduce((sum, c) => sum + c.volume, 0);
    const vwap = candles.reduce((sum, c) => sum + (c.close * c.volume), 0) / totalVolume;
    const lastPrice = candles[candles.length - 1].close;
    
    const threshold = vwap * 0.0005;
    
    if (lastPrice > vwap + threshold) return 'above_vwap';
    if (lastPrice < vwap - threshold) return 'below_vwap';
    return 'at_vwap';
  }
}