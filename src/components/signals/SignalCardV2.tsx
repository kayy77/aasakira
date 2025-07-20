
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Shield, 
  Zap, 
  RefreshCw,
  Trash2,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';

interface SignalCardV2Props {
  signalDNA: SignalDNA;
  livePrice: number;
  onRemove: (signalId: string) => void;
  onRefresh: () => void;
  onBacktest: () => void;
  isUpdating?: boolean;
}

const SignalCardV2: React.FC<SignalCardV2Props> = ({
  signalDNA,
  livePrice,
  onRemove,
  onRefresh,
  onBacktest,
  isUpdating = false
}) => {
  const [currentPrice, setCurrentPrice] = useState(livePrice);

  useEffect(() => {
    setCurrentPrice(livePrice);
  }, [livePrice]);

  // Entry price should match live price exactly
  const entryPrice = currentPrice;
  
  // Fix stop loss and take profit calculation
  const calculateCorrectLevels = () => {
    const isBuy = signalDNA.type === 'BUY';
    const pipValue = signalDNA.symbol.includes('JPY') ? 0.01 : 0.0001;
    
    let stopLoss: number;
    let takeProfit: number;
    
    if (isBuy) {
      // For BUY signals: SL below entry, TP above entry
      stopLoss = entryPrice - (20 * pipValue); // 20 pips below
      takeProfit = entryPrice + (40 * pipValue); // 40 pips above (2:1 RR)
    } else {
      // For SELL signals: SL above entry, TP below entry
      stopLoss = entryPrice + (20 * pipValue); // 20 pips above
      takeProfit = entryPrice - (40 * pipValue); // 40 pips below (2:1 RR)
    }
    
    return { stopLoss, takeProfit };
  };

  const { stopLoss, takeProfit } = calculateCorrectLevels();

  const calculatePips = (price1: number, price2: number) => {
    const diff = Math.abs(price1 - price2);
    if (signalDNA.symbol.includes('JPY')) {
      return (diff * 100).toFixed(1);
    }
    return (diff * 10000).toFixed(1);
  };

  const stopLossPips = calculatePips(entryPrice, stopLoss);
  const takeProfitPips = calculatePips(entryPrice, takeProfit);
  const riskReward = (parseFloat(takeProfitPips) / parseFloat(stopLossPips)).toFixed(2);

  const getDirectionColor = () => {
    return signalDNA.type === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const getDirectionIcon = () => {
    return signalDNA.type === 'BUY' ? TrendingUp : TrendingDown;
  };

  const DirectionIcon = getDirectionIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <Card className="glass-card border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
        {/* Close Button - Moved to top-left and smaller */}
        <Button
          onClick={() => onRemove(signalDNA.symbol)}
          size="sm"
          variant="ghost"
          className="absolute top-1 left-1 z-10 h-5 w-5 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3 h-3" />
        </Button>

        <CardHeader className="pb-3 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-purple-500/20`}>
                <DirectionIcon className={`w-5 h-5 ${getDirectionColor()}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{signalDNA.symbol}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={`${getDirectionColor()} bg-transparent border`}>
                    {signalDNA.type}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {signalDNA.confidence}% Confidence
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Live Price Alert */}
          <Alert className="bg-blue-900/20 border-blue-500/30">
            <Activity className="w-4 h-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <div className="flex justify-between items-center">
                <span>Live Price: <strong>{currentPrice.toFixed(5)}</strong></span>
                <Badge className="bg-blue-500/20 text-blue-400">LIVE</Badge>
              </div>
            </AlertDescription>
          </Alert>

          {/* Trade Levels - Fixed calculations */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Entry</div>
              <div className="font-bold text-white">{entryPrice.toFixed(5)}</div>
              <div className="text-xs text-green-400">Live Price</div>
            </div>
            
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
              <div className="font-bold text-red-400">{stopLoss.toFixed(5)}</div>
              <div className="text-xs text-gray-400">{stopLossPips} pips</div>
            </div>
            
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Take Profit</div>
              <div className="font-bold text-green-400">{takeProfit.toFixed(5)}</div>
              <div className="text-xs text-gray-400">{takeProfitPips} pips</div>
            </div>
          </div>

          {/* Risk Reward */}
          <div className="flex justify-center">
            <Badge className="bg-yellow-500/20 text-yellow-400 px-3 py-1">
              Risk:Reward = 1:{riskReward}
            </Badge>
          </div>

          {/* AI Reasoning */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400">AI Analysis</span>
            </div>
            <p className="text-sm text-gray-300">
              {signalDNA.aiThought || 'Multi-intelligence consensus reached for this trading opportunity.'}
            </p>
          </div>

          {/* Intelligence Sources */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-400 mb-2">Intelligence Sources</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(signalDNA.origin).map(([source, active]) => (
                <div key={source} className={`flex items-center gap-2 text-xs ${
                  active ? 'text-green-400' : 'text-gray-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    active ? 'bg-green-400' : 'bg-gray-500'
                  }`} />
                  {source.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onRefresh}
              disabled={isUpdating}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              onClick={onBacktest}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Target className="w-4 h-4 mr-1" />
              Backtest
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SignalCardV2;
