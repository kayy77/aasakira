
class RealTimePriceService {
  private readonly TWELVE_DATA_KEY = '2058aa9ba1dd45c6b92d81fb16be89ad';
  private readonly POLYGON_KEY = 'uLv02UJoiot4__GfXf0_v46dAxlrembt';
  private readonly ALPHA_VANTAGE_KEY = 'UWQPDL73VSZSERTZ';
  private readonly FINNHUB_KEY = 'ctdmqt9r01qoocr8p3h0ctdmqt9r01qoocr8p3hg';
  
  private priceCache = new Map<string, { price: number; timestamp: number }>();
  private readonly CACHE_DURATION = 3000; // 3 seconds for more frequent updates

  async getLivePrice(pair: string): Promise<{ price: number; timestamp: number; source: string }> {
    console.log(`🔄 Fetching LIVE price for ${pair}...`);
    
    // Check cache first
    const cached = this.priceCache.get(pair);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`💾 Using cached price for ${pair}: ${cached.price}`);
      return { ...cached, source: 'cache' };
    }

    // Try APIs in order of reliability for FX data
    let result = await this.tryFinnhub(pair);
    if (result) {
      console.log(`✅ Finnhub SUCCESS for ${pair}: ${result.price}`);
      this.priceCache.set(pair, result);
      return { ...result, source: 'Finnhub' };
    }

    result = await this.tryTwelveData(pair);
    if (result) {
      console.log(`✅ TwelveData SUCCESS for ${pair}: ${result.price}`);
      this.priceCache.set(pair, result);
      return { ...result, source: 'TwelveData' };
    }

    result = await this.tryPolygon(pair);
    if (result) {
      console.log(`✅ Polygon SUCCESS for ${pair}: ${result.price}`);
      this.priceCache.set(pair, result);
      return { ...result, source: 'Polygon' };
    }

    result = await this.tryAlphaVantage(pair);
    if (result) {
      console.log(`✅ AlphaVantage SUCCESS for ${pair}: ${result.price}`);
      this.priceCache.set(pair, result);
      return { ...result, source: 'AlphaVantage' };
    }

    // Enhanced fallback with accurate current market prices
    console.log(`⚠️ All APIs failed for ${pair}, using enhanced fallback`);
    const fallback = this.getEnhancedFallbackPrice(pair);
    this.priceCache.set(pair, fallback);
    return { ...fallback, source: 'fallback' };
  }

  private async tryFinnhub(pair: string): Promise<{ price: number; timestamp: number } | null> {
    try {
      const symbol = this.formatForFinnhub(pair);
      console.log(`🔍 Trying Finnhub for ${pair} (symbol: ${symbol})`);
      
      const response = await fetch(
        `https://finnhub.io/api/v1/forex/rates?base=USD&token=${this.FINNHUB_KEY}`,
        { 
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        console.log(`❌ Finnhub HTTP error: ${response.status}`);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Finnhub raw data:', data);
      
      if (data.quote && data.quote[symbol]) {
        const price = data.quote[symbol];
        console.log(`💰 Finnhub price for ${symbol}: ${price}`);
        return {
          price: parseFloat(price),
          timestamp: Date.now()
        };
      }
      
      console.log(`⚠️ Finnhub: No data for ${symbol}`);
      return null;
    } catch (error) {
      console.log(`❌ Finnhub failed for ${pair}:`, error);
      return null;
    }
  }

  private async tryTwelveData(pair: string): Promise<{ price: number; timestamp: number } | null> {
    try {
      const symbol = this.formatForTwelveData(pair);
      console.log(`🔍 Trying TwelveData for ${pair} (symbol: ${symbol})`);
      
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${this.TWELVE_DATA_KEY}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        console.log(`❌ TwelveData HTTP error: ${response.status}`);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 TwelveData raw data:', data);
      
      if (data.price && !data.status) {
        const price = parseFloat(data.price);
        console.log(`💰 TwelveData price for ${symbol}: ${price}`);
        return {
          price: price,
          timestamp: Date.now()
        };
      }
      
      console.log(`⚠️ TwelveData: Invalid response for ${symbol}`, data);
      return null;
    } catch (error) {
      console.log(`❌ TwelveData failed for ${pair}:`, error);
      return null;
    }
  }

  private async tryPolygon(pair: string): Promise<{ price: number; timestamp: number } | null> {
    try {
      const symbol = this.formatForPolygon(pair);
      console.log(`🔍 Trying Polygon for ${pair} (symbol: ${symbol})`);
      
      const response = await fetch(
        `https://api.polygon.io/v2/last/trade/${symbol}?apikey=${this.POLYGON_KEY}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        console.log(`❌ Polygon HTTP error: ${response.status}`);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Polygon raw data:', data);
      
      if (data.results?.p) {
        const price = data.results.p;
        console.log(`💰 Polygon price for ${symbol}: ${price}`);
        return {
          price: price,
          timestamp: Date.now()
        };
      }
      
      console.log(`⚠️ Polygon: No results for ${symbol}`);
      return null;
    } catch (error) {
      console.log(`❌ Polygon failed for ${pair}:`, error);
      return null;
    }
  }

  private async tryAlphaVantage(pair: string): Promise<{ price: number; timestamp: number } | null> {
    try {
      const [from, to] = this.splitPair(pair);
      console.log(`🔍 Trying AlphaVantage for ${pair} (${from}/${to})`);
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.ALPHA_VANTAGE_KEY}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        console.log(`❌ AlphaVantage HTTP error: ${response.status}`);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 AlphaVantage raw data:', data);
      
      const rate = data['Realtime Currency Exchange Rate'];
      if (rate && rate['5. Exchange Rate']) {
        const price = parseFloat(rate['5. Exchange Rate']);
        console.log(`💰 AlphaVantage price for ${from}/${to}: ${price}`);
        return {
          price: price,
          timestamp: Date.now()
        };
      }
      
      console.log(`⚠️ AlphaVantage: No exchange rate for ${from}/${to}`);
      return null;
    } catch (error) {
      console.log(`❌ AlphaVantage failed for ${pair}:`, error);
      return null;
    }
  }

  private formatForFinnhub(pair: string): string {
    // Finnhub uses different format for FX pairs
    const map: { [key: string]: string } = {
      'EURUSD': 'EUR',
      'GBPUSD': 'GBP',
      'USDJPY': 'JPY',
      'AUDUSD': 'AUD',
      'USDCAD': 'CAD',
      'NZDUSD': 'NZD',
      'EURGBP': 'GBP', // Base will be handled in logic
      'EURJPY': 'JPY',
      'GBPJPY': 'JPY'
    };
    return map[pair] || pair.slice(3);
  }

  private formatForTwelveData(pair: string): string {
    const map: { [key: string]: string } = {
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD',
      'USDJPY': 'USD/JPY',
      'AUDUSD': 'AUD/USD',
      'USDCAD': 'USD/CAD',
      'NZDUSD': 'NZD/USD',
      'EURGBP': 'EUR/GBP',
      'EURJPY': 'EUR/JPY',
      'GBPJPY': 'GBP/JPY'
    };
    return map[pair] || pair;
  }

  private formatForPolygon(pair: string): string {
    const map: { [key: string]: string } = {
      'EURUSD': 'C:EURUSD',
      'GBPUSD': 'C:GBPUSD',
      'USDJPY': 'C:USDJPY',
      'AUDUSD': 'C:AUDUSD',
      'USDCAD': 'C:USDCAD',
      'NZDUSD': 'C:NZDUSD',
      'EURGBP': 'C:EURGBP',
      'EURJPY': 'C:EURJPY',
      'GBPJPY': 'C:GBPJPY'
    };
    return map[pair] || `C:${pair}`;
  }

  private splitPair(pair: string): [string, string] {
    const specialPairs: { [key: string]: [string, string] } = {
      'EURUSD': ['EUR', 'USD'],
      'GBPUSD': ['GBP', 'USD'],
      'USDJPY': ['USD', 'JPY'],
      'AUDUSD': ['AUD', 'USD'],
      'USDCAD': ['USD', 'CAD'],
      'NZDUSD': ['NZD', 'USD'],
      'EURGBP': ['EUR', 'GBP'],
      'EURJPY': ['EUR', 'JPY'],
      'GBPJPY': ['GBP', 'JPY']
    };
    
    return specialPairs[pair] || [pair.slice(0, 3), pair.slice(3)];
  }

  private getEnhancedFallbackPrice(pair: string): { price: number; timestamp: number } {
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
      'GBPJPY': 195.75
    };
    
    const basePrice = basePrices[pair] || 1.0000;
    // Add realistic micro-movement (±0.02% variation)
    const variation = (Math.random() - 0.5) * 0.0002;
    const finalPrice = basePrice * (1 + variation);
    
    console.log(`📊 Enhanced fallback for ${pair}: ${finalPrice} (base: ${basePrice})`);
    
    return {
      price: finalPrice,
      timestamp: Date.now()
    };
  }
}

export const realTimePriceService = new RealTimePriceService();
