interface LivePriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
  source: 'deriv' | 'polygon' | 'twelvedata' | 'rest';
}

class WebSocketPriceService {
  private connections = new Map<string, WebSocket>();
  private prices = new Map<string, LivePriceUpdate>();
  private subscribers = new Map<string, Set<(update: LivePriceUpdate) => void>>();
  private connectionStatus = new Map<string, 'connected' | 'disconnected' | 'reconnecting'>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pollingIntervals = new Map<string, NodeJS.Timeout>();
  private reconnectAttempts = new Map<string, number>();
  private readonly MAX_PRICE_AGE_MS = 5000; // 5 seconds max age (more lenient)
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private readonly POLLING_INTERVAL_MS = 2000; // Poll every 2 seconds as fallback

  constructor() {
    this.startHeartbeatMonitor();
  }

  subscribeToPrice(symbol: string, callback: (update: LivePriceUpdate) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    if (!this.connections.has(symbol) && !this.pollingIntervals.has(symbol)) {
      this.connectToSymbol(symbol);
    }

    const currentPrice = this.prices.get(symbol);
    if (currentPrice && this.isPriceFresh(currentPrice)) {
      callback(currentPrice);
    }

    return () => {
      this.subscribers.get(symbol)?.delete(callback);
      if (this.subscribers.get(symbol)?.size === 0) {
        this.disconnectFromSymbol(symbol);
        this.stopPolling(symbol);
      }
    };
  }

  private connectToSymbol(symbol: string) {
    console.log(`🔌 Connecting to live price feed for ${symbol}...`);
    this.connectionStatus.set(symbol, 'reconnecting');
    
    try {
      const socket = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");
      
      socket.onopen = () => {
        console.log(`✅ WebSocket connected for ${symbol}`);
        this.connectionStatus.set(symbol, 'connected');
        this.reconnectAttempts.set(symbol, 0);
        
        // Stop polling if WebSocket connects
        this.stopPolling(symbol);
        
        const derivSymbol = this.mapToDerivSymbol(symbol);
        socket.send(JSON.stringify({
          ticks: derivSymbol,
          subscribe: 1
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle error responses from Deriv
          if (data.error) {
            console.warn(`⚠️ Deriv error for ${symbol}:`, data.error.message);
            this.startPollingFallback(symbol);
            return;
          }
          
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
              this.connectionStatus.set(symbol, 'connected');
              this.notifySubscribers(symbol, update);
            }
          }
        } catch (error) {
          console.error(`Error parsing WebSocket message for ${symbol}:`, error);
        }
      };

      socket.onerror = (error) => {
        console.error(`❌ WebSocket error for ${symbol}:`, error);
        this.handleConnectionError(symbol);
      };

      socket.onclose = () => {
        console.log(`🔌 WebSocket closed for ${symbol}`);
        this.handleConnectionError(symbol);
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
      'XAUUSD': 'frxXAUUSD',
      'US30': 'WLDUS30',
      'NAS100': 'WLDND100',
      'SPX500': 'WLDUS500',
      'US100': 'WLDND100'
    };
    
    return mapping[symbol] || 'frxEURUSD';
  }

  private handleConnectionError(symbol: string) {
    const attempts = (this.reconnectAttempts.get(symbol) || 0) + 1;
    this.reconnectAttempts.set(symbol, attempts);
    
    if (attempts <= this.MAX_RECONNECT_ATTEMPTS) {
      console.log(`🔄 Reconnect attempt ${attempts}/${this.MAX_RECONNECT_ATTEMPTS} for ${symbol}`);
      this.connectionStatus.set(symbol, 'reconnecting');
      setTimeout(() => this.reconnectSymbol(symbol), 3000 * attempts);
    } else {
      console.log(`⚠️ Max reconnect attempts reached for ${symbol}, falling back to REST polling`);
      this.startPollingFallback(symbol);
    }
  }

  private startPollingFallback(symbol: string) {
    if (this.pollingIntervals.has(symbol)) return;
    
    console.log(`📡 Starting REST polling fallback for ${symbol}`);
    this.connectionStatus.set(symbol, 'reconnecting');
    
    // Initial fetch
    this.fetchPriceViaREST(symbol);
    
    // Set up interval
    const interval = setInterval(() => {
      this.fetchPriceViaREST(symbol);
    }, this.POLLING_INTERVAL_MS);
    
    this.pollingIntervals.set(symbol, interval);
  }

  private async fetchPriceViaREST(symbol: string) {
    try {
      // Try TwelveData API first (free tier available)
      const twelveDataSymbol = this.mapToTwelveDataSymbol(symbol);
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${twelveDataSymbol}&apikey=demo`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.price && !data.message) {
          const price = parseFloat(data.price);
          if (!isNaN(price) && price > 0) {
            const update: LivePriceUpdate = {
              symbol,
              price,
              timestamp: Date.now(),
              source: 'rest'
            };
            
            this.prices.set(symbol, update);
            this.connectionStatus.set(symbol, 'connected');
            this.notifySubscribers(symbol, update);
            return;
          }
        }
      }
      
      // If TwelveData fails, try Yahoo Finance proxy
      await this.fetchFromYahooProxy(symbol);
      
    } catch (error) {
      console.error(`REST price fetch error for ${symbol}:`, error);
      this.connectionStatus.set(symbol, 'disconnected');
    }
  }

  private async fetchFromYahooProxy(symbol: string) {
    try {
      const yahooSymbol = this.mapToYahooSymbol(symbol);
      // Using a public finance API
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`
      );
      
      if (response.ok) {
        const data = await response.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        
        if (price && !isNaN(price)) {
          const update: LivePriceUpdate = {
            symbol,
            price,
            timestamp: Date.now(),
            source: 'rest'
          };
          
          this.prices.set(symbol, update);
          this.connectionStatus.set(symbol, 'connected');
          this.notifySubscribers(symbol, update);
        }
      }
    } catch (error) {
      // Silently fail, connection status already set to disconnected
    }
  }

  private mapToTwelveDataSymbol(symbol: string): string {
    const mapping: { [key: string]: string } = {
      'XAUUSD': 'XAU/USD',
      'US30': 'DJI',
      'NAS100': 'NDX',
      'SPX500': 'SPX',
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD'
    };
    return mapping[symbol] || symbol;
  }

  private mapToYahooSymbol(symbol: string): string {
    const mapping: { [key: string]: string } = {
      'XAUUSD': 'GC=F',
      'US30': '^DJI',
      'NAS100': '^NDX',
      'SPX500': '^GSPC',
      'EURUSD': 'EURUSD=X',
      'GBPUSD': 'GBPUSD=X'
    };
    return mapping[symbol] || symbol;
  }

  private stopPolling(symbol: string) {
    const interval = this.pollingIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(symbol);
    }
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

  private startHeartbeatMonitor() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      this.prices.forEach((priceData, symbol) => {
        const ageMs = now - priceData.timestamp;
        
        if (ageMs > this.MAX_PRICE_AGE_MS) {
          console.log(`🕐 Price stale: ${symbol} (${(ageMs / 1000).toFixed(1)}s old)`);
          this.connectionStatus.set(symbol, 'disconnected');
          
          // If no polling active, start it
          if (!this.pollingIntervals.has(symbol) && this.subscribers.get(symbol)?.size) {
            this.startPollingFallback(symbol);
          }
        }
      });
    }, 2000);
  }

  private isPriceFresh(priceData: LivePriceUpdate): boolean {
    const age = Date.now() - priceData.timestamp;
    return age <= this.MAX_PRICE_AGE_MS;
  }

  getConnectionStatus(): 'connected' | 'disconnected' {
    const hasFreshPrice = Array.from(this.prices.values()).some(price => this.isPriceFresh(price));
    return hasFreshPrice ? 'connected' : 'disconnected';
  }

  getSymbolStatus(symbol: string): 'connected' | 'disconnected' | 'reconnecting' {
    return this.connectionStatus.get(symbol) || 'disconnected';
  }

  getCurrentPrice(symbol: string): LivePriceUpdate | null {
    const price = this.prices.get(symbol);
    if (!price || !this.isPriceFresh(price)) {
      return null;
    }
    return price;
  }

  disconnect() {
    this.connections.forEach(socket => socket.close());
    this.connections.clear();
    this.pollingIntervals.forEach(interval => clearInterval(interval));
    this.pollingIntervals.clear();
    this.subscribers.clear();
    this.prices.clear();
    this.connectionStatus.clear();
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const webSocketPriceService = new WebSocketPriceService();
export type { LivePriceUpdate };
