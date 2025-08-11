// AI Provider Adapters with Circuit Breakers and Timeouts
// Normalized interface for all AI providers

import { AIVote, MarketSnapshot } from './SignalOrchestrator';

export interface ProviderConfig {
  name: string;
  timeout: number;
  retries: number;
  circuitBreakerThreshold: number;
  tier: 'elite' | 'moderate' | 'weak';
}

export interface ProviderStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  lastFailure?: Date;
  circuitBreakerOpen: boolean;
}

export abstract class BaseProviderAdapter {
  protected config: ProviderConfig;
  protected stats: ProviderStats;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      circuitBreakerOpen: false
    };
  }

  async getVote(snapshot: MarketSnapshot): Promise<AIVote | null> {
    if (this.stats.circuitBreakerOpen) {
      console.warn(`Circuit breaker open for ${this.config.name}`);
      return null;
    }

    this.stats.totalRequests++;
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        this.analyze(snapshot),
        this.timeoutPromise()
      ]);

      if (result) {
        this.stats.successfulRequests++;
        this.updateLatency(Date.now() - startTime);
        return result;
      }

      throw new Error('Analysis returned null');

    } catch (error) {
      this.handleFailure(error);
      return null;
    }
  }

  protected abstract analyze(snapshot: MarketSnapshot): Promise<AIVote>;

  private timeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), this.config.timeout);
    });
  }

  private handleFailure(error: any): void {
    this.stats.failedRequests++;
    this.stats.lastFailure = new Date();

    const failureRate = this.stats.failedRequests / this.stats.totalRequests;
    if (failureRate >= this.config.circuitBreakerThreshold) {
      this.stats.circuitBreakerOpen = true;
      console.warn(`Circuit breaker opened for ${this.config.name}: ${failureRate * 100}% failure rate`);
      
      // Reset circuit breaker after 5 minutes
      setTimeout(() => {
        this.stats.circuitBreakerOpen = false;
        console.log(`Circuit breaker reset for ${this.config.name}`);
      }, 5 * 60 * 1000);
    }

    console.error(`Provider ${this.config.name} failed:`, error);
  }

  private updateLatency(latency: number): void {
    const total = this.stats.avgLatency * (this.stats.successfulRequests - 1) + latency;
    this.stats.avgLatency = total / this.stats.successfulRequests;
  }

  getStats(): ProviderStats {
    return { ...this.stats };
  }

  getName(): string {
    return this.config.name;
  }
}

export class GroqAdapter extends BaseProviderAdapter {
  constructor() {
    super({
      name: 'Groq',
      timeout: 8000,
      retries: 2,
      circuitBreakerThreshold: 0.5,
      tier: 'elite'
    });
  }

  protected async analyze(snapshot: MarketSnapshot): Promise<AIVote> {
    // In production, this would call the actual Groq API
    // For now, return sophisticated mock data
    
    const isStrong = snapshot.session !== 'Asian' && Math.random() > 0.3;
    
    return {
      name: 'Groq',
      tier: 'elite',
      direction: this.determineDirection(snapshot, isStrong),
      confidence: isStrong ? 75 + Math.random() * 20 : 55 + Math.random() * 15,
      filters: {
        smc: isStrong && Math.random() > 0.2,
        liquiditySweep: Math.random() > 0.4,
        fvg: isStrong && Math.random() > 0.3,
        rsiDivergence: Math.random() > 0.6,
        volumeSpike: Math.random() > 0.4,
        sessionTiming: snapshot.session !== 'Asian'
      },
      reasoning: `Groq analysis: Strong ${snapshot.session} session momentum with institutional patterns detected`
    };
  }

  private determineDirection(snapshot: MarketSnapshot, isStrong: boolean): 'long' | 'short' | 'neutral' {
    if (!isStrong) return 'neutral';
    
    // Simple trend detection based on recent price action
    const trend = snapshot.price > snapshot.vwap ? 'long' : 'short';
    return Math.random() > 0.2 ? trend : 'neutral';
  }
}

export class GeminiAdapter extends BaseProviderAdapter {
  constructor() {
    super({
      name: 'Gemini',
      timeout: 10000,
      retries: 2,
      circuitBreakerThreshold: 0.4,
      tier: 'elite'
    });
  }

  protected async analyze(snapshot: MarketSnapshot): Promise<AIVote> {
    const confluence = this.calculateConfluence(snapshot);
    
    return {
      name: 'Gemini',
      tier: 'elite',
      direction: confluence > 0.7 ? (Math.random() > 0.5 ? 'long' : 'short') : 'neutral',
      confidence: Math.max(60, confluence * 100),
      filters: {
        smc: confluence > 0.6,
        liquiditySweep: confluence > 0.7,
        fvg: confluence > 0.5,
        rsiDivergence: confluence > 0.8,
        volumeSpike: confluence > 0.6,
        sessionTiming: snapshot.session !== 'Asian'
      },
      reasoning: `Gemini analysis: Confluence score ${confluence.toFixed(2)} with multi-timeframe alignment`
    };
  }

  private calculateConfluence(snapshot: MarketSnapshot): number {
    // Mock confluence calculation
    let score = 0.5;
    
    if (snapshot.session === 'London' || snapshot.session === 'NewYork') score += 0.2;
    if (Math.abs(snapshot.price - snapshot.vwap) < snapshot.atr * 0.5) score += 0.1;
    if (snapshot.candles.length > 50) score += 0.1;
    
    return Math.min(1, score + (Math.random() - 0.5) * 0.3);
  }
}

export class CohereAdapter extends BaseProviderAdapter {
  constructor() {
    super({
      name: 'Cohere',
      timeout: 7000,
      retries: 1,
      circuitBreakerThreshold: 0.6,
      tier: 'moderate'
    });
  }

  protected async analyze(snapshot: MarketSnapshot): Promise<AIVote> {
    const sentiment = this.calculateSentiment(snapshot);
    
    return {
      name: 'Cohere',
      tier: 'moderate',
      direction: sentiment > 0.1 ? 'long' : sentiment < -0.1 ? 'short' : 'neutral',
      confidence: 60 + Math.abs(sentiment) * 30,
      filters: {
        smc: Math.abs(sentiment) > 0.3,
        liquiditySweep: Math.random() > 0.5,
        fvg: Math.abs(sentiment) > 0.2,
        rsiDivergence: Math.random() > 0.7,
        volumeSpike: Math.random() > 0.5,
        sessionTiming: snapshot.session !== 'Asian'
      },
      reasoning: `Cohere analysis: Market sentiment ${sentiment.toFixed(2)} with moderate confidence`
    };
  }

  private calculateSentiment(snapshot: MarketSnapshot): number {
    // Mock sentiment calculation
    const priceVsVwap = (snapshot.price - snapshot.vwap) / snapshot.vwap;
    const sessionBoost = snapshot.session === 'Asian' ? -0.1 : 0.1;
    
    return priceVsVwap + sessionBoost + (Math.random() - 0.5) * 0.2;
  }
}

export class OpenRouterAdapter extends BaseProviderAdapter {
  constructor() {
    super({
      name: 'OpenRouter',
      timeout: 12000,
      retries: 3,
      circuitBreakerThreshold: 0.5,
      tier: 'moderate'
    });
  }

  protected async analyze(snapshot: MarketSnapshot): Promise<AIVote> {
    const volatility = this.calculateVolatility(snapshot);
    
    return {
      name: 'OpenRouter',
      tier: 'moderate',
      direction: volatility > 0.002 ? (Math.random() > 0.6 ? 'long' : 'short') : 'neutral',
      confidence: Math.min(85, 50 + volatility * 10000),
      filters: {
        smc: volatility > 0.0015,
        liquiditySweep: volatility > 0.002,
        fvg: volatility > 0.001,
        rsiDivergence: Math.random() > 0.6,
        volumeSpike: volatility > 0.0025,
        sessionTiming: snapshot.session !== 'Asian'
      },
      reasoning: `OpenRouter analysis: Volatility ${volatility.toFixed(4)} suggesting ${volatility > 0.002 ? 'active' : 'quiet'} market`
    };
  }

  private calculateVolatility(snapshot: MarketSnapshot): number {
    if (snapshot.candles.length < 10) return 0.001;
    
    const recent = snapshot.candles.slice(-20);
    const returns = recent.slice(1).map((candle, i) => 
      Math.log(candle.close / recent[i].close)
    );
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }
}

export class TogetherAdapter extends BaseProviderAdapter {
  constructor() {
    super({
      name: 'Together',
      timeout: 9000,
      retries: 2,
      circuitBreakerThreshold: 0.7,
      tier: 'weak'
    });
  }

  protected async analyze(snapshot: MarketSnapshot): Promise<AIVote> {
    const momentum = this.calculateMomentum(snapshot);
    
    return {
      name: 'Together',
      tier: 'weak',
      direction: Math.abs(momentum) > 0.5 ? (momentum > 0 ? 'long' : 'short') : 'neutral',
      confidence: 45 + Math.abs(momentum) * 20,
      filters: {
        smc: Math.abs(momentum) > 0.3,
        liquiditySweep: Math.random() > 0.6,
        fvg: Math.abs(momentum) > 0.4,
        rsiDivergence: Math.random() > 0.8,
        volumeSpike: Math.random() > 0.7,
        sessionTiming: snapshot.session !== 'Asian'
      },
      reasoning: `Together analysis: Momentum ${momentum.toFixed(2)} with basic pattern recognition`
    };
  }

  private calculateMomentum(snapshot: MarketSnapshot): number {
    if (snapshot.candles.length < 5) return 0;
    
    const recent = snapshot.candles.slice(-10);
    const firstPrice = recent[0].close;
    const lastPrice = recent[recent.length - 1].close;
    
    return (lastPrice - firstPrice) / firstPrice * 100;
  }
}

export class ProviderManager {
  private adapters: BaseProviderAdapter[];

  constructor() {
    this.adapters = [
      new GroqAdapter(),
      new GeminiAdapter(), 
      new CohereAdapter(),
      new OpenRouterAdapter(),
      new TogetherAdapter()
    ];
  }

  async getAllVotes(snapshot: MarketSnapshot): Promise<AIVote[]> {
    const promises = this.adapters.map(adapter =>
      adapter.getVote(snapshot)
    );

    const results = await Promise.allSettled(promises);
    const votes: AIVote[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        votes.push(result.value);
      }
    });

    return votes;
  }

  getProviderStats(): Record<string, ProviderStats> {
    const stats: Record<string, ProviderStats> = {};
    
    this.adapters.forEach((adapter) => {
      stats[adapter.getName()] = adapter.getStats();
    });

    return stats;
  }

  resetCircuitBreakers(): void {
    this.adapters.forEach(adapter => {
      const stats = adapter.getStats();
      stats.circuitBreakerOpen = false;
    });
  }
}

export const providerManager = new ProviderManager();