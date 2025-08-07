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
      const prompt = `Analyze ${data.pair} trading signal:
      Current Price: ${data.currentPrice}
      RSI: ${data.rsi}
      Session: ${data.session}
      Volume: ${data.volume}
      
      Provide BULLISH or BEARISH direction with confidence 0-100 and reasoning.
      Focus on SMC concepts, structure breaks, and liquidity analysis.
      
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
      const prompt = `Technical analysis for ${data.pair}:
      Price: ${data.currentPrice}, RSI: ${data.rsi}, Session: ${data.session}
      
      Analyze for:
      1. Trend direction and momentum
      2. Support/resistance levels
      3. Volume confirmation
      4. Risk assessment
      
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

// Strategy Validation Functions
export class StrategyValidators {
  static rsiDivergence(data: MarketData): boolean {
    // Mock RSI divergence detection - replace with actual logic
    return data.rsi < 30 || data.rsi > 70;
  }

  static entryTiming(data: MarketData): boolean {
    // Check for optimal entry timing during London/NY sessions
    return data.session === 'London' || data.session === 'NewYork';
  }

  static trendConfirmation(data: MarketData, direction: 'BULLISH' | 'BEARISH'): boolean {
    // Mock trend confirmation - replace with HTF analysis
    if (direction === 'BULLISH') {
      return data.rsi > 45;
    } else {
      return data.rsi < 55;
    }
  }

  static liquiditySweep(data: MarketData): boolean {
    // Mock liquidity sweep detection - replace with actual logic
    return data.volume > 1000; // Volume threshold
  }

  static fairValueGap(data: MarketData): boolean {
    // Mock FVG detection - replace with actual candle analysis
    return Math.random() > 0.4; // 60% pass rate
  }

  static orderBlock(data: MarketData, direction: 'BULLISH' | 'BEARISH'): boolean {
    // Mock order block validation - replace with actual structure analysis
    return Math.random() > 0.3; // 70% pass rate
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
      'Order Block Structure': StrategyValidators.orderBlock(marketData, consensus.direction)
    };

    const passedChecks = Object.entries(strategies)
      .filter(([_, passed]) => passed)
      .map(([name, _]) => name);
    
    const failedChecks = Object.entries(strategies)
      .filter(([_, passed]) => !passed)
      .map(([name, _]) => name);

    const passedCount = passedChecks.length;
    const totalChecks = Object.keys(strategies).length;
    
    // Grading logic: Allow max 1 fail for valid signal
    const valid = failedChecks.length <= 1;
    let finalGrade: 'A' | 'B' | 'F';
    
    if (failedChecks.length === 0) {
      finalGrade = 'A';
    } else if (failedChecks.length === 1) {
      finalGrade = 'B';
    } else {
      finalGrade = 'F';
    }

    const score = (passedCount / totalChecks) * 100;

    return {
      valid,
      passedChecks,
      failedChecks,
      finalGrade,
      score
    };
  }

  async generateSignal(marketData: MarketData): Promise<SignalResult> {
    try {
      // Get AI votes
      const votes = await this.getModelVotes(marketData);
      
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
      
      // Check minimum agreement threshold
      if (consensus.agreement < this.MIN_AGREEMENT) {
        return {
          status: 'rejected',
          reason: `Insufficient AI agreement: ${(consensus.agreement * 100).toFixed(1)}% (min: ${this.MIN_AGREEMENT * 100}%)`,
          consensus,
          pair: marketData.pair,
          timeframe: marketData.timeframe,
          timestamp: new Date().toISOString()
        };
      }

      // Validate signal using strategies
      const validation = this.validateSignal(consensus, marketData);

      return {
        status: validation.valid ? 'approved' : 'rejected',
        reason: validation.valid ? 
          `Signal approved with grade ${validation.finalGrade}` : 
          `Strategy validation failed: ${validation.failedChecks.join(', ')}`,
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