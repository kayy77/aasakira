
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
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for more fresh data
  
  // API Keys
  private readonly FINNHUB_KEY = 'd0vu8r9r01qkepd2ihl0d0vu8r9r01qkepd2ihlg';
  private readonly TWELVE_DATA_KEY = '2058aa9ba1dd45c6b92d81fb16be89ad';
  private readonly POLYGON_KEY = 'uLv02UJoiot4__GfXf0_v46dAxlrembt';
  private readonly ALPHA_VANTAGE_KEY = 'UWQPDL73VSZSERTZ';

  async fetchMarketData(pair: string): Promise<MarketData> {
    const cacheKey = pair;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`📦 Using cached data for ${pair} (${cached.data.currentPrice})`);
      return cached.data;
    }

    console.log(`🔄 Fetching LIVE data for ${pair} using multi-API fallback...`);
    
    // Try APIs in order of priority
    let marketData = await this.tryFinnhub(pair);
    if (!marketData) {
      console.log('🔄 Finnhub failed, trying Twelve Data...');
      marketData = await this.tryTwelveData(pair);
    }
    if (!marketData) {
      console.log('🔄 Twelve Data failed, trying Polygon...');
      marketData = await this.tryPolygon(pair);
    }
    if (!marketData) {
      console.log('🔄 Polygon failed, trying Alpha Vantage...');
      marketData = await this.tryAlphaVantage(pair);
    }
    
    if (marketData) {
      console.log(`✅ Got LIVE data for ${pair}: Current Price = ${marketData.currentPrice}`);
      this.cache.set(cacheKey, { data: marketData, timestamp: Date.now() });
      return marketData;
    }

    console.log(`❌ ALL APIs failed for ${pair}, using mock data`);
    return this.generateMockData(pair);
  }

  private async tryFinnhub(pair: string): Promise<MarketData | null> {
    try {
      console.log(`📡 Trying Finnhub for ${pair}...`);
      const finnhubSymbol = this.convertToFinnhubSymbol(pair);
      const now = Math.floor(Date.now() / 1000);
      const from = now - (15 * 60 * 50); // Last 50 candles of 15min data
      
      const url = `https://finnhub.io/api/v1/forex/candle?symbol=OANDA:${finnhubSymbol}&resolution=15&from=${from}&to=${now}&token=${this.FINNHUB_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Finnhub HTTP ${response.status}`);

      const data = await response.json();
      if (data.s !== 'ok' || !data.t || data.t.length === 0) {
        throw new Error('No Finnhub data');
      }

      const candles: CandleData[] = data.t.map((timestamp: number, index: number) => ({
        timestamp: timestamp * 1000,
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v?.[index] || 0
      })).filter(candle => candle.open > 0);

      const currentPrice = candles[candles.length - 1]?.close || 0;
      console.log(`✅ Finnhub success: ${pair} = ${currentPrice}`);

      return { pair, candles, currentPrice };
    } catch (error) {
      console.log(`❌ Finnhub failed for ${pair}:`, error);
      return null;
    }
  }

  private async tryTwelveData(pair: string): Promise<MarketData | null> {
    try {
      console.log(`📡 Trying Twelve Data for ${pair}...`);
      const symbol = pair.replace('USD', '/USD').replace('JPY', '/JPY').replace('GBP', 'GBP/').replace('EUR', 'EUR/').replace('AUD', 'AUD/').replace('CAD', '/CAD');
      
      const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=15min&apikey=${this.TWELVE_DATA_KEY}&outputsize=50`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Twelve Data HTTP ${response.status}`);

      const data = await response.json();
      if (!data.values || data.values.length === 0) {
        throw new Error('No Twelve Data values');
      }

      const candles: CandleData[] = data.values.reverse().map((item: any) => ({
        timestamp: new Date(item.datetime).getTime(),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume || '0')
      }));

      const currentPrice = candles[candles.length - 1]?.close || 0;
      console.log(`✅ Twelve Data success: ${pair} = ${currentPrice}`);

      return { pair, candles, currentPrice };
    } catch (error) {
      console.log(`❌ Twelve Data failed for ${pair}:`, error);
      return null;
    }
  }

  private async tryPolygon(pair: string): Promise<MarketData | null> {
    try {
      console.log(`📡 Trying Polygon for ${pair}...`);
      const symbol = `C:${pair.substring(0, 3)}${pair.substring(3)}`;
      const now = new Date();
      const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/15/minute/${from.toISOString().split('T')[0]}/${now.toISOString().split('T')[0]}?adjusted=true&sort=asc&apikey=${this.POLYGON_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Polygon HTTP ${response.status}`);

      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        throw new Error('No Polygon results');
      }

      const candles: CandleData[] = data.results.map((item: any) => ({
        timestamp: item.t,
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v
      }));

      const currentPrice = candles[candles.length - 1]?.close || 0;
      console.log(`✅ Polygon success: ${pair} = ${currentPrice}`);

      return { pair, candles, currentPrice };
    } catch (error) {
      console.log(`❌ Polygon failed for ${pair}:`, error);
      return null;
    }
  }

  private async tryAlphaVantage(pair: string): Promise<MarketData | null> {
    try {
      console.log(`📡 Trying Alpha Vantage for ${pair}...`);
      const fromSymbol = pair.substring(0, 3);
      const toSymbol = pair.substring(3);
      
      const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&interval=15min&apikey=${this.ALPHA_VANTAGE_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Alpha Vantage HTTP ${response.status}`);

      const data = await response.json();
      const timeSeries = data['Time Series FX (15min)'];
      
      if (!timeSeries) {
        throw new Error('No Alpha Vantage time series');
      }

      const entries = Object.entries(timeSeries).slice(0, 50);
      const candles: CandleData[] = entries.map(([time, values]: [string, any]) => ({
        timestamp: new Date(time).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: 0
      })).reverse();

      const currentPrice = candles[candles.length - 1]?.close || 0;
      console.log(`✅ Alpha Vantage success: ${pair} = ${currentPrice}`);

      return { pair, candles, currentPrice };
    } catch (error) {
      console.log(`❌ Alpha Vantage failed for ${pair}:`, error);
      return null;
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
      'XAUUSD': 'XAU_USD',
      'BTCUSD': 'BTC_USD'
    };
    
    return forexPairs[pair] || pair.replace(/(.{3})(.{3})/, '$1_$2');
  }

  // Enhanced debug method
  async debugApiConnection(): Promise<void> {
    console.log('🔍 DEBUG: Testing ALL APIs with live EURUSD data...');
    
    const testPair = 'EURUSD';
    
    console.log('\n=== TESTING FINNHUB ===');
    const finnhubData = await this.tryFinnhub(testPair);
    console.log('Finnhub Result:', finnhubData ? `SUCCESS - Price: ${finnhubData.currentPrice}` : 'FAILED');
    
    console.log('\n=== TESTING TWELVE DATA ===');
    const twelveData = await this.tryTwelveData(testPair);
    console.log('Twelve Data Result:', twelveData ? `SUCCESS - Price: ${twelveData.currentPrice}` : 'FAILED');
    
    console.log('\n=== TESTING POLYGON ===');
    const polygonData = await this.tryPolygon(testPair);
    console.log('Polygon Result:', polygonData ? `SUCCESS - Price: ${polygonData.currentPrice}` : 'FAILED');
    
    console.log('\n=== TESTING ALPHA VANTAGE ===');
    const alphaData = await this.tryAlphaVantage(testPair);
    console.log('Alpha Vantage Result:', alphaData ? `SUCCESS - Price: ${alphaData.currentPrice}` : 'FAILED');
    
    // Test the main method
    console.log('\n=== TESTING MAIN METHOD ===');
    const mainData = await this.fetchMarketData(testPair);
    console.log(`Main Method Result: ${mainData.currentPrice} (${mainData.candles.length} candles)`);
  }

  private generateMockData(pair: string): MarketData {
    console.log(`⚠️ Generating realistic mock data for ${pair}`);
    
    // More realistic base prices
    const basePrices: { [key: string]: number } = {
      'EURUSD': 1.1686, // Current approximate
      'GBPUSD': 1.2950,
      'USDJPY': 149.50,
      'GBPJPY': 193.40,
      'AUDUSD': 0.6750,
      'USDCAD': 1.3450,
      'XAUUSD': 2050.00
    };
    
    const basePrice = basePrices[pair] || 1.1686;
    const candles: CandleData[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < 50; i++) {
      const variation = (Math.random() - 0.5) * 0.002;
      const open = currentPrice;
      const close = open + variation;
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;
      
      candles.push({
        timestamp: Date.now() - (50 - i) * 15 * 60 * 1000,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000
      });
      
      currentPrice = close;
    }
    
    console.log(`⚠️ Mock data for ${pair}: Current Price = ${currentPrice}`);
    return { pair, candles, currentPrice };
  }
}

export const marketDataService = new MarketDataService();
export type { MarketData, CandleData };
