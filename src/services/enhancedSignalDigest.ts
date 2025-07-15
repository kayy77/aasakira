
export interface SignalCredibilityScore {
  grade: 'A+' | 'A' | 'B' | 'C';
  score: number;
  factors: {
    winRate: number;
    riskReward: number;
    timeTestedEdge: number;
    marketConditions: number;
  };
}

export interface CounterSignalAnalysis {
  retailSentiment: string;
  institutionalView: string;
  conflictLevel: 'Low' | 'Medium' | 'High';
  reasoning: string;
}

export interface HistoricalReplay {
  id: string;
  date: string;
  outcome: 'Win' | 'Loss';
  pips: number;
  duration: string;
  chart: string; // Base64 chart image or description
}

export interface RiskCommentary {
  level: 'Low' | 'Medium' | 'High' | 'Extreme';
  warnings: string[];
  recommendations: string[];
  newsEvents: string[];
}

export interface TradeClassification {
  type: 'Scalp' | 'Intraday' | 'Swing' | 'High Conviction Swing';
  timeframe: string;
  expectedDuration: string;
  riskProfile: string;
}

export interface TimeToPlay {
  validUntil: Date;
  remainingMinutes: number;
  urgencyLevel: 'Fresh' | 'Active' | 'Expiring' | 'Expired';
  decayFactor: number;
}

export interface PairAlternatives {
  primary: string;
  alternatives: Array<{
    pair: string;
    similarity: number;
    reason: string;
    confidence: number;
  }>;
}

export interface PersonalizedConfidence {
  matchPercentage: number;
  reasoning: string;
  historicalPerformance: string;
  recommendation: string;
}

export interface EnhancedSignalDigest {
  credibilityScore: SignalCredibilityScore;
  counterAnalysis: CounterSignalAnalysis;
  historicalReplays: HistoricalReplay[];
  riskCommentary: RiskCommentary;
  tradeClassification: TradeClassification;
  timeToPlay: TimeToPlay;
  pairAlternatives: PairAlternatives;
  personalizedConfidence: PersonalizedConfidence;
}

class EnhancedSignalDigestService {
  generateCredibilityScore(signal: any): SignalCredibilityScore {
    const winRate = signal.confidence || 75;
    const riskReward = signal.riskReward || 2.5;
    const timeTestedEdge = Math.random() * 40 + 60; // 60-100
    const marketConditions = Math.random() * 30 + 70; // 70-100
    
    const totalScore = (winRate * 0.3 + riskReward * 10 * 0.2 + timeTestedEdge * 0.3 + marketConditions * 0.2);
    
    let grade: 'A+' | 'A' | 'B' | 'C';
    if (totalScore >= 85) grade = 'A+';
    else if (totalScore >= 75) grade = 'A';
    else if (totalScore >= 65) grade = 'B';
    else grade = 'C';
    
    return {
      grade,
      score: Math.round(totalScore),
      factors: {
        winRate,
        riskReward: riskReward * 10,
        timeTestedEdge: Math.round(timeTestedEdge),
        marketConditions: Math.round(marketConditions)
      }
    };
  }

  generateCounterAnalysis(signal: any): CounterSignalAnalysis {
    const isLong = signal.type === 'BUY';
    
    const retailSentiments = [
      `Retail traders are heavily ${isLong ? 'short' : 'long'} here, expecting a reversal`,
      `Social media sentiment shows ${isLong ? 'bearish' : 'bullish'} bias among retail`,
      `Retail positioning data shows ${Math.random() > 0.5 ? 'overleveraged' : 'cautious'} approach`
    ];
    
    const institutionalViews = [
      `Smart money shows ${isLong ? 'accumulation' : 'distribution'} patterns`,
      `Institutional flow indicates ${isLong ? 'buying pressure' : 'selling pressure'} building`,
      `Large players positioning for ${isLong ? 'upside' : 'downside'} breakout`
    ];
    
    return {
      retailSentiment: retailSentiments[Math.floor(Math.random() * retailSentiments.length)],
      institutionalView: institutionalViews[Math.floor(Math.random() * institutionalViews.length)],
      conflictLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
      reasoning: `${isLong ? 'Bullish' : 'Bearish'} institutional positioning contrasts with retail sentiment, creating potential for squeeze.`
    };
  }

  generateHistoricalReplays(signal: any): HistoricalReplay[] {
    return [
      {
        id: '1',
        date: '2024-12-10',
        outcome: 'Win',
        pips: 45,
        duration: '2h 15m',
        chart: 'Strong breakout with institutional volume'
      },
      {
        id: '2',
        date: '2024-12-08',
        outcome: 'Win',
        pips: 32,
        duration: '1h 45m',
        chart: 'Clean retest and continuation'
      },
      {
        id: '3',
        date: '2024-12-05',
        outcome: 'Loss',
        pips: -15,
        duration: '25m',
        chart: 'Stopped out on news spike'
      }
    ];
  }

  generateRiskCommentary(signal: any): RiskCommentary {
    const upcomingEvents = [
      'FOMC Meeting Wednesday',
      'NFP Friday 8:30 EST',
      'Bank of England Decision Thursday',
      'ECB Press Conference',
      'US CPI Data Release'
    ];

    const warnings = [
      'High impact news within 24 hours',
      'Unusual volume spike detected',
      'Cross-pair correlation breakdown'
    ];

    const recommendations = [
      'Consider reducing position size by 50%',
      'Move stop loss to breakeven after 20 pips',
      'Monitor closely during news events'
    ];

    return {
      level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
      warnings: warnings.slice(0, Math.floor(Math.random() * 2) + 1),
      recommendations: recommendations.slice(0, Math.floor(Math.random() * 2) + 1),
      newsEvents: upcomingEvents.slice(0, Math.floor(Math.random() * 2) + 1)
    };
  }

  generateTradeClassification(signal: any): TradeClassification {
    const types: TradeClassification['type'][] = ['Scalp', 'Intraday', 'Swing', 'High Conviction Swing'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const classifications = {
      'Scalp': {
        timeframe: '1M-5M',
        expectedDuration: '5-30 minutes',
        riskProfile: 'High frequency, tight stops'
      },
      'Intraday': {
        timeframe: '15M-1H',
        expectedDuration: '2-8 hours',
        riskProfile: 'Moderate risk, day closure target'
      },
      'Swing': {
        timeframe: '4H-1D',
        expectedDuration: '1-5 days',
        riskProfile: 'Lower frequency, wider stops'
      },
      'High Conviction Swing': {
        timeframe: '1D',
        expectedDuration: '3-14 days',
        riskProfile: 'High conviction, position sizing'
      }
    };
    
    return {
      type,
      ...classifications[type]
    };
  }

  generateTimeToPlay(): TimeToPlay {
    const validUntil = new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000); // 0-4 hours
    const remainingMinutes = Math.floor((validUntil.getTime() - Date.now()) / (1000 * 60));
    
    let urgencyLevel: TimeToPlay['urgencyLevel'];
    if (remainingMinutes > 180) urgencyLevel = 'Fresh';
    else if (remainingMinutes > 60) urgencyLevel = 'Active';
    else if (remainingMinutes > 0) urgencyLevel = 'Expiring';
    else urgencyLevel = 'Expired';
    
    return {
      validUntil,
      remainingMinutes,
      urgencyLevel,
      decayFactor: Math.max(0, remainingMinutes / 240) // 0-1 scale
    };
  }

  generatePairAlternatives(signal: any): PairAlternatives {
    const allPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP'];
    const alternatives = allPairs
      .filter(pair => pair !== signal.pair)
      .slice(0, 3)
      .map(pair => ({
        pair,
        similarity: Math.random() * 40 + 60, // 60-100%
        reason: `Similar institutional flow patterns detected`,
        confidence: Math.random() * 20 + 70 // 70-90%
      }));
    
    return {
      primary: signal.pair,
      alternatives
    };
  }

  generatePersonalizedConfidence(): PersonalizedConfidence {
    const matchPercentage = Math.random() * 30 + 60; // 60-90%
    
    return {
      matchPercentage,
      reasoning: `This setup style aligns with your successful trade patterns`,
      historicalPerformance: `You've won ${Math.floor(Math.random() * 20 + 70)}% of similar setups`,
      recommendation: matchPercentage > 80 ? 'Strong match - consider standard position size' : 
                     matchPercentage > 70 ? 'Good match - consider reduced size' :
                     'Moderate match - proceed with caution'
    };
  }

  generateCompleteDigest(signal: any): EnhancedSignalDigest {
    return {
      credibilityScore: this.generateCredibilityScore(signal),
      counterAnalysis: this.generateCounterAnalysis(signal),
      historicalReplays: this.generateHistoricalReplays(signal),
      riskCommentary: this.generateRiskCommentary(signal),
      tradeClassification: this.generateTradeClassification(signal),
      timeToPlay: this.generateTimeToPlay(),
      pairAlternatives: this.generatePairAlternatives(signal),
      personalizedConfidence: this.generatePersonalizedConfidence()
    };
  }
}

export const enhancedSignalDigestService = new EnhancedSignalDigestService();
