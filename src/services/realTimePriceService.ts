
class RealTimePriceService {
  private readonly TWELVE_DATA_KEY = '2058aa9ba1dd45c6b92d81fb16be89ad';
  private readonly POLYGON_KEY = 'uLv02UJoiot4__GfXf0_v46dAxlrembt';
  private readonly ALPHA_VANTAGE_KEY = 'UWQPDL73VSZSERTZ';
  
  private priceCache = new Map<string, { price: number; timestamp: number }>();
  private readonly CACHE_DURATION = 5000; // 5 seconds

  async getLivePrice(pair: string): Promise<{ price: number; timestamp: number; source: string }> {
    console.log(`🔄 Fetching LIVE price for ${pair}...`);
    
    // Check cache first
    const cached = this.priceCache.get(pair);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { ...cached, source: 'cache' };
    }

    // Try TwelveData first
    let result = await this.tryTwelveData(pair);
    if (result) {
      this.priceCache.set(pair, result);
      return { ...result, source: 'TwelveData' };
    }

    // Try Polygon.io
    result = await this.tryPolygon(pair);
    if (result) {
      this.priceCache.set(pair, result);
      return { ...result, source: 'Polygon' };
    }

    // Try Alpha Vantage
    result = await this.tryAlphaVantage(pair);
    if (result) {
      this.priceCache.set(pair, result);
      return { ...result, source: 'AlphaVantage' };
    }

    // Fallback to realistic base prices
    const fallback = this.getFallbackPrice(pair);
    this.priceCache.set(pair, fallback);
    return { ...fallback, source: 'fallback' };
  }

  private async tryTwelveData(pair: string): Promise<{ price: number; timestamp: number } | null> {
    try {
      const symbol = this.formatForTwelveData(pair);
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${this.TWELVE_DATA_KEY}`
      );
      
      if (!response.ok) throw new Error('TwelveData API failed');
      
      const data = await response.json();
      if (data.price) {
        return {
          price: parseFloat(data.price),
          timestamp: Date.now()
        };
      }
      return null;
    } catch (error) {
      console.log('TwelveData failed:', error);
      return null;
    }
  }

  private async tryPolygon(pair: string): Promise<{ price: number; timestamp: number } | null> {
    try {
      const symbol = this.formatForPolygon(pair);
      const response = await fetch(
        `https://api.polygon.io/v2/last/trade/${symbol}?apikey=${this.POLYGON_KEY}`
      );
      
      if (!response.ok) throw new Error('Polygon API failed');
      
      const data = await response.json();
      if (data.results?.p) {
        return {
          price: data.results.p,
          timestamp: Date.now()
        };
      }
      return null;
    } catch (error) {
      console.log('Polygon failed:', error);
      return null;
    }
  }

  private async tryAlphaVantage(pair: string): Promise<{ price: number; timestamp: number } | null> {
    try {
      const [from, to] = this.splitPair(pair);
      const response = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.ALPHA_VANTAGE_KEY}`
      );
      
      if (!response.ok) throw new Error('Alpha Vantage API failed');
      
      const data = await response.json();
      const rate = data['Realtime Currency Exchange Rate'];
      if (rate && rate['5. Exchange Rate']) {
        return {
          price: parseFloat(rate['5. Exchange Rate']),
          timestamp: Date.now()
        };
      }
      return null;
    } catch (error) {
      console.log('Alpha Vantage failed:', error);
      return null;
    }
  }

  private formatForTwelveData(pair: string): string {
    const map: { [key: string]: string } = {
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD',
      'USDJPY': 'USD/JPY',
      'XAUUSD': 'XAU/USD',
      'BTCUSD': 'BTC/USD',
      'ETHUSD': 'ETH/USD'
    };
    return map[pair] || pair;
  }

  private formatForPolygon(pair: string): string {
    const map: { [key: string]: string } = {
      'EURUSD': 'C:EURUSD',
      'GBPUSD': 'C:GBPUSD',
      'USDJPY': 'C:USDJPY',
      'XAUUSD': 'C:XAUUSD',
      'BTCUSD': 'X:BTCUSD',
      'ETHUSD': 'X:ETHUSD'
    };
    return map[pair] || `C:${pair}`;
  }

  private splitPair(pair: string): [string, string] {
    if (pair === 'XAUUSD') return ['XAU', 'USD'];
    if (pair === 'BTCUSD') return ['BTC', 'USD'];
    if (pair === 'ETHUSD') return ['ETH', 'USD'];
    return [pair.slice(0, 3), pair.slice(3)];
  }

  private getFallbackPrice(pair: string): { price: number; timestamp: number } {
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.0421,
      'GBPUSD': 1.2556,
      'USDJPY': 156.25,
      'XAUUSD': 2687.50,
      'BTCUSD': 121850.00,
      'ETHUSD': 4156.75
    };
    
    const basePrice = basePrices[pair] || 1.0000;
    const variation = (Math.random() - 0.5) * 0.001; // ±0.1%
    
    return {
      price: basePrice * (1 + variation),
      timestamp: Date.now()
    };
  }
}

export const realTimePriceService = new RealTimePriceService();
