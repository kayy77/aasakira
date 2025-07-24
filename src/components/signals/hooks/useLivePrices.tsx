
import { useState, useEffect, useRef } from 'react';
import { enhancedPriceService } from '@/services/enhancedPriceService';
import { useToast } from '@/hooks/use-toast';

interface UseLivePricesProps {
  allowedPairs: string[];
  updateInterval?: number;
  forceRefresh?: boolean; // NEW: Force fresh prices
}

export const useLivePrices = ({ allowedPairs, updateInterval = 3000, forceRefresh = false }: UseLivePricesProps) => {
  const [livePrices, setLivePrices] = useState<{ [key: string]: number }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (document.hidden && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('🔄 Pausing live price updates - app not visible');
      } else if (!document.hidden && !intervalRef.current) {
        console.log('🔄 Resuming live price updates - app visible');
        startPriceUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchPricesForPairs = async (pairs: string[], force: boolean = false) => {
    try {
      console.log(`💰 Fetching ${force ? 'FRESH' : 'live'} prices for pairs:`, pairs);
      
      // Clear cache if force refresh
      if (force) {
        enhancedPriceService.clearAllCache();
      }
      
      const updatedPrices: { [key: string]: number } = {};
      
      for (const pair of pairs) {
        try {
          const priceData = await enhancedPriceService.getLivePrice(pair, {
            forceRefresh: force,
            allowFallback: true,
            maxDataAge: 2000
          });
          
          updatedPrices[pair] = priceData.price;
          console.log(`✅ Got ${force ? 'FRESH' : 'live'} price for ${pair}: ${priceData.price} (${priceData.source})`);
        } catch (error) {
          console.error(`❌ Failed to get price for ${pair}:`, error);
          // Keep the last known price if available
          if (livePrices[pair]) {
            updatedPrices[pair] = livePrices[pair];
          }
        }
      }
      
      return updatedPrices;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      throw error;
    }
  };

  const startPriceUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (!isVisibleRef.current) return;

      try {
        const updatedPrices = await fetchPricesForPairs(allowedPairs, forceRefresh);
        
        setLivePrices(prev => {
          const hasChanges = JSON.stringify(prev) !== JSON.stringify(updatedPrices);
          if (hasChanges) {
            console.log('📈 Live prices updated:', updatedPrices);
            setLastUpdateTime(new Date());
          }
          return updatedPrices;
        });
        
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to update prices:', error);
        setIsConnected(false);
        
        if (isConnected) {
          toast({
            title: "Price Update Error",
            description: "Lost connection to live price feed. Reconnecting...",
            variant: "destructive",
          });
        }
      }
    }, updateInterval);
  };

  // Initial fetch with force refresh option
  useEffect(() => {
    const fetchInitialPrices = async () => {
      setIsConnected(false);
      try {
        console.log('🚀 Fetching initial live prices...');
        const initialPrices = await fetchPricesForPairs(allowedPairs, forceRefresh);
        setLivePrices(initialPrices);
        setIsConnected(true);
        setLastUpdateTime(new Date());
        console.log('✅ Initial live prices fetched:', initialPrices);
      } catch (error) {
        console.error('Failed to fetch initial prices:', error);
        toast({
          title: "Price Fetch Error",
          description: "Unable to fetch initial live prices. Retrying...",
          variant: "destructive",
        });
      }
    };

    if (allowedPairs.length > 0) {
      fetchInitialPrices();
    }
  }, [allowedPairs.join(','), forceRefresh]);

  // Start price updates
  useEffect(() => {
    if (allowedPairs.length > 0) {
      startPriceUpdates();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [allowedPairs.join(','), updateInterval, forceRefresh]);

  // NEW: Manual refresh function
  const refreshPrices = async () => {
    console.log('🔄 Manual price refresh triggered');
    try {
      const freshPrices = await fetchPricesForPairs(allowedPairs, true);
      setLivePrices(freshPrices);
      setLastUpdateTime(new Date());
      setIsConnected(true);
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  return { 
    livePrices, 
    isConnected, 
    lastUpdateTime, 
    refreshPrices 
  };
};
