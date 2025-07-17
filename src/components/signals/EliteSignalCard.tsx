
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { EliteSignal } from '@/services/eliteSignalEngine';

interface EliteSignalCardProps {
  signal: EliteSignal;
  onRemove: (id: string) => void;
  onRefresh: (id: string) => void;
  onAnalyze: (signal: EliteSignal) => void;
}

const EliteSignalCard: React.FC<EliteSignalCardProps> = ({ 
  signal, 
  onRemove, 
  onRefresh,
  onAnalyze 
}) => {
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'ULTRA': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'STRONG': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'ULTRA': return <Crown className="w-4 h-4" />;
      case 'STRONG': return <Zap className="w-4 h-4" />;
      case 'MEDIUM': return <Target className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const confidenceProgress = (signal.confidence / 100) * 100;
  const filtersProgress = (signal.filtersScore / signal.maxFilters) * 100;

  // Create filter array for display
  const filterArray = [
    { name: 'Structure Break', passed: signal.filters.structureBreak },
    { name: 'Liquidity Sweep', passed: signal.filters.liquiditySweep },
    { name: 'Fair Value Gap', passed: signal.filters.fairValueGap },
    { name: 'Volume Spike', passed: signal.filters.volumeSpike },
    { name: 'RSI Divergence', passed: signal.filters.rsiDivergence },
    { name: 'Session Filter', passed: signal.filters.sessionFilter }
  ];

  return (
    <Card className={`glass-card hover-glow border-2 transition-all duration-300 ${
      signal.signalStrength === 'ULTRA' 
        ? 'border-yellow-500/50 shadow-yellow-500/20 glow-intense' 
        : signal.signalStrength === 'STRONG'
        ? 'border-green-500/50 shadow-green-500/20'
        : 'border-blue-500/30'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              signal.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {signal.type === 'BUY' ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className={`font-bold text-lg px-3 py-1 ${
                  signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                } border-0`}>
                  {signal.type} {signal.pair}
                </Badge>
                <Badge className={getStrengthColor(signal.signalStrength)}>
                  {getStrengthIcon(signal.signalStrength)}
                  {signal.signalStrength}
                </Badge>
                {signal.sniperMode && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Target className="w-3 h-3 mr-1" />
                    SNIPER
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Suggested Lot: {signal.suggestedLot} | {signal.sessionInfo}
              </div>
            </div>
          </div>
        </div>

        {/* Live Price & Filters Score */}
        <div className="flex items-center justify-between text-sm bg-gray-800/30 rounded-lg p-3 mt-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-gray-400">Live:</span>
            <span className="text-white font-mono font-bold">{signal.livePrice}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400">Filters</div>
              <div className="font-bold text-white">{signal.filtersScore}/{signal.maxFilters}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Confidence</div>
              <div className="font-bold text-white">{signal.confidence}%</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Institutional Filter Analysis</h4>
            <Progress value={filtersProgress} className="w-20 h-2" />
          </div>
          <div className="grid grid-cols-1 gap-2">
            {filterArray.map((filter, index) => (
              <div key={index} className={`flex items-center justify-between p-2 rounded text-xs ${
                filter.passed ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <div className="flex items-center gap-2">
                  {filter.passed ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className={filter.passed ? 'text-green-300' : 'text-red-300'}>
                    {filter.name}
                  </span>
                </div>
                <div className={`text-xs ${filter.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {filter.passed ? '✓' : '✗'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entry Details */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-800/20 rounded p-3">
            <div className="text-gray-400 mb-1">Entry</div>
            <div className="text-white font-bold font-mono">{signal.entry}</div>
          </div>
          <div className="bg-red-500/10 rounded p-3">
            <div className="text-gray-400 mb-1">Stop Loss</div>
            <div className="text-red-400 font-bold font-mono">{signal.stopLoss}</div>
          </div>
          <div className="bg-green-500/10 rounded p-3">
            <div className="text-gray-400 mb-1">Take Profit</div>
            <div className="text-green-400 font-bold font-mono">{signal.takeProfit}</div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`border-0 ${
            signal.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400' :
            signal.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {signal.riskLevel} Risk
          </Badge>
          <div className="text-xs text-gray-400">
            {new Date(signal.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Elite Analysis */}
        <div className="bg-gray-800/20 rounded p-3">
          <div className="text-xs text-gray-300 leading-relaxed">
            {signal.analysis}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onAnalyze(signal)}
            variant="outline"
            size="sm"
            className="flex-1 border-purple-500/30 hover:bg-purple-500/20"
          >
            <Eye className="w-4 h-4 mr-2" />
            Deep Analysis
          </Button>
          <Button
            onClick={() => onRefresh(signal.id)}
            variant="outline"
            size="sm"
            className="border-blue-500/30 hover:bg-blue-500/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onRemove(signal.id)}
            variant="outline"
            size="sm"
            className="border-red-500/30 hover:bg-red-500/20"
          >
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EliteSignalCard;
