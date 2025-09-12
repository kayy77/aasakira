// Direct price fetching service using working APIs from network logs
import type { MarketData, CandleData } from './marketDataService';

export class DirectPriceService {
  
  async fetchDirectPrice(pair: string): Promise<MarketData | null> {
    console.log(`🎯 Direct price fetch for ${pair}...`);
    
    // Prefer dedicated crypto path for BTC/ETH to ensure accurate spot prices
    if (pair === 'BTCUSD' || pair === 'ETHUSD') {
      return this.fetchCrypto(pair);
    }
    
    // For FX and metals, TwelveData time_series is preferred
    const data = await this.fetchFromTwelveDataSimple(pair);
    if (data) return data;
    
    return null;
  }
  
  private async fetchCrypto(pair: string): Promise<MarketData | null> {
    // Get candles from TwelveData and current spot price from CoinGecko
    const candlesData = await this.fetchFromTwelveDataSimple(pair);
    if (!candlesData) return null;

    // Get fresh spot price from CoinGecko for accuracy
    const spotPrice = await this.fetchFromCoinGecko(pair);
    const currentPrice = spotPrice ?? candlesData.currentPrice;

    // Sanity bounds for BTC/ETH
    const min = pair === 'BTCUSD' ? 1000 : 100;
    const max = pair === 'BTCUSD' ? 500000 : 50000;
    if (currentPrice < min || currentPrice > max) {
      console.log(`❌ ${pair} spot sanity check failed: ${currentPrice}`);
      return null;
    }

    // Validate recency: last candle within 45 minutes
    const lastTs = candlesData.candles[candlesData.candles.length - 1]?.timestamp || 0;
    const isRecent = Date.now() - lastTs < 45 * 60 * 1000;
    if (!isRecent) {
      console.log(`❌ ${pair} candles are stale (${Math.round((Date.now()-lastTs)/60000)}m). Skipping.`);
      return null;
    }

    console.log(`✅ ${pair} LIVE SPOT ${currentPrice} (candles ${Math.round((Date.now()-lastTs)/60000)}m ago)`);
    return { pair, candles: candlesData.candles, currentPrice };
  }

  private async fetchFromTwelveDataSimple(pair: string): Promise<MarketData | null> {
    try {
      const symbol = this.formatSymbolForTwelveData(pair);
      const apiKey = '2058aa9ba1dd45c6b92d81fb16be89ad'; // This key worked in network logs
      
      const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=15min&apikey=${apiKey}&outputsize=30`;
      
      console.log(`📡 Fetching from TwelveData: ${url}`);
      
      const response = await Promise.race([
        fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
      ]);
      
      if (!response.ok) {
        console.log(`❌ TwelveData HTTP ${response.status} for ${pair}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.log(`❌ TwelveData API error for ${pair}:`, data.message);
        return null;
      }
      
      if (!data.values || !Array.isArray(data.values) || data.values.length === 0) {
        console.log(`❌ No TwelveData values for ${pair}`);
        return null;
      }
      
      // Convert to our format
      const candles: CandleData[] = data.values.reverse().map((item: any) => ({
        timestamp: new Date(item.datetime).getTime(),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume || '1000')
      }));
      
      const currentPrice = candles[candles.length - 1]?.close;
      
      if (!currentPrice || currentPrice <= 0) {
        console.log(`❌ Invalid price for ${pair}: ${currentPrice}`);
        return null;
      }
      
      console.log(`✅ TwelveData SUCCESS: ${pair} = ${currentPrice} (${candles.length} candles)`);
      
      return {
        pair,
        candles,
        currentPrice
      };
      
    } catch (error) {
      console.log(`❌ TwelveData error for ${pair}:`, error);
      return null;
    }
  }
  
  private formatSymbolForTwelveData(pair: string): string {
    const mapping: { [key: string]: string } = {
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD', 
      'USDJPY': 'USD/JPY',
      'GBPJPY': 'GBP/JPY',
      'AUDUSD': 'AUD/USD',
      'USDCAD': 'USD/CAD',
      'XAUUSD': 'XAU/USD',
      'NZDUSD': 'NZD/USD',
      'EURGBP': 'EUR/GBP',
      'EURJPY': 'EUR/JPY',
      'BTCUSD': 'BTC/USD',
      'ETHUSD': 'ETH/USD'
    };
    
    return mapping[pair] || `${pair.substring(0, 3)}/${pair.substring(3)}`;
  }

  private async fetchFromCoinGecko(pair: string): Promise<number | null> {
    try {
      const id = pair === 'BTCUSD' ? 'bitcoin' : pair === 'ETHUSD' ? 'ethereum' : null;
      if (!id) return null;
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store', headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }});
      if (!res.ok) return null;
      const data = await res.json();
      const price = data?.[id]?.usd;
      if (typeof price !== 'number' || price <= 0) return null;
      return price;
    } catch (e) {
      console.log(`❌ CoinGecko error for ${pair}:`, e);
      return null;
    }
  }
}

export const directPriceService = new DirectPriceService();