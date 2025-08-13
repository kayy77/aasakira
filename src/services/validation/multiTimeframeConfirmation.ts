// Multi-Timeframe Confirmation System
// Ensures all timeframes align before signal execution

export interface TimeframeData {
  timeframe: 'D1' | 'H4' | 'H1' | 'M15' | 'M5' | 'M1';
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  structure: 'INTACT' | 'BROKEN' | 'FORMING';
  momentum: 'STRONG' | 'WEAK' | 'DIVERGING';
  volume: 'HIGH' | 'NORMAL' | 'LOW';
  keyLevels: {
    support: number[];
    resistance: number[];
    liquidityPools: number[];
  };
  lastUpdate: number;
}

export interface AlignmentResult {
  overallAlignment: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICTED';
  alignedTimeframes: string[];
  conflictingTimeframes: string[];
  dominantTrend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  structuralIntegrity: number; // 0-100
  momentumConfirmation: boolean;
  volumeConfirmation: boolean;
  keyLevelProximity: 'NEAR_RESISTANCE' | 'NEAR_SUPPORT' | 'NEUTRAL' | 'BETWEEN_LEVELS';
  tradingRecommendation: 'EXECUTE' | 'WAIT_FOR_ALIGNMENT' | 'REJECT_CONFLICTED';
  confidence: number;
}

export interface ExecutionWindow {
  optimal: boolean;
  timeframe: 'M1' | 'M5' | 'M15';
  entryType: 'MARKET' | 'LIMIT' | 'STOP';
  urgency: 'IMMEDIATE' | 'WAIT_PULLBACK' | 'WAIT_BREAKOUT';
  expiryMinutes: number;
  reasoning: string;
}

export class MultiTimeframeConfirmation {
  private static readonly ALIGNMENT_WEIGHTS = {
    D1: 0.3,
    H4: 0.25,
    H1: 0.2,
    M15: 0.15,
    M5: 0.07,
    M1: 0.03
  };

  private static readonly MIN_ALIGNMENT_SCORE = 0.75;
  private static readonly STRUCTURE_WEIGHT = 0.4;
  private static readonly MOMENTUM_WEIGHT = 0.35;
  private static readonly VOLUME_WEIGHT = 0.25;

  static analyzeTimeframeAlignment(data: TimeframeData[]): AlignmentResult {
    const result: AlignmentResult = {
      overallAlignment: 'WEAK',
      alignedTimeframes: [],
      conflictingTimeframes: [],
      dominantTrend: 'SIDEWAYS',
      structuralIntegrity: 0,
      momentumConfirmation: false,
      volumeConfirmation: false,
      keyLevelProximity: 'NEUTRAL',
      tradingRecommendation: 'REJECT_CONFLICTED',
      confidence: 0
    };

    if (!data || data.length === 0) {
      return result;
    }

    // 1. Calculate trend alignment
    const trendAnalysis = this.analyzeTrendAlignment(data);
    result.dominantTrend = trendAnalysis.dominant;
    result.alignedTimeframes = trendAnalysis.aligned;
    result.conflictingTimeframes = trendAnalysis.conflicted;

    // 2. Assess structural integrity
    result.structuralIntegrity = this.calculateStructuralIntegrity(data);

    // 3. Check momentum confirmation
    result.momentumConfirmation = this.checkMomentumAlignment(data, result.dominantTrend);

    // 4. Validate volume confirmation
    result.volumeConfirmation = this.validateVolumeSupport(data);

    // 5. Analyze key level proximity
    result.keyLevelProximity = this.analyzeKeyLevelProximity(data);

    // 6. Calculate overall alignment strength
    const alignmentScore = this.calculateAlignmentScore(data, result.dominantTrend);
    result.overallAlignment = this.categorizeAlignment(alignmentScore);

    // 7. Generate trading recommendation
    result.confidence = this.calculateConfidence(result);
    result.tradingRecommendation = this.generateTradingRecommendation(result);

    return result;
  }

  static determineExecutionWindow(alignment: AlignmentResult, currentPrice: number): ExecutionWindow {
    const window: ExecutionWindow = {
      optimal: false,
      timeframe: 'M5',
      entryType: 'MARKET',
      urgency: 'WAIT_PULLBACK',
      expiryMinutes: 30,
      reasoning: 'Default settings'
    };

    // Determine optimal execution based on alignment
    if (alignment.overallAlignment === 'STRONG' && alignment.confidence > 85) {
      window.optimal = true;
      window.timeframe = 'M1';
      window.urgency = 'IMMEDIATE';
      window.expiryMinutes = 10;
      window.reasoning = 'Strong multi-timeframe alignment - immediate execution recommended';
      
      if (alignment.keyLevelProximity === 'NEAR_SUPPORT' || alignment.keyLevelProximity === 'NEAR_RESISTANCE') {
        window.entryType = 'LIMIT';
        window.reasoning += ' - using limit order near key level';
      } else {
        window.entryType = 'MARKET';
      }
    } else if (alignment.overallAlignment === 'MODERATE' && alignment.confidence > 70) {
      window.optimal = true;
      window.timeframe = 'M5';
      window.urgency = 'WAIT_PULLBACK';
      window.expiryMinutes = 20;
      window.entryType = 'LIMIT';
      window.reasoning = 'Moderate alignment - wait for pullback to key level';
    } else if (alignment.overallAlignment === 'WEAK' || alignment.confidence < 60) {
      window.optimal = false;
      window.urgency = 'WAIT_PULLBACK';
      window.expiryMinutes = 60;
      window.reasoning = 'Weak alignment - wait for better setup';
    }

    // Adjust for conflicted timeframes
    if (alignment.conflictingTimeframes.length > 2) {
      window.optimal = false;
      window.urgency = 'WAIT_PULLBACK';
      window.reasoning = 'Too many conflicting timeframes - wait for resolution';
    }

    return window;
  }

  private static analyzeTrendAlignment(data: TimeframeData[]): {
    dominant: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    aligned: string[];
    conflicted: string[];
  } {
    const trendVotes = { BULLISH: 0, BEARISH: 0, SIDEWAYS: 0 };
    const aligned: string[] = [];
    const conflicted: string[] = [];

    // Weight votes by timeframe importance
    data.forEach(tf => {
      const weight = this.ALIGNMENT_WEIGHTS[tf.timeframe] || 0.1;
      trendVotes[tf.trend] += weight;
    });

    // Determine dominant trend
    const dominant = Object.keys(trendVotes).reduce((a, b) => 
      trendVotes[a as keyof typeof trendVotes] > trendVotes[b as keyof typeof trendVotes] ? a : b
    ) as 'BULLISH' | 'BEARISH' | 'SIDEWAYS';

    // Categorize timeframes
    data.forEach(tf => {
      if (tf.trend === dominant) {
        aligned.push(tf.timeframe);
      } else if (tf.trend !== 'SIDEWAYS' && dominant !== 'SIDEWAYS') {
        conflicted.push(tf.timeframe);
      }
    });

    return { dominant, aligned, conflicted };
  }

  private static calculateStructuralIntegrity(data: TimeframeData[]): number {
    let totalIntegrity = 0;
    let weightSum = 0;

    data.forEach(tf => {
      const weight = this.ALIGNMENT_WEIGHTS[tf.timeframe] || 0.1;
      let integrity = 0;

      switch (tf.structure) {
        case 'INTACT': integrity = 100; break;
        case 'FORMING': integrity = 70; break;
        case 'BROKEN': integrity = 30; break;
      }

      totalIntegrity += integrity * weight;
      weightSum += weight;
    });

    return weightSum > 0 ? totalIntegrity / weightSum : 0;
  }

  private static checkMomentumAlignment(data: TimeframeData[], dominantTrend: string): boolean {
    if (dominantTrend === 'SIDEWAYS') return true;

    const relevantTimeframes = data.filter(tf => 
      ['H4', 'H1', 'M15', 'M5'].includes(tf.timeframe)
    );

    const strongMomentum = relevantTimeframes.filter(tf => 
      tf.momentum === 'STRONG'
    ).length;

    const divergingMomentum = relevantTimeframes.filter(tf => 
      tf.momentum === 'DIVERGING'
    ).length;

    return strongMomentum >= 2 && divergingMomentum <= 1;
  }

  private static validateVolumeSupport(data: TimeframeData[]): boolean {
    const higherTimeframes = data.filter(tf => 
      ['D1', 'H4', 'H1'].includes(tf.timeframe)
    );

    const highVolumeCount = higherTimeframes.filter(tf => 
      tf.volume === 'HIGH'
    ).length;

    return highVolumeCount >= Math.ceil(higherTimeframes.length * 0.6);
  }

  private static analyzeKeyLevelProximity(data: TimeframeData[]): AlignmentResult['keyLevelProximity'] {
    // This would need current price to determine proximity
    // For now, simulate based on structure state
    const htfData = data.find(tf => tf.timeframe === 'H4' || tf.timeframe === 'D1');
    
    if (!htfData) return 'NEUTRAL';

    // Simulate proximity analysis
    const hasNearbySupport = htfData.keyLevels.support.length > 0;
    const hasNearbyResistance = htfData.keyLevels.resistance.length > 0;

    if (hasNearbyResistance && !hasNearbySupport) return 'NEAR_RESISTANCE';
    if (hasNearbySupport && !hasNearbyResistance) return 'NEAR_SUPPORT';
    if (hasNearbySupport && hasNearbyResistance) return 'BETWEEN_LEVELS';
    
    return 'NEUTRAL';
  }

  private static calculateAlignmentScore(data: TimeframeData[], dominantTrend: string): number {
    let score = 0;
    let totalWeight = 0;

    data.forEach(tf => {
      const weight = this.ALIGNMENT_WEIGHTS[tf.timeframe] || 0.1;
      let tfScore = 0;

      // Trend alignment score
      if (tf.trend === dominantTrend) tfScore += 40;
      else if (tf.trend === 'SIDEWAYS') tfScore += 20;

      // Structure score
      switch (tf.structure) {
        case 'INTACT': tfScore += 30; break;
        case 'FORMING': tfScore += 20; break;
        case 'BROKEN': tfScore += 5; break;
      }

      // Momentum score
      switch (tf.momentum) {
        case 'STRONG': tfScore += 20; break;
        case 'WEAK': tfScore += 10; break;
        case 'DIVERGING': tfScore += 0; break;
      }

      // Volume score
      switch (tf.volume) {
        case 'HIGH': tfScore += 10; break;
        case 'NORMAL': tfScore += 5; break;
        case 'LOW': tfScore += 0; break;
      }

      score += tfScore * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  private static categorizeAlignment(score: number): AlignmentResult['overallAlignment'] {
    if (score >= 85) return 'STRONG';
    if (score >= 70) return 'MODERATE';
    if (score >= 50) return 'WEAK';
    return 'CONFLICTED';
  }

  private static calculateConfidence(result: AlignmentResult): number {
    let confidence = 0;

    // Base confidence from alignment
    switch (result.overallAlignment) {
      case 'STRONG': confidence += 40; break;
      case 'MODERATE': confidence += 30; break;
      case 'WEAK': confidence += 15; break;
      case 'CONFLICTED': confidence += 5; break;
    }

    // Structural integrity bonus
    confidence += result.structuralIntegrity * 0.25;

    // Momentum confirmation bonus
    if (result.momentumConfirmation) confidence += 15;

    // Volume confirmation bonus
    if (result.volumeConfirmation) confidence += 10;

    // Key level proximity considerations
    if (result.keyLevelProximity === 'NEAR_SUPPORT' || result.keyLevelProximity === 'NEAR_RESISTANCE') {
      confidence += 10;
    }

    // Penalty for conflicts
    confidence -= result.conflictingTimeframes.length * 5;

    return Math.max(0, Math.min(100, confidence));
  }

  private static generateTradingRecommendation(result: AlignmentResult): AlignmentResult['tradingRecommendation'] {
    if (result.confidence >= 80 && result.overallAlignment === 'STRONG') {
      return 'EXECUTE';
    }
    
    if (result.confidence >= 65 && result.overallAlignment !== 'CONFLICTED') {
      return 'WAIT_FOR_ALIGNMENT';
    }
    
    return 'REJECT_CONFLICTED';
  }

  // Utility to create mock timeframe data
  static createMockTimeframeData(symbol: string): TimeframeData[] {
    const timeframes: TimeframeData['timeframe'][] = ['D1', 'H4', 'H1', 'M15', 'M5', 'M1'];
    const trends: TimeframeData['trend'][] = ['BULLISH', 'BEARISH', 'SIDEWAYS'];
    const structures: TimeframeData['structure'][] = ['INTACT', 'BROKEN', 'FORMING'];
    const momentums: TimeframeData['momentum'][] = ['STRONG', 'WEAK', 'DIVERGING'];
    const volumes: TimeframeData['volume'][] = ['HIGH', 'NORMAL', 'LOW'];

    return timeframes.map(tf => ({
      timeframe: tf,
      trend: trends[Math.floor(Math.random() * trends.length)],
      structure: structures[Math.floor(Math.random() * structures.length)],
      momentum: momentums[Math.floor(Math.random() * momentums.length)],
      volume: volumes[Math.floor(Math.random() * volumes.length)],
      keyLevels: {
        support: [1.0850, 1.0820].filter(() => Math.random() > 0.5),
        resistance: [1.0890, 1.0920].filter(() => Math.random() > 0.5),
        liquidityPools: [1.0865, 1.0875].filter(() => Math.random() > 0.3)
      },
      lastUpdate: Date.now()
    }));
  }
}

export const multiTimeframeConfirmation = new MultiTimeframeConfirmation();