
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Clock,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users
} from 'lucide-react';
import { EnhancedSignal } from '@/services/enhancedEliteSignalEngine';

interface EnhancedSignalCardProps {
  signal: EnhancedSignal;
  onRemove?: (signalId: string) => void;
}

const EnhancedSignalCard: React.FC<EnhancedSignalCardProps> = ({ signal, onRemove }) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'strong': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'weak': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'strong': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-400" />;
      case 'weak': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConsensusColor = (approved: boolean, confidenceScore: number) => {
    if (!approved) return 'text-red-400';
    if (confidenceScore >= 4) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <Card className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {signal.type === 'BUY' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="font-bold text-white">{signal.symbol}</span>
            <Badge className={getQualityColor(signal.quality)}>
              {getQualityIcon(signal.quality)}
              {signal.quality.toUpperCase()}
            </Badge>
            {signal.multiAIVerified && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Users className="w-3 h-3 mr-1" />
                AI VERIFIED
              </Badge>
            )}
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(signal.id)}
              className="text-gray-400 hover:text-red-400"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Multi-AI Consensus Display */}
        {signal.aiConsensus && (
          <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">Multi-AI Consensus</span>
              </div>
              <Badge className={`${getConsensusColor(signal.aiConsensus.approved, signal.aiConsensus.confidence_score)} bg-transparent border`}>
                {signal.consensusLabel}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">
              {signal.aiConsensus.confidence_score}/5 AI models agree • Rating: {signal.aiConsensus.final_rating}/10
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price and Confidence */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Entry Price</div>
            <div className="font-bold text-white">{signal.entry.toFixed(5)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Confidence</div>
            <div className="font-bold text-white">{signal.confidence}%</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-gray-400">Stop Loss</div>
            <div className="text-red-400 font-mono">{signal.stopLoss.toFixed(5)}</div>
          </div>
          <div>
            <div className="text-gray-400">Take Profit</div>
            <div className="text-green-400 font-mono">{signal.takeProfit.toFixed(5)}</div>
          </div>
          <div>
            <div className="text-gray-400">R:R</div>
            <div className="text-blue-400 font-mono">{signal.riskReward}:1</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-400">Expected Value</div>
          <div className={`font-bold ${signal.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {signal.expectedValue > 0 ? '+' : ''}{signal.expectedValue.toFixed(2)}
          </div>
        </div>

        {/* AI Votes Breakdown */}
        {signal.aiConsensus && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-300">AI Model Votes:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(signal.aiConsensus.ai_votes).map(([model, vote]) => (
                <div key={model} className="flex items-center justify-between bg-gray-800/30 rounded p-1">
                  <span className="capitalize text-gray-400">{model}</span>
                  <Badge className={`text-xs ${
                    ['Elite', 'Strong'].includes(vote.verdict) 
                      ? 'bg-green-500/20 text-green-400' 
                      : vote.verdict === 'Moderate' 
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    {vote.verdict}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Strategies */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-300">Active Strategies:</div>
          <div className="flex flex-wrap gap-1">
            {signal.strategiesUsed.map((strategy, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {strategy}
              </Badge>
            ))}
          </div>
        </div>

        {/* Groq Analysis */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Institutional Analysis:</span>
          </div>
          <p className="text-sm text-gray-300">{signal.groqAnalysis}</p>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          <span>{new Date(signal.timestamp).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSignalCard;
