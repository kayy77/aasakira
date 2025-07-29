
interface LivePriceData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  timestamp: number;
  source: string;
}

class LivePriceWebSocketService {
  private connections = new Map<string, WebSocket>();
  private priceCache = new Map<string, LivePriceData>();
  private callbacks = new Map<string, Set<(data: LivePriceData) => void>>();
  private reconnectAttempts = new Map<string, number>();

  async connectToLiveFeed(symbol: string): Promise<void> {
    if (this.connections.has(symbol)) {
      return;
    }

    console.log(`🔌 Connecting to live feed for ${symbol}...`);
    
    try {
      // Use Deriv WebSocket for reliable forex data
      const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
      
      ws.onopen = () => {
        console.log(`✅ Live feed connected for ${symbol}`);
        this.reconnectAttempts.set(symbol, 0);
        
        // Subscribe to live ticks
        const derivSymbol = this.mapToDerivSymbol(symbol);
        ws.send(JSON.stringify({
          ticks: derivSymbol,
          subscribe: 1
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.tick && data.tick.quote) {
            const price = parseFloat(data.tick.quote);
            const priceData: LivePriceData = {
              symbol,
              price,
              bid: data.tick.bid ? parseFloat(data.tick.bid) : price - 0.00001,
              ask: data.tick.ask ? parseFloat(data.tick.ask) : price + 0.00001,
              timestamp: Date.now(),
              source: 'Deriv WebSocket'
            };
            
            this.priceCache.set(symbol, priceData);
            this.notifyCallbacks(symbol, priceData);
            
            console.log(`📈 LIVE: ${symbol} = ${price.toFixed(5)}`);
          }
        } catch (error) {
          console.error(`Error parsing live data for ${symbol}:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${symbol}:`, error);
        this.handleReconnect(symbol);
      };

      ws.onclose = () => {
        console.log(`WebSocket closed for ${symbol}`);
        this.connections.delete(symbol);
        setTimeout(() => this.handleReconnect(symbol), 2000);
      };

      this.connections.set(symbol, ws);
      
    } catch (error) {
      console.error(`Failed to connect to live feed for ${symbol}:`, error);
      throw error;
    }
  }

  private mapToDerivSymbol(symbol: string): string {
    const mapping: { [key: string]: string } = {
      'EURUSD': 'frxEURUSD',
      'GBPUSD': 'frxGBPUSD',
      'USDJPY': 'frxUSDJPY',
      'AUDUSD': 'frxAUDUSD',
      'USDCAD': 'frxUSDCAD',
      'NZDUSD': 'frxNZDUSD',
      'USDCHF': 'frxUSDCHF'
    };
    
    return mapping[symbol] || 'frxEURUSD';
  }

  private handleReconnect(symbol: string) {
    const attempts = this.reconnectAttempts.get(symbol) || 0;
    
    if (attempts < 5) {
      this.reconnectAttempts.set(symbol, attempts + 1);
      console.log(`🔄 Reconnecting ${symbol} (attempt ${attempts + 1})`);
      setTimeout(() => this.connectToLiveFeed(symbol), 1000 * Math.pow(2, attempts));
    } else {
      console.error(`❌ Max reconnection attempts reached for ${symbol}`);
    }
  }

  private notifyCallbacks(symbol: string, data: LivePriceData) {
    const callbacks = this.callbacks.get(symbol);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  async getLivePrice(symbol: string): Promise<number> {
    // First try cached data
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < 5000) {
      return cached.price;
    }

    // If no WebSocket connection, establish one
    if (!this.connections.has(symbol)) {
      await this.connectToLiveFeed(symbol);
    }

    // Wait for data or use fallback
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log(`⏰ WebSocket timeout for ${symbol}, using fallback`);
        this.getFallbackPrice(symbol).then(resolve).catch(() => resolve(1.0850));
      }, 3000);

      if (cached) {
        clearTimeout(timeout);
        resolve(cached.price);
      } else {
        // Wait for first message
        const callback = (data: LivePriceData) => {
          clearTimeout(timeout);
          this.unsubscribe(symbol, callback);
          resolve(data.price);
        };
        this.subscribe(symbol, callback);
      }
    });
  }

  private async getFallbackPrice(symbol: string): Promise<number> {
    const apis = [
      {
        url: `https://api.freeforexapi.com/api/live?pairs=${symbol}`,
        parser: (data: any) => data?.rates?.[symbol]?.rate
      },
      {
        url: `https://api.exchangerate.host/convert?from=${symbol.slice(0,3)}&to=${symbol.slice(3,6)}`,
        parser: (data: any) => data?.info?.rate
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        const data = await response.json();
        const price = parseFloat(api.parser(data));
        
        if (!isNaN(price) && price > 0) {
          console.log(`🔄 Fallback price for ${symbol}: ${price}`);
          return price;
        }
      } catch (error) {
        console.log(`❌ Fallback API failed for ${symbol}`);
      }
    }

    // Ultimate fallback
    const fallbackPrices: { [key: string]: number } = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 150.25,
      'AUDUSD': 0.6650,
      'USDCAD': 1.3580,
      'NZDUSD': 0.6150,
      'USDCHF': 0.8750
    };

    return fallbackPrices[symbol] || 1.0000;
  }

  subscribe(symbol: string, callback: (data: LivePriceData) => void): () => void {
    if (!this.callbacks.has(symbol)) {
      this.callbacks.set(symbol, new Set());
    }
    
    this.callbacks.get(symbol)!.add(callback);
    
    return () => {
      this.callbacks.get(symbol)?.delete(callback);
    };
  }

  unsubscribe(symbol: string, callback: (data: LivePriceData) => void) {
    this.callbacks.get(symbol)?.delete(callback);
  }

  validatePrices(p1: number, p2: number): boolean {
    return Math.abs(p1 - p2) < 0.0002; // Within 2 pips
  }

  disconnect() {
    this.connections.forEach(ws => ws.close());
    this.connections.clear();
    this.callbacks.clear();
    this.priceCache.clear();
  }
}

export const livePriceService = new LivePriceWebSocketService();
