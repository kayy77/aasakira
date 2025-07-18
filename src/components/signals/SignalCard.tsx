
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Target, 
  AlertCircle, 
  DollarSign, 
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  X,
  Share2,
  AlertTriangle
} from 'lucide-react';

interface Signal {
  id: number;
  pair: string;
  type: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  status: 'active' | 'monitoring' | 'confirmed' | 'completed';
  timestamp: string;
  analysis: string;
  timeframe: string;
  risk: 'Low' | 'Medium' | 'High';
  reason: string;
  pips?: number;
}

interface SignalCardProps {
  signal: Signal;
  onTakeSignal?: (signal: Signal) => void;
  onRemoveSignal?: (signalId: number) => void;
  onShareSignal?: (signal: Signal) => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ 
  signal, 
  onTakeSignal, 
  onRemoveSignal,
  onShareSignal 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'monitoring': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'confirmed': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'completed': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      default: return 'bg-red-500/20 border-red-500/30 text-red-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateRR = () => {
    const risk = Math.abs(signal.entry - signal.stopLoss);
    const reward = Math.abs(signal.takeProfit - signal.entry);
    return (reward / risk).toFixed(1);
  };

  const getRiskWarning = () => {
    if (signal.risk === 'High') {
      return "⚠️ High Risk Signal - Consider reducing position size";
    }
    if (signal.risk === 'Medium') {
      return "⚡ Medium Risk - Use standard position sizing with caution";
    }
    return null;
  };

  const riskWarning = getRiskWarning();

  return (
    <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-3 right-3 w-8 h-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-full"
        onClick={() => onRemoveSignal?.(signal.id)}
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            signal.type === 'BUY' ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30'
          }`}>
            {signal.type === 'BUY' ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{signal.pair}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={signal.type === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                {signal.type}
              </Badge>
              <Badge className={getStatusColor(signal.status)}>
                {signal.status.toUpperCase()}
              </Badge>
              <Badge className="bg-gray-500/20 text-gray-300 text-xs">
                {signal.timeframe}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {signal.confidence}%
          </div>
          <div className="text-sm text-gray-400 flex items-center justify-end">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(signal.timestamp)}
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      {riskWarning && (
        <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300 font-medium">
            {riskWarning}
          </AlertDescription>
        </Alert>
      )}

      {/* Price Levels Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">Entry</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{signal.entry}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-red-400">Stop</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{signal.stopLoss}</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-green-400">Target</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">{signal.takeProfit}</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">R:R</span>
          </div>
          <div className="text-lg font-bold text-white">{calculateRR()}:1</div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">Risk Level:</span>
        <Badge className={getRiskColor(signal.risk)}>
          {signal.risk} Risk
        </Badge>
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-purple-400 font-semibold">AI Analysis</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">{signal.analysis}</p>
        <div className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-2 rounded border border-yellow-500/20">
          <strong>Reason:</strong> {signal.reason}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
          onClick={() => onTakeSignal?.(signal)}
        >
          Take Signal
        </Button>
        <Button 
          variant="outline" 
          className="border-gray-600 hover:bg-gray-700/50 text-gray-300 hover:text-white"
          onClick={() => onShareSignal?.(signal)}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};
