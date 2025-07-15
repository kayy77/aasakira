
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Brain, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  BarChart3,
  Users,
  Zap,
  Award,
  Timer,
  RefreshCw
} from 'lucide-react';
import { EnhancedSignalDigest, enhancedSignalDigestService } from '@/services/enhancedSignalDigest';

interface EnhancedSignalDigestCardProps {
  signal: any;
  onExplain: () => void;
}

const EnhancedSignalDigestCard: React.FC<EnhancedSignalDigestCardProps> = ({ signal, onExplain }) => {
  const [digest, setDigest] = useState<EnhancedSignalDigest | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const generatedDigest = enhancedSignalDigestService.generateCompleteDigest(signal);
    setDigest(generatedDigest);
  }, [signal]);

  useEffect(() => {
    if (!digest) return;
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = digest.timeToPlay.validUntil.getTime() - now;
      
      if (remaining <= 0) {
        setTimeRemaining('EXPIRED');
        return;
      }
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [digest]);

  if (!digest) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'A': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'B': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'C': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Fresh': return 'text-green-400';
      case 'Active': return 'text-yellow-400';
      case 'Expiring': return 'text-orange-400';
      case 'Expired': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="glass-card hover-glow border-2 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            Enhanced Signal Digest
            <Badge className={getGradeColor(digest.credibilityScore.grade)}>
              Grade {digest.credibilityScore.grade}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${getUrgencyColor(digest.timeToPlay.urgencyLevel)}`} />
            <span className={`text-sm font-mono ${getUrgencyColor(digest.timeToPlay.urgencyLevel)}`}>
              {timeRemaining}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="credibility" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="credibility">Score</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credibility" className="space-y-4">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  Credibility Score: {digest.credibilityScore.score}/100
                </h4>
                <Badge className={getGradeColor(digest.credibilityScore.grade)}>
                  {digest.credibilityScore.grade} Grade
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Win Rate</span>
                  <span>{digest.credibilityScore.factors.winRate}%</span>
                </div>
                <Progress value={digest.credibilityScore.factors.winRate} className="h-1" />
                
                <div className="flex justify-between text-sm">
                  <span>Risk:Reward</span>
                  <span>{digest.credibilityScore.factors.riskReward}/100</span>
                </div>
                <Progress value={digest.credibilityScore.factors.riskReward} className="h-1" />
                
                <div className="flex justify-between text-sm">
                  <span>Time-Tested Edge</span>
                  <span>{digest.credibilityScore.factors.timeTestedEdge}%</span>
                </div>
                <Progress value={digest.credibilityScore.factors.timeTestedEdge} className="h-1" />
                
                <div className="flex justify-between text-sm">
                  <span>Market Conditions</span>
                  <span>{digest.credibilityScore.factors.marketConditions}%</span>
                </div>
                <Progress value={digest.credibilityScore.factors.marketConditions} className="h-1" />
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Trade Classification
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <Badge className="bg-blue-500/20 text-blue-400">{digest.tradeClassification.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Timeframe:</span>
                  <span className="text-gray-300">{digest.tradeClassification.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-gray-300">{digest.tradeClassification.expectedDuration}</span>
                </div>
                <p className="text-gray-400 text-xs mt-2">{digest.tradeClassification.riskProfile}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-4">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                Counter-Signal Analysis
                <Badge className={`text-xs ${
                  digest.counterAnalysis.conflictLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                  digest.counterAnalysis.conflictLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {digest.counterAnalysis.conflictLevel} Conflict
                </Badge>
              </h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">🏪 Retail Sentiment:</p>
                  <p className="text-sm text-gray-300">{digest.counterAnalysis.retailSentiment}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-green-300 mb-1">🏛️ Institutional View:</p>
                  <p className="text-sm text-gray-300">{digest.counterAnalysis.institutionalView}</p>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                  <p className="text-xs text-blue-300">{digest.counterAnalysis.reasoning}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Live Risk Commentary
                <Badge className={`text-xs ${
                  digest.riskCommentary.level === 'High' || digest.riskCommentary.level === 'Extreme' ? 
                  'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {digest.riskCommentary.level} Risk
                </Badge>
              </h4>
              
              {digest.riskCommentary.warnings.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-red-300 mb-1">⚠️ Warnings:</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {digest.riskCommentary.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {digest.riskCommentary.recommendations.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-green-300 mb-1">💡 Recommendations:</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {digest.riskCommentary.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {digest.riskCommentary.newsEvents.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-300 mb-1">📅 Upcoming Events:</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {digest.riskCommentary.newsEvents.map((event, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Historical Accuracy Replay
              </h4>
              
              <div className="space-y-3">
                {digest.historicalReplays.map((replay, index) => (
                  <div key={replay.id} className={`p-3 rounded border ${
                    replay.outcome === 'Win' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={replay.outcome === 'Win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {replay.outcome}
                        </Badge>
                        <span className="text-sm text-gray-400">{replay.date}</span>
                      </div>
                      <div className="text-sm">
                        <span className={replay.outcome === 'Win' ? 'text-green-400' : 'text-red-400'}>
                          {replay.pips > 0 ? '+' : ''}{replay.pips} pips
                        </span>
                        <span className="text-gray-400 ml-2">({replay.duration})</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300">{replay.chart}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                Recommended Alternatives
              </h4>
              
              <div className="space-y-2">
                {digest.pairAlternatives.alternatives.map((alt, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                    <div>
                      <span className="font-medium text-white">{alt.pair}</span>
                      <p className="text-xs text-gray-400">{alt.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400">{alt.similarity.toFixed(0)}% similar</div>
                      <div className="text-xs text-gray-400">{alt.confidence.toFixed(0)}% confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="personal" className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                Personalized Confidence Overlay
              </h4>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {digest.personalizedConfidence.matchPercentage.toFixed(0)}%
                </div>
                <p className="text-sm text-gray-300">{digest.personalizedConfidence.reasoning}</p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-800/30 rounded p-3">
                  <p className="text-sm text-gray-300">{digest.personalizedConfidence.historicalPerformance}</p>
                </div>
                
                <div className={`rounded p-3 ${
                  digest.personalizedConfidence.matchPercentage > 80 ? 'bg-green-500/10 border border-green-500/30' :
                  digest.personalizedConfidence.matchPercentage > 70 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                  'bg-red-500/10 border border-red-500/30'
                }`}>
                  <p className="text-sm font-medium">💡 Recommendation:</p>
                  <p className="text-sm text-gray-300">{digest.personalizedConfidence.recommendation}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex gap-2">
          <Button
            onClick={onExplain}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            Coach Mode Explanation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSignalDigestCard;
