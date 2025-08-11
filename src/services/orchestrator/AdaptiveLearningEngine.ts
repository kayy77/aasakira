// Self-Learning Feedback System for Signal Enhancement
// Tracks signal performance and adapts AI weighting over time

import { supabase } from '@/integrations/supabase/client';

export interface SignalOutcome {
  signalId: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  entryTime: string;
  outcome?: 'WIN' | 'LOSS' | 'BREAKEVEN' | 'PENDING';
  exitPrice?: number;
  exitTime?: string;
  pipsGained?: number;
  rrAchieved?: number;
  durationHours?: number;
  aiVotes: Array<{
    provider: string;
    confidence: number;
    direction: string;
    reasoning?: string;
  }>;
  confluenceScore: number;
  sessionType: 'London' | 'NewYork' | 'Asian';
  strategyUsed: string[];
  marketConditions: {
    volatility: number;
    trend: string;
    newsImpact: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface LearningMetrics {
  providerAccuracy: Record<string, {
    totalSignals: number;
    winRate: number;
    avgRR: number;
    sessionPerformance: Record<string, number>;
    pairPerformance: Record<string, number>;
    confidenceCalibration: number;
  }>;
  strategyPerformance: Record<string, {
    winRate: number;
    avgRR: number;
    bestSessions: string[];
    bestPairs: string[];
    optimalConfluence: number;
  }>;
  sessionAnalysis: Record<string, {
    winRate: number;
    avgRR: number;
    bestPairs: string[];
    bestStrategies: string[];
    volatilityImpact: number;
  }>;
  confluenceOptimization: {
    optimalRange: [number, number];
    diminishingReturns: number;
    sessionAdjustments: Record<string, number>;
  };
}

export class AdaptiveLearningEngine {
  private static instance: AdaptiveLearningEngine;
  
  private constructor() {}

  public static getInstance(): AdaptiveLearningEngine {
    if (!AdaptiveLearningEngine.instance) {
      AdaptiveLearningEngine.instance = new AdaptiveLearningEngine();
    }
    return AdaptiveLearningEngine.instance;
  }

  /**
   * Store signal for learning analysis
   */
  async storeSignalForLearning(signal: SignalOutcome): Promise<void> {
    try {
      console.log('🧠 Storing signal for learning analysis:', signal.signalId);
      
      const { error } = await supabase
        .from('signal_outcomes')
        .insert({
          signal_id: signal.signalId,
          pair: signal.pair,
          direction: signal.direction,
          entry_price: signal.entryPrice,
          stop_loss: signal.stopLoss,
          take_profit: signal.takeProfit,
          entry_time: signal.entryTime,
          outcome: signal.outcome || 'PENDING',
          exit_price: signal.exitPrice,
          exit_time: signal.exitTime,
          pips_gained: signal.pipsGained,
          rr_achieved: signal.rrAchieved,
          duration_hours: signal.durationHours,
          ai_votes: signal.aiVotes,
          confluence_score: signal.confluenceScore,
          session_type: signal.sessionType,
          strategy_used: signal.strategyUsed,
          market_conditions: signal.marketConditions,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store signal outcome:', error);
      }
    } catch (error) {
      console.error('Error storing signal for learning:', error);
    }
  }

  /**
   * Update signal outcome when trade closes
   */
  async updateSignalOutcome(
    signalId: string,
    outcome: 'WIN' | 'LOSS' | 'BREAKEVEN',
    exitPrice: number,
    pipsGained: number,
    rrAchieved: number
  ): Promise<void> {
    try {
      console.log(`🎯 Updating signal outcome: ${signalId} -> ${outcome}`);
      
      const { error } = await supabase
        .from('signal_outcomes')
        .update({
          outcome,
          exit_price: exitPrice,
          exit_time: new Date().toISOString(),
          pips_gained: pipsGained,
          rr_achieved: rrAchieved,
          duration_hours: this.calculateDurationHours(new Date().toISOString()),
          updated_at: new Date().toISOString()
        })
        .eq('signal_id', signalId);

      if (error) {
        console.error('Failed to update signal outcome:', error);
        return;
      }

      // Trigger learning analysis update
      await this.updateLearningMetrics();
      
    } catch (error) {
      console.error('Error updating signal outcome:', error);
    }
  }

  /**
   * Generate learning metrics from historical data
   */
  async generateLearningMetrics(): Promise<LearningMetrics> {
    try {
      console.log('📊 Generating learning metrics from historical data...');
      
      const { data: outcomes, error } = await supabase
        .from('signal_outcomes')
        .select('*')
        .not('outcome', 'eq', 'PENDING')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days

      if (error || !outcomes) {
        console.error('Failed to fetch signal outcomes:', error);
        return this.getDefaultMetrics();
      }

      console.log(`📈 Analyzing ${outcomes.length} completed signals...`);

      // Analyze provider accuracy
      const providerAccuracy = this.analyzeProviderAccuracy(outcomes);
      
      // Analyze strategy performance
      const strategyPerformance = this.analyzeStrategyPerformance(outcomes);
      
      // Analyze session patterns
      const sessionAnalysis = this.analyzeSessionPatterns(outcomes);
      
      // Optimize confluence thresholds
      const confluenceOptimization = this.optimizeConfluenceThresholds(outcomes);

      const metrics: LearningMetrics = {
        providerAccuracy,
        strategyPerformance,
        sessionAnalysis,
        confluenceOptimization
      };

      // Store updated metrics
      await this.storeLearningMetrics(metrics);
      
      console.log('🧠 Learning metrics updated successfully');
      return metrics;
      
    } catch (error) {
      console.error('Error generating learning metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Get current AI provider weights based on learning
   */
  async getAdaptiveWeights(session: string, pair: string): Promise<Record<string, number>> {
    try {
      const { data: metrics } = await supabase
        .from('learning_metrics')
        .select('metrics')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!metrics?.metrics) {
        return this.getDefaultWeights();
      }

      const learningData = metrics.metrics as LearningMetrics;
      const adaptiveWeights: Record<string, number> = {};

      // Calculate adaptive weights based on session and pair performance
      Object.entries(learningData.providerAccuracy).forEach(([provider, data]) => {
        let weight = data.winRate; // Base weight from overall win rate
        
        // Adjust for session performance
        if (data.sessionPerformance[session]) {
          weight = weight * 0.7 + data.sessionPerformance[session] * 0.3;
        }
        
        // Adjust for pair performance
        if (data.pairPerformance[pair]) {
          weight = weight * 0.8 + data.pairPerformance[pair] * 0.2;
        }
        
        // Confidence calibration adjustment
        weight *= data.confidenceCalibration;
        
        adaptiveWeights[provider] = Math.max(0.1, Math.min(1.0, weight));
      });

      console.log(`🧠 Adaptive weights for ${session}/${pair}:`, adaptiveWeights);
      return adaptiveWeights;
      
    } catch (error) {
      console.error('Error getting adaptive weights:', error);
      return this.getDefaultWeights();
    }
  }

  /**
   * Get optimized confluence threshold for current conditions
   */
  async getOptimalConfluenceThreshold(session: string, marketVolatility: number): Promise<number> {
    try {
      const { data: metrics } = await supabase
        .from('learning_metrics')
        .select('metrics')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!metrics?.metrics) {
        return 0.75; // Default threshold
      }

      const learningData = metrics.metrics as LearningMetrics;
      let threshold = learningData.confluenceOptimization.optimalRange[0];
      
      // Adjust for session
      if (learningData.confluenceOptimization.sessionAdjustments[session]) {
        threshold *= learningData.confluenceOptimization.sessionAdjustments[session];
      }
      
      // Adjust for market volatility
      if (marketVolatility > 1.5) {
        threshold *= 1.1; // Higher threshold for volatile markets
      } else if (marketVolatility < 0.8) {
        threshold *= 0.95; // Lower threshold for calm markets
      }
      
      return Math.max(0.6, Math.min(0.9, threshold));
      
    } catch (error) {
      console.error('Error getting optimal confluence threshold:', error);
      return 0.75;
    }
  }

  private analyzeProviderAccuracy(outcomes: any[]): Record<string, any> {
    const providerStats: Record<string, any> = {};
    
    outcomes.forEach(outcome => {
      if (!outcome.ai_votes) return;
      
      outcome.ai_votes.forEach((vote: any) => {
        if (!providerStats[vote.provider]) {
          providerStats[vote.provider] = {
            totalSignals: 0,
            wins: 0,
            totalRR: 0,
            sessionStats: {},
            pairStats: {},
            confidenceSum: 0,
            actualAccuracy: 0
          };
        }
        
        const stats = providerStats[vote.provider];
        stats.totalSignals++;
        
        if (outcome.outcome === 'WIN') {
          stats.wins++;
          stats.totalRR += outcome.rr_achieved || 0;
        }
        
        // Session performance
        if (!stats.sessionStats[outcome.session_type]) {
          stats.sessionStats[outcome.session_type] = { wins: 0, total: 0 };
        }
        stats.sessionStats[outcome.session_type].total++;
        if (outcome.outcome === 'WIN') {
          stats.sessionStats[outcome.session_type].wins++;
        }
        
        // Pair performance
        if (!stats.pairStats[outcome.pair]) {
          stats.pairStats[outcome.pair] = { wins: 0, total: 0 };
        }
        stats.pairStats[outcome.pair].total++;
        if (outcome.outcome === 'WIN') {
          stats.pairStats[outcome.pair].wins++;
        }
        
        stats.confidenceSum += vote.confidence;
      });
    });
    
    // Convert to final format
    const result: Record<string, any> = {};
    Object.entries(providerStats).forEach(([provider, stats]: [string, any]) => {
      const winRate = stats.wins / stats.totalSignals;
      const avgRR = stats.wins > 0 ? stats.totalRR / stats.wins : 0;
      const avgConfidence = stats.confidenceSum / stats.totalSignals;
      const confidenceCalibration = Math.abs(winRate - (avgConfidence / 100)) < 0.1 ? 1.0 : 0.8;
      
      const sessionPerformance: Record<string, number> = {};
      Object.entries(stats.sessionStats).forEach(([session, data]: [string, any]) => {
        sessionPerformance[session] = data.wins / data.total;
      });
      
      const pairPerformance: Record<string, number> = {};
      Object.entries(stats.pairStats).forEach(([pair, data]: [string, any]) => {
        pairPerformance[pair] = data.wins / data.total;
      });
      
      result[provider] = {
        totalSignals: stats.totalSignals,
        winRate,
        avgRR,
        sessionPerformance,
        pairPerformance,
        confidenceCalibration
      };
    });
    
    return result;
  }

  private analyzeStrategyPerformance(outcomes: any[]): Record<string, any> {
    const strategyStats: Record<string, any> = {};
    
    outcomes.forEach(outcome => {
      if (!outcome.strategy_used) return;
      
      outcome.strategy_used.forEach((strategy: string) => {
        if (!strategyStats[strategy]) {
          strategyStats[strategy] = {
            wins: 0,
            total: 0,
            totalRR: 0,
            sessions: {},
            pairs: {},
            confluenceSum: 0
          };
        }
        
        const stats = strategyStats[strategy];
        stats.total++;
        stats.confluenceSum += outcome.confluence_score;
        
        if (outcome.outcome === 'WIN') {
          stats.wins++;
          stats.totalRR += outcome.rr_achieved || 0;
        }
        
        // Session tracking
        if (!stats.sessions[outcome.session_type]) {
          stats.sessions[outcome.session_type] = { wins: 0, total: 0 };
        }
        stats.sessions[outcome.session_type].total++;
        if (outcome.outcome === 'WIN') {
          stats.sessions[outcome.session_type].wins++;
        }
        
        // Pair tracking
        if (!stats.pairs[outcome.pair]) {
          stats.pairs[outcome.pair] = { wins: 0, total: 0 };
        }
        stats.pairs[outcome.pair].total++;
        if (outcome.outcome === 'WIN') {
          stats.pairs[outcome.pair].wins++;
        }
      });
    });
    
    const result: Record<string, any> = {};
    Object.entries(strategyStats).forEach(([strategy, stats]: [string, any]) => {
      const winRate = stats.wins / stats.total;
      const avgRR = stats.wins > 0 ? stats.totalRR / stats.wins : 0;
      const avgConfluence = stats.confluenceSum / stats.total;
      
      const bestSessions = Object.entries(stats.sessions)
        .sort(([,a]: [string, any], [,b]: [string, any]) => (b.wins/b.total) - (a.wins/a.total))
        .slice(0, 2)
        .map(([session]) => session);
      
      const bestPairs = Object.entries(stats.pairs)
        .sort(([,a]: [string, any], [,b]: [string, any]) => (b.wins/b.total) - (a.wins/a.total))
        .slice(0, 3)
        .map(([pair]) => pair);
      
      result[strategy] = {
        winRate,
        avgRR,
        bestSessions,
        bestPairs,
        optimalConfluence: avgConfluence
      };
    });
    
    return result;
  }

  private analyzeSessionPatterns(outcomes: any[]): Record<string, any> {
    const sessionStats: Record<string, any> = {};
    
    outcomes.forEach(outcome => {
      const session = outcome.session_type;
      if (!sessionStats[session]) {
        sessionStats[session] = {
          wins: 0,
          total: 0,
          totalRR: 0,
          pairs: {},
          strategies: {},
          volatilitySum: 0
        };
      }
      
      const stats = sessionStats[session];
      stats.total++;
      stats.volatilitySum += outcome.market_conditions?.volatility || 1;
      
      if (outcome.outcome === 'WIN') {
        stats.wins++;
        stats.totalRR += outcome.rr_achieved || 0;
      }
      
      // Best pairs per session
      if (!stats.pairs[outcome.pair]) {
        stats.pairs[outcome.pair] = { wins: 0, total: 0 };
      }
      stats.pairs[outcome.pair].total++;
      if (outcome.outcome === 'WIN') {
        stats.pairs[outcome.pair].wins++;
      }
      
      // Best strategies per session
      if (outcome.strategy_used) {
        outcome.strategy_used.forEach((strategy: string) => {
          if (!stats.strategies[strategy]) {
            stats.strategies[strategy] = { wins: 0, total: 0 };
          }
          stats.strategies[strategy].total++;
          if (outcome.outcome === 'WIN') {
            stats.strategies[strategy].wins++;
          }
        });
      }
    });
    
    const result: Record<string, any> = {};
    Object.entries(sessionStats).forEach(([session, stats]: [string, any]) => {
      const winRate = stats.wins / stats.total;
      const avgRR = stats.wins > 0 ? stats.totalRR / stats.wins : 0;
      const avgVolatility = stats.volatilitySum / stats.total;
      
      const bestPairs = Object.entries(stats.pairs)
        .sort(([,a]: [string, any], [,b]: [string, any]) => (b.wins/b.total) - (a.wins/a.total))
        .slice(0, 3)
        .map(([pair]) => pair);
      
      const bestStrategies = Object.entries(stats.strategies)
        .sort(([,a]: [string, any], [,b]: [string, any]) => (b.wins/b.total) - (a.wins/a.total))
        .slice(0, 3)
        .map(([strategy]) => strategy);
      
      result[session] = {
        winRate,
        avgRR,
        bestPairs,
        bestStrategies,
        volatilityImpact: avgVolatility
      };
    });
    
    return result;
  }

  private optimizeConfluenceThresholds(outcomes: any[]): any {
    const confluenceBuckets: Record<string, { wins: number; total: number; avgRR: number; totalRR: number }> = {};
    
    outcomes.forEach(outcome => {
      const bucket = Math.floor(outcome.confluence_score * 10) / 10; // Round to 0.1
      if (!confluenceBuckets[bucket]) {
        confluenceBuckets[bucket] = { wins: 0, total: 0, avgRR: 0, totalRR: 0 };
      }
      
      confluenceBuckets[bucket].total++;
      if (outcome.outcome === 'WIN') {
        confluenceBuckets[bucket].wins++;
        confluenceBuckets[bucket].totalRR += outcome.rr_achieved || 0;
      }
    });
    
    // Find optimal range
    const bucketAnalysis = Object.entries(confluenceBuckets).map(([threshold, stats]) => ({
      threshold: parseFloat(threshold),
      winRate: stats.wins / stats.total,
      avgRR: stats.wins > 0 ? stats.totalRR / stats.wins : 0,
      sampleSize: stats.total
    })).filter(b => b.sampleSize >= 5); // Minimum sample size
    
    const optimalBuckets = bucketAnalysis
      .filter(b => b.winRate >= 0.6)
      .sort((a, b) => (b.winRate * b.avgRR) - (a.winRate * a.avgRR));
    
    const optimalRange: [number, number] = optimalBuckets.length > 0 
      ? [optimalBuckets[0].threshold, Math.min(0.9, optimalBuckets[0].threshold + 0.1)]
      : [0.7, 0.8];
    
    return {
      optimalRange,
      diminishingReturns: 0.85, // Point where higher confluence doesn't improve much
      sessionAdjustments: {
        'London': 1.0,
        'NewYork': 1.05,
        'Asian': 0.95
      }
    };
  }

  private async storeLearningMetrics(metrics: LearningMetrics): Promise<void> {
    try {
      const { error } = await supabase
        .from('learning_metrics')
        .insert({
          metrics,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store learning metrics:', error);
      }
    } catch (error) {
      console.error('Error storing learning metrics:', error);
    }
  }

  private async updateLearningMetrics(): Promise<void> {
    // Trigger periodic learning metrics update
    setTimeout(() => {
      this.generateLearningMetrics();
    }, 5000); // Update 5 seconds after outcome update
  }

  private calculateDurationHours(exitTime: string): number {
    // This would need entry time from the stored signal
    return 0; // Placeholder
  }

  private getDefaultMetrics(): LearningMetrics {
    return {
      providerAccuracy: {
        'Groq': { totalSignals: 0, winRate: 0.7, avgRR: 2.0, sessionPerformance: {}, pairPerformance: {}, confidenceCalibration: 1.0 },
        'Gemini': { totalSignals: 0, winRate: 0.65, avgRR: 1.8, sessionPerformance: {}, pairPerformance: {}, confidenceCalibration: 0.9 },
        'Cohere': { totalSignals: 0, winRate: 0.6, avgRR: 1.7, sessionPerformance: {}, pairPerformance: {}, confidenceCalibration: 0.8 },
        'OpenRouter': { totalSignals: 0, winRate: 0.55, avgRR: 1.6, sessionPerformance: {}, pairPerformance: {}, confidenceCalibration: 0.75 },
        'Together': { totalSignals: 0, winRate: 0.5, avgRR: 1.5, sessionPerformance: {}, pairPerformance: {}, confidenceCalibration: 0.7 }
      },
      strategyPerformance: {},
      sessionAnalysis: {},
      confluenceOptimization: {
        optimalRange: [0.7, 0.8],
        diminishingReturns: 0.85,
        sessionAdjustments: {
          'London': 1.0,
          'NewYork': 1.05,
          'Asian': 0.95
        }
      }
    };
  }

  private getDefaultWeights(): Record<string, number> {
    return {
      'Groq': 1.0,
      'Gemini': 0.85,
      'Cohere': 0.75,
      'OpenRouter': 0.65,
      'Together': 0.55
    };
  }
}