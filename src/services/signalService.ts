import { Signal } from '@/types/signalConfig';
import { eliteSignalEngine } from './eliteSignalEngine';

class SignalService {
  private signals: Signal[] = [];
  
  async generateLiveSignal(
    userMinConfidence: number = 50,
    requiredFilters: number = 2,
    selectedFilters: string[] = ['SMC', 'Volume', 'Session']
  ): Promise<Signal | null> {
    try {
      console.log('🎯 SignalService: Generating live signal...');
      
      // Use the elite signal engine
      const eliteSignal = await eliteSignalEngine.generateEliteSignal(
        userMinConfidence,
        requiredFilters,
        selectedFilters
      );
      
      if (!eliteSignal) {
        console.log('❌ No elite signal generated');
        return null;
      }
      
      // Convert EliteSignal to Signal format
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
        signalStrength: eliteSignal.signalStrength,
        confluenceScore: eliteSignal.filtersScore,
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
      
      console.log(`✅ Signal generated: ${signal.pair} ${signal.type} | ${signal.confidence}% confidence`);
      return signal;
      
    } catch (error) {
      console.error('❌ SignalService error:', error);
      return null;
    }
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
}

export const signalService = new SignalService();
