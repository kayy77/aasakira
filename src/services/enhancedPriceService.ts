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
  maxDataAge?: number;
  forceRefresh?: boolean; // NEW: Force bypass cache
}

class EnhancedPriceService {
  private cache = new Map<string, { data: PriceData; timestamp: number }>();
  private readonly CACHE_DURATION = 500; // 0.5 second cache

  async getLivePrice(symbol: string, options: PriceOptions = { 
    allowFallback: false,
    forTrading: true,
    maxDataAge: 1500,
    forceRefresh: false
  }): Promise<PriceData> {
    console.log(`🎯 FETCHING LIVE PRICE for ${symbol} (forceRefresh: ${options.forceRefresh})`);
    
    // For signal generation - ALWAYS bypass cache and get fresh data
    if (options.forTrading || options.forceRefresh) {
      this.cache.delete(symbol);
      console.log(`🔄 FORCE REFRESH: Bypassing cache for ${symbol}`);
    }
    
    // Check cache only for non-trading/non-force-refresh requests
    if (!options.forTrading && !options.forceRefresh) {
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        if (cached.data.price > 0) {
          console.log(`⚡ Cached price for ${symbol}: ${cached.data.price}`);
          return cached.data;
        }
      }
    }

    try {
      // Force fresh data from real-time engine
      const realTimeData = await realTimePriceEngine.getRealTimePrice(symbol);
      
      if (!realTimeData || realTimeData.price <= 0 || isNaN(realTimeData.price)) {
        throw new Error(`Invalid live price: ${realTimeData?.price}`);
      }

      // Check data freshness
      const dataAge = realTimeData.dataAge || 0;
      const maxAge = options.maxDataAge || 1500;
      
      if (options.forTrading && dataAge > maxAge) {
        throw new Error(`Data too old for trading: ${Math.floor(dataAge/1000)}s`);
      }

      const priceData: PriceData = {
        price: realTimeData.price,
        timestamp: realTimeData.timestamp,
        source: realTimeData.source,
        dataAge: dataAge,
        quality: realTimeData.quality
      };

      // Cache only for non-trading requests
      if (!options.forTrading) {
        this.cache.set(symbol, { data: priceData, timestamp: Date.now() });
      }
      
      console.log(`✅ LIVE PRICE for ${symbol}: ${priceData.price} from ${priceData.source}`);
      return priceData;

    } catch (error) {
      console.error(`❌ Failed to get live price for ${symbol}:`, error);
      
      if (!options.allowFallback) {
        throw new Error(`No live prices available for ${symbol}`);
      }

      if (options.forTrading) {
        throw new Error(`Cannot generate trading signal - no live prices for ${symbol}`);
      }

      console.log(`⚠️ Using fallback for ${symbol}`);
      return this.getEnhancedFallback(symbol);
    }
  }

  // NEW: Force fresh price for signal generation
  async getFreshPriceForSignal(symbol: string): Promise<PriceData> {
    console.log(`🔄 GETTING FRESH PRICE FOR SIGNAL: ${symbol}`);
    this.cache.delete(symbol); // Clear any cached data
    
    return await this.getLivePrice(symbol, { 
      allowFallback: false, 
      forTrading: true,
      maxDataAge: 1000, // Max 1 second old
      forceRefresh: true // Force fresh fetch
    });
  }

  // NEW: Get multiple fresh prices for signal generation
  async getFreshPricesForSignals(symbols: string[]): Promise<{ [key: string]: PriceData }> {
    console.log(`🔄 GETTING FRESH PRICES FOR SIGNALS: ${symbols.join(', ')}`);
    
    const promises = symbols.map(async (symbol) => {
      try {
        const priceData = await this.getFreshPriceForSignal(symbol);
        return { symbol, priceData };
      } catch (error) {
        console.error(`Failed to get fresh price for ${symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const pricesMap: { [key: string]: PriceData } = {};
    
    results.forEach(result => {
      if (result) {
        pricesMap[result.symbol] = result.priceData;
      }
    });

    return pricesMap;
  }

  // NEW: Clear all cached prices
  clearAllCache(): void {
    this.cache.clear();
    console.log('🧹 All price cache cleared');
  }

  private getEnhancedFallback(symbol: string): PriceData {
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
    console.log(`👁️ Starting price monitoring for ${symbols.length} symbols every ${intervalMs}ms...`);
    realTimePriceEngine.startPriceFeeds(symbols, intervalMs);
  }

  stopPriceMonitoring(): void {
    console.log(`🛑 Stopping price monitoring`);
  }

  getConnectionStatus() {
    return realTimePriceEngine.getConnectionStatus();
  }

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
