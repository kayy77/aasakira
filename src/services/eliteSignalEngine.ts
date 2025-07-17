
import { institutionalSignalFilter, FilterResults } from './institutionalSignalFilter';

export interface EliteSignal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  signalStrength: 'ULTRA' | 'STRONG' | 'MEDIUM' | 'WEAK';
  filtersScore: number;
  maxFilters: number;
  timestamp: string;
  filterBreakdown: {
    passed: string[];
    failed: string[];
  };
  riskReward: number;
  lotSize: number;
  sessionInfo: string;
  strategy: string;
}

class EliteSignalEngine {
  async generateEliteSignal(livePrice: number, pair: string): Promise<EliteSignal | null> {
    console.log(`🎯 Running ELITE Signal Analysis for ${pair} @ ${livePrice}...`);
    
    // Run institutional-grade filtering
    const filterResults: FilterResults = institutionalSignalFilter.runInstitutionalFilters(pair, livePrice);
    
    // Reject if doesn't meet minimum confluence
    if (!institutionalSignalFilter.isSignalValid(filterResults)) {
      console.log(`❌ Signal REJECTED: Only ${filterResults.passedFilters}/6 filters passed (minimum 3 required)`);
      return null;
    }

    console.log(`✅ Signal APPROVED: ${filterResults.passedFilters}/6 filters passed - ${filterResults.confidence} grade`);

    // Determine trade direction based on dominant filter signals
    const tradeDirection = this.determineTradeDirection(filterResults);
    
    if (!tradeDirection) {
      console.log(`❌ Signal REJECTED: No clear directional bias from filters`);
      return null;
    }

    // Calculate precise entry levels
    const { stopLoss, takeProfit, riskReward } = this.calculateEliteLevels(
      livePrice, 
      tradeDirection, 
      pair, 
      filterResults.confidence
    );

    // Validate risk/reward
    if (riskReward < 2.0) {
      console.log(`❌ Signal REJECTED: Risk/Reward ${riskReward.toFixed(1)}:1 below 2.0:1 minimum`);
      return null;
    }

    // Get filter breakdown for transparency
    const filterBreakdown = institutionalSignalFilter.getFilterBreakdown(filterResults);

    // Calculate lot size based on signal strength
    const lotSize = this.calculateLotSize(filterResults.confidence);

    const signal: EliteSignal = {
      id: `elite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pair,
      type: tradeDirection,
      entry: livePrice,
      stopLoss,
      takeProfit,
      confidence: Math.round(filterResults.totalScore / filterResults.passedFilters),
      signalStrength: filterResults.confidence,
      filtersScore: filterResults.passedFilters,
      maxFilters: 6,
      timestamp: new Date().toISOString(),
      filterBreakdown,
      riskReward,
      lotSize,
      sessionInfo: this.getSessionInfo(),
      strategy: 'Institutional_Multi_Confluence'
    };

    console.log(`🚨 ELITE ${signal.signalStrength} SIGNAL: ${pair} ${tradeDirection} @ ${livePrice} | Filters: ${filterResults.passedFilters}/6 | RR: ${riskReward.toFixed(1)}:1`);
    
    return signal;
  }

  private determineTradeDirection(filterResults: FilterResults): 'BUY' | 'SELL' | null {
    let bullishSignals = 0;
    let bearishSignals = 0;

    // Structure break direction
    if (filterResults.structureBreak.passed) {
      if (filterResults.structureBreak.reason.includes('BULLISH')) bullishSignals++;
      if (filterResults.structureBreak.reason.includes('BEARISH')) bearishSignals++;
    }

    // Liquidity sweep direction (opposite of sweep direction)
    if (filterResults.liquiditySweep.passed) {
      if (filterResults.liquiditySweep.reason.includes('down')) bullishSignals++; // Sweep down = bullish reversal
      if (filterResults.liquiditySweep.reason.includes('up')) bearishSignals++; // Sweep up = bearish reversal
    }

    // FVG direction
    if (filterResults.fairValueGap.passed) {
      if (filterResults.fairValueGap.reason.includes('BULLISH')) bullishSignals++;
      if (filterResults.fairValueGap.reason.includes('BEARISH')) bearishSignals++;
    }

    // Volume institutional flow
    if (filterResults.volumeSpike.passed) {
      if (filterResults.volumeSpike.reason.includes('buying')) bullishSignals++;
      if (filterResults.volumeSpike.reason.includes('selling')) bearishSignals++;
    }

    // RSI divergence
    if (filterResults.rsiDivergence.passed) {
      if (filterResults.rsiDivergence.reason.includes('BULLISH')) bullishSignals++;
      if (filterResults.rsiDivergence.reason.includes('BEARISH')) bearishSignals++;
    }

    // Need clear directional bias (at least 2:1 ratio)
    if (bullishSignals >= 2 && bullishSignals > bearishSignals * 2) {
      return 'BUY';
    } else if (bearishSignals >= 2 && bearishSignals > bullishSignals * 2) {
      return 'SELL';
    }

    return null; // No clear bias
  }

  private calculateEliteLevels(
    entry: number, 
    direction: 'BUY' | 'SELL', 
    pair: string, 
    strength: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'
  ): { stopLoss: number; takeProfit: number; riskReward: number } {
    
    // Base risk parameters (tighter for institutional precision)
    const baseParams: { [key: string]: { slPips: number; tpMultiplier: number } } = {
      'EURUSD': { slPips: 8, tpMultiplier: 2.5 },
      'GBPUSD': { slPips: 10, tpMultiplier: 2.8 },
      'USDJPY': { slPips: 8, tpMultiplier: 2.5 },
      'AUDUSD': { slPips: 9, tpMultiplier: 2.6 },
      'USDCAD': { slPips: 8, tpMultiplier: 2.5 }
    };

    const params = baseParams[pair] || { slPips: 10, tpMultiplier: 2.5 };
    
    // Adjust based on signal strength
    const strengthMultiplier = {
      'ELITE': 1.4,    // Best RR for elite signals
      'STRONG': 1.2,
      'MEDIUM': 1.1,
      'WEAK': 1.0
    }[strength];

    const pipSize = pair.includes('JPY') ? 0.01 : 0.0001;
    const slDistance = params.slPips * pipSize;
    const tpDistance = slDistance * params.tpMultiplier * strengthMultiplier;

    let stopLoss: number;
    let takeProfit: number;

    if (direction === 'BUY') {
      stopLoss = entry - slDistance;
      takeProfit = entry + tpDistance;
    } else {
      stopLoss = entry + slDistance;
      takeProfit = entry - tpDistance;
    }

    const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);

    return { stopLoss, takeProfit, riskReward };
  }

  private calculateLotSize(strength: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'): number {
    const lotSizes = {
      'ELITE': 1.0,    // Full conviction
      'STRONG': 0.75,  // Strong conviction
      'MEDIUM': 0.5,   // Medium conviction
      'WEAK': 0.25     // Light conviction
    };

    return lotSizes[strength];
  }

  private getSessionInfo(): string {
    const hour = new Date().getUTCHours();
    
    if (hour >= 13 && hour <= 17) {
      return 'London/NY Overlap - Peak Volatility';
    } else if (hour >= 8 && hour <= 17) {
      return 'London Session - High Activity';
    } else if (hour >= 13 && hour <= 22) {
      return 'New York Session - Active Trading';
    } else {
      return 'Asian Session - Lower Activity';
    }
  }
}

export const eliteSignalEngine = new EliteSignalEngine();
