
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Crown,
  Brain,
  Building2,
  Wifi,
  RefreshCw,
  X,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

export interface BaseSignalData {
  id: string;
  pair: string;
  direction: 'buy' | 'sell';
  entry: string;
  stopLoss: string;
  takeProfit: string;
  livePrice?: number;
  priceSource?: string;
  priceAccuracy?: {
    spread: number;
    pips: number;
    isAccurate: boolean;
    status: string;
  };
  riskReward: string;
  timestamp: Date;
  type: 'institutional' | 'smc' | 'enhanced';
  confidence?: string;
  strategy?: string;
  filtersPassedCount?: number;
  maxFilters?: number;
  reasoning?: Record<string, string>;
  session?: string;
  timeframe?: string;
  hasContradiction?: boolean;
  contradictionWith?: string;
}

interface SignalCardBaseProps {
  signal: BaseSignalData;
  onRemove?: (signalId: string) => void;
  onRefreshPrice?: () => void;
  onViewAnalysis?: () => void;
  isUpdatingPrice?: boolean;
}

const SignalCardBase: React.FC<SignalCardBaseProps> = ({ 
  signal, 
  onRemove, 
  onRefreshPrice,
  onViewAnalysis,
  isUpdatingPrice = false
}) => {
  const [showContradictionInfo, setShowContradictionInfo] = useState(false);

  const getSignalTypeInfo = (type: string) => {
    switch (type) {
      case 'institutional':
        return {
          label: '🏛️ Institutional AI Signal',
          description: 'Raw price action & liquidity flow analysis',
          color: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30',
          icon: <Crown className="w-4 h-4" />
        };
      case 'smc':
        return {
          label: '🧠 Smart Money Concepts',
          description: 'Higher timeframe structure-driven analysis',
          color: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
          icon: <Brain className="w-4 h-4" />
        };
      case 'enhanced':
        return {
          label: '⚡ Enhanced Multi-Confluence',
          description: 'Strategy-based multi-filter analysis',
          color: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
          icon: <Building2 className="w-4 h-4" />
        };
      default:
        return {
          label: '📊 Trading Signal',
          description: 'Market analysis signal',
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: <TrendingUp className="w-4 h-4" />
        };
    }
  };

  const signalTypeInfo = getSignalTypeInfo(signal.type);
  const displayPrice = signal.livePrice || parseFloat(signal.entry);
  const priceAge = signal.timestamp ? Math.floor((Date.now() - signal.timestamp.getTime()) / 1000) : null;

  // Get price accuracy status text
  const getPriceAccuracyStatus = () => {
    if (!signal.priceAccuracy) return 'LIVE';
    
    if (signal.priceAccuracy.isAccurate) {
      return 'VERIFIED';
    } else if (signal.priceAccuracy.pips <= 5) {
      return 'WARNING';
    } else {
      return 'HIGH_SPREAD';
    }
  };

  const priceAccuracyStatus = getPriceAccuracyStatus();

  return (
    <>
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-500/20 hover:border-gray-400/40 transition-all duration-300 relative overflow-hidden">
        {/* Remove Button */}
        <Button
          onClick={() => onRemove?.(signal.id)}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-6 h-6 p-0 text-gray-400 hover:text-white hover:bg-red-500/20 z-10"
        >
          <X className="w-3 h-3" />
        </Button>

        {/* Contradiction Warning */}
        {signal.hasContradiction && (
          <div className="absolute top-2 right-10">
            <Button
              onClick={() => setShowContradictionInfo(true)}
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-orange-400 hover:bg-orange-500/20"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              {signal.direction === 'buy' ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              {signal.pair}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={signal.direction === 'buy' 
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
              }>
                {signal.direction.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Signal Type Badge */}
          <div className="mt-2">
            <Badge className={signalTypeInfo.color}>
              {signalTypeInfo.icon}
              {signalTypeInfo.label}
            </Badge>
            <p className="text-xs text-gray-400 mt-1">{signalTypeInfo.description}</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Live Price Display */}
          <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-lg font-bold text-green-400">LIVE PRICE</span>
                <Badge className={`text-xs ${
                  priceAccuracyStatus === 'VERIFIED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  priceAccuracyStatus === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {priceAccuracyStatus}
                </Badge>
              </div>
              {onRefreshPrice && (
                <Button
                  onClick={onRefreshPrice}
                  disabled={isUpdatingPrice}
                  variant="outline"
                  size="sm"
                  className="border-green-500/30 hover:bg-green-500/20"
                >
                  {isUpdatingPrice ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-white mb-2">
                {displayPrice.toFixed(signal.pair.includes('JPY') ? 3 : 5)}
              </div>
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-green-400 font-medium">
                  Source: {signal.priceSource || 'Live Feed'}
                </span>
                {priceAge !== null && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-gray-400">{priceAge}s ago</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Accuracy Info */}
          {signal.priceAccuracy && (
            <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg">
              <div className="flex items-center gap-2">
                {signal.priceAccuracy.isAccurate ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-sm text-gray-300">
                  Spread: {signal.priceAccuracy.pips.toFixed(1)} pips
                </span>
              </div>
              
              <Badge className={`${
                signal.priceAccuracy.isAccurate
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : signal.priceAccuracy.pips <= 5
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              } text-xs`}>
                {signal.priceAccuracy.status}
              </Badge>
            </div>
          )}

          {/* Filter Status for Institutional */}
          {signal.type === 'institutional' && signal.filtersPassedCount && signal.maxFilters && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Smart Money Filters</span>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                  {signal.filtersPassedCount}/{signal.maxFilters} PASSED
                </Badge>
              </div>
            </div>
          )}

          {/* Session & Timeframe */}
          {(signal.session || signal.timeframe) && (
            <div className="grid grid-cols-2 gap-3">
              {signal.session && (
                <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                  <p className="text-gray-400 text-xs mb-1">Session</p>
                  <p className="text-blue-400 font-bold text-sm">{signal.session}</p>
                </div>
              )}
              {signal.timeframe && (
                <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                  <p className="text-gray-400 text-xs mb-1">Timeframe</p>
                  <p className="text-purple-400 font-bold text-sm">{signal.timeframe}</p>
                </div>
              )}
            </div>
          )}

          {/* Price Levels */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center bg-gray-700/30 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Entry</p>
              <p className="text-white font-mono font-bold">{signal.entry}</p>
            </div>
            <div className="text-center bg-red-500/10 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Stop Loss</p>
              <p className="text-red-400 font-mono font-bold">{signal.stopLoss}</p>
            </div>
            <div className="text-center bg-green-500/10 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Take Profit</p>
              <p className="text-green-400 font-mono font-bold">{signal.takeProfit}</p>
            </div>
          </div>

          {/* Risk Reward */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Risk:Reward Ratio</span>
            </div>
            <p className="text-green-400 font-bold text-lg">{signal.riskReward}</p>
          </div>

          {/* Analysis Button */}
          {onViewAnalysis && (
            <Button 
              onClick={onViewAnalysis}
              variant="outline"
              size="sm"
              className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <Info className="w-4 h-4 mr-2" />
              View Analysis
            </Button>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Generated {signal.timestamp.toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Contradiction Info Modal */}
      <Dialog open={showContradictionInfo} onOpenChange={setShowContradictionInfo}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Signal Contradiction Detected
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <h4 className="text-orange-400 font-medium mb-2">Why Different Signals?</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• <strong>Different Analysis Methods:</strong> Institutional vs Smart Money Concepts use different approaches</p>
                <p>• <strong>Timeframe Differences:</strong> Signals may be analyzing different time horizons</p>
                <p>• <strong>Strategy Focus:</strong> Each method prioritizes different market factors</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <h5 className="text-blue-400 font-medium mb-2">Recommendation</h5>
              <p className="text-sm text-gray-300">
                Consider the signal type, timeframe, and your trading strategy when choosing which signal to follow.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignalCardBase;
