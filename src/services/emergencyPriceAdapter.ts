// 🚨 EMERGENCY PRICE ADAPTER - SEV-0 HOTFIX
// Implements broker-first pricing with no cached ticks and strict validation

export interface EmergencyPriceTick {
  symbol: string;
  bid: number;
  ask: number;
  mid: number;
  spread: number;
  ts: number;
  latency_ms?: number;
  provider: 'BROKER' | 'FALLBACK';
}

export interface TickValidationResult {
  valid: boolean;
  error_code?: string;
  message?: string;
}

export class EmergencyPriceAdapter {
  // EMERGENCY SAFE MODE - Max global throttle
  private static readonly GLOBAL_THROTTLE_MS = 30 * 60 * 1000; // 30m
  private static lastGlobalPublish = 0;

  /**
   * Get latest broker tick - NO CACHING, broker-first with fallback
   */
  async latestBrokerTick(symbol: string): Promise<EmergencyPriceTick> {
    try {
      // Try broker first - NO CACHE
      const broker = await this.fetchBrokerTick(symbol);
      const now = Date.now();
      
      if (broker && (now - broker.ts) < 8000 && broker.provider === 'BROKER') {
        return broker;
      }

      // Single fallback attempt - NO CACHING
      console.warn(`⚠️ Broker tick stale for ${symbol}, using fallback`);
      const fallback = await this.fetchFallbackTick(symbol);
      
      if (!fallback) {
        throw this.makeStructuredError('no_live_feed', `No price feed available for ${symbol}`);
      }
      
      if ((now - fallback.ts) > 8000) {
        throw this.makeStructuredError('stale_tick', `Fallback tick too old: ${now - fallback.ts}ms`);
      }
      
      return fallback;
      
    } catch (error) {
      console.error(`❌ Price fetch failed for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Validate tick integrity - reject stale/duplicate/high latency
   */
  validateTick(tick: EmergencyPriceTick): TickValidationResult {
    if (!tick || !tick.ts) {
      return { valid: false, error_code: 'no_tick', message: 'Missing tick data' };
    }

    const deltaMs = Date.now() - tick.ts;
    
    // EMERGENCY RULE: Reject ticks older than 8s
    if (deltaMs > 8000) {
      return { 
        valid: false, 
        error_code: 'stale_tick', 
        message: `Tick age ${deltaMs}ms exceeds 8s limit` 
      };
    }

    // High latency check
    if (tick.latency_ms && tick.latency_ms > 500) {
      return { 
        valid: false, 
        error_code: 'high_latency', 
        message: `Tick latency ${tick.latency_ms}ms too high` 
      };
    }

    // Spread sanity check
    if (tick.spread <= 0 || tick.spread > tick.mid * 0.01) { // >1% spread is suspicious
      return { 
        valid: false, 
        error_code: 'invalid_spread', 
        message: `Suspicious spread: ${tick.spread}` 
      };
    }

    return { valid: true };
  }

  /**
   * Check price integrity against tolerance
   */
  validatePriceIntegrity(engineMid: number, brokerTick: EmergencyPriceTick, symbol: string): TickValidationResult {
    const tolerance = this.getPriceTolerance(symbol);
    const delta = Math.abs(engineMid - brokerTick.mid);
    
    if (delta > tolerance) {
      return {
        valid: false,
        error_code: 'price_tolerance',
        message: `Price delta ${delta} exceeds tolerance ${tolerance} for ${symbol}`
      };
    }

    return { valid: true };
  }

  /**
   * Check global throttle for emergency safe mode
   */
  canPublishGlobally(): boolean {
    const now = Date.now();
    return (now - EmergencyPriceAdapter.lastGlobalPublish) >= EmergencyPriceAdapter.GLOBAL_THROTTLE_MS;
  }

  /**
   * Update global publish timestamp
   */
  updateGlobalPublishTime(): void {
    EmergencyPriceAdapter.lastGlobalPublish = Date.now();
  }

  // Private helper methods

  private async fetchBrokerTick(symbol: string): Promise<EmergencyPriceTick | null> {
    try {
      // Simulate broker API call - replace with actual broker integration
      const mockPrice = this.getMockPrice(symbol);
      const spread = this.getMockSpread(symbol);
      
      return {
        symbol,
        bid: mockPrice - spread / 2,
        ask: mockPrice + spread / 2,
        mid: mockPrice,
        spread,
        ts: Date.now() - Math.random() * 2000, // Simulate 0-2s latency
        latency_ms: Math.random() * 100,
        provider: 'BROKER'
      };
    } catch (error) {
      console.error(`❌ Broker fetch failed for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchFallbackTick(symbol: string): Promise<EmergencyPriceTick | null> {
    try {
      // Simulate fallback API call - replace with actual fallback integration
      const mockPrice = this.getMockPrice(symbol);
      const spread = this.getMockSpread(symbol) * 1.5; // Wider spreads for fallback
      
      return {
        symbol,
        bid: mockPrice - spread / 2,
        ask: mockPrice + spread / 2,
        mid: mockPrice,
        spread,
        ts: Date.now() - Math.random() * 1000, // Simulate 0-1s latency
        latency_ms: Math.random() * 200,
        provider: 'FALLBACK'
      };
    } catch (error) {
      console.error(`❌ Fallback fetch failed for ${symbol}:`, error);
      return null;
    }
  }

  private getPriceTolerance(symbol: string): number {
    const tolerances: Record<string, number> = {
      'NAS100': 0.75,   // 0.75 points max deviation
      'US30': 1.2,      // 1.2 points max deviation  
      'USDJPY': 0.015,  // 1.5 pips max deviation
    };
    return tolerances[symbol] || 0.00015; // Default 1.5 pips for FX
  }

  private getMockPrice(symbol: string): number {
    const prices: Record<string, number> = {
      'NAS100': 18250 + Math.random() * 100,
      'US30': 39500 + Math.random() * 200,
      'USDJPY': 149.50 + Math.random() * 1,
    };
    return prices[symbol] || 1.0850; // Default price
  }

  private getMockSpread(symbol: string): number {
    const spreads: Record<string, number> = {
      'NAS100': 0.8 + Math.random() * 0.4,
      'US30': 1.2 + Math.random() * 0.8,
      'USDJPY': 0.015 + Math.random() * 0.01,
    };
    return spreads[symbol] || 0.00015; // Default spread
  }

  private makeStructuredError(code: string, message: string): Error {
    const error = new Error(`${code}:${message}`);
    (error as any).code = code;
    return error;
  }
}

// Export singleton instance
export const emergencyPriceAdapter = new EmergencyPriceAdapter();