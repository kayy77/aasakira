
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { enhancedPriceService, PriceData } from '@/services/enhancedPriceService';
import { Activity, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface LivePriceVerificationProps {
  signal: {
    pair: string;
    entry: number;
    livePrice: number;
    priceSource: string;
    lastUpdated: string;
  };
  onPriceUpdate?: (newPrice: number, source: string) => void;
}

const LivePriceVerification: React.FC<LivePriceVerificationProps> = ({ 
  signal, 
  onPriceUpdate 
}) => {
  const [liveData, setLiveData] = useState<PriceData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchLivePrice = async () => {
    setIsRefreshing(true);
    try {
      const priceData = await enhancedPriceService.getLivePrice(signal.pair);
      setLiveData(priceData);
      setLastRefresh(new Date());
      
      if (onPriceUpdate) {
        onPriceUpdate(priceData.price, priceData.source);
      }
    } catch (error) {
      console.error('Failed to fetch live price:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLivePrice();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLivePrice, 5000);
    return () => clearInterval(interval);
  }, [signal.pair]);

  const calculateSpread = (): { pips: number; isAccurate: boolean } => {
    if (!liveData) return { pips: 0, isAccurate: true };
    
    const spread = Math.abs(signal.entry - liveData.price);
    const pips = signal.pair.includes('JPY') ? spread * 100 : spread * 10000;
    const isAccurate = pips <= 5; // Consider accurate if within 5 pips
    
    return { pips: Math.round(pips * 10) / 10, isAccurate };
  };

  const spread = calculateSpread();
  const timeAgo = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);

  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Live Price Verification</span>
          </div>
          <Button
            onClick={fetchLivePrice}
            disabled={isRefreshing}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Live Market Price */}
          <div className="bg-gray-800/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              {liveData?.source === 'Fallback' ? (
                <WifiOff className="w-3 h-3 text-yellow-400" />
              ) : (
                <Wifi className="w-3 h-3 text-green-400" />
              )}
              <span className="text-xs text-gray-400">
                Live Market ({liveData?.source || 'Loading...'})
              </span>
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {liveData ? liveData.price.toFixed(signal.pair.includes('JPY') ? 3 : 5) : '---'}
            </div>
            <div className="text-xs text-gray-400">
              {liveData ? `${liveData.age}ms ago` : 'Loading...'}
            </div>
          </div>

          {/* Signal Entry */}
          <div className="bg-gray-800/40 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Signal Entry</div>
            <div className="text-lg font-mono font-bold text-white">
              {signal.entry.toFixed(signal.pair.includes('JPY') ? 3 : 5)}
            </div>
            <div className="text-xs text-gray-400">
              {signal.priceSource}
            </div>
          </div>
        </div>

        {/* Spread Analysis */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!spread.isAccurate && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
            <span className="text-sm text-gray-300">
              Spread: {spread.pips} pips
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${
              spread.isAccurate 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            } text-xs`}>
              {spread.isAccurate ? '✅ Accurate' : '⚠️ Off by ' + spread.pips + ' pips'}
            </Badge>
            <span className="text-xs text-gray-400">
              {timeAgo}s ago
            </span>
          </div>
        </div>

        {/* Price Movement Alert */}
        {liveData && liveData.age > 30000 && (
          <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300">
            🚨 Price data is {Math.floor(liveData.age / 1000)}s old - refreshing...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LivePriceVerification;
