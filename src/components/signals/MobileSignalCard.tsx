
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Signal } from '@/types/signalConfig';
import { TrendingUp, TrendingDown, X, Zap } from 'lucide-react';

interface MobileSignalCardProps {
  signal: Signal;
  onTakeSignal?: (signal: Signal) => void;
  onRemoveSignal?: (signalId: string) => void;
}

export const MobileSignalCard: React.FC<MobileSignalCardProps> = ({ 
  signal, 
  onTakeSignal, 
  onRemoveSignal 
}) => {
  const DirectionIcon = signal.type === 'BUY' ? TrendingUp : TrendingDown;
  const directionColor = signal.type === 'BUY' ? 'text-green-400' : 'text-red-400';
  
  const calculateRR = () => {
    if (signal.riskReward) return signal.riskReward.toFixed(1);
    const risk = Math.abs(signal.entry - signal.stopLoss);
    const reward = Math.abs(signal.takeProfit - signal.entry);
    return (reward / risk).toFixed(1);
  };

  const renderFilterBadges = () => {
    const maxFilters = 6;
    const passed = signal.filtersPassed?.length || 0;
    
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: maxFilters }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < passed ? 'bg-green-400' : 'bg-gray-600'
            }`}
          />
        ))}
        <span className="text-xs text-gray-400 ml-2">
          {passed}/{maxFilters}
        </span>
      </div>
    );
  };

  return (
    <Card className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-gray-700/50 rounded-2xl shadow-lg hover:border-purple-500/30 transition-all duration-300">
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-3 right-3 w-6 h-6 p-0 text-gray-400 hover:text-red-400 z-10"
        onClick={() => onRemoveSignal?.(signal.id)}
      >
        <X className="w-3 h-3" />
      </Button>

      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <DirectionIcon className={`w-4 h-4 ${directionColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${directionColor} bg-transparent border`}>
                  {signal.type}
                </Badge>
                <Badge className="text-xs bg-gray-700 text-gray-300">
                  {signal.timeframe || '15m'}
                </Badge>
              </div>
            </div>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 text-sm font-semibold">
            R:R {calculateRR()}:1
          </Badge>
        </div>

        {/* Price Levels - Compact Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
            <p className="text-xs text-blue-400 font-medium">Entry</p>
            <p className="font-mono text-sm font-bold text-white">
              {signal.entry.toFixed(5)}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            <p className="text-xs text-red-400 font-medium">SL</p>
            <p className="font-mono text-sm font-bold text-white">
              {signal.stopLoss.toFixed(5)}
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
            <p className="text-xs text-green-400 font-medium">TP</p>
            <p className="font-mono text-sm font-bold text-white">
              {signal.takeProfit.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Confidence & Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
              {signal.confidence}% confidence
            </Badge>
            {signal.signalStrength && (
              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                {signal.signalStrength}
              </Badge>
            )}
          </div>
          {renderFilterBadges()}
        </div>

        {/* AI Reasoning - Compact */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400">AI Analysis</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
            {signal.analysis || 'Institutional-grade setup detected with multiple confluence factors.'}
          </p>
        </div>

        {/* Take Signal Button - Prominent */}
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl"
          onClick={() => onTakeSignal?.(signal)}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Take Signal
        </Button>
      </CardContent>
    </Card>
  );
};
