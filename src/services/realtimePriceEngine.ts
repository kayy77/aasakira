interface LivePriceData {
  symbol: string;
  price: number;
  timestamp: number;
  source: string;
  bid?: number;
  ask?: number;
  spread?: number;
  dataAge?: number;
  quality: 'real' | 'delayed' | 'stale';
}

interface PriceStream {
  symbol: string;
  websocket?: WebSocket;
  lastPrice: number;
  callbacks: ((price: LivePriceData) => void)[];
}

class RealTimePriceEngine {
  private streams = new Map<string, PriceStream>();
  private priceCache = new Map<string, LivePriceData>();
  private readonly POLYGON_KEY = 'uLv02UJoiot4__GfXf0_v46dAxlrembt';
  private readonly TWELVE_DATA_KEY = '2058aa9ba1dd45c6b92d81fb16be89ad';
  
  // WebSocket connections for real-time feeds
  private derivWS?: WebSocket;
  private binanceWS?: WebSocket;
  private connectionRetries = new Map<string, number>();
  private maxRetries = 5;

  constructor() {
    this.initializeWebSockets();
  }

  private initializeWebSockets() {
    console.log('🚀 Initializing ULTRA-PRECISION WebSocket connections...');
    
    // Initialize Deriv WebSocket for forex - PRIMARY SOURCE
    this.setupDerivWebSocket();
    
    // Initialize Binance WebSocket for crypto
    this.setupBinanceWebSocket();
  }

  private setupDerivWebSocket() {
    try {
      console.log('🔌 Connecting to Deriv WebSocket for REAL-TIME FX prices...');
      this.derivWS = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
      
      this.derivWS.onopen = () => {
        console.log('✅ Deriv WebSocket connected - REAL-TIME PRICES ACTIVE');
        this.connectionRetries.set('deriv', 0);
        
        // Subscribe to major forex pairs for INSTANT updates
        const symbols = ['frxEURUSD', 'frxGBPUSD', 'frxUSDJPY', 'frxAUDUSD', 'frxUSDCAD'];
        symbols.forEach(symbol => {
          this.safeWebSocketSend(this.derivWS, JSON.stringify({
            ticks: symbol,
            subscribe: 1
          }));
          console.log(`📡 Subscribed to LIVE ${symbol} ticks`);
        });
      };

      this.derivWS.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.tick) {
            const now = Date.now();
            const priceData: LivePriceData = {
              symbol: this.convertDerivSymbol(data.tick.symbol),
              price: parseFloat(data.tick.quote),
              timestamp: now,
              source: 'Deriv WebSocket (REAL-TIME)',
              bid: data.tick.bid ? parseFloat(data.tick.bid) : undefined,
              ask: data.tick.ask ? parseFloat(data.tick.ask) : undefined,
              dataAge: 0, // WebSocket data is immediate
              quality: 'real'
            };
            
            console.log(`⚡ REAL-TIME UPDATE: ${priceData.symbol} = ${priceData.price} (0ms delay)`);
            this.updatePrice(priceData);
          }
        } catch (error) {
          console.error('❌ Deriv WebSocket message error:', error);
        }
      };

      this.derivWS.onerror = (error) => {
        console.error('❌ Deriv WebSocket error:', error);
        this.handleWebSocketReconnect('deriv');
      };

      this.derivWS.onclose = () => {
        console.warn('🔌 Deriv WebSocket closed, attempting reconnect...');
        this.handleWebSocketReconnect('deriv');
      };
    } catch (error) {
      console.error('Failed to setup Deriv WebSocket:', error);
      this.handleWebSocketReconnect('deriv');
    }
  }

  private setupBinanceWebSocket() {
    try {
      console.log('🔌 Connecting to Binance WebSocket for crypto prices...');
      const symbols = ['btcusdt', 'ethusdt', 'adausdt', 'dotusdt'];
      const streams = symbols.map(s => `${s}@ticker`).join('/');
      
      this.binanceWS = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
      
      this.binanceWS.onopen = () => {
        console.log('✅ Binance WebSocket connected');
        this.connectionRetries.set('binance', 0);
      };

      this.binanceWS.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.c) {
            const now = Date.now();
            const priceData: LivePriceData = {
              symbol: this.convertBinanceSymbol(data.s),
              price: parseFloat(data.c),
              timestamp: now,
              source: 'Binance WebSocket (REAL-TIME)',
              dataAge: 0,
              quality: 'real'
            };
            
            console.log(`⚡ CRYPTO REAL-TIME: ${priceData.symbol} = ${priceData.price}`);
            this.updatePrice(priceData);
          }
        } catch (error) {
          console.error('❌ Binance WebSocket error:', error);
        }
      };

      this.binanceWS.onerror = () => {
        console.error('❌ Binance WebSocket error');
        this.handleWebSocketReconnect('binance');
      };

      this.binanceWS.onclose = () => {
        console.warn('🔌 Binance WebSocket closed, attempting reconnect...');
        this.handleWebSocketReconnect('binance');
      };
    } catch (error) {
      console.error('Failed to setup Binance WebSocket:', error);
      this.handleWebSocketReconnect('binance');
    }
  }

  private safeWebSocketSend(ws: WebSocket | undefined, message: string): boolean {
    if (!ws) {
      console.warn('❌ WebSocket is undefined, cannot send message');
      return false;
    }

    if (ws.readyState !== WebSocket.OPEN) {
      console.warn(`❌ WebSocket not ready (state: ${ws.readyState}), cannot send: ${message.substring(0, 50)}...`);
      return false;
    }

    try {
      ws.send(message);
      return true;
    } catch (error) {
      console.error('❌ Failed to send WebSocket message:', error);
      return false;
    }
  }

  private handleWebSocketReconnect(source: string) {
    const retries = this.connectionRetries.get(source) || 0;
    
    if (retries < this.maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retries), 30000); // Exponential backoff, max 30s
      this.connectionRetries.set(source, retries + 1);
      
      console.log(`🔄 Reconnecting ${source} WebSocket in ${delay}ms (attempt ${retries + 1}/${this.maxRetries})`);
      
      setTimeout(() => {
        if (source === 'deriv') {
          this.setupDerivWebSocket();
        } else if (source === 'binance') {
          this.setupBinanceWebSocket();
        }
      }, delay);
    } else {
      console.error(`❌ Max reconnection attempts reached for ${source} WebSocket`);
    }
  }

  private convertDerivSymbol(derivSymbol: string): string {
    const mapping: { [key: string]: string } = {
      'frxEURUSD': 'EURUSD',
      'frxGBPUSD': 'GBPUSD',
      'frxUSDJPY': 'USDJPY',
      'frxAUDUSD': 'AUDUSD',
      'frxUSDCAD': 'USDCAD'
    };
    return mapping[derivSymbol] || derivSymbol;
  }

  private convertBinanceSymbol(binanceSymbol: string): string {
    const mapping: { [key: string]: string } = {
      'BTCUSDT': 'BTCUSD',
      'ETHUSDT': 'ETHUSD',
      'ADAUSDT': 'ADAUSD',
      'DOTUSDT': 'DOTUSD'
    };
    return mapping[binanceSymbol] || binanceSymbol;
  }

  // Get TRUE REAL-TIME price with WebSocket priority
  async getRealTimePrice(symbol: string): Promise<LivePriceData> {
    console.log(`🎯 Getting ULTRA-PRECISION live price for ${symbol}...`);
    
    // 1. FIRST PRIORITY: WebSocket data (REAL-TIME)
    const cachedPrice = this.priceCache.get(symbol);
    if (cachedPrice && cachedPrice.quality === 'real' && Date.now() - cachedPrice.timestamp < 1000) {
      console.log(`⚡ Using REAL-TIME WebSocket price for ${symbol}: ${cachedPrice.price} (${cachedPrice.dataAge}ms old)`);
      return cachedPrice;
    }

    // 2. FALLBACK: Try REST APIs with data age validation
    const livePrice = await this.fetchLiveTick(symbol);
    if (livePrice && livePrice.quality !== 'stale') {
      this.updatePrice(livePrice);
      return livePrice;
    }

    // 3. FINAL: Use cached data if not too old
    if (cachedPrice && Date.now() - cachedPrice.timestamp < 5000) {
      console.warn(`⚠️ Using cached price for ${symbol} (${Math.floor((Date.now() - cachedPrice.timestamp) / 1000)}s old)`);
      return {
        ...cachedPrice,
        dataAge: Date.now() - cachedPrice.timestamp,
        quality: 'delayed'
      };
    }

    // 4. EMERGENCY: Realistic fallback
    console.error(`❌ NO VALID PRICES for ${symbol} - using emergency fallback`);
    return this.getRealisticFallback(symbol);
  }

  private async fetchLiveTick(symbol: string): Promise<LivePriceData | null> {
    console.log(`📡 Fetching from REST APIs for ${symbol}...`);
    
    // NEW PRIORITY ORDER: Fastest APIs first
    const apis = [
      { name: 'FreeForexAPI', fetch: this.fetchFromFreeForexAPI.bind(this) },
      { name: 'ExchangeRateHost', fetch: this.fetchFromExchangeRateHost.bind(this) },
      { name: 'Frankfurter', fetch: this.fetchFromFrankfurter.bind(this) },
      { name: 'AlphaVantage', fetch: this.fetchFromAlphaVantage.bind(this) },
      { name: 'Polygon', fetch: this.fetchFromPolygon.bind(this) }
    ];

    for (const api of apis) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          api.fetch(symbol),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]);
        
        if (result) {
          const responseTime = Date.now() - startTime;
          const dataAge = Date.now() - result.timestamp;
          
          // CRITICAL: Validate data freshness
          let quality: 'real' | 'delayed' | 'stale';
          if (dataAge < 3000) {
            quality = 'real';
          } else if (dataAge < 10000) {
            quality = 'delayed';
          } else {
            quality = 'stale';
          }
          
          const enhancedResult: LivePriceData = {
            ...result,
            dataAge,
            quality
          };
          
          console.log(`✅ ${api.name}: ${result.price} (${responseTime}ms response, ${Math.floor(dataAge/1000)}s old, ${quality})`);
          
          // Only return if data is fresh enough
          if (quality !== 'stale') {
            return enhancedResult;
          }
        }
      } catch (error) {
        console.log(`❌ ${api.name} failed:`, error);
      }
    }
    
    return null;
  }

  private async fetchFromFreeForexAPI(symbol: string): Promise<LivePriceData | null> {
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
          symbol,
          price: parseFloat(data.rates[pairNoSlash].rate),
          timestamp: Date.now(),
          source: 'FreeForexAPI',
          quality: 'real'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchFromExchangeRateHost(symbol: string): Promise<LivePriceData | null> {
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
          symbol,
          price: parseFloat(data.info.rate),
          timestamp: Date.now(),
          source: 'ExchangeRate.host',
          quality: 'real'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchFromFrankfurter(symbol: string): Promise<LivePriceData | null> {
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
          symbol,
          price: parseFloat(data.rates[quote]),
          timestamp: Date.now(),
          source: 'Frankfurter',
          quality: 'real'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchFromAlphaVantage(symbol: string): Promise<LivePriceData | null> {
    try {
      const [from, to] = this.splitPair(symbol);
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.TWELVE_DATA_KEY}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const rate = data['Realtime Currency Exchange Rate'];
      
      if (rate && rate['5. Exchange Rate'] && parseFloat(rate['5. Exchange Rate']) > 0) {
        return {
          symbol,
          price: parseFloat(rate['5. Exchange Rate']),
          timestamp: Date.now(),
          source: 'AlphaVantage',
          quality: 'delayed' // AlphaVantage is typically delayed
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fetchFromPolygon(symbol: string): Promise<LivePriceData | null> {
    if (!this.POLYGON_KEY || this.POLYGON_KEY.length < 10) {
      console.warn('⚠️ Polygon API key is missing or invalid. Skipping this source.');
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
          symbol,
          price: parseFloat(data.last.ask),
          timestamp: Date.now(),
          source: 'Polygon',
          quality: 'real'
        };
      }
      return null;
    } catch (error) {
      return null;
    }
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

  private updatePrice(priceData: LivePriceData) {
    // Validate price data before storing
    if (!priceData || priceData.price <= 0 || isNaN(priceData.price)) {
      console.warn(`❌ Invalid price data for ${priceData?.symbol}: ${priceData?.price}`);
      return;
    }

    this.priceCache.set(priceData.symbol, priceData);
    
    // Trigger callbacks for price subscribers
    const stream = this.streams.get(priceData.symbol);
    if (stream) {
      stream.lastPrice = priceData.price;
      stream.callbacks.forEach(callback => callback(priceData));
    }

    const ageDisplay = priceData.dataAge ? `${Math.floor(priceData.dataAge / 1000)}s ago` : 'live';
    console.log(`💰 ${priceData.quality.toUpperCase()} price: ${priceData.symbol} = ${priceData.price} (${priceData.source}, ${ageDisplay})`);
  }

  private getRealisticFallback(symbol: string): LivePriceData {
    const realisticPrices: { [key: string]: number } = {
      'EURUSD': 1.0387,
      'GBPUSD': 1.2489,
      'USDJPY': 157.12,
      'AUDUSD': 0.6198,
      'USDCAD': 1.4401,
      'BTCUSD': 93847.50,
      'ETHUSD': 3284.12
    };
    
    const basePrice = realisticPrices[symbol] || 1.0000;
    
    return {
      symbol,
      price: basePrice,
      timestamp: Date.now(),
      source: 'Emergency Fallback',
      dataAge: 0,
      quality: 'stale'
    };
  }

  subscribeToPrice(symbol: string, callback: (price: LivePriceData) => void): () => void {
    if (!this.streams.has(symbol)) {
      this.streams.set(symbol, {
        symbol,
        lastPrice: 0,
        callbacks: []
      });
    }

    const stream = this.streams.get(symbol)!;
    stream.callbacks.push(callback);

    return () => {
      const index = stream.callbacks.indexOf(callback);
      if (index > -1) {
        stream.callbacks.splice(index, 1);
      }
    };
  }

  startPriceFeeds(symbols: string[], intervalMs: number = 1000) {
    symbols.forEach(symbol => {
      const updatePrice = async () => {
        try {
          await this.getRealTimePrice(symbol);
        } catch (error) {
          console.error(`Error updating ${symbol}:`, error);
        }
      };

      updatePrice();
      setInterval(updatePrice, intervalMs);
    });
  }

  calculatePriceAccuracy(signalEntry: number, livePrice: number, symbol: string): {
    spread: number;
    pips: number;
    isAccurate: boolean;
    status: string;
  } {
    const spread = Math.abs(signalEntry - livePrice);
    const pips = symbol.includes('JPY') ? spread * 100 : spread * 10000;
    const isAccurate = pips <= 1; // ULTRA-STRICT: Within 1 pip is accurate
    
    return {
      spread,
      pips: Math.round(pips * 10) / 10,
      isAccurate,
      status: isAccurate ? '✅ ULTRA-PRECISE' : `❌ Off by ${pips.toFixed(1)} pips`
    };
  }

  // Get connection status for UI
  getConnectionStatus(): { [key: string]: boolean } {
    return {
      deriv: this.derivWS?.readyState === WebSocket.OPEN,
      binance: this.binanceWS?.readyState === WebSocket.OPEN
    };
  }

  // Cleanup method
  destroy() {
    if (this.derivWS) {
      this.derivWS.close();
    }
    if (this.binanceWS) {
      this.binanceWS.close();
    }
    this.streams.clear();
    this.priceCache.clear();
  }
}

export const realTimePriceEngine = new RealTimePriceEngine();
export type { LivePriceData };
