
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AIAnalysisProps {
  analysis: {
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    smcAnalysis: string;
    riskReward: number;
  };
  matchResult: {
    won: boolean;
    xpGained: number;
    finalScore: number;
    opponentScore?: number;
  };
  userTrade: {
    entryPrice: string;
    stopLoss: string;
    takeProfit: string;
    reasoning: string;
  };
  chartData?: any[];
}

const AITradeAnalysis: React.FC<AIAnalysisProps> = ({ 
  analysis, 
  matchResult, 
  userTrade,
  chartData 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 9) return { text: 'Excellent', color: 'bg-green-600' };
    if (score >= 8) return { text: 'Very Good', color: 'bg-green-500' };
    if (score >= 7) return { text: 'Good', color: 'bg-yellow-500' };
    if (score >= 6) return { text: 'Fair', color: 'bg-yellow-600' };
    if (score >= 5) return { text: 'Poor', color: 'bg-orange-600' };
    return { text: 'Very Poor', color: 'bg-red-600' };
  };

  return (
    <div className="space-y-6">
      {/* Match Result */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`glass-card border-2 ${
          matchResult.won 
            ? 'border-green-500/50 bg-gradient-to-r from-green-900/20 to-emerald-900/20' 
            : 'border-orange-500/50 bg-gradient-to-r from-orange-900/20 to-red-900/20'
        }`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              {matchResult.won ? (
                <Trophy className="w-16 h-16 text-yellow-400" />
              ) : (
                <Target className="w-16 h-16 text-orange-400" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {matchResult.won ? '🏆 VICTORY!' : '📈 GOOD EFFORT!'}
            </h2>
            <p className="text-gray-300 mb-4">
              {matchResult.won 
                ? 'You outperformed your opponent with superior analysis!' 
                : 'A valuable learning experience - keep improving!'}
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">+{matchResult.xpGained}</div>
                <div className="text-sm text-gray-400">XP Gained</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(matchResult.finalScore)}`}>
                  {matchResult.finalScore}/10
                </div>
                <div className="text-sm text-gray-400">Final Score</div>
              </div>
              {matchResult.opponentScore && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {matchResult.opponentScore}/10
                  </div>
                  <div className="text-sm text-gray-400">Opponent</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Analysis */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <Brain className="w-6 h-6 mr-2" />
            AI Trade Analysis
            <Badge className={`ml-3 ${getScoreBadge(analysis.score).color}`}>
              {getScoreBadge(analysis.score).text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}/10
              </div>
              <div className="text-sm text-gray-400">Overall Score</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">
                1:{analysis.riskReward.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Risk:Reward</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-3xl font-bold text-green-400">
                {analysis.strengths.length}
              </div>
              <div className="text-sm text-gray-400">Strengths Found</div>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              AI Mentor Feedback
            </h4>
            <p className="text-blue-100 leading-relaxed">{analysis.feedback}</p>
          </div>

          {/* SMC Analysis */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">Smart Money Concepts Analysis</h4>
            <p className="text-purple-100 leading-relaxed">{analysis.smcAnalysis}</p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-green-100 text-sm flex items-start">
                    <Star className="w-3 h-3 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Areas to Improve
              </h4>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-red-100 text-sm flex items-start">
                    <XCircle className="w-3 h-3 mr-2 mt-0.5 text-red-400 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trade Summary */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Your Trade Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Entry</div>
                <div className="text-white font-mono">{userTrade.entryPrice}</div>
              </div>
              <div>
                <div className="text-gray-400">Stop Loss</div>
                <div className="text-red-400 font-mono">{userTrade.stopLoss}</div>
              </div>
              <div>
                <div className="text-gray-400">Take Profit</div>
                <div className="text-green-400 font-mono">{userTrade.takeProfit}</div>
              </div>
              <div>
                <div className="text-gray-400">R:R Ratio</div>
                <div className="text-blue-400 font-mono">1:{analysis.riskReward.toFixed(2)}</div>
              </div>
            </div>
            {userTrade.reasoning && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Your Reasoning:</div>
                <div className="text-gray-300 text-sm italic">"{userTrade.reasoning}"</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITradeAnalysis;
