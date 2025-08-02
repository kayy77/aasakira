import { Signal } from '@/types/signalConfig';

interface EnhancedSignalConfig {
  pair: string;
  timeframe: string;
  minConfidence: number;
  strategyType: 'Smart_Money' | 'Breakout+Retest' | 'Trend_Continuation' | 'Multi_Confluence';
  riskLevel: 'Low' | 'Medium' | 'High';
  marketConditions: string[];
  technicalIndicators: string[];
  riskParameters: {
    maxRisk: number;
    riskRewardRatio: number;
  };
}

class EnhancedSignalService {
  private activeConfigs: Map<string, EnhancedSignalConfig> = new Map();

  async generateSignalWithConfig(config: EnhancedSignalConfig): Promise<Signal | null> {
    try {
      const basePrice = this.getBasePrice(config.pair);
      const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const entry = basePrice + (Math.random() - 0.5) * 0.001;
      
      const stopDistance = config.pair.includes('JPY') ? 0.20 : 0.0020;
      const targetDistance = config.pair.includes('JPY') ? 0.40 : 0.0040;
      
      const stopLoss = type === 'BUY' ? entry - stopDistance : entry + stopDistance;
      const takeProfit = type === 'BUY' ? entry + targetDistance : entry - targetDistance;

      const signal: Signal = {
        id: Date.now().toString(),
        pair: config.pair,
        type,
        entry,
        entryPrice: entry,
        stopLoss,
        takeProfit,
        confidence: config.minConfidence + Math.random() * (95 - config.minConfidence),
        analysis: `Enhanced ${config.strategyType} signal with ${config.riskLevel} risk profile`,
        timestamp: new Date().toISOString(),
        timeframe: config.timeframe,
        riskReward: Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss),
        strategy: config.strategyType, // Now properly typed
        marketCondition: config.marketConditions[0] || 'Active',
        technicalSetup: config.technicalIndicators.join(' + '),
        risk: config.riskLevel
      };

      return signal;
    } catch (error) {
      console.error('Enhanced signal generation error:', error);
      return null;
    }
  }

  saveConfig(name: string, config: EnhancedSignalConfig): void {
    this.activeConfigs.set(name, config);
  }

  getConfig(name: string): EnhancedSignalConfig | undefined {
    return this.activeConfigs.get(name);
  }

  private getBasePrice(pair: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0842,
      'GBPUSD': 1.2731,
      'USDJPY': 153.45,
      'AUDUSD': 0.6720,
      'USDCAD': 1.3621
    };
    return basePrices[pair] || 1.0000;
  }
}

export const enhancedSignalService = new EnhancedSignalService();
export type { EnhancedSignalConfig };
