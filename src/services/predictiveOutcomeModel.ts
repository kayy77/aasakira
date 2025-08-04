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

    // FALLBACK LOGIC: Default to neutral/favorable if no training data
    const baseTpProb = this.calculateBaseTpProbability(signalData);
    const sessionAdjustment = this.getSessionRiskAdjustment(signalData.session, signalData.pair);
    const structuralBonus = this.getStructuralBonus(signalData.structuralAnalysis);
    const aiConfidenceBonus = this.getAIConfidenceBonus(signalData.aiAnalysis);
    
    // Final TP probability with all adjustments
    const tpProbability = Math.min(90, Math.max(45, // Raised minimum from 5 to 45
      baseTpProb + sessionAdjustment + structuralBonus + aiConfidenceBonus
    ));

    const slProbability = 100 - tpProbability;

    // Calculate expected drawdown
    const maxDrawdownExpected = this.calculateMaxDrawdown(signalData);

    // Estimate time to target
    const timeToTarget = this.estimateTimeToTarget(signalData);

    // Determine risk level (more lenient)
    const riskLevel = this.determineRiskLevel(signalData, tpProbability, maxDrawdownExpected);

    // Session-specific risk
    const sessionRisk = this.calculateSessionRisk(signalData.session, signalData.pair);

    // Model confidence in its own prediction (more optimistic default)
    const predictionConfidence = this.calculatePredictionConfidence(signalData);

    // Generate recommendation (less strict)
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
    // More optimistic base probability
    let baseProb = 60; // Start higher (was 50)

    // Risk-reward impact (more generous)
    if (signalData.riskReward >= 2.5) baseProb += 15; // Lowered threshold
    else if (signalData.riskReward >= 2) baseProb += 10;
    else if (signalData.riskReward >= 1.5) baseProb += 5;
    else if (signalData.riskReward < 1.2) baseProb -= 15; // Less penalty

    // Confidence impact (more lenient)
    if (signalData.confidence >= 80) baseProb += 15; // Lowered from 85
    else if (signalData.confidence >= 70) baseProb += 10; // Lowered from 75
    else if (signalData.confidence >= 60) baseProb += 5; // Lowered from 65
    else baseProb -= 5; // Less penalty

    // Expected value impact (more generous)
    if (signalData.expectedValue >= 1.5) baseProb += 15; // Lowered from 2
    else if (signalData.expectedValue >= 1.2) baseProb += 10; // Lowered from 1.5
    else if (signalData.expectedValue >= 0.8) baseProb += 5; // Lowered from 1
    else baseProb -= 10; // Less penalty

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
      return -5; // Reduced penalty (was -10)
    }
  }

  private getStructuralBonus(structural: StructuralAnalysis): number {
    let bonus = 0;
    
    // Grade bonus (more generous)
    switch (structural.structuralGrade) {
      case 'A': bonus += 15; break;
      case 'B': bonus += 10; break;
      case 'C': bonus += 5; break;
      case 'F': bonus -= 10; break; // Less penalty
    }
    
    // Confluence bonus
    bonus += structural.confluenceScore * 2; // Reduced multiplier
    
    // Specific structural elements
    if (structural.smcBreak.detected && structural.smcBreak.strength > 70) bonus += 6; // Lowered threshold
    if (structural.liquiditySweep.detected && structural.liquiditySweep.confirmed) bonus += 6;
    if (structural.trendAlignment.htfAligned) bonus += 4;
    
    return bonus;
  }

  private getAIConfidenceBonus(ai: WeightedAIAnalysis): number {
    let bonus = 0;
    
    // Groq override gets massive bonus
    if (ai.groqOverride) bonus += 20;
    
    switch (ai.consensusStrength) {
      case 'STRONG': bonus += 15; break;
      case 'MODERATE': bonus += 10; break;
      case 'WEAK': bonus += 5; break; // Now gives bonus instead of penalty
      case 'CONFLICT': bonus -= 15; break; // Reduced penalty
    }
    
    // Top model bonus
    if (ai.topModel === 'Groq' && ai.weightedConfidence >= 75) bonus += 8; // Lowered threshold
    
    // Agreement bonus (more lenient)
    if (ai.modelAgreement >= 80) bonus += 6; // Lowered from 90
    else if (ai.modelAgreement >= 70) bonus += 4; // Lowered from 80
    else if (ai.modelAgreement < 55) bonus -= 5; // Less penalty
    
    return bonus;
  }

  private calculateMaxDrawdown(signalData: SignalInputData): number {
    let baseDrawdown = 20; // Reduced from 25
    
    if (signalData.session === 'Asia') baseDrawdown += 10; // Reduced penalty
    if (signalData.pair.includes('GBP')) baseDrawdown += 8; // Reduced penalty
    if (signalData.pair.includes('JPY')) baseDrawdown += 3; // Reduced penalty
    
    if (signalData.structuralAnalysis.structuralGrade === 'A') baseDrawdown -= 8;
    if (signalData.structuralAnalysis.confluenceScore >= 5) baseDrawdown -= 6;
    
    return Math.max(8, Math.min(50, baseDrawdown)); // Better range
  }

  private estimateTimeToTarget(signalData: SignalInputData): number {
    let baseTime = 120; // 2 hours average
    
    const hour = new Date().getUTCHours();
    if (hour >= 13 && hour <= 17) baseTime -= 30;
    if (hour >= 0 && hour <= 8) baseTime += 45; // Reduced penalty
    
    if (signalData.confidence >= 80) baseTime -= 25; // Lowered threshold
    if (signalData.structuralAnalysis.structuralGrade === 'A') baseTime -= 15;
    
    return Math.max(30, Math.min(360, baseTime)); // Better range
  }

  private determineRiskLevel(
    signalData: SignalInputData, 
    tpProbability: number, 
    maxDrawdown: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    
    // More lenient risk assessment
    if (tpProbability >= 70 && maxDrawdown <= 25 && signalData.structuralAnalysis.structuralGrade !== 'F') {
      return 'LOW';
    }
    
    if (tpProbability >= 60 && maxDrawdown <= 35) { // Lowered from 65
      return 'MEDIUM';
    }
    
    if (tpProbability >= 50 && maxDrawdown <= 45) { // Lowered from 55
      return 'HIGH';
    }
    
    return 'CRITICAL';
  }

  private calculateSessionRisk(session: string, pair: string): number {
    const hour = new Date().getUTCHours();
    
    if (hour >= 13 && hour <= 17) return 20;
    if (hour >= 8 && hour <= 17) return 35;
    if (hour >= 13 && hour <= 22) return 35;
    
    if (pair.includes('JPY') || pair.includes('AUD') || pair.includes('NZD')) {
      return 40;
    }
    
    return 60; // Reduced from 70
  }

  private calculatePredictionConfidence(signalData: SignalInputData): number {
    let confidence = 70; // Higher base confidence (was 60)
    
    if (signalData.structuralAnalysis.confluenceScore >= 4) confidence += 12; // Lowered threshold
    if (signalData.aiAnalysis.consensusStrength === 'STRONG') confidence += 15;
    if (signalData.aiAnalysis.groqOverride) confidence += 10;
    if (signalData.confidence >= 70) confidence += 8; // Lowered threshold
    
    // Reduce confidence for edge cases (less harsh)
    if (signalData.session === 'Asia' && !signalData.pair.includes('JPY')) confidence -= 15; // Reduced penalty
    if (signalData.aiAnalysis.consensusStrength === 'CONFLICT') confidence -= 20; // Reduced penalty
    
    return Math.max(30, Math.min(95, confidence)); // Better minimum
  }

  private generateRecommendation(
    tpProbability: number, 
    maxDrawdown: number, 
    riskLevel: string, 
    predictionConfidence: number
  ): 'TAKE' | 'REDUCE_SIZE' | 'WATCH_ONLY' | 'AVOID' {
    
    // More lenient recommendation logic
    if (tpProbability >= 65 && riskLevel !== 'CRITICAL' && predictionConfidence >= 70) { // Lowered from 70/80
      return 'TAKE';
    }
    
    if (tpProbability >= 55 && riskLevel !== 'CRITICAL' && predictionConfidence >= 60) { // Lowered from 65/70
      return 'REDUCE_SIZE';
    }
    
    if (tpProbability >= 50 && riskLevel !== 'CRITICAL') { // Lowered from 55
      return 'WATCH_ONLY';
    }
    
    return 'AVOID';
  }

  updateHistoricalData(signalData: SignalInputData, actualOutcome: 'TP' | 'SL', actualTime: number) {
    const key = `${signalData.pair}_${signalData.session}_${signalData.structuralAnalysis.structuralGrade}`;
    
    if (!this.historicalOutcomes.has(key)) {
      this.historicalOutcomes.set(key, []);
    }
    
    const outcomes = this.historicalOutcomes.get(key)!;
    outcomes.push(actualOutcome === 'TP' ? 1 : 0);
    
    if (outcomes.length > 100) {
      outcomes.shift();
    }
    
    console.log(`📊 Updated historical data for ${key}: ${outcomes.length} samples`);
  }
}

export const predictiveOutcomeModel = new PredictiveOutcomeModel();
