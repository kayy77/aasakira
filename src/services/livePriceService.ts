// 🔥 SEV-0 Live Price Service - Real-time broker feeds with no caching
// Integrates with broker APIs for institutional-grade price feeds

import { brokerPriceAdapter, BrokerPrice } from './brokerPriceAdapter';

export interface LivePriceUpdate {
  symbol: string;
  bid: number;
  ask: number;
  mid: number;
  spread: number;
  timestamp: number;
  provider: 'BROKER' | 'VENDOR_FALLBACK';
  quality: 'GOLD' | 'SILVER' | 'BRONZE';
  latency_ms: number;
}

export interface PriceSubscription {
  symbol: string;
  callback: (update: LivePriceUpdate) => void;
  lastUpdate?: number;
}

class LivePriceService {
  private subscriptions = new Map<string, PriceSubscription[]>();
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_FREQUENCY_MS = 100; // 100ms updates for SEV-0
  
  /**
   * Subscribe to live price updates for a symbol
   */
  subscribeToPrice(symbol: string, callback: (update: LivePriceUpdate) => void): () => void {
    const subscription: PriceSubscription = { symbol, callback };
    
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, []);
    }
    
    this.subscriptions.get(symbol)!.push(subscription);
    
    // Start price updates if first subscription
    if (this.subscriptions.size === 1 && !this.priceUpdateInterval) {
      this.startPriceUpdates();
    }
    
    console.log(`📡 Subscribed to live prices for ${symbol}`);
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(symbol);
      if (subs) {
        const index = subs.indexOf(subscription);
        if (index > -1) {
          subs.splice(index, 1);
        }
        
        // Clean up empty symbol subscriptions
        if (subs.length === 0) {
          this.subscriptions.delete(symbol);
        }
      }
      
      // Stop updates if no subscriptions
      if (this.subscriptions.size === 0) {
        this.stopPriceUpdates();
      }
    };
  }
  
  /**
   * Get current price for symbol (fresh fetch, no cache)
   */
  async getCurrentPrice(symbol: string): Promise<LivePriceUpdate | null> {
    try {
      const brokerPrice = await brokerPriceAdapter.getBrokerPrice(symbol);
      if (!brokerPrice) return null;
      
      return {
        symbol: brokerPrice.symbol,
        bid: brokerPrice.bid,
        ask: brokerPrice.ask,
        mid: brokerPrice.mid,
        spread: brokerPrice.spread,
        timestamp: brokerPrice.timestamp,
        provider: brokerPrice.source,
        quality: brokerPrice.quality,
        latency_ms: Date.now() - brokerPrice.timestamp
      };
    } catch (error) {
      console.error(`❌ Failed to get current price for ${symbol}:`, error);
      return null;
    }
  }
  
  /**
   * Start real-time price updates
   */
  private startPriceUpdates(): void {
    console.log('🚀 Starting live price updates...');
    
    this.priceUpdateInterval = setInterval(async () => {
      const symbols = Array.from(this.subscriptions.keys());
      
      // Fetch prices for all subscribed symbols in parallel
      const pricePromises = symbols.map(async (symbol) => {
        try {
          const price = await this.getCurrentPrice(symbol);
          if (price) {
            // Notify all subscribers for this symbol
            const subs = this.subscriptions.get(symbol) || [];
            subs.forEach(sub => {
              try {
                sub.callback(price);
                sub.lastUpdate = Date.now();
              } catch (callbackError) {
                console.error(`❌ Price callback error for ${symbol}:`, callbackError);
              }
            });
          }
        } catch (error) {
          console.error(`❌ Price update failed for ${symbol}:`, error);
        }
      });
      
      await Promise.allSettled(pricePromises);
    }, this.UPDATE_FREQUENCY_MS);
  }
  
  /**
   * Stop price updates
   */
  private stopPriceUpdates(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
      console.log('⏹️ Stopped live price updates');
    }
  }
  
  /**
   * Get subscription stats for monitoring
   */
  getStats(): {
    activeSymbols: string[];
    totalSubscriptions: number;
    updateFrequency: number;
  } {
    return {
      activeSymbols: Array.from(this.subscriptions.keys()),
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce((sum, subs) => sum + subs.length, 0),
      updateFrequency: this.UPDATE_FREQUENCY_MS
    };
  }
  
  /**
   * Emergency stop all subscriptions
   */
  emergencyStop(): void {
    this.subscriptions.clear();
    this.stopPriceUpdates();
    console.log('🚨 Emergency stop - all price subscriptions cleared');
  }
}

// Export singleton instance
export const livePriceService = new LivePriceService();