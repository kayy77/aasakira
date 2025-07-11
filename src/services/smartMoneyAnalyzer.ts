import type { MarketData, CandleData } from './marketDataService';

interface SignalAnalysis {
  signal: any | null;
  confidence: number;
  reason: string;
}

class SmartMoneyAnalyzer {
  analyzeForSignal(marketData: MarketData): SignalAnalysis {
    console.log(`🧠 Analyzing ${marketData.pair} with ${marketData.candles.length} candles, current price: ${marketData.currentPrice}`);
    
    if (marketData.candles.length < 20) {
      return { signal: null, confidence: 0, reason: 'Insufficient data' };
    }

    const candles = marketData.candles;
    const latestCandle = candles[candles.length - 1];
    const currentPrice = latestCandle?.close || marketData.currentPrice;
    
    console.log(`📊 Using LATEST CANDLE price: ${currentPrice} for ${marketData.pair} (timestamp: ${new Date(latestCandle.timestamp).toLocaleTimeString()})`);

    // ✅ STRICT Smart Money Concept Analysis - ALL conditions must be met
    const bos = this.detectBreakOfStructure(candles);
    const fvgOrOrderBlock = this.detectFairValueGapOrOrderBlock(candles, currentPrice);
    const liquiditySweep = this.detectLiquiditySweep(candles);
    const support = this.detectSupportResistance(candles, currentPrice);
    
    console.log(`📋 Confluence Check for ${marketData.pair}:`);
    console.log(`  ✅ Break of Structure: ${bos.detected ? `YES (${bos.direction})` : 'NO'}`);
    console.log(`  ✅ FVG/Order Block: ${fvgOrOrderBlock.detected ? 'YES' : 'NO'}`);
    console.log(`  ✅ Liquidity Sweep: ${liquiditySweep.detected ? 'YES' : 'NO'}`);
    console.log(`  ✅ Support/Resistance: ${support.atLevel ? 'YES' : 'NO'}`);
    
    // ALL CONDITIONS MUST BE MET for signal generation
    const allConditionsMet = bos.detected && fvgOrOrderBlock.detected && liquiditySweep.detected && support.atLevel;
    
    if (!allConditionsMet) {
      const missingConditions = [];
      if (!bos.detected) missingConditions.push('Break of Structure');
      if (!fvgOrOrderBlock.detected) missingConditions.push('FVG/Order Block');
      if (!liquiditySweep.detected) missingConditions.push('Liquidity Sweep');
      if (!support.atLevel) missingConditions.push('Support/Resistance');
      
      console.log(`❌ Missing confluences: ${missingConditions.join(', ')}`);
      return { 
        signal: null, 
        confidence: 0, 
        reason: `Missing confluences: ${missingConditions.join(', ')}` 
      };
    }
    
    // Calculate proper risk:reward ratio
    const stopLossDistance = this.calculateStopLoss(candles, bos.direction);
    const riskRewardRatio = 2.1; // Minimum 2:1 R:R
    
    // Verify R:R is adequate
    if (stopLossDistance <= 0) {
      return { signal: null, confidence: 0, reason: 'Invalid stop loss calculation' };
    }
    
    const signal = {
      id: Date.now(),
      pair: marketData.pair,
      type: bos.direction,
      confidence: 85, // High confidence when all confluences align
      entry: Number(currentPrice.toFixed(marketData.pair.includes('JPY') ? 2 : 4)),
      stopLoss: bos.direction === 'BUY' 
        ? Number((currentPrice - stopLossDistance).toFixed(marketData.pair.includes('JPY') ? 2 : 4))
        : Number((currentPrice + stopLossDistance).toFixed(marketData.pair.includes('JPY') ? 2 : 4)),
      takeProfit: bos.direction === 'BUY' 
        ? Number((currentPrice + (stopLossDistance * riskRewardRatio)).toFixed(marketData.pair.includes('JPY') ? 2 : 4))
        : Number((currentPrice - (stopLossDistance * riskRewardRatio)).toFixed(marketData.pair.includes('JPY') ? 2 : 4)),
      status: 'active' as const,
      timestamp: new Date().toISOString(),
      timeframe: 'M15',
      risk: 'Low' as const,
      analysis: `High-probability ${bos.direction} setup with full Smart Money confluence`,
      reason: `Liquidity sweep + ${fvgOrOrderBlock.type} tap after BoS`
    };

    console.log(`🎯 PERFECT SETUP FOUND: ${bos.direction} ${marketData.pair} @ ${currentPrice}`);
    console.log(`   Entry: ${signal.entry} | SL: ${signal.stopLoss} | TP: ${signal.takeProfit}`);
    console.log(`   R:R: ${riskRewardRatio}:1 | Risk: ${stopLossDistance.toFixed(4)}`);
    
    return { 
      signal, 
      confidence: 85, 
      reason: `Liquidity sweep + ${fvgOrOrderBlock.type} tap after BoS` 
    };
  }

  private detectBreakOfStructure(candles: CandleData[]): { detected: boolean; direction: 'BUY' | 'SELL' } {
    if (candles.length < 10) return { detected: false, direction: 'BUY' };
    
    const recent = candles.slice(-10);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);
    
    const recentHigh = Math.max(...highs.slice(-5));
    const previousHigh = Math.max(...highs.slice(-10, -5));
    
    const recentLow = Math.min(...lows.slice(-5));
    const previousLow = Math.min(...lows.slice(-10, -5));
    
    // Bullish BOS: Higher High
    if (recentHigh > previousHigh * 1.001) {
      return { detected: true, direction: 'BUY' };
    }
    
    // Bearish BOS: Lower Low  
    if (recentLow < previousLow * 0.999) {
      return { detected: true, direction: 'SELL' };
    }
    
    return { detected: false, direction: 'BUY' };
  }

  private detectFairValueGap(candles: CandleData[]): { detected: boolean } {
    if (candles.length < 5) return { detected: false };
    
    const recent = candles.slice(-5);
    
    for (let i = 1; i < recent.length - 1; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];
      const next = recent[i + 1];
      
      // Bullish FVG: Gap between previous high and next low
      const bullishGap = prev.high < next.low;
      // Bearish FVG: Gap between previous low and next high  
      const bearishGap = prev.low > next.high;
      
      if (bullishGap || bearishGap) {
        return { detected: true };
      }
    }
    
    return { detected: false };
  }

  private detectLiquiditySweep(candles: CandleData[]): { detected: boolean } {
    if (candles.length < 8) return { detected: false };
    
    const recent = candles.slice(-8);
    const lastCandle = recent[recent.length - 1];
    
    // Check for wicks that sweep previous highs/lows
    const prevHighs = recent.slice(0, -1).map(c => c.high);
    const prevLows = recent.slice(0, -1).map(c => c.low);
    
    const maxPrevHigh = Math.max(...prevHighs);
    const minPrevLow = Math.min(...prevLows);
    
    // Liquidity sweep up then rejection
    const sweepHigh = lastCandle.high > maxPrevHigh && lastCandle.close < maxPrevHigh;
    // Liquidity sweep down then rejection
    const sweepLow = lastCandle.low < minPrevLow && lastCandle.close > minPrevLow;
    
    return { detected: sweepHigh || sweepLow };
  }

  private detectFairValueGapOrOrderBlock(candles: CandleData[], currentPrice: number): { detected: boolean; type: string } {
    if (candles.length < 6) return { detected: false, type: '' };
    
    // Check for Fair Value Gap first
    const fvg = this.detectFairValueGap(candles);
    if (fvg.detected) {
      return { detected: true, type: 'FVG' };
    }
    
    // Check for Order Block
    const recent = candles.slice(-6);
    for (const candle of recent) {
      const bodySize = Math.abs(candle.close - candle.open);
      const totalSize = candle.high - candle.low;
      
      // Strong body relative to total range (> 70%) and price near this level
      if (bodySize / totalSize > 0.7) {
        const candleMidpoint = (candle.high + candle.low) / 2;
        const tolerance = currentPrice * 0.002; // 0.2% tolerance
        
        if (Math.abs(currentPrice - candleMidpoint) < tolerance) {
          return { detected: true, type: 'Order Block' };
        }
      }
    }
    
    return { detected: false, type: '' };
  }

  private detectOrderBlock(candles: CandleData[]): { detected: boolean } {
    if (candles.length < 6) return { detected: false };
    
    const recent = candles.slice(-6);
    
    // Look for strong directional candles (order blocks)
    for (const candle of recent) {
      const bodySize = Math.abs(candle.close - candle.open);
      const totalSize = candle.high - candle.low;
      
      // Strong body relative to total range (> 70%)
      if (bodySize / totalSize > 0.7) {
        return { detected: true };
      }
    }
    
    return { detected: false };
  }

  private analyzeMomentum(candles: CandleData[]): { strong: boolean; direction: 'bullish' | 'bearish' } {
    if (candles.length < 8) return { strong: false, direction: 'bullish' };
    
    const recent = candles.slice(-8);
    const closes = recent.map(c => c.close);
    
    // Simple momentum: compare recent closes
    const firstHalf = closes.slice(0, 4);
    const secondHalf = closes.slice(4);
    
    const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
    
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return {
      strong: Math.abs(percentChange) > 0.05, // Lowered threshold for more signals
      direction: percentChange > 0 ? 'bullish' : 'bearish'
    };
  }

  private detectSupportResistance(candles: CandleData[], currentPrice: number): { atLevel: boolean } {
    if (candles.length < 20) return { atLevel: false };
    
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    // Find significant levels (within 0.1% of current price)
    const tolerance = currentPrice * 0.001;
    
    const nearResistance = highs.some(high => Math.abs(high - currentPrice) < tolerance);
    const nearSupport = lows.some(low => Math.abs(low - currentPrice) < tolerance);
    
    return { atLevel: nearResistance || nearSupport };
  }

  private calculateStopLoss(candles: CandleData[], direction: 'BUY' | 'SELL'): number {
    const recent = candles.slice(-10);
    const atr = this.calculateATR(recent);
    
    // Stop loss based on ATR and direction
    return atr * 1.5;
  }

  private calculateATR(candles: CandleData[]): number {
    if (candles.length < 2) return 0.01;
    
    let totalTrueRange = 0;
    
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const previous = candles[i - 1];
      
      const highLow = current.high - current.low;
      const highPrevClose = Math.abs(current.high - previous.close);
      const lowPrevClose = Math.abs(current.low - previous.close);
      
      const trueRange = Math.max(highLow, highPrevClose, lowPrevClose);
      totalTrueRange += trueRange;
    }
    
    return totalTrueRange / (candles.length - 1);
  }
}

export const smartMoneyAnalyzer = new SmartMoneyAnalyzer();
