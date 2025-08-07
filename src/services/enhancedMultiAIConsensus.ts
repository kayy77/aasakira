
import { AITaskDelegationEngine, SignalContext } from './aiTaskDelegationEngine';

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
  // New enhanced fields
  aiTaskResults: any[];
  overallVerdict: 'STRONG' | 'MEDIUM' | 'WEAK' | 'REJECTED';
  institutionalGrade: string;
  deepAnalysisReasoning: string;
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
    
    console.log('🔍 Enhanced AI Consensus Scan Starting...');
    
    try {
      // Generate realistic signal context
      const signalContext = this.generateSignalContext(pair, livePrice);
      
      // Run deep AI task delegation analysis
      const aiAnalysis = await AITaskDelegationEngine.analyzeSignal(signalContext);
      
      // Build enhanced consensus result
      const consensus = this.buildEnhancedConsensusResult(signalContext, aiAnalysis);
      
      console.log(`📊 Scan Complete: ${consensus.overallVerdict} | Grade: ${consensus.finalGrade} | Consensus: ${consensus.consensusCount}/5`);
      
      return consensus;
    } catch (error) {
      console.error('Enhanced consensus scan failed:', error);
      return this.getFailedResult();
    }
  }

  private generateSignalContext(pair?: string, livePrice?: number): SignalContext {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD'];
    const basePrices = { EURUSD: 1.0850, GBPUSD: 1.2650, USDJPY: 150.25, USDCAD: 1.3580, AUDUSD: 0.6596 };
    
    const selectedPair = pair || pairs[Math.floor(Math.random() * pairs.length)];
    const basePrice = livePrice || basePrices[selectedPair as keyof typeof basePrices] || 1.0000;
    const direction = Math.random() > 0.5 ? 'BUY' : 'SELL';
    
    const pipValue = selectedPair.includes('JPY') ? 0.01 : 0.0001;
    const stopDistance = (15 + Math.random() * 10) * pipValue;
    const targetDistance = stopDistance * (2 + Math.random() * 1.5);
    
    const entry = basePrice + (Math.random() - 0.5) * 0.001;
    const stopLoss = direction === 'BUY' ? entry - stopDistance : entry + stopDistance;
    const takeProfit = direction === 'BUY' ? entry + targetDistance : entry - targetDistance;
    
    const hour = new Date().getUTCHours();
    const session = hour >= 8 && hour <= 17 ? 'London' : 
                   hour >= 13 && hour <= 22 ? 'New York' : 'Asian';
    
    return {
      pair: selectedPair,
      direction,
      entry,
      stopLoss,
      takeProfit,
      timeframe: '15m',
      session
    };
  }

  private buildEnhancedConsensusResult(context: SignalContext, aiAnalysis: any): ConsensusSignalResult {
    const { results, overallVerdict, consensusScore, reasoning } = aiAnalysis;
    
    // Calculate metrics based on AI task results
    const passCount = results.filter((r: any) => r.verdict === 'PASS').length;
    const avgConfidence = results.reduce((sum: number, r: any) => sum + r.confidence, 0) / results.length;
    const riskReward = Math.abs(context.takeProfit - context.entry) / Math.abs(context.entry - context.stopLoss);
    
    // Map overall verdict to consensus strength
    const consensusStrength = this.mapVerdictToStrength(overallVerdict);
    const signalStrength = consensusStrength === 'EXCEPTIONAL' ? 'ELITE' : consensusStrength;
    const finalGrade = this.calculateEnhancedGrade(overallVerdict, passCount, avgConfidence, riskReward);
    
    const hasConsensus = overallVerdict !== 'REJECTED' && passCount >= 3;
    const recommendation = this.getEnhancedRecommendation(overallVerdict, finalGrade);
    
    // Enhanced institutional grading
    const institutionalGrade = this.getInstitutionalGrade(overallVerdict, passCount, results);
    
    const processingStages = {
      structuralPass: results.find((r: any) => r.model === 'groq')?.verdict !== 'FAIL',
      aiConsensusPass: hasConsensus,
      outcomePass: riskReward >= 1.8,
      finalApproved: overallVerdict === 'STRONG' || overallVerdict === 'MEDIUM'
    };

    return {
      direction: context.direction === 'BUY' ? 'BULLISH' : 'BEARISH',
      weightedConfidence: avgConfidence,
      averageEV: this.calculateExpectedValue(overallVerdict, riskReward),
      averageRR: riskReward,
      consensusStrength,
      topPerformingModel: this.findTopModel(results),
      agreementPercentage: (passCount / results.length) * 100,
      conflictingModels: results.filter((r: any) => r.verdict === 'FAIL').map((r: any) => r.model),
      reasoning,
      hasConsensus,
      signalStrength,
      finalGrade,
      processingStages,
      recommendation,
      consensusCount: passCount,
      totalModels: 5,
      scanDetails: {
        successfulModels: results.length,
        failedModels: results.filter((r: any) => r.verdict === 'FAIL').map((r: any) => r.model)
      },
      aiTaskResults: results,
      overallVerdict,
      institutionalGrade,
      deepAnalysisReasoning: reasoning
    };
  }

  private mapVerdictToStrength(verdict: string): 'WEAK' | 'MODERATE' | 'STRONG' | 'EXCEPTIONAL' {
    switch (verdict) {
      case 'STRONG': return 'EXCEPTIONAL';
      case 'MEDIUM': return 'STRONG';
      case 'WEAK': return 'MODERATE';
      default: return 'WEAK';
    }
  }

  private calculateEnhancedGrade(verdict: string, passCount: number, confidence: number, rr: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (verdict === 'REJECTED') return 'F';
    if (verdict === 'STRONG' && passCount >= 4 && confidence >= 85 && rr >= 2.5) return 'A+';
    if (verdict === 'STRONG' && passCount >= 4 && confidence >= 80 && rr >= 2.0) return 'A';
    if (verdict === 'MEDIUM' && passCount >= 3 && confidence >= 75 && rr >= 1.8) return 'B+';
    if (verdict === 'MEDIUM' && passCount >= 3 && confidence >= 70) return 'B';
    if (verdict === 'WEAK' && passCount >= 2 && confidence >= 65) return 'C+';
    if (verdict === 'WEAK') return 'C';
    return 'D';
  }

  private calculateExpectedValue(verdict: string, rr: number): number {
    const baseEV = rr * 0.4; // Base expected value calculation
    const multiplier = verdict === 'STRONG' ? 1.5 : verdict === 'MEDIUM' ? 1.2 : verdict === 'WEAK' ? 0.8 : 0.3;
    return baseEV * multiplier;
  }

  private findTopModel(results: any[]): string {
    const passedResults = results.filter(r => r.verdict === 'PASS');
    if (passedResults.length === 0) return 'none';
    
    return passedResults.reduce((top, current) => 
      current.confidence > top.confidence ? current : top
    ).model;
  }

  private getEnhancedRecommendation(verdict: string, grade: string): 'AVOID' | 'WATCH_ONLY' | 'TAKE' | 'REDUCE_SIZE' {
    if (verdict === 'REJECTED' || grade === 'F' || grade === 'D') return 'AVOID';
    if (verdict === 'STRONG' && (grade === 'A+' || grade === 'A')) return 'TAKE';
    if (verdict === 'MEDIUM' && (grade === 'B+' || grade === 'B')) return 'TAKE';
    if (verdict === 'WEAK' || grade === 'C+' || grade === 'C') return 'REDUCE_SIZE';
    return 'WATCH_ONLY';
  }

  private getInstitutionalGrade(verdict: string, passCount: number, results: any[]): string {
    const groqPassed = results.find(r => r.model === 'groq')?.verdict === 'PASS';
    
    if (verdict === 'STRONG' && passCount >= 4 && groqPassed) {
      return 'Institutional Grade - Elite Setup';
    }
    if (verdict === 'MEDIUM' && passCount >= 3 && groqPassed) {
      return 'Professional Grade - Strong Setup';
    }
    if (verdict === 'WEAK' && passCount >= 2) {
      return 'Standard Grade - Acceptable Risk';
    }
    return 'Retail Grade - High Risk';
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
      conflictingModels: ['groq', 'gemini', 'cohere', 'openrouter', 'together'],
      reasoning: 'Deep AI analysis failed - system error',
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
        failedModels: ['groq', 'gemini', 'cohere', 'openrouter', 'together']
      },
      aiTaskResults: [],
      overallVerdict: 'REJECTED',
      institutionalGrade: 'System Error',
      deepAnalysisReasoning: 'AI analysis engine encountered an error'
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
