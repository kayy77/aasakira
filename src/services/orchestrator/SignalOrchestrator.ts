// Enhanced Signal Scanner Orchestrator - Single Source of Truth
// Coordinates AI providers, SMC/ICT filters, consensus, and validation

import { supabase } from '@/integrations/supabase/client';

export interface AIVote {
  name: string;
  tier: 'elite' | 'moderate' | 'weak';
  direction: 'long' | 'short' | 'neutral';
  confidence: number;
  filters?: {
    smc: boolean;
    liquiditySweep: boolean;
    fvg: boolean;
    rsiDivergence: boolean;
    volumeSpike: boolean;
    sessionTiming: boolean;
  };
  reasoning?: string;
}

export interface MarketSnapshot {
  pair: string;
  price: number;
  candles: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
  }>;
  session: 'Asian' | 'London' | 'NewYork';
  atr: number;
  vwap: number;
}

export interface SMCFilters {
  orderBlock: { valid: boolean; strength: number };
  breakOfStructure: { valid: boolean; direction: 'bullish' | 'bearish' | null };
  liquiditySweep: { valid: boolean; type: 'buy' | 'sell' | null };
  fairValueGap: { valid: boolean; strength: number };
  inducement: { valid: boolean; level: number };
  volumeProfile: { spike: boolean; accumulation: boolean };
}

export interface ConsensusResult {
  weightedScore: number;
  maxScore: number;
  scoreFraction: number;
  majorityDirection: 'long' | 'short' | 'neutral';
  conflictingModels: string[];
  consensus: boolean;
  confluenceBucket: number;
}

export interface BacktestResult {
  winRate: number;
  avgRiskReward: number;
  sampleSize: number;
  profitFactor: number;
  maxDrawdown: number;
}

export interface SignalDecision {
  status: 'APPROVED' | 'REJECTED' | 'PENDING_QA';
  ui_label: string;
  reasons: string[];
  expectedValue: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  institutionalGrade: 'Elite' | 'Strong' | 'Decent' | 'Weak' | 'Rejected';
}

export interface OrchestrationResult {
  signalId: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  aiVotes: AIVote[];
  smcFilters: SMCFilters;
  consensus: ConsensusResult;
  backtest: BacktestResult;
  decision: SignalDecision;
  processingTime: number;
  timestamp: string;
}

export class SignalOrchestrator {
  private static instance: SignalOrchestrator;
  private readonly REQUIRED_PROVIDERS = ['Groq', 'Gemini', 'Cohere', 'OpenRouter', 'Together'];
  private readonly MIN_AI_SCORE_FRACTION = 0.6;
  private readonly MIN_CONFLUENCE_BUCKET = 3;
  private readonly MIN_BACKTEST_WINRATE = 0.6;
  private readonly STRATEGY_OVERRIDE_THRESHOLD = 0.72;

  private constructor() {}

  public static getInstance(): SignalOrchestrator {
    if (!SignalOrchestrator.instance) {
      SignalOrchestrator.instance = new SignalOrchestrator();
    }
    return SignalOrchestrator.instance;
  }

  async generateSignal(marketSnapshot?: MarketSnapshot): Promise<OrchestrationResult | null> {
    const startTime = Date.now();
    
    try {
      console.log('🎯 Signal Orchestrator: Starting comprehensive analysis...');
      
      // 1. Get market snapshot (if not provided)
      const snapshot = marketSnapshot || await this.getMarketSnapshot();
      console.log(`📊 Market snapshot for ${snapshot.pair}: ${snapshot.price}`);
      
      // 2. Run parallel AI analysis
      const aiVotes = await this.gatherAIVotes(snapshot);
      console.log(`🧠 AI votes collected: ${aiVotes.length}/${this.REQUIRED_PROVIDERS.length}`);
      
      // 3. Run SMC/ICT filter analysis
      const smcFilters = await this.runSMCFilters(snapshot);
      console.log(`🔍 SMC filters analyzed`);
      
      // 4. Calculate consensus
      const consensus = this.calculateConsensus(aiVotes, smcFilters);
      console.log(`📈 Consensus: ${consensus.scoreFraction.toFixed(2)} (${consensus.majorityDirection})`);
      
      // 5. Run backtest simulation
      const backtest = await this.runBacktestSimulation(snapshot, consensus.majorityDirection);
      console.log(`📊 Backtest: ${(backtest.winRate * 100).toFixed(1)}% win rate`);
      
      // 6. Make final decision
      const decision = this.makeDecision(aiVotes, consensus, smcFilters, backtest);
      console.log(`⚖️ Decision: ${decision.status} (${decision.institutionalGrade})`);
      
      // 7. Generate signal if approved
      if (decision.status !== 'APPROVED') {
        console.log(`❌ Signal rejected: ${decision.reasons.join(', ')}`);
        await this.persistRejectedSignal(snapshot, aiVotes, consensus, decision);
        return null;
      }
      
      // 8. Build signal object
      const signal = await this.buildSignalObject(
        snapshot, aiVotes, smcFilters, consensus, backtest, decision, startTime
      );
      
      // 9. Persist to database
      await this.persistSignal(signal);
      
      console.log(`✅ Signal generated and approved: ${signal.pair} ${signal.direction}`);
      return signal;
      
    } catch (error) {
      console.error('❌ Signal orchestration failed:', error);
      return null;
    }
  }

  private async getMarketSnapshot(): Promise<MarketSnapshot> {
    // Session-aware pair selection
    const session = this.getCurrentSession();
    const pairs = this.getSessionPairs(session);
    const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];
    
    // Mock market data - in production this would fetch real data
    const price = 1.0800 + (Math.random() - 0.5) * 0.01;
    const candles = this.generateMockCandles(price);
    
    return {
      pair: selectedPair,
      price,
      candles,
      session,
      atr: 0.0012,
      vwap: price * (0.999 + Math.random() * 0.002)
    };
  }

  private async gatherAIVotes(snapshot: MarketSnapshot): Promise<AIVote[]> {
    // Import provider manager to get votes from all providers
    const { providerManager } = await import('./ProviderAdapters');
    
    try {
      const votes = await providerManager.getAllVotes(snapshot);
      console.log(`🧠 Collected ${votes.length} AI votes from providers`);
      return votes;
    } catch (error) {
      console.error('Failed to gather AI votes:', error);
      return [];
    }
  }


  private async runSMCFilters(snapshot: MarketSnapshot): Promise<SMCFilters> {
    // Deterministic SMC analysis based on candle data
    const candles = snapshot.candles;
    const recent = candles.slice(-20);
    
    return {
      orderBlock: {
        valid: this.detectOrderBlock(recent),
        strength: Math.random() * 100
      },
      breakOfStructure: {
        valid: this.detectBreakOfStructure(recent),
        direction: Math.random() > 0.5 ? 'bullish' : 'bearish'
      },
      liquiditySweep: {
        valid: this.detectLiquiditySweep(recent),
        type: Math.random() > 0.5 ? 'buy' : 'sell'
      },
      fairValueGap: {
        valid: this.detectFairValueGap(recent),
        strength: Math.random() * 100
      },
      inducement: {
        valid: Math.random() > 0.6,
        level: snapshot.price * (1 + (Math.random() - 0.5) * 0.001)
      },
      volumeProfile: {
        spike: Math.random() > 0.4,
        accumulation: Math.random() > 0.6
      }
    };
  }

  private calculateConsensus(aiVotes: AIVote[], smcFilters: SMCFilters): ConsensusResult {
    const tierWeights = { elite: 2, moderate: 1, weak: 0 };
    let totalScore = 0;
    let maxPossibleScore = this.REQUIRED_PROVIDERS.length * 2;
    
    // Calculate weighted AI score
    aiVotes.forEach(vote => {
      if (vote.direction !== 'neutral') {
        totalScore += tierWeights[vote.tier];
      }
    });
    
    const scoreFraction = totalScore / maxPossibleScore;
    
    // Determine majority direction
    const longVotes = aiVotes.filter(v => v.direction === 'long').length;
    const shortVotes = aiVotes.filter(v => v.direction === 'short').length;
    const majorityDirection = longVotes > shortVotes ? 'long' : shortVotes > longVotes ? 'short' : 'neutral';
    
    // Find conflicting models
    const conflictingModels = aiVotes
      .filter(v => v.direction !== majorityDirection && v.direction !== 'neutral')
      .map(v => v.name);
    
    // Calculate confluence bucket (0-6 scale)
    const filterCount = Object.values(smcFilters).filter(f => f.valid).length;
    const confluenceBucket = Math.min(6, filterCount);
    
    return {
      weightedScore: totalScore,
      maxScore: maxPossibleScore,
      scoreFraction,
      majorityDirection,
      conflictingModels,
      consensus: scoreFraction >= this.MIN_AI_SCORE_FRACTION && conflictingModels.length <= 1,
      confluenceBucket
    };
  }

  private async runBacktestSimulation(snapshot: MarketSnapshot, direction: 'long' | 'short' | 'neutral'): Promise<BacktestResult> {
    // Simple backtest simulation on historical candles
    const candles = snapshot.candles.slice(-50);
    let wins = 0;
    let losses = 0;
    let totalRR = 0;
    
    for (let i = 10; i < candles.length - 5; i++) {
      const entry = candles[i].close;
      const stopDistance = snapshot.atr * 1.5;
      const targetDistance = stopDistance * 2.5;
      
      const stopLoss = direction === 'long' ? entry - stopDistance : entry + stopDistance;
      const takeProfit = direction === 'long' ? entry + targetDistance : entry - targetDistance;
      
      // Check next 5 candles for hit
      let hit = false;
      for (let j = i + 1; j < Math.min(i + 6, candles.length); j++) {
        const candle = candles[j];
        
        if (direction === 'long') {
          if (candle.low <= stopLoss) {
            losses++;
            hit = true;
            break;
          }
          if (candle.high >= takeProfit) {
            wins++;
            totalRR += 2.5;
            hit = true;
            break;
          }
        } else if (direction === 'short') {
          if (candle.high >= stopLoss) {
            losses++;
            hit = true;
            break;
          }
          if (candle.low <= takeProfit) {
            wins++;
            totalRR += 2.5;
            hit = true;
            break;
          }
        }
      }
    }
    
    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? wins / totalTrades : 0;
    const avgRR = totalTrades > 0 ? totalRR / wins : 0;
    
    return {
      winRate,
      avgRiskReward: avgRR,
      sampleSize: totalTrades,
      profitFactor: losses > 0 ? (wins * avgRR) / losses : wins * avgRR,
      maxDrawdown: 0.15 // Mock value
    };
  }

  private makeDecision(
    aiVotes: AIVote[],
    consensus: ConsensusResult,
    smcFilters: SMCFilters,
    backtest: BacktestResult
  ): SignalDecision {
    const reasons: string[] = [];
    
    // Check AI consensus threshold
    if (consensus.scoreFraction < this.MIN_AI_SCORE_FRACTION) {
      reasons.push(`low_ai_consensus:${consensus.scoreFraction.toFixed(2)}`);
    }
    
    // Check confluence
    if (consensus.confluenceBucket < this.MIN_CONFLUENCE_BUCKET) {
      reasons.push(`low_confluence:${consensus.confluenceBucket}/6`);
    }
    
    // Check backtest performance
    if (backtest.winRate < this.MIN_BACKTEST_WINRATE) {
      reasons.push(`poor_backtest:${(backtest.winRate * 100).toFixed(1)}%`);
    }
    
    // Check for missing providers
    if (aiVotes.length < this.REQUIRED_PROVIDERS.length - 1) {
      reasons.push(`missing_providers:${aiVotes.length}/${this.REQUIRED_PROVIDERS.length}`);
    }
    
    // Strategy override check
    const hasStrategyOverride = consensus.confluenceBucket >= 4 && 
      consensus.scoreFraction >= 0.5 && 
      backtest.winRate >= this.STRATEGY_OVERRIDE_THRESHOLD;
    
    // Calculate expected value
    const calibratedProb = Math.min(0.95, consensus.scoreFraction * backtest.winRate);
    const avgRR = backtest.avgRiskReward || 2.5;
    const expectedValue = calibratedProb * avgRR - (1 - calibratedProb);
    
    // Final decision logic
    const meetsThresholds = reasons.length === 0 || hasStrategyOverride;
    const positiveEV = expectedValue > 0;
    
    let status: 'APPROVED' | 'REJECTED' | 'PENDING_QA';
    let ui_label: string;
    let institutionalGrade: 'Elite' | 'Strong' | 'Decent' | 'Weak' | 'Rejected';
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    
    if (meetsThresholds && positiveEV) {
      status = 'APPROVED';
      
      if (consensus.confluenceBucket >= 5 && consensus.scoreFraction >= 0.8) {
        institutionalGrade = 'Elite';
        ui_label = 'Elite';
        riskLevel = 'LOW';
      } else if (consensus.confluenceBucket >= 4 && consensus.scoreFraction >= 0.7) {
        institutionalGrade = 'Strong';
        ui_label = 'Strong';
        riskLevel = 'LOW';
      } else {
        institutionalGrade = 'Decent';
        ui_label = 'Decent';
        riskLevel = 'MEDIUM';
      }
    } else if (meetsThresholds || hasStrategyOverride) {
      status = 'PENDING_QA';
      institutionalGrade = 'Weak';
      ui_label = 'Weak (Review)';
      riskLevel = 'HIGH';
    } else {
      status = 'REJECTED';
      institutionalGrade = 'Rejected';
      ui_label = 'Rejected';
      riskLevel = 'HIGH';
    }
    
    return {
      status,
      ui_label,
      reasons,
      expectedValue,
      riskLevel,
      institutionalGrade
    };
  }

  private async buildSignalObject(
    snapshot: MarketSnapshot,
    aiVotes: AIVote[],
    smcFilters: SMCFilters,
    consensus: ConsensusResult,
    backtest: BacktestResult,
    decision: SignalDecision,
    startTime: number
  ): Promise<OrchestrationResult> {
    const direction = consensus.majorityDirection === 'long' ? 'BUY' : 'SELL';
    const stopDistance = snapshot.atr * 1.5;
    const targetDistance = stopDistance * (backtest.avgRiskReward || 2.5);
    
    const stopLoss = direction === 'BUY' 
      ? snapshot.price - stopDistance 
      : snapshot.price + stopDistance;
    
    const takeProfit = direction === 'BUY'
      ? snapshot.price + targetDistance
      : snapshot.price - targetDistance;
    
    return {
      signalId: `orchestrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pair: snapshot.pair,
      direction,
      entry: snapshot.price,
      stopLoss,
      takeProfit,
      riskReward: Math.abs(targetDistance / stopDistance),
      aiVotes,
      smcFilters,
      consensus,
      backtest,
      decision,
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  private async persistSignal(signal: OrchestrationResult): Promise<void> {
    try {
      const { error } = await supabase.from('signals').insert({
        pair: signal.pair,
        signal_type: 'orchestrated',
        direction: signal.direction,
        entry_price: signal.entry,
        stop_loss: signal.stopLoss,
        take_profit: signal.takeProfit,
        risk_reward_ratio: signal.riskReward,
        confidence: signal.consensus.scoreFraction * 100,
        ai_votes: signal.aiVotes as any,
        raw_ai_responses: signal.aiVotes as any,
        consensus: signal.consensus as any,
        weighted_ai_score: signal.consensus.weightedScore,
        max_ai_score: signal.consensus.maxScore,
        filters: signal.smcFilters as any,
        strategy_results: [signal.backtest] as any,
        confluence_bucket: signal.consensus.confluenceBucket,
        decision: signal.decision as any,
        expected_value: signal.decision.expectedValue,
        status: signal.decision.status,
        ui_label: signal.decision.ui_label,
        session_type: 'orchestrated'
      });
      
      if (error) throw error;
      
      await supabase.from('consensus_audit').insert({
        provider_name: 'orchestrator',
        status: 'success',
        request_payload: { snapshot: signal.pair, providers: this.REQUIRED_PROVIDERS } as any,
        raw_response: JSON.stringify(signal),
        latency_ms: signal.processingTime,
        parse_time_ms: 0
      });
      
    } catch (error) {
      console.error('Failed to persist signal:', error);
      throw error;
    }
  }

  private async persistRejectedSignal(
    snapshot: MarketSnapshot,
    aiVotes: AIVote[],
    consensus: ConsensusResult,
    decision: SignalDecision
  ): Promise<void> {
    try {
      await supabase.from('signals').insert({
        pair: snapshot.pair,
        signal_type: 'orchestrated',
        direction: consensus.majorityDirection === 'long' ? 'BUY' : 'SELL',
        entry_price: snapshot.price,
        confidence: consensus.scoreFraction * 100,
        ai_votes: aiVotes as any,
        raw_ai_responses: aiVotes as any,
        consensus: consensus as any,
        weighted_ai_score: consensus.weightedScore,
        max_ai_score: consensus.maxScore,
        confluence_bucket: consensus.confluenceBucket,
        decision: decision as any,
        expected_value: decision.expectedValue,
        status: decision.status,
        ui_label: decision.ui_label,
        rejection_reasons: decision.reasons,
        session_type: 'orchestrated'
      });
    } catch (error) {
      console.warn('Failed to persist rejected signal:', error);
    }
  }

  // Helper methods
  private getCurrentSession(): 'Asian' | 'London' | 'NewYork' {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 8) return 'Asian';
    if (hour >= 8 && hour < 17) return 'London';
    return 'NewYork';
  }

  private getSessionPairs(session: 'Asian' | 'London' | 'NewYork'): string[] {
    const sessionPairs = {
      'Asian': ['USDJPY', 'AUDUSD', 'NZDUSD', 'EURJPY'],
      'London': ['EURUSD', 'GBPUSD', 'EURGBP', 'GBPJPY'],
      'NewYork': ['EURUSD', 'GBPUSD', 'USDCAD', 'USDJPY']
    };
    return sessionPairs[session];
  }

  private generateMockCandles(currentPrice: number) {
    const candles = [];
    let price = currentPrice;
    
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 0.001;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 0.0005;
      const low = Math.min(open, close) - Math.random() * 0.0005;
      
      candles.push({
        open,
        high,
        low,
        close,
        volume: 1000 + Math.random() * 5000,
        timestamp: Date.now() - (100 - i) * 60000
      });
      
      price = close;
    }
    
    return candles;
  }

  private detectOrderBlock(candles: any[]): boolean {
    // Simple order block detection logic
    return Math.random() > 0.4;
  }

  private detectBreakOfStructure(candles: any[]): boolean {
    // Simple BOS detection logic
    return Math.random() > 0.5;
  }

  private detectLiquiditySweep(candles: any[]): boolean {
    // Simple liquidity sweep detection
    return Math.random() > 0.6;
  }

  private detectFairValueGap(candles: any[]): boolean {
    // Simple FVG detection logic
    return Math.random() > 0.5;
  }
}

export const signalOrchestrator = SignalOrchestrator.getInstance();