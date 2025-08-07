
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Shield, 
  Target, 
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { EnhancedConsensusResult } from '@/services/enhancedConsensusEngine';

interface InstitutionalSignalCardProps {
  signal: EnhancedConsensusResult;
  onTakeSignal?: () => void;
  onWatchSignal?: () => void;
}

export const InstitutionalSignalCard = ({ 
  signal, 
  onTakeSignal, 
  onWatchSignal 
}: InstitutionalSignalCardProps) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-purple-500 text-white';
      case 'A': return 'bg-green-500 text-white';
      case 'B+': return 'bg-blue-500 text-white';
      case 'B': return 'bg-blue-400 text-white';
      case 'C+': return 'bg-yellow-500 text-black';
      case 'C': return 'bg-yellow-400 text-black';
      case 'D': return 'bg-orange-500 text-white';
      case 'F': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'TAKE': return 'bg-green-500 text-white';
      case 'REDUCE_SIZE': return 'bg-yellow-500 text-black';
      case 'WATCH': return 'bg-blue-500 text-white';
      case 'AVOID': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getConvictionIcon = (level: string) => {
    switch (level) {
      case 'ULTRA_HIGH': return '🔥';
      case 'HIGH': return '⚡';
      case 'MEDIUM': return '📊';
      case 'LOW': return '⚠️';
      default: return '📈';
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {signal.direction === 'BUY' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-xl font-bold">{signal.pair}</span>
            <Badge className={`text-lg px-3 py-1 ${getGradeColor(signal.finalGrade)}`}>
              {signal.finalGrade}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge className={getRecommendationColor(signal.recommendation)}>
              {signal.recommendation}
            </Badge>
            <span className="text-2xl">{getConvictionIcon(signal.convictionLevel)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Signal Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Trade Details
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Entry:</span>
                <span className="font-mono">{signal.entry.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss:</span>
                <span className="font-mono text-red-400">{signal.stopLoss.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Take Profit:</span>
                <span className="font-mono text-green-400">{signal.takeProfit.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk:Reward:</span>
                <span className="font-semibold text-blue-400">{signal.riskReward}:1</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analysis
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Consensus:</span>
                <Badge className={`text-xs ${
                  signal.aiConsensus === 'STRONG' ? 'bg-green-500/20 text-green-400' :
                  signal.aiConsensus === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {signal.aiConsensus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AI Score:</span>
                <span className="font-semibold">{signal.consensusScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Models:</span>
                <span className="text-blue-400">{signal.aiResults.length}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expected Value:</span>
                <span className={`font-semibold ${signal.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {signal.expectedValue > 0 ? '+' : ''}{signal.expectedValue}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Institutional Grade
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Grade:</span>
                <Badge className="bg-purple-500/20 text-purple-400">
                  {signal.institutionalValidation.institutionalGrade}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Filters:</span>
                <span className="text-blue-400">
                  {signal.institutionalValidation.passedFilters}/{signal.institutionalValidation.totalFilters}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level:</span>
                <Badge className={`text-xs ${
                  signal.institutionalValidation.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400' :
                  signal.institutionalValidation.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {signal.institutionalValidation.riskLevel}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confidence:</span>
                <span className="font-semibold text-blue-400">{signal.finalConfidence}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Filters Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Strategy Analysis ({signal.institutionalValidation.passedFilters}/{signal.institutionalValidation.totalFilters} Passed)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {signal.institutionalValidation.filters.map((filter, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  {filter.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm font-medium">{filter.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={filter.score} 
                    className="w-16 h-2"
                  />
                  <span className="text-xs text-gray-400 w-8">{filter.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="space-y-2">
          <h4 className="font-semibold text-white">Institutional Analysis</h4>
          <div className="p-3 bg-gray-800/30 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-300 leading-relaxed">
              {signal.aiReasoning}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {signal.recommendation === 'TAKE' && (
            <Button 
              onClick={onTakeSignal}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Take Full Position
            </Button>
          )}
          
          {signal.recommendation === 'REDUCE_SIZE' && (
            <Button 
              onClick={onTakeSignal}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Take Reduced Size
            </Button>
          )}
          
          {signal.recommendation === 'WATCH' && (
            <Button 
              onClick={onWatchSignal}
              variant="outline" 
              className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              Add to Watchlist
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="px-6 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            View Details
          </Button>
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(signal.timestamp).toLocaleTimeString()}
            </span>
            <span>Processing: {signal.processingTime}ms</span>
            <span>ID: {signal.signalId.slice(-6)}</span>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400">
            {signal.signalStrength}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
