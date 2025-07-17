
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Target, 
  Shield, 
  TrendingUp, 
  Clock, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import type { EliteSignal } from '@/services/eliteSignalEngine';

interface EliteSignalCardProps {
  signal: EliteSignal;
  onTakeSignal?: () => void;
}

export const EliteSignalCard: React.FC<EliteSignalCardProps> = ({ 
  signal, 
  onTakeSignal 
}) => {
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'ULTRA': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'STRONG': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'MEDIUM': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'ULTRA': return <Crown className="w-4 h-4" />;
      case 'STRONG': return <Zap className="w-4 h-4" />;
      case 'MEDIUM': return <Target className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <Card className="glass-card border-purple-500/20 hover-glow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
              {getStrengthIcon(signal.signalStrength)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
              <p className="text-sm text-gray-400">{signal.strategy}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={`${getStrengthColor(signal.signalStrength)} font-bold`}>
              {getStrengthIcon(signal.signalStrength)}
              {signal.signalStrength}
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {signal.confidence}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Signal Direction & Entry */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              signal.type === 'BUY' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <TrendingUp className={`w-4 h-4 ${
                signal.type === 'BUY' ? 'text-green-400' : 'text-red-400 transform rotate-180'
              }`} />
            </div>
            <div>
              <p className="text-white font-semibold">{signal.type} @ {signal.entry}</p>
              <p className="text-sm text-gray-400">Live: {signal.livePrice}</p>
            </div>
          </div>
        </div>

        {/* Risk Parameters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-3 text-center border-red-500/20">
            <div className="text-sm text-red-400 font-semibold">Stop Loss</div>
            <div className="text-xs text-white">{signal.stopLoss}</div>
          </div>
          <div className="glass-card p-3 text-center border-green-500/20">
            <div className="text-sm text-green-400 font-semibold">Take Profit</div>
            <div className="text-xs text-white">{signal.takeProfit}</div>
          </div>
          <div className="glass-card p-3 text-center border-purple-500/20">
            <div className="text-sm text-purple-400 font-semibold">Risk:Reward</div>
            <div className="text-xs text-white">{signal.riskReward}:1</div>
          </div>
        </div>

        {/* Confluence Score */}
        <div className="glass-card p-4 border-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-green-400 font-semibold">Institutional Confluence</span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {signal.filtersScore}/{signal.maxFilters}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {signal.filterBreakdown.passed.map((filter, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span className="text-green-200">{filter}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Risk Level:</span>
          </div>
          <Badge className={`${
            signal.filterBreakdown.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            signal.filterBreakdown.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
            'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            {signal.filterBreakdown.riskLevel}
          </Badge>
        </div>

        {/* Analysis */}
        <div className="glass-card p-4 border-blue-500/20">
          <h4 className="text-blue-400 font-semibold mb-2">Institutional Analysis</h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {signal.reasoning}
          </p>
        </div>

        {/* Lot Size Recommendation */}
        <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400">Suggested Lot Size:</span>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {signal.lotSize}
          </Badge>
        </div>

        {/* Timestamp */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Generated: {new Date(signal.timestamp).toLocaleString()}</span>
        </div>

        {/* Action Button */}
        {onTakeSignal && (
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold hover-lift"
            onClick={onTakeSignal}
          >
            <Target className="w-4 h-4 mr-2" />
            Execute Signal
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EliteSignalCard;
