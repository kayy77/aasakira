import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BulletproofSignal } from '@/services/bulletproofSignalEngine';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Brain,
  X,
  Clock
} from 'lucide-react';

interface BulletproofSignalCardProps {
  signal: BulletproofSignal;
  onRemove: (id: string) => void;
}

const BulletproofSignalCard: React.FC<BulletproofSignalCardProps> = ({ 
  signal, 
  onRemove 
}) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'strong': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'weak': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Elite': return 'text-purple-400 bg-purple-500/20';
      case 'Professional': return 'text-blue-400 bg-blue-500/20';
      case 'Standard': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <Card className="glass-card border-purple-500/20 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${
        signal.quality === 'strong' ? 'bg-green-500' : 
        signal.quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {signal.type === 'BUY' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white">{signal.symbol}</span>
            <Badge className={getQualityColor(signal.quality)}>
              {signal.quality.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getGradeColor(signal.institutionalGrade)}>
              {signal.institutionalGrade}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(signal.id)}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Signal Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Entry Price</div>
            <div className="text-lg font-bold text-white">{signal.entry.toFixed(5)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Confidence</div>
            <div className="text-lg font-bold text-green-400">{signal.confidence}%</div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Risk Management</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-gray-400">Stop Loss</div>
              <div className="text-red-400 font-medium">{signal.stopLoss.toFixed(5)}</div>
            </div>
            <div>
              <div className="text-gray-400">TP1</div>
              <div className="text-green-400 font-medium">{signal.takeProfit1.toFixed(5)}</div>
            </div>
            <div>
              <div className="text-gray-400">TP2</div>
              <div className="text-green-400 font-medium">
                {signal.takeProfit2?.toFixed(5) || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Strategy & Setup */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Setup Analysis</span>
          </div>
          <div className="text-sm text-gray-400">
            <div><strong>Strategy:</strong> {signal.strategy}</div>
            <div><strong>Setup:</strong> {signal.setupType}</div>
            <div><strong>R:R:</strong> {signal.riskReward}</div>
            <div><strong>EV:</strong> {signal.expectedValue.toFixed(2)}</div>
          </div>
        </div>

        {/* SMC Analysis */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Smart Money Analysis</div>
          <div className="text-xs text-gray-400">{signal.smcAnalysis}</div>
        </div>

        {/* Confluence Factors */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Confluence Factors</div>
          <div className="flex flex-wrap gap-1">
            {signal.confluenceFactors.map((factor, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border-blue-500/30 text-blue-400"
              >
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {/* Execution Notes */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Execution Notes</div>
          <div className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
            {signal.executionNotes}
          </div>
        </div>

        {/* Session & Timing */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(signal.timestamp).toLocaleTimeString()}
          </div>
          <div>{signal.sessionBias}</div>
          <div>Size: {signal.positionSizeRec}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulletproofSignalCard;