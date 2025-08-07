
import { AITaskDelegationEngine, SignalContext } from './aiTaskDelegationEngine';
import { InstitutionalSignalValidator, InstitutionalValidation } from './institutionalSignalValidator';

export interface EnhancedConsensusResult {
  signalId: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  
  // AI Analysis
  aiResults: any[];
  aiConsensus: 'STRONG' | 'MEDIUM' | 'WEAK' | 'REJECTED';
  consensusScore: number;
  aiReasoning: string;
  
  // Institutional Validation
  institutionalValidation: InstitutionalValidation;
  
  // Final Metrics
  finalGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  finalConfidence: number;
  riskReward: number;
  expectedValue: number;
  
  // Meta Information
  timestamp: string;
  processingTime: number;
  recommendation: 'TAKE' | 'REDUCE_SIZE' | 'WATCH' | 'AVOID';
  
  // Quality Metrics
  signalStrength: 'ELITE' | 'INSTITUTIONAL' | 'PROFESSIONAL' | 'STANDARD' | 'WEAK';
  convictionLevel: 'ULTRA_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export class EnhancedConsensusEngine {
  private static instance: EnhancedConsensusEngine;
  
  static getInstance(): EnhancedConsensusEngine {
    if (!this.instance) {
      this.instance = new EnhancedConsensusEngine();
    }
    return this.instance;
  }

  async generateInstitutionalSignal(): Promise<EnhancedConsensusResult | null> {
    const startTime = Date.now();
    console.log('🚀 Starting institutional-grade signal generation...');
    
    try {
      // Step 1: Generate signal context
      const context = this.generateSignalContext();
      console.log(`📊 Analyzing ${context.pair} ${context.direction} at ${context.entry}`);
      
      // Step 2: Run AI task delegation
      const aiAnalysis = await AITaskDelegationEngine.analyzeSignal(context);
      console.log(`🧠 AI Analysis: ${aiAnalysis.overallVerdict} (${aiAnalysis.results.length} models)`);
      
      // Early rejection if AI consensus is weak
      if (aiAnalysis.overallVerdict === 'REJECTED') {
        console.log('❌ Signal rejected by AI consensus');
        return null;
      }
      
      // Step 3: Run institutional validation
      const institutionalValidation = await InstitutionalSignalValidator.validateInstitutionalSignal(
        context.pair,
        context.direction,
        context.entry,
        context.stopLoss,
        context.takeProfit,
        aiAnalysis.consensusScore
      );
      
      console.log(`🏛️ Institutional Grade: ${institutionalValidation.institutionalGrade}`);
      
      // Reject if institutional validation fails
      if (institutionalValidation.institutionalGrade === 'REJECTED') {
        console.log('❌ Signal rejected by institutional validation');
        return null;
      }
      
      // Step 4: Calculate final metrics
      const finalMetrics = this.calculateFinalMetrics(context, aiAnalysis, institutionalValidation);
      
      // Step 5: Build comprehensive result
      const result: EnhancedConsensusResult = {
        signalId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        pair: context.pair,
        direction: context.direction,
        entry: context.entry,
        stopLoss: context.stopLoss,
        takeProfit: context.takeProfit,
        
        aiResults: aiAnalysis.results,
        aiConsensus: aiAnalysis.overallVerdict,
        consensusScore: aiAnalysis.consensusScore,
        aiReasoning: aiAnalysis.reasoning,
        
        institutionalValidation,
        
        finalGrade: finalMetrics.finalGrade,
        finalConfidence: finalMetrics.finalConfidence,
        riskReward: finalMetrics.riskReward,
        expectedValue: finalMetrics.expectedValue,
        
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        recommendation: this.generateRecommendation(institutionalValidation, finalMetrics),
        
        signalStrength: this.mapGradeToStrength(institutionalValidation.institutionalGrade),
        convictionLevel: this.calculateConvictionLevel(finalMetrics.finalConfidence, institutionalValidation.passedFilters)
      };
      
      console.log(`✅ Institutional signal generated: ${result.finalGrade} grade, ${result.signalStrength} strength`);
      return result;
      
    } catch (error) {
      console.error('❌ Institutional signal generation failed:', error);
      return null;
    }
  }

  private generateSignalContext(): SignalContext {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD'];
    const basePrices = {
      EURUSD: 1.0850,
      GBPUSD: 1.2650,
      USDJPY: 150.25,
      USDCAD: 1.3580,
      AUDUSD: 0.6596,
      NZDUSD: 0.6145
    };
    
    const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];
    const basePrice = basePrices[selectedPair as keyof typeof basePrices];
    const direction = Math.random() > 0.5 ? 'BUY' : 'SELL';
    
    // Generate realistic entry with slight deviation
    const entry = basePrice + (Math.random() - 0.5) * 0.002;
    
    // Calculate stop loss and take profit with institutional R:R ratios
    const isJPY = selectedPair.includes('JPY');
    const pipValue = isJPY ? 0.01 : 0.0001;
    
    const stopDistance = (12 + Math.random() * 8) * pipValue; // 12-20 pips
    const targetDistance = stopDistance * (2.5 + Math.random() * 1.5); // 2.5-4:1 R:R
    
    const stopLoss = direction === 'BUY' ? entry - stopDistance : entry + stopDistance;
    const takeProfit = direction === 'BUY' ? entry + targetDistance : entry - targetDistance;
    
    return {
      pair: selectedPair,
      direction,
      entry,
      stopLoss,
      takeProfit,
      timeframe: '15m',
      session: this.getCurrentSession()
    };
  }

  private getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 8) return 'Asian';
    if (hour >= 8 && hour < 16) return 'London';
    return 'New York';
  }

  private calculateFinalMetrics(
    context: SignalContext,
    aiAnalysis: any,
    institutionalValidation: InstitutionalValidation
  ) {
    const riskReward = Math.abs(context.takeProfit - context.entry) / Math.abs(context.entry - context.stopLoss);
    
    // Calculate final confidence (weighted average)
    const aiWeight = 0.4;
    const institutionalWeight = 0.6;
    const finalConfidence = Math.round(
      (aiAnalysis.consensusScore * aiWeight) + 
      (institutionalValidation.overallScore * institutionalWeight)
    );
    
    // Calculate expected value
    const winRate = this.estimateWinRate(institutionalValidation.institutionalGrade, finalConfidence);
    const expectedValue = (winRate * riskReward) - ((1 - winRate) * 1);
    
    // Determine final grade
    const finalGrade = this.calculateFinalGrade(
      institutionalValidation.institutionalGrade,
      finalConfidence,
      riskReward,
      institutionalValidation.passedFilters
    );
    
    return {
      finalConfidence,
      riskReward: Math.round(riskReward * 10) / 10,
      expectedValue: Math.round(expectedValue * 100) / 100,
      finalGrade
    };
  }

  private estimateWinRate(grade: string, confidence: number): number {
    const baseWinRates = {
      'ELITE': 0.75,
      'INSTITUTIONAL': 0.68,
      'PROFESSIONAL': 0.60,
      'STANDARD': 0.52
    };
    
    const baseRate = baseWinRates[grade as keyof typeof baseWinRates] || 0.45;
    const confidenceAdjustment = (confidence - 70) * 0.002; // ±0.2% per confidence point
    
    return Math.max(0.35, Math.min(0.85, baseRate + confidenceAdjustment));
  }

  private calculateFinalGrade(
    institutionalGrade: string,
    confidence: number,
    riskReward: number,
    passedFilters: number
  ): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (institutionalGrade === 'ELITE' && confidence >= 90 && riskReward >= 3.0 && passedFilters >= 5) {
      return 'A+';
    }
    
    if (institutionalGrade === 'ELITE' && confidence >= 85 && riskReward >= 2.5) {
      return 'A';
    }
    
    if (institutionalGrade === 'INSTITUTIONAL' && confidence >= 80 && riskReward >= 2.0) {
      return 'B+';
    }
    
    if (institutionalGrade === 'PROFESSIONAL' && confidence >= 75 && riskReward >= 2.0) {
      return 'B';
    }
    
    if (institutionalGrade === 'PROFESSIONAL' && confidence >= 70) {
      return 'C+';
    }
    
    if (institutionalGrade === 'STANDARD') {
      return 'C';
    }
    
    return 'D';
  }

  private generateRecommendation(
    institutionalValidation: InstitutionalValidation,
    finalMetrics: any
  ): 'TAKE' | 'REDUCE_SIZE' | 'WATCH' | 'AVOID' {
    if (institutionalValidation.recommendation === 'TAKE_FULL' && finalMetrics.finalGrade === 'A+') {
      return 'TAKE';
    }
    
    if (institutionalValidation.recommendation === 'TAKE_FULL' || institutionalValidation.recommendation === 'TAKE_REDUCED') {
      return 'REDUCE_SIZE';
    }
    
    if (institutionalValidation.recommendation === 'WATCH_ONLY') {
      return 'WATCH';
    }
    
    return 'AVOID';
  }

  private mapGradeToStrength(grade: string): 'ELITE' | 'INSTITUTIONAL' | 'PROFESSIONAL' | 'STANDARD' | 'WEAK' {
    switch (grade) {
      case 'ELITE': return 'ELITE';
      case 'INSTITUTIONAL': return 'INSTITUTIONAL';
      case 'PROFESSIONAL': return 'PROFESSIONAL';
      case 'STANDARD': return 'STANDARD';
      default: return 'WEAK';
    }
  }

  private calculateConvictionLevel(confidence: number, passedFilters: number): 'ULTRA_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (confidence >= 90 && passedFilters >= 5) return 'ULTRA_HIGH';
    if (confidence >= 80 && passedFilters >= 4) return 'HIGH';
    if (confidence >= 70 && passedFilters >= 3) return 'MEDIUM';
    return 'LOW';
  }
}

export const enhancedConsensusEngine = EnhancedConsensusEngine.getInstance();
