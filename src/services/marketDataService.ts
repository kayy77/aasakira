
interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MarketData {
  pair: string;
  candles: CandleData[];
  currentPrice: number;
}

class MarketDataService {
  private cache = new Map<string, { data: MarketData; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly API_KEY = 'd0vu8r9r01qkepd2ihl0d0vu8r9r01qkepd2ihlg';

  async fetchMarketData(pair: string): Promise<MarketData> {
    const cacheKey = pair;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 Using cached data for ${pair}`);
      return cached.data;
    }

    try {
      console.log(`🔄 Fetching live data for ${pair} from Finnhub...`);
      
      // Convert pair format for Finnhub (e.g., EURUSD -> EUR_USD)
      const finnhubSymbol = this.convertToFinnhubSymbol(pair);
      const now = Math.floor(Date.now() / 1000);
      const from = now - (5 * 60 * 100); // Last 100 candles of 5min data
      
      const url = `https://finnhub.io/api/v1/forex/candle?symbol=OANDA:${finnhubSymbol}&resolution=5&from=${from}&to=${now}&token=${this.API_KEY}`;
      
      console.log(`📡 Finnhub URL: ${url}`);
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📊 Finnhub response status: ${data.s}`);
      
      if (data.s !== 'ok') {
        console.error('Finnhub error response:', data);
        throw new Error(`Finnhub returned status: ${data.s}`);
      }

      if (!data.t || !data.o || !data.h || !data.l || !data.c) {
        throw new Error('Invalid data structure from Finnhub');
      }

      const candles: CandleData[] = data.t.map((timestamp: number, index: number) => ({
        timestamp: timestamp * 1000, // Convert to milliseconds
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v?.[index] || 0 // Volume might not be available for forex
      })).filter(candle => candle.open > 0); // Filter out invalid candles

      console.log(`✅ Received ${candles.length} live candles for ${pair}`);
      console.log(`📈 Latest candle: Open ${candles[candles.length - 1]?.open}, Close ${candles[candles.length - 1]?.close}`);

      const marketData: MarketData = {
        pair,
        candles,
        currentPrice: candles[candles.length - 1]?.close || 0
      };

      this.cache.set(cacheKey, { data: marketData, timestamp: Date.now() });
      return marketData;
    } catch (error) {
      console.error(`❌ Error fetching live data for ${pair}:`, error);
      console.log(`🔄 Falling back to mock data for ${pair}`);
      // Return mock data as fallback
      return this.generateMockData(pair);
    }
  }

  private convertToFinnhubSymbol(pair: string): string {
    const forexPairs: { [key: string]: string } = {
      'EURUSD': 'EUR_USD',
      'GBPUSD': 'GBP_USD', 
      'USDJPY': 'USD_JPY',
      'GBPJPY': 'GBP_JPY',
      'AUDUSD': 'AUD_USD',
      'USDCAD': 'USD_CAD',
      'XAUUSD': 'XAU_USD', // Gold
      'BTCUSD': 'BTC_USD'  // Bitcoin (if supported)
    };
    
    return forexPairs[pair] || pair.replace(/(.{3})(.{3})/, '$1_$2');
  }

  // Debug method to test API connection
  async debugApiConnection(pair: string = 'EURUSD'): Promise<void> {
    console.log('🔍 DEBUG: Testing Finnhub API connection...');
    console.log(`🔑 API Key: ${this.API_KEY.substring(0, 8)}...`);
    
    const finnhubSymbol = this.convertToFinnhubSymbol(pair);
    const now = Math.floor(Date.now() / 1000);
    const from = now - (5 * 60 * 20); // Last 20 candles
    
    const url = `https://finnhub.io/api/v1/forex/candle?symbol=OANDA:${finnhubSymbol}&resolution=5&from=${from}&to=${now}&token=${this.API_KEY}`;
    
    console.log(`🌐 Test URL: ${url}`);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📊 Raw Finnhub Response:', {
        status: data.s,
        candleCount: data.t?.length || 0,
        firstCandle: data.t?.[0] ? {
          time: new Date(data.t[0] * 1000).toISOString(),
          open: data.o?.[0],
          close: data.c?.[0]
        } : null,
        lastCandle: data.t?.length > 0 ? {
          time: new Date(data.t[data.t.length - 1] * 1000).toISOString(),
          open: data.o?.[data.o.length - 1],
          close: data.c?.[data.c.length - 1]
        } : null
      });
      
      if (data.s === 'ok') {
        console.log('✅ Finnhub API connection successful!');
      } else {
        console.log('❌ Finnhub API returned error status:', data.s);
      }
    } catch (error) {
      console.error('❌ Failed to connect to Finnhub API:', error);
    }
  }

  private generateMockData(pair: string): MarketData {
    console.log(`⚠️ Generating mock data for ${pair} - API might be down`);
    const basePrice = pair === 'XAUUSD' ? 2050 : 1.0850;
    const candles: CandleData[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < 50; i++) {
      const variation = (Math.random() - 0.5) * 0.002;
      const open = currentPrice;
      const close = open + variation;
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;
      
      candles.push({
        timestamp: Date.now() - (50 - i) * 5 * 60 * 1000,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000
      });
      
      currentPrice = close;
    }
    
    return { pair, candles, currentPrice };
  }
}

export const marketDataService = new MarketDataService();
export type { MarketData, CandleData };
