
interface SignalRecord {
  pair: string;
  direction: 'BUY' | 'SELL';
  timeframe: string;
  timestamp: number;
  confidence: number;
}

class SignalDeduplicationService {
  private recentSignals: SignalRecord[] = [];
  private readonly DUPLICATE_WINDOW = 300000; // 5 minutes
  private readonly CONFLICT_WINDOW = 900000; // 15 minutes
  
  canGenerateSignal(pair: string, direction: 'BUY' | 'SELL', timeframe: string): {
    allowed: boolean;
    reason?: string;
  } {
    const now = Date.now();
    
    // Clean old signals
    this.recentSignals = this.recentSignals.filter(
      signal => now - signal.timestamp < this.CONFLICT_WINDOW
    );
    
    // Check for exact duplicates
    const duplicate = this.recentSignals.find(signal => 
      signal.pair === pair && 
      signal.direction === direction && 
      signal.timeframe === timeframe &&
      now - signal.timestamp < this.DUPLICATE_WINDOW
    );
    
    if (duplicate) {
      return {
        allowed: false,
        reason: `Duplicate signal: ${pair} ${direction} generated ${Math.floor((now - duplicate.timestamp) / 1000)}s ago`
      };
    }
    
    // Check for conflicting signals (opposite direction)
    const conflict = this.recentSignals.find(signal => 
      signal.pair === pair && 
      signal.direction !== direction &&
      now - signal.timestamp < this.CONFLICT_WINDOW
    );
    
    if (conflict) {
      return {
        allowed: false,
        reason: `Conflicting signal: ${pair} ${conflict.direction} exists from ${Math.floor((now - conflict.timestamp) / 1000)}s ago`
      };
    }
    
    return { allowed: true };
  }
  
  recordSignal(pair: string, direction: 'BUY' | 'SELL', timeframe: string, confidence: number): void {
    this.recentSignals.push({
      pair,
      direction,
      timeframe,
      timestamp: Date.now(),
      confidence
    });
    
    console.log(`📝 Signal recorded: ${pair} ${direction} (${confidence}%)`);
  }
  
  getRecentSignals(pair?: string): SignalRecord[] {
    const now = Date.now();
    let signals = this.recentSignals.filter(
      signal => now - signal.timestamp < this.CONFLICT_WINDOW
    );
    
    if (pair) {
      signals = signals.filter(signal => signal.pair === pair);
    }
    
    return signals;
  }
  
  clearSignals(): void {
    this.recentSignals = [];
  }
}

export const signalDeduplicationService = new SignalDeduplicationService();
