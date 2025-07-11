
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

  async fetchMarketData(pair: string): Promise<MarketData> {
    const cacheKey = pair;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Convert pair format for Yahoo Finance (e.g., EURUSD -> EURUSD=X)
      const yahooSymbol = this.convertToYahooSymbol(pair);
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=5m&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.chart.result[0];
      
      if (!result || !result.timestamp || !result.indicators.quote[0]) {
        throw new Error('Invalid data structure from Yahoo Finance');
      }

      const candles: CandleData[] = result.timestamp.map((timestamp: number, index: number) => ({
        timestamp: timestamp * 1000,
        open: result.indicators.quote[0].open[index] || 0,
        high: result.indicators.quote[0].high[index] || 0,
        low: result.indicators.quote[0].low[index] || 0,
        close: result.indicators.quote[0].close[index] || 0,
        volume: result.indicators.quote[0].volume?.[index] || 0
      })).filter(candle => candle.open > 0); // Filter out invalid candles

      const marketData: MarketData = {
        pair,
        candles,
        currentPrice: candles[candles.length - 1]?.close || 0
      };

      this.cache.set(cacheKey, { data: marketData, timestamp: Date.now() });
      return marketData;
    } catch (error) {
      console.error(`Error fetching market data for ${pair}:`, error);
      // Return mock data as fallback
      return this.generateMockData(pair);
    }
  }

  private convertToYahooSymbol(pair: string): string {
    const forexPairs: { [key: string]: string } = {
      'EURUSD': 'EURUSD=X',
      'GBPUSD': 'GBPUSD=X',
      'USDJPY': 'USDJPY=X',
      'GBPJPY': 'GBPJPY=X',
      'AUDUSD': 'AUDUSD=X',
      'USDCAD': 'USDCAD=X',
      'XAUUSD': 'GC=F', // Gold futures
      'BTCUSD': 'BTC-USD'
    };
    
    return forexPairs[pair] || `${pair}=X`;
  }

  private generateMockData(pair: string): MarketData {
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
