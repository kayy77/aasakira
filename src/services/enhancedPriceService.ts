
interface PriceData {
  price: number;
  timestamp: number;
  source: string;
  age: number;
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
      // Try multiple sources with no cache headers
      const priceData = await this.fetchFromMultipleSources(pair);
      
      this.priceCache.set(pair, priceData);
      return {
        ...priceData,
        age: 0
      };
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

  private async fetchFromMultipleSources(pair: string): Promise<PriceData> {
    const sources = [
      () => this.fetchFromTwelveData(pair),
      () => this.fetchFromAlphaVantage(pair),
      () => this.fetchFromPolygon(pair)
    ];

    for (const source of sources) {
      try {
        const result = await source();
        if (result.price > 0) {
          return result;
        }
      } catch (error) {
        console.warn('Source failed, trying next:', error);
        continue;
      }
    }

    throw new Error('All price sources failed');
  }

  private async fetchFromTwelveData(pair: string): Promise<PriceData> {
    const response = await fetch(
      `https://api.twelvedata.com/price?symbol=${pair}&apikey=demo&_=${Date.now()}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );

    if (!response.ok) throw new Error('TwelveData API error');
    
    const data = await response.json();
    return {
      price: parseFloat(data.price),
      timestamp: Date.now(),
      source: 'TwelveData'
    };
  }

  private async fetchFromAlphaVantage(pair: string): Promise<PriceData> {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${pair.slice(0,3)}&to_currency=${pair.slice(3)}&apikey=demo&_=${Date.now()}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );

    if (!response.ok) throw new Error('AlphaVantage API error');
    
    const data = await response.json();
    const rate = data['Realtime Currency Exchange Rate'];
    
    return {
      price: parseFloat(rate['5. Exchange Rate']),
      timestamp: Date.now(),
      source: 'AlphaVantage'
    };
  }

  private async fetchFromPolygon(pair: string): Promise<PriceData> {
    const response = await fetch(
      `https://api.polygon.io/v1/last/currencies/${pair.slice(0,3)}/${pair.slice(3)}?apikey=demo&_=${Date.now()}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );

    if (!response.ok) throw new Error('Polygon API error');
    
    const data = await response.json();
    return {
      price: data.last.bid,
      timestamp: Date.now(),
      source: 'Polygon'
    };
  }

  private getFallbackPrice(pair: string): PriceData {
    const fallbackPrices: { [key: string]: number } = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 150.25,
      'AUDUSD': 0.6650,
      'USDCAD': 1.3580
    };

    return {
      price: fallbackPrices[pair] || 1.0000,
      timestamp: Date.now(),
      source: 'Fallback',
      age: 0
    };
  }

  clearCache(): void {
    this.priceCache.clear();
  }
}

export const enhancedPriceService = new EnhancedPriceService();
