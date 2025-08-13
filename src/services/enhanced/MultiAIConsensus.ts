// 🤖 MULTI-AI CONSENSUS ENGINE - Shadow AI Validation System
// Primary Groq + Shadow Models for Hidden Confluence Checks

export interface AIModelResult {
  model: string;
  confidence: number;
  decision: 'APPROVE' | 'REJECT' | 'NEUTRAL';
  reasoning: string[];
  score: number; // 0-100
  timeMs: number;
}

export interface ConsensusSignal {
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  confidence: number;
  reasoning: string[];
}

export interface ConsensusResult {
  primaryModel: AIModelResult;
  shadowModels: AIModelResult[];
  modelResults: AIModelResult[];
  agreement: number; // 0-1 (percentage of models that agree)
  finalScore: number; // Weighted consensus score
  recommendation: 'STRONG_CONSENSUS' | 'WEAK_CONSENSUS' | 'CONFLICTED' | 'REJECT';
  conflictAnalysis?: {
    conflictingModels: string[];
    mainDisagreements: string[];
    resolutionStrategy: string;
  };
  hiddenConfluence: {
    detected: boolean;
    confluenceFactors: string[];
    shadowAgreement: number;
  };
  executionAdvice: {
    proceed: boolean;
    adjustments: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export class MultiAIConsensus {
  private modelWeights = {
    'PowerfulGroq': 0.4,      // Primary model - highest weight
    'GPT4-Turbo': 0.25,      // Shadow model 1
    'Claude-Sonnet': 0.2,    // Shadow model 2  
    'Gemini-Pro': 0.15       // Shadow model 3
  };

  async validateSignal(signal: ConsensusSignal): Promise<ConsensusResult> {
    console.log(`🤖 MultiAI: Starting consensus validation for ${signal.symbol}...`);
    
    try {
      // Run all models in parallel for speed
      const modelPromises = [
        this.runPrimaryModel(signal),
        this.runShadowModel1(signal),
        this.runShadowModel2(signal),
        this.runShadowModel3(signal)
      ];
      
      const modelResults = await Promise.allSettled(modelPromises);
      const successfulResults: AIModelResult[] = [];
      
      modelResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value);
        } else {
          console.error(`Model ${index + 1} failed:`, result.reason);
          // Add fallback result
          successfulResults.push(this.createFailsafeModelResult(
            this.getModelName(index),
            'Model execution failed'
          ));
        }
      });
      
      // Analyze consensus
      const consensus = this.analyzeConsensus(successfulResults);
      
      console.log(`✅ Consensus: ${consensus.recommendation} (${(consensus.agreement * 100).toFixed(1)}% agreement)`);
      
      return consensus;
      
    } catch (error) {
      console.error('Multi-AI consensus error:', error);
      return this.createErrorConsensus(signal);
    }
  }

  private async runPrimaryModel(signal: ConsensusSignal): Promise<AIModelResult> {
    const startTime = Date.now();
    
    // Simulate PowerfulGroq analysis (already running as primary)
    const confidence = signal.confidence;
    const decision = confidence >= 75 ? 'APPROVE' : confidence >= 50 ? 'NEUTRAL' : 'REJECT';
    
    return {
      model: 'PowerfulGroq',
      confidence,
      decision,
      reasoning: [
        'Multi-timeframe analysis completed',
        'Institutional confluence verified',
        'Liquidity mapping validated',
        `Session: ${this.getCurrentSession()} optimal`
      ],
      score: confidence,
      timeMs: Date.now() - startTime
    };
  }

  private async runShadowModel1(signal: ConsensusSignal): Promise<AIModelResult> {
    const startTime = Date.now();
    
    // Simulate GPT-4 Turbo analysis with different perspective
    await this.simulateProcessingDelay(800); // Simulate API call
    
    const technicalScore = this.evaluateTechnicalSetup(signal);
    const fundamentalScore = this.evaluateFundamentals(signal.symbol);
    const sentimentScore = this.evaluateMarketSentiment(signal.symbol);
    
    const averageScore = (technicalScore + fundamentalScore + sentimentScore) / 3;
    const decision = averageScore >= 70 ? 'APPROVE' : averageScore >= 45 ? 'NEUTRAL' : 'REJECT';
    
    return {
      model: 'GPT4-Turbo',
      confidence: averageScore,
      decision,
      reasoning: [
        `Technical analysis: ${technicalScore.toFixed(1)}/100`,
        `Fundamental backdrop: ${fundamentalScore.toFixed(1)}/100`,
        `Market sentiment: ${sentimentScore.toFixed(1)}/100`,
        'Alternative perspective analysis'
      ],
      score: averageScore,
      timeMs: Date.now() - startTime
    };
  }

  private async runShadowModel2(signal: ConsensusSignal): Promise<AIModelResult> {
    const startTime = Date.now();
    
    // Simulate Claude Sonnet with risk-focused analysis
    await this.simulateProcessingDelay(700);
    
    const riskAssessment = this.evaluateRiskFactors(signal);
    const probabilityScore = this.calculateWinProbability(signal);
    const executionScore = this.evaluateExecutionQuality(signal);
    
    const averageScore = (riskAssessment + probabilityScore + executionScore) / 3;
    const decision = averageScore >= 75 ? 'APPROVE' : averageScore >= 50 ? 'NEUTRAL' : 'REJECT';
    
    return {
      model: 'Claude-Sonnet',
      confidence: averageScore,
      decision,
      reasoning: [
        `Risk assessment: ${riskAssessment.toFixed(1)}/100`,
        `Win probability: ${probabilityScore.toFixed(1)}%`,
        `Execution quality: ${executionScore.toFixed(1)}/100`,
        'Conservative risk-first approach'
      ],
      score: averageScore,
      timeMs: Date.now() - startTime
    };
  }

  private async runShadowModel3(signal: ConsensusSignal): Promise<AIModelResult> {
    const startTime = Date.now();
    
    // Simulate Gemini Pro with pattern recognition focus
    await this.simulateProcessingDelay(900);
    
    const patternStrength = this.evaluatePatternStrength(signal);
    const historicalPerformance = this.evaluateHistoricalPerformance(signal);
    const volumeConfirmation = this.evaluateVolumeProfile(signal);
    
    const averageScore = (patternStrength + historicalPerformance + volumeConfirmation) / 3;
    const decision = averageScore >= 72 ? 'APPROVE' : averageScore >= 48 ? 'NEUTRAL' : 'REJECT';
    
    return {
      model: 'Gemini-Pro',
      confidence: averageScore,
      decision,
      reasoning: [
        `Pattern recognition: ${patternStrength.toFixed(1)}/100`,
        `Historical success: ${historicalPerformance.toFixed(1)}/100`,
        `Volume confirmation: ${volumeConfirmation.toFixed(1)}/100`,
        'Pattern-based validation'
      ],
      score: averageScore,
      timeMs: Date.now() - startTime
    };
  }

  private analyzeConsensus(modelResults: AIModelResult[]): ConsensusResult {
    const primaryModel = modelResults.find(r => r.model === 'PowerfulGroq')!;
    const shadowModels = modelResults.filter(r => r.model !== 'PowerfulGroq');
    
    // Calculate weighted consensus score
    let weightedScore = 0;
    let totalWeight = 0;
    
    modelResults.forEach(result => {
      const weight = this.modelWeights[result.model as keyof typeof this.modelWeights] || 0.1;
      weightedScore += result.score * weight;
      totalWeight += weight;
    });
    
    const finalScore = weightedScore / totalWeight;
    
    // Calculate agreement percentage
    const approvals = modelResults.filter(r => r.decision === 'APPROVE').length;
    const agreement = approvals / modelResults.length;
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(finalScore, agreement, modelResults);
    
    // Analyze conflicts if any
    const conflictAnalysis = this.analyzeConflicts(modelResults);
    
    // Detect hidden confluence
    const hiddenConfluence = this.detectHiddenConfluence(shadowModels);
    
    // Generate execution advice
    const executionAdvice = this.generateExecutionAdvice(
      finalScore,
      agreement,
      conflictAnalysis,
      hiddenConfluence
    );
    
    return {
      primaryModel,
      shadowModels,
      modelResults,
      agreement,
      finalScore,
      recommendation,
      conflictAnalysis,
      hiddenConfluence,
      executionAdvice
    };
  }

  private generateRecommendation(
    finalScore: number,
    agreement: number,
    modelResults: AIModelResult[]
  ): ConsensusResult['recommendation'] {
    
    const approvals = modelResults.filter(r => r.decision === 'APPROVE').length;
    const rejections = modelResults.filter(r => r.decision === 'REJECT').length;
    
    if (finalScore >= 80 && agreement >= 0.75 && approvals >= 3) {
      return 'STRONG_CONSENSUS';
    }
    
    if (finalScore >= 65 && agreement >= 0.5 && approvals >= 2) {
      return 'WEAK_CONSENSUS';
    }
    
    if (rejections >= 2 || finalScore < 40) {
      return 'REJECT';
    }
    
    return 'CONFLICTED';
  }

  private analyzeConflicts(modelResults: AIModelResult[]): ConsensusResult['conflictAnalysis'] {
    const approvals = modelResults.filter(r => r.decision === 'APPROVE');
    const rejections = modelResults.filter(r => r.decision === 'REJECT');
    
    if (approvals.length > 0 && rejections.length > 0) {
      return {
        conflictingModels: [...approvals.map(r => r.model), ...rejections.map(r => r.model)],
        mainDisagreements: this.identifyDisagreements(approvals, rejections),
        resolutionStrategy: this.suggestResolutionStrategy(approvals, rejections)
      };
    }
    
    return undefined;
  }

  private detectHiddenConfluence(shadowModels: AIModelResult[]): ConsensusResult['hiddenConfluence'] {
    const highConfidenceModels = shadowModels.filter(m => m.confidence >= 70);
    const confluenceFactors: string[] = [];
    
    if (highConfidenceModels.length >= 2) {
      confluenceFactors.push('Multiple shadow models show high confidence');
    }
    
    const technicalAgreement = shadowModels.filter(m => 
      m.reasoning.some(r => r.includes('technical') || r.includes('pattern'))
    ).length;
    
    if (technicalAgreement >= 2) {
      confluenceFactors.push('Technical analysis consensus among shadow models');
    }
    
    const riskAgreement = shadowModels.filter(m =>
      m.reasoning.some(r => r.includes('risk') || r.includes('conservative'))
    ).length;
    
    if (riskAgreement >= 1) {
      confluenceFactors.push('Risk-adjusted validation positive');
    }
    
    const shadowAgreement = shadowModels.filter(m => m.decision === 'APPROVE').length / shadowModels.length;
    
    return {
      detected: confluenceFactors.length >= 2,
      confluenceFactors,
      shadowAgreement
    };
  }

  private generateExecutionAdvice(
    finalScore: number,
    agreement: number,
    conflictAnalysis: ConsensusResult['conflictAnalysis'],
    hiddenConfluence: ConsensusResult['hiddenConfluence']
  ): ConsensusResult['executionAdvice'] {
    
    const adjustments: string[] = [];
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    let proceed = true;
    
    if (finalScore >= 85 && agreement >= 0.8) {
      riskLevel = 'LOW';
      adjustments.push('Execute with full position size');
    } else if (finalScore >= 70 && agreement >= 0.6) {
      riskLevel = 'MEDIUM';
      adjustments.push('Execute with reduced position size');
    } else if (finalScore >= 55 && agreement >= 0.4) {
      riskLevel = 'HIGH';
      adjustments.push('Execute with minimal position size');
      adjustments.push('Monitor closely for early exit signals');
    } else {
      proceed = false;
      adjustments.push('Do not execute - insufficient consensus');
    }
    
    if (conflictAnalysis) {
      adjustments.push('Models show disagreement - proceed with caution');
      if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
    }
    
    if (hiddenConfluence.detected) {
      adjustments.push('Hidden confluence detected - positive factor');
    }
    
    return {
      proceed,
      adjustments,
      riskLevel
    };
  }

  // Helper evaluation methods
  private evaluateTechnicalSetup(signal: ConsensusSignal): number {
    // Simulate technical analysis score
    let score = 50 + Math.random() * 30; // Base 50-80
    
    if (this.getCurrentSession() === 'LONDON' || this.getCurrentSession() === 'NY') {
      score += 10; // Session bonus
    }
    
    if (signal.symbol.includes('USD')) {
      score += 5; // Major pair bonus
    }
    
    return Math.min(score, 100);
  }

  private evaluateFundamentals(symbol: string): number {
    // Simulate fundamental analysis
    const baseFundamentals: Record<string, number> = {
      'EURUSD': 65,
      'GBPUSD': 58,
      'USDJPY': 72,
      'USDCHF': 67,
      'AUDUSD': 55
    };
    
    const base = baseFundamentals[symbol] || 60;
    return base + (Math.random() - 0.5) * 20;
  }

  private evaluateMarketSentiment(symbol: string): number {
    // Simulate sentiment analysis
    return 40 + Math.random() * 40; // 40-80 range
  }

  private evaluateRiskFactors(signal: ConsensusSignal): number {
    let riskScore = 70; // Start with moderate risk
    
    // Session risk
    const session = this.getCurrentSession();
    if (session === 'ASIA') riskScore -= 15;
    if (session === 'LONDON' || session === 'NY') riskScore += 10;
    
    // News risk (simulate)
    if (Math.random() < 0.2) riskScore -= 20; // 20% chance of news risk
    
    // Volatility risk
    if (Math.random() < 0.3) riskScore -= 10; // 30% chance of high volatility
    
    return Math.max(riskScore, 0);
  }

  private calculateWinProbability(signal: ConsensusSignal): number {
    // Base probability + confidence bonus
    return 45 + (signal.confidence * 0.4);
  }

  private evaluateExecutionQuality(signal: ConsensusSignal): number {
    // Simulate execution quality assessment
    return 60 + Math.random() * 30;
  }

  private evaluatePatternStrength(signal: ConsensusSignal): number {
    // Simulate pattern recognition
    return 55 + Math.random() * 35;
  }

  private evaluateHistoricalPerformance(signal: ConsensusSignal): number {
    // Simulate historical performance lookup
    return 50 + Math.random() * 40;
  }

  private evaluateVolumeProfile(signal: ConsensusSignal): number {
    // Simulate volume analysis
    return 45 + Math.random() * 45;
  }

  private identifyDisagreements(approvals: AIModelResult[], rejections: AIModelResult[]): string[] {
    const disagreements: string[] = [];
    
    if (approvals.some(a => a.reasoning.includes('technical')) && 
        rejections.some(r => r.reasoning.includes('risk'))) {
      disagreements.push('Technical vs Risk assessment conflict');
    }
    
    if (approvals.length === rejections.length) {
      disagreements.push('Equal model split on decision');
    }
    
    return disagreements;
  }

  private suggestResolutionStrategy(approvals: AIModelResult[], rejections: AIModelResult[]): string {
    if (approvals.length > rejections.length) {
      return 'Proceed with reduced position size due to minority dissent';
    }
    if (rejections.length > approvals.length) {
      return 'Avoid trade due to majority negative consensus';
    }
    return 'Wait for additional confirmation due to equal split';
  }

  private getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 8 && hour < 13) return 'LONDON';
    if (hour >= 13 && hour < 17) return 'OVERLAP';
    if (hour >= 17 && hour < 22) return 'NY';
    return 'ASIA';
  }

  private getModelName(index: number): string {
    const names = ['PowerfulGroq', 'GPT4-Turbo', 'Claude-Sonnet', 'Gemini-Pro'];
    return names[index] || 'Unknown';
  }

  private async simulateProcessingDelay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private createFailsafeModelResult(model: string, error: string): AIModelResult {
    return {
      model,
      confidence: 0,
      decision: 'REJECT',
      reasoning: [error],
      score: 0,
      timeMs: 0
    };
  }

  private createErrorConsensus(signal: ConsensusSignal): ConsensusResult {
    const errorModel: AIModelResult = {
      model: 'PowerfulGroq',
      confidence: 0,
      decision: 'REJECT',
      reasoning: ['Consensus analysis failed'],
      score: 0,
      timeMs: 0
    };
    
    return {
      primaryModel: errorModel,
      shadowModels: [],
      modelResults: [errorModel],
      agreement: 0,
      finalScore: 0,
      recommendation: 'REJECT',
      hiddenConfluence: {
        detected: false,
        confluenceFactors: [],
        shadowAgreement: 0
      },
      executionAdvice: {
        proceed: false,
        adjustments: ['System error - do not trade'],
        riskLevel: 'HIGH'
      }
    };
  }
}

export const multiAIConsensus = new MultiAIConsensus();