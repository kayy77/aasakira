
import { EnhancedAIModelResponse } from './enhancedMultiAIConsensus';

export interface WeightedAIAnalysis {
  direction: 'BUY' | 'SELL' | 'CONFLICT';
  weightedConfidence: number;
  averageEV: number;
  averageRR: number;
  consensusStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICT';
  topModel: string;
  modelAgreement: number;
  conflictingModels: string[];
  reasoning: string;
}

export interface AIModelWeights {
  Groq: number;
  Gemini: number;
  Cohere: number;
  Claude: number;
  Mixtral: number;
}

class AISignalValidator {
  private readonly MODEL_WEIGHTS: AIModelWeights = {
    Groq: 0.5,      // Highest weight - best performance
    Gemini: 0.2,    // Second tier
    Cohere: 0.1,    // Supporting models
    Claude: 0.1,
    Mixtral: 0.1
  };

  validateAIConsensus(aiResponses: EnhancedAIModelResponse[]): WeightedAIAnalysis {
    console.log(`🤖 AI Signal Validation: ${aiResponses.length} models analyzed`);
    
    // Filter out invalid and fallback responses
    const validResponses = aiResponses.filter(r => 
      r.valid && 
      r.model !== 'FALLBACK' && 
      r.confidence >= 60 &&
      r.expected_value >= 0.8
    );

    console.log(`✅ Valid AI responses: ${validResponses.length}/${aiResponses.length}`);

    if (validResponses.length < 2) {
      return {
        direction: 'CONFLICT',
        weightedConfidence: 0,
        averageEV: 0,
        averageRR: 0,
        consensusStrength: 'CONFLICT',
        topModel: 'NONE',
        modelAgreement: 0,
        conflictingModels: aiResponses.map(r => r.model),
        reasoning: 'Insufficient valid AI responses for consensus'
      };
    }

    // Calculate weighted metrics
    const weightedMetrics = this.calculateWeightedMetrics(validResponses);
    
    // Analyze directional consensus
    const directionAnalysis = this.analyzeDirectionalConsensus(validResponses);
    
    // Determine consensus strength
    const consensusStrength = this.determineConsensusStrength(
      weightedMetrics, 
      directionAnalysis, 
      validResponses.length
    );

    const topModel = this.findTopPerformingModel(validResponses);

    console.log(`🎯 AI Consensus: ${consensusStrength} | Direction: ${directionAnalysis.direction} | Top Model: ${topModel}`);

    return {
      direction: directionAnalysis.direction,
      weightedConfidence: weightedMetrics.confidence,
      averageEV: weightedMetrics.expectedValue,
      averageRR: weightedMetrics.riskReward,
      consensusStrength,
      topModel,
      modelAgreement: directionAnalysis.agreementPercentage,
      conflictingModels: directionAnalysis.conflictingModels,
      reasoning: this.generateConsensusReasoning(validResponses, consensusStrength)
    };
  }

  private calculateWeightedMetrics(responses: EnhancedAIModelResponse[]) {
    let totalWeight = 0;
    let weightedConfidence = 0;
    let weightedEV = 0;
    let weightedRR = 0;

    responses.forEach(response => {
      const weight = this.MODEL_WEIGHTS[response.model as keyof AIModelWeights] || 0.05;
      totalWeight += weight;
      weightedConfidence += response.confidence * weight;
      weightedEV += response.expected_value * weight;
      weightedRR += response.rr_ratio * weight;
    });

    return {
      confidence: totalWeight > 0 ? weightedConfidence / totalWeight : 0,
      expectedValue: totalWeight > 0 ? weightedEV / totalWeight : 0,
      riskReward: totalWeight > 0 ? weightedRR / totalWeight : 0
    };
  }

  private analyzeDirectionalConsensus(responses: EnhancedAIModelResponse[]) {
    const directions = responses.map(r => r.direction);
    const buyVotes = directions.filter(d => d === 'BUY').length;
    const sellVotes = directions.filter(d => d === 'SELL').length;
    const noTradeVotes = directions.filter(d => d === 'NO_TRADE').length;

    const totalVotes = directions.length;
    const agreementPercentage = Math.max(buyVotes, sellVotes) / totalVotes * 100;

    let consensusDirection: 'BUY' | 'SELL' | 'CONFLICT';
    let conflictingModels: string[] = [];

    if (buyVotes > sellVotes && agreementPercentage >= 60) {
      consensusDirection = 'BUY';
      conflictingModels = responses.filter(r => r.direction !== 'BUY').map(r => r.model);
    } else if (sellVotes > buyVotes && agreementPercentage >= 60) {
      consensusDirection = 'SELL';
      conflictingModels = responses.filter(r => r.direction !== 'SELL').map(r => r.model);
    } else {
      consensusDirection = 'CONFLICT';
      conflictingModels = responses.map(r => r.model);
    }

    return {
      direction: consensusDirection,
      agreementPercentage,
      conflictingModels
    };
  }

  private determineConsensusStrength(
    metrics: any, 
    directionAnalysis: any, 
    validModelCount: number
  ): 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICT' {
    
    if (directionAnalysis.direction === 'CONFLICT') {
      return 'CONFLICT';
    }

    // Strong consensus requirements
    if (
      validModelCount >= 4 &&
      metrics.confidence >= 80 &&
      metrics.expectedValue >= 1.3 &&
      directionAnalysis.agreementPercentage >= 80
    ) {
      return 'STRONG';
    }

    // Moderate consensus requirements
    if (
      validModelCount >= 3 &&
      metrics.confidence >= 70 &&
      metrics.expectedValue >= 1.0 &&
      directionAnalysis.agreementPercentage >= 70
    ) {
      return 'MODERATE';
    }

    // Weak consensus (still tradeable but lower conviction)
    if (
      validModelCount >= 2 &&
      metrics.confidence >= 65 &&
      metrics.expectedValue >= 0.8 &&
      directionAnalysis.agreementPercentage >= 60
    ) {
      return 'WEAK';
    }

    return 'CONFLICT';
  }

  private findTopPerformingModel(responses: EnhancedAIModelResponse[]): string {
    let topModel = 'NONE';
    let highestScore = 0;

    responses.forEach(response => {
      const weight = this.MODEL_WEIGHTS[response.model as keyof AIModelWeights] || 0.05;
      const score = (response.confidence * response.expected_value * weight) / 100;
      
      if (score > highestScore) {
        highestScore = score;
        topModel = response.model;
      }
    });

    return topModel;
  }

  private generateConsensusReasoning(
    responses: EnhancedAIModelResponse[], 
    strength: string
  ): string {
    const validCount = responses.length;
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / validCount;
    const avgEV = responses.reduce((sum, r) => sum + r.expected_value, 0) / validCount;

    switch (strength) {
      case 'STRONG':
        return `Strong AI consensus from ${validCount} models with ${avgConfidence.toFixed(1)}% avg confidence and +${avgEV.toFixed(2)} expected value`;
      case 'MODERATE':
        return `Moderate AI agreement from ${validCount} models with ${avgConfidence.toFixed(1)}% confidence`;
      case 'WEAK':
        return `Weak but viable consensus from ${validCount} models with ${avgConfidence.toFixed(1)}% confidence`;
      case 'CONFLICT':
      default:
        return `AI models in conflict - insufficient consensus for signal generation`;
    }
  }

  // Enhanced validation with conflict resolution
  resolveAIConflicts(analysis: WeightedAIAnalysis): boolean {
    // If Groq gives exceptional rating, override weaker models
    const hasGroqOverride = analysis.topModel === 'Groq' && 
                           analysis.weightedConfidence >= 85 &&
                           analysis.averageEV >= 1.5;

    if (hasGroqOverride) {
      console.log('🔥 Groq override activated - upgrading signal despite conflicts');
      return true;
    }

    // Standard consensus requirements
    return analysis.consensusStrength === 'STRONG' || analysis.consensusStrength === 'MODERATE';
  }
}

export const aiSignalValidator = new AISignalValidator();
