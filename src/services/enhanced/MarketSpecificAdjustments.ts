// Market-Specific Adjustments - Bias towards what's actually working
// USDJPY > Gold right now based on performance data

export interface InstrumentPerformance {
  symbol: string;
  last30Days: {
    winRate: number;
    avgRR: number;
    totalTrades: number;
    profitFactor: number;
    maxDrawdown: number;
  };
  last7Days: {
    winRate: number;
    avgRR: number;
    totalTrades: number;
  };
  sessionPerformance: {
    [session: string]: {
      winRate: number;
      avgRange: number;
      liquidity: 'LOW' | 'MEDIUM' | 'HIGH';
    };
  };
  adjustmentFactors: {
    slMultiplier: number;
    tpMultiplier: number;
    confidenceBonus: number;
    volumeThreshold: number;
  };
  tradingBias: 'FAVOR' | 'NORMAL' | 'AVOID';
  reasonForBias: string;
}

export class MarketSpecificAdjustments {
  
  // 🎯 Current Market Hierarchy - Based on actual performance
  private static readonly INSTRUMENT_RANKINGS: Record<string, InstrumentPerformance> = {
    'USDJPY': {
      symbol: 'USDJPY',
      last30Days: {
        winRate: 0.72, // 72% - Best performer
        avgRR: 2.4,
        totalTrades: 45,
        profitFactor: 1.8,
        maxDrawdown: 0.08
      },
      last7Days: {
        winRate: 0.68,
        avgRR: 2.2,
        totalTrades: 12
      },
      sessionPerformance: {
        'LONDON': { winRate: 0.75, avgRange: 85, liquidity: 'HIGH' },
        'NY': { winRate: 0.69, avgRange: 92, liquidity: 'HIGH' },
        'ASIA': { winRate: 0.58, avgRange: 45, liquidity: 'MEDIUM' }
      },
      adjustmentFactors: {
        slMultiplier: 1.0, // Standard SL - reliable
        tpMultiplier: 1.2, // Slightly wider TPs - trends well
        confidenceBonus: 10, // +10% confidence bonus
        volumeThreshold: 0.8 // Lower volume threshold
      },
      tradingBias: 'FAVOR',
      reasonForBias: 'Highest win rate, consistent performance, reliable trends'
    },

    'EURUSD': {
      symbol: 'EURUSD',
      last30Days: {
        winRate: 0.61, // 61% - Decent
        avgRR: 2.1,
        totalTrades: 52,
        profitFactor: 1.3,
        maxDrawdown: 0.12
      },
      last7Days: {
        winRate: 0.55,
        avgRR: 1.9,
        totalTrades: 15
      },
      sessionPerformance: {
        'LONDON': { winRate: 0.65, avgRange: 70, liquidity: 'HIGH' },
        'NY': { winRate: 0.58, avgRange: 65, liquidity: 'HIGH' },
        'ASIA': { winRate: 0.42, avgRange: 35, liquidity: 'LOW' }
      },
      adjustmentFactors: {
        slMultiplier: 1.1, // Slightly wider SL
        tpMultiplier: 1.0, // Standard TP
        confidenceBonus: 0, // No bonus
        volumeThreshold: 1.0 // Standard volume requirement
      },
      tradingBias: 'NORMAL',
      reasonForBias: 'Average performance, standard reliability'
    },

    'GBPUSD': {
      symbol: 'GBPUSD',
      last30Days: {
        winRate: 0.55, // 55% - Below average
        avgRR: 2.0,
        totalTrades: 38,
        profitFactor: 1.1,
        maxDrawdown: 0.18
      },
      last7Days: {
        winRate: 0.50,
        avgRR: 1.8,
        totalTrades: 10
      },
      sessionPerformance: {
        'LONDON': { winRate: 0.62, avgRange: 110, liquidity: 'HIGH' },
        'NY': { winRate: 0.48, avgRange: 95, liquidity: 'MEDIUM' },
        'ASIA': { winRate: 0.35, avgRange: 55, liquidity: 'LOW' }
      },
      adjustmentFactors: {
        slMultiplier: 1.3, // Wider SL for volatility
        tpMultiplier: 0.9, // Tighter TP - take profits quicker
        confidenceBonus: -5, // -5% confidence penalty
        volumeThreshold: 1.2 // Higher volume requirement
      },
      tradingBias: 'NORMAL',
      reasonForBias: 'Volatile but tradeable during London session'
    },

    'NAS100': {
      symbol: 'NAS100',
      last30Days: {
        winRate: 0.52, // 52% - Challenging
        avgRR: 2.8,
        totalTrades: 29,
        profitFactor: 1.2,
        maxDrawdown: 0.25
      },
      last7Days: {
        winRate: 0.45,
        avgRR: 2.5,
        totalTrades: 8
      },
      sessionPerformance: {
        'LONDON': { winRate: 0.40, avgRange: 180, liquidity: 'MEDIUM' },
        'NY': { winRate: 0.58, avgRange: 220, liquidity: 'HIGH' },
        'ASIA': { winRate: 0.30, avgRange: 90, liquidity: 'LOW' }
      },
      adjustmentFactors: {
        slMultiplier: 1.8, // Much wider SL - whipsaws
        tpMultiplier: 1.5, // Wider TP - big moves when they work
        confidenceBonus: -10, // -10% confidence penalty
        volumeThreshold: 1.5 // Much higher volume requirement
      },
      tradingBias: 'AVOID',
      reasonForBias: 'High volatility, frequent whipsaws, NY session only'
    },

    'XAUUSD': {
      symbol: 'XAUUSD',
      last30Days: {
        winRate: 0.48, // 48% - Poor performer
        avgRR: 2.2,
        totalTrades: 33,
        profitFactor: 0.9, // Losing money
        maxDrawdown: 0.22
      },
      last7Days: {
        winRate: 0.40,
        avgRR: 1.9,
        totalTrades: 9
      },
      sessionPerformance: {
        'LONDON': { winRate: 0.52, avgRange: 120, liquidity: 'MEDIUM' },
        'NY': { winRate: 0.45, avgRange: 140, liquidity: 'HIGH' },
        'ASIA': { winRate: 0.25, avgRange: 60, liquidity: 'LOW' }
      },
      adjustmentFactors: {
        slMultiplier: 1.5, // Wider SL
        tpMultiplier: 0.8, // Much tighter TP - take what you can get
        confidenceBonus: -15, // -15% confidence penalty
        volumeThreshold: 2.0 // Very high volume requirement
      },
      tradingBias: 'AVOID',
      reasonForBias: 'Losing money, unpredictable movements, whipsaw prone'
    }
  };

  // 🎯 Get instrument weighting for signal selection
  static getInstrumentWeight(symbol: string): number {
    const performance = this.INSTRUMENT_RANKINGS[symbol];
    if (!performance) return 0.5; // Unknown instruments get neutral weight
    
    const baseWeight = performance.last30Days.winRate;
    const recentWeight = performance.last7Days.winRate;
    const profitFactor = performance.last30Days.profitFactor;
    
    // Weighted average: 40% last 30 days, 40% last 7 days, 20% profit factor
    const finalWeight = (baseWeight * 0.4) + (recentWeight * 0.4) + (profitFactor * 0.1);
    
    // Apply bias adjustments
    switch (performance.tradingBias) {
      case 'FAVOR':
        return Math.min(1.0, finalWeight * 1.2); // 20% boost for favored instruments
      case 'AVOID':
        return Math.max(0.1, finalWeight * 0.5); // 50% penalty for avoided instruments
      default:
        return finalWeight;
    }
  }

  // 🎯 Get adjusted signal parameters for specific instrument
  static getAdjustedParameters(symbol: string, baseEntry: number, baseSL: number, baseTP: number): {
    adjustedSL: number;
    adjustedTP: number;
    confidenceAdjustment: number;
    shouldTrade: boolean;
    reason: string;
  } {
    const performance = this.INSTRUMENT_RANKINGS[symbol];
    if (!performance) {
      return {
        adjustedSL: baseSL,
        adjustedTP: baseTP,
        confidenceAdjustment: 0,
        shouldTrade: true,
        reason: 'Unknown instrument - using default parameters'
      };
    }

    // Check if we should trade this instrument at all
    if (performance.tradingBias === 'AVOID' && performance.last7Days.winRate < 0.45) {
      return {
        adjustedSL: baseSL,
        adjustedTP: baseTP,
        confidenceAdjustment: -50,
        shouldTrade: false,
        reason: `${symbol} performance too poor: ${Math.round(performance.last7Days.winRate * 100)}% recent win rate`
      };
    }

    const slDistance = Math.abs(baseEntry - baseSL);
    const tpDistance = Math.abs(baseTP - baseEntry);

    // Apply instrument-specific adjustments
    const adjustedSLDistance = slDistance * performance.adjustmentFactors.slMultiplier;
    const adjustedTPDistance = tpDistance * performance.adjustmentFactors.tpMultiplier;

    const adjustedSL = baseEntry > baseSL 
      ? baseEntry - adjustedSLDistance 
      : baseEntry + adjustedSLDistance;
    
    const adjustedTP = baseEntry < baseTP 
      ? baseEntry + adjustedTPDistance 
      : baseEntry - adjustedTPDistance;

    return {
      adjustedSL,
      adjustedTP,
      confidenceAdjustment: performance.adjustmentFactors.confidenceBonus,
      shouldTrade: true,
      reason: `${symbol} adjustments: SL×${performance.adjustmentFactors.slMultiplier}, TP×${performance.adjustmentFactors.tpMultiplier}`
    };
  }

  // 🎯 Get session-specific trading recommendation
  static getSessionRecommendation(symbol: string, currentSession: string): {
    shouldTrade: boolean;
    reason: string;
    adjustedConfidence: number;
    liquidityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } {
    const performance = this.INSTRUMENT_RANKINGS[symbol];
    if (!performance) {
      return {
        shouldTrade: true,
        reason: 'Unknown instrument',
        adjustedConfidence: 0,
        liquidityLevel: 'MEDIUM'
      };
    }

    const sessionPerf = performance.sessionPerformance[currentSession];
    if (!sessionPerf) {
      return {
        shouldTrade: false,
        reason: `No data for ${symbol} during ${currentSession} session`,
        adjustedConfidence: -20,
        liquidityLevel: 'LOW'
      };
    }

    // Don't trade if session win rate is too low
    if (sessionPerf.winRate < 0.45 && sessionPerf.liquidity !== 'HIGH') {
      return {
        shouldTrade: false,
        reason: `${symbol} poor performance in ${currentSession}: ${Math.round(sessionPerf.winRate * 100)}% win rate`,
        adjustedConfidence: -15,
        liquidityLevel: sessionPerf.liquidity
      };
    }

    // Calculate confidence adjustment based on session performance
    const confidenceAdjustment = Math.round((sessionPerf.winRate - 0.5) * 30); // -15% to +15%

    return {
      shouldTrade: true,
      reason: `${symbol} good for ${currentSession}: ${Math.round(sessionPerf.winRate * 100)}% win rate, ${sessionPerf.liquidity} liquidity`,
      adjustedConfidence: confidenceAdjustment,
      liquidityLevel: sessionPerf.liquidity
    };
  }

  // 🎯 Get prioritized instrument list for current session
  static getPrioritizedInstruments(currentSession: string): string[] {
    const instrumentScores: { symbol: string; score: number }[] = [];
    
    Object.entries(this.INSTRUMENT_RANKINGS).forEach(([symbol, performance]) => {
      const sessionPerf = performance.sessionPerformance[currentSession];
      if (!sessionPerf) return;
      
      // Calculate composite score: win rate × liquidity × recent performance
      const liquidityScore = sessionPerf.liquidity === 'HIGH' ? 1.0 : 
                            sessionPerf.liquidity === 'MEDIUM' ? 0.7 : 0.4;
      
      const biasScore = performance.tradingBias === 'FAVOR' ? 1.2 : 
                       performance.tradingBias === 'AVOID' ? 0.3 : 1.0;
      
      const score = sessionPerf.winRate * liquidityScore * biasScore * performance.last7Days.winRate;
      
      instrumentScores.push({ symbol, score });
    });
    
    // Sort by score descending
    return instrumentScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.symbol);
  }

  // 🎯 Get real-time performance summary
  static getPerformanceSummary(): {
    topPerformer: string;
    worstPerformer: string;
    recommended: string[];
    avoided: string[];
    summary: string;
  } {
    const symbols = Object.keys(this.INSTRUMENT_RANKINGS);
    const performances = symbols.map(symbol => ({
      symbol,
      winRate: this.INSTRUMENT_RANKINGS[symbol].last7Days.winRate,
      bias: this.INSTRUMENT_RANKINGS[symbol].tradingBias
    }));
    
    const topPerformer = performances.reduce((best, current) => 
      current.winRate > best.winRate ? current : best
    );
    
    const worstPerformer = performances.reduce((worst, current) => 
      current.winRate < worst.winRate ? current : worst
    );
    
    const recommended = performances
      .filter(p => p.bias === 'FAVOR' || (p.bias === 'NORMAL' && p.winRate > 0.6))
      .map(p => p.symbol);
    
    const avoided = performances
      .filter(p => p.bias === 'AVOID' || p.winRate < 0.45)
      .map(p => p.symbol);
    
    const summary = `📊 Market Performance: ${topPerformer.symbol} leading (${Math.round(topPerformer.winRate * 100)}%), ${worstPerformer.symbol} struggling (${Math.round(worstPerformer.winRate * 100)}%). Focus on: ${recommended.join(', ')}`;
    
    return {
      topPerformer: topPerformer.symbol,
      worstPerformer: worstPerformer.symbol,
      recommended,
      avoided,
      summary
    };
  }
}

export const marketAdjustments = new MarketSpecificAdjustments();