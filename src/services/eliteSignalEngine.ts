
import { institutionalSignalFilter, FilterResults } from './institutionalSignalFilter';

export interface EliteSignal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  signalStrength: 'ULTRA' | 'STRONG' | 'MEDIUM' | 'STANDARD';
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
  // Additional properties expected by EliteSignalCard
  sniperMode: boolean;
  suggestedLot: number;
  livePrice: number;
  filters: {
    structureBreak: boolean;
    liquiditySweep: boolean;
    fairValueGap: boolean;
    volumeSpike: boolean;
    rsiDivergence: boolean;
    sessionFilter: boolean;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  analysis: string;
}

class EliteSignalEngine {
  private readonly ANCHOR_FILTERS = ['structureBreak', 'liquiditySweep', 'fairValueGap', 'rsiDivergence'];

  async generateEliteSignal(livePrice: number, pair: string): Promise<EliteSignal | null> {
    console.log(`🎯 Running ELITE Signal Analysis for ${pair} @ ${livePrice}...`);
    
    // Run institutional-grade filtering
    const filterResults: FilterResults = institutionalSignalFilter.runInstitutionalFilters(pair, livePrice);
    
    // STRICT REJECTION: Must pass minimum 3/6 filters
    if (!institutionalSignalFilter.isSignalValid(filterResults)) {
      console.log(`❌ Signal REJECTED: Only ${filterResults.passedFilters}/6 filters passed (minimum 3 required)`);
      return null;
    }

    // ANCHOR REQUIREMENT: Must have at least one anchor filter for standard+ signals
    const hasAnchorFilter = this.checkAnchorRequirement(filterResults);
    if (!hasAnchorFilter) {
      console.log(`❌ Signal REJECTED: No anchor filter passed (need Structure/Liquidity/FVG/RSI)`);
      return null;
    }

    console.log(`✅ Signal APPROVED: ${filterResults.passedFilters}/6 filters passed - ${filterResults.confidence} grade`);

    // Determine trade direction with stricter bias requirement
    const tradeDirection = this.determineTradeDirection(filterResults);
    
    if (!tradeDirection) {
      console.log(`❌ Signal REJECTED: No clear directional bias from filters`);
      return null;
    }

    // CHOP FILTER: Reject sideways markets
    if (this.isChoppyMarket(filterResults)) {
      console.log(`❌ Signal REJECTED: Choppy market conditions detected`);
      return null;
    }

    // Calculate precise entry levels
    const { stopLoss, takeProfit, riskReward } = this.calculateEliteLevels(
      livePrice, 
      tradeDirection, 
      pair, 
      filterResults.confidence
    );

    // Enhanced risk/reward validation based on signal grade
    const minRiskReward = this.getMinimumRiskReward(filterResults.confidence);
    if (riskReward < minRiskReward) {
      console.log(`❌ Signal REJECTED: Risk/Reward ${riskReward.toFixed(1)}:1 below ${minRiskReward}:1 minimum for ${filterResults.confidence}`);
      return null;
    }

    // Get filter breakdown for transparency
    const filterBreakdown = institutionalSignalFilter.getFilterBreakdown(filterResults);

    // Calculate lot size based on signal strength
    const lotSize = this.calculateLotSize(filterResults.confidence);

    // Map confidence to signalStrength
    const signalStrength = this.mapConfidenceToStrength(filterResults.confidence);

    const signal: EliteSignal = {
      id: `elite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pair,
      type: tradeDirection,
      entry: livePrice,
      stopLoss,
      takeProfit,
      confidence: Math.round(filterResults.totalScore / filterResults.passedFilters),
      signalStrength,
      filtersScore: filterResults.passedFilters,
      maxFilters: 6,
      timestamp: new Date().toISOString(),
      filterBreakdown,
      riskReward,
      lotSize,
      sessionInfo: this.getSessionInfo(),
      strategy: 'Institutional_Multi_Confluence',
      // Additional properties for EliteSignalCard compatibility
      sniperMode: filterResults.passedFilters >= 5,
      suggestedLot: lotSize,
      livePrice: livePrice,
      filters: {
        structureBreak: filterResults.structureBreak.passed,
        liquiditySweep: filterResults.liquiditySweep.passed,
        fairValueGap: filterResults.fairValueGap.passed,
        volumeSpike: filterResults.volumeSpike.passed,
        rsiDivergence: filterResults.rsiDivergence.passed,
        sessionFilter: filterResults.sessionFilter.passed
      },
      riskLevel: this.calculateRiskLevel(filterResults.passedFilters),
      analysis: this.generateAnalysis(filterResults, tradeDirection)
    };

    console.log(`🚨 ${signal.signalStrength} SIGNAL: ${pair} ${tradeDirection} @ ${livePrice} | Filters: ${filterResults.passedFilters}/6 | RR: ${riskReward.toFixed(1)}:1`);
    
    return signal;
  }

  private checkAnchorRequirement(filterResults: FilterResults): boolean {
    return filterResults.structureBreak.passed || 
           filterResults.liquiditySweep.passed || 
           filterResults.fairValueGap.passed || 
           filterResults.rsiDivergence.passed;
  }

  private isChoppyMarket(filterResults: FilterResults): boolean {
    // If RSI is neutral (45-55) AND no strong volume AND no structure break = choppy
    const neutralRSI = !filterResults.rsiDivergence.passed;
    const lowVolume = !filterResults.volumeSpike.passed;
    const noStructure = !filterResults.structureBreak.passed;
    
    return neutralRSI && lowVolume && noStructure;
  }

  private getMinimumRiskReward(confidence: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'): number {
    const minimums = {
      'ELITE': 2.5,
      'STRONG': 2.2,
      'MEDIUM': 2.0,
      'WEAK': 1.8
    };
    return minimums[confidence];
  }

  private mapConfidenceToStrength(confidence: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'): 'ULTRA' | 'STRONG' | 'MEDIUM' | 'STANDARD' {
    const mapping = {
      'ELITE': 'ULTRA' as const,
      'STRONG': 'STRONG' as const,
      'MEDIUM': 'MEDIUM' as const,
      'WEAK': 'STANDARD' as const
    };
    return mapping[confidence];
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
      if (filterResults.liquiditySweep.reason.includes('down')) bullishSignals++;
      if (filterResults.liquiditySweep.reason.includes('up')) bearishSignals++;
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

    // STRICTER REQUIREMENT: Need clear 2:1 directional bias minimum
    if (bullishSignals >= 2 && bullishSignals >= bearishSignals * 2) {
      return 'BUY';
    } else if (bearishSignals >= 2 && bearishSignals >= bullishSignals * 2) {
      return 'SELL';
    }

    return null; // No clear bias - REJECT
  }

  private calculateEliteLevels(
    entry: number, 
    direction: 'BUY' | 'SELL', 
    pair: string, 
    strength: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'
  ): { stopLoss: number; takeProfit: number; riskReward: number } {
    
    // Enhanced risk parameters based on signal grade
    const baseParams: { [key: string]: { slPips: number; tpMultiplier: number } } = {
      'EURUSD': { slPips: 8, tpMultiplier: 2.5 },
      'GBPUSD': { slPips: 10, tpMultiplier: 2.8 },
      'USDJPY': { slPips: 8, tpMultiplier: 2.5 },
      'AUDUSD': { slPips: 9, tpMultiplier: 2.6 },
      'USDCAD': { slPips: 8, tpMultiplier: 2.5 }
    };

    const params = baseParams[pair] || { slPips: 10, tpMultiplier: 2.5 };
    
    // Adjust based on signal strength with better ratios
    const strengthMultiplier = {
      'ELITE': 1.5,    // Best RR for elite signals
      'STRONG': 1.3,
      'MEDIUM': 1.15,
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
      'ELITE': 1.0,      // Full conviction
      'STRONG': 0.75,    // Strong conviction
      'MEDIUM': 0.5,     // Medium conviction
      'WEAK': 0.4        // Light conviction (was 0.25, now more reasonable)
    };

    return lotSizes[strength];
  }

  private calculateRiskLevel(passedFilters: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (passedFilters >= 5) return 'LOW';
    if (passedFilters >= 4) return 'MEDIUM';
    return 'HIGH';
  }

  private generateAnalysis(filterResults: FilterResults, direction: 'BUY' | 'SELL'): string {
    const passedCount = filterResults.passedFilters;
    const grade = filterResults.confidence;
    
    return `${grade} signal with ${passedCount}/6 institutional filters confirmed. ${direction} bias established through confluence analysis.`;
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
