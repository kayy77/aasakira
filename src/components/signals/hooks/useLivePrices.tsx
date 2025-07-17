import { useState, useEffect, useRef } from 'react';
import { enhancedPriceService } from '@/services/enhancedPriceService';
import { useToast } from '@/hooks/use-toast';

interface UseLivePricesProps {
  allowedPairs: string[];
  updateInterval?: number;
}

export const useLivePrices = ({ allowedPairs, updateInterval = 5000 }: UseLivePricesProps) => {
  const [livePrices, setLivePrices] = useState<{ [key: string]: number }>({});
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Handle visibility change to pause/resume updates
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

  const fetchPricesForPairs = async (pairs: string[]) => {
    try {
      console.log(`💰 Fetching live prices for pairs:`, pairs);
      const updatedPrices: { [key: string]: number } = {};
      
      for (const pair of pairs) {
        try {
          const priceData = await enhancedPriceService.getLivePrice(pair);
          updatedPrices[pair] = priceData.price;
          console.log(`✅ Got live price for ${pair}: ${priceData.price} (${priceData.source})`);
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
        const updatedPrices = await fetchPricesForPairs(allowedPairs);
        
        setLivePrices(prev => {
          const hasChanges = JSON.stringify(prev) !== JSON.stringify(updatedPrices);
          if (hasChanges) {
            console.log('📈 Live prices updated:', updatedPrices);
          }
          return updatedPrices;
        });
        
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to update prices:', error);
        setIsConnected(false);
        
        // Only show toast if we were previously connected
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

  // Initial fetch
  useEffect(() => {
    const fetchInitialPrices = async () => {
      setIsConnected(false);
      try {
        console.log('🚀 Fetching initial live prices...');
        const initialPrices = await fetchPricesForPairs(allowedPairs);
        setLivePrices(initialPrices);
        setIsConnected(true);
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
  }, [allowedPairs.join(',')]);

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
  }, [allowedPairs.join(','), updateInterval]);

  return { livePrices, isConnected };
};
