
import type { BaseSignalData } from '@/components/signals/SignalCardBase';

export interface ContradictionInfo {
  signalId: string;
  contradictsWith: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

class SignalContradictionService {
  detectContradictions(signals: BaseSignalData[]): ContradictionInfo[] {
    const contradictions: ContradictionInfo[] = [];
    
    // Group signals by pair
    const signalsByPair = signals.reduce((acc, signal) => {
      if (!acc[signal.pair]) {
        acc[signal.pair] = [];
      }
      acc[signal.pair].push(signal);
      return acc;
    }, {} as Record<string, BaseSignalData[]>);

    // Check for contradictions within each pair
    Object.entries(signalsByPair).forEach(([pair, pairSignals]) => {
      if (pairSignals.length < 2) return;

      for (let i = 0; i < pairSignals.length; i++) {
        for (let j = i + 1; j < pairSignals.length; j++) {
          const signal1 = pairSignals[i];
          const signal2 = pairSignals[j];

          // Check for direction contradiction
          if (signal1.direction !== signal2.direction) {
            const contradiction = this.analyzeContradiction(signal1, signal2);
            if (contradiction) {
              contradictions.push(contradiction);
            }
          }
        }
      }
    });

    return contradictions;
  }

  private analyzeContradiction(signal1: BaseSignalData, signal2: BaseSignalData): ContradictionInfo | null {
    // Determine contradiction severity and reason
    let reason = '';
    let severity: 'low' | 'medium' | 'high' = 'medium';

    if (signal1.type !== signal2.type) {
      // Different signal types
      if ((signal1.type === 'institutional' && signal2.type === 'smc') || 
          (signal1.type === 'smc' && signal2.type === 'institutional')) {
        reason = 'Institutional vs Smart Money Concepts: Different analysis methodologies';
        severity = 'low'; // This is expected and acceptable
      } else {
        reason = 'Different signal generation strategies';
        severity = 'medium';
      }
    } else {
      // Same signal type but different directions
      reason = 'Same strategy producing opposite signals - potential market uncertainty';
      severity = 'high';
    }

    // Check timeframe differences
    if (signal1.timeframe && signal2.timeframe && signal1.timeframe !== signal2.timeframe) {
      reason += ` (${signal1.timeframe} vs ${signal2.timeframe} timeframes)`;
      severity = 'low'; // Timeframe differences are common
    }

    return {
      signalId: signal1.id,
      contradictsWith: signal2.id,
      reason,
      severity
    };
  }

  markSignalsWithContradictions(signals: BaseSignalData[]): BaseSignalData[] {
    const contradictions = this.detectContradictions(signals);
    
    return signals.map(signal => {
      const hasContradiction = contradictions.some(c => 
        c.signalId === signal.id || c.contradictsWith === signal.id
      );
      
      const contradictionWith = contradictions.find(c => 
        c.signalId === signal.id || c.contradictsWith === signal.id
      );

      return {
        ...signal,
        hasContradiction,
        contradictionWith: contradictionWith ? contradictionWith.reason : undefined
      };
    });
  }
}

export const signalContradictionService = new SignalContradictionService();
