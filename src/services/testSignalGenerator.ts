
import { Signal } from '@/types/signalConfig';

export class TestSignalGenerator {
  static generateTestSignal(): Signal {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const basePrice = this.getBasePrice(pair);
    const entry = basePrice + (Math.random() - 0.5) * 0.001;
    
    const stopDistance = pair.includes('JPY') ? 0.15 : 0.0015;
    const targetDistance = pair.includes('JPY') ? 0.30 : 0.0030;
    
    const stopLoss = type === 'BUY' ? entry - stopDistance : entry + stopDistance;
    const takeProfit = type === 'BUY' ? entry + targetDistance : entry - targetDistance;
    const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);
    
    return {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pair,
      type,
      entry,
      entryPrice: entry,
      stopLoss,
      takeProfit,
      confidence: 70 + Math.floor(Math.random() * 25), // 70-95%
      analysis: `🎯 TEST SIGNAL: AI-generated ${type} signal for ${pair} with ${Math.floor(Math.random() * 5) + 2} filters confirmed.`,
      timestamp: new Date().toISOString(),
      timeframe: '15m',
      riskReward: Math.round(riskReward * 10) / 10,
      strategy: 'TEST_STRATEGY',
      marketCondition: 'Active',
      technicalSetup: 'SMC + Volume + Session',
      entryReason: `${Math.floor(Math.random() * 3) + 3}/6 filters passed`,
      riskManagement: `Risk Level: Medium | R:R: ${Math.round(riskReward * 10) / 10}:1`,
      filtersPassed: ['SMC', 'Volume', 'Session'],
      sessionContext: this.getCurrentSession(),
      sessionActive: true,
      signalStrength: 'MEDIUM',
      confluenceScore: Math.floor(Math.random() * 3) + 3,
      livePrice: entry,
      spreadToMarket: 0,
      risk: 'Medium',
      origin: {
        institutional: true,
        smc: true,
        quant: false,
        volatility: true,
        visual: true,
        mentor: false
      }
    };
  }
  
  private static getBasePrice(pair: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0842,
      'GBPUSD': 1.2731,
      'USDJPY': 153.45,
      'AUDUSD': 0.6720,
      'USDCAD': 1.3621
    };
    return basePrices[pair] || 1.0000;
  }
  
  private static getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 8 && hour <= 17) return 'London';
    if (hour >= 13 && hour <= 22) return 'New York';
    return 'Asian';
  }
}
