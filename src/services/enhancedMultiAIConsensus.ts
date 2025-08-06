
import { EnhancedSignal } from './enhancedEliteSignalEngine';

export interface EnhancedAIModelResponse {
  model: string;
  direction: 'BUY' | 'SELL';
  confidence: number;
  expected_value: number;
  rr_ratio: number;
  analysis: string;
  valid: boolean;
  signal_strength: 'Weak' | 'Moderate' | 'Strong' | 'Exceptional';
}

export interface ConsensusSignalResult {
  direction: 'BULLISH' | 'BEARISH';
  weightedConfidence: number;
  averageEV: number;
  averageRR: number;
  consensusStrength: 'WEAK' | 'MODERATE' | 'STRONG' | 'EXCEPTIONAL';
  topPerformingModel: string;
  agreementPercentage: number;
  conflictingModels: string[];
  reasoning: string;
  hasConsensus: boolean;
  signalStrength: 'WEAK' | 'MODERATE' | 'STRONG' | 'EXCEPTIONAL' | 'ELITE';
  finalGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  processingStages: {
    structuralPass: boolean;
    aiConsensusPass: boolean;
    outcomePass: boolean;
    finalApproved: boolean;
  };
  recommendation: 'AVOID' | 'WATCH_ONLY' | 'TAKE' | 'REDUCE_SIZE';
  consensusCount: number;
  totalModels: number;
  scanDetails: {
    successfulModels: number;
    failedModels: string[];
  };
}

const AI_MODELS = {
  groq: { weight: 0.30, role: 'structural_analysis' },
  gemini: { weight: 0.25, role: 'trend_confirmation' },
  openai: { weight: 0.20, role: 'risk_assessment' },
  cohere: { weight: 0.15, role: 'volume_analysis' },
  together: { weight: 0.10, role: 'entry_timing' }
};

interface AIModelResponse {
  model: string;
  direction: 'BULLISH' | 'BEARISH';
  confidence: number;
  expectedValue: number;
  riskReward: number;
  reasoning: string;
  weight: number;
}

export class EnhancedMultiAIConsensusEngine {
  private static instance: EnhancedMultiAIConsensusEngine;
  private lastScanTime: Date | null = null;
  private scanCount = 0;

  static getInstance(): EnhancedMultiAIConsensusEngine {
    if (!EnhancedMultiAIConsensusEngine.instance) {
      EnhancedMultiAIConsensusEngine.instance = new EnhancedMultiAIConsensusEngine();
    }
    return EnhancedMultiAIConsensusEngine.instance;
  }

  async scanForHighQualitySignals(pair?: string, livePrice?: number): Promise<ConsensusSignalResult> {
    this.scanCount++;
    this.lastScanTime = new Date();
    
    try {
      // Simulate AI model responses
      const aiResponses = await this.generateAIResponses();
      
      // Calculate consensus
      const consensus = this.calculateConsensus(aiResponses);
      
      return consensus;
    } catch (error) {
      console.error('Enhanced consensus scan failed:', error);
      return this.getFailedResult();
    }
  }

  private async generateAIResponses(): Promise<AIModelResponse[]> {
    const responses: AIModelResponse[] = [];
    
    // Simulate different AI model responses with more realistic consensus
    const models = Object.entries(AI_MODELS);
    const shouldHaveConsensus = Math.random() > 0.4; // 60% chance of consensus
    const consensusDirection = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
    
    for (const [modelName, config] of models) {
      const direction = shouldHaveConsensus && Math.random() > 0.3 
        ? consensusDirection 
        : (Math.random() > 0.5 ? 'BULLISH' : 'BEARISH');
      
      const response: AIModelResponse = {
        model: modelName,
        direction,
        confidence: 60 + Math.random() * 35, // 60-95%
        expectedValue: 0.8 + Math.random() * 2.2, // 0.8-3.0
        riskReward: 1.5 + Math.random() * 2.5, // 1.5:1 to 4:1
        reasoning: this.generateReasoning(modelName, config.role),
        weight: config.weight
      };
      
      responses.push(response);
    }
    
    return responses;
  }

  private generateReasoning(model: string, role: string): string {
    const reasoningMap = {
      'structural_analysis': 'Strong institutional order block identified with valid FVG alignment',
      'trend_confirmation': 'Multi-timeframe alignment confirms directional bias with BOS',
      'risk_assessment': 'Risk-reward ratio favorable with clear invalidation level at liquidity',
      'volume_analysis': 'Volume profile supports directional movement with smart money flow',
      'entry_timing': 'Entry timing aligns with session open and optimal volatility window'
    };
    
    return reasoningMap[role as keyof typeof reasoningMap] || 'Standard analysis confirms signal validity';
  }

  private calculateConsensus(responses: AIModelResponse[]): ConsensusSignalResult {
    const bullishVotes = responses.filter(r => r.direction === 'BULLISH');
    const bearishVotes = responses.filter(r => r.direction === 'BEARISH');
    
    const weightedBullish = bullishVotes.reduce((sum, r) => sum + r.weight, 0);
    const weightedBearish = bearishVotes.reduce((sum, r) => sum + r.weight, 0);
    
    const direction = weightedBullish > weightedBearish ? 'BULLISH' : 'BEARISH';
    const dominantVotes = direction === 'BULLISH' ? bullishVotes : bearishVotes;
    
    const weightedConfidence = dominantVotes.reduce((sum, r) => sum + (r.confidence * r.weight), 0) / 
                              dominantVotes.reduce((sum, r) => sum + r.weight, 0);
    
    const averageEV = dominantVotes.reduce((sum, r) => sum + r.expectedValue, 0) / dominantVotes.length;
    const averageRR = dominantVotes.reduce((sum, r) => sum + r.riskReward, 0) / dominantVotes.length;
    
    const agreementPercentage = Math.max(weightedBullish, weightedBearish) * 100;
    
    const conflictingModels = responses
      .filter(r => r.direction !== direction)
      .map(r => r.model);
    
    const consensusStrength = this.determineConsensusStrength(weightedConfidence, agreementPercentage);
    const signalStrength = consensusStrength === 'EXCEPTIONAL' ? 'ELITE' : consensusStrength;
    const hasConsensus = agreementPercentage >= 60 && weightedConfidence >= 70;
    
    const finalGrade = this.calculateGrade(weightedConfidence, averageEV, agreementPercentage);
    
    const processingStages = {
      structuralPass: true,
      aiConsensusPass: hasConsensus,
      outcomePass: averageEV > 1.0,
      finalApproved: hasConsensus && averageEV > 1.0
    };
    
    const recommendation = this.getRecommendation(consensusStrength, hasConsensus);
    
    return {
      direction,
      weightedConfidence,
      averageEV,
      averageRR,
      consensusStrength,
      topPerformingModel: dominantVotes[0]?.model || 'groq',
      agreementPercentage,
      conflictingModels,
      reasoning: dominantVotes.map(r => r.reasoning).join('; '),
      hasConsensus,
      signalStrength,
      finalGrade,
      processingStages,
      recommendation,
      consensusCount: dominantVotes.length,
      totalModels: responses.length,
      scanDetails: {
        successfulModels: responses.length,
        failedModels: []
      }
    };
  }

  private determineConsensusStrength(confidence: number, agreement: number): 'WEAK' | 'MODERATE' | 'STRONG' | 'EXCEPTIONAL' {
    if (confidence >= 85 && agreement >= 80) return 'EXCEPTIONAL';
    if (confidence >= 75 && agreement >= 70) return 'STRONG';
    if (confidence >= 65 && agreement >= 60) return 'MODERATE';
    return 'WEAK';
  }

  private calculateGrade(confidence: number, ev: number, agreement: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    const score = (confidence * 0.4) + (ev * 10 * 0.3) + (agreement * 0.3);
    
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private getRecommendation(strength: string, hasConsensus: boolean): 'AVOID' | 'WATCH_ONLY' | 'TAKE' | 'REDUCE_SIZE' {
    if (!hasConsensus) return 'AVOID';
    if (strength === 'EXCEPTIONAL') return 'TAKE';
    if (strength === 'STRONG') return 'TAKE';
    if (strength === 'MODERATE') return 'REDUCE_SIZE';
    return 'WATCH_ONLY';
  }

  private getFailedResult(): ConsensusSignalResult {
    return {
      direction: 'BULLISH',
      weightedConfidence: 0,
      averageEV: 0,
      averageRR: 0,
      consensusStrength: 'WEAK',
      topPerformingModel: 'none',
      agreementPercentage: 0,
      conflictingModels: [],
      reasoning: 'Scan failed - no AI models responded',
      hasConsensus: false,
      signalStrength: 'WEAK',
      finalGrade: 'F',
      processingStages: {
        structuralPass: false,
        aiConsensusPass: false,
        outcomePass: false,
        finalApproved: false
      },
      recommendation: 'AVOID',
      consensusCount: 0,
      totalModels: 5,
      scanDetails: {
        successfulModels: 0,
        failedModels: ['groq', 'gemini', 'openai', 'cohere', 'together']
      }
    };
  }

  getScanStats() {
    return {
      scanCount: this.scanCount,
      lastScanTime: this.lastScanTime?.toLocaleTimeString() || 'Never'
    };
  }
}

// Export singleton instance
export const enhancedMultiAIConsensus = EnhancedMultiAIConsensusEngine.getInstance();
