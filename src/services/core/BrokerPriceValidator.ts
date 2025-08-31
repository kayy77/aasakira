// 🚨 BROKER PRICE VALIDATOR - Zero Tolerance for Bad Entries
// Primary: Broker websocket | Fallback: Paid feeds | Gate: Tolerance validation

import { RestrictedAssetFilter } from './RestrictedAssetFilter';

export interface BrokerPriceSnapshot {
  symbol: string;
  mid: number;
  bid: number;
  ask: number;
  spread: number;
  spreadPips: number;
  timestamp: number;
  latency_ms: number;
  source: 'BROKER_WS' | 'POLYGON' | 'TRADIER' | 'OANDA' | 'FXCM' | 'FALLBACK';
  quality: 'GOLD' | 'SILVER' | 'BRONZE' | 'REJECTED';
}

export interface PriceValidationResult {
  valid: boolean;
  reason?: string;
  deviation?: number;
  deviationPips?: number;
  snapshot: BrokerPriceSnapshot;
}

export class BrokerPriceValidator {
  private priceCache = new Map<string, BrokerPriceSnapshot>();
  private wsConnections = new Map<string, WebSocket>();
  private readonly CACHE_TTL = 300; // 300ms max age for price data
  private readonly WS_TIMEOUT = 2000; // 2s timeout for websocket responses
  
  // Pip values for different asset classes
  private readonly PIP_VALUES = {
    'EURUSD': 0.0001,
    'GBPUSD': 0.0001, 
    'AUDUSD': 0.0001,
    'NZDUSD': 0.0001,
    'USDCAD': 0.0001,
    'USDJPY': 0.01,
    'NAS100': 0.1,
    'US30': 0.1
  } as const;

  /**
   * Get broker-grade price with validation gates
   */
  async getBrokerValidatedPrice(symbol: string): Promise<PriceValidationResult> {
    const startTime = Date.now();
    
    // 1. Check if asset is allowed
    const assetValidation = RestrictedAssetFilter.validateAssetForSignal(symbol);
    if (!assetValidation.allowed) {
      return {
        valid: false,
        reason: assetValidation.reason,
        snapshot: this.createRejectedSnapshot(symbol, 'ASSET_BLOCKED')
      };
    }

    // 2. Try to get fresh broker price
    let priceSnapshot: BrokerPriceSnapshot | null = null;
    
    // Check cache first (but very short TTL)
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      priceSnapshot = cached;
    } else {
      // Fetch fresh price
      priceSnapshot = await this.fetchFreshBrokerPrice(symbol, startTime);
    }

    if (!priceSnapshot) {
      return {
        valid: false,
        reason: 'NO_PRICE_DATA_AVAILABLE',
        snapshot: this.createRejectedSnapshot(symbol, 'NO_DATA')
      };
    }

    // 3. Validate price quality
    const validation = this.validatePriceQuality(priceSnapshot, symbol);
    
    return validation;
  }

  /**
   * Validate signal entry against broker price with tolerance gate
   */
  validateSignalEntry(
    signalEntry: number, 
    symbol: string, 
    brokerSnapshot: BrokerPriceSnapshot
  ): PriceValidationResult {
    const tolerance = RestrictedAssetFilter.getPriceTolerance(symbol);
    const pipValue = this.getPipValue(symbol);
    
    // Calculate deviation from broker mid price
    const deviation = Math.abs(signalEntry - brokerSnapshot.mid);
    const deviationPips = deviation / pipValue;
    
    // Apply tolerance gate
    if (deviationPips > tolerance) {
      return {
        valid: false,
        reason: `PRICE_DEVIATION_EXCEEDED: ${deviationPips.toFixed(1)} pips > ${tolerance} tolerance`,
        deviation,
        deviationPips,
        snapshot: { ...brokerSnapshot, quality: 'REJECTED' }
      };
    }

    // Check spread quality
    const maxSpreadPips = this.getMaxSpreadPips(symbol);
    if (brokerSnapshot.spreadPips > maxSpreadPips) {
      return {
        valid: false,
        reason: `SPREAD_TOO_WIDE: ${brokerSnapshot.spreadPips.toFixed(1)} pips > ${maxSpreadPips} max`,
        deviation,
        deviationPips,
        snapshot: { ...brokerSnapshot, quality: 'REJECTED' }
      };
    }

    // Check data freshness
    const dataAge = Date.now() - brokerSnapshot.timestamp;
    if (dataAge > 500) { // 500ms max age for signal validation
      return {
        valid: false,
        reason: `PRICE_DATA_STALE: ${dataAge}ms > 500ms max age`,
        deviation,
        deviationPips,
        snapshot: { ...brokerSnapshot, quality: 'BRONZE' }
      };
    }

    return {
      valid: true,
      deviation,
      deviationPips,
      snapshot: brokerSnapshot
    };
  }

  /**
   * Fetch fresh broker price from multiple sources
   */
  private async fetchFreshBrokerPrice(symbol: string, startTime: number): Promise<BrokerPriceSnapshot | null> {
    // 1. Try broker websocket first (highest priority)
    try {
      const wsPrice = await this.fetchFromBrokerWS(symbol, startTime);
      if (wsPrice) return wsPrice;
    } catch (error) {
      console.warn(`Broker WS failed for ${symbol}:`, error);
    }

    // 2. Try paid aggregated feeds
    const fallbackSources = ['POLYGON', 'TRADIER', 'OANDA'] as const;
    
    for (const source of fallbackSources) {
      try {
        const price = await this.fetchFromSource(symbol, source, startTime);
        if (price) return price;
      } catch (error) {
        console.warn(`${source} failed for ${symbol}:`, error);
      }
    }

    // 3. Last resort fallback (marked as low quality)
    return await this.fetchFallbackPrice(symbol, startTime);
  }

  /**
   * Fetch from broker websocket
   */
  private async fetchFromBrokerWS(symbol: string, startTime: number): Promise<BrokerPriceSnapshot | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), this.WS_TIMEOUT);
      
      // Simulate broker websocket - in production, replace with real broker API
      // This would connect to MetaApi, cTrader, Oanda, etc.
      setTimeout(() => {
        clearTimeout(timeout);
        
        const pipValue = this.getPipValue(symbol);
        const mockMid = this.generateMockPrice(symbol);
        const spread = this.getTypicalSpread(symbol) * pipValue;
        
        resolve({
          symbol,
          mid: mockMid,
          bid: mockMid - spread/2,
          ask: mockMid + spread/2,
          spread,
          spreadPips: spread / pipValue,
          timestamp: Date.now(),
          latency_ms: Date.now() - startTime,
          source: 'BROKER_WS',
          quality: 'GOLD'
        });
      }, 50 + Math.random() * 100); // Simulate 50-150ms latency
    });
  }

  /**
   * Fetch from aggregated data source
   */
  private async fetchFromSource(
    symbol: string, 
    source: 'POLYGON' | 'TRADIER' | 'OANDA', 
    startTime: number
  ): Promise<BrokerPriceSnapshot | null> {
    // Simulate API call - replace with real implementations
    const delay = 100 + Math.random() * 200; // 100-300ms API latency
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const pipValue = this.getPipValue(symbol);
        const mockMid = this.generateMockPrice(symbol);
        const spread = this.getTypicalSpread(symbol) * pipValue * 1.2; // Slightly wider spreads
        
        resolve({
          symbol,
          mid: mockMid,
          bid: mockMid - spread/2,
          ask: mockMid + spread/2,
          spread,
          spreadPips: spread / pipValue,
          timestamp: Date.now(),
          latency_ms: Date.now() - startTime,
          source,
          quality: 'SILVER'
        });
      }, delay);
    });
  }

  /**
   * Last resort fallback price
   */
  private async fetchFallbackPrice(symbol: string, startTime: number): Promise<BrokerPriceSnapshot | null> {
    const pipValue = this.getPipValue(symbol);
    const mockMid = this.generateMockPrice(symbol);
    const spread = this.getTypicalSpread(symbol) * pipValue * 1.5; // Wider fallback spreads
    
    return {
      symbol,
      mid: mockMid,
      bid: mockMid - spread/2,
      ask: mockMid + spread/2,
      spread,
      spreadPips: spread / pipValue,
      timestamp: Date.now(),
      latency_ms: Date.now() - startTime,
      source: 'FALLBACK',
      quality: 'BRONZE'
    };
  }

  /**
   * Validate price snapshot quality
   */
  private validatePriceQuality(snapshot: BrokerPriceSnapshot, symbol: string): PriceValidationResult {
    // Check latency
    if (snapshot.latency_ms > 1000) {
      return {
        valid: false,
        reason: `HIGH_LATENCY: ${snapshot.latency_ms}ms > 1000ms max`,
        snapshot: { ...snapshot, quality: 'REJECTED' }
      };
    }

    // Check spread
    const maxSpread = this.getMaxSpreadPips(symbol);
    if (snapshot.spreadPips > maxSpread) {
      return {
        valid: false,
        reason: `SPREAD_EXCEEDED: ${snapshot.spreadPips.toFixed(1)} > ${maxSpread} pips`,
        snapshot: { ...snapshot, quality: 'REJECTED' }
      };
    }

    return {
      valid: true,
      snapshot
    };
  }

  private getPipValue(symbol: string): number {
    return this.PIP_VALUES[symbol as keyof typeof this.PIP_VALUES] || 0.0001;
  }

  private getTypicalSpread(symbol: string): number {
    // Typical spreads in pips during normal market hours
    const spreads = {
      'EURUSD': 0.8,
      'GBPUSD': 1.2,
      'USDJPY': 0.9,
      'AUDUSD': 1.4,
      'USDCAD': 1.6,
      'NZDUSD': 1.8,
      'NAS100': 0.6,
      'US30': 1.0
    };
    return spreads[symbol as keyof typeof spreads] || 2.0;
  }

  private getMaxSpreadPips(symbol: string): number {
    // Maximum acceptable spreads before rejecting
    const maxSpreads = {
      'EURUSD': 2.5,
      'GBPUSD': 3.0,
      'USDJPY': 2.8,
      'AUDUSD': 3.5,
      'USDCAD': 4.0,
      'NZDUSD': 4.5,
      'NAS100': 2.0,
      'US30': 3.0
    };
    return maxSpreads[symbol as keyof typeof maxSpreads] || 5.0;
  }

  private generateMockPrice(symbol: string): number {
    // Mock prices - replace with real price feeds
    const basePrices = {
      'EURUSD': 1.0950,
      'GBPUSD': 1.2750,
      'USDJPY': 147.50,
      'AUDUSD': 0.6520,
      'USDCAD': 1.3650,
      'NZDUSD': 0.6180,
      'NAS100': 18250.0,
      'US30': 38500.0
    };
    
    const base = basePrices[symbol as keyof typeof basePrices] || 1.0000;
    const volatility = 0.0005; // 0.05% random movement
    
    return base * (1 + (Math.random() - 0.5) * volatility);
  }

  private createRejectedSnapshot(symbol: string, reason: string): BrokerPriceSnapshot {
    return {
      symbol,
      mid: 0,
      bid: 0,
      ask: 0,
      spread: 0,
      spreadPips: 0,
      timestamp: Date.now(),
      latency_ms: 0,
      source: 'FALLBACK',
      quality: 'REJECTED'
    };
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.priceCache.clear();
  }

  /**
   * Disconnect all websocket connections
   */
  disconnect(): void {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
  }
}

export const brokerPriceValidator = new BrokerPriceValidator();