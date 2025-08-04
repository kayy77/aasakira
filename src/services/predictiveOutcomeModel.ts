import { StructuralAnalysis } from './structuralIntelligenceScanner';
import { WeightedAIAnalysis } from './aiSignalValidator';

export interface OutcomePrediction {
  tpProbability: number;
  slProbability: number;
  maxDrawdownExpected: number;
  timeToTarget: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sessionRisk: number;
  predictionConfidence: number;
  recommendation: 'TAKE' | 'REDUCE_SIZE' | 'WATCH_ONLY' | 'AVOID';
}

export interface SignalInputData {
  pair: string;
  riskReward: number;
  confidence: number;
  expectedValue: number;
  session: string;
  structuralAnalysis: StructuralAnalysis;
  aiAnalysis: WeightedAIAnalysis;
  timeOfDay: number;
}

class PredictiveOutcomeModel {
  // Simulated historical outcome database
  private historicalOutcomes = new Map<string, number[]>();

  predictSignalOutcome(signalData: SignalInputData): OutcomePrediction {
    console.log(`🔮 Predicting outcome for ${signalData.pair} signal...`);

    // Calculate base probabilities using multiple factors
    const baseTpProb = this.calculateBaseTpProbability(signalData);
    const sessionAdjustment = this.getSessionRiskAdjustment(signalData.session, signalData.pair);
    const structuralBonus = this.getStructuralBonus(signalData.structuralAnalysis);
    const aiConfidenceBonus = this.getAIConfidenceBonus(signalData.aiAnalysis);
    
    // Final TP probability with all adjustments
    const tpProbability = Math.min(95, Math.max(5, 
      baseTpProb + sessionAdjustment + structuralBonus + aiConfidenceBonus
    ));

    const slProbability = 100 - tpProbability;

    // Calculate expected drawdown
    const maxDrawdownExpected = this.calculateMaxDrawdown(signalData);

    // Estimate time to target
    const timeToTarget = this.estimateTimeToTarget(signalData);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(signalData, tpProbability, maxDrawdownExpected);

    // Session-specific risk
    const sessionRisk = this.calculateSessionRisk(signalData.session, signalData.pair);

    // Model confidence in its own prediction
    const predictionConfidence = this.calculatePredictionConfidence(signalData);

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      tpProbability, 
      maxDrawdownExpected, 
      riskLevel, 
      predictionConfidence
    );

    console.log(`🎯 Prediction: ${tpProbability.toFixed(1)}% TP probability, ${riskLevel} risk, ${recommendation}`);

    return {
      tpProbability,
      slProbability,
      maxDrawdownExpected,
      timeToTarget,
      riskLevel,
      sessionRisk,
      predictionConfidence,
      recommendation
    };
  }

  private calculateBaseTpProbability(signalData: SignalInputData): number {
    // Base probability factors
    let baseProb = 50; // Start neutral

    // Risk-reward impact
    if (signalData.riskReward >= 3) baseProb += 15;
    else if (signalData.riskReward >= 2.5) baseProb += 10;
    else if (signalData.riskReward >= 2) baseProb += 5;
    else if (signalData.riskReward < 1.5) baseProb -= 20;

    // Confidence impact
    if (signalData.confidence >= 85) baseProb += 20;
    else if (signalData.confidence >= 75) baseProb += 15;
    else if (signalData.confidence >= 65) baseProb += 10;
    else baseProb -= 10;

    // Expected value impact
    if (signalData.expectedValue >= 2) baseProb += 15;
    else if (signalData.expectedValue >= 1.5) baseProb += 10;
    else if (signalData.expectedValue >= 1) baseProb += 5;
    else baseProb -= 15;

    return baseProb;
  }

  private getSessionRiskAdjustment(session: string, pair: string): number {
    const hour = new Date().getUTCHours();
    
    // London-NY overlap (13-17 UTC) - highest liquidity
    if (hour >= 13 && hour <= 17) {
      return 10; // Boost probability
    }
    
    // London session (8-17 UTC)
    if (hour >= 8 && hour <= 17) {
      return 5;
    }
    
    // NY session (13-22 UTC)
    if (hour >= 13 && hour <= 22) {
      return 5;
    }
    
    // Asia session - pair specific
    if (pair.includes('JPY') || pair.includes('AUD')) {
      return 0; // Neutral for Asia pairs
    } else {
      return -10; // Penalty for non-Asia pairs during Asia session
    }
  }

  private getStructuralBonus(structural: StructuralAnalysis): number {
    let bonus = 0;
    
    // Grade bonus
    switch (structural.structuralGrade) {
      case 'A': bonus += 15; break;
      case 'B': bonus += 10; break;
      case 'C': bonus += 5; break;
      case 'F': bonus -= 20; break;
    }
    
    // Confluence bonus
    bonus += structural.confluenceScore * 3;
    
    // Specific structural elements
    if (structural.smcBreak.detected && structural.smcBreak.strength > 80) bonus += 8;
    if (structural.liquiditySweep.detected && structural.liquiditySweep.confirmed) bonus += 8;
    if (structural.trendAlignment.htfAligned) bonus += 5;
    
    return bonus;
  }

  private getAIConfidenceBonus(ai: WeightedAIAnalysis): number {
    let bonus = 0;
    
    switch (ai.consensusStrength) {
      case 'STRONG': bonus += 15; break;
      case 'MODERATE': bonus += 10; break;
      case 'WEAK': bonus += 2; break;
      case 'CONFLICT': bonus -= 25; break;
    }
    
    // Top model bonus
    if (ai.topModel === 'Groq' && ai.weightedConfidence >= 85) bonus += 10;
    
    // Agreement bonus
    if (ai.modelAgreement >= 90) bonus += 8;
    else if (ai.modelAgreement >= 80) bonus += 5;
    else if (ai.modelAgreement < 60) bonus -= 10;
    
    return bonus;
  }

  private calculateMaxDrawdown(signalData: SignalInputData): number {
    // Base drawdown as percentage of distance to TP
    let baseDrawdown = 25; // 25% of TP distance
    
    // Adjust based on volatility and session
    if (signalData.session === 'Asia') baseDrawdown += 15;
    if (signalData.pair.includes('GBP')) baseDrawdown += 10;
    if (signalData.pair.includes('JPY')) baseDrawdown += 5;
    
    // Reduce if structure is strong
    if (signalData.structuralAnalysis.structuralGrade === 'A') baseDrawdown -= 10;
    if (signalData.structuralAnalysis.confluenceScore >= 5) baseDrawdown -= 8;
    
    return Math.max(10, Math.min(60, baseDrawdown));
  }

  private estimateTimeToTarget(signalData: SignalInputData): number {
    // Base time in minutes
    let baseTime = 120; // 2 hours average
    
    // Adjust for session volatility
    const hour = new Date().getUTCHours();
    if (hour >= 13 && hour <= 17) baseTime -= 30; // Faster in overlap
    if (hour >= 0 && hour <= 8) baseTime += 60; // Slower in Asia
    
    // Adjust for signal strength
    if (signalData.confidence >= 85) baseTime -= 30;
    if (signalData.structuralAnalysis.structuralGrade === 'A') baseTime -= 20;
    
    return Math.max(30, Math.min(480, baseTime));
  }

  private determineRiskLevel(
    signalData: SignalInputData, 
    tpProbability: number, 
    maxDrawdown: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    
    if (tpProbability >= 75 && maxDrawdown <= 20 && signalData.structuralAnalysis.structuralGrade === 'A') {
      return 'LOW';
    }
    
    if (tpProbability >= 65 && maxDrawdown <= 35) {
      return 'MEDIUM';
    }
    
    if (tpProbability >= 55 && maxDrawdown <= 50) {
      return 'HIGH';
    }
    
    return 'CRITICAL';
  }

  private calculateSessionRisk(session: string, pair: string): number {
    const hour = new Date().getUTCHours();
    
    // High liquidity sessions = low risk
    if (hour >= 13 && hour <= 17) return 20; // London-NY overlap
    if (hour >= 8 && hour <= 17) return 35;  // London
    if (hour >= 13 && hour <= 22) return 35; // NY
    
    // Asia session risk depends on pair
    if (pair.includes('JPY') || pair.includes('AUD') || pair.includes('NZD')) {
      return 40; // Medium risk for Asia pairs
    }
    
    return 70; // High risk for non-Asia pairs during Asia session
  }

  private calculatePredictionConfidence(signalData: SignalInputData): number {
    let confidence = 60; // Base confidence in model
    
    // More data = higher confidence
    if (signalData.structuralAnalysis.confluenceScore >= 5) confidence += 15;
    if (signalData.aiAnalysis.consensusStrength === 'STRONG') confidence += 15;
    if (signalData.confidence >= 80) confidence += 10;
    
    // Reduce confidence for edge cases
    if (signalData.session === 'Asia' && !signalData.pair.includes('JPY')) confidence -= 20;
    if (signalData.aiAnalysis.consensusStrength === 'CONFLICT') confidence -= 30;
    
    return Math.max(20, Math.min(95, confidence));
  }

  private generateRecommendation(
    tpProbability: number, 
    maxDrawdown: number, 
    riskLevel: string, 
    predictionConfidence: number
  ): 'TAKE' | 'REDUCE_SIZE' | 'WATCH_ONLY' | 'AVOID' {
    
    if (tpProbability >= 70 && riskLevel === 'LOW' && predictionConfidence >= 80) {
      return 'TAKE';
    }
    
    if (tpProbability >= 65 && riskLevel !== 'CRITICAL' && predictionConfidence >= 70) {
      return 'REDUCE_SIZE';
    }
    
    if (tpProbability >= 55 && riskLevel !== 'CRITICAL') {
      return 'WATCH_ONLY';
    }
    
    return 'AVOID';
  }

  // Learning function - would be called after signal outcomes are known
  updateHistoricalData(signalData: SignalInputData, actualOutcome: 'TP' | 'SL', actualTime: number) {
    const key = `${signalData.pair}_${signalData.session}_${signalData.structuralAnalysis.structuralGrade}`;
    
    if (!this.historicalOutcomes.has(key)) {
      this.historicalOutcomes.set(key, []);
    }
    
    const outcomes = this.historicalOutcomes.get(key)!;
    outcomes.push(actualOutcome === 'TP' ? 1 : 0);
    
    // Keep only last 100 outcomes per category
    if (outcomes.length > 100) {
      outcomes.shift();
    }
    
    console.log(`📊 Updated historical data for ${key}: ${outcomes.length} samples`);
  }
}

export const predictiveOutcomeModel = new PredictiveOutcomeModel();
