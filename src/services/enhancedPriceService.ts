
import { fetchLivePrice } from '@/utils/fetchLivePrice';

export interface PriceData {
  price: number;
  timestamp: number;
  source: string;
  age: number;
  changePercent?: number;
}

class EnhancedPriceService {
  private priceCache = new Map<string, PriceData>();
  private readonly CACHE_DURATION = 5000; // 5 seconds max
  
  async getLivePrice(pair: string, forceRefresh: boolean = false): Promise<PriceData> {
    const cached = this.priceCache.get(pair);
    const now = Date.now();
    
    // Use cache only if fresh and not force refresh
    if (!forceRefresh && cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return {
        ...cached,
        age: now - cached.timestamp
      };
    }

    console.log(`🔄 Fetching ultra-fresh price for ${pair}...`);
    
    try {
      // Use the new fallback system
      const price = await fetchLivePrice(pair);
      const timestamp = now;
      const changePercent = await this.calculateChangePercent(pair, price);
      
      const priceData: PriceData = {
        price,
        timestamp,
        changePercent,
        source: 'Multi-API',
        age: 0
      };
      
      this.priceCache.set(pair, priceData);
      return priceData;
    } catch (error) {
      console.error(`Failed to fetch price for ${pair}:`, error);
      
      // Return cached if available, otherwise fallback
      if (cached) {
        return {
          ...cached,
          age: now - cached.timestamp
        };
      }
      
      return this.getFallbackPrice(pair);
    }
  }

  async getFreshPriceForSignal(pair: string): Promise<PriceData> {
    console.log(`🔥 Getting ultra-fresh price for signal: ${pair}`);
    return this.getLivePrice(pair, true);
  }

  async getFreshPricesForSignals(pairs: string[]): Promise<Record<string, PriceData>> {
    console.log(`🔄 Fetching fresh prices for ${pairs.length} pairs...`);
    const result: Record<string, PriceData> = {};
    
    for (const pair of pairs) {
      try {
        result[pair] = await this.getFreshPriceForSignal(pair);
      } catch (error) {
        console.error(`Failed to fetch price for ${pair}:`, error);
        result[pair] = this.getFallbackPrice(pair);
      }
    }
    
    return result;
  }

  getConnectionStatus(): 'connected' | 'disconnected' {
    // Check if we have recent successful price fetches
    const now = Date.now();
    for (const [pair, data] of this.priceCache) {
      if (now - data.timestamp < 30000) { // 30 seconds
        return 'connected';
      }
    }
    return 'disconnected';
  }

  private async calculateChangePercent(pair: string, currentPrice: number): Promise<number> {
    const cached = this.priceCache.get(pair);
    if (cached && cached.price !== currentPrice) {
      return ((currentPrice - cached.price) / cached.price) * 100;
    }
    return 0;
  }

  private getFallbackPrice(pair: string): PriceData {
    const fallbackPrices: { [key: string]: number } = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 150.25,
      'AUDUSD': 0.6650,
      'USDCAD': 1.3580
    };

    const timestamp = Date.now();
    return {
      price: fallbackPrices[pair] || 1.0000,
      timestamp,
      source: 'Fallback',
      age: 0,
      changePercent: 0
    };
  }

  clearCache(): void {
    this.priceCache.clear();
  }
}

export const enhancedPriceService = new EnhancedPriceService();
