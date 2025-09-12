// 🎯 HIGH-CONVICTION SETUP ENGINE - Quality over Quantity
// Implements scoring, ranking, and AI explanations for trading setups

import { groqService } from '../groqService';

export interface SetupFilter {
  name: string;
  points: number;
  detected: boolean;
  timeframe?: string;
  details?: string;
}

export interface SetupScore {
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  grade: 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW';
  rank: number;
}

export interface MarketSetup {
  id: string;
  symbol: string;
  setupType: string;
  direction: 'BUY' | 'SELL';
  timestamp: number;
  
  // Scoring system
  filters: SetupFilter[];
  score: SetupScore;
  
  // Price levels
  keyLevels: {
    entry: number;
    stopLoss: number;
    takeProfit: number;
    currentPrice: number;
  };
  
  // Multi-timeframe confirmation
  timeframes: {
    primary: string;
    confirmation: string[];
    conflicting: string[];
  };
  
  // AI Analysis
  explanation: {
    why: string;
    nextStep: string;
    riskWarning: string;
    confidence: number;
  };
  
  // Quality metrics
  quality: {
    multiTFConfirmation: boolean;
    volumeConfirmation: boolean;
    structureAlignment: boolean;
    liquidityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

export interface SetupScanResult {
  timestamp: number;
  totalScanned: number;
  qualitySetups: MarketSetup[];
  rejectedCount: number;
  noSetupsReason?: string;
  scanDuration: number;
}

class HighConvictionSetupEngine {
  private readonly SCORING_CRITERIA = {
    STRUCTURE_BREAK: 25,
    LIQUIDITY_SWEEP: 20,
    FVG: 15,
    VOLUME_SPIKE: 15,
    RSI_DIVERGENCE: 10,
    MULTI_TF_CONFLUENCE: 30,
    SESSION_QUALITY: 10,
    NEWS_CLEAR: 5
  };

  private readonly QUALITY_THRESHOLDS = {
    ELITE: 85,
    HIGH: 70,
    MEDIUM: 55,
    MINIMUM: 60 // Don't show setups below this
  };

  async scanForHighConvictionSetups(): Promise<SetupScanResult> {
    const startTime = Date.now();
    console.log('🔍 High-Conviction Setup Scanner: Starting quality-focused scan...');

    try {
      // Step 1: Generate raw setup candidates
      const candidates = await this.generateSetupCandidates();
      
      // Step 2: Score and rank each candidate
      const scoredSetups = await this.scoreAndRankSetups(candidates);
      
      // Step 3: Filter by minimum quality threshold
      const qualitySetups = scoredSetups.filter(
        setup => setup.score.totalPoints >= this.QUALITY_THRESHOLDS.MINIMUM
      );
      
      // Step 4: Limit to top 3 setups
      const topSetups = qualitySetups.slice(0, 3);
      
      // Step 5: Generate AI explanations for each setup
      const setupsWithExplanations = await this.generateSetupExplanations(topSetups);
      
      const scanDuration = Date.now() - startTime;
      const rejectedCount = candidates.length - topSetups.length;

      console.log(`✅ Scan complete: ${topSetups.length} quality setups found, ${rejectedCount} rejected (${scanDuration}ms)`);

      return {
        timestamp: Date.now(),
        totalScanned: candidates.length,
        qualitySetups: setupsWithExplanations,
        rejectedCount,
        noSetupsReason: topSetups.length === 0 ? 'No setups met minimum quality threshold (60+ points)' : undefined,
        scanDuration
      };

    } catch (error) {
      console.error('Setup scan failed:', error);
      return {
        timestamp: Date.now(),
        totalScanned: 0,
        qualitySetups: [],
        rejectedCount: 0,
        noSetupsReason: 'Scanner temporarily unavailable',
        scanDuration: Date.now() - startTime
      };
    }
  }

  private async generateSetupCandidates(): Promise<Partial<MarketSetup>[]> {
    // Simulated setup detection - in real implementation, this would analyze price data
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'BTCUSD'];
    const candidates: Partial<MarketSetup>[] = [];

    for (const symbol of symbols) {
      // Generate 1-2 potential setups per symbol with randomized but realistic data
      const setupCount = Math.random() > 0.7 ? 2 : Math.random() > 0.3 ? 1 : 0;
      
      for (let i = 0; i < setupCount; i++) {
        const direction = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const currentPrice = this.getSimulatedPrice(symbol);
        
        candidates.push({
          id: `${symbol}_${direction}_${Date.now()}_${i}`,
          symbol,
          direction: direction as 'BUY' | 'SELL',
          setupType: this.randomSetupType(),
          timestamp: Date.now(),
          keyLevels: this.generateKeyLevels(symbol, currentPrice, direction),
          timeframes: this.generateTimeframeData(),
          quality: this.generateQualityMetrics()
        });
      }
    }

    return candidates;
  }

  private async scoreAndRankSetups(candidates: Partial<MarketSetup>[]): Promise<MarketSetup[]> {
    const scoredSetups: MarketSetup[] = [];

    for (const candidate of candidates) {
      const filters = this.evaluateSetupFilters(candidate);
      const score = this.calculateSetupScore(filters);
      
      scoredSetups.push({
        ...candidate,
        filters,
        score,
        explanation: {
          why: '',
          nextStep: '',
          riskWarning: '',
          confidence: 0
        }
      } as MarketSetup);
    }

    // Sort by score (highest first)
    scoredSetups.sort((a, b) => b.score.totalPoints - a.score.totalPoints);
    
    // Assign ranks
    scoredSetups.forEach((setup, index) => {
      setup.score.rank = index + 1;
    });

    return scoredSetups;
  }

  private evaluateSetupFilters(setup: Partial<MarketSetup>): SetupFilter[] {
    const filters: SetupFilter[] = [];

    // Simulate realistic filter detection based on setup quality
    const baseQuality = setup.quality?.structureAlignment ? 0.8 : 0.5;

    // Structure Break (25 points)
    filters.push({
      name: 'Structure Break',
      points: this.SCORING_CRITERIA.STRUCTURE_BREAK,
      detected: Math.random() < baseQuality * 0.9,
      timeframe: '15m',
      details: 'Clean break of previous high/low with momentum'
    });

    // Liquidity Sweep (20 points)
    filters.push({
      name: 'Liquidity Sweep',
      points: this.SCORING_CRITERIA.LIQUIDITY_SWEEP,
      detected: Math.random() < baseQuality * 0.7,
      timeframe: '1h',
      details: 'Swept liquidity pool with strong rejection'
    });

    // Fair Value Gap (15 points)
    filters.push({
      name: 'Fair Value Gap',
      points: this.SCORING_CRITERIA.FVG,
      detected: Math.random() < baseQuality * 0.8,
      timeframe: '15m',
      details: 'Unfilled gap aligning with bias'
    });

    // Volume Spike (15 points)
    filters.push({
      name: 'Volume Spike',
      points: this.SCORING_CRITERIA.VOLUME_SPIKE,
      detected: Math.random() < baseQuality * 0.6,
      details: '200%+ volume increase at key level'
    });

    // RSI Divergence (10 points)
    filters.push({
      name: 'RSI Divergence',
      points: this.SCORING_CRITERIA.RSI_DIVERGENCE,
      detected: Math.random() < baseQuality * 0.5,
      timeframe: '1h',
      details: 'Hidden divergence confirming bias'
    });

    // Multi-TF Confluence (30 points)
    filters.push({
      name: 'Multi-TF Confluence',
      points: this.SCORING_CRITERIA.MULTI_TF_CONFLUENCE,
      detected: setup.timeframes?.confirmation?.length >= 2,
      details: `${setup.timeframes?.confirmation?.length || 0} timeframes confirming`
    });

    // Session Quality (10 points)
    filters.push({
      name: 'Session Quality',
      points: this.SCORING_CRITERIA.SESSION_QUALITY,
      detected: Math.random() < 0.8, // Most sessions are tradeable
      details: 'Active trading session with good liquidity'
    });

    // News Clear (5 points)
    filters.push({
      name: 'News Clear',
      points: this.SCORING_CRITERIA.NEWS_CLEAR,
      detected: Math.random() < 0.9, // Usually clear
      details: 'No high-impact news in next 2 hours'
    });

    return filters;
  }

  private calculateSetupScore(filters: SetupFilter[]): SetupScore {
    const totalPoints = filters
      .filter(f => f.detected)
      .reduce((sum, f) => sum + f.points, 0);
    
    const maxPossiblePoints = filters.reduce((sum, f) => sum + f.points, 0);
    const percentage = Math.round((totalPoints / maxPossiblePoints) * 100);
    
    let grade: 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW';
    if (percentage >= this.QUALITY_THRESHOLDS.ELITE) grade = 'ELITE';
    else if (percentage >= this.QUALITY_THRESHOLDS.HIGH) grade = 'HIGH';
    else if (percentage >= this.QUALITY_THRESHOLDS.MEDIUM) grade = 'MEDIUM';
    else grade = 'LOW';

    return {
      totalPoints,
      maxPossiblePoints,
      percentage,
      grade,
      rank: 0 // Will be set during ranking
    };
  }

  private async generateSetupExplanations(setups: MarketSetup[]): Promise<MarketSetup[]> {
    const setupsWithExplanations = [...setups];

    for (const setup of setupsWithExplanations) {
      try {
        const explanation = await this.generateAISetupExplanation(setup);
        setup.explanation = explanation;
      } catch (error) {
        console.error(`Failed to generate explanation for ${setup.symbol}:`, error);
        setup.explanation = {
          why: `${setup.symbol} shows ${setup.setupType.toLowerCase()} setup with ${setup.score.grade.toLowerCase()} probability`,
          nextStep: `Monitor price action around ${setup.keyLevels.entry} level`,
          riskWarning: 'Educational analysis only - not financial advice',
          confidence: setup.score.percentage
        };
      }
    }

    return setupsWithExplanations;
  }

  private async generateAISetupExplanation(setup: MarketSetup): Promise<{
    why: string;
    nextStep: string;
    riskWarning: string;
    confidence: number;
  }> {
    const detectedFilters = setup.filters.filter(f => f.detected);
    const setupStrength = setup.score.grade;
    
    const prompt = `You are an expert ICT/SMC trader analyzing a ${setup.symbol} ${setup.direction} setup.

SETUP DETAILS:
- Setup Type: ${setup.setupType}
- Direction: ${setup.direction}
- Score: ${setup.score.totalPoints}/${setup.score.maxPossiblePoints} (${setup.score.percentage}% - ${setup.score.grade})
- Entry: ${setup.keyLevels.entry}
- Current: ${setup.keyLevels.currentPrice}

DETECTED CONFLUENCES:
${detectedFilters.map(f => `✅ ${f.name} (${f.points}pts): ${f.details || 'Confirmed'}`).join('\n')}

TIMEFRAME ANALYSIS:
- Primary: ${setup.timeframes.primary}
- Confirming: ${setup.timeframes.confirmation.join(', ') || 'None'}
- Conflicting: ${setup.timeframes.conflicting.join(', ') || 'None'}

Provide a concise professional analysis in exactly this format:

WHY: [1-2 sentences explaining why this setup matters - mention key confluences]
NEXT: [1 sentence - specific price level or action to watch]
RISK: [1 sentence warning about what could invalidate this]

Keep it under 200 words total. Be direct and educational. No fluff.`;

    try {
      const response = await groqService.generateResponse(prompt, {
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 300
      });

      // Parse the structured response
      const lines = response.split('\n').filter(line => line.trim());
      let why = '', nextStep = '', riskWarning = '';
      
      for (const line of lines) {
        if (line.startsWith('WHY:')) {
          why = line.substring(4).trim();
        } else if (line.startsWith('NEXT:')) {
          nextStep = line.substring(5).trim();
        } else if (line.startsWith('RISK:')) {
          riskWarning = line.substring(5).trim();
        }
      }

      // Fallbacks if parsing fails
      if (!why || !nextStep || !riskWarning) {
        const sentences = response.split('. ');
        why = why || sentences[0] || `${setup.symbol} shows ${setupStrength.toLowerCase()} probability setup`;
        nextStep = nextStep || sentences[1] || `Watch price action around ${setup.keyLevels.entry}`;
        riskWarning = riskWarning || sentences[2] || 'Educational analysis only - not financial advice';
      }

      return {
        why,
        nextStep,
        riskWarning,
        confidence: setup.score.percentage
      };

    } catch (error) {
      console.error('AI explanation generation failed:', error);
      throw error;
    }
  }

  // Helper methods for simulation
  private randomSetupType(): string {
    const types = [
      'Liquidity Sweep',
      'Fair Value Gap',
      'Order Block',
      'Breaker Block',
      'Market Structure Shift',
      'Institutional Candle'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getSimulatedPrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'XAUUSD': 2340.00,
      'US30': 38500,
      'BTCUSD': 65000
    };
    
    const base = basePrices[symbol] || 1.0000;
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    return Number((base * (1 + variation)).toFixed(symbol.includes('JPY') ? 2 : 4));
  }

  private generateKeyLevels(symbol: string, currentPrice: number, direction: 'BUY' | 'SELL') {
    let pipValue = symbol.includes('JPY') ? 0.01 : 0.0001;
    if (symbol === 'XAUUSD') pipValue = 0.1;
    if (symbol === 'US30') pipValue = 1;
    if (symbol === 'BTCUSD') pipValue = 10;

    const entryOffset = (Math.random() * 10 + 5) * pipValue; // 5-15 pips
    const slOffset = (Math.random() * 20 + 15) * pipValue; // 15-35 pips
    const tpOffset = (Math.random() * 40 + 30) * pipValue; // 30-70 pips

    if (direction === 'BUY') {
      return {
        entry: Number((currentPrice + entryOffset).toFixed(symbol.includes('JPY') ? 2 : 4)),
        stopLoss: Number((currentPrice - slOffset).toFixed(symbol.includes('JPY') ? 2 : 4)),
        takeProfit: Number((currentPrice + tpOffset).toFixed(symbol.includes('JPY') ? 2 : 4)),
        currentPrice
      };
    } else {
      return {
        entry: Number((currentPrice - entryOffset).toFixed(symbol.includes('JPY') ? 2 : 4)),
        stopLoss: Number((currentPrice + slOffset).toFixed(symbol.includes('JPY') ? 2 : 4)),
        takeProfit: Number((currentPrice - tpOffset).toFixed(symbol.includes('JPY') ? 2 : 4)),
        currentPrice
      };
    }
  }

  private generateTimeframeData() {
    const allTimeframes = ['5m', '15m', '1h', '4h', 'D1'];
    const confirming: string[] = [];
    const conflicting: string[] = [];
    
    for (const tf of allTimeframes) {
      const rand = Math.random();
      if (rand > 0.7) confirming.push(tf);
      else if (rand < 0.2) conflicting.push(tf);
    }

    return {
      primary: '15m',
      confirmation: confirming,
      conflicting: conflicting
    };
  }

  private generateQualityMetrics() {
    return {
      multiTFConfirmation: Math.random() > 0.3,
      volumeConfirmation: Math.random() > 0.4,
      structureAlignment: Math.random() > 0.2,
      liquidityLevel: (['HIGH', 'MEDIUM', 'LOW'] as const)[Math.floor(Math.random() * 3)]
    };
  }
}

export const highConvictionSetupEngine = new HighConvictionSetupEngine();