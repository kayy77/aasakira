
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trueLivePriceService, LivePriceData } from '@/services/trueLivePriceService';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface PriceAccuracyValidatorProps {
  symbol: string;
  signalPrice: number;
  signalSource: string;
}

const PriceAccuracyValidator: React.FC<PriceAccuracyValidatorProps> = ({ 
  symbol, 
  signalPrice, 
  signalSource 
}) => {
  const [currentMarketPrice, setCurrentMarketPrice] = useState<LivePriceData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const fetchCurrentPrice = async () => {
    setIsRefreshing(true);
    try {
      console.log(`🔍 Validating price accuracy for ${symbol}...`);
      const livePrice = await trueLivePriceService.getTrueLivePrice(symbol);
      setCurrentMarketPrice(livePrice);
      setLastCheck(new Date());
      console.log(`💰 Current market price: ${livePrice.price}, Signal price: ${signalPrice}`);
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
  }, [symbol]);

  const getAccuracy = () => {
    if (!currentMarketPrice) return null;
    
    return trueLivePriceService.validatePriceAccuracy(
      signalPrice,
      currentMarketPrice.price,
      symbol
    );
  };

  const accuracy = getAccuracy();
  const timeSinceCheck = Math.floor((Date.now() - lastCheck.getTime()) / 1000);

  return (
    <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {accuracy?.isAccurate ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : accuracy ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-blue-300 font-medium text-sm">Live Price Accuracy Check</span>
            </div>
            <Button
              onClick={fetchCurrentPrice}
              disabled={isRefreshing}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-500/20"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Price Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="text-xs text-green-400 mb-1">Actual Market Price</div>
              <div className="text-lg font-mono font-bold text-green-300">
                {currentMarketPrice ? 
                  currentMarketPrice.price.toFixed(symbol.includes('JPY') ? 3 : 5) : 
                  '---'
                }
              </div>
              {currentMarketPrice && (
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    currentMarketPrice.accuracy === 'LIVE' ? 'bg-green-400' :
                    currentMarketPrice.accuracy === 'DELAYED' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  {currentMarketPrice.source}
                </div>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="text-xs text-blue-400 mb-1">Signal Entry Price</div>
              <div className="text-lg font-mono font-bold text-blue-300">
                {signalPrice.toFixed(symbol.includes('JPY') ? 3 : 5)}
              </div>
              <div className="text-xs text-blue-400">
                From {signalSource}
              </div>
            </div>
          </div>

          {/* Accuracy Status */}
          {accuracy && (
            <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg">
              <div className="flex items-center gap-2">
                {accuracy.isAccurate ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-gray-300">
                  Difference: {accuracy.pips} pips
                </span>
              </div>
              
              <Badge className={`${
                accuracy.isAccurate
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : accuracy.pips <= 10
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              } text-xs`}>
                {accuracy.status}
              </Badge>
            </div>
          )}

          {/* Status Message */}
          <div className="text-xs text-gray-400 bg-gray-800/20 rounded p-2">
            {accuracy?.isAccurate ? (
              <span className="text-green-400">
                ✅ Signal price is accurate - within 5 pips of live market
              </span>
            ) : accuracy && accuracy.pips <= 10 ? (
              <span className="text-yellow-400">
                ⚠️ Moderate difference - {accuracy.pips} pips from live market
              </span>
            ) : accuracy ? (
              <span className="text-red-400">
                ❌ High difference - signal may need refresh for better entry
              </span>
            ) : (
              <span className="text-blue-400">
                🔍 Validating price accuracy...
              </span>
            )}
            <div className="mt-1 text-gray-500">
              Last checked: {timeSinceCheck}s ago
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceAccuracyValidator;
