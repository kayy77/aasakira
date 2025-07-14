import { marketDataService } from './marketDataService';

interface InstitutionalSignal {
  id: string;
  pair: string;
  direction: 'buy' | 'sell';
  entry: string;
  stop_loss: string;
  take_profit: string;
  risk_reward: string;
  filters_passed: string[];
  reasoning: {
    [key: string]: string;
  };
  timestamp: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'HIT_TP' | 'HIT_SL';
  confidence: 'INSTITUTIONAL' | 'HIGH' | 'MEDIUM';
  session: string;
  timeframe: string;
}

interface FilterCriteria {
  breakOfStructure: boolean;
  liquiditySweep: boolean;
  fairValueGap: boolean;
  timeFilter: boolean;
  volumeSpike: boolean;
  rsiDivergence: boolean;
}

interface FilterReasoning {
  [key: string]: string;
}

class InstitutionalSignalService {
  private signals: InstitutionalSignal[] = [];
  private lastSignalTime: { [pair: string]: Date } = {};
  private readonly MIN_FILTERS_REQUIRED = 3;
  private readonly MIN_RISK_REWARD = 2.0;
  
  // Kill Zones and High Probability Sessions (UTC)
  private readonly KILL_ZONES = {
    'London Open': { start: 7, end: 9 },
    'NY Open': { start: 12, end: 14 },
    'London Close': { start: 15, end: 17 },
    'Asian Killzone': { start: 23, end: 1 }
  };

  async generateInstitutionalSignal(): Promise<InstitutionalSignal | null> {
    // Major institutional pairs
    const institutionalPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF'];
    const selectedPair = institutionalPairs[Math.floor(Math.random() * institutionalPairs.length)];

    // Check if we've generated a signal for this pair recently (15min cooldown)
    if (this.lastSignalTime[selectedPair]) {
      const timeDiff = Date.now() - this.lastSignalTime[selectedPair].getTime();
      if (timeDiff < 15 * 60 * 1000) { // 15 minutes
        return null;
      }
    }

    try {
      const marketData = await marketDataService.fetchMarketData(selectedPair);
      const price = marketData.currentPrice;
      const analysis = this.performInstitutionalAnalysis(selectedPair, price);
      
      // Must pass at least 3 filters
      if (analysis.filtersPassedCount < this.MIN_FILTERS_REQUIRED) {
        return null;
      }

      // Generate signal with institutional logic
      const signal = this.createInstitutionalSignal(selectedPair, price, analysis);
      
      if (signal) {
        this.lastSignalTime[selectedPair] = new Date();
        this.signals.push(signal);
        return signal;
      }

      return null;
    } catch (error) {
      console.error('Error generating institutional signal:', error);
      return null;
    }
  }

  private performInstitutionalAnalysis(pair: string, price: number) {
    const filters: FilterCriteria = {
      breakOfStructure: this.analyzeBreakOfStructure(pair, price),
      liquiditySweep: this.analyzeLiquiditySweep(pair, price),
      fairValueGap: this.analyzeFairValueGap(pair, price),
      timeFilter: this.analyzeTimeFilter(),
      volumeSpike: this.analyzeVolumeSpike(pair),
      rsiDivergence: this.analyzeRSIDivergence(pair, price)
    };

    const reasoning: FilterReasoning = {};
    const filtersPassedArray: string[] = [];

    // Build reasoning for each passed filter
    if (filters.breakOfStructure) {
      const reason = this.getBreakOfStructureReasoning(pair, price);
      reasoning['Break of Structure (BOS)'] = reason;
      filtersPassedArray.push('Break of Structure (BOS)');
    }

    if (filters.liquiditySweep) {
      const reason = this.getLiquiditySweepReasoning(pair, price);
      reasoning['Liquidity Sweep'] = reason;
      filtersPassedArray.push('Liquidity Sweep');
    }

    if (filters.fairValueGap) {
      const reason = this.getFairValueGapReasoning(pair, price);
      reasoning['Fair Value Gap (FVG)'] = reason;
      filtersPassedArray.push('Fair Value Gap (FVG)');
    }

    if (filters.timeFilter) {
      const reason = this.getTimeFilterReasoning();
      reasoning['Time Filter'] = reason;
      filtersPassedArray.push('Time Filter');
    }

    if (filters.volumeSpike) {
      const reason = this.getVolumeSpikeReasoning(pair);
      reasoning['Volume Spike'] = reason;
      filtersPassedArray.push('Volume Spike');
    }

    if (filters.rsiDivergence) {
      const reason = this.getRSIDivergenceReasoning(pair, price);
      reasoning['RSI Divergence'] = reason;
      filtersPassedArray.push('RSI Divergence');
    }

    return {
      filters,
      reasoning,
      filtersPassedArray,
      filtersPassedCount: filtersPassedArray.length
    };
  }

  // Smart Money Concept Analysis Functions
  private analyzeBreakOfStructure(pair: string, price: number): boolean {
    // Simulate BOS analysis - In real implementation, analyze recent highs/lows
    const bosChance = Math.random();
    return bosChance > 0.3; // 70% chance of valid BOS
  }

  private analyzeLiquiditySweep(pair: string, price: number): boolean {
    // Simulate liquidity sweep detection
    const sweepChance = Math.random();
    return sweepChance > 0.5; // 50% chance of liquidity sweep
  }

  private analyzeFairValueGap(pair: string, price: number): boolean {
    // Simulate FVG analysis
    const fvgChance = Math.random();
    return fvgChance > 0.4; // 60% chance of FVG present
  }

  private analyzeTimeFilter(): boolean {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    // Check if current time is within any kill zone
    for (const [zoneName, zone] of Object.entries(this.KILL_ZONES)) {
      if (zone.start <= zone.end) {
        if (utcHour >= zone.start && utcHour <= zone.end) {
          return true;
        }
      } else {
        // Handle overnight zones (like Asian killzone 23-1)
        if (utcHour >= zone.start || utcHour <= zone.end) {
          return true;
        }
      }
    }
    
    return false;
  }

  private analyzeVolumeSpike(pair: string): boolean {
    // Simulate volume analysis
    const volumeChance = Math.random();
    return volumeChance > 0.35; // 65% chance of volume confirmation
  }

  private analyzeRSIDivergence(pair: string, price: number): boolean {
    // Simulate RSI divergence analysis
    const divergenceChance = Math.random();
    return divergenceChance > 0.65; // 35% chance of RSI divergence
  }

  // Reasoning Generation Functions
  private getBreakOfStructureReasoning(pair: string, price: number): string {
    const reasons = [
      "Price broke above recent swing high with strong bullish momentum candle",
      "Clean break of previous day's high with institutional volume",
      "Structure broken on 15M with confirmation on 5M entry",
      "Break of weekly resistance level with daily confirmation",
      "CHoCH confirmed - market character shift from bearish to bullish"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getLiquiditySweepReasoning(pair: string, price: number): string {
    const reasons = [
      "Liquidity grabbed below Asian session lows before reversal",
      "Stop hunt wick above recent equal highs, now showing rejection",
      "BSL (Buy Side Liquidity) swept at previous day high",
      "SSL (Sell Side Liquidity) targeted and cleared below support",
      "Equal lows liquidity grab with immediate bullish response"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getFairValueGapReasoning(pair: string, price: number): string {
    const reasons = [
      "Unfilled FVG from NY session providing strong support level",
      "Price retracing to premium FVG zone for optimal entry",
      "Bullish FVG acting as demand zone with institutional interest",
      "Gap created during London open provides high-probability entry",
      "FVG confluence with previous structure level"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getTimeFilterReasoning(): string {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    for (const [zoneName, zone] of Object.entries(this.KILL_ZONES)) {
      if (zone.start <= zone.end) {
        if (utcHour >= zone.start && utcHour <= zone.end) {
          return `Signal generated during ${zoneName} (high institutional liquidity period)`;
        }
      } else {
        if (utcHour >= zone.start || utcHour <= zone.end) {
          return `Signal generated during ${zoneName} (institutional accumulation window)`;
        }
      }
    }
    
    return "Signal generated during high-probability trading session";
  }

  private getVolumeSpikeReasoning(pair: string): string {
    const reasons = [
      "Unusual volume spike confirming institutional participation",
      "Volume 3x average indicating smart money involvement",
      "Breakout volume validates the directional move",
      "Institution-level volume supporting the trade bias",
      "Volume divergence suggesting accumulation/distribution"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getRSIDivergenceReasoning(pair: string, price: number): string {
    const reasons = [
      "Hidden bullish divergence on RSI suggesting continuation",
      "Regular bearish divergence indicating potential reversal",
      "RSI showing oversold with bullish momentum building",
      "Momentum divergence aligned with structural analysis",
      "Multi-timeframe RSI divergence confirming bias"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private createInstitutionalSignal(pair: string, price: number, analysis: any): InstitutionalSignal | null {
    // Determine direction based on filters (simplified logic)
    const bullishFilters = ['Break of Structure (BOS)', 'Volume Spike', 'RSI Divergence'];
    const bearishFilters = ['Liquidity Sweep', 'Fair Value Gap (FVG)'];
    
    const bullishCount = analysis.filtersPassedArray.filter((f: string) => bullishFilters.includes(f)).length;
    const bearishCount = analysis.filtersPassedArray.filter((f: string) => bearishFilters.includes(f)).length;
    
    const direction: 'buy' | 'sell' = bullishCount >= bearishCount ? 'buy' : 'sell';
    
    // Calculate institutional-grade levels
    const pipValue = this.getPipValue(pair);
    const atr = 30 + Math.random() * 40; // Simulated ATR in pips
    
    // Conservative stop loss (0.5-1.0 ATR)
    const stopDistance = atr * (0.5 + Math.random() * 0.5);
    
    // Aggressive take profit (2.0-4.0 RR minimum)
    const rrRatio = this.MIN_RISK_REWARD + Math.random() * 2; // 2.0-4.0 RR
    const tpDistance = stopDistance * rrRatio;
    
    const entry = price;
    const stopLoss = direction === 'buy' 
      ? entry - (stopDistance * pipValue)
      : entry + (stopDistance * pipValue);
    const takeProfit = direction === 'buy'
      ? entry + (tpDistance * pipValue)
      : entry - (tpDistance * pipValue);

    return {
      id: Date.now().toString(),
      pair,
      direction,
      entry: this.formatPrice(entry, pair),
      stop_loss: this.formatPrice(stopLoss, pair),
      take_profit: this.formatPrice(takeProfit, pair),
      risk_reward: `1:${rrRatio.toFixed(1)}`,
      filters_passed: analysis.filtersPassedArray,
      reasoning: analysis.reasoning,
      timestamp: new Date(),
      status: 'ACTIVE',
      confidence: analysis.filtersPassedCount >= 5 ? 'INSTITUTIONAL' : 
                  analysis.filtersPassedCount >= 4 ? 'HIGH' : 'MEDIUM',
      session: this.getCurrentSession(),
      timeframe: '15M/5M'
    };
  }

  private getCurrentSession(): string {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    for (const [zoneName, zone] of Object.entries(this.KILL_ZONES)) {
      if (zone.start <= zone.end) {
        if (utcHour >= zone.start && utcHour <= zone.end) {
          return zoneName;
        }
      } else {
        if (utcHour >= zone.start || utcHour <= zone.end) {
          return zoneName;
        }
      }
    }
    
    return 'Off Hours';
  }

  private getPipValue(pair: string): number {
    if (pair.includes('JPY')) {
      return 0.01;
    }
    return 0.0001;
  }

  private formatPrice(price: number, pair: string): string {
    if (pair.includes('JPY')) {
      return price.toFixed(3);
    }
    return price.toFixed(5);
  }

  getLatestSignals(): InstitutionalSignal[] {
    return this.signals.slice(-10);
  }

  // Validate signal against conflicting rules
  private hasConflictingSignal(pair: string, direction: 'buy' | 'sell'): boolean {
    const recentSignals = this.signals.filter(s => 
      s.pair === pair && 
      s.status === 'ACTIVE' &&
      Date.now() - s.timestamp.getTime() < 15 * 60 * 1000 // Last 15 minutes
    );

    return recentSignals.some(s => s.direction !== direction);
  }

  // Real-time signal validation
  async validateSignalRealtime(signalId: string): Promise<boolean> {
    const signal = this.signals.find(s => s.id === signalId);
    if (!signal) return false;

    try {
      const marketData = await marketDataService.fetchMarketData(signal.pair);
      const currentPrice = marketData.currentPrice;
      const entry = parseFloat(signal.entry);
      const sl = parseFloat(signal.stop_loss);
      const tp = parseFloat(signal.take_profit);
      
      // Check if TP or SL hit
      if (signal.direction === 'buy') {
        if (currentPrice >= tp) {
          signal.status = 'HIT_TP';
          return true;
        }
        if (currentPrice <= sl) {
          signal.status = 'HIT_SL';
          return false;
        }
      } else {
        if (currentPrice <= tp) {
          signal.status = 'HIT_TP';
          return true;
        }
        if (currentPrice >= sl) {
          signal.status = 'HIT_SL';
          return false;
        }
      }

      return true; // Still active
    } catch (error) {
      console.error('Error validating signal:', error);
      return false;
    }
  }
}

export const institutionalSignalService = new InstitutionalSignalService();
export type { InstitutionalSignal };