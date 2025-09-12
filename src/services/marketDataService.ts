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
    console.log(`🔥 FETCHING FRESH LIVE DATA for ${pair} - NO CACHE @ ${new Date().toISOString()}`);
    
    // Try APIs in order of priority - MUST get real data
    let marketData = await this.tryTwelveData(pair); // TwelveData is working based on network logs
    if (!marketData) {
      console.log('🔄 Twelve Data failed, trying Finnhub...');
      marketData = await this.tryFinnhub(pair);
    }
    if (!marketData) {
      console.log('🔄 Finnhub failed, trying Polygon...');
      marketData = await this.tryPolygon(pair);
    }
    if (!marketData) {
      console.log('🔄 Polygon failed, trying Alpha Vantage...');
      marketData = await this.tryAlphaVantage(pair);
    }
    
    if (marketData) {
      console.log(`✅ Got REAL API data for ${pair}: Current Price = ${marketData.currentPrice} @ ${new Date().toISOString()}`);
      return marketData;
    }

    // ONLY use mock data as absolute last resort
    console.log(`❌ ALL APIs failed for ${pair}, generating fallback data`);
    return this.generateFallbackData(pair);
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const marketData = await this.fetchMarketData(symbol);
      return marketData.currentPrice;
    } catch (error) {
      console.error(`Failed to get current price for ${symbol}:`, error);
      // Return fallback price based on symbol
      if (symbol === 'EURUSD') return 1.0386;
      if (symbol === 'GBPUSD') return 1.2489;
      if (symbol === 'USDJPY') return 156.25;
      if (symbol === 'USDCHF') return 0.9134;
      if (symbol === 'AUDUSD') return 0.6549;
      if (symbol === 'USDCAD') return 1.3700;
      if (symbol === 'NZDUSD') return 0.5895;
      if (symbol === 'EURJPY') return 162.35;
      if (symbol === 'GBPJPY') return 195.12;
      if (symbol === 'EURGBP') return 0.8318;
      return 1.0;
    }
  }

  private async tryTwelveData(pair: string): Promise<MarketData | null> {
    try {
      console.log(`📡 Trying Twelve Data for ${pair}...`);
      // Fix symbol format for Twelve Data API
      let symbol = '';
      if (pair === 'EURUSD') symbol = 'EUR/USD';
      else if (pair === 'GBPUSD') symbol = 'GBP/USD';
      else if (pair === 'USDJPY') symbol = 'USD/JPY';
      else if (pair === 'GBPJPY') symbol = 'GBP/JPY';
      else if (pair === 'AUDUSD') symbol = 'AUD/USD';
      else if (pair === 'USDCAD') symbol = 'USD/CAD';
      else if (pair === 'XAUUSD') symbol = 'XAU/USD';
      else if (pair === 'NZDUSD') symbol = 'NZD/USD';
      else if (pair === 'EURGBP') symbol = 'EUR/GBP';
      else if (pair === 'EURJPY') symbol = 'EUR/JPY';
      else if (pair === 'BTCUSD') symbol = 'BTC/USD';
      else if (pair === 'ETHUSD') symbol = 'ETH/USD';
      else symbol = pair.substring(0, 3) + '/' + pair.substring(3);
      
      const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=15min&apikey=${this.TWELVE_DATA_KEY}&outputsize=50`;
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-None-Match': '*',
          'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }
      });
      
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
        volume: parseFloat(item.volume || '1000') // Default volume if not provided
      }));

      const currentPrice = candles[candles.length - 1]?.close || 0;
      console.log(`✅ Twelve Data success: ${pair} = ${currentPrice} (${candles.length} candles)`);

      return { pair, candles, currentPrice };
    } catch (error) {
      console.log(`❌ Twelve Data failed for ${pair}:`, error);
      return null;
    }
  }

  private async tryFinnhub(pair: string): Promise<MarketData | null> {
    try {
      console.log(`📡 Trying Finnhub for ${pair}...`);
      const finnhubSymbol = this.convertToFinnhubSymbol(pair);
      const now = Math.floor(Date.now() / 1000);
      const from = now - (15 * 60 * 50); // Last 50 candles of 15min data
      
      let url = '';
      if (pair === 'BTCUSD' || pair === 'ETHUSD') {
        // Use crypto endpoint for crypto pairs
        url = `https://finnhub.io/api/v1/crypto/candle?symbol=BINANCE:${pair}&resolution=15&from=${from}&to=${now}&token=${this.FINNHUB_KEY}`;
      } else {
        url = `https://finnhub.io/api/v1/forex/candle?symbol=OANDA:${finnhubSymbol}&resolution=15&from=${from}&to=${now}&token=${this.FINNHUB_KEY}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache'
        }
      });
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
        volume: data.v?.[index] || 1000
      })).filter(candle => candle.open > 0);

      const currentPrice = candles[candles.length - 1]?.close || 0;
      console.log(`✅ Finnhub success: ${pair} = ${currentPrice} (REAL API PRICE)`);

      return { pair, candles, currentPrice };
    } catch (error) {
      console.log(`❌ Finnhub failed for ${pair}:`, error);
      return null;
    }
  }

  private async tryPolygon(pair: string): Promise<MarketData | null> {
    try {
      console.log(`📡 Trying Polygon for ${pair}...`);
      // Fix symbol format for Polygon
      let symbol = '';
      if (pair === 'EURUSD') symbol = 'C:EURUSD';
      else if (pair === 'GBPUSD') symbol = 'C:GBPUSD';
      else if (pair === 'USDJPY') symbol = 'C:USDJPY';
      else if (pair === 'GBPJPY') symbol = 'C:GBPJPY';
      else if (pair === 'AUDUSD') symbol = 'C:AUDUSD';
      else if (pair === 'USDCAD') symbol = 'C:USDCAD';
      else if (pair === 'XAUUSD') symbol = 'C:XAUUSD';
      else symbol = `C:${pair}`;
      
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
      // Fix symbol format for Alpha Vantage
      let fromSymbol = '', toSymbol = '';
      if (pair === 'EURUSD') { fromSymbol = 'EUR'; toSymbol = 'USD'; }
      else if (pair === 'GBPUSD') { fromSymbol = 'GBP'; toSymbol = 'USD'; }
      else if (pair === 'USDJPY') { fromSymbol = 'USD'; toSymbol = 'JPY'; }
      else if (pair === 'GBPJPY') { fromSymbol = 'GBP'; toSymbol = 'JPY'; }
      else if (pair === 'AUDUSD') { fromSymbol = 'AUD'; toSymbol = 'USD'; }
      else if (pair === 'USDCAD') { fromSymbol = 'USD'; toSymbol = 'CAD'; }
      else if (pair === 'XAUUSD') { fromSymbol = 'XAU'; toSymbol = 'USD'; }
      else {
        fromSymbol = pair.substring(0, 3);
        toSymbol = pair.substring(3);
      }
      
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
        volume: 1000 // Default volume for forex
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
    // Complete mapping for all major forex pairs + crypto
    const forexPairs: { [key: string]: string } = {
      'EURUSD': 'EUR_USD',
      'GBPUSD': 'GBP_USD', 
      'USDJPY': 'USD_JPY',
      'GBPJPY': 'GBP_JPY',
      'AUDUSD': 'AUD_USD',
      'USDCAD': 'USD_CAD',
      'XAUUSD': 'XAU_USD',
      'NZDUSD': 'NZD_USD',
      'EURGBP': 'EUR_GBP',
      'EURJPY': 'EUR_JPY',
      'BTCUSD': 'BTCUSDT', // Crypto format
      'ETHUSD': 'ETHUSDT'  // Crypto format
    };
    
    return forexPairs[pair] || pair.replace(/(.{3})(.{3})/, '$1_$2');
  }

  // Clear cache method
  clearCache() {
    this.cache.clear();
    console.log('🧹 Market data cache cleared - forcing fresh data');
  }

  // Enhanced debug method
  async debugApiConnection(): Promise<void> {
    console.log('🔍 DEBUG: Testing ALL APIs with live EURUSD data...');
    
    const testPair = 'EURUSD';
    
    console.log('\n=== TESTING TWELVE DATA ===');
    const twelveData = await this.tryTwelveData(testPair);
    console.log('Twelve Data Result:', twelveData ? `SUCCESS - Price: ${twelveData.currentPrice}` : 'FAILED');
    
    console.log('\n=== TESTING FINNHUB ===');
    const finnhubData = await this.tryFinnhub(testPair);
    console.log('Finnhub Result:', finnhubData ? `SUCCESS - Price: ${finnhubData.currentPrice}` : 'FAILED');
    
    console.log('\n=== TESTING POLYGON ===');
    const polygonData = await this.tryPolygon(testPair);
    console.log('Polygon Result:', polygonData ? `SUCCESS - Price: ${polygonData.currentPrice}` : 'FAILED');
    
    console.log('\n=== TESTING ALPHA VANTAGE ===');
    const alphaData = await this.tryAlphaVantage(testPair);
    console.log('Alpha Vantage Result:', alphaData ? `SUCCESS - Price: ${alphaData.currentPrice}` : 'FAILED');
    
    // Test crypto pairs
    console.log('\n=== TESTING CRYPTO (BTCUSD) ===');
    const btcData = await this.fetchMarketData('BTCUSD');
    console.log(`BTC Result: ${btcData.currentPrice} (${btcData.candles.length} candles)`);
    
    // Test the main method
    console.log('\n=== TESTING MAIN METHOD ===');
    const mainData = await this.fetchMarketData(testPair);
    console.log(`Main Method Result: ${mainData.currentPrice} (${mainData.candles.length} candles)`);
  }

  private generateFallbackData(pair: string): MarketData {
    console.log(`⚠️ Generating realistic fallback data for ${pair} - APIs unavailable`);
    
    // Generate more realistic market-like data
    const candles: CandleData[] = [];
    let currentPrice = this.getRealisticBasePrice(pair);
    
    for (let i = 0; i < 50; i++) {
      const variation = (Math.random() - 0.5) * 0.002 * currentPrice; // 0.2% max variation
      const open = currentPrice;
      const close = open + variation;
      const high = Math.max(open, close) + Math.abs(variation) * 0.5;
      const low = Math.min(open, close) - Math.abs(variation) * 0.5;
      
      candles.push({
        timestamp: Date.now() - (50 - i) * 15 * 60 * 1000,
        open,
        high,
        low,
        close,
        volume: Math.random() * 2000 + 1000 // 1000-3000 volume
      });
      
      currentPrice = close;
    }
    
    console.log(`⚠️ Fallback data for ${pair}: Current Price = ${currentPrice.toFixed(5)}`);
    return { pair, candles, currentPrice };
  }

  private getRealisticBasePrice(pair: string): number {
    // More accurate base prices for fallback
    const prices: { [key: string]: number } = {
      'EURUSD': 1.1073,
      'GBPUSD': 1.2621,
      'USDJPY': 147.53,
      'USDCHF': 0.9134,
      'AUDUSD': 0.6549,
      'USDCAD': 1.3700,
      'NZDUSD': 0.5895,
      'EURJPY': 163.25,
      'GBPJPY': 186.12,
      'EURGBP': 0.8318,
      'XAUUSD': 2648.50,
      'BTCUSD': 57932,
      'ETHUSD': 2500
    };
    
    return prices[pair] || 1.0000;
  }
}

export const marketDataService = new MarketDataService();
export type { MarketData, CandleData };