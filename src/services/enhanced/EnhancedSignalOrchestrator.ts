// Enhanced Signal Orchestrator - Integrates all 4 fixes
// This is the main orchestrator that combines all improvements

import { precisionSignalEngine, PrecisionSignal } from './PrecisionSignalEngine';
import { LiquidityPoolAnalyzer, LiquidityAnalysis } from './LiquidityPoolAnalyzer';
import { MarketSpecificAdjustments } from './MarketSpecificAdjustments';
import { BulletproofSignalValidator, ValidationInput, ValidationResult } from '../bulletproofSignalValidator';

export interface EnhancedSignalRequest {
  maxSignals?: number;
  minConfluence?: number;
  preferredSessions?: string[];
  riskTolerance?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  prioritizeInstruments?: boolean;
}

export interface EnhancedSignalResponse {
  signal?: PrecisionSignal;
  liquidityAnalysis?: LiquidityAnalysis;
  validationResult?: ValidationResult;
  marketConditions: {
    session: string;
    recommendedInstruments: string[];
    avoidedInstruments: string[];
    performanceSummary: string;
  };
  rejectionReasons: string[];
  processingTime: number;
  success: boolean;
}

export class EnhancedSignalOrchestrator {
  
  // 🎯 Main signal generation with all 4 fixes integrated
  static async generateEnhancedSignal(request: EnhancedSignalRequest = {}): Promise<EnhancedSignalResponse> {
    const startTime = Date.now();
    console.log('🚀 ENHANCED SIGNAL ORCHESTRATOR: Starting comprehensive signal generation...');
    
    const rejectionReasons: string[] = [];
    const currentSession = this.getCurrentSession();
    
    try {
      // 🔑 STEP 1: Get market conditions and prioritized instruments
      const marketConditions = this.getMarketConditions(currentSession);
      
      // 🔑 STEP 2: Select best instrument based on current performance
      const targetInstrument = this.selectOptimalInstrument(
        marketConditions.recommendedInstruments, 
        currentSession, 
        request.prioritizeInstruments !== false
      );
      
      if (!targetInstrument) {
        rejectionReasons.push('No suitable instruments available for current session');
        return this.createRejectedResponse(rejectionReasons, marketConditions, startTime);
      }
      
      console.log(`🎯 Selected instrument: ${targetInstrument} (optimized for ${currentSession} session)`);
      
      // 🔑 STEP 3: Generate precision signal with all fixes
      const precisionSignal = await precisionSignalEngine.generatePrecisionSignal(targetInstrument);
      
      if (!precisionSignal) {
        rejectionReasons.push(`Failed to generate precision signal for ${targetInstrument}`);
        return this.createRejectedResponse(rejectionReasons, marketConditions, startTime);
      }
      
      // 🔑 STEP 4: Validate confluence requirement (minimum 4/6)
      if (precisionSignal.confluenceScore < (request.minConfluence || 4)) {
        rejectionReasons.push(`Confluence too low: ${precisionSignal.confluenceScore}/${request.minConfluence || 4} minimum required`);
        return this.createRejectedResponse(rejectionReasons, marketConditions, startTime);
      }
      
      // 🔑 STEP 5: Detailed liquidity analysis for TP optimization
      const liquidityAnalysis = LiquidityPoolAnalyzer.analyzeLiquidityStructure(
        precisionSignal.symbol,
        precisionSignal.direction,
        precisionSignal.entry
      );
      
      // 🔑 STEP 6: Apply market-specific adjustments
      const marketAdjustments = MarketSpecificAdjustments.getAdjustedParameters(
        precisionSignal.symbol,
        precisionSignal.entry,
        precisionSignal.stopLoss,
        precisionSignal.takeProfit2.price
      );
      
      if (!marketAdjustments.shouldTrade) {
        rejectionReasons.push(marketAdjustments.reason);
        return this.createRejectedResponse(rejectionReasons, marketConditions, startTime);
      }
      
      // 🔑 STEP 7: Update signal with market adjustments
      const enhancedSignal: PrecisionSignal = {
        ...precisionSignal,
        stopLoss: marketAdjustments.adjustedSL,
        partialTPs: [
          precisionSignal.takeProfit1,
          { ...precisionSignal.takeProfit2, price: marketAdjustments.adjustedTP },
          precisionSignal.runner
        ],
        confidenceLevel: Math.min(100, precisionSignal.confidenceLevel + marketAdjustments.confidenceAdjustment)
      };
      
      // 🔑 STEP 8: Final bulletproof validation
      const validationInput: ValidationInput = {
        pair: enhancedSignal.symbol,
        entry: enhancedSignal.entry,
        stopLoss: enhancedSignal.stopLoss,
        takeProfit: precisionSignal.takeProfit1.price, // Validate against first TP
        tradeType: enhancedSignal.direction,
        confidence: enhancedSignal.confidenceLevel,
        timeframe: '15M',
        session: currentSession,
        confluenceScore: enhancedSignal.confluenceScore,
        justification: `Precision signal with ${enhancedSignal.confluenceScore}/8 confluence`
      };
      
      const validationResult = BulletproofSignalValidator.validateSignal(validationInput);
      
      if (!validationResult.isValid) {
        rejectionReasons.push(`Validation failed: ${validationResult.errors.join(', ')}`);
        return this.createRejectedResponse(rejectionReasons, marketConditions, startTime, validationResult);
      }
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ ENHANCED SIGNAL GENERATED SUCCESSFULLY (${processingTime}ms):`);
      console.log(`   📈 ${enhancedSignal.symbol} ${enhancedSignal.direction} @ ${enhancedSignal.entry}`);
      console.log(`   🎯 Confluence: ${enhancedSignal.confluenceScore}/8 | Quality: ${enhancedSignal.metadata.qualityGrade}`);
      console.log(`   🛡️ Risk: ${validationResult.riskLevel} | Confidence: ${enhancedSignal.confidenceLevel}%`);
      console.log(`   💰 Partial TPs: ${enhancedSignal.takeProfit1.price} (50%) | ${enhancedSignal.takeProfit2.price} (30%) | ${enhancedSignal.runner.price} (20%)`);
      
      return {
        signal: enhancedSignal,
        liquidityAnalysis,
        validationResult,
        marketConditions,
        rejectionReasons: [],
        processingTime,
        success: true
      };
      
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Enhanced signal generation failed: ${error.message}`);
      
      rejectionReasons.push(`System error: ${error.message}`);
      return this.createRejectedResponse(rejectionReasons, this.getMarketConditions(currentSession), startTime);
    }
  }

  // 🎯 Get current market conditions and recommendations
  private static getMarketConditions(session: string) {
    const performance = MarketSpecificAdjustments.getPerformanceSummary();
    const prioritized = MarketSpecificAdjustments.getPrioritizedInstruments(session);
    
    return {
      session,
      recommendedInstruments: performance.recommended,
      avoidedInstruments: performance.avoided,
      performanceSummary: performance.summary,
      prioritizedList: prioritized
    };
  }

  // 🎯 Select optimal instrument based on performance and session
  private static selectOptimalInstrument(
    recommended: string[], 
    session: string, 
    prioritize: boolean
  ): string | null {
    
    if (prioritize) {
      // Use performance-based prioritization
      const prioritized = MarketSpecificAdjustments.getPrioritizedInstruments(session);
      const available = prioritized.filter(symbol => recommended.includes(symbol));
      
      if (available.length > 0) {
        console.log(`🏆 Priority selection: ${available[0]} (top performer for ${session})`);
        return available[0];
      }
    }
    
    // Fallback to first recommended instrument
    if (recommended.length > 0) {
      return recommended[0];
    }
    
    // Last resort - check if any instrument has decent session performance
    const sessionRecommendation = MarketSpecificAdjustments.getSessionRecommendation('USDJPY', session);
    if (sessionRecommendation.shouldTrade) {
      return 'USDJPY'; // USDJPY is currently the most reliable
    }
    
    return null;
  }

  // 🎯 Create standardized rejection response
  private static createRejectedResponse(
    reasons: string[], 
    marketConditions: any, 
    startTime: number,
    validationResult?: ValidationResult
  ): EnhancedSignalResponse {
    return {
      marketConditions,
      rejectionReasons: reasons,
      processingTime: Date.now() - startTime,
      success: false,
      validationResult
    };
  }

  // 🎯 Get current trading session
  private static getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    
    if (hour >= 0 && hour < 8) return 'ASIA';
    if (hour >= 8 && hour < 16) return 'LONDON';
    if (hour >= 16 && hour < 22) return 'NY';
    return 'ASIA'; // Late NY rolls into Asia
  }

  // 🎯 Public method for testing specific instruments
  static async testInstrumentSignal(
    symbol: string, 
    request: EnhancedSignalRequest = {}
  ): Promise<EnhancedSignalResponse> {
    console.log(`🧪 TESTING SIGNAL GENERATION FOR ${symbol}...`);
    
    const startTime = Date.now();
    const currentSession = this.getCurrentSession();
    
    // Force generate signal for specific instrument
    const precisionSignal = await precisionSignalEngine.generatePrecisionSignal(symbol);
    
    if (!precisionSignal) {
      return {
        marketConditions: this.getMarketConditions(currentSession),
        rejectionReasons: [`Failed to generate signal for ${symbol}`],
        processingTime: Date.now() - startTime,
        success: false
      };
    }
    
    const liquidityAnalysis = LiquidityPoolAnalyzer.analyzeLiquidityStructure(
      symbol,
      precisionSignal.direction,
      precisionSignal.entry
    );
    
    return {
      signal: precisionSignal,
      liquidityAnalysis,
      marketConditions: this.getMarketConditions(currentSession),
      rejectionReasons: [],
      processingTime: Date.now() - startTime,
      success: true
    };
  }

  // 🎯 Get performance analytics for monitoring
  static getPerformanceAnalytics(): {
    marketSummary: string;
    instrumentRankings: { symbol: string; score: number; bias: string }[];
    sessionRecommendations: { [session: string]: string[] };
    currentOptimal: string[];
  } {
    const performance = MarketSpecificAdjustments.getPerformanceSummary();
    
    const sessions = ['ASIA', 'LONDON', 'NY'];
    const sessionRecommendations: { [session: string]: string[] } = {};
    
    sessions.forEach(session => {
      sessionRecommendations[session] = MarketSpecificAdjustments.getPrioritizedInstruments(session);
    });
    
    const currentSession = this.getCurrentSession();
    const currentOptimal = sessionRecommendations[currentSession] || [];
    
    return {
      marketSummary: performance.summary,
      instrumentRankings: Object.entries(MarketSpecificAdjustments['INSTRUMENT_RANKINGS']).map(([symbol, data]) => ({
        symbol,
        score: data.last7Days.winRate,
        bias: data.tradingBias
      })),
      sessionRecommendations,
      currentOptimal
    };
  }
}

export const enhancedSignalOrchestrator = new EnhancedSignalOrchestrator();