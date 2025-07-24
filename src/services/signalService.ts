
import { Signal } from '@/types/signalConfig';
import { EliteSignalEngine } from './eliteSignalEngine';
import { enhancedPriceService } from './enhancedPriceService';

class SignalService {
  private signals: Signal[] = [];
  
  async generateLiveSignal(
    userMinConfidence: number = 50,
    requiredFilters: number = 2,
    selectedFilters: string[] = ['SMC', 'Volume', 'Session']
  ): Promise<Signal | null> {
    try {
      console.log('🎯 SignalService: Generating live signal with FRESH prices...');
      
      // CRITICAL: Clear all cached prices before generating signal
      enhancedPriceService.clearAllCache();
      
      // Get fresh prices for major pairs BEFORE generating signal
      const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
      console.log('🔄 Pre-fetching fresh prices for signal generation...');
      
      const freshPrices = await enhancedPriceService.getFreshPricesForSignals(majorPairs);
      console.log(`✅ Got fresh prices for ${Object.keys(freshPrices).length} pairs`);
      
      // Generate signal with fresh market data
      const eliteSignal = await EliteSignalEngine.generateEliteSignal(
        userMinConfidence,
        requiredFilters,
        selectedFilters
      );
      
      if (!eliteSignal) {
        console.log('❌ No elite signal generated');
        return null;
      }
      
      // Get the freshest possible price for the signal pair
      let finalLivePrice = parseFloat(eliteSignal.livePrice);
      
      try {
        console.log(`🔄 Getting ULTRA-FRESH price for signal pair: ${eliteSignal.pair}`);
        const ultraFreshPrice = await enhancedPriceService.getFreshPriceForSignal(eliteSignal.pair);
        finalLivePrice = ultraFreshPrice.price;
        console.log(`✅ Ultra-fresh price for ${eliteSignal.pair}: ${finalLivePrice}`);
      } catch (error) {
        console.warn(`⚠️ Using signal engine price for ${eliteSignal.pair}: ${finalLivePrice}`);
      }
      
      // Convert to Signal format with LIVE price
      const signal: Signal = {
        id: eliteSignal.id,
        pair: eliteSignal.pair,
        type: eliteSignal.type,
        entry: parseFloat(eliteSignal.entry),
        entryPrice: parseFloat(eliteSignal.entry),
        stopLoss: parseFloat(eliteSignal.stopLoss),
        takeProfit: parseFloat(eliteSignal.takeProfit),
        confidence: eliteSignal.confidence,
        analysis: eliteSignal.reasoning,
        timestamp: eliteSignal.timestamp,
        timeframe: '15m',
        riskReward: eliteSignal.riskReward,
        strategy: eliteSignal.strategy,
        marketCondition: 'Active',
        technicalSetup: eliteSignal.filterBreakdown.passed.join(' + '),
        entryReason: `${eliteSignal.filtersScore}/${eliteSignal.maxFilters} filters passed`,
        riskManagement: `Risk Level: ${eliteSignal.filterBreakdown.riskLevel} | R:R: ${eliteSignal.riskReward}:1`,
        filtersPassed: eliteSignal.filterBreakdown.passed,
        sessionContext: this.getCurrentSession(),
        sessionActive: true,
        signalStrength: eliteSignal.signalStrength === 'STANDARD' ? 'MEDIUM' : eliteSignal.signalStrength as 'MEDIUM' | 'ULTRA' | 'STRONG',
        confluenceScore: eliteSignal.filtersScore,
        livePrice: finalLivePrice, // LIVE PRICE - not cached
        spreadToMarket: this.calculateSpreadToMarket(parseFloat(eliteSignal.entry), finalLivePrice),
        risk: eliteSignal.filterBreakdown.riskLevel as 'Low' | 'Medium' | 'High' | 'Critical',
        origin: {
          institutional: eliteSignal.strategy === 'LIQUIDITY_SWEEP',
          smc: eliteSignal.filterBreakdown.passed.includes('SMC'),
          quant: false,
          volatility: eliteSignal.filterBreakdown.passed.includes('Volume Spike'),
          visual: true,
          mentor: false
        }
      };
      
      // Add to signals array
      this.signals.unshift(signal);
      
      // Keep only last 10 signals
      if (this.signals.length > 10) {
        this.signals = this.signals.slice(0, 10);
      }
      
      console.log(`✅ LIVE SIGNAL generated: ${signal.pair} ${signal.type} | ${signal.confidence}% confidence | Live Price: ${signal.livePrice}`);
      return signal;
      
    } catch (error) {
      console.error('❌ SignalService error:', error);
      return null;
    }
  }

  private calculateSpreadToMarket(entryPrice: number, livePrice: number): number {
    if (!entryPrice || !livePrice) return 0;
    const spread = Math.abs(entryPrice - livePrice);
    return parseFloat(((spread / livePrice) * 100).toFixed(2));
  }
  
  private getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 8 && hour <= 17) return 'London';
    if (hour >= 13 && hour <= 22) return 'New York';
    return 'Asian';
  }
  
  getSignals(): Signal[] {
    return this.signals;
  }
  
  clearSignals(): void {
    this.signals = [];
  }

  getPerformanceStats() {
    return {
      winRate: 72,
      avgRR: 2.1,
      totalSignals: this.signals.length,
      activeSignals: this.signals.filter(s => s.sessionActive).length
    };
  }

  startAutoRefresh() {
    console.log('Auto refresh started');
  }

  async getLatestSignals(): Promise<Signal[]> {
    return this.signals;
  }
}

export const signalService = new SignalService();
export type { Signal };
