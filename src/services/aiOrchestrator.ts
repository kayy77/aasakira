// AI Orchestrator - Comprehensive Signal Generation & Consensus Engine
// Replaces brittle signal generation with resilient, auditable system

import { supabase } from '@/integrations/supabase/client';
import { SignalValidationGate, type SignalValidationInput } from './signalValidationGate';
import { computeAIConsensus, computeConfluenceBucket, computeEV, type AITierVote, type FilterScore } from './canonicalConsensus';

// Provider interfaces
interface ProviderAdapter {
  name: string;
  analyze(marketData: MarketData): Promise<AIModelResponse>;
  isHealthy(): boolean;
  getLatency(): number;
}

interface AIModelResponse {
  provider: string;
  direction: 'long' | 'short' | 'neutral';
  confidence: number; // 0-1
  tier: 'elite' | 'moderate' | 'weak';
  reasoning: string;
  timestamp: string;
  latency_ms: number;
  error?: string;
}

interface MarketData {
  pair: string;
  currentPrice: number;
  timeframe: string;
  session: 'Asian' | 'London' | 'NewYork';
  rsi?: number;
  volume?: number;
  atr?: number;
  candleData?: any[];
}

interface StrategyResult {
  name: string;
  passedFilters: number;
  strategyConfidence: number; // 0-1
  direction: 'long' | 'short' | 'neutral';
  reasons: string[];
  filters: FilterScore[];
}

interface OrchestrationResult {
  signal: any;
  auditTrail: {
    ai_responses: AIModelResponse[];
    consensus: any;
    strategies: StrategyResult[];
    validation: any;
    decision: any;
  };
  performance: {
    total_latency_ms: number;
    provider_latencies: Record<string, number>;
    failed_providers: string[];
  };
}

// Circuit breaker for provider health
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  canExecute(): boolean {
    if (this.failures < this.threshold) return true;
    
    const now = Date.now();
    if (now - this.lastFailure > this.timeout) {
      this.failures = 0;
      return true;
    }
    
    return false;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }

  recordSuccess(): void {
    this.failures = 0;
  }
}

// Provider implementations (stubs for now - implement actual API calls)
class GroqAdapter implements ProviderAdapter {
  name = 'Groq';
  private circuitBreaker = new CircuitBreaker();
  private lastLatency = 0;

  async analyze(marketData: MarketData): Promise<AIModelResponse> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker open');
    }

    const startTime = Date.now();
    
    try {
      // TODO: Implement actual Groq API call
      // For now, simulate response
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      const response: AIModelResponse = {
        provider: 'Groq',
        direction: Math.random() > 0.5 ? 'long' : 'short',
        confidence: 0.6 + Math.random() * 0.3,
        tier: 'elite',
        reasoning: `Groq analysis for ${marketData.pair}`,
        timestamp: new Date().toISOString(),
        latency_ms: Date.now() - startTime
      };

      this.lastLatency = response.latency_ms;
      this.circuitBreaker.recordSuccess();
      return response;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      throw error;
    }
  }

  isHealthy(): boolean {
    return this.circuitBreaker.canExecute();
  }

  getLatency(): number {
    return this.lastLatency;
  }
}

class GeminiAdapter implements ProviderAdapter {
  name = 'Gemini';
  private circuitBreaker = new CircuitBreaker();
  private lastLatency = 0;

  async analyze(marketData: MarketData): Promise<AIModelResponse> {
    if (!this.circuitBreaker.canExecute()) {
      throw new Error('Circuit breaker open');
    }

    const startTime = Date.now();
    
    try {
      // TODO: Implement actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 700));
      
      const response: AIModelResponse = {
        provider: 'Gemini',
        direction: Math.random() > 0.6 ? 'long' : 'short',
        confidence: 0.5 + Math.random() * 0.4,
        tier: 'moderate',
        reasoning: `Gemini analysis for ${marketData.pair}`,
        timestamp: new Date().toISOString(),
        latency_ms: Date.now() - startTime
      };

      this.lastLatency = response.latency_ms;
      this.circuitBreaker.recordSuccess();
      return response;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      throw error;
    }
  }

  isHealthy(): boolean {
    return this.circuitBreaker.canExecute();
  }

  getLatency(): number {
    return this.lastLatency;
  }
}

// Strategy engines
class SMCStrategy {
  static async analyze(marketData: MarketData): Promise<StrategyResult> {
    // Simulate SMC analysis
    const filters: FilterScore[] = [
      { name: 'Order Block', score: Math.random() > 0.3 ? 1 : 0, reason: 'OB detected on H4' },
      { name: 'Liquidity Sweep', score: Math.random() > 0.4 ? 1 : 0, reason: 'Recent sweep confirmed' },
      { name: 'FVG', score: Math.random() > 0.5 ? 0.5 : 0, reason: 'Partial FVG fill' },
      { name: 'Structure', score: Math.random() > 0.4 ? 1 : 0, reason: 'HTF structure intact' }
    ];

    const passedFilters = filters.filter(f => f.score > 0).length;
    const avgScore = filters.reduce((sum, f) => sum + f.score, 0) / filters.length;

    return {
      name: 'SMC',
      passedFilters,
      strategyConfidence: avgScore,
      direction: Math.random() > 0.5 ? 'long' : 'short',
      reasons: filters.filter(f => f.score > 0).map(f => f.reason || f.name),
      filters
    };
  }
}

class SniperStrategy {
  static async analyze(marketData: MarketData): Promise<StrategyResult> {
    // Simulate precision entry analysis
    const filters: FilterScore[] = [
      { name: 'Micro Confirmation', score: Math.random() > 0.4 ? 1 : 0, reason: '1m wick rejection' },
      { name: 'Tight SL', score: Math.random() > 0.3 ? 1 : 0, reason: 'SL < 10 pips' },
      { name: 'Low Spread', score: Math.random() > 0.2 ? 1 : 0, reason: 'Spread within limits' },
      { name: 'Session Timing', score: Math.random() > 0.5 ? 0.5 : 0, reason: 'Optimal session' }
    ];

    const passedFilters = filters.filter(f => f.score > 0).length;
    const avgScore = filters.reduce((sum, f) => sum + f.score, 0) / filters.length;

    return {
      name: 'Sniper',
      passedFilters,
      strategyConfidence: avgScore,
      direction: Math.random() > 0.5 ? 'long' : 'short',
      reasons: filters.filter(f => f.score > 0).map(f => f.reason || f.name),
      filters
    };
  }
}

class AMDStrategy {
  static async analyze(marketData: MarketData): Promise<StrategyResult> {
    // Simulate Adaptive Market Dynamics
    const filters: FilterScore[] = [
      { name: 'Volatility Regime', score: Math.random() > 0.4 ? 1 : 0, reason: 'Optimal ATR ratio' },
      { name: 'VWAP Alignment', score: Math.random() > 0.3 ? 1 : 0, reason: 'Price above VWAP' },
      { name: 'Volume Imbalance', score: Math.random() > 0.5 ? 0.5 : 0, reason: 'Moderate imbalance' },
      { name: 'Session Overlap', score: Math.random() > 0.6 ? 1 : 0, reason: 'London/NY overlap' }
    ];

    const passedFilters = filters.filter(f => f.score > 0).length;
    const avgScore = filters.reduce((sum, f) => sum + f.score, 0) / filters.length;

    return {
      name: 'AMD',
      passedFilters,
      strategyConfidence: avgScore,
      direction: Math.random() > 0.5 ? 'long' : 'short',
      reasons: filters.filter(f => f.score > 0).map(f => f.reason || f.name),
      filters
    };
  }
}

// Main orchestrator
export class AIOrchestrator {
  private providers: ProviderAdapter[] = [
    new GroqAdapter(),
    new GeminiAdapter(),
    // Add other providers as needed
  ];
  
  private readonly PROVIDER_TIMEOUT = 2500; // 2.5s timeout per provider
  private readonly PARALLEL_REQUESTS = true;

  async generateSignal(marketData: MarketData): Promise<OrchestrationResult> {
    const startTime = Date.now();
    
    try {
      // Phase 1: Fan out to AI providers
      const aiResponses = await this.gatherAIVotes(marketData);
      
      // Phase 2: Run strategy engines
      const strategies = await this.runStrategyEngines(marketData);
      
      // Phase 3: Compute canonical consensus
      const consensus = this.computeConsensus(aiResponses, strategies);
      
      // Phase 4: Validate and decide
      const validation = SignalValidationGate.validateSignal({
        pair: marketData.pair,
        direction: consensus.majorityDirection === 'long' ? 'BUY' : 'SELL',
        ai_votes: aiResponses.map(r => ({
          name: r.provider,
          tier: r.tier,
          direction: r.direction,
          confidence: r.confidence
        })),
        confluence_bucket: consensus.confluenceBucket,
        raw_ai_responses: aiResponses,
        strategy_results: strategies
      });
      
      // Phase 5: Build final signal
      const signal = this.buildSignalRecord(marketData, consensus, validation, strategies);
      
      // Phase 6: Persist to database
      await this.persistSignal(signal, {
        ai_responses: aiResponses,
        consensus,
        strategies,
        validation,
        decision: validation
      });

      const totalLatency = Date.now() - startTime;
      
      return {
        signal,
        auditTrail: {
          ai_responses: aiResponses,
          consensus,
          strategies,
          validation,
          decision: validation
        },
        performance: {
          total_latency_ms: totalLatency,
          provider_latencies: this.getProviderLatencies(),
          failed_providers: this.getFailedProviders(aiResponses)
        }
      };
      
    } catch (error) {
      console.error('Orchestration failed:', error);
      throw error;
    }
  }

  private async gatherAIVotes(marketData: MarketData): Promise<AIModelResponse[]> {
    const healthyProviders = this.providers.filter(p => p.isHealthy());
    
    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    const promises = healthyProviders.map(async (provider) => {
      try {
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.PROVIDER_TIMEOUT)
        );
        
        return await Promise.race([provider.analyze(marketData), timeout]);
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    const responses = results
      .filter((result): result is PromiseFulfilledResult<AIModelResponse> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    if (responses.length === 0) {
      throw new Error('All providers failed');
    }

    return responses;
  }

  private async runStrategyEngines(marketData: MarketData): Promise<StrategyResult[]> {
    const [smc, sniper, amd] = await Promise.all([
      SMCStrategy.analyze(marketData),
      SniperStrategy.analyze(marketData),
      AMDStrategy.analyze(marketData)
    ]);

    return [smc, sniper, amd];
  }

  private computeConsensus(aiResponses: AIModelResponse[], strategies: StrategyResult[]): any {
    // Convert AI responses to votes
    const aiVotes: AITierVote[] = aiResponses.map(response => ({
      name: response.provider,
      tier: response.tier,
      direction: response.direction,
      confidence: response.confidence
    }));

    // Compute AI consensus
    const aiConsensus = computeAIConsensus(aiVotes);

    // Aggregate strategy filters
    const allFilters: FilterScore[] = strategies.flatMap(s => s.filters);
    const confluence = computeConfluenceBucket(allFilters);

    // Compute EV
    const rr = 2.4; // Default R:R, should be dynamic based on strategy
    const ev = computeEV(aiConsensus.frac, rr);

    return {
      ...aiConsensus,
      confluenceBucket: confluence.bucket,
      ev,
      rr,
      strategies: strategies.map(s => ({
        name: s.name,
        confidence: s.strategyConfidence,
        passed: s.passedFilters
      }))
    };
  }

  private buildSignalRecord(marketData: MarketData, consensus: any, validation: any, strategies: StrategyResult[]): any {
    return {
      pair: marketData.pair,
      signal_type: 'AI_CONSENSUS',
      direction: consensus.majorityDirection === 'long' ? 'BUY' : 'SELL',
      entry_price: marketData.currentPrice,
      confidence: Math.round(consensus.frac * 100),
      status: validation.status,
      ui_label: validation.ui_label,
      rejection_reasons: validation.rejection_reasons,
      weighted_ai_score: validation.weighted_ai_score,
      max_ai_score: validation.max_ai_score,
      confluence_bucket: consensus.confluenceBucket,
      expected_value: consensus.ev,
      risk_reward_ratio: consensus.rr,
      session_type: marketData.session
    };
  }

  private async persistSignal(signal: any, auditTrail: any): Promise<void> {
    try {
      // Insert signal
      const { data: signalData, error: signalError } = await supabase
        .from('signals')
        .insert({
          ...signal,
          ai_votes: auditTrail.ai_responses.map((r: AIModelResponse) => ({
            name: r.provider,
            tier: r.tier,
            direction: r.direction,
            confidence: r.confidence
          })),
          raw_ai_responses: auditTrail.ai_responses,
          consensus: auditTrail.consensus,
          filters: auditTrail.strategies.flatMap((s: StrategyResult) => s.filters),
          strategy_results: auditTrail.strategies,
          decision: auditTrail.decision
        })
        .select()
        .single();

      if (signalError) throw signalError;

      // Insert audit records
      for (const response of auditTrail.ai_responses) {
        await supabase.from('consensus_audit').insert({
          signal_id: signalData.id,
          request_payload: { marketData: signal.pair },
          raw_response: response,
          latency_ms: response.latency_ms,
          status: response.error ? 'FAILED' : 'SUCCESS',
          provider_name: response.provider,
          error_message: response.error
        });
      }
    } catch (error) {
      console.error('Failed to persist signal:', error);
      throw error;
    }
  }

  private getProviderLatencies(): Record<string, number> {
    return this.providers.reduce((acc, provider) => {
      acc[provider.name] = provider.getLatency();
      return acc;
    }, {} as Record<string, number>);
  }

  private getFailedProviders(responses: AIModelResponse[]): string[] {
    const successfulProviders = new Set(responses.map(r => r.provider));
    return this.providers
      .map(p => p.name)
      .filter(name => !successfulProviders.has(name));
  }
}

export const aiOrchestrator = new AIOrchestrator();