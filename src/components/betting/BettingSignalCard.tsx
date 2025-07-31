
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, AlertTriangle, Clock, Target, Activity, Flame, Zap } from 'lucide-react';

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
  live_status?: 'ACTIVE' | 'UPCOMING' | 'LIVE' | 'EXPIRED';
  market_heat?: 'HOT' | 'WARM' | 'COOL';
}

interface BettingSignalCardProps {
  signal: BettingSignal;
  onAnalyze?: (signalId: string) => void;
}

export const BettingSignalCard: React.FC<BettingSignalCardProps> = ({ signal, onAnalyze }) => {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'APPROVED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'LOW_CONSENSUS': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLiveStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'UPCOMING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMarketHeatIcon = (heat: string) => {
    switch (heat) {
      case 'HOT': return <Flame className="w-4 h-4 text-red-400" />;
      case 'WARM': return <Zap className="w-4 h-4 text-orange-400" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (confidence >= 60) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  };

  const getSportEmoji = (sport: string) => {
    const sportLower = sport.toLowerCase();
    if (sportLower.includes('football') || sportLower.includes('soccer')) return '⚽';
    if (sportLower.includes('basketball')) return '🏀';
    if (sportLower.includes('mma')) return '🥊';
    if (sportLower.includes('boxing')) return '🥊';
    return '🏆';
  };

  return (
    <Card className={`
      bg-gradient-to-br from-gray-900/80 to-gray-800/80 
      border-gray-700 hover:border-emerald-500/40 
      transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl
      backdrop-blur-sm
      ${signal.market_heat === 'HOT' ? 'ring-1 ring-red-400/30' : ''}
    `}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {getSportEmoji(signal.sport)} {signal.sport}
            </Badge>
            {signal.live_status && (
              <Badge className={`${getLiveStatusColor(signal.live_status)} font-semibold text-xs`}>
                {signal.live_status === 'LIVE' && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-1"></div>}
                {signal.live_status}
              </Badge>
            )}
            {signal.market_heat && (
              <Badge className="bg-gray-700/50 text-gray-300 border-gray-600/30 flex items-center gap-1">
                {getMarketHeatIcon(signal.market_heat)}
                {signal.market_heat}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {getConfidenceIcon(signal.confidence)}
            <span className="text-sm font-bold text-emerald-400">{signal.confidence}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className={`${getVerdictColor(signal.verdict)} font-bold text-xs`}>
            {signal.label}
          </Badge>
        </div>
        
        <CardTitle className="text-xl text-white mb-2 font-bold">
          {signal.matchup}
        </CardTitle>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{signal.game_time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="text-emerald-400 font-semibold">{signal.bet_type}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enhanced Betting Details */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Odds</div>
            <div className="text-lg font-bold text-white">
              {signal.odds.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Expected Value</div>
            <div className={`text-lg font-bold ${signal.expected_value > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {signal.expected_value > 0 ? '+' : ''}{signal.expected_value.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Risk Level</div>
            <div className="text-sm font-bold text-yellow-400">
              {signal.risk_assessment.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* AI Consensus with enhanced styling */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-purple-400 flex items-center gap-2">
            🧠 AI Consensus
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              VERIFIED
            </Badge>
          </div>
          <div className="text-sm text-gray-300 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 rounded-lg border border-purple-500/20">
            {signal.ai_consensus}
          </div>
        </div>

        {/* Key Factors with improved styling */}
        {signal.key_factors.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
              ✅ Key Factors
            </div>
            <div className="space-y-2">
              {signal.key_factors.slice(0, 3).map((factor, index) => (
                <div key={index} className="text-xs text-gray-300 flex items-start gap-2 p-2 bg-emerald-500/5 rounded border-l-2 border-emerald-500/30">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concerns with warning styling */}
        {signal.concerns.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-yellow-400 flex items-center gap-1">
              ⚠️ Risk Factors
            </div>
            <div className="space-y-2">
              {signal.concerns.slice(0, 2).map((concern, index) => (
                <div key={index} className="text-xs text-gray-300 flex items-start gap-2 p-2 bg-yellow-500/5 rounded border-l-2 border-yellow-500/30">
                  <span className="text-yellow-400 font-bold">•</span>
                  <span>{concern}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Action Button */}
        <Button
          onClick={() => onAnalyze?.(signal.id)}
          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold py-3 transition-all duration-200 transform hover:scale-[1.02]"
        >
          🔍 Deep Analysis
        </Button>
      </CardContent>
    </Card>
  );
};
