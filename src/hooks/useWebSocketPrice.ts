
import { useState, useEffect, useRef } from 'react';
import { webSocketPriceService, LivePriceUpdate } from '@/services/webSocketPriceService';

interface UseWebSocketPriceReturn {
  price: number | null;
  timestamp: number | null;
  source: string;
  isConnected: boolean;
  age: number; // Age in seconds
}

export const useWebSocketPrice = (symbol: string): UseWebSocketPriceReturn => {
  const [priceData, setPriceData] = useState<LivePriceUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    console.log(`🎯 Subscribing to live price for ${symbol}...`);
    
    // Subscribe to price updates
    const unsubscribe = webSocketPriceService.subscribeToPrice(symbol, (update) => {
      console.log(`📊 Price update received for ${symbol}:`, update);
      setPriceData(update);
      setIsConnected(true);
    });

    unsubscribeRef.current = unsubscribe;

    // Check for existing price data
    const currentPrice = webSocketPriceService.getCurrentPrice(symbol);
    if (currentPrice) {
      setPriceData(currentPrice);
      setIsConnected(true);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol]);

  const age = priceData ? Math.floor((Date.now() - priceData.timestamp) / 1000) : 0;

  return {
    price: priceData?.price || null,
    timestamp: priceData?.timestamp || null,
    source: priceData?.source || 'disconnected',
    isConnected: isConnected && age < 60, // Consider connected if price is less than 1 minute old
    age
  };
};
