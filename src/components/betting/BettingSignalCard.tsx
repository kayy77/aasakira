
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, AlertTriangle, Clock, Target } from 'lucide-react';

interface BettingSignal {
  id: string;
  sport: string;
  matchup: string;
  bet_type: string;
  odds: number;
  game_time: string;
  confidence: number;
  expected_value: number;
  ai_consensus: string;
  key_factors: string[];
  concerns: string[];
  verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS';
  label: string;
  risk_assessment: string;
}

interface BettingSignalCardProps {
  signal: BettingSignal;
  onAnalyze?: (signalId: string) => void;
}

export const BettingSignalCard: React.FC<BettingSignalCardProps> = ({ signal, onAnalyze }) => {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'LOW_CONSENSUS': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (confidence >= 60) return <TrendingUp className="w-4 h-4 text-green-400" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800 hover:border-purple-500/30 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {signal.sport}
            </Badge>
            <Badge className={`${getVerdictColor(signal.verdict)} font-semibold`}>
              {signal.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {getConfidenceIcon(signal.confidence)}
            <span className="text-sm font-semibold text-gray-300">{signal.confidence}%</span>
          </div>
        </div>
        
        <CardTitle className="text-xl text-white mb-1">
          {signal.matchup}
        </CardTitle>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{signal.game_time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{signal.bet_type}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Betting Details */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-800/30 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Odds</div>
            <div className="text-lg font-bold text-white">{signal.odds > 0 ? '+' : ''}{signal.odds}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Expected Value</div>
            <div className={`text-lg font-bold ${signal.expected_value > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {signal.expected_value > 0 ? '+' : ''}{signal.expected_value.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Risk Level</div>
            <div className="text-lg font-bold text-yellow-400">
              {signal.risk_assessment.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* AI Consensus */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-purple-400">🧠 AI Consensus</div>
          <div className="text-sm text-gray-300 bg-purple-500/10 p-2 rounded-md border border-purple-500/20">
            {signal.ai_consensus}
          </div>
        </div>

        {/* Key Factors */}
        {signal.key_factors.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-green-400">✅ Key Factors</div>
            <div className="space-y-1">
              {signal.key_factors.slice(0, 3).map((factor, index) => (
                <div key={index} className="text-xs text-gray-300 flex items-start gap-1">
                  <span className="text-green-400 mt-1">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concerns */}
        {signal.concerns.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-yellow-400">⚠️ Concerns</div>
            <div className="space-y-1">
              {signal.concerns.slice(0, 2).map((concern, index) => (
                <div key={index} className="text-xs text-gray-300 flex items-start gap-1">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>{concern}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onAnalyze?.(signal.id)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-200"
        >
          Deep Analysis
        </Button>
      </CardContent>
    </Card>
  );
};
