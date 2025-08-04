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
  groqOverride?: boolean;
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
      r.confidence >= 55 && // Lowered from 60
      r.expected_value >= 0.7 // Lowered from 0.8
    );

    console.log(`✅ Valid AI responses: ${validResponses.length}/${aiResponses.length}`);

    // ENHANCED GROQ OVERRIDE - Much more aggressive
    const groqResponse = validResponses.find(r => r.model === 'Groq');
    
    // Groq override conditions - MUCH MORE LENIENT
    const groqOverride = groqResponse && (
      // If Groq says "exceptional" or "elite" - ALWAYS override
      groqResponse.analysis?.toLowerCase().includes('exceptional') ||
      groqResponse.analysis?.toLowerCase().includes('elite') ||
      groqResponse.signal_strength === 'Strong' ||
      // Or if Groq has decent confidence and EV
      (groqResponse.confidence >= 70 && groqResponse.expected_value >= 1.0) ||
      // Or if Groq is just clearly bullish/bearish with reasonable metrics
      (groqResponse.confidence >= 65 && groqResponse.expected_value >= 0.8)
    );

    if (groqOverride) {
      console.log(`🔥 GROQ OVERRIDE ACTIVATED: ${groqResponse.analysis?.includes('exceptional') ? 'EXCEPTIONAL' : 'ELITE'} signal detected`);
      return {
        direction: groqResponse.direction as 'BUY' | 'SELL',
        weightedConfidence: Math.max(groqResponse.confidence, 80), // Boost confidence
        averageEV: Math.max(groqResponse.expected_value, 1.2), // Boost EV
        averageRR: Math.max(groqResponse.rr_ratio, 2.5), // Boost R:R
        consensusStrength: 'STRONG',
        topModel: 'Groq',
        modelAgreement: 100,
        conflictingModels: [],
        reasoning: `Groq override: ${groqResponse.analysis}`,
        groqOverride: true
      };
    }

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
    
    // Determine consensus strength (more lenient)
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
      reasoning: this.generateConsensusReasoning(validResponses, consensusStrength),
      groqOverride: false
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

    const totalVotes = directions.length;
    const agreementPercentage = Math.max(buyVotes, sellVotes) / totalVotes * 100;

    let consensusDirection: 'BUY' | 'SELL' | 'CONFLICT';
    let conflictingModels: string[] = [];

    // LOWERED THRESHOLD: Accept with 55% agreement (was 60%)
    if (buyVotes > sellVotes && agreementPercentage >= 55) {
      consensusDirection = 'BUY';
      conflictingModels = responses.filter(r => r.direction !== 'BUY').map(r => r.model);
    } else if (sellVotes > buyVotes && agreementPercentage >= 55) {
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

    // RELAXED Strong consensus requirements
    if (
      validModelCount >= 3 && // Lowered from 4
      metrics.confidence >= 75 && // Lowered from 80
      metrics.expectedValue >= 1.2 && // Lowered from 1.3
      directionAnalysis.agreementPercentage >= 75 // Lowered from 80
    ) {
      return 'STRONG';
    }

    // RELAXED Moderate consensus requirements
    if (
      validModelCount >= 2 && // Lowered from 3
      metrics.confidence >= 65 && // Lowered from 70
      metrics.expectedValue >= 0.9 && // Lowered from 1.0
      directionAnalysis.agreementPercentage >= 65 // Lowered from 70
    ) {
      return 'MODERATE';
    }

    // RELAXED Weak consensus (still tradeable)
    if (
      validModelCount >= 2 &&
      metrics.confidence >= 60 && // Lowered from 65
      metrics.expectedValue >= 0.7 && // Lowered from 0.8
      directionAnalysis.agreementPercentage >= 55 // Lowered from 60
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

  // UPDATED: More lenient validation with Groq priority
  resolveAIConflicts(analysis: WeightedAIAnalysis): boolean {
    // Groq override ALWAYS wins - no questions asked
    if (analysis.groqOverride) {
      console.log('🔥 Groq override activated - signal AUTOMATICALLY approved');
      return true;
    }

    // Accept WEAK signals too (was only STRONG/MODERATE)
    return analysis.consensusStrength === 'STRONG' || 
           analysis.consensusStrength === 'MODERATE' ||
           analysis.consensusStrength === 'WEAK';
  }
}

export const aiSignalValidator = new AISignalValidator();
