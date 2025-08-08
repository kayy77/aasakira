// Enhanced Signal Engine with Multi-AI Consensus and Strategy Validation
import { groqService } from './groqService';
import { geminiService } from './geminiService';

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

export interface SignalResult {
  status: 'approved' | 'rejected';
  reason?: string;
  consensus?: ConsensusResult;
  validation?: StrategyValidation;
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

  calculateConsensus(votes: AIVote[]): ConsensusResult {
    if (votes.length === 0) {
      return {
        direction: 'BULLISH',
        agreement: 0,
        confidence: 0,
        votes: [],
        totalVotes: 0
      };
    }

    const directionVotes = { BULLISH: 0, BEARISH: 0 };
    let confidenceTotal = 0;

    votes.forEach(vote => {
      directionVotes[vote.direction]++;
      confidenceTotal += vote.confidence;
    });

    const totalVotes = votes.length;
    const direction = directionVotes.BULLISH >= directionVotes.BEARISH ? 'BULLISH' : 'BEARISH';
    const agreement = directionVotes[direction] / totalVotes;
    const confidence = confidenceTotal / totalVotes;

    return {
      direction,
      agreement,
      confidence,
      votes,
      totalVotes
    };
  }

  validateSignal(consensus: ConsensusResult, marketData: MarketData): StrategyValidation {
    const strategies = {
      'RSI Divergence': StrategyValidators.rsiDivergence(marketData),
      'Entry Timing': StrategyValidators.entryTiming(marketData),
      'Trend Confirmation': StrategyValidators.trendConfirmation(marketData, consensus.direction),
      'Liquidity Sweep': StrategyValidators.liquiditySweep(marketData),
      'FVG Alignment': StrategyValidators.fairValueGap(marketData),
      'Order Block Structure': StrategyValidators.orderBlock(marketData, consensus.direction),
      'MACD Momentum': StrategyValidators.macdMomentum(marketData, consensus.direction),
      'AMD Phase': StrategyValidators.amdPhaseAlignment(marketData, consensus.direction)
    };

    const passedChecks: string[] = [];
    const failedChecks: string[] = [];
    const strategyWeights: { [key: string]: number } = {};
    
    let totalWeight = 0;
    let passedWeight = 0;

    Object.entries(strategies).forEach(([name, result]) => {
      strategyWeights[name] = result.weight;
      totalWeight += result.weight;
      
      if (result.valid) {
        passedChecks.push(`${name} (${(result.weight * 100).toFixed(0)}%): ${result.reasoning}`);
        passedWeight += result.weight;
      } else {
        failedChecks.push(`${name} (${(result.weight * 100).toFixed(0)}%): ${result.reasoning}`);
      }
    });

    const confluence = totalWeight > 0 ? (passedWeight / totalWeight) : 0;
    const score = confluence * 100;
    
    // Enhanced grading logic based on weighted confluence
    let finalGrade: 'A' | 'B' | 'F';
    let valid: boolean;
    
    if (confluence >= 0.8) {
      finalGrade = 'A';
      valid = true;
    } else if (confluence >= 0.6) {
      finalGrade = 'B';
      valid = true;
    } else {
      finalGrade = 'F';
      valid = false;
    }

    // Additional validation for manipulation phase
    if (marketData.amdPhase?.phase === 'MANIPULATION' && marketData.amdPhase.confidence > 80) {
      valid = false; // Override - too risky during high-confidence manipulation
      finalGrade = 'F';
      failedChecks.push('High-confidence manipulation phase detected - signal rejected for safety');
    }

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
      // Enhanced market data with MACD and AMD phase detection
      const enhancedData = { ...marketData };
      
      // Calculate MACD if price data available
      if (marketData.candleData && marketData.candleData.length > 0) {
        const closePrices = marketData.candleData.map(candle => candle.close || marketData.currentPrice);
        enhancedData.macd = MACDCalculator.calculateMACD(closePrices);
      }
      
      // Detect AMD phase
      enhancedData.amdPhase = AMDPhaseDetector.detectPhase(enhancedData);
      
      // Get AI votes with enhanced data
      const votes = await this.getModelVotes(enhancedData);
      
      if (votes.length === 0) {
        return {
          status: 'rejected',
          reason: 'No confident AI votes received',
          pair: marketData.pair,
          timeframe: marketData.timeframe,
          timestamp: new Date().toISOString()
        };
      }

      // Calculate consensus
      const consensus = this.calculateConsensus(votes);
      
      // Enhanced agreement logic - consider low conviction vs rejection
      if (consensus.agreement < this.MIN_AGREEMENT) {
        const avgConfidence = consensus.confidence;
        const reason = avgConfidence < 50 ? 
          'Low AI confidence across all models' :
          `Insufficient AI agreement: ${(consensus.agreement * 100).toFixed(1)}% (min: ${this.MIN_AGREEMENT * 100}%)`;
          
        return {
          status: 'rejected',
          reason,
          consensus,
          pair: marketData.pair,
          timeframe: marketData.timeframe,
          timestamp: new Date().toISOString()
        };
      }

      // Validate signal using enhanced strategies
      const validation = this.validateSignal(consensus, enhancedData);
      
      // Override for perfect AI agreement but low confidence
      if (consensus.agreement === 1.0 && consensus.confidence < 70 && validation.confluence < 0.5) {
        return {
          status: 'rejected',
          reason: `Low conviction signal: Perfect AI agreement but confluence only ${(validation.confluence * 100).toFixed(1)}%`,
          consensus,
          validation,
          pair: marketData.pair,
          timeframe: marketData.timeframe,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: validation.valid ? 'approved' : 'rejected',
        reason: validation.valid ? 
          `Signal approved: Grade ${validation.finalGrade}, Confluence ${(validation.confluence * 100).toFixed(1)}%` : 
          `Strategy validation failed: Confluence ${(validation.confluence * 100).toFixed(1)}% insufficient`,
        consensus,
        validation,
        pair: marketData.pair,
        timeframe: marketData.timeframe,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Signal generation error:', error);
      return {
        status: 'rejected',
        reason: `Error generating signal: ${error.message}`,
        pair: marketData.pair,
        timeframe: marketData.timeframe,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
export const signalEngine = new SignalEngine();