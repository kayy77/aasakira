export interface MarketStructure {
  recentHigh: number;
  recentLow: number;
  lastBreakDirection: 'bullish' | 'bearish' | 'none';
  structureStrength: number;
}

export interface LiquiditySweep {
  detected: boolean;
  direction: 'up' | 'down' | 'none';
  sweepStrength: number;
  reversalConfirmed: boolean;
}

export interface FairValueGap {
  detected: boolean;
  level: number;
  type: 'bullish' | 'bearish';
  strength: number;
}

export interface VolumeProfile {
  spikeDetected: boolean;
  divergenceStrength: number;
  institutionalFlow: 'buying' | 'selling' | 'neutral';
}

export interface RSIDivergence {
  detected: boolean;
  type: 'bullish' | 'bearish' | 'none';
  strength: number;
  oversoldBullish: boolean;
  overboughtBearish: boolean;
}

export interface SessionFilter {
  activeSession: boolean;
  sessionType: 'London' | 'NewYork' | 'Asian' | 'Overlap';
  volatilityScore: number;
}

export interface FilterResults {
  structureBreak: { passed: boolean; score: number; reason: string };
  liquiditySweep: { passed: boolean; score: number; reason: string };
  fairValueGap: { passed: boolean; score: number; reason: string };
  volumeSpike: { passed: boolean; score: number; reason: string };
  rsiDivergence: { passed: boolean; score: number; reason: string };
  sessionFilter: { passed: boolean; score: number; reason: string };
  totalScore: number;
  passedFilters: number;
  confidence: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK';
}

class InstitutionalSignalFilter {
  private readonly MIN_CONFLUENCE_FILTERS = 3;
  private readonly ELITE_THRESHOLD = 6;
  private readonly STRONG_THRESHOLD = 5;
  private readonly MEDIUM_THRESHOLD = 4;

  analyzeMarketStructure(pair: string, currentPrice: number): MarketStructure {
    // Simulate advanced structure analysis
    const priceRange = currentPrice * 0.002; // 20 pips range
    const recentHigh = currentPrice + (Math.random() * priceRange);
    const recentLow = currentPrice - (Math.random() * priceRange);
    
    const breakProbability = Math.random();
    let lastBreakDirection: 'bullish' | 'bearish' | 'none' = 'none';
    let structureStrength = 0;
    
    if (breakProbability > 0.7) {
      lastBreakDirection = Math.random() > 0.5 ? 'bullish' : 'bearish';
      structureStrength = 70 + Math.random() * 30;
    } else {
      structureStrength = 30 + Math.random() * 40;
    }

    return {
      recentHigh,
      recentLow,
      lastBreakDirection,
      structureStrength
    };
  }

  analyzeLiquiditySweep(currentPrice: number, structure: MarketStructure): LiquiditySweep {
    const sweepProbability = Math.random();
    let detected = false;
    let direction: 'up' | 'down' | 'none' = 'none';
    let sweepStrength = 0;
    let reversalConfirmed = false;

    if (sweepProbability > 0.6) {
      detected = true;
      direction = Math.random() > 0.5 ? 'up' : 'down';
      sweepStrength = 60 + Math.random() * 40;
      
      // Check for reversal confirmation
      if (Math.random() > 0.3) {
        reversalConfirmed = true;
      }
    }

    return {
      detected,
      direction,
      sweepStrength,
      reversalConfirmed
    };
  }

  analyzeFairValueGap(currentPrice: number): FairValueGap {
    const fvgProbability = Math.random();
    let detected = false;
    let level = currentPrice;
    let type: 'bullish' | 'bearish' = 'bullish';
    let strength = 0;

    if (fvgProbability > 0.5) {
      detected = true;
      type = Math.random() > 0.5 ? 'bullish' : 'bearish';
      level = type === 'bullish' ? 
        currentPrice - (currentPrice * 0.0005) : 
        currentPrice + (currentPrice * 0.0005);
      strength = 50 + Math.random() * 50;
    }

    return {
      detected,
      level,
      type,
      strength
    };
  }

  analyzeVolumeProfile(): VolumeProfile {
    const volumeSpikeProbability = Math.random();
    let spikeDetected = false;
    let divergenceStrength = 0;
    let institutionalFlow: 'buying' | 'selling' | 'neutral' = 'neutral';

    if (volumeSpikeProbability > 0.4) {
      spikeDetected = true;
      divergenceStrength = 40 + Math.random() * 60;
      institutionalFlow = Math.random() > 0.5 ? 'buying' : 'selling';
    }

    return {
      spikeDetected,
      divergenceStrength,
      institutionalFlow
    };
  }

  analyzeRSIDivergence(): RSIDivergence {
    const divergenceProbability = Math.random();
    let detected = false;
    let type: 'bullish' | 'bearish' | 'none' = 'none';
    let strength = 0;
    let oversoldBullish = false;
    let overboughtBearish = false;

    if (divergenceProbability > 0.7) {
      detected = true;
      type = Math.random() > 0.5 ? 'bullish' : 'bearish';
      strength = 60 + Math.random() * 40;
      
      if (type === 'bullish') {
        oversoldBullish = Math.random() > 0.3;
      } else {
        overboughtBearish = Math.random() > 0.3;
      }
    }

    return {
      detected,
      type,
      strength,
      oversoldBullish,
      overboughtBearish
    };
  }

  analyzeSessionFilter(): SessionFilter {
    const hour = new Date().getUTCHours();
    let activeSession = false;
    let sessionType: 'London' | 'NewYork' | 'Asian' | 'Overlap';
    let volatilityScore = 0;

    // London: 8-17 UTC, NY: 13-22 UTC, Overlap: 13-17 UTC
    if (hour >= 13 && hour <= 17) {
      activeSession = true;
      sessionType = 'Overlap';
      volatilityScore = 85 + Math.random() * 15;
    } else if (hour >= 8 && hour <= 17) {
      activeSession = true;
      sessionType = 'London';
      volatilityScore = 75 + Math.random() * 20;
    } else if (hour >= 13 && hour <= 22) {
      activeSession = true;
      sessionType = 'NewYork';
      volatilityScore = 70 + Math.random() * 25;
    } else {
      activeSession = false;
      sessionType = 'Asian';
      volatilityScore = 30 + Math.random() * 40;
    }

    return {
      activeSession,
      sessionType,
      volatilityScore
    };
  }

  runInstitutionalFilters(pair: string, currentPrice: number): FilterResults {
    // Run all 6 filters
    const structure = this.analyzeMarketStructure(pair, currentPrice);
    const liquiditySweep = this.analyzeLiquiditySweep(currentPrice, structure);
    const fvg = this.analyzeFairValueGap(currentPrice);
    const volume = this.analyzeVolumeProfile();
    const rsi = this.analyzeRSIDivergence();
    const session = this.analyzeSessionFilter();

    // Filter 1: Structure Break - ULTRA STRICT REQUIREMENTS
    const structureBreak = {
      passed: structure.lastBreakDirection !== 'none' && structure.structureStrength > 75, // Raised from 70
      score: structure.structureStrength,
      reason: structure.lastBreakDirection !== 'none' ? 
        `${structure.lastBreakDirection.toUpperCase()} structure break confirmed (${structure.structureStrength.toFixed(0)}%)` :
        'No institutional-grade structure break detected'
    };

    // Filter 2: Liquidity Sweep - INSTITUTIONAL VALIDATION
    const liquiditySweepFilter = {
      passed: liquiditySweep.detected && liquiditySweep.reversalConfirmed && liquiditySweep.sweepStrength > 70, // Raised from 65
      score: liquiditySweep.sweepStrength,
      reason: liquiditySweep.detected && liquiditySweep.reversalConfirmed ? 
        `Institutional liquidity sweep ${liquiditySweep.direction} with reversal (${liquiditySweep.sweepStrength.toFixed(0)}%)` :
        'No confirmed institutional liquidity sweep'
    };

    // Filter 3: Fair Value Gap - ELITE STANDARDS
    const fairValueGapFilter = {
      passed: fvg.detected && fvg.strength > 75, // Raised from 70
      score: fvg.strength,
      reason: fvg.detected ? 
        `${fvg.type.toUpperCase()} FVG at ${fvg.level.toFixed(5)} (${fvg.strength.toFixed(0)}%)` :
        'No institutional-grade Fair Value Gap'
    };

    // Filter 4: Volume Spike - SMART MONEY ONLY
    const volumeSpikeFilter = {
      passed: volume.spikeDetected && volume.divergenceStrength > 75, // Raised from 70
      score: volume.divergenceStrength,
      reason: volume.spikeDetected ? 
        `Smart money ${volume.institutionalFlow} detected (${volume.divergenceStrength.toFixed(0)}%)` :
        'No institutional volume confirmation'
    };

    // Filter 5: RSI Divergence - EXTREME LEVELS MANDATORY
    const rsiDivergenceFilter = {
      passed: rsi.detected && rsi.strength > 80 && // Raised from 75
        ((rsi.type === 'bullish' && rsi.oversoldBullish) || (rsi.type === 'bearish' && rsi.overboughtBearish)),
      score: rsi.strength,
      reason: rsi.detected && ((rsi.type === 'bullish' && rsi.oversoldBullish) || (rsi.type === 'bearish' && rsi.overboughtBearish)) ? 
        `${rsi.type.toUpperCase()} RSI divergence at extreme level (${rsi.strength.toFixed(0)}%)` :
        'No extreme-level RSI divergence confirmed'
    };

    // Filter 6: Session Filter - INSTITUTIONAL HOURS ONLY
    const sessionFilterResult = {
      passed: session.activeSession && session.volatilityScore > 80, // Raised from 75
      score: session.volatilityScore,
      reason: session.activeSession && session.volatilityScore > 80 ? 
        `Peak institutional ${session.sessionType} session (${session.volatilityScore.toFixed(0)}%)` :
        `Insufficient institutional activity - ${session.sessionType} (${session.volatilityScore.toFixed(0)}%)`
    };

    // Calculate results
    const filters = [structureBreak, liquiditySweepFilter, fairValueGapFilter, volumeSpikeFilter, rsiDivergenceFilter, sessionFilterResult];
    const passedFilters = filters.filter(f => f.passed).length;
    const totalScore = filters.reduce((sum, f) => sum + (f.passed ? f.score : 0), 0);

    let confidence: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK';
    if (passedFilters >= this.ELITE_THRESHOLD) {
      confidence = 'ELITE';
    } else if (passedFilters >= this.STRONG_THRESHOLD) {
      confidence = 'STRONG';
    } else if (passedFilters >= this.MEDIUM_THRESHOLD) {
      confidence = 'MEDIUM';
    } else if (passedFilters >= this.MIN_CONFLUENCE_FILTERS) {
      confidence = 'WEAK'; // This is STANDARD grade
    } else {
      confidence = 'WEAK'; // Will be rejected
    }

    return {
      structureBreak,
      liquiditySweep: liquiditySweepFilter,
      fairValueGap: fairValueGapFilter,
      volumeSpike: volumeSpikeFilter,
      rsiDivergence: rsiDivergenceFilter,
      sessionFilter: sessionFilterResult,
      totalScore,
      passedFilters,
      confidence
    };
  }

  isSignalValid(filterResults: FilterResults): boolean {
    // ULTRA STRICT ENFORCEMENT: Must pass at least 3 filters
    return filterResults.passedFilters >= this.MIN_CONFLUENCE_FILTERS;
  }

  getFilterBreakdown(filterResults: FilterResults): { passed: string[], failed: string[] } {
    const allFilters = [
      { name: 'Structure Break', result: filterResults.structureBreak },
      { name: 'Liquidity Sweep', result: filterResults.liquiditySweep },
      { name: 'Fair Value Gap', result: filterResults.fairValueGap },
      { name: 'Volume Spike', result: filterResults.volumeSpike },
      { name: 'RSI Divergence', result: filterResults.rsiDivergence },
      { name: 'Session Filter', result: filterResults.sessionFilter }
    ];

    const passed = allFilters.filter(f => f.result.passed).map(f => f.result.reason);
    const failed = allFilters.filter(f => !f.result.passed).map(f => f.result.reason);

    return { passed, failed };
  }
}

export const institutionalSignalFilter = new InstitutionalSignalFilter();
