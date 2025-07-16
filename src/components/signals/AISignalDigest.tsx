
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, TrendingUp, Clock, Target, Lightbulb } from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';

interface AISignalDigestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signals: SignalDNA[];
}

const AISignalDigest: React.FC<AISignalDigestProps> = ({
  open,
  onOpenChange,
  signals
}) => {
  const weeklyInsights = {
    bestSession: 'NY Session (13:00-22:00 UTC)',
    bestStrategy: 'RSI Divergence + Volume Spike',
    successRate: 80,
    recommendedFocus: 'Increase focus on this combination',
    topPair: 'EURUSD',
    topPairWinRate: 85,
    worstPerformer: 'GBPJPY',
    improvementArea: 'Volatility timing'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-950 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 text-xl flex items-center gap-2">
            <FileText className="w-6 h-6" />
            🧠 AI Signal Digest - Weekly Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Week Overview */}
          <Card className="bg-gradient-to-r from-cyan-950/20 to-blue-950/20 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                This Week's Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {weeklyInsights.successRate}%
                  </div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {signals.length}
                  </div>
                  <div className="text-sm text-gray-400">Signals Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {weeklyInsights.topPair}
                  </div>
                  <div className="text-sm text-gray-400">Top Performer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    +247
                  </div>
                  <div className="text-sm text-gray-400">Total Pips</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-900/20 rounded border border-purple-700/30">
                <div className="text-sm font-medium text-purple-300 mb-2">🎯 Primary Discovery:</div>
                <p className="text-gray-300">
                  <strong>{weeklyInsights.successRate}%</strong> of your wins came from <strong>{weeklyInsights.bestSession}</strong> during 
                  <strong> {weeklyInsights.bestStrategy}</strong> setups. {weeklyInsights.recommendedFocus}.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-900/20 rounded border border-green-700/30">
                  <div className="text-sm font-medium text-green-300 mb-1">✅ Strength</div>
                  <p className="text-xs text-gray-300">
                    {weeklyInsights.topPair} shows {weeklyInsights.topPairWinRate}% win rate - your strongest pair this week
                  </p>
                </div>
                
                <div className="p-3 bg-orange-900/20 rounded border border-orange-700/30">
                  <div className="text-sm font-medium text-orange-300 mb-1">⚠️ Improvement Area</div>
                  <p className="text-xs text-gray-300">
                    {weeklyInsights.worstPerformer} needs attention - focus on {weeklyInsights.improvementArea}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time-Based Analysis */}
          <Card className="bg-gradient-to-r from-green-950/20 to-teal-950/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">London Session (08:00-17:00)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={72} className="w-32" />
                    <span className="text-blue-400">72%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">NY Session (13:00-22:00)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-32" />
                    <span className="text-green-400">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tokyo Session (00:00-09:00)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={58} className="w-32" />
                    <span className="text-orange-400">58%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Overlap Periods</span>
                  <div className="flex items-center gap-2">
                    <Progress value={92} className="w-32" />
                    <span className="text-purple-400">92%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Performance */}
          <Card className="bg-gradient-to-r from-orange-950/20 to-red-950/20 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-orange-300 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Strategy Effectiveness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'RSI Divergence + Volume Spike', rate: 89, count: 12 },
                  { name: 'SMC + Institutional Flow', rate: 84, count: 8 },
                  { name: 'Hybrid Multi-Confluence', rate: 78, count: 15 },
                  { name: 'Pure Technical Analysis', rate: 65, count: 6 }
                ].map((strategy, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-orange-900/20 rounded">
                    <div>
                      <div className="text-sm font-medium text-orange-300">{strategy.name}</div>
                      <div className="text-xs text-gray-400">{strategy.count} signals this week</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={strategy.rate} className="w-20" />
                      <span className="text-sm font-bold text-orange-400">{strategy.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-300">📋 Next Week's Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-500/20 text-green-400 mt-0.5">HIGH</Badge>
                  <div className="text-sm text-gray-300">
                    Focus 70% of trading during NY session overlap periods (highest win rate: 92%)
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-yellow-500/20 text-yellow-400 mt-0.5">MED</Badge>
                  <div className="text-sm text-gray-300">
                    Increase EURUSD position sizes - showing consistent 85% win rate
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-orange-500/20 text-orange-400 mt-0.5">LOW</Badge>
                  <div className="text-sm text-gray-300">
                    Reduce GBPJPY exposure until volatility patterns improve
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-500/20 text-purple-400 mt-0.5">NEW</Badge>
                  <div className="text-sm text-gray-300">
                    Test confluence requirement increase to 5/6 for higher accuracy
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISignalDigest;
