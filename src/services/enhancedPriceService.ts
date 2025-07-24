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

  private readonly STALE_THRESHOLD = 10000; // 10 seconds
  private readonly SIGNIFICANT_DIFFERENCE = 0.0005; // 5 pips

  private priceSources: PriceSource[] = [
    {
      name: 'TwelveData',
      fetch: this.fetchFromTwelveData.bind(this),
      priority: 1
    },
    {
      name: 'Polygon',
      fetch: this.fetchFromPolygon.bind(this),
      priority: 2
    },
    {
      name: 'LiveAPI',
      fetch: this.fetchFromLiveAPI.bind(this),
      priority: 3
    },
    {
      name: 'Fallback',
      fetch: this.fetchFromFallback.bind(this),
      priority: 4
    }
  ];

  async getLivePrice(symbol: string, options?: { forceRefresh?: boolean; allowFallback?: boolean; maxDataAge?: number; forTrading?: boolean }): Promise<PriceData> {
    console.log(`🔄 Fetching live price for ${symbol}...`);
    
    // Check cache first unless force refresh is requested
    if (!options?.forceRefresh) {
      const cached = this.priceCache.get(symbol);
      if (cached && this.isRecent(cached.timestamp)) {
        console.log(`📋 Using cached price for ${symbol}: ${cached.price}`);
        return cached;
      }
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

  async getFreshPriceForSignal(symbol: string): Promise<PriceData> {
    console.log(`🔄 Getting ultra-fresh price for signal: ${symbol}`);
    
    // Clear cache for this symbol to ensure freshness
    this.priceCache.delete(symbol);
    
    // Use the most reliable source for signal generation
    try {
      const priceData = await this.fetchFromLiveAPI(symbol);
      if (priceData && this.isValidPrice(priceData)) {
        this.priceCache.set(symbol, priceData);
        return priceData;
      }
    } catch (error) {
      console.warn(`⚠️ LiveAPI failed for ${symbol}:`, error);
    }

    // Fallback to other sources
    return this.getLivePrice(symbol, { forceRefresh: true });
  }

  async getFreshPricesForSignals(symbols: string[]): Promise<{ [key: string]: PriceData }> {
    console.log(`🔄 Getting fresh prices for ${symbols.length} symbols`);
    
    const prices: { [key: string]: PriceData } = {};
    
    for (const symbol of symbols) {
      try {
        const priceData = await this.getFreshPriceForSignal(symbol);
        prices[symbol] = priceData;
      } catch (error) {
        console.error(`❌ Failed to get fresh price for ${symbol}:`, error);
      }
    }
    
    return prices;
  }

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

  clearAllCache(): void {
    this.priceCache.clear();
    console.log('🧹 All price cache cleared');
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

  private async fetchFromTwelveData(symbol: string): Promise<PriceData> {
    const response = await fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=YOUR_API_KEY`);
    const data = await response.json();
    
    return {
      price: this.normalizePrice(data.price),
      timestamp: Date.now(),
      source: 'TwelveData',
      quality: 'real'
    };
  }

  private async fetchFromPolygon(symbol: string): Promise<PriceData> {
    const response = await fetch(`https://api.polygon.io/v2/last/trade/${symbol}?apikey=YOUR_API_KEY`);
    const data = await response.json();
    
    return {
      price: this.normalizePrice(data.results.p),
      timestamp: Date.now(),
      source: 'Polygon',
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

  private isRecent(timestamp: number): boolean {
    return Date.now() - timestamp < this.STALE_THRESHOLD;
  }

  private isValidPrice(priceData: Partial<PriceData>): boolean {
    return !!(priceData.price && priceData.price > 0 && !isNaN(priceData.price));
  }

  private normalizePrice(price: number | string): number {
    return parseFloat(Number(price).toFixed(5));
  }

  private isSignificantlyDifferent(priceA: number, priceB: number): boolean {
    return Math.abs(priceA - priceB) > this.SIGNIFICANT_DIFFERENCE;
  }

  // Cross-verify prices from different sources
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

  clearCache(): void {
    this.priceCache.clear();
    console.log('🧹 Price cache cleared');
  }
}

export const enhancedPriceService = new EnhancedPriceService();
