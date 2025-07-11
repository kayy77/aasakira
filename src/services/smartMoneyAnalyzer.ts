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
    
    // Get the MOST CURRENT price - use the latest candle's close price
    const latestCandle = candles[candles.length - 1];
    const currentPrice = latestCandle?.close || marketData.currentPrice;
    
    console.log(`📊 Using LATEST CANDLE price: ${currentPrice} for ${marketData.pair} (timestamp: ${new Date(latestCandle.timestamp).toLocaleTimeString()})`);

    // Smart Money Concepts Analysis
    const bos = this.detectBreakOfStructure(candles);
    const fvg = this.detectFairValueGap(candles);
    const liquiditySweep = this.detectLiquiditySweep(candles);
    const orderBlock = this.detectOrderBlock(candles);
    const momentum = this.analyzeMomentum(candles);
    const support = this.detectSupportResistance(candles, currentPrice);
    
    let confidence = 0;
    let reason = '';
    let signalType: 'BUY' | 'SELL' | null = null;
    
    // Calculate confidence based on confluences
    if (bos.detected) {
      confidence += 25;
      reason += 'Break of Structure detected. ';
      signalType = bos.direction;
    }
    
    if (fvg.detected) {
      confidence += 20;
      reason += 'Fair Value Gap identified. ';
    }
    
    if (liquiditySweep.detected) {
      confidence += 15;
      reason += 'Liquidity sweep confirmed. ';
    }
    
    if (orderBlock.detected) {
      confidence += 25;
      reason += 'Order block confluence. ';
    }
    
    if (momentum.strong) {
      confidence += 15;
      reason += `${momentum.direction} momentum. `;
      if (!signalType) {
        signalType = momentum.direction === 'bullish' ? 'BUY' : 'SELL';
      }
    }

    if (support.atLevel) {
      confidence += 10;
      reason += 'Key level interaction. ';
    }

    // If no clear direction, determine from price action
    if (!signalType) {
      const recentCandles = candles.slice(-5);
      const avgClose = recentCandles.reduce((sum, c) => sum + c.close, 0) / recentCandles.length;
      signalType = currentPrice > avgClose ? 'BUY' : 'SELL';
      confidence += 5; // Minimal confidence for basic direction
    }

    // Always generate a signal with the best available setup
    if (signalType && confidence > 0) {
      const riskRewardRatio = 2.5;
      const stopLossDistance = this.calculateStopLoss(candles, signalType);
      
      const signal = {
        id: Date.now(),
        pair: marketData.pair,
        type: signalType,
        confidence,
        entry: Number(currentPrice.toFixed(marketData.pair.includes('JPY') ? 2 : 4)), // Use EXACT current price
        stopLoss: signalType === 'BUY' 
          ? Number((currentPrice - stopLossDistance).toFixed(marketData.pair.includes('JPY') ? 2 : 4))
          : Number((currentPrice + stopLossDistance).toFixed(marketData.pair.includes('JPY') ? 2 : 4)),
        takeProfit: signalType === 'BUY' 
          ? Number((currentPrice + (stopLossDistance * riskRewardRatio)).toFixed(marketData.pair.includes('JPY') ? 2 : 4))
          : Number((currentPrice - (stopLossDistance * riskRewardRatio)).toFixed(marketData.pair.includes('JPY') ? 2 : 4)),
        status: confidence >= 75 ? 'active' as const : 'monitoring' as const,
        timestamp: new Date().toISOString(),
        timeframe: 'H1',
        risk: confidence > 70 ? 'Low' as const : confidence > 40 ? 'Medium' as const : 'High' as const,
        analysis: `${confidence >= 75 ? 'High-probability' : 'Moderate'} ${signalType} setup with ${confidence}% confidence using live market data`,
        reason: reason.trim() || 'Basic price action setup'
      };

      console.log(`✅ SIGNAL GENERATED: ${signalType} ${marketData.pair} @ ${currentPrice} (${confidence}% confidence)`);
      return { signal, confidence, reason };
    }

    console.log(`❌ No signal: ${marketData.pair} insufficient setup`);
    return { signal: null, confidence: 0, reason: 'No viable setup found' };
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
