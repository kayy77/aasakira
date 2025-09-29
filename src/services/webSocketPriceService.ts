
interface LivePriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
  source: 'deriv' | 'polygon';
}

class WebSocketPriceService {
  private connections = new Map<string, WebSocket>();
  private prices = new Map<string, LivePriceUpdate>();
  private subscribers = new Map<string, Set<(update: LivePriceUpdate) => void>>();
  private connectionStatus = new Map<string, 'connected' | 'disconnected'>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly MAX_PRICE_AGE_MS = 3000; // 3 seconds max age

  constructor() {
    this.startHeartbeatMonitor();
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

    // Send current price if available and fresh
    const currentPrice = this.prices.get(symbol);
    if (currentPrice && this.isPriceFresh(currentPrice)) {
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
        this.connectionStatus.set(symbol, 'connected');
        
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
        console.error(`❌ WebSocket error for ${symbol}:`, error);
        this.connectionStatus.set(symbol, 'disconnected');
        this.handleConnectionError(symbol);
      };

      socket.onclose = () => {
        console.log(`🔌 WebSocket closed for ${symbol}, attempting reconnect...`);
        this.connectionStatus.set(symbol, 'disconnected');
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
    console.log(`⚠️ No fallback - connection must be live for ${symbol}`);
    this.connectionStatus.set(symbol, 'disconnected');
    
    // Clear any stale price data
    this.prices.delete(symbol);
    
    // Retry connection after delay
    setTimeout(() => this.reconnectSymbol(symbol), 10000);
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
    // Every 5 seconds, check for stale prices and remove them
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      this.prices.forEach((priceData, symbol) => {
        const ageMs = now - priceData.timestamp;
        
        // If price is older than 3 seconds, remove it
        if (ageMs > this.MAX_PRICE_AGE_MS) {
          console.log(`🕐 REMOVING STALE PRICE: ${symbol} (${(ageMs / 1000).toFixed(1)}s old)`);
          this.prices.delete(symbol);
          this.connectionStatus.set(symbol, 'disconnected');
        }
      });
    }, 1000); // Check every second
  }

  private isPriceFresh(priceData: LivePriceUpdate): boolean {
    const age = Date.now() - priceData.timestamp;
    return age <= this.MAX_PRICE_AGE_MS;
  }

  getConnectionStatus(): 'connected' | 'disconnected' {
    // Consider connected if we have at least one fresh price
    const hasFreshPrice = Array.from(this.prices.values()).some(price => this.isPriceFresh(price));
    return hasFreshPrice ? 'connected' : 'disconnected';
  }

  getSymbolStatus(symbol: string): 'connected' | 'disconnected' {
    const price = this.prices.get(symbol);
    if (!price) return 'disconnected';
    return this.isPriceFresh(price) ? 'connected' : 'disconnected';
  }

  getCurrentPrice(symbol: string): LivePriceUpdate | null {
    const price = this.prices.get(symbol);
    if (!price || !this.isPriceFresh(price)) {
      return null; // Only return fresh prices
    }
    return price;
  }

  disconnect() {
    // Close all connections
    this.connections.forEach(socket => socket.close());
    this.connections.clear();
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
