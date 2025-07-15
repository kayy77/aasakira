
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trueLivePriceService, LivePriceData } from '@/services/trueLivePriceService';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface PriceAccuracyCheckProps {
  signal: {
    pair: string;
    entry: number;
    livePrice: number;
    priceSource: string;
    priceAccuracy: {
      spread: number;
      pips: number;
      isAccurate: boolean;
      status: string;
    };
  };
}

const PriceAccuracyCheck: React.FC<PriceAccuracyCheckProps> = ({ signal }) => {
  const [currentMarketPrice, setCurrentMarketPrice] = useState<LivePriceData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const fetchCurrentPrice = async () => {
    setIsRefreshing(true);
    try {
      const liveData = await trueLivePriceService.getTrueLivePrice(signal.pair);
      setCurrentMarketPrice(liveData);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Failed to fetch current market price:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCurrentPrice();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchCurrentPrice, 5000);
    return () => clearInterval(interval);
  }, [signal.pair]);

  const getCurrentAccuracy = () => {
    if (!currentMarketPrice) return signal.priceAccuracy;
    
    return trueLivePriceService.validatePriceAccuracy(
      signal.entry,
      currentMarketPrice.price,
      signal.pair
    );
  };

  const currentAccuracy = getCurrentAccuracy();
  const timeAgo = Math.floor((Date.now() - lastCheck.getTime()) / 1000);

  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {currentAccuracy.isAccurate ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-blue-300">Price Accuracy Verification</span>
          </div>
          <Button
            onClick={fetchCurrentPrice}
            disabled={isRefreshing}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Current Market vs Signal Entry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-xs text-green-400 mb-1">Actual Market Price</div>
            <div className="text-lg font-mono font-bold text-green-300">
              {currentMarketPrice ? 
                currentMarketPrice.price.toFixed(signal.pair.includes('JPY') ? 3 : 5) : 
                '---'
              }
            </div>
            {currentMarketPrice && (
              <div className="text-xs text-green-400">
                {currentMarketPrice.source}
              </div>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-xs text-blue-400 mb-1">Signal Entry</div>
            <div className="text-lg font-mono font-bold text-blue-300">
              {signal.entry.toFixed(signal.pair.includes('JPY') ? 3 : 5)}
            </div>
            <div className="text-xs text-blue-400">
              Signal Generated
            </div>
          </div>
        </div>

        {/* Accuracy Status */}
        <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg">
          <div className="flex items-center gap-2">
            {currentAccuracy.isAccurate ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-sm text-gray-300">
              Spread: {currentAccuracy.pips.toFixed(1)} pips
            </span>
          </div>
          
          <Badge className={`${
            currentAccuracy.isAccurate
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : currentAccuracy.pips <= 5
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          } text-xs`}>
            {currentAccuracy.status}
          </Badge>
        </div>

        {/* Accuracy Explanation */}
        <div className="text-xs text-gray-400 bg-gray-800/20 rounded p-2">
          {currentAccuracy.isAccurate ? (
            <span className="text-green-400">
              ✅ Signal entry is accurate - within 2 pips of live market price
            </span>
          ) : currentAccuracy.pips <= 5 ? (
            <span className="text-yellow-400">
              ⚠️ Moderate spread - entry is {currentAccuracy.pips.toFixed(1)} pips from market
            </span>
          ) : (
            <span className="text-red-400">
              ❌ High spread detected - consider refreshing signal for better entry
            </span>
          )}
          <div className="mt-1">
            Last checked: {timeAgo}s ago
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceAccuracyCheck;
