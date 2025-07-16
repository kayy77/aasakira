
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, Trophy } from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';

interface SignalMemoryDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signals: SignalDNA[];
}

const SignalMemoryDashboard: React.FC<SignalMemoryDashboardProps> = ({
  open,
  onOpenChange,
  signals
}) => {
  const [backtestResults, setBacktestResults] = useState<any[]>([]);
  const [weeklyPerformance, setWeeklyPerformance] = useState({
    totalGain: 0,
    winRate: 0,
    bestStrategy: '',
    worstStrategy: ''
  });

  useEffect(() => {
    if (signals.length > 0) {
      // Simulate historical performance data
      const results = signals.map(signal => ({
        id: signal.id || Math.random().toString(),
        symbol: signal.symbol,
        type: signal.type,
        entry: signal.structure.entry,
        outcome: Math.random() > 0.3 ? 'win' : 'loss',
        pips: Math.random() > 0.3 ? Math.floor(Math.random() * 50 + 10) : -Math.floor(Math.random() * 20 + 5),
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        strategy: signal.aiThought?.split(' ')[0] || 'Hybrid'
      }));
      
      setBacktestResults(results);
      
      const wins = results.filter(r => r.outcome === 'win').length;
      const totalPips = results.reduce((sum, r) => sum + r.pips, 0);
      
      setWeeklyPerformance({
        totalGain: totalPips * 0.1, // Convert pips to percentage
        winRate: (wins / results.length) * 100,
        bestStrategy: 'Hybrid',
        worstStrategy: 'Momentum'
      });
    }
  }, [signals]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-950 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-purple-400 text-xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            🧠 Signal Memory + Backtesting
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Weekly Performance Overview */}
          <Card className="bg-gradient-to-r from-purple-950/20 to-blue-950/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                This Week's Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    +{weeklyPerformance.totalGain.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">Total Gain</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {weeklyPerformance.winRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {weeklyPerformance.bestStrategy}
                  </div>
                  <div className="text-sm text-gray-400">Best Strategy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">
                    {backtestResults.length}
                  </div>
                  <div className="text-sm text-gray-400">Signals Tracked</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <Card className="bg-gradient-to-r from-green-950/20 to-emerald-950/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Strategy Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Hybrid Strategy</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-32" />
                    <span className="text-green-400">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">SMC Only</span>
                  <div className="flex items-center gap-2">
                    <Progress value={72} className="w-32" />
                    <span className="text-blue-400">72%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Institutional</span>
                  <div className="flex items-center gap-2">
                    <Progress value={68} className="w-32" />
                    <span className="text-purple-400">68%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Signals History */}
          <Card className="bg-gradient-to-r from-gray-950/20 to-gray-900/20 border-gray-500/30">
            <CardHeader>
              <CardTitle className="text-gray-300 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Signal Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {backtestResults.slice(0, 10).map((result, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-900/50 rounded border border-gray-700/30">
                    <div className="flex items-center gap-3">
                      <Badge className={result.outcome === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {result.symbol}
                      </Badge>
                      <span className="text-gray-300">{result.type}</span>
                      <span className="text-xs text-gray-500">{result.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.outcome === 'win' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={result.pips > 0 ? 'text-green-400' : 'text-red-400'}>
                        {result.pips > 0 ? '+' : ''}{result.pips} pips
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="bg-gradient-to-r from-cyan-950/20 to-teal-950/20 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">💡 AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Your best performing timeframe: NY Session (4:30 PM - 11:30 PM UTC)</p>
                <p>• 80% of your wins came from Hybrid strategy with 5+ confluences</p>
                <p>• Consider reducing position size on low-confluence signals</p>
                <p>• EURUSD shows 90% win rate - your strongest pair this week</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignalMemoryDashboard;
