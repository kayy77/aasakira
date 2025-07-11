
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Target, 
  AlertCircle, 
  DollarSign, 
  Brain,
  TrendingUp,
  TrendingDown,
  Clock
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
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, onTakeSignal }) => {
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

  return (
    <div className="glass-card p-6 hover-glow animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            signal.type === 'BUY' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
          }`}>
            {signal.type === 'BUY' ? (
              <TrendingUp className="w-6 h-6 text-white" />
            ) : (
              <TrendingDown className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
              <Badge className="text-xs px-2 py-1 bg-gray-500/20 text-gray-300">
                {signal.timeframe}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={signal.type === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                {signal.type}
              </Badge>
              <Badge className={getStatusColor(signal.status)}>
                {signal.status.toUpperCase()}
              </Badge>
              <Badge className={getRiskColor(signal.risk)}>
                {signal.risk} Risk
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {signal.confidence}%
          </div>
          <div className="text-sm text-gray-400 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(signal.timestamp)}
          </div>
        </div>
      </div>

      {/* Price Levels */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-3 border-blue-500/30">
          <div className="flex items-center space-x-1 mb-1">
            <Target className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400">Entry</span>
          </div>
          <div className="text-sm font-bold text-white">{signal.entry}</div>
        </div>
        <div className="glass-card p-3 border-red-500/30">
          <div className="flex items-center space-x-1 mb-1">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400">Stop Loss</span>
          </div>
          <div className="text-sm font-bold text-white">{signal.stopLoss}</div>
        </div>
        <div className="glass-card p-3 border-green-500/30">
          <div className="flex items-center space-x-1 mb-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Take Profit</span>
          </div>
          <div className="text-sm font-bold text-white">{signal.takeProfit}</div>
        </div>
        <div className="glass-card p-3 border-purple-500/30">
          <div className="flex items-center space-x-1 mb-1">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400">R:R</span>
          </div>
          <div className="text-sm font-bold text-white">{calculateRR()}:1</div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400 font-semibold">AI Analysis</span>
        </div>
        <p className="text-gray-300 text-sm mb-2">{signal.analysis}</p>
        <div className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
          <strong>Reason:</strong> {signal.reason}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button 
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={() => onTakeSignal?.(signal)}
        >
          Take Signal
        </Button>
        <Button variant="outline" className="px-4">
          View Chart
        </Button>
      </div>
    </div>
  );
};
