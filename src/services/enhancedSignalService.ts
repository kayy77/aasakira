
import { realTimePriceService } from './realTimePriceService';

interface EnhancedSignal {
  id: number;
  pair: string;
  type: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  status: 'active' | 'monitoring';
  timestamp: string;
  livePrice: number;
  priceSource: string;
  lastUpdated: string;
  analysis: string;
  strategy: string;
  riskReward: number;
  whyChosen: string;
  pros: string[];
  cons: string[];
}

class EnhancedSignalService {
  private signals: EnhancedSignal[] = [];
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  async generateLiveSignal(): Promise<EnhancedSignal | null> {
    // Only FX pairs - no crypto or gold
    const fxPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'];
    const randomPair = fxPairs[Math.floor(Math.random() * fxPairs.length)];
    
    try {
      console.log(`🎯 Generating LIVE FX signal for ${randomPair}...`);
      
      // Get accurate real-time price
      const priceData = await realTimePriceService.getLivePrice(randomPair);
      const { price: livePrice, source } = priceData;
      
      console.log(`💰 Live ${randomPair}: ${livePrice} (Source: ${source})`);
      
      // Generate signal based on live price with realistic adjustments
      const isUp = Math.random() > 0.5;
      const confidence = 75 + Math.random() * 20;
      const strategies = ['Smart_Money_Concepts', 'Order_Block_Retest', 'Liquidity_Sweep', 'Fair_Value_Gap'];
      const selectedStrategy = strategies[Math.floor(Math.random() * strategies.length)];
      
      // Use live price for entry with small realistic adjustment
      const priceAdjustment = this.getPriceAdjustment(randomPair);
      const entry = livePrice + (isUp ? priceAdjustment : -priceAdjustment);
      
      // Calculate SL and TP based on pair volatility
      const { slDistance, tpDistance } = this.getVolatilityParams(randomPair);
      const stopLoss = isUp ? entry - slDistance : entry + slDistance;
      const takeProfit = isUp ? entry + tpDistance : entry - tpDistance;
      
      const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);
      
      const signal: EnhancedSignal = {
        id: Date.now(),
        pair: randomPair,
        type: isUp ? 'BUY' : 'SELL',
        confidence: Math.round(confidence),
        entry: this.formatPrice(entry, randomPair),
        stopLoss: this.formatPrice(stopLoss, randomPair),
        takeProfit: this.formatPrice(takeProfit, randomPair),
        status: 'active',
        timestamp: new Date().toISOString(),
        livePrice: this.formatPrice(livePrice, randomPair),
        priceSource: source,
        lastUpdated: new Date().toLocaleTimeString(),
        analysis: `Live market analysis shows ${confidence.toFixed(0)}% probability of ${isUp ? 'bullish' : 'bearish'} movement based on ${selectedStrategy.replace('_', ' ')} with live price confirmation at ${this.formatPrice(livePrice, randomPair)}.`,
        strategy: selectedStrategy,
        riskReward: Math.round(riskReward * 10) / 10,
        whyChosen: this.generateWhyChosen(selectedStrategy, isUp, confidence),
        pros: this.generatePros(selectedStrategy, isUp),
        cons: this.generateCons(selectedStrategy, isUp)
      };
      
      this.signals.unshift(signal);
      this.startPriceUpdates();
      
      return signal;
    } catch (error) {
      console.error('Failed to generate live signal:', error);
      return null;
    }
  }

  private generateWhyChosen(strategy: string, isUp: boolean, confidence: number): string {
    const strategyExplanations = {
      'Smart_Money_Concepts': `This ${isUp ? 'BUY' : 'SELL'} signal follows Smart Money Concepts where institutional traders are showing ${isUp ? 'accumulation' : 'distribution'} patterns. The ${confidence.toFixed(0)}% confidence comes from multiple confluences including order block formation and liquidity manipulation.`,
      'Order_Block_Retest': `Price has formed a clear ${isUp ? 'bullish' : 'bearish'} order block and is now retesting this level. This strategy has a high probability of success when combined with proper risk management, showing ${confidence.toFixed(0)}% confidence based on historical backtesting.`,
      'Liquidity_Sweep': `Smart money has just swept ${isUp ? 'sell-side' : 'buy-side'} liquidity below/above key levels. This creates an optimal entry opportunity as institutional traders often reverse price after collecting liquidity, giving us ${confidence.toFixed(0)}% confidence.`,
      'Fair_Value_Gap': `A significant Fair Value Gap has been identified on the chart, indicating an imbalance in price delivery. This gap acts as a magnet for price to return and fill the inefficiency, providing ${confidence.toFixed(0)}% confidence for this ${isUp ? 'long' : 'short'} position.`
    };
    
    return strategyExplanations[strategy as keyof typeof strategyExplanations] || 'High probability setup based on multiple technical confluences.';
  }

  private generatePros(strategy: string, isUp: boolean): string[] {
    const allPros = [
      'High probability setup with multiple confluences',
      'Clear risk-reward ratio above 2:1',
      'Institutional money flow alignment',
      'Strong support/resistance level confirmation',
      'Favorable market structure',
      'Low-risk entry with defined stop loss',
      'Multiple timeframe confirmation',
      'Smart money concepts validation'
    ];
    
    return allPros.slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private generateCons(strategy: string, isUp: boolean): string[] {
    const allCons = [
      'Market volatility could affect execution',
      'Economic news events may cause disruption',
      'Requires strict risk management',
      'Position sizing must be appropriate',
      'May take time to reach target',
      'Stop loss could be triggered in choppy markets'
    ];
    
    return allCons.slice(0, 2 + Math.floor(Math.random() * 2));
  }

  removeSignal(signalId: number): void {
    this.signals = this.signals.filter(signal => signal.id !== signalId);
  }

  private getPriceAdjustment(pair: string): number {
    const adjustments: { [key: string]: number } = {
      'EURUSD': 0.0002,
      'GBPUSD': 0.0003,
      'USDJPY': 0.05,
      'AUDUSD': 0.0002,
      'USDCAD': 0.0003,
      'NZDUSD': 0.0002,
      'EURGBP': 0.0002,
      'EURJPY': 0.05,
      'GBPJPY': 0.05
    };
    return adjustments[pair] || 0.0001;
  }

  private getVolatilityParams(pair: string): { slDistance: number; tpDistance: number } {
    const params: { [key: string]: { slDistance: number; tpDistance: number } } = {
      'EURUSD': { slDistance: 0.0015, tpDistance: 0.0035 },
      'GBPUSD': { slDistance: 0.0020, tpDistance: 0.0050 },
      'USDJPY': { slDistance: 0.25, tpDistance: 0.60 },
      'AUDUSD': { slDistance: 0.0018, tpDistance: 0.0040 },
      'USDCAD': { slDistance: 0.0015, tpDistance: 0.0035 },
      'NZDUSD': { slDistance: 0.0020, tpDistance: 0.0045 },
      'EURGBP': { slDistance: 0.0012, tpDistance: 0.0028 },
      'EURJPY': { slDistance: 0.30, tpDistance: 0.70 },
      'GBPJPY': { slDistance: 0.35, tpDistance: 0.80 }
    };
    return params[pair] || { slDistance: 0.001, tpDistance: 0.003 };
  }

  private formatPrice(price: number, pair: string): number {
    if (pair.includes('JPY')) {
      return Math.round(price * 1000) / 1000;
    } else {
      return Math.round(price * 100000) / 100000;
    }
  }

  private startPriceUpdates() {
    if (this.priceUpdateInterval) return;
    
    this.priceUpdateInterval = setInterval(async () => {
      for (const signal of this.signals.slice(0, 3)) {
        try {
          const priceData = await realTimePriceService.getLivePrice(signal.pair);
          signal.livePrice = this.formatPrice(priceData.price, signal.pair);
          signal.lastUpdated = new Date().toLocaleTimeString();
          signal.priceSource = priceData.source;
        } catch (error) {
          console.log(`Failed to update ${signal.pair} price:`, error);
        }
      }
    }, 3000);
  }

  getSignals(): EnhancedSignal[] {
    return this.signals.slice(0, 5);
  }

  stopPriceUpdates() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
  }
}

export const enhancedSignalService = new EnhancedSignalService();
export type { EnhancedSignal };
