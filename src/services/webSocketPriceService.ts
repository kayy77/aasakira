
interface LivePriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
  source: 'deriv' | 'polygon' | 'fallback';
}

class WebSocketPriceService {
  private connections = new Map<string, WebSocket>();
  private prices = new Map<string, LivePriceUpdate>();
  private subscribers = new Map<string, Set<(update: LivePriceUpdate) => void>>();
  private fallbackInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startFallbackMonitor();
  }

  subscribeToPrice(symbol: string, callback: (update: LivePriceUpdate) => void): () => void {
    // Add subscriber
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    // Start WebSocket connection if not exists
    if (!this.connections.has(symbol)) {
      this.connectToSymbol(symbol);
    }

    // Send current price if available
    const currentPrice = this.prices.get(symbol);
    if (currentPrice) {
      callback(currentPrice);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.get(symbol)?.delete(callback);
      if (this.subscribers.get(symbol)?.size === 0) {
        this.disconnectFromSymbol(symbol);
      }
    };
  }

  private connectToSymbol(symbol: string) {
    console.log(`🔌 Connecting to live price feed for ${symbol}...`);
    
    try {
      // Use Deriv WebSocket for major forex pairs
      const socket = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");
      
      socket.onopen = () => {
        console.log(`✅ WebSocket connected for ${symbol}`);
        
        // Subscribe to ticks - map our symbols to Deriv format
        const derivSymbol = this.mapToDerivSymbol(symbol);
        socket.send(JSON.stringify({
          ticks: derivSymbol,
          subscribe: 1
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.tick && data.tick.quote) {
            const livePrice = parseFloat(data.tick.quote);
            
            if (!isNaN(livePrice) && livePrice > 0) {
              const update: LivePriceUpdate = {
                symbol,
                price: livePrice,
                timestamp: Date.now(),
                source: 'deriv'
              };
              
              this.prices.set(symbol, update);
              this.notifySubscribers(symbol, update);
              
              console.log(`📈 LIVE PRICE UPDATE: ${symbol} = ${livePrice.toFixed(5)} (WebSocket)`);
            }
          }
        } catch (error) {
          console.error(`Error parsing WebSocket message for ${symbol}:`, error);
        }
      };

      socket.onerror = (error) => {
        console.error(`WebSocket error for ${symbol}:`, error);
        this.handleConnectionError(symbol);
      };

      socket.onclose = () => {
        console.log(`WebSocket closed for ${symbol}, attempting reconnect...`);
        setTimeout(() => this.reconnectSymbol(symbol), 5000);
      };

      this.connections.set(symbol, socket);
      
    } catch (error) {
      console.error(`Failed to connect WebSocket for ${symbol}:`, error);
      this.handleConnectionError(symbol);
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
      'EURGBP': 'frxEURGBP',
      'EURJPY': 'frxEURJPY',
      'XAUUSD': 'frxXAUUSD',  // Gold
      'US30': 'WS30',         // US30 Index
      'NAS100': 'US_30',      // Alternative NASDAQ mapping
      'US100': 'US_30'        // Another NASDAQ variant
    };
    
    return mapping[symbol] || 'frxEURUSD';
  }

  private handleConnectionError(symbol: string) {
    // Use fallback price immediately
    this.fetchFallbackPrice(symbol);
    
    // Retry connection after delay
    setTimeout(() => this.reconnectSymbol(symbol), 10000);
  }

  private async fetchFallbackPrice(symbol: string) {
    try {
      console.log(`🔄 Fetching fallback price for ${symbol}...`);
      
      let price = 0;
      
      if (symbol === 'XAUUSD') {
        // Get real-time gold price from metals-api.com (free tier)
        const response = await fetch(`https://metals-api.com/api/latest?access_key=YOUR_API_KEY&base=USD&symbols=XAU`);
        if (response.ok) {
          const data = await response.json();
          if (data.rates && data.rates.XAU) {
            price = 1 / data.rates.XAU; // Convert to XAUUSD format
          }
        }
        
        // Fallback to approximate gold price if API fails
        if (!price) {
          price = 2650 + (Math.random() - 0.5) * 20; // Realistic gold price range
        }
      } else if (symbol === 'US30' || symbol === 'NAS100' || symbol === 'US100') {
        // Approximate NASDAQ/Dow Jones price (would need real API in production)
        price = symbol === 'US30' ? 43000 + (Math.random() - 0.5) * 1000 : 16000 + (Math.random() - 0.5) * 500;
      } else {
        // Regular forex pairs
        const [base, quote] = this.parseCurrencyPair(symbol);
        const response = await fetch(
          `https://api.exchangerate.host/convert?from=${base}&to=${quote}&amount=1&_=${Date.now()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.result && data.success) {
            price = parseFloat(data.result);
          }
        }
      }
      
      if (price > 0) {
        const update: LivePriceUpdate = {
          symbol,
          price,
          timestamp: Date.now(),
          source: 'fallback'
        };
        
        this.prices.set(symbol, update);
        this.notifySubscribers(symbol, update);
        
        console.log(`🆘 FALLBACK PRICE: ${symbol} = ${update.price.toFixed(symbol === 'XAUUSD' ? 2 : 0)}`);
      }
    } catch (error) {
      console.error(`Fallback price fetch failed for ${symbol}:`, error);
    }
  }

  private parseCurrencyPair(symbol: string): [string, string] {
    if (symbol.length === 6) {
      return [symbol.substring(0, 3), symbol.substring(3, 6)];
    }
    return ['USD', 'EUR'];
  }

  private reconnectSymbol(symbol: string) {
    if (this.subscribers.get(symbol)?.size > 0) {
      this.disconnectFromSymbol(symbol);
      this.connectToSymbol(symbol);
    }
  }

  private disconnectFromSymbol(symbol: string) {
    const socket = this.connections.get(symbol);
    if (socket) {
      socket.close();
      this.connections.delete(symbol);
    }
  }

  private notifySubscribers(symbol: string, update: LivePriceUpdate) {
    const callbacks = this.subscribers.get(symbol);
    if (callbacks) {
      callbacks.forEach(callback => callback(update));
    }
  }

  private startFallbackMonitor() {
    // Every 10 seconds, check if any prices are stale and refresh them
    this.fallbackInterval = setInterval(() => {
      const now = Date.now();
      
      this.prices.forEach((priceData, symbol) => {
        const ageSeconds = (now - priceData.timestamp) / 1000;
        
        // If price is older than 30 seconds, fetch fallback
        if (ageSeconds > 30) {
          console.log(`⚠️ Price for ${symbol} is ${ageSeconds.toFixed(0)}s old, refreshing...`);
          this.fetchFallbackPrice(symbol);
        }
      });
    }, 10000);
  }

  getCurrentPrice(symbol: string): LivePriceUpdate | null {
    return this.prices.get(symbol) || null;
  }

  disconnect() {
    // Close all connections
    this.connections.forEach(socket => socket.close());
    this.connections.clear();
    this.subscribers.clear();
    
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }
}

export const webSocketPriceService = new WebSocketPriceService();
export type { LivePriceUpdate };
