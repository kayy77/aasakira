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
      // SEV-0 FIX: No random responses in production
      if (process.env.NODE_ENV === 'production') {
        // TODO: Implement actual Groq API call
        throw new Error('Groq API not yet implemented for production');
      }

      // Development: Deterministic response for testing
      const response: AIModelResponse = {
        provider: 'Groq',
        direction: 'neutral', // Deterministic neutral until real API is implemented
        confidence: 0.0, // Zero confidence for mock responses
        tier: 'weak',
        reasoning: `Mock Groq analysis for ${marketData.pair} - implement real API`,
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
      // SEV-0 FIX: No random responses in production
      if (process.env.NODE_ENV === 'production') {
        // TODO: Implement actual Gemini API call
        throw new Error('Gemini API not yet implemented for production');
      }

      // Development: Deterministic response for testing
      const response: AIModelResponse = {
        provider: 'Gemini',
        direction: 'neutral', // Deterministic neutral until real API is implemented
        confidence: 0.0, // Zero confidence for mock responses
        tier: 'weak',
        reasoning: `Mock Gemini analysis for ${marketData.pair} - implement real API`,
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

// SEV-0 HOTFIX: Import deterministic strategies
import { SMCStrategy, SniperStrategy, AMDStrategy } from './core/ProductionStrategyEngines';

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

    // SEV-0 FIX: Validate AI responses to prevent random data
    const validResponses = responses.filter(this.validateAIResponse);

    if (validResponses.length === 0) {
      throw new Error('All providers failed or returned invalid responses');
    }

    return validResponses;
  }

  /**
   * SEV-0 FIX: Validate AI responses to prevent random/invalid data
   */
  private validateAIResponse(response: AIModelResponse): boolean {
    if (!response) return false;
    if (response.confidence == null || isNaN(response.confidence)) return false;
    if (!['long', 'short', 'neutral'].includes(response.direction)) return false;
    if (response.confidence < 0 || response.confidence > 1) return false;
    
    // In production, reject zero-confidence mock responses
    if (process.env.NODE_ENV === 'production' && response.confidence === 0) {
      return false;
    }
    
    return true;
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
    // SEV-0 FIX: Validate consensus before building signal
    if (consensus.frac === null || isNaN(consensus.frac) || consensus.frac < 0) {
      throw new Error('Invalid consensus fraction - cannot build signal');
    }

    // Don't persist signals below minimum threshold
    if (consensus.frac < 0.45) {
      throw new Error('Consensus below minimum threshold - signal rejected');
    }

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