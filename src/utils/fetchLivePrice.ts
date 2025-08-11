
import axios from "axios";

export async function fetchLivePrice(symbol: string): Promise<number> {
  const apis = [
    { name: "TwelveData", url: `https://api.twelvedata.com/price?symbol=${symbol}&apikey=demo&_=${Date.now()}` },
    { name: "AlphaVantage", url: `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol.slice(0,3)}&to_currency=${symbol.slice(3)}&apikey=demo&_=${Date.now()}` },
    { name: "Polygon", url: `https://api.polygon.io/v1/last/currencies/${symbol.slice(0,3)}/${symbol.slice(3)}?apikey=demo&_=${Date.now()}` },
    { name: "Fallback", url: "" }
  ];

  for (const api of apis) {
    try {
      if (api.name === "Fallback") {
        // Use fallback prices if all APIs fail
        return getFallbackPrice(symbol);
      }
      
      const res = await axios.get(api.url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      const price = extractPrice(api.name, res.data);
      if (price > 0) {
        console.log(`✅ Got live price from ${api.name}: ${price}`);
        return price;
      }
    } catch (error) {
      console.warn(`❌ ${api.name} API failed:`, error);
      continue;
    }
  }

  throw new Error("All price APIs failed.");
}

function extractPrice(apiName: string, data: any): number {
  try {
    switch (apiName) {
      case "TwelveData":
        return parseFloat(data.price);
      case "AlphaVantage":
        return parseFloat(data['Realtime Currency Exchange Rate']?.['5. Exchange Rate']);
      case "Polygon":
        return parseFloat(data.last?.bid || data.last?.ask);
      default:
        return 0;
    }
  } catch {
    return 0;
  }
}

function getFallbackPrice(symbol: string): number {
  const fallbackPrices: { [key: string]: number } = {
    'EURUSD': 1.1600,
    'GBPUSD': 1.2700,
    'USDJPY': 150.25,
    'AUDUSD': 0.6650,
    'USDCAD': 1.3580
  };
  
  return fallbackPrices[symbol] || 1.0000;
}
