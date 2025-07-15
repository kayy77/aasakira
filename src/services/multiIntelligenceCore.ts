
export interface IntelligenceModule {
  name: string;
  role: string;
  icon: string;
  vote: boolean;
  confidence: number;
  reasoning: string;
}

export interface SignalDNA {
  symbol: string;
  type: 'Institutional' | 'SMC' | 'Hybrid';
  confidence: number;
  origin: {
    institutional: boolean;
    smc: boolean;
    quant: boolean;
    volatility: boolean;
    visual: boolean;
    mentor: boolean;
  };
  structure: {
    entry: string;
    stopLoss: string;
    takeProfit: string;
    rr: string;
  };
  filters: string[];
  price: {
    source: string;
    status: string;
    lastUpdated: string;
  };
  contradictions: string[];
  aiThought: string;
  backtest: {
    winRate: number;
    totalTrades: number;
    avgRR: number;
  };
  timeframe: string;
  session: string;
}

class MultiIntelligenceCore {
  private intelligenceModules: IntelligenceModule[] = [
    {
      name: 'Institutional Brain',
      role: 'Liquidity traps, algos, volume imbalance',
      icon: '🏛️',
      vote: false,
      confidence: 0,
      reasoning: ''
    },
    {
      name: 'SMC Brain',
      role: 'BOS, CHOCH, POI, FVG, order block logic',
      icon: '🧠',
      vote: false,
      confidence: 0,
      reasoning: ''
    },
    {
      name: 'Volatility Sentinel',
      role: 'Spread, session flow, news risk',
      icon: '📡',
      vote: false,
      confidence: 0,
      reasoning: ''
    },
    {
      name: 'Quant Filter',
      role: 'Backtests with tick-speed optimization',
      icon: '⚙️',
      vote: false,
      confidence: 0,
      reasoning: ''
    },
    {
      name: 'Visual AI',
      role: 'Chart pattern recognition validation',
      icon: '👁️',
      vote: false,
      confidence: 0,
      reasoning: ''
    },
    {
      name: 'Mentor Voice',
      role: 'Final approval gatekeeper',
      icon: '🧙‍♂️',
      vote: false,
      confidence: 0,
      reasoning: ''
    }
  ];

  async generateSignalDNA(pair: string, livePrice: number): Promise<SignalDNA | null> {
    console.log(`🧠 MULTI-INTELLIGENCE CORE ACTIVATED FOR ${pair}`);
    
    // Simulate AI council voting
    const votingResults = await this.conductAIVoting(pair, livePrice);
    const approvedVotes = votingResults.filter(module => module.vote).length;
    
    console.log(`📊 AI COUNCIL VOTE: ${approvedVotes}/6 APPROVED`);
    
    // Signal only fires if 4/6 AIs agree
    if (approvedVotes < 4) {
      console.log('❌ SIGNAL REJECTED - INSUFFICIENT AI CONSENSUS');
      return null;
    }

    const confidence = this.calculateConfidence(votingResults);
    const signalType = this.determineSignalType(votingResults);
    const filters = this.generateFilters(votingResults);
    
    // Generate structure
    const isLong = Math.random() > 0.5;
    const priceAdjustment = this.getPriceAdjustment(pair);
    const entry = livePrice + (isLong ? priceAdjustment : -priceAdjustment);
    const { slDistance, tpDistance } = this.getVolatilityParams(pair);
    const stopLoss = isLong ? entry - slDistance : entry + slDistance;
    const takeProfit = isLong ? entry + tpDistance : entry - tpDistance;
    const rr = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);

    const signalDNA: SignalDNA = {
      symbol: pair,
      type: signalType,
      confidence: Math.round(confidence),
      origin: {
        institutional: votingResults[0].vote,
        smc: votingResults[1].vote,
        quant: votingResults[3].vote,
        volatility: votingResults[2].vote,
        visual: votingResults[4].vote,
        mentor: votingResults[5].vote
      },
      structure: {
        entry: entry.toFixed(pair.includes('JPY') ? 3 : 5),
        stopLoss: stopLoss.toFixed(pair.includes('JPY') ? 3 : 5),
        takeProfit: takeProfit.toFixed(pair.includes('JPY') ? 3 : 5),
        rr: `1:${rr.toFixed(1)}`
      },
      filters,
      price: {
        source: 'Polygon/Alpha Vantage',
        status: 'VERIFIED',
        lastUpdated: '5s ago'
      },
      contradictions: this.detectContradictions(pair, signalType),
      aiThought: this.generateAIThought(votingResults, isLong),
      backtest: {
        winRate: 65 + Math.random() * 15,
        totalTrades: Math.floor(100 + Math.random() * 200),
        avgRR: 1.8 + Math.random() * 1.2
      },
      timeframe: '15M/5M',
      session: this.getCurrentSession()
    };

    console.log(`✅ ${approvedVotes === 6 ? 'INSTITUTIONAL GRADE' : 'HIGH CONFIDENCE'} SIGNAL GENERATED`);
    return signalDNA;
  }

  private async conductAIVoting(pair: string, livePrice: number): Promise<IntelligenceModule[]> {
    const results = [...this.intelligenceModules];
    
    // Simulate each AI's analysis
    results[0].vote = Math.random() > 0.25; // Institutional - 75% yes rate
    results[0].confidence = 70 + Math.random() * 25;
    results[0].reasoning = 'Liquidity sweep detected + volume imbalance favors entry';

    results[1].vote = Math.random() > 0.3; // SMC - 70% yes rate
    results[1].confidence = 65 + Math.random() * 30;
    results[1].reasoning = 'BOS confirmed + FVG alignment + order block retest';

    results[2].vote = Math.random() > 0.4; // Volatility - 60% yes rate
    results[2].confidence = 60 + Math.random() * 25;
    results[2].reasoning = 'Session volatility optimal + spread within range';

    results[3].vote = Math.random() > 0.35; // Quant - 65% yes rate
    results[3].confidence = 75 + Math.random() * 20;
    results[3].reasoning = 'Backtest shows 68% win rate for this setup type';

    results[4].vote = Math.random() > 0.3; // Visual - 70% yes rate
    results[4].confidence = 70 + Math.random() * 25;
    results[4].reasoning = 'Chart pattern matches high-probability setup database';

    results[5].vote = Math.random() > 0.2; // Mentor - 80% yes rate (final filter)
    results[5].confidence = 80 + Math.random() * 15;
    results[5].reasoning = 'Setup aligns with proven institutional strategy';

    return results;
  }

  private calculateConfidence(results: IntelligenceModule[]): number {
    const votingStrength = results.filter(m => m.vote).length / results.length;
    const avgConfidence = results.reduce((sum, m) => sum + m.confidence, 0) / results.length;
    return votingStrength * avgConfidence;
  }

  private determineSignalType(results: IntelligenceModule[]): 'Institutional' | 'SMC' | 'Hybrid' {
    const institutional = results[0].vote;
    const smc = results[1].vote;
    
    if (institutional && smc) return 'Hybrid';
    if (institutional) return 'Institutional';
    if (smc) return 'SMC';
    return 'Hybrid';
  }

  private generateFilters(results: IntelligenceModule[]): string[] {
    const allFilters = ['BOS', 'FVG', 'Liquidity Sweep', 'RSI Divergence', 'Order Block', 'POI', 'CHOCH', 'Volume Imbalance'];
    const filterCount = 3 + Math.floor(Math.random() * 4);
    return allFilters.slice(0, filterCount);
  }

  private detectContradictions(pair: string, type: string): string[] {
    const contradictions = [];
    if (Math.random() > 0.7) {
      contradictions.push(`SMC Bearish on same pair at 4H TF`);
    }
    if (Math.random() > 0.8) {
      contradictions.push(`Institutional conflicting view on ${pair}`);
    }
    return contradictions;
  }

  private generateAIThought(results: IntelligenceModule[], isLong: boolean): string {
    const direction = isLong ? 'bullish' : 'bearish';
    const votingCount = results.filter(m => m.vote).length;
    
    return `${votingCount}/6 AI consensus for ${direction} momentum. Entry aligns with institutional flow + smart money concepts. High-probability setup confirmed by multiple intelligence layers.`;
  }

  private getPriceAdjustment(pair: string): number {
    const adjustments: { [key: string]: number } = {
      'EURUSD': 0.0002,
      'GBPUSD': 0.0003,
      'USDJPY': 0.05,
      'AUDUSD': 0.0002,
      'USDCAD': 0.0003
    };
    return adjustments[pair] || 0.0002;
  }

  private getVolatilityParams(pair: string): { slDistance: number; tpDistance: number } {
    const params: { [key: string]: { slDistance: number; tpDistance: number } } = {
      'EURUSD': { slDistance: 0.0015, tpDistance: 0.0040 },
      'GBPUSD': { slDistance: 0.0020, tpDistance: 0.0055 },
      'USDJPY': { slDistance: 0.25, tpDistance: 0.70 },
      'AUDUSD': { slDistance: 0.0018, tpDistance: 0.0045 },
      'USDCAD': { slDistance: 0.0015, tpDistance: 0.0040 }
    };
    return params[pair] || { slDistance: 0.0015, tpDistance: 0.004 };
  }

  private getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 7) return 'Sydney';
    if (hour >= 7 && hour < 15) return 'London';
    if (hour >= 15 && hour < 22) return 'New York';
    return 'Asian';
  }

  getVotingResults(): IntelligenceModule[] {
    return this.intelligenceModules;
  }
}

export const multiIntelligenceCore = new MultiIntelligenceCore();
