interface PriceData {
  price: number;
  timestamp: number;
  source: string;
  change?: number;
  changePercent?: string;
}

interface PriceAPI {
  name: string;
  priority: number;
  fetch: (symbol: string) => Promise<PriceData | null>;
}

interface ApiStats {
  success: number;
  fail: number;
  avgTime: number;
  lastFailure?: string;
}

interface PriceOptions {
  allowFallback?: boolean;
  forTrading?: boolean;
}

class EnhancedPriceService {
  private cache = new Map<string, { data: PriceData; timestamp: number }>();
  private readonly CACHE_DURATION = 50; // Ultra-short 0.05 second cache for maximum freshness
  private priceWatchers = new Map<string, NodeJS.Timeout>();
  private lastPrices = new Map<string, number>();
  private apiStats = new Map<string, ApiStats>();
  private statCallCount = 0;

  // Working API Keys - these are public keys safe for frontend use
  private readonly ALPHA_VANTAGE_KEY = 'UWQPDL73VSZSERTZ';
  private readonly POLYGON_KEY = 'YOUR_POLYGON_KEY'; // Add your key here

  private apis: PriceAPI[] = [
    {
      name: 'Polygon',
      priority: 1,
      fetch: this.fetchFromPolygon.bind(this)
    },
    {
      name: 'AlphaVantage',
      priority: 2,
      fetch: this.fetchFromAlphaVantage.bind(this)
    },
    {
      name: 'FreeForexAPI',
      priority: 3,
      fetch: this.fetchFromFreeForexAPI.bind(this)
    },
    {
      name: 'ExchangeRateHost',
      priority: 4,
      fetch: this.fetchFromExchangeRateHost.bind(this)
    },
    {
      name: 'Frankfurter',
      priority: 5,
      fetch: this.fetchFromFrankfurter.bind(this)
    }
  ];

  async getLivePrice(symbol: string, options: PriceOptions = { allowFallback: true, forTrading: false }): Promise<PriceData> {
    console.log(`🚀 ULTRA-PRECISION live price fetch for ${symbol} - simultaneous multi-source...`);
    
    // Check ultra-short cache first
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      // CRITICAL FIX 1: Validate cached price before using
      if (cached.data.price <= 0) {
        console.warn(`❌ Invalid cached price for ${symbol}: ${cached.data.price}`);
        this.cache.delete(symbol); // Remove invalid cache
      } else {
        console.log(`⚡ Ultra-fresh cached price for ${symbol}: ${cached.data.price} (${cached.data.source})`);
        return cached.data;
      }
    }

    // SIMULTANEOUS API CALLS for maximum speed and accuracy
    const results = await this.fetchFromMultipleSourcesSimultaneously(symbol);
    
    if (results.length > 0) {
      // Use the most accurate result (prefer live APIs over delayed ones)
      const bestResult = this.selectBestPriceResult(results);
      
      // CRITICAL FIX 1: Validate price before using
      if (!bestResult || bestResult.price <= 0 || isNaN(bestResult.price)) {
        console.error(`❌ Invalid live price for ${symbol}: ${bestResult?.price}`);
        
        // For trading signals, we CANNOT use invalid prices
        if (options.forTrading) {
          throw new Error(`Invalid live price for trading signal: ${symbol}`);
        }
        
        // Fall through to fallback for non-trading use
      } else {
        this.cache.set(symbol, { data: bestResult, timestamp: Date.now() });
        
        console.log(`✅ ULTRA-PRECISION price selected for ${symbol}: ${bestResult.price} from ${bestResult.source}`);
        
        // Check for significant price movement
        await this.checkPriceMovement(symbol, bestResult.price);
        
        return bestResult;
      }
    }

    // CRITICAL FIX 2: Handle fallback properly for trading vs visualization
    if (!options.allowFallback) {
      throw new Error(`No valid live prices available for ${symbol} and fallback is disabled`);
    }

    if (options.forTrading) {
      console.error(`⚠️ NO VALID LIVE PRICES for trading signal ${symbol} - REJECTING SIGNAL`);
      throw new Error(`Cannot generate trading signal for ${symbol} - no valid live prices available`);
    }

    // Enhanced fallback with current market approximation (ONLY for visualization)
    console.log(`⚠️ All APIs failed for ${symbol}, using enhanced fallback for visualization only`);
    const fallbackPrice = this.getEnhancedFallback(symbol);
    
    // Mark fallback clearly
    fallbackPrice.source = 'Enhanced Fallback (Visualization Only)';
    
    return fallbackPrice;
  }

  private async fetchFromMultipleSourcesSimultaneously(symbol: string): Promise<(PriceData & { responseTime: number })[]> {
    console.log(`🔄 Launching ULTRA-PRECISION simultaneous fetch for ${symbol} across all sources...`);
    
    // Launch all API calls simultaneously for maximum speed
    const promises = this.apis.map(async (api) => {
      const startTime = Date.now();
      try {
        const result = await Promise.race([
          api.fetch(symbol),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1200) // 1.2 second timeout for faster response
          )
        ]);
        const responseTime = Date.now() - startTime;
        
        if (result && result.price > 0 && !isNaN(result.price)) {
          console.log(`✅ ${api.name} ULTRA-SUCCESS: ${result.price} (${responseTime}ms)`);
          this.recordApiStat(api.name, responseTime, true);
          return { ...result, responseTime };
        } else {
          console.log(`⚠️ ${api.name} returned invalid price: ${result?.price}`);
          this.recordApiStat(api.name, responseTime, false);
          return null;
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        console.log(`❌ ${api.name} failed/timeout:`, error);
        this.recordApiStat(api.name, responseTime, false);
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    const validResults = results
      .filter((result): result is PromiseFulfilledResult<PriceData & { responseTime: number }> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    console.log(`📊 Got ${validResults.length} ULTRA-PRECISION prices for ${symbol}`);
    
    // Log API performance stats every 20 calls
    this.statCallCount++;
    if (this.statCallCount % 20 === 0) {
      this.logApiPerformance();
    }
    
    return validResults;
  }

  // CRITICAL FIX 4: API Performance tracking and monitoring
  private recordApiStat(name: string, responseTime: number, success: boolean): void {
    const current = this.apiStats.get(name) || { success: 0, fail: 0, avgTime: 0 };
    
    if (success) {
      current.success++;
      current.avgTime = (current.avgTime * (current.success - 1) + responseTime) / current.success;
    } else {
      current.fail++;
      current.lastFailure = new Date().toISOString();
    }
    
    this.apiStats.set(name, current);
  }

  private logApiPerformance(): void {
    console.log('\n📊 API PERFORMANCE STATS:');
    console.log('=' .repeat(50));
    
    this.apiStats.forEach((stats, name) => {
      const total = stats.success + stats.fail;
      const successRate = total > 0 ? ((stats.success / total) * 100).toFixed(1) : '0';
      const avgTime = stats.avgTime > 0 ? stats.avgTime.toFixed(0) : 'N/A';
      
      console.log(`${name}:`);
      console.log(`  Success: ${stats.success}/${total} (${successRate}%)`);
      console.log(`  Avg Time: ${avgTime}ms`);
      if (stats.lastFailure) {
        console.log(`  Last Fail: ${stats.lastFailure}`);
      }
      console.log('');
    });
  }

  private selectBestPriceResult(results: (PriceData & { responseTime: number })[]): PriceData {
    if (results.length === 1) {
      const { responseTime, ...priceData } = results[0];
      return priceData;
    }

    // Sort by reliability score (success rate + speed)
    const sorted = results.sort((a, b) => {
      const aStats = this.apiStats.get(a.source) || { success: 1, fail: 0, avgTime: a.responseTime };
      const bStats = this.apiStats.get(b.source) || { success: 1, fail: 0, avgTime: b.responseTime };
      
      const aTotal = aStats.success + aStats.fail;
      const bTotal = bStats.success + bStats.fail;
      
      const aReliability = aTotal > 0 ? (aStats.success / aTotal) : 0.5;
      const bReliability = bTotal > 0 ? (bStats.success / bTotal) : 0.5;
      
      // Combine reliability and speed (favor reliable + fast sources)
      const aScore = aReliability * 100 - (a.responseTime / 10);
      const bScore = bReliability * 100 - (b.responseTime / 10);
      
      return bScore - aScore;
    });

    const selected = sorted[0];
    console.log(`🎯 Selected ULTRA-PRECISION price: ${selected.price} from ${selected.source} (${selected.responseTime}ms)`);
    
    const { responseTime, ...priceData } = selected;
    return priceData;
  }

  private async fetchFromPolygon(symbol: string): Promise<PriceData | null> {
    // CRITICAL FIX 3: Proper API key validation
    if (!this.POLYGON_KEY || this.POLYGON_KEY === 'YOUR_POLYGON_KEY') {
      console.warn('⚠️ Polygon API key is missing. Skipping this source.');
      return null;
    }

    try {
      const [base, quote] = this.splitPair(symbol);
      const pairNoSlash = `${base}${quote}`;
      
      const response = await fetch(
        `https://api.polygon.io/v1/last_quote/currencies/${pairNoSlash}?apiKey=${this.POLYGON_KEY}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data?.last?.ask && data.last.ask > 0) {
        return {
          price: parseFloat(data.last.ask),
          timestamp: Date.now(),
          source: 'Polygon'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchFromAlphaVantage(symbol: string): Promise<PriceData | null> {
    try {
      const [from, to] = this.splitPair(symbol);
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.ALPHA_VANTAGE_KEY}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const rate = data['Realtime Currency Exchange Rate'];
      
      if (rate && rate['5. Exchange Rate'] && parseFloat(rate['5. Exchange Rate']) > 0) {
        const price = parseFloat(rate['5. Exchange Rate']);
        
        return {
          price: price,
          timestamp: Date.now(),
          source: 'AlphaVantage',
          changePercent: rate['9. Change']?.toFixed(2) + '%'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchFromFreeForexAPI(symbol: string): Promise<PriceData | null> {
    try {
      const [base, quote] = this.splitPair(symbol);
      const pairNoSlash = `${base}${quote}`;
      
      const response = await fetch(
        `https://www.freeforexapi.com/api/live?pairs=${pairNoSlash}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data?.rates?.[pairNoSlash]?.rate && parseFloat(data.rates[pairNoSlash].rate) > 0) {
        return {
          price: parseFloat(data.rates[pairNoSlash].rate),
          timestamp: Date.now(),
          source: 'FreeForexAPI'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchFromExchangeRateHost(symbol: string): Promise<PriceData | null> {
    try {
      const [base, quote] = this.splitPair(symbol);
      
      const response = await fetch(
        `https://api.exchangerate.host/convert?from=${base}&to=${quote}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data?.info?.rate && parseFloat(data.info.rate) > 0) {
        return {
          price: parseFloat(data.info.rate),
          timestamp: Date.now(),
          source: 'ExchangeRate.host'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchFromFrankfurter(symbol: string): Promise<PriceData | null> {
    try {
      const [base, quote] = this.splitPair(symbol);
      
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${base}&to=${quote}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data?.rates?.[quote] && parseFloat(data.rates[quote]) > 0) {
        return {
          price: parseFloat(data.rates[quote]),
          timestamp: Date.now(),
          source: 'Frankfurter'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async checkPriceMovement(symbol: string, currentPrice: number): Promise<void> {
    const lastPrice = this.lastPrices.get(symbol);
    if (lastPrice) {
      const changePercent = Math.abs((currentPrice - lastPrice) / lastPrice) * 100;
      
      if (changePercent >= 0.2) { // 0.2% movement threshold for ultra-sensitivity
        const reason = `Price moved ${changePercent.toFixed(2)}% in last update`;
        console.log(`🚨 ULTRA-PRECISION price movement detected for ${symbol}: ${reason}`);
        
        // Import and trigger webhook
        try {
          const { webhookService } = await import('./webhookService');
          await webhookService.triggerAutoRefresh(symbol, reason);
        } catch (error) {
          console.log('Webhook service not available:', error);
        }
      }
    }
    
    this.lastPrices.set(symbol, currentPrice);
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
      'GBPJPY': ['GBP', 'JPY'],
      'XAUUSD': ['XAU', 'USD'],
      'BTCUSD': ['BTC', 'USD'],
      'ETHUSD': ['ETH', 'USD']
    };
    
    return specialPairs[pair] || [pair.slice(0, 3), pair.slice(3)];
  }

  private getEnhancedFallback(symbol: string): PriceData {
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
      'GBPJPY': 195.75,
      'XAUUSD': 2687.50,
      'BTCUSD': 121850.00,
      'ETHUSD': 4156.75
    };
    
    const basePrice = basePrices[symbol] || 1.0000;
    
    // CRITICAL FIX 2 NOTE: This fallback is ONLY for visualization
    // Real trading signals will reject fallback prices
    return {
      price: basePrice,
      timestamp: Date.now(),
      source: 'Enhanced Fallback',
      changePercent: '0.00%'
    };
  }

  // Force refresh live price (no cache) with maximum accuracy - FOR TRADING SIGNALS
  async getFreshLivePrice(symbol: string): Promise<PriceData> {
    console.log(`🔄 ULTRA-PRECISION FORCE REFRESH FOR TRADING: Getting strongest possible price for ${symbol}`);
    this.cache.delete(symbol); // Clear cache
    
    // CRITICAL: For trading signals, we CANNOT allow fallback
    return await this.getLivePrice(symbol, { allowFallback: false, forTrading: true });
  }

  startPriceMonitoring(symbols: string[], intervalMs: number = 400): void {
    symbols.forEach(symbol => {
      if (this.priceWatchers.has(symbol)) {
        const existingInterval = this.priceWatchers.get(symbol);
        if (existingInterval) {
          clearTimeout(existingInterval);
        }
      }

      const intervalId = setInterval(async () => {
        try {
          await this.getFreshLivePrice(symbol);
        } catch (error) {
          console.error(`Error monitoring ${symbol}:`, error);
        }
      }, intervalMs) as NodeJS.Timeout;

      this.priceWatchers.set(symbol, intervalId);
      console.log(`👁️ Started ULTRA-PRECISION price monitoring for ${symbol} (${intervalMs}ms interval)`);
    });
  }

  stopPriceMonitoring(symbol?: string): void {
    if (symbol) {
      const intervalId = this.priceWatchers.get(symbol);
      if (intervalId) {
        clearTimeout(intervalId);
        this.priceWatchers.delete(symbol);
        console.log(`🛑 Stopped price monitoring for ${symbol}`);
      }
    } else {
      // Stop all monitoring
      this.priceWatchers.forEach((intervalId, symbol) => {
        clearTimeout(intervalId);
        console.log(`🛑 Stopped price monitoring for ${symbol}`);
      });
      this.priceWatchers.clear();
    }
  }

  // Get API performance stats for monitoring
  getApiStats(): Map<string, ApiStats> {
    return new Map(this.apiStats);
  }
}

export const enhancedPriceService = new EnhancedPriceService();
export type { PriceData, PriceOptions };
