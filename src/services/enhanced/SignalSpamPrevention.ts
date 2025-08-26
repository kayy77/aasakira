// Signal Spam Prevention - Stops repeated EURUSD signals at same price levels
// NO MORE STACKING 5 EURUSD BUYS AT 1.0850

export interface SignalHistory {
  pair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  timestamp: Date;
  wasExecuted: boolean;
  confidence: number;
}

export interface SpamCheckResult {
  allowed: boolean;
  reason: string;
  lastSimilarSignal?: SignalHistory;
  cooldownRemaining?: number; // minutes
  priceDistance?: number; // pips
}

export class SignalSpamPrevention {
  
  // Signal history for spam detection
  private static signalHistory: SignalHistory[] = [];
  
  // 🔑 SPAM PREVENTION RULES
  private static readonly SPAM_RULES = {
    minPriceDistance: 20, // Minimum 20 pips between signals on same pair
    cooldownMinutes: 30, // Minimum 30 minutes between signals on same pair+direction
    maxSignalsPerPairPerHour: 2, // Max 2 signals per pair per hour
    maxSignalsPerDayPerPair: 5, // Max 5 signals per pair per day
    recentWindowMinutes: 60 // Window for checking recent signals
  };
  
  // 🔑 MAIN FUNCTION - Check if signal should be allowed
  static checkSignalSpam(
    pair: string,
    direction: 'BUY' | 'SELL',
    entryPrice: number,
    confidence: number
  ): SpamCheckResult {
    
    console.log(`🚫 SPAM CHECK: ${pair} ${direction} at ${entryPrice}`);
    
    const now = new Date();
    
    // 1. CHECK FOR RECENT IDENTICAL SIGNALS
    const recentSimilar = this.findRecentSimilarSignals(pair, direction, entryPrice, now);
    if (recentSimilar.length > 0) {
      const lastSignal = recentSimilar[0];
      const minutesSince = (now.getTime() - lastSignal.timestamp.getTime()) / (1000 * 60);
      
      if (minutesSince < this.SPAM_RULES.cooldownMinutes) {
        return {
          allowed: false,
          reason: `🕒 Cooldown active: ${this.SPAM_RULES.cooldownMinutes - Math.floor(minutesSince)} min remaining`,
          lastSimilarSignal: lastSignal,
          cooldownRemaining: this.SPAM_RULES.cooldownMinutes - Math.floor(minutesSince)
        };
      }
    }
    
    // 2. CHECK PRICE DISTANCE FROM RECENT SIGNALS
    const recentSamePair = this.getRecentSignalsForPair(pair, now, this.SPAM_RULES.recentWindowMinutes);
    const tooClose = recentSamePair.find(signal => {
      const pipsDistance = this.calculatePipsDistance(pair, entryPrice, signal.entryPrice);
      return pipsDistance < this.SPAM_RULES.minPriceDistance;
    });
    
    if (tooClose) {
      const pipsDistance = this.calculatePipsDistance(pair, entryPrice, tooClose.entryPrice);
      return {
        allowed: false,
        reason: `📏 Too close to recent signal: ${pipsDistance.toFixed(1)} pips < ${this.SPAM_RULES.minPriceDistance} min`,
        lastSimilarSignal: tooClose,
        priceDistance: pipsDistance
      };
    }
    
    // 3. CHECK HOURLY SIGNAL LIMIT
    const hourlySignals = this.getRecentSignalsForPair(pair, now, 60);
    if (hourlySignals.length >= this.SPAM_RULES.maxSignalsPerPairPerHour) {
      return {
        allowed: false,
        reason: `⏰ Hourly limit reached: ${hourlySignals.length}/${this.SPAM_RULES.maxSignalsPerPairPerHour} signals for ${pair}`
      };
    }
    
    // 4. CHECK DAILY SIGNAL LIMIT
    const dailySignals = this.getRecentSignalsForPair(pair, now, 24 * 60);
    if (dailySignals.length >= this.SPAM_RULES.maxSignalsPerDayPerPair) {
      return {
        allowed: false,
        reason: `📅 Daily limit reached: ${dailySignals.length}/${this.SPAM_RULES.maxSignalsPerDayPerPair} signals for ${pair}`
      };
    }
    
    // 5. SPECIAL CASE: EURUSD PROTECTION (the main culprit)
    if (pair === 'EURUSD') {
      const recentEUR = recentSamePair.filter(s => s.direction === direction);
      if (recentEUR.length >= 2) {
        return {
          allowed: false,
          reason: `🇪🇺 EURUSD PROTECTION: Already ${recentEUR.length} ${direction} signals in last hour`
        };
      }
    }
    
    console.log(`✅ Signal spam check passed for ${pair} ${direction}`);
    
    return {
      allowed: true,
      reason: `✅ Signal approved: No spam violations detected`
    };
  }
  
  // 🔑 RECORD SIGNAL - Add to history for spam tracking
  static recordSignal(
    pair: string,
    direction: 'BUY' | 'SELL',
    entryPrice: number,
    confidence: number,
    wasExecuted: boolean = true
  ): void {
    
    const signal: SignalHistory = {
      pair,
      direction,
      entryPrice,
      timestamp: new Date(),
      wasExecuted,
      confidence
    };
    
    this.signalHistory.push(signal);
    
    // Keep only last 24 hours of history
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.signalHistory = this.signalHistory.filter(s => s.timestamp > cutoff);
    
    console.log(`📝 Signal recorded: ${pair} ${direction} @ ${entryPrice} (${this.signalHistory.length} total in history)`);
  }
  
  // Find recent similar signals (same pair, direction, similar price)
  private static findRecentSimilarSignals(
    pair: string,
    direction: 'BUY' | 'SELL',
    entryPrice: number,
    now: Date
  ): SignalHistory[] {
    const cutoff = new Date(now.getTime() - this.SPAM_RULES.cooldownMinutes * 60 * 1000);
    
    return this.signalHistory
      .filter(signal => 
        signal.pair === pair &&
        signal.direction === direction &&
        signal.timestamp > cutoff &&
        this.calculatePipsDistance(pair, entryPrice, signal.entryPrice) < this.SPAM_RULES.minPriceDistance * 1.5
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Get recent signals for a specific pair
  private static getRecentSignalsForPair(pair: string, now: Date, windowMinutes: number): SignalHistory[] {
    const cutoff = new Date(now.getTime() - windowMinutes * 60 * 1000);
    
    return this.signalHistory
      .filter(signal => signal.pair === pair && signal.timestamp > cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Calculate pips distance between two prices
  private static calculatePipsDistance(pair: string, price1: number, price2: number): number {
    const isJPY = pair.includes('JPY');
    const pipFactor = isJPY ? 100 : 10000;
    return Math.abs(price1 - price2) * pipFactor;
  }
  
  // 🔑 GET SPAM DASHBOARD - For monitoring
  static getSpamDashboard(): {
    totalSignalsToday: number;
    signalsByPair: { pair: string; count: number; lastSignal: Date }[];
    recentSpamBlocks: { pair: string; reason: string; timestamp: Date }[];
  } {
    const now = new Date();
    const today = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const todaySignals = this.signalHistory.filter(s => s.timestamp > today);
    
    // Group by pair
    const signalsByPair = new Map<string, SignalHistory[]>();
    todaySignals.forEach(signal => {
      const pairSignals = signalsByPair.get(signal.pair) || [];
      pairSignals.push(signal);
      signalsByPair.set(signal.pair, pairSignals);
    });
    
    const pairStats = Array.from(signalsByPair.entries()).map(([pair, signals]) => ({
      pair,
      count: signals.length,
      lastSignal: signals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
    }));
    
    return {
      totalSignalsToday: todaySignals.length,
      signalsByPair: pairStats,
      recentSpamBlocks: [] // Would track blocked signals if we stored them
    };
  }
  
  // Clear signal history (for testing)
  static clearHistory(): void {
    this.signalHistory = [];
    console.log(`🗑️ Signal history cleared`);
  }
  
  // Get signal history for debugging
  static getSignalHistory(): SignalHistory[] {
    return [...this.signalHistory];
  }
}
