import { directPriceService } from './directPriceService';

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
  private readonly CACHE_DURATION = 0; // NO CACHE - ALWAYS FRESH DATA
  
  // API Keys
  private readonly FINNHUB_KEY = 'd0vu8r9r01qkepd2ihl0d0vu8r9r01qkepd2ihlg';
  private readonly TWELVE_DATA_KEY = '2058aa9ba1dd45c6b92d81fb16be89ad';
  private readonly POLYGON_KEY = 'uLv02UJoiot4__GfXf0_v46dAxlrembt';
  private readonly ALPHA_VANTAGE_KEY = 'UWQPDL73VSZSERTZ';

  async fetchMarketData(pair: string): Promise<MarketData> {
    console.log(`🔥 FETCHING REAL LIVE DATA for ${pair} @ ${new Date().toISOString()}`);
    
    // Use direct price service which handles TwelveData properly
    let marketData = await this.tryDirectPriceFetch(pair);
    
    if (marketData) {
      console.log(`✅ Got REAL API data for ${pair}: Current Price = ${marketData.currentPrice} @ ${new Date().toISOString()}`);
      return marketData;
    }

    // Return error instead of mock data - we want REAL prices only
    console.log(`❌ FAILED to get real data for ${pair} - APIs unavailable`);
    throw new Error(`Unable to fetch real market data for ${pair}`);
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const marketData = await this.fetchMarketData(symbol);
      return marketData.currentPrice;
    } catch (error) {
      console.error(`Failed to get current price for ${symbol}:`, error);
      throw error; // Don't return fallback, throw error for real prices
    }
  }

  private async tryDirectPriceFetch(pair: string): Promise<MarketData | null> {
    try {
      return await directPriceService.fetchDirectPrice(pair);
    } catch (error) {
      console.log(`❌ Direct price fetch failed for ${pair}:`, error);
      return null;
    }
  }

  // Clear cache method
  clearCache() {
    this.cache.clear();
    console.log('🧹 Market data cache cleared - forcing fresh data');
  }

  // Test method to verify API connectivity
  async testConnectivity(): Promise<void> {
    console.log('🔍 Testing API connectivity...');
    
    const testSymbols = ['EURUSD', 'GBPUSD', 'USDJPY'];
    
    for (const symbol of testSymbols) {
      try {
        console.log(`\n=== Testing ${symbol} ===`);
        const data = await this.fetchMarketData(symbol);
        console.log(`✅ ${symbol}: ${data.currentPrice} (${data.candles.length} candles)`);
      } catch (error) {
        console.log(`❌ ${symbol}: FAILED -`, error);
      }
    }
  }
}

export const marketDataService = new MarketDataService();
export type { MarketData, CandleData };