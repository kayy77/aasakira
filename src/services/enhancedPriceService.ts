
import { realTimePriceEngine, LivePriceData } from './realtimePriceEngine';

interface PriceData {
  price: number;
  timestamp: number;
  source: string;
  change?: number;
  changePercent?: string;
  dataAge?: number;
  quality?: 'real' | 'delayed' | 'stale';
}

interface PriceOptions {
  allowFallback?: boolean;
  forTrading?: boolean;
  maxDataAge?: number; // Max acceptable data age in milliseconds
}

class EnhancedPriceService {
  private cache = new Map<string, { data: PriceData; timestamp: number }>();
  private readonly CACHE_DURATION = 500; // 0.5 second cache - ultra fresh for signals

  async getLivePrice(symbol: string, options: PriceOptions = { 
    allowFallback: false, // NO fallback for signals by default
    forTrading: true,
    maxDataAge: 1500 // Max 1.5 seconds old
  }): Promise<PriceData> {
    console.log(`🎯 ULTRA-PRECISION live price fetch for ${symbol}...`);
    
    // For trading signals, always fetch fresh data - no cache
    if (options.forTrading) {
      this.cache.delete(symbol);
      console.log(`🔄 TRADING MODE: Bypassing cache for ${symbol}`);
    }
    
    // Check ultra-short cache only for non-trading requests
    if (!options.forTrading) {
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        if (cached.data.price <= 0) {
          console.warn(`❌ Invalid cached price for ${symbol}: ${cached.data.price}`);
          this.cache.delete(symbol);
        } else {
          console.log(`⚡ Ultra-fresh cached price for ${symbol}: ${cached.data.price} (${cached.data.source})`);
          return cached.data;
        }
      }
    }

    try {
      // PRIORITY 1: Get from real-time WebSocket engine
      const realTimeData = await realTimePriceEngine.getRealTimePrice(symbol);
      
      // STRICT VALIDATION for trading signals
      if (!realTimeData || realTimeData.price <= 0 || isNaN(realTimeData.price)) {
        throw new Error(`Invalid real-time price data: ${realTimeData?.price}`);
      }

      // Check data freshness for trading signals
      const dataAge = realTimeData.dataAge || 0;
      const maxAge = options.maxDataAge || 1500;
      
      if (options.forTrading) {
        // CRITICAL: For trading, reject stale or fallback data
        if (realTimeData.quality === 'stale' || realTimeData.source.includes('Fallback')) {
          throw new Error(`Cannot use ${realTimeData.quality} data (${realTimeData.source}) for trading signal`);
        }
        
        if (dataAge > maxAge) {
          throw new Error(`Data too old for trading: ${Math.floor(dataAge/1000)}s > ${Math.floor(maxAge/1000)}s limit`);
        }
      }

      // Convert to PriceData format
      const priceData: PriceData = {
        price: realTimeData.price,
        timestamp: realTimeData.timestamp,
        source: realTimeData.source,
        dataAge: dataAge,
        quality: realTimeData.quality
      };

      // Only cache non-trading requests
      if (!options.forTrading) {
        this.cache.set(symbol, { data: priceData, timestamp: Date.now() });
      }
      
      const ageDisplay = dataAge > 0 ? `${Math.floor(dataAge/1000)}s ago` : 'live';
      console.log(`✅ ULTRA-PRECISION price for ${symbol}: ${priceData.price} from ${priceData.source} (${ageDisplay}, ${realTimeData.quality})`);
      
      return priceData;

    } catch (error) {
      console.error(`❌ Failed to get live price for ${symbol}:`, error);
      
      if (!options.allowFallback) {
        throw new Error(`No valid live prices available for ${symbol} and fallback is disabled`);
      }

      if (options.forTrading) {
        throw new Error(`Cannot generate trading signal for ${symbol} - no valid live prices available`);
      }

      // Enhanced fallback with clear marking
      console.log(`⚠️ Using enhanced fallback for ${symbol} (VISUALIZATION ONLY)`);
      return this.getEnhancedFallback(symbol);
    }
  }

  // Force refresh live price (no cache) with maximum accuracy - FOR TRADING SIGNALS
  async getFreshLivePrice(symbol: string): Promise<PriceData> {
    console.log(`🔄 ULTRA-PRECISION FORCE REFRESH FOR TRADING: ${symbol}`);
    this.cache.delete(symbol); // Clear cache
    
    // CRITICAL: For trading signals, we CANNOT allow fallback or old data
    return await this.getLivePrice(symbol, { 
      allowFallback: false, 
      forTrading: true,
      maxDataAge: 1500 // Max 1.5 seconds old for trading
    });
  }

  private getEnhancedFallback(symbol: string): PriceData {
    // Current accurate market prices (updated January 2025)
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0421,
      'GBPUSD': 1.2556,
      'USDJPY': 156.25,
      'AUDUSD': 0.6234,
      'USDCAD': 1.4125,
      'NZDUSD': 0.5678,
      'EURGBP': 0.8310,
      'EURJPY': 162.85,
      'GBPJPY': 195.75,
      'XAUUSD': 2687.50,
      'BTCUSD': 121850.00,
      'ETHUSD': 4156.75
    };
    
    const basePrice = basePrices[symbol] || 1.0000;
    
    return {
      price: basePrice,
      timestamp: Date.now(),
      source: 'Enhanced Fallback (VISUALIZATION ONLY)',
      changePercent: '0.00%',
      quality: 'stale'
    };
  }

  startPriceMonitoring(symbols: string[], intervalMs: number = 500): void {
    console.log(`👁️ Starting ULTRA-PRECISION price monitoring for ${symbols.length} symbols every ${intervalMs}ms...`);
    realTimePriceEngine.startPriceFeeds(symbols, intervalMs);
  }

  stopPriceMonitoring(): void {
    console.log(`🛑 Stopping price monitoring`);
    // Real-time engine handles its own lifecycle
  }

  // Get WebSocket connection status
  getConnectionStatus() {
    return realTimePriceEngine.getConnectionStatus();
  }

  // Subscribe to real-time price updates
  subscribeToPrice(symbol: string, callback: (price: PriceData) => void): () => void {
    return realTimePriceEngine.subscribeToPrice(symbol, (livePriceData) => {
      const priceData: PriceData = {
        price: livePriceData.price,
        timestamp: livePriceData.timestamp,
        source: livePriceData.source,
        dataAge: livePriceData.dataAge,
        quality: livePriceData.quality
      };
      callback(priceData);
    });
  }
}

export const enhancedPriceService = new EnhancedPriceService();
export type { PriceData, PriceOptions };
