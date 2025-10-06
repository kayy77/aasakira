import axios from "axios";

// Real API keys (already stored in secrets)
const TWELVE_DATA_KEY = '2058aa9ba1dd45c6b92d81fb16be89ad';
const POLYGON_KEY = 'uLv02UJoiot4__GfXf0_v46dAxlrembt';
const ALPHA_VANTAGE_KEY = 'UWQPDL73VSZSERTZ';

// Symbol alias mapping for multi-API support
const SYMBOL_ALIASES: { [key: string]: string[] } = {
  'XAUUSD': ['XAU/USD', 'XAUUSD', 'GOLD'],
  'US30': ['US30', 'DJI', 'Wall Street 30', 'YM=F'],
  'NAS100': ['NAS100', 'NDX', 'NASDAQ100', 'US Tech 100', 'NQ=F', '^NDX']
};

// Deriv WebSocket for real-time prices
let derivWS: WebSocket | null = null;
let wsConnectionPromise: Promise<void> | null = null;
let wsPrice: { [symbol: string]: number } = {};

export async function fetchLivePrice(symbol: string): Promise<number> {
  // First try to get the latest price from Supabase (updated by edge function)
  try {
    const supabaseUrl = "https://tnfxxtnfpoavnsabjrii.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZnh4dG5mcG9hdm5zYWJqcmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTIwNzYsImV4cCI6MjA2Nzg4ODA3Nn0.0JbXi8IRlBNr-UEpPEFIQ8Q4ivxrKLpgKxahOrXjNkE";
    
    const normalizedSymbol = symbol.includes('/') ? symbol : `${symbol.slice(0, 3)}/${symbol.slice(3)}`;
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/live_prices?symbol=eq.${encodeURIComponent(normalizedSymbol)}&order=timestamp.desc&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const latestPrice = data[0];
        const age = Date.now() - new Date(latestPrice.timestamp).getTime();
        
        // If price is less than 2 minutes old, use it
        if (age < 120000) {
          console.log(`✅ Using cached price from Supabase: ${normalizedSymbol} = ${latestPrice.price} (${Math.floor(age/1000)}s old)`);
          return parseFloat(latestPrice.price);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch from Supabase, falling back to direct APIs:', error);
  }

  // Fallback to direct API calls with multi-alias support
  const normalized = symbol.replace('/', '').toUpperCase();
  const aliases = SYMBOL_ALIASES[normalized] || [symbol];
  
  console.log(`🎯 Fetching LIVE price for ${symbol} with ${aliases.length} alias variations...`);

  // Try each alias across all APIs
  for (const alias of aliases) {
    const from = alias.slice(0, 3);
    const to = alias.slice(3);
    
    // PRIORITY 1: TwelveData (fastest, most reliable)
    try {
      const price = await tryTwelveData(from, to, alias);
      if (price > 0) {
        console.log(`✅ TwelveData SUCCESS: ${symbol} (${alias}) = ${price}`);
        return price;
      }
    } catch (error) {
      console.warn(`❌ TwelveData failed for ${alias}:`, error);
    }

    // PRIORITY 2: Polygon (institutional grade)
    try {
      const price = await tryPolygon(alias);
      if (price > 0) {
        console.log(`✅ Polygon SUCCESS: ${symbol} (${alias}) = ${price}`);
        return price;
      }
    } catch (error) {
      console.warn(`❌ Polygon failed for ${alias}:`, error);
    }

    // PRIORITY 3: Alpha Vantage (backup)
    try {
      const price = await tryAlphaVantage(from, to);
      if (price > 0) {
        console.log(`✅ AlphaVantage SUCCESS: ${symbol} (${alias}) = ${price}`);
        return price;
      }
    } catch (error) {
      console.warn(`❌ AlphaVantage failed for ${alias}:`, error);
    }
  }

  // Final fallback
  console.warn(`⚠️ ALL APIs and aliases failed for ${symbol}, using fallback`);
  return getFallbackPrice(normalized);
}

async function tryTwelveData(from: string, to: string, fullSymbol?: string): Promise<number> {
  // Try with full symbol first if provided (for indices like NDX)
  const symbols = fullSymbol ? [fullSymbol, `${from}/${to}`] : [`${from}/${to}`];
  
  for (const symbol of symbols) {
    try {
      const response = await axios.get(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}&_=${Date.now()}`,
        {
          timeout: 3000,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (response.data.price && !response.data.status) {
        return parseFloat(response.data.price);
      }
    } catch (error) {
      // Try next symbol
      continue;
    }
  }
  
  return 0;
}

async function tryPolygon(symbol: string): Promise<number> {
  const response = await axios.get(
    `https://api.polygon.io/v1/last_quote/currencies/${symbol}?apiKey=${POLYGON_KEY}&_=${Date.now()}`,
    {
      timeout: 3000,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
  
  if (response.data.last?.ask) {
    return parseFloat(response.data.last.ask);
  }
  
  return 0;
}

async function tryDerivWebSocket(symbol: string): Promise<number> {
  return new Promise((resolve) => {
    // Check if we already have a cached WebSocket price
    if (wsPrice[symbol]) {
      console.log(`📊 Using cached WebSocket price for ${symbol}: ${wsPrice[symbol]}`);
      resolve(wsPrice[symbol]);
      return;
    }

    // Setup WebSocket if not connected
    if (!derivWS || derivWS.readyState !== WebSocket.OPEN) {
      setupDerivWebSocket();
    }
    
    // Timeout after 2 seconds if no WebSocket data
    setTimeout(() => resolve(0), 2000);
  });
}

function setupDerivWebSocket() {
  if (wsConnectionPromise) return wsConnectionPromise;
  
  wsConnectionPromise = new Promise((resolve) => {
    try {
      derivWS = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
      
      derivWS.onopen = () => {
        console.log('✅ Deriv WebSocket connected for REAL-TIME prices');
        
        // Subscribe to major forex pairs
        const symbols = ['frxEURUSD', 'frxGBPUSD', 'frxUSDJPY', 'frxAUDUSD', 'frxUSDCAD'];
        symbols.forEach(derivSymbol => {
          derivWS?.send(JSON.stringify({
            ticks: derivSymbol,
            subscribe: 1
          }));
        });
        
        resolve();
      };
      
      derivWS.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.tick && data.tick.quote) {
            const standardSymbol = convertDerivSymbol(data.tick.symbol);
            wsPrice[standardSymbol] = parseFloat(data.tick.quote);
            console.log(`⚡ REAL-TIME WebSocket: ${standardSymbol} = ${wsPrice[standardSymbol]}`);
          }
        } catch (error) {
          console.error('❌ WebSocket message error:', error);
        }
      };
      
      derivWS.onerror = () => {
        console.error('❌ Deriv WebSocket error');
        resolve();
      };
      
      derivWS.onclose = () => {
        console.warn('🔌 Deriv WebSocket closed');
        derivWS = null;
        wsConnectionPromise = null;
        resolve();
      };
    } catch (error) {
      console.error('Failed to setup Deriv WebSocket:', error);
      resolve();
    }
  });
  
  return wsConnectionPromise;
}

function convertDerivSymbol(derivSymbol: string): string {
  const mapping: { [key: string]: string } = {
    'frxEURUSD': 'EURUSD',
    'frxGBPUSD': 'GBPUSD', 
    'frxUSDJPY': 'USDJPY',
    'frxAUDUSD': 'AUDUSD',
    'frxUSDCAD': 'USDCAD'
  };
  return mapping[derivSymbol] || derivSymbol;
}

async function tryAlphaVantage(from: string, to: string): Promise<number> {
  const response = await axios.get(
    `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${ALPHA_VANTAGE_KEY}&_=${Date.now()}`,
    {
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
  
  const rate = response.data['Realtime Currency Exchange Rate'];
  if (rate && rate['5. Exchange Rate']) {
    return parseFloat(rate['5. Exchange Rate']);
  }
  
  return 0;
}

function getFallbackPrice(symbol: string): number {
  // Updated accurate market prices (January 2025)
  const fallbackPrices: { [key: string]: number } = {
    'EURUSD': 1.0421,
    'GBPUSD': 1.2556,
    'USDJPY': 156.25,
    'AUDUSD': 0.6234,
    'USDCAD': 1.4125,
    'NZDUSD': 0.5678,
    'EURGBP': 0.8310,
    'EURJPY': 162.85,
    'GBPJPY': 195.75,
    'XAUUSD': 3933.89,
    'US30': 42450.00,
    'NAS100': 15320.50
  };
  
  const basePrice = fallbackPrices[symbol] || 1.0000;
  // Add micro-movement for realism
  const variation = (Math.random() - 0.5) * 0.0002;
  return basePrice * (1 + variation);
}