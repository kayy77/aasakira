
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { enhancedPriceService, PriceData } from '@/services/enhancedPriceService';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';

interface LivePriceAccuracyIndicatorProps {
  signal: {
    pair: string;
    entry: number;
    livePrice: number;
    timestamp: string;
  };
  onAccuracyCheck?: (isAccurate: boolean, pipDifference: number) => void;
}

const LivePriceAccuracyIndicator: React.FC<LivePriceAccuracyIndicatorProps> = ({ 
  signal, 
  onAccuracyCheck 
}) => {
  const [currentMarketPrice, setCurrentMarketPrice] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [priceSource, setPriceSource] = useState<string>('');

  const fetchCurrentPrice = async () => {
    setIsRefreshing(true);
    try {
      console.log(`🔍 Checking live price accuracy for ${signal.pair}...`);
      
      // Force fresh price fetch
      const priceData = await enhancedPriceService.getFreshPriceForSignal(signal.pair);
      
      setCurrentMarketPrice(priceData.price);
      setPriceSource(priceData.source);
      setLastCheck(new Date());
      
      console.log(`💰 Current market: ${priceData.price}, Signal entry: ${signal.entry}`);
      
      // Calculate accuracy
      const pipDifference = calculatePipDifference(signal.entry, priceData.price, signal.pair);
      const isAccurate = pipDifference <= 5; // Within 5 pips is accurate
      
      if (onAccuracyCheck) {
        onAccuracyCheck(isAccurate, pipDifference);
      }
      
    } catch (error) {
      console.error('Failed to fetch current market price:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCurrentPrice();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchCurrentPrice, 10000);
    return () => clearInterval(interval);
  }, [signal.pair]);

  const calculatePipDifference = (price1: number, price2: number, pair: string): number => {
    const diff = Math.abs(price1 - price2);
    const pipMultiplier = pair.includes('JPY') ? 100 : 10000;
    return Math.round(diff * pipMultiplier * 10) / 10;
  };

  const pipDifference = currentMarketPrice ? calculatePipDifference(signal.entry, currentMarketPrice, signal.pair) : 0;
  const isAccurate = pipDifference <= 5;
  const timeAgo = Math.floor((Date.now() - lastCheck.getTime()) / 1000);

  return (
    <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Live Price Accuracy</span>
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
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Live Market Price */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Live Market</span>
            </div>
            <div className="text-lg font-mono font-bold text-green-300">
              {currentMarketPrice ? 
                currentMarketPrice.toFixed(signal.pair.includes('JPY') ? 3 : 5) : 
                '---'
              }
            </div>
            <div className="text-xs text-green-400">{priceSource}</div>
          </div>

          {/* Signal Entry */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400">Signal Entry</span>
            </div>
            <div className="text-lg font-mono font-bold text-blue-300">
              {signal.entry.toFixed(signal.pair.includes('JPY') ? 3 : 5)}
            </div>
            <div className="text-xs text-blue-400">AI Generated</div>
          </div>
        </div>

        {/* Accuracy Status */}
        <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg">
          <div className="flex items-center gap-2">
            {isAccurate ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm text-gray-300">
              Difference: {pipDifference.toFixed(1)} pips
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${
              isAccurate
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : pipDifference <= 10
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            } text-xs`}>
              {isAccurate ? '✅ ACCURATE' : pipDifference <= 10 ? '⚠️ MODERATE' : '❌ HIGH DIFF'}
            </Badge>
            <span className="text-xs text-gray-400">{timeAgo}s ago</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-3 text-xs text-gray-400 bg-gray-800/20 rounded p-2">
          {isAccurate ? (
            <span className="text-green-400">
              ✅ Signal entry is accurate - within 5 pips of live market price
            </span>
          ) : pipDifference <= 10 ? (
            <span className="text-yellow-400">
              ⚠️ Moderate difference - {pipDifference.toFixed(1)} pips from live market
            </span>
          ) : (
            <span className="text-red-400">
              ❌ High difference detected - {pipDifference.toFixed(1)} pips from live market. Signal may need refresh.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePriceAccuracyIndicator;
