
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Brain, 
  TrendingUp, 
  Clock, 
  BarChart3,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { EnhancedSignal } from '@/services/enhancedSignalAnalyzer';

interface EnhancedSignalCardProps {
  signal: EnhancedSignal;
  onBacktest: (signal: EnhancedSignal) => void;
  onCopySignal: (signal: EnhancedSignal) => void;
}

const EnhancedSignalCard: React.FC<EnhancedSignalCardProps> = ({ 
  signal, 
  onBacktest, 
  onCopySignal 
}) => {
  const confidenceColor = signal.confidence >= 80 ? 'text-green-400' : 
                         signal.confidence >= 65 ? 'text-yellow-400' : 
                         'text-red-400';

  const confidenceBg = signal.confidence >= 80 ? 'bg-green-500/20' : 
                      signal.confidence >= 65 ? 'bg-yellow-500/20' : 
                      'bg-red-500/20';

  return (
    <Card className="glass-card hover-glow border-2 border-purple-500/30 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                🧠 Aasakira Signal
                <Badge className={`${confidenceBg} ${confidenceColor} border-0`}>
                  {signal.confidence}%
                </Badge>
              </CardTitle>
              <p className="text-gray-400 text-sm">Enhanced Multi-Confluence Analysis</p>
            </div>
          </div>
          <Badge className={`${
            signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          } border-0 font-bold text-lg px-3 py-1`}>
            {signal.type} {signal.pair}
          </Badge>
        </div>

        {/* Confluence Score */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Confluence Score</span>
            <span className="text-white font-bold">
              {signal.confluenceScore}/{signal.maxConfluence} Filters
            </span>
          </div>
          <Progress 
            value={(signal.confluenceScore / signal.maxConfluence) * 100} 
            className="h-2"
          />
          <div className="flex flex-wrap gap-1">
            {signal.reasons.map((reason, index) => (
              <Badge key={index} variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {reason}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Entry Details */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-gray-400 mb-1">Entry</div>
            <div className="text-white font-bold font-mono text-lg">
              {signal.entry}
            </div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <div className="text-gray-400 mb-1">Stop Loss</div>
            <div className="text-red-400 font-bold font-mono">
              {signal.stopLoss}
            </div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <div className="text-gray-400 mb-1">Take Profit</div>
            <div className="text-green-400 font-bold font-mono">
              {signal.takeProfit}
            </div>
          </div>
        </div>

        {/* Signal Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">R:R Ratio:</span>
            <span className="text-blue-400 font-bold">1:{signal.riskReward}</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span className="text-gray-400">Win Rate:</span>
            <span className="text-green-400 font-bold">{signal.historicalWinRate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400">Valid Until:</span>
            <span className="text-yellow-400 font-bold">{signal.timeValidity.split(' ')[2]}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">Similar:</span>
            <span className="text-purple-400 font-bold">{signal.similarSetups}</span>
          </div>
        </div>

        {/* Historical Analysis */}
        <div className="bg-blue-500/10 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-semibold">Historical Performance</span>
          </div>
          <p className="text-blue-300 text-sm">
            ⚙️ Win Rate: <strong>{signal.historicalWinRate}%</strong> over {signal.similarSetups} similar setups 
            (Avg R:R {(signal.riskReward * 0.9).toFixed(1)}:1)
          </p>
        </div>

        {/* Smart Money Reasoning */}
        <div className="bg-purple-500/10 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-semibold">Smart Money Analysis</span>
          </div>
          <div className="space-y-1 text-sm">
            {signal.reasons.includes('SMC Structure') && (
              <p className="text-purple-300">• Structure: Break of structure confirmed</p>
            )}
            {signal.reasons.includes('Liquidity Sweep') && (
              <p className="text-purple-300">• Liquidity: Recent levels swept with rejection</p>
            )}
            {signal.reasons.includes('Fair Value Gap') && (
              <p className="text-purple-300">• Entry: FVG/Order block retest confirmed</p>
            )}
            {signal.reasons.includes('Volume Spike') && (
              <p className="text-purple-300">• Volume: Institutional volume spike detected</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {signal.tags.map((tag, index) => (
            <Badge key={index} className="bg-gold-500/20 text-gold-400 border-gold-500/30">
              <Zap className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onBacktest(signal)}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-500/30 hover:bg-blue-500/20"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Backtest Analysis
          </Button>
          <Button
            onClick={() => onCopySignal(signal)}
            variant="outline"
            size="sm"
            className="flex-1 border-green-500/30 hover:bg-green-500/20"
          >
            <Target className="w-4 h-4 mr-2" />
            Copy Signal
          </Button>
        </div>

        {/* Risk Warning */}
        <div className="flex items-start gap-2 p-2 bg-orange-500/10 rounded border border-orange-500/30">
          <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-orange-300 text-xs">
            Risk Management: Never risk more than 1-2% of your account per trade. 
            This signal is for educational purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSignalCard;
