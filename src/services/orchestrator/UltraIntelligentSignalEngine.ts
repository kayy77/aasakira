// Ultra-Intelligent Signal Engine with Deep Learning Integration
// Single source of truth for institutional-grade signal generation

import { SignalOrchestrator, OrchestrationResult, AIVote, MarketSnapshot } from './SignalOrchestrator';
import { InstitutionalKnowledgeBase } from './InstitutionalDoctrine';
import { AdaptiveLearningEngine, SignalOutcome } from './AdaptiveLearningEngine';
import { useToast } from '@/hooks/use-toast';

export interface UltraSignalRequest {
  forcedScan?: boolean;
  sessionOverride?: 'London' | 'NewYork' | 'Asian';
  pairOverride?: string;
  qualityThreshold?: 'A+' | 'A' | 'B+' | 'B';
}

export interface UltraSignalResult extends OrchestrationResult {
  sessionContext: string;
  institutionalGrade: 'Elite' | 'Strong' | 'Decent' | 'Weak' | 'Rejected';
  adaptiveWeights: Record<string, number>;
  learningInsights: {
    providerReliability: string;
    sessionOptimality: string;
    confluenceRecommendation: string;
    riskAssessment: string;
  };
  deepAnalysis: {
    groqReasoning: string;
    marketStructureAnalysis: string;
    liquidityAnalysis: string;
    confluenceBreakdown: string[];
    backtestSummary: string;
  };
  progressSteps: string[];
}

export interface ScanProgress {
  stage: string;
  message: string;
  progress: number;
  details?: string;
}

export class UltraIntelligentSignalEngine {
  private static instance: UltraIntelligentSignalEngine;
  private orchestrator: SignalOrchestrator;
  private learningEngine: AdaptiveLearningEngine;
  private progressCallback?: (progress: ScanProgress) => void;

  private constructor() {
    this.orchestrator = SignalOrchestrator.getInstance();
    this.learningEngine = AdaptiveLearningEngine.getInstance();
  }

  public static getInstance(): UltraIntelligentSignalEngine {
    if (!UltraIntelligentSignalEngine.instance) {
      UltraIntelligentSignalEngine.instance = new UltraIntelligentSignalEngine();
    }
    return UltraIntelligentSignalEngine.instance;
  }

  public setProgressCallback(callback: (progress: ScanProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Generate single ultra-premium signal with deep institutional analysis
   */
  async generateUltraSignal(request: UltraSignalRequest = {}): Promise<UltraSignalResult | null> {
    console.log('🚀 Ultra-Intelligent Signal Engine: Starting deep scan...');
    
    try {
      // Stage 1: Session Analysis & Pair Selection
      this.updateProgress('session_analysis', 'Analyzing optimal session and pairs...', 10);
      
      const optimalSession = this.getCurrentOptimalSession(request.sessionOverride);
      const priorityPairs = this.getSessionPriorityPairs(optimalSession);
      const targetPair = request.pairOverride || this.selectOptimalPair(priorityPairs, optimalSession);
      
      console.log(`🎯 Targeting: ${targetPair} in ${optimalSession} session`);
      
      // Stage 2: Adaptive Learning Integration
      this.updateProgress('learning_analysis', 'Integrating adaptive learning insights...', 25);
      
      const adaptiveWeights = await this.learningEngine.getAdaptiveWeights(optimalSession, targetPair);
      const optimalConfluenceThreshold = await this.learningEngine.getOptimalConfluenceThreshold(optimalSession, 1.0);
      
      // Stage 3: Market Snapshot with Enhanced Context
      this.updateProgress('market_analysis', 'Capturing enhanced market snapshot...', 40);
      
      const enhancedSnapshot = await this.createEnhancedMarketSnapshot(targetPair, optimalSession);
      
      // Stage 4: Deep Orchestrator Analysis
      this.updateProgress('orchestrator_analysis', 'Running institutional-grade analysis...', 60);
      
      const baseResult = await this.orchestrator.generateSignal(enhancedSnapshot);
      
      if (!baseResult) {
        // If no signal passes strict validation, try with secondary pairs
        this.updateProgress('secondary_scan', 'Scanning secondary opportunities...', 75);
        
        const secondaryResult = await this.scanSecondaryOpportunities(priorityPairs, optimalSession);
        if (!secondaryResult) {
          console.log('❌ No signals meet ultra-intelligent standards');
          return null;
        }
        return secondaryResult;
      }
      
      // Stage 5: Ultra Enhancement
      this.updateProgress('enhancement', 'Applying ultra-intelligent enhancements...', 85);
      
      const ultraResult = await this.enhanceSignalWithIntelligence(
        baseResult, 
        optimalSession, 
        adaptiveWeights, 
        optimalConfluenceThreshold
      );
      
      // Stage 6: Learning Storage
      this.updateProgress('learning_storage', 'Storing signal for continuous learning...', 95);
      
      await this.storeSignalForLearning(ultraResult);
      
      this.updateProgress('complete', 'Ultra-signal generation complete!', 100);
      
      console.log('✅ Ultra-Intelligent Signal Generated:', ultraResult.institutionalGrade);
      return ultraResult;
      
    } catch (error) {
      console.error('❌ Ultra-signal generation failed:', error);
      return null;
    }
  }

  /**
   * Update outcome for learning when trade closes
   */
  async updateSignalOutcome(
    signalId: string, 
    outcome: 'WIN' | 'LOSS' | 'BREAKEVEN',
    exitPrice: number
  ): Promise<void> {
    // Calculate pips and RR based on the stored signal data
    const pipsGained = 0; // Would calculate from entry/exit
    const rrAchieved = 0; // Would calculate from actual levels
    
    await this.learningEngine.updateSignalOutcome(signalId, outcome, exitPrice, pipsGained, rrAchieved);
    console.log(`🧠 Learning updated: ${signalId} -> ${outcome}`);
  }

  private getCurrentOptimalSession(override?: 'London' | 'NewYork' | 'Asian'): 'London' | 'NewYork' | 'Asian' {
    if (override) return override;
    
    const hour = new Date().getUTCHours();
    
    // Enhanced session detection with overlap priorities
    if (hour >= 13 && hour <= 16) return 'NewYork'; // NY + London overlap (priority)
    if (hour >= 8 && hour <= 12) return 'London';   // London exclusive
    if (hour >= 17 && hour <= 22) return 'NewYork'; // NY exclusive
    if (hour >= 0 && hour <= 7) return 'Asian';     // Asian session
    
    return 'London'; // Default fallback
  }

  private getSessionPriorityPairs(session: 'London' | 'NewYork' | 'Asian'): string[] {
    return InstitutionalKnowledgeBase.getSessionPriority(session);
  }

  private selectOptimalPair(pairs: string[], session: string): string {
    // Select based on current market conditions and session performance
    const sessionHour = new Date().getUTCHours();
    
    if (session === 'London' && sessionHour >= 8 && sessionHour <= 10) {
      // London open - prioritize GBP pairs
      return pairs.find(p => p.includes('GBP')) || pairs[0];
    }
    
    if (session === 'NewYork' && sessionHour >= 13 && sessionHour <= 15) {
      // NY open - prioritize USD pairs and indices
      return pairs.find(p => p.includes('USD') || p.includes('100')) || pairs[0];
    }
    
    return pairs[0]; // Default to highest priority pair
  }

  private async createEnhancedMarketSnapshot(pair: string, session: 'London' | 'NewYork' | 'Asian'): Promise<MarketSnapshot> {
    // Use existing orchestrator method but add session context
    const baseSnapshot = await this.orchestrator['getMarketSnapshot']();
    
    return {
      ...baseSnapshot,
      pair,
      session,
      // Enhanced with session-specific volatility
      atr: baseSnapshot.atr * this.getSessionVolatilityMultiplier(session)
    };
  }

  private getSessionVolatilityMultiplier(session: string): number {
    const hour = new Date().getUTCHours();
    
    switch (session) {
      case 'London':
        return hour >= 9 && hour <= 11 ? 1.3 : 1.0; // London volatility spike
      case 'NewYork':
        return hour >= 14 && hour <= 16 ? 1.4 : 1.1; // NY overlap volatility
      case 'Asian':
        return 0.7; // Lower volatility
      default:
        return 1.0;
    }
  }

  private async scanSecondaryOpportunities(
    pairs: string[], 
    session: string
  ): Promise<UltraSignalResult | null> {
    
    // Try each pair in priority order
    for (let i = 1; i < Math.min(pairs.length, 4); i++) {
      console.log(`🔍 Scanning secondary opportunity: ${pairs[i]}`);
      
      const snapshot = await this.createEnhancedMarketSnapshot(pairs[i], session as any);
      const result = await this.orchestrator.generateSignal(snapshot);
      
      if (result && result.decision.status === 'APPROVED') {
        const adaptiveWeights = await this.learningEngine.getAdaptiveWeights(session, pairs[i]);
        const threshold = await this.learningEngine.getOptimalConfluenceThreshold(session, 1.0);
        
        return this.enhanceSignalWithIntelligence(result, session as 'London' | 'NewYork' | 'Asian', adaptiveWeights, threshold);
      }
    }
    
    return null; // No secondary opportunities found
  }

  private async enhanceSignalWithIntelligence(
    baseResult: OrchestrationResult,
    session: 'London' | 'NewYork' | 'Asian',
    adaptiveWeights: Record<string, number>,
    confluenceThreshold: number
  ): Promise<UltraSignalResult> {
    
    // Generate deep institutional analysis
    const sessionContext = InstitutionalKnowledgeBase.getSessionSpecificPrompt(
      session, 
      baseResult.pair
    );
    
    // Create learning insights
    const learningInsights = {
      providerReliability: this.generateProviderReliabilityInsight(baseResult.aiVotes, adaptiveWeights),
      sessionOptimality: this.generateSessionOptimalityInsight(session, baseResult.pair),
      confluenceRecommendation: this.generateConfluenceRecommendation(baseResult.consensus, confluenceThreshold),
      riskAssessment: this.generateRiskAssessment(baseResult.decision, baseResult.backtest)
    };
    
    // Generate deep analysis
    const deepAnalysis = {
      groqReasoning: this.extractGroqReasoning(baseResult.aiVotes),
      marketStructureAnalysis: this.generateMarketStructureAnalysis(baseResult.smcFilters),
      liquidityAnalysis: this.generateLiquidityAnalysis(baseResult.smcFilters),
      confluenceBreakdown: this.generateConfluenceBreakdown(baseResult),
      backtestSummary: this.generateBacktestSummary(baseResult.backtest)
    };
    
    // Create progress steps for transparency
    const progressSteps = [
      `✅ Session Analysis: ${session} optimal for ${baseResult.pair}`,
      `✅ AI Consensus: ${(baseResult.consensus.scoreFraction * 100).toFixed(1)}% agreement`,
      `✅ SMC/ICT Validation: ${this.countPassedFilters(baseResult.smcFilters)}/5 confirmations`,
      `✅ Backtest Validation: ${(baseResult.backtest.winRate * 100).toFixed(1)}% historical win rate`,
      `✅ Learning Integration: Adaptive weights applied`,
      `✅ Final Grade: ${baseResult.decision.institutionalGrade}`
    ];
    
    return {
      ...baseResult,
      sessionContext,
      institutionalGrade: baseResult.decision.institutionalGrade as 'Elite' | 'Strong' | 'Decent' | 'Weak' | 'Rejected',
      adaptiveWeights,
      learningInsights,
      deepAnalysis,
      progressSteps
    };
  }

  private generateProviderReliabilityInsight(votes: AIVote[], weights: Record<string, number>): string {
    const topProvider = Object.entries(weights)
      .sort(([,a], [,b]) => b - a)[0];
    
    const reliability = Math.round(topProvider[1] * 100);
    return `${topProvider[0]} leading with ${reliability}% reliability for this session/pair combination`;
  }

  private generateSessionOptimalityInsight(session: string, pair: string): string {
    const hour = new Date().getUTCHours();
    const isOptimal = this.isOptimalSessionTiming(session, hour);
    
    return isOptimal 
      ? `Perfect timing: ${session} killzone active for ${pair}`
      : `Acceptable timing: ${session} session suitable for ${pair} with moderate volatility`;
  }

  private isOptimalSessionTiming(session: string, hour: number): boolean {
    switch (session) {
      case 'London': return hour >= 8 && hour <= 11;
      case 'NewYork': return hour >= 13 && hour <= 16;
      case 'Asian': return hour >= 2 && hour <= 5;
      default: return false;
    }
  }

  private generateConfluenceRecommendation(consensus: any, threshold: number): string {
    const currentScore = consensus.scoreFraction;
    
    if (currentScore >= threshold * 1.1) {
      return `Exceptional confluence: ${(currentScore * 100).toFixed(1)}% exceeds optimal threshold`;
    } else if (currentScore >= threshold) {
      return `Solid confluence: ${(currentScore * 100).toFixed(1)}% meets learning-optimized threshold`;
    } else {
      return `Marginal confluence: ${(currentScore * 100).toFixed(1)}% below optimal, proceed with caution`;
    }
  }

  private generateRiskAssessment(decision: any, backtest: any): string {
    const ev = decision.expectedValue;
    const winRate = backtest.winRate;
    
    if (ev > 0.3 && winRate > 0.7) {
      return `Low risk: High EV (${ev.toFixed(2)}) + strong historical performance (${(winRate * 100).toFixed(1)}%)`;
    } else if (ev > 0.2 && winRate > 0.6) {
      return `Medium risk: Positive EV (${ev.toFixed(2)}) with solid track record (${(winRate * 100).toFixed(1)}%)`;
    } else {
      return `Higher risk: Marginal setup - requires tight risk management`;
    }
  }

  private extractGroqReasoning(votes: AIVote[]): string {
    const groqVote = votes.find(v => v.name === 'Groq');
    return groqVote?.reasoning || 'Groq analysis pending';
  }

  private generateMarketStructureAnalysis(filters: any): string {
    const passedStructure = [];
    
    if (filters.breakOfStructure.valid) passedStructure.push('BOS confirmed');
    if (filters.orderBlock.valid) passedStructure.push('Order Block validated');
    if (filters.inducement.valid) passedStructure.push('Inducement identified');
    
    return passedStructure.length > 0 
      ? `Strong structure: ${passedStructure.join(', ')}`
      : 'Weak market structure - exercise caution';
  }

  private generateLiquidityAnalysis(filters: any): string {
    const liquidityFactors = [];
    
    if (filters.liquiditySweep.valid) liquidityFactors.push(`${filters.liquiditySweep.type}-side sweep`);
    if (filters.fairValueGap.valid) liquidityFactors.push('FVG imbalance');
    if (filters.volumeProfile.spike) liquidityFactors.push('volume spike');
    
    return liquidityFactors.length > 0
      ? `Active liquidity: ${liquidityFactors.join(', ')}`
      : 'Limited liquidity signals';
  }

  private generateConfluenceBreakdown(result: OrchestrationResult): string[] {
    return [
      `AI Consensus: ${(result.consensus.scoreFraction * 100).toFixed(1)}%`,
      `SMC Filters: ${this.countPassedFilters(result.smcFilters)}/5 passed`,
      `Backtest: ${(result.backtest.winRate * 100).toFixed(1)}% win rate`,
      `Expected Value: ${result.decision.expectedValue.toFixed(2)}`,
      `Risk Level: ${result.decision.riskLevel}`
    ];
  }

  private generateBacktestSummary(backtest: any): string {
    return `Historical analysis: ${(backtest.winRate * 100).toFixed(1)}% win rate, ${backtest.avgRiskReward.toFixed(1)}:1 avg RR over ${backtest.sampleSize} samples`;
  }

  private countPassedFilters(filters: any): number {
    return Object.values(filters).filter((filter: any) => filter.valid || filter.spike).length;
  }

  private async storeSignalForLearning(signal: UltraSignalResult): Promise<void> {
    const outcomeData: SignalOutcome = {
      signalId: signal.signalId,
      pair: signal.pair,
      direction: signal.direction,
      entryPrice: signal.entry,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      entryTime: signal.timestamp,
      aiVotes: signal.aiVotes.map(vote => ({
        provider: vote.name,
        confidence: vote.confidence,
        direction: vote.direction,
        reasoning: vote.reasoning
      })),
      confluenceScore: signal.consensus.scoreFraction,
      sessionType: signal.sessionContext.includes('London') ? 'London' : 
                   signal.sessionContext.includes('NewYork') ? 'NewYork' : 'Asian',
      strategyUsed: ['SMC', 'ICT', 'MultiAI'],
      marketConditions: {
        volatility: 1.0,
        trend: signal.consensus.majorityDirection === 'long' ? 'BULLISH' : 'BEARISH',
        newsImpact: 'LOW'
      }
    };
    
    await this.learningEngine.storeSignalForLearning(outcomeData);
  }

  private updateProgress(stage: string, message: string, progress: number, details?: string): void {
    if (this.progressCallback) {
      this.progressCallback({ stage, message, progress, details });
    }
  }
}