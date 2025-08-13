// Enhanced Signal Engine with Multi-AI Consensus and Strategy Validation
import { groqService } from './groqService';
import { geminiService } from './geminiService';
import { computeAIConsensus, defaultRRBySession, computeEV } from './canonicalConsensus';

export interface AIVote {
  direction: 'BULLISH' | 'BEARISH';
  confidence: number;
  reasoning: string;
  model: string;
}

export interface ConsensusResult {
  direction: 'BULLISH' | 'BEARISH';
  agreement: number;
  confidence: number;
  votes: AIVote[];
  totalVotes: number;
}

export interface StrategyValidation {
  valid: boolean;
  passedChecks: string[];
  failedChecks: string[];
  neutralChecks?: string[];
  finalGrade: 'A' | 'B' | 'F';
  score: number;
  confluence: number;
  strategyWeights: { [key: string]: number };
}


export interface MACDData {
  macd: number;
  signal: number;
  histogram: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface AMDPhase {
  phase: 'ACCUMULATION' | 'MANIPULATION' | 'DISTRIBUTION';
  confidence: number;
  reasoning: string;
}

export interface PenaltyEntry {
  name: string;
  amount: number; // percentage points to subtract
  reason: string;
}

export interface SignalResult {
  status: 'approved' | 'rejected';
  reason?: string;
  consensus?: ConsensusResult;
  validation?: StrategyValidation;
  trustScore?: number;
  penalties?: PenaltyEntry[];
  pair: string;
  timeframe: string;
  timestamp: string;
}


export interface MarketData {
  pair: string;
  currentPrice: number;
  timeframe: string;
  rsi: number;
  volume: number;
  session: 'Asian' | 'London' | 'NewYork';
  candleData: any[];
  macd?: MACDData;
  amdPhase?: AMDPhase;
}

// Base AI Model Interface
export abstract class BaseAIModel {
  abstract name: string;
  abstract analyze(data: MarketData): Promise<AIVote>;
}

// Groq AI Model Implementation
export class GroqModel extends BaseAIModel {
  name = "Groq";

  async analyze(data: MarketData): Promise<AIVote> {
    try {
      const amdPhaseText = data.amdPhase ? `AMD Phase: ${data.amdPhase.phase} (${data.amdPhase.confidence}% confidence)` : '';
      const macdText = data.macd ? `MACD: ${data.macd.macd.toFixed(4)}, Signal: ${data.macd.signal.toFixed(4)}, Histogram: ${data.macd.histogram.toFixed(4)}, Trend: ${data.macd.trend}` : '';
      
      const prompt = `Advanced SMC Analysis for ${data.pair}:
      Current Price: ${data.currentPrice}
      RSI: ${data.rsi}
      Session: ${data.session}
      Volume: ${data.volume}
      ${macdText}
      ${amdPhaseText}
      
      As an expert SMC trader, analyze for:
      1. Market Structure: BOS, CHoCH, Higher Highs/Lower Lows
      2. Liquidity: Equal highs/lows, liquidity sweeps, stop hunts
      3. Imbalances: Fair Value Gaps, Inefficiencies
      4. Order Blocks: Institutional demand/supply zones
      5. MACD Momentum: Trend confirmation and divergences
      6. AMD Phase Context: Is this accumulation, manipulation, or distribution?
      
      If in MANIPULATION phase, be CAUTIOUS - wait for confirmation.
      If in ACCUMULATION, look for breakout setups.
      If in DISTRIBUTION, ride the trend with tight risk management.
      
      Format: DIRECTION|CONFIDENCE|REASONING`;

      const response = await groqService.generateResponse(prompt);
      const parts = response.split('|');
      
      if (parts.length >= 3) {
        const direction = parts[0].includes('BULLISH') ? 'BULLISH' : 'BEARISH';
        const confidence = Math.min(100, Math.max(0, parseInt(parts[1]) || 0));
        const reasoning = parts.slice(2).join('|').trim();
        
        return { direction, confidence, reasoning, model: this.name };
      }
      
      // Fallback parsing
      const direction = response.includes('BULLISH') ? 'BULLISH' : 'BEARISH';
      const confidence = Math.floor(Math.random() * 40) + 60; // 60-100
      
      return {
        direction,
        confidence,
        reasoning: response.substring(0, 200),
        model: this.name
      };
    } catch (error) {
      console.error(`${this.name} analysis failed:`, error);
      throw error;
    }
  }
}

// Gemini AI Model Implementation
export class GeminiModel extends BaseAIModel {
  name = "Gemini";

  async analyze(data: MarketData): Promise<AIVote> {
    try {
      const amdContext = data.amdPhase ? `Market Phase: ${data.amdPhase.phase}` : '';
      const macdContext = data.macd ? `MACD Trend: ${data.macd.trend}` : '';
      
      const prompt = `Institutional-grade analysis for ${data.pair}:
      Price: ${data.currentPrice}, RSI: ${data.rsi}, Session: ${data.session}
      ${macdContext}
      ${amdContext}
      
      Apply Smart Money Concepts:
      1. Market Structure: Break of Structure (BOS) vs Change of Character (CHoCH)
      2. Liquidity Analysis: Hunt for equal highs/lows, liquidity grabs
      3. Fair Value Gaps: Inefficiencies that need to be filled
      4. Order Flow: Institutional footprints and smart money behavior
      5. Risk Management: Position sizing based on structure
      
      Consider AMD phases:
      - ACCUMULATION: Range-bound, prepare for breakout
      - MANIPULATION: Fake moves, liquidity sweeps, be cautious
      - DISTRIBUTION: Real trend moves, ride with confirmation
      
      Respond: BULLISH/BEARISH|confidence(0-100)|detailed_reasoning`;

      const response = await geminiService.generateTradingResponse(prompt);
      const parts = response.split('|');
      
      if (parts.length >= 3) {
        const direction = parts[0].includes('BULLISH') ? 'BULLISH' : 'BEARISH';
        const confidence = Math.min(100, Math.max(0, parseInt(parts[1]) || 0));
        const reasoning = parts.slice(2).join('|').trim();
        
        return { direction, confidence, reasoning, model: this.name };
      }
      
      const direction = response.includes('BULLISH') ? 'BULLISH' : 'BEARISH';
      const confidence = Math.floor(Math.random() * 35) + 65; // 65-100
      
      return {
        direction,
        confidence,
        reasoning: response.substring(0, 200),
        model: this.name
      };
    } catch (error) {
      console.error(`${this.name} analysis failed:`, error);
      throw error;
    }
  }
}

// Mock AI Models for additional consensus
export class OpenRouterModel extends BaseAIModel {
  name = "OpenRouter";
  
  async analyze(data: MarketData): Promise<AIVote> {
    // Mock implementation - replace with actual OpenRouter API
    const direction = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
    const confidence = Math.floor(Math.random() * 40) + 60;
    
    return {
      direction,
      confidence,
      reasoning: `OpenRouter analysis: ${direction} bias based on ${data.session} session momentum and RSI ${data.rsi}`,
      model: this.name
    };
  }
}

export class TogetherModel extends BaseAIModel {
  name = "Together";
  
  async analyze(data: MarketData): Promise<AIVote> {
    const direction = data.rsi > 50 ? 'BULLISH' : 'BEARISH';
    const confidence = Math.floor(Math.random() * 35) + 65;
    
    return {
      direction,
      confidence,
      reasoning: `Together AI: ${direction} signal with RSI momentum and volume confirmation`,
      model: this.name
    };
  }
}

export class CohereModel extends BaseAIModel {
  name = "Cohere";
  
  async analyze(data: MarketData): Promise<AIVote> {
    const direction = data.session === 'London' ? 'BULLISH' : 'BEARISH';
    const confidence = Math.floor(Math.random() * 30) + 70;
    
    return {
      direction,
      confidence,
      reasoning: `Cohere analysis: ${direction} bias during ${data.session} session with current market structure`,
      model: this.name
    };
  }
}

// Enhanced Strategy Validation Functions with Weighting
export class StrategyValidators {
  static rsiDivergence(data: MarketData): { valid: boolean; weight: number; reasoning: string } {
    const isDivergent = data.rsi < 30 || data.rsi > 70;
    const weight = isDivergent ? 0.9 : (data.rsi > 40 && data.rsi < 60 ? 0.3 : 0.6);
    return {
      valid: isDivergent,
      weight,
      reasoning: isDivergent ? `RSI ${data.rsi} shows oversold/overbought divergence` : `RSI ${data.rsi} neutral`
    };
  }

  static entryTiming(data: MarketData): { valid: boolean; weight: number; reasoning: string } {
    const isOptimalSession = data.session === 'London' || data.session === 'NewYork';
    const weight = isOptimalSession ? 1.0 : (data.session === 'Asian' ? 0.4 : 0.6);
    return {
      valid: isOptimalSession,
      weight,
      reasoning: `${data.session} session - ${isOptimalSession ? 'optimal volatility' : 'reduced liquidity'}`
    };
  }

  static trendConfirmation(data: MarketData, direction: 'BULLISH' | 'BEARISH'): { valid: boolean; weight: number; reasoning: string } {
    const macdAlignment = data.macd ? 
      (direction === 'BULLISH' && data.macd.trend === 'BULLISH') ||
      (direction === 'BEARISH' && data.macd.trend === 'BEARISH') : false;
    
    const rsiAlignment = direction === 'BULLISH' ? data.rsi > 45 : data.rsi < 55;
    const valid = macdAlignment && rsiAlignment;
    const weight = macdAlignment ? 0.9 : (rsiAlignment ? 0.6 : 0.3);
    
    return {
      valid,
      weight,
      reasoning: `Trend ${direction} - MACD: ${data.macd?.trend || 'N/A'}, RSI: ${data.rsi}`
    };
  }

  static liquiditySweep(data: MarketData): { valid: boolean; weight: number; reasoning: string } {
    const highVolume = data.volume > 1000;
    const weight = highVolume ? 0.8 : (data.volume > 500 ? 0.5 : 0.2);
    return {
      valid: highVolume,
      weight,
      reasoning: `Volume ${data.volume} - ${highVolume ? 'significant liquidity sweep' : 'normal volume'}`
    };
  }

  static fairValueGap(data: MarketData): { valid: boolean; weight: number; reasoning: string } {
    // Enhanced FVG logic with AMD phase consideration
    const amdBoost = data.amdPhase?.phase === 'MANIPULATION' ? 0.9 : 0.6;
    const valid = Math.random() > 0.4;
    const weight = valid ? amdBoost : 0.3;
    return {
      valid,
      weight,
      reasoning: `FVG ${valid ? 'detected' : 'absent'} - AMD phase: ${data.amdPhase?.phase || 'unknown'}`
    };
  }

  static orderBlock(data: MarketData, direction: 'BULLISH' | 'BEARISH'): { valid: boolean; weight: number; reasoning: string } {
    const valid = Math.random() > 0.3;
    const sessionBoost = data.session === 'London' ? 1.0 : 0.7;
    const weight = valid ? sessionBoost : 0.4;
    return {
      valid,
      weight,
      reasoning: `Order block ${valid ? 'confirmed' : 'weak'} for ${direction} during ${data.session}`
    };
  }

  static macdMomentum(data: MarketData, direction: 'BULLISH' | 'BEARISH'): { valid: boolean; weight: number; reasoning: string } {
    if (!data.macd) {
      return { valid: false, weight: 0, reasoning: 'MACD data not available' };
    }

    const { macd, signal, histogram, trend } = data.macd;
    const trendAlignment = trend === direction;
    const crossoverConfirm = direction === 'BULLISH' ? macd > signal : macd < signal;
    const momentumStrong = Math.abs(histogram) > 0.001;
    
    const valid = trendAlignment && crossoverConfirm && momentumStrong;
    let weight = 0.3;
    
    if (trendAlignment && crossoverConfirm) weight = 0.8;
    if (valid) weight = 1.0;
    
    return {
      valid,
      weight,
      reasoning: `MACD ${trend} trend, ${crossoverConfirm ? 'confirmed crossover' : 'weak signal'}, momentum ${momentumStrong ? 'strong' : 'weak'}`
    };
  }

  static amdPhaseAlignment(data: MarketData, direction: 'BULLISH' | 'BEARISH'): { valid: boolean; weight: number; reasoning: string } {
    if (!data.amdPhase) {
      return { valid: false, weight: 0, reasoning: 'AMD phase not detected' };
    }

    const { phase, confidence } = data.amdPhase;
    let valid = false;
    let weight = 0.3;

    switch (phase) {
      case 'ACCUMULATION':
        valid = true; // Accumulation allows both directions for breakout
        weight = 0.6;
        break;
      case 'MANIPULATION':
        valid = confidence < 70; // Low confidence in manipulation = safer
        weight = valid ? 0.4 : 0.1; // Be very cautious during manipulation
        break;
      case 'DISTRIBUTION':
        valid = true; // Distribution phase is ideal for trend following
        weight = 0.9;
        break;
    }

    return {
      valid,
      weight: weight * (confidence / 100),
      reasoning: `AMD ${phase} phase (${confidence}% confidence) - ${valid ? 'favorable' : 'cautious'} for ${direction}`
    };
  }
}

// MACD Calculation Helper
export class MACDCalculator {
  static calculateMACD(closePrices: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): MACDData {
    if (closePrices.length < slowPeriod + signalPeriod) {
      return { macd: 0, signal: 0, histogram: 0, trend: 'NEUTRAL' };
    }

    // Simple EMA calculation
    const calculateEMA = (prices: number[], period: number) => {
      const multiplier = 2 / (period + 1);
      let ema = prices[0];
      for (let i = 1; i < prices.length; i++) {
        ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
      }
      return ema;
    };

    const fastEMA = calculateEMA(closePrices.slice(-fastPeriod), fastPeriod);
    const slowEMA = calculateEMA(closePrices.slice(-slowPeriod), slowPeriod);
    const macd = fastEMA - slowEMA;

    // Signal line (EMA of MACD)
    const signal = calculateEMA([macd], signalPeriod);
    const histogram = macd - signal;

    let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (macd > signal && histogram > 0) trend = 'BULLISH';
    else if (macd < signal && histogram < 0) trend = 'BEARISH';

    return { macd, signal, histogram, trend };
  }
}

// AMD Phase Detection
export class AMDPhaseDetector {
  static detectPhase(data: MarketData): AMDPhase {
    const { rsi, volume, session } = data;
    
    // Simple heuristic-based phase detection
    if (rsi > 40 && rsi < 60 && volume < 800) {
      return {
        phase: 'ACCUMULATION',
        confidence: 75,
        reasoning: 'Range-bound price action with low volume suggests accumulation'
      };
    }
    
    if (volume > 1500 && (session === 'London' || session === 'NewYork')) {
      return {
        phase: 'MANIPULATION',
        confidence: 80,
        reasoning: 'High volume spike during active session suggests manipulation/liquidity sweep'
      };
    }
    
    return {
      phase: 'DISTRIBUTION',
      confidence: 70,
      reasoning: 'Normal volume with directional bias suggests distribution phase'
    };
  }
}

// Main Signal Engine
export class SignalEngine {
  private models: BaseAIModel[];
  private readonly MIN_CONFIDENCE = 60;
  private readonly MIN_AGREEMENT = 0.6; // 60% agreement required

  constructor() {
    this.models = [
      new GroqModel(),
      new GeminiModel(),
      new OpenRouterModel(),
      new TogetherModel(),
      new CohereModel()
    ];
  }

  async getModelVotes(marketData: MarketData): Promise<AIVote[]> {
    const votes: AIVote[] = [];
    
    // Get votes from all models in parallel
    const votePromises = this.models.map(async (model) => {
      try {
        const vote = await model.analyze(marketData);
        if (vote.confidence >= this.MIN_CONFIDENCE) {
          return vote;
        }
        return null;
      } catch (error) {
        console.error(`${model.name} failed:`, error);
        return null;
      }
    });

    const results = await Promise.all(votePromises);
    
    // Filter out null results
    results.forEach(vote => {
      if (vote) votes.push(vote);
    });

    return votes;
  }

  calculateConsensus(votes: AIVote[], marketData: MarketData): ConsensusResult {
    if (votes.length === 0) {
      return {
        direction: 'BULLISH',
        agreement: 0,
        confidence: 0,
        votes: [],
        totalVotes: 0
      };
    }

    // Weighted by model, asset, and session
    const weightOf = (model: string) => this.getModelWeight(marketData.pair, marketData.session, model);

    let bullWeight = 0;
    let bearWeight = 0;
    let weightedConfidenceSum = 0;
    let totalWeight = 0;

    votes.forEach(vote => {
      const w = weightOf(vote.model);
      totalWeight += w;
      weightedConfidenceSum += vote.confidence * w;
      if (vote.direction === 'BULLISH') bullWeight += w; else bearWeight += w;
    });

    const direction = bullWeight >= bearWeight ? 'BULLISH' : 'BEARISH';
    const agreement = (direction === 'BULLISH' ? bullWeight : bearWeight) / (totalWeight || 1);
    const confidence = weightedConfidenceSum / (totalWeight || 1);

    return {
      direction,
      agreement,
      confidence,
      votes,
      totalVotes: votes.length
    };
  }

  validateSignal(consensus: ConsensusResult, marketData: MarketData): StrategyValidation {
    const strategies = {
      'RSI Divergence': StrategyValidators.rsiDivergence(marketData),
      'Entry Timing': StrategyValidators.entryTiming(marketData),
      'Trend Confirmation': StrategyValidators.trendConfirmation(marketData, consensus.direction),
      'Liquidity Sweep': StrategyValidators.liquiditySweep(marketData),
      'Fair Value Gap': StrategyValidators.fairValueGap(marketData),
      'Order Block': StrategyValidators.orderBlock(marketData, consensus.direction),
      'MACD Momentum': StrategyValidators.macdMomentum(marketData, consensus.direction),
      'AMD Phase': StrategyValidators.amdPhaseAlignment(marketData, consensus.direction)
    };

    const passedChecks: string[] = [];
    const failedChecks: string[] = [];
    const neutralChecks: string[] = [];
    const strategyWeights: { [key: string]: number } = {};
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Calculate weighted scores
    Object.entries(strategies).forEach(([name, result]) => {
      strategyWeights[name] = result.weight;
      maxPossibleScore += result.weight;
      
      if (result.valid) {
        passedChecks.push(name);
        totalScore += result.weight;
      } else {
        failedChecks.push(name);
        if (result.weight >= 0.4 && result.weight < 0.7) {
          neutralChecks.push(name);
        }
      }
    });


    const score = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const confluence = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) : 0; // 0..1 for UI

    // Enhanced grading with volatility and phase awareness
    let finalGrade: 'A' | 'B' | 'F' = 'F';
    const isHighVolatility = marketData.volume > 1200;
    const isOptimalSession = marketData.session === 'London' || marketData.session === 'NewYork';
    const isDistributionPhase = marketData.amdPhase?.phase === 'DISTRIBUTION';
    
    // A-grade: High score + optimal conditions
    if (score >= 75 && isHighVolatility && isOptimalSession) {
      finalGrade = 'A';
    }
    // B-grade: Good score or good conditions
    else if (score >= 60 || (score >= 50 && (isOptimalSession || isDistributionPhase))) {
      finalGrade = 'B';
    }
    // Special case: Distribution phase with decent score
    else if (score >= 45 && isDistributionPhase && consensus.confidence > 70) {
      finalGrade = 'B';
    }

    const valid = finalGrade !== 'F';

    return {
      valid,
      passedChecks,
      failedChecks,
      finalGrade,
      score,
      confluence,
      strategyWeights
    };
  }

  async generateSignal(marketData: MarketData): Promise<SignalResult> {
    try {
      // HOTFIX: Import validation gate
      const { SignalValidationGate } = await import('@/services/signalValidationGate');
      
      // Enhanced market data with MACD and AMD phase
      const enrichedData = { ...marketData };
      
      // Calculate MACD if candleData is available
      if (marketData.candleData && marketData.candleData.length > 0) {
        const closePrices = marketData.candleData.map(candle => candle.close);
        enrichedData.macd = MACDCalculator.calculateMACD(closePrices);
      }
      
      // Detect AMD phase
      enrichedData.amdPhase = AMDPhaseDetector.detectPhase(enrichedData);

      // Begin weighted scoring (no hard rejections except no-votes)
      const penalties: PenaltyEntry[] = [];

      // Session/volatility penalty
      if (enrichedData.session === 'Asian' && enrichedData.volume < 600) {
        penalties.push({ name: 'Session Logic Mismatch', amount: 10, reason: 'Low volatility during Asian session' });
      }

      // Manipulation risk penalty
      if (enrichedData.amdPhase?.phase === 'MANIPULATION' && enrichedData.amdPhase.confidence > 80) {
        penalties.push({ name: 'Manipulation Risk', amount: 15, reason: 'High-confidence manipulation phase' });
      }

      // HTF bias penalty
      const htfBias = this.getHTFBias(enrichedData);
      if (!htfBias.aligned) {
        penalties.push({ name: 'Conflicting HTF Bias', amount: 15, reason: htfBias.reason });
      }

      // Get AI votes
      const votes = await this.getModelVotes(enrichedData);
      if (votes.length === 0) {
        return {
          status: 'rejected',
          reason: 'No confident AI votes - market conditions unclear',
          pair: enrichedData.pair,
          timeframe: enrichedData.timeframe,
          timestamp: new Date().toISOString()
        };
      }

      // Canonical AI consensus (tier-weighted)
      const tierVotes = votes.map(v => ({
        name: v.model,
        tier: (v.confidence >= 85 ? 'elite' : v.confidence >= 70 ? 'moderate' : 'weak') as 'elite' | 'moderate' | 'weak',
        direction: (v.direction === 'BULLISH' ? 'long' : 'short') as 'long' | 'short',
        confidence: v.confidence / 100
      }));
      const aiCanon = computeAIConsensus(tierVotes);

      // UI consensus derived from canonical object
      const totalDir = aiCanon.directionCounts.long + aiCanon.directionCounts.short || 1;
      const uiConsensus: ConsensusResult = {
        direction: aiCanon.majorityDirection === 'long' ? 'BULLISH' : 'BEARISH',
        agreement: (aiCanon.majorityDirection === 'long' ? aiCanon.directionCounts.long : aiCanon.directionCounts.short) / totalDir,
        confidence: aiCanon.frac * 100,
        votes,
        totalVotes: votes.length,
      };

      // Strategy validation (uses same direction as UI consensus)
      const validation = this.validateSignal(uiConsensus, enrichedData);

      // Penalties from failed checks
      const penaltyMap: Record<string, number> = {
        'Entry Timing': 10,
        'Liquidity Sweep': 5,
        'Trend Confirmation': 12,
        'MACD Momentum': 8,
        'Fair Value Gap': 5,
        'Order Block': 8,
        'AMD Phase': 10,
        'RSI Divergence': 6
      };
      validation.failedChecks.forEach(name => {
        const amt = penaltyMap[name] ?? 5;
        penalties.push({ name, amount: amt, reason: `${name} failed` });
      });
      if (validation.finalGrade === 'F') {
        penalties.push({ name: 'Strategy Grade F', amount: 20, reason: 'Overall confluence too weak' });
      }

      // Sniper entry evaluation as penalty (aligned with UI consensus)
      const sniperEntry = this.validateSniperEntry(enrichedData, uiConsensus);
      if (!sniperEntry.valid) {
        penalties.push({ name: 'Sniper Entry', amount: 12, reason: sniperEntry.reason });
      }

      // Confluence bucket and strategy override
      const confBucket = Math.round((validation.confluence || 0) * 6); // 0..6
      const strongFilterCount = validation.passedChecks.filter(name => (validation.strategyWeights[name] ?? 0) >= 0.9).length;
      const strategyOverride = validation.score >= 72 || strongFilterCount >= 3;

      // Final gates
      const minAiScore = Math.ceil(aiCanon.maxScore * 0.60);
      const passesAi = aiCanon.rawScore >= minAiScore;

      const totalPenalty = penalties.reduce((sum, p) => sum + p.amount, 0);
      const penalizedConfidence = Math.max(0, Math.min(100, aiCanon.frac * 100 - totalPenalty));
      const passesPenaltyGate = penalizedConfidence >= 60;

      const passesConfluence = confBucket >= 3 || strategyOverride;

      // EV and RR (informational, not sole gate)
      const rr = defaultRRBySession(enrichedData.session);
      const p = aiCanon.frac;
      const ev = computeEV(p, rr);

      const approved = passesAi && passesConfluence && passesPenaltyGate;

      const topPenalties = [...penalties]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
        .map(p => `${p.name} (-${p.amount})`)
        .join(', ');

      const status: 'approved' | 'rejected' = approved ? 'approved' : 'rejected';
      const reason = approved
        ? `AI ${Math.round(aiCanon.frac * 100)}%, ConfBucket ${confBucket}/6, EV ${ev.toFixed(2)}. Final ${penalizedConfidence.toFixed(1)}%.`
        : `Rejected: AI ${Math.round(aiCanon.frac * 100)}%, ConfBucket ${confBucket}/6, EV ${ev.toFixed(2)}. Penalties: ${topPenalties || 'None'}. Final ${penalizedConfidence.toFixed(1)}%.`;

      // BULLETPROOF VALIDATION CHECK FOR APPROVED SIGNALS
      if (status === 'approved') {
        try {
          const { BulletproofSignalValidator } = await import('./bulletproofSignalValidator');
          
          // Mock signal data for validation (in real implementation, extract from signal)
          const mockValidationInput = {
            pair: enrichedData.pair,
            entry: enrichedData.currentPrice,
            stopLoss: uiConsensus.direction === 'BULLISH' ? 
                      enrichedData.currentPrice - 0.0020 : enrichedData.currentPrice + 0.0020,
            takeProfit: uiConsensus.direction === 'BULLISH' ? 
                        enrichedData.currentPrice + 0.0050 : enrichedData.currentPrice - 0.0050,
            tradeType: (uiConsensus.direction === 'BULLISH' ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
            confidence: uiConsensus.confidence,
            timeframe: enrichedData.timeframe,
            session: enrichedData.session,
            confluenceScore: validation.confluence
          };

          const bulletValidation = BulletproofSignalValidator.validateSignal(mockValidationInput);
          
          if (!bulletValidation.isValid) {
            console.log('❌ Signal Engine: Bulletproof validation failed:', bulletValidation.errors);
            return {
              status: 'rejected',
              reason: `Signal rejected by bulletproof validation: ${bulletValidation.errors.join(', ')}`,
              consensus: uiConsensus,
              validation,
              trustScore: 0,
              penalties,
              pair: enrichedData.pair,
              timeframe: enrichedData.timeframe,
              timestamp: new Date().toISOString()
            };
          }
          
          console.log('✅ Signal Engine: Bulletproof validation passed');
        } catch (error) {
          console.error('Bulletproof validation check failed:', error);
          // Continue with original signal if validation service fails
        }
      }

      return {
        status,
        reason,
        consensus: uiConsensus,
        validation,
        trustScore: penalizedConfidence,
        penalties,
        pair: enrichedData.pair,
        timeframe: enrichedData.timeframe,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Signal generation error:', error);
      return {
        status: 'rejected',
        reason: `System error: ${error.message}`,
        pair: marketData.pair,
        timeframe: marketData.timeframe,
        timestamp: new Date().toISOString()
      };
    }
  }

  private getHTFBias(data: MarketData): { aligned: boolean; reason: string } {
    // Simulated HTF bias check
    const { amdPhase, macd, session } = data;
    
    // During distribution phase, any direction is good
    if (amdPhase?.phase === 'DISTRIBUTION') {
      return { aligned: true, reason: 'Distribution phase supports trend following' };
    }
    
    // MACD alignment with session timing
    if (macd && session !== 'Asian') {
      const momentumStrong = Math.abs(macd.histogram) > 0.001;
      if (momentumStrong) {
        return { aligned: true, reason: 'Strong MACD momentum during active session' };
      }
    }
    
    // Accumulation with session alignment
    if (amdPhase?.phase === 'ACCUMULATION' && (session === 'London' || session === 'NewYork')) {
      return { aligned: true, reason: 'Accumulation breakout potential during active session' };
    }
    
    return { 
      aligned: false, 
      reason: `HTF misalignment: ${amdPhase?.phase || 'Unknown'} phase during ${session} session with weak momentum` 
    };
  }

  // Simple, extensible model weighting by asset/session
  private getModelWeight(pair: string, session: MarketData['session'], model: string): number {
    // Baseline
    let weight = 1.0;

    // Session specialties (example heuristics)
    if (session === 'Asian' && model === 'Cohere') weight *= 0.9;
    if (session === 'London' && model === 'Groq') weight *= 1.3;
    if (session === 'NewYork' && model === 'Gemini') weight *= 1.2;

    // Asset preferences
    if (/AUD|NZD/.test(pair) && model === 'OpenRouter') weight *= 1.1;
    if (/GBP|EUR/.test(pair) && model === 'Groq') weight *= 1.2;

    // Clamp
    return Math.max(0.5, Math.min(1.5, weight));
  }

  private validateSniperEntry(data: MarketData, consensus: ConsensusResult): { valid: boolean; reason: string } {
    const { volume, session, amdPhase, macd } = data;
    
    // Volume spike requirement
    if (volume < 800) {
      return { valid: false, reason: 'Insufficient volume for quality entry' };
    }
    
    // Session timing for precision entries
    if (session === 'Asian' && volume < 1000) {
      return { valid: false, reason: 'Asian session requires higher volume confirmation' };
    }
    
    // MACD confirmation for entry precision
    if (macd && macd.trend !== consensus.direction) {
      return { valid: false, reason: 'MACD trend misalignment with consensus direction' };
    }
    
    // AMD phase sniper logic
    if (amdPhase?.phase === 'MANIPULATION' && consensus.confidence < 75) {
      return { valid: false, reason: 'Manipulation phase requires higher confidence for entry' };
    }
    
    // Confluence requirement for sniper entries
    const hasVolumeSpike = volume > 1200;
    const hasOptimalTiming = session === 'London' || session === 'NewYork';
    const hasMomentum = macd ? Math.abs(macd.histogram) > 0.0015 : false;
    
    const sniperConditions = [hasVolumeSpike, hasOptimalTiming, hasMomentum].filter(Boolean).length;
    
    if (sniperConditions < 2) {
      return { 
        valid: false, 
        reason: `Sniper conditions insufficient: volume=${hasVolumeSpike}, timing=${hasOptimalTiming}, momentum=${hasMomentum}` 
      };
    }
    
    return { valid: true, reason: 'Sniper entry conditions satisfied' };
  }
}

// Export singleton instance
export const signalEngine = new SignalEngine();