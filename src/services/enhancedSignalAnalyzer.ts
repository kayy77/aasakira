import { realTimePriceEngine, LivePriceData } from './realtimePriceEngine';

interface ConfluenceFilter {
  name: string;
  weight: number;
  check: (data: MarketAnalysisData) => boolean;
  reason: string;
}

interface MarketAnalysisData {
  pair: string;
  timeframes: {
    h1: CandleData[];
    m15: CandleData[];
    m5: CandleData[];
  };
  currentPrice: number;
  volume: number[];
  atr: number;
  rsi: number;
  session: 'london' | 'ny' | 'asia' | 'sydney';
  newsEvents: NewsEvent[];
}

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
  volume?: number;
}

interface NewsEvent {
  time: number;
  impact: 'high' | 'medium' | 'low';
  currency: string;
  title: string;
}

interface EnhancedSignal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  confluenceScore: number;
  maxConfluence: number;
  reasons: string[];
  timeValidity: string;
  riskReward: number;
  historicalWinRate: number;
  similarSetups: number;
  status: 'active' | 'monitoring';
  timestamp: string;
  tags: string[];
}

class EnhancedSignalAnalyzer {
  private confluenceFilters: ConfluenceFilter[] = [
    {
      name: 'SMC Structure',
      weight: 2,
      check: (data: MarketAnalysisData) => this.checkSMCStructure(data),
      reason: 'Break of Structure + Order Block confirmation'
    },
    {
      name: 'Liquidity Sweep',
      weight: 1.5,
      check: (data: MarketAnalysisData) => this.checkLiquiditySweep(data),
      reason: 'Previous highs/lows swept with rejection'
    },
    {
      name: 'Fair Value Gap',
      weight: 1.5,
      check: (data: MarketAnalysisData) => this.checkFairValueGap(data),
      reason: 'Imbalance zone identified for potential fill'
    },
    {
      name: 'Session Filter',
      weight: 1,
      check: (data: MarketAnalysisData) => this.checkSessionFilter(data),
      reason: 'Trading during high volatility session'
    },
    {
      name: 'Volume Spike',
      weight: 1,
      check: (data: MarketAnalysisData) => this.checkVolumeSpike(data),
      reason: 'Significant volume increase detected'
    },
    {
      name: 'RSI Divergence',
      weight: 1,
      check: (data: MarketAnalysisData) => this.checkRSIDivergence(data),
      reason: 'RSI divergence on higher timeframe'
    }
  ];

  public async generateSignal(): Promise<EnhancedSignal | null> {
    try {
      // Get a random currency pair
      const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      
      console.log(`🧠 Enhanced Signal Analysis for ${randomPair}...`);
      
      const signal = await this.analyzeForSignal(randomPair);
      return signal;
    } catch (error) {
      console.error('Failed to generate enhanced signal:', error);
      return null;
    }
  }

  async analyzeForSignal(pair: string): Promise<EnhancedSignal | null> {
    try {
      console.log(`🧠 Enhanced Signal Analysis for ${pair}...`);
      
      // Get market data
      const marketData = await this.fetchMarketData(pair);
      
      // Check news filter first
      if (this.hasHighImpactNews(marketData)) {
        console.log(`❌ High impact news detected for ${pair} - blocking signal`);
        return null;
      }

      // Check volatility filter
      if (this.isMarketTooVolatile(marketData)) {
        console.log(`❌ Market too volatile for ${pair} - blocking signal`);
        return null;
      }

      // Run confluence analysis
      const confluenceResults = this.runConfluenceAnalysis(marketData);
      
      // Check minimum confluence requirement (3 out of 6 filters)
      if (confluenceResults.passedFilters.length < 3) {
        console.log(`❌ Insufficient confluence for ${pair}: ${confluenceResults.passedFilters.length}/6`);
        return null;
      }

      // Check multi-timeframe agreement
      const timeframeAgreement = this.checkTimeframeAgreement(marketData);
      if (!timeframeAgreement.agreement) {
        console.log(`❌ Timeframe conflict detected for ${pair}`);
        return null;
      }

      // Generate signal
      const signal = await this.generateSignal(marketData, confluenceResults, timeframeAgreement);
      
      // Add historical analysis
      const historicalAnalysis = await this.analyzeHistoricalPerformance(signal);
      signal.historicalWinRate = historicalAnalysis.winRate;
      signal.similarSetups = historicalAnalysis.totalSetups;

      console.log(`✅ Enhanced signal generated for ${pair}:`);
      console.log(`   Confluence: ${confluenceResults.passedFilters.length}/6`);
      console.log(`   Confidence: ${signal.confidence}%`);
      console.log(`   Historical Win Rate: ${signal.historicalWinRate}%`);
      
      return signal;

    } catch (error) {
      console.error(`Failed to analyze ${pair}:`, error);
      return null;
    }
  }

  private async fetchMarketData(pair: string): Promise<MarketAnalysisData> {
    // Simulate fetching multi-timeframe data
    const basePrice = this.getBasePrice(pair);
    
    return {
      pair,
      timeframes: {
        h1: this.generateCandles(basePrice, 24, 3600),
        m15: this.generateCandles(basePrice, 96, 900),
        m5: this.generateCandles(basePrice, 288, 300)
      },
      currentPrice: basePrice * (1 + (Math.random() - 0.5) * 0.002),
      volume: Array.from({length: 20}, () => Math.random() * 1000 + 500),
      atr: basePrice * 0.001,
      rsi: 30 + Math.random() * 40,
      session: this.getCurrentSession(),
      newsEvents: []
    };
  }

  private runConfluenceAnalysis(data: MarketAnalysisData) {
    const passedFilters: ConfluenceFilter[] = [];
    const failedFilters: ConfluenceFilter[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const filter of this.confluenceFilters) {
      maxScore += filter.weight;
      
      if (filter.check(data)) {
        passedFilters.push(filter);
        totalScore += filter.weight;
        console.log(`✅ ${filter.name}: ${filter.reason}`);
      } else {
        failedFilters.push(filter);
        console.log(`❌ ${filter.name}: Not detected`);
      }
    }

    return {
      passedFilters,
      failedFilters,
      score: totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100)
    };
  }

  private checkSMCStructure(data: MarketAnalysisData): boolean {
    const h1Candles = data.timeframes.h1.slice(-10);
    const m15Candles = data.timeframes.m15.slice(-20);
    
    // Check for break of structure
    const recentHighs = h1Candles.map(c => c.high);
    const recentLows = h1Candles.map(c => c.low);
    
    const currentHigh = Math.max(...recentHighs.slice(-3));
    const previousHigh = Math.max(...recentHighs.slice(-6, -3));
    
    const currentLow = Math.min(...recentLows.slice(-3));
    const previousLow = Math.min(...recentLows.slice(-6, -3));
    
    // Bullish BOS: Higher High
    const bullishBOS = currentHigh > previousHigh * 1.001;
    // Bearish BOS: Lower Low
    const bearishBOS = currentLow < previousLow * 0.999;
    
    // Check for order block on M15
    const hasOrderBlock = this.detectOrderBlock(m15Candles);
    
    return (bullishBOS || bearishBOS) && hasOrderBlock;
  }

  private checkLiquiditySweep(data: MarketAnalysisData): boolean {
    const candles = data.timeframes.m15.slice(-15);
    const lastCandle = candles[candles.length - 1];
    
    // Look for wicks that sweep previous levels
    const prevHighs = candles.slice(0, -1).map(c => c.high);
    const prevLows = candles.slice(0, -1).map(c => c.low);
    
    const maxPrevHigh = Math.max(...prevHighs);
    const minPrevLow = Math.min(...prevLows);
    
    // Sweep up then rejection
    const sweepHigh = lastCandle.high > maxPrevHigh && lastCandle.close < maxPrevHigh * 0.999;
    // Sweep down then rejection
    const sweepLow = lastCandle.low < minPrevLow && lastCandle.close > minPrevLow * 1.001;
    
    return sweepHigh || sweepLow;
  }

  private checkFairValueGap(data: MarketAnalysisData): boolean {
    const candles = data.timeframes.m15.slice(-10);
    
    for (let i = 1; i < candles.length - 1; i++) {
      const prev = candles[i - 1];
      const curr = candles[i];
      const next = candles[i + 1];
      
      // Bullish FVG: Gap between previous high and next low
      const bullishGap = prev.high < next.low;
      // Bearish FVG: Gap between previous low and next high
      const bearishGap = prev.low > next.high;
      
      if (bullishGap || bearishGap) {
        // Check if current price is near the gap
        const gapMid = bullishGap ? 
          (prev.high + next.low) / 2 : 
          (prev.low + next.high) / 2;
        
        const tolerance = data.atr * 0.5;
        if (Math.abs(data.currentPrice - gapMid) < tolerance) {
          return true;
        }
      }
    }
    
    return false;
  }

  private checkSessionFilter(data: MarketAnalysisData): boolean {
    return data.session === 'london' || data.session === 'ny';
  }

  private checkVolumeSpike(data: MarketAnalysisData): boolean {
    const avgVolume = data.volume.slice(0, -3).reduce((a, b) => a + b) / (data.volume.length - 3);
    const recentVolume = data.volume.slice(-3).reduce((a, b) => a + b) / 3;
    
    return recentVolume > avgVolume * 1.5;
  }

  private checkRSIDivergence(data: MarketAnalysisData): boolean {
    // Simplified RSI divergence check
    return data.rsi < 30 || data.rsi > 70;
  }

  private detectOrderBlock(candles: CandleData[]): boolean {
    for (const candle of candles.slice(-5)) {
      const bodySize = Math.abs(candle.close - candle.open);
      const totalSize = candle.high - candle.low;
      
      // Strong body relative to total range (> 70%)
      if (bodySize / totalSize > 0.7) {
        return true;
      }
    }
    return false;
  }

  private checkTimeframeAgreement(data: MarketAnalysisData) {
    const h1Trend = this.getTrend(data.timeframes.h1.slice(-5));
    const m15Structure = this.getStructure(data.timeframes.m15.slice(-10));
    const m5Entry = this.getEntrySignal(data.timeframes.m5.slice(-15));
    
    const agreement = h1Trend !== 'neutral' && 
                     m15Structure === h1Trend && 
                     m5Entry === h1Trend;
    
    return {
      agreement,
      h1Trend,
      m15Structure,
      m5Entry,
      direction: agreement ? h1Trend : 'conflicted'
    };
  }

  private getTrend(candles: CandleData[]): 'bullish' | 'bearish' | 'neutral' {
    const closes = candles.map(c => c.close);
    const firstHalf = closes.slice(0, Math.floor(closes.length / 2));
    const secondHalf = closes.slice(Math.floor(closes.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.001) return 'bullish';
    if (change < -0.001) return 'bearish';
    return 'neutral';
  }

  private getStructure(candles: CandleData[]): 'bullish' | 'bearish' | 'neutral' {
    return this.getTrend(candles);
  }

  private getEntrySignal(candles: CandleData[]): 'bullish' | 'bearish' | 'neutral' {
    return this.getTrend(candles);
  }

  private async generateSignal(
    data: MarketAnalysisData, 
    confluence: any, 
    timeframe: any
  ): Promise<EnhancedSignal> {
    const direction = timeframe.direction === 'bullish' ? 'BUY' : 'SELL';
    const entry = data.currentPrice;
    
    // Calculate SL and TP based on ATR and confluence strength
    const atrMultiplier = confluence.percentage > 80 ? 1.5 : 2.0;
    const slDistance = data.atr * atrMultiplier;
    const tpDistance = slDistance * (2 + confluence.percentage / 100);
    
    const stopLoss = direction === 'BUY' ? entry - slDistance : entry + slDistance;
    const takeProfit = direction === 'BUY' ? entry + tpDistance : entry - tpDistance;
    
    return {
      id: `signal_${Date.now()}`,
      pair: data.pair,
      type: direction,
      entry: this.formatPrice(entry, data.pair),
      stopLoss: this.formatPrice(stopLoss, data.pair),
      takeProfit: this.formatPrice(takeProfit, data.pair),
      confidence: Math.min(confluence.percentage + 10, 95),
      confluenceScore: confluence.passedFilters.length,
      maxConfluence: confluence.failedFilters.length + confluence.passedFilters.length,
      reasons: confluence.passedFilters.map((f: ConfluenceFilter) => f.name),
      timeValidity: this.calculateTimeValidity(data.session),
      riskReward: Number((tpDistance / slDistance).toFixed(1)),
      historicalWinRate: 0, // Will be filled by historical analysis
      similarSetups: 0, // Will be filled by historical analysis
      status: 'active',
      timestamp: new Date().toISOString(),
      tags: this.generateTags(confluence, timeframe)
    };
  }

  private async analyzeHistoricalPerformance(signal: EnhancedSignal) {
    // Simulate historical analysis of similar setups
    const baseWinRate = 60 + (signal.confluenceScore * 5);
    const adjustment = Math.random() * 20 - 10;
    
    return {
      winRate: Math.max(50, Math.min(90, baseWinRate + adjustment)),
      totalSetups: 150 + Math.floor(Math.random() * 100),
      avgRR: signal.riskReward * (0.8 + Math.random() * 0.4)
    };
  }

  private hasHighImpactNews(data: MarketAnalysisData): boolean {
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    
    return data.newsEvents.some(event => 
      event.impact === 'high' && 
      Math.abs(event.time - now) < fifteenMinutes &&
      event.currency === data.pair.substring(0, 3) || 
      event.currency === data.pair.substring(3, 6)
    );
  }

  private isMarketTooVolatile(data: MarketAnalysisData): boolean {
    // Check if ATR is too high compared to normal
    const normalATR = this.getBasePriceMovement(data.pair);
    return data.atr > normalATR * 2;
  }

  private getCurrentSession(): 'london' | 'ny' | 'asia' | 'sydney' {
    const hour = new Date().getUTCHours();
    
    if (hour >= 8 && hour < 17) return 'london';
    if (hour >= 13 && hour < 22) return 'ny';
    if (hour >= 21 || hour < 6) return 'asia';
    return 'sydney';
  }

  private calculateTimeValidity(session: string): string {
    const sessionEnd = {
      'london': '17:00 UTC',
      'ny': '22:00 UTC',
      'asia': '06:00 UTC',
      'sydney': '08:00 UTC'
    };
    
    return `Valid until ${sessionEnd[session as keyof typeof sessionEnd]}`;
  }

  private generateTags(confluence: any, timeframe: any): string[] {
    const tags = ['Enhanced AI'];
    
    if (confluence.percentage > 80) tags.push('High Confluence');
    if (timeframe.agreement) tags.push('MTF Aligned');
    if (confluence.passedFilters.some((f: ConfluenceFilter) => f.name === 'SMC Structure')) {
      tags.push('Smart Money');
    }
    
    return tags;
  }

  private generateCandles(basePrice: number, count: number, interval: number): CandleData[] {
    const candles: CandleData[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.5) * 0.002;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;
      
      candles.push({
        open,
        high,
        low,
        close,
        time: Date.now() - (count - i) * interval * 1000
      });
      
      currentPrice = close;
    }
    
    return candles;
  }

  private getBasePrice(pair: string): number {
    const prices: { [key: string]: number } = {
      'EURUSD': 1.0421,
      'GBPUSD': 1.2556,
      'USDJPY': 156.25,
      'AUDUSD': 0.6234,
      'USDCAD': 1.4287
    };
    return prices[pair] || 1.0000;
  }

  private getBasePriceMovement(pair: string): number {
    const movements: { [key: string]: number } = {
      'EURUSD': 0.0008,
      'GBPUSD': 0.0012,
      'USDJPY': 0.15,
      'AUDUSD': 0.0010,
      'USDCAD': 0.0009
    };
    return movements[pair] || 0.0010;
  }

  private formatPrice(price: number, pair: string): number {
    if (pair.includes('JPY')) {
      return Math.round(price * 1000) / 1000;
    } else {
      return Math.round(price * 100000) / 100000;
    }
  }
}

export const enhancedSignalAnalyzer = new EnhancedSignalAnalyzer();
export type { EnhancedSignal, ConfluenceFilter, MarketAnalysisData };
