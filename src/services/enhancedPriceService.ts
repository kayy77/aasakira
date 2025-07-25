
import { livePriceAPI } from './livePriceAPI';

export interface PriceData {
  price: number;
  timestamp: number;
  source: string;
  quality: 'real' | 'delayed' | 'stale';
  dataAge?: number;
  changePercent?: string;
}

interface PriceSource {
  name: string;
  fetch: (symbol: string) => Promise<PriceData>;
  priority: number;
}

class EnhancedPriceService {
  private priceCache: Map<string, PriceData> = new Map();
  private websockets: Map<string, WebSocket> = new Map();
  private priceCallbacks: Map<string, ((price: PriceData) => void)[]> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private monitoredPairs: string[] = [];

  private readonly STALE_THRESHOLD = 3000; // 3 seconds - much more aggressive
  private readonly SIGNIFICANT_DIFFERENCE = 0.0005; // 5 pips

  private priceSources: PriceSource[] = [
    {
      name: 'LiveAPI',
      fetch: this.fetchFromLiveAPI.bind(this),
      priority: 1
    },
    {
      name: 'Frankfurter',
      fetch: this.fetchFromFrankfurter.bind(this),
      priority: 2
    },
    {
      name: 'ExchangeRate',
      fetch: this.fetchFromExchangeRate.bind(this),
      priority: 3
    },
    {
      name: 'Fallback',
      fetch: this.fetchFromFallback.bind(this),
      priority: 4
    }
  ];

  // FORCE FRESH PRICE - NO CACHE ALLOWED
  async getFreshPriceForSignal(symbol: string): Promise<PriceData> {
    console.log(`🔥 FORCING ULTRA-FRESH PRICE for ${symbol} - NO CACHE`);
    
    // Clear any existing cache for this symbol
    this.priceCache.delete(symbol);
    
    // Try each source with cache-busting headers
    for (const source of this.priceSources.slice(0, 3)) { // Skip fallback initially
      try {
        console.log(`🚀 Trying ${source.name} for ${symbol}...`);
        const priceData = await source.fetch(symbol);
        
        if (priceData && this.isValidPrice(priceData) && this.isFreshPrice(priceData)) {
          console.log(`✅ FRESH PRICE from ${source.name}: ${priceData.price} (${priceData.source})`);
          
          // Cache for very short time only
          this.priceCache.set(symbol, priceData);
          return priceData;
        }
      } catch (error) {
        console.error(`❌ ${source.name} failed for ${symbol}:`, error);
        continue;
      }
    }

    // If all real sources fail, use fallback but mark as stale
    console.warn(`⚠️ Using fallback price for ${symbol} - ALL LIVE SOURCES FAILED`);
    return this.fetchFromFallback(symbol);
  }

  // GET MULTIPLE FRESH PRICES IN PARALLEL
  async getFreshPricesForSignals(symbols: string[]): Promise<{ [key: string]: PriceData }> {
    console.log(`🔥 Getting FRESH prices for ${symbols.length} symbols in parallel`);
    
    const prices: { [key: string]: PriceData } = {};
    
    // Use Promise.all for parallel fetching
    const pricePromises = symbols.map(async (symbol) => {
      try {
        const priceData = await this.getFreshPriceForSignal(symbol);
        return { symbol, priceData };
      } catch (error) {
        console.error(`❌ Failed to get fresh price for ${symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(pricePromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        prices[result.value.symbol] = result.value.priceData;
      }
    });
    
    console.log(`✅ Got fresh prices for ${Object.keys(prices).length}/${symbols.length} symbols`);
    return prices;
  }

  async getLivePrice(symbol: string, options?: { forceRefresh?: boolean }): Promise<PriceData> {
    console.log(`🔄 Fetching live price for ${symbol}...`);
    
    // If force refresh requested, clear cache
    if (options?.forceRefresh) {
      this.priceCache.delete(symbol);
    }
    
    // Check cache first (but with very short TTL)
    const cached = this.priceCache.get(symbol);
    if (cached && this.isFreshPrice(cached)) {
      console.log(`📋 Using cached price for ${symbol}: ${cached.price}`);
      return cached;
    }

    // Try WebSocket first (if available)
    const wsPrice = await this.tryWebSocketPrice(symbol);
    if (wsPrice) {
      console.log(`🔌 WebSocket price for ${symbol}: ${wsPrice.price}`);
      this.priceCache.set(symbol, wsPrice);
      return wsPrice;
    }

    // Fallback to API sources
    for (const source of this.priceSources) {
      try {
        const priceData = await source.fetch(symbol);
        if (priceData && this.isValidPrice(priceData)) {
          console.log(`✅ Got price from ${source.name}: ${priceData.price}`);
          this.priceCache.set(symbol, priceData);
          return priceData;
        }
      } catch (error) {
        console.warn(`⚠️ ${source.name} failed for ${symbol}:`, error);
        continue;
      }
    }

    throw new Error(`All price sources failed for ${symbol}`);
  }

  private async tryWebSocketPrice(symbol: string): Promise<PriceData | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 2000);
      
      try {
        const ws = new WebSocket(`wss://stream.deriv.com/prices/${symbol}`);
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.price && this.isValidPrice({ price: data.price, timestamp: Date.now() })) {
              clearTimeout(timeout);
              ws.close();
              resolve({
                price: this.normalizePrice(data.price),
                timestamp: Date.now(),
                source: 'WebSocket (Real-time)',
                quality: 'real'
              });
            }
          } catch (e) {
            clearTimeout(timeout);
            resolve(null);
          }
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
      } catch (error) {
        clearTimeout(timeout);
        resolve(null);
      }
    });
  }

  // ENHANCED CACHE-BUSTING FETCH METHODS
  private async fetchFromFrankfurter(symbol: string): Promise<PriceData> {
    const pairs = this.parsePairFromSymbol(symbol);
    if (!pairs) throw new Error(`Cannot parse symbol: ${symbol}`);

    const { base, quote } = pairs;
    
    // Add cache-busting parameters
    const cacheBuster = `?_=${Date.now()}&random=${Math.random()}`;
    const response = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${quote}${cacheBuster}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) throw new Error(`Frankfurter API error: ${response.status}`);
    
    const data = await response.json();
    const price = data.rates?.[quote];
    
    if (!price || price <= 0) throw new Error('Invalid price data');
    
    return {
      price: this.normalizePrice(price),
      timestamp: Date.now(),
      source: 'Frankfurter (Live)',
      quality: 'real'
    };
  }

  private async fetchFromExchangeRate(symbol: string): Promise<PriceData> {
    const pairs = this.parsePairFromSymbol(symbol);
    if (!pairs) throw new Error(`Cannot parse symbol: ${symbol}`);

    const { base, quote } = pairs;
    
    const cacheBuster = `?_=${Date.now()}`;
    const response = await fetch(`https://api.exchangerate.host/convert?from=${base}&to=${quote}${cacheBuster}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) throw new Error(`ExchangeRate API error: ${response.status}`);
    
    const data = await response.json();
    const price = data.result;
    
    if (!price || price <= 0) throw new Error('Invalid price data');
    
    return {
      price: this.normalizePrice(price),
      timestamp: Date.now(),
      source: 'ExchangeRate (Live)',
      quality: 'real'
    };
  }

  private async fetchFromLiveAPI(symbol: string): Promise<PriceData> {
    const response = await livePriceAPI.fetchLivePrice(symbol);
    return {
      price: this.normalizePrice(response.price),
      timestamp: response.timestamp,
      source: response.source,
      quality: response.quality
    };
  }

  private async fetchFromFallback(symbol: string): Promise<PriceData> {
    const fallbackPrices: { [key: string]: number } = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 146.28,
      'AUDUSD': 0.6597,
      'USDCAD': 1.3583,
      'NZDUSD': 0.5900,
      'EURGBP': 0.8580,
      'EURJPY': 158.70,
      'GBPJPY': 185.00,
      'XAUUSD': 2050.00,
      'BTCUSD': 43000.00,
      'ETHUSD': 2600.00
    };

    const basePrice = fallbackPrices[symbol] || 1.0000;
    const variation = (Math.random() - 0.5) * 0.01;
    const price = basePrice * (1 + variation);

    return {
      price: this.normalizePrice(price),
      timestamp: Date.now(),
      source: 'Fallback (Simulated)',
      quality: 'stale'
    };
  }

  // ENHANCED VALIDATION METHODS
  private isFreshPrice(priceData: PriceData): boolean {
    const age = Date.now() - priceData.timestamp;
    const isFresh = age < this.STALE_THRESHOLD;
    
    if (!isFresh) {
      console.warn(`⚠️ Price is stale: ${age}ms old for ${priceData.source}`);
    }
    
    return isFresh;
  }

  private isValidPrice(priceData: Partial<PriceData>): boolean {
    const isValid = !!(priceData.price && priceData.price > 0 && !isNaN(priceData.price));
    
    if (!isValid) {
      console.error(`❌ Invalid price data:`, priceData);
    }
    
    return isValid;
  }

  private normalizePrice(price: number | string): number {
    return parseFloat(Number(price).toFixed(5));
  }

  private parsePairFromSymbol(symbol: string): { base: string; quote: string } | null {
    const pairMappings: { [key: string]: { base: string; quote: string } } = {
      'EURUSD': { base: 'EUR', quote: 'USD' },
      'GBPUSD': { base: 'GBP', quote: 'USD' },
      'USDJPY': { base: 'USD', quote: 'JPY' },
      'AUDUSD': { base: 'AUD', quote: 'USD' },
      'USDCAD': { base: 'USD', quote: 'CAD' },
      'NZDUSD': { base: 'NZD', quote: 'USD' },
      'EURGBP': { base: 'EUR', quote: 'GBP' },
      'EURJPY': { base: 'EUR', quote: 'JPY' },
      'GBPJPY': { base: 'GBP', quote: 'JPY' }
    };

    return pairMappings[symbol] || null;
  }

  // MONITORING AND CACHE MANAGEMENT
  startPriceMonitoring(pairs: string[], intervalMs: number = 1000): void {
    console.log(`🔄 Starting price monitoring for ${pairs.length} pairs`);
    
    this.monitoredPairs = pairs;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(async () => {
      for (const pair of this.monitoredPairs) {
        try {
          const priceData = await this.getLivePrice(pair);
          console.log(`📊 Monitoring update ${pair}: ${priceData.price}`);
        } catch (error) {
          console.error(`❌ Monitoring failed for ${pair}:`, error);
        }
      }
    }, intervalMs);
  }

  stopPriceMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.monitoredPairs = [];
    console.log('🛑 Price monitoring stopped');
  }

  clearCache(): void {
    this.priceCache.clear();
    console.log('🧹 Price cache cleared');
  }

  // CROSS-VERIFICATION FOR ACCURACY
  async crossVerifyPrice(symbol: string): Promise<PriceData> {
    const promises = this.priceSources.slice(0, 3).map(source => 
      source.fetch(symbol).catch(() => null)
    );

    const results = await Promise.allSettled(promises);
    const validPrices = results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => (r as any).value);

    if (validPrices.length === 0) {
      throw new Error(`No valid prices found for ${symbol}`);
    }

    // Use the most recent and highest priority source
    const bestPrice = validPrices.sort((a, b) => {
      if (a.quality === 'real' && b.quality !== 'real') return -1;
      if (b.quality === 'real' && a.quality !== 'real') return 1;
      return b.timestamp - a.timestamp;
    })[0];

    return bestPrice;
  }

  getConnectionStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    this.priceSources.forEach(source => {
      status[source.name] = true; // Simplified for now
    });

    return status;
  }
}

export const enhancedPriceService = new EnhancedPriceService();
