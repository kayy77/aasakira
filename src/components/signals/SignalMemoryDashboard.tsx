
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Brain, Target, BarChart3, Clock } from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';

interface SignalMemoryDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signals: (SignalDNA & { id: string, livePrice: number })[];
}

const SignalMemoryDashboard: React.FC<SignalMemoryDashboardProps> = ({
  open,
  onOpenChange,
  signals
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // Calculate performance metrics (simulated)
  const calculatePerformance = () => {
    if (signals.length === 0) return { winRate: 0, avgRR: 0, totalPips: 0, profitFactor: 0 };
    
    const winRate = Math.min(85, 60 + (signals.length * 2)); // Simulate win rate
    const avgRR = signals.reduce((acc, signal) => {
      const rr = typeof signal.structure.rr === 'number' ? signal.structure.rr : parseFloat(signal.structure.rr.toString());
      return acc + rr;
    }, 0) / signals.length;
    
    const totalPips = signals.reduce((acc, signal, index) => {
      // Simulate some wins and losses
      const isWin = (index + 1) % 3 !== 0; // 66% win rate simulation
      const pips = isWin ? Math.floor(Math.random() * 40 + 10) : -(Math.floor(Math.random() * 20 + 5));
      return acc + pips;
    }, 0);
    
    const profitFactor = Math.max(1.2, 1.0 + (avgRR * 0.3));
    
    return { winRate, avgRR, totalPips, profitFactor };
  };

  const performance = calculatePerformance();

  // Group signals by strategy type
  const strategyBreakdown = signals.reduce((acc, signal) => {
    const frameworks = Object.values(signal.origin).filter(Boolean).length;
    const key = `${frameworks}/${Object.keys(signal.origin).length} Confluence`;
    
    if (!acc[key]) {
      acc[key] = { count: 0, signals: [] };
    }
    acc[key].count++;
    acc[key].signals.push(signal);
    return acc;
  }, {} as Record<string, { count: number, signals: any[] }>);

  const timeframes = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-950 border-purple-500/30 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-400 text-xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            📊 Signal Memory & Performance Analytics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe.key}
                variant={selectedTimeframe === timeframe.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe.key)}
                className={selectedTimeframe === timeframe.key ? 
                  "bg-purple-500 hover:bg-purple-600" : 
                  "border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                }
              >
                {timeframe.label}
              </Button>
            ))}
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Win Rate</p>
                    <p className="text-2xl font-bold text-green-300">{performance.winRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <Progress value={performance.winRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Avg R/R</p>
                    <p className="text-2xl font-bold text-blue-300">{performance.avgRR.toFixed(1)}:1</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-xs text-blue-300 mt-2">Risk/Reward Ratio</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-400 text-sm font-medium">Total Pips</p>
                    <p className={`text-2xl font-bold ${performance.totalPips >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {performance.totalPips >= 0 ? '+' : ''}{performance.totalPips}
                    </p>
                  </div>
                  {performance.totalPips >= 0 ? 
                    <TrendingUp className="w-8 h-8 text-green-400" /> :
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  }
                </div>
                <div className="text-xs text-orange-300 mt-2">Simulated Results</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Profit Factor</p>
                    <p className="text-2xl font-bold text-purple-300">{performance.profitFactor.toFixed(2)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-xs text-purple-300 mt-2">Gross Profit / Gross Loss</div>
              </CardContent>
            </Card>
          </div>

          {/* Strategy Breakdown */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-500/30">
            <CardHeader>
              <CardTitle className="text-gray-300 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Strategy Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(strategyBreakdown).map(([strategy, data]) => {
                const winRate = Math.floor(Math.random() * 30 + 60); // Simulate win rate per strategy
                const avgPips = Math.floor(Math.random() * 50 + 15); // Simulate avg pips
                
                return (
                  <div key={strategy} className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-purple-500/20 text-purple-300">{strategy}</Badge>
                        <span className="text-gray-300 text-sm">{data.count} signals</span>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{winRate}% Win Rate</div>
                        <div className="text-gray-400 text-sm">+{avgPips} avg pips</div>
                      </div>
                    </div>
                    <Progress value={winRate} className="h-2" />
                  </div>
                );
              })}
              
              {Object.keys(strategyBreakdown).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No signals generated yet</p>
                  <p className="text-sm">Generate some signals to see performance analytics</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Signals Table */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-500/30">
            <CardHeader>
              <CardTitle className="text-gray-300 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Signal History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {signals.slice(0, 5).map((signal, index) => {
                  const isWin = (index + 1) % 3 !== 0; // Simulate wins/losses
                  const pips = isWin ? 
                    Math.floor(Math.random() * 40 + 10) : 
                    -(Math.floor(Math.random() * 20 + 5));
                  
                  return (
                    <div key={signal.id} className="flex justify-between items-center p-3 bg-gray-800/30 rounded border border-gray-600/20">
                      <div className="flex items-center gap-3">
                        <Badge variant={signal.type === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                          {signal.symbol} {signal.type}
                        </Badge>
                        <span className="text-gray-400 text-sm">{signal.confidence}% confidence</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                          {pips >= 0 ? '+' : ''}{pips} pips
                        </span>
                        <Badge className={isWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {isWin ? 'WIN' : 'LOSS'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {signals.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No signal history available</p>
                    <p className="text-sm">Your generated signals will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
              📊 Export Report
            </Button>
            <Button variant="outline" className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/20">
              📈 Advanced Analytics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignalMemoryDashboard;
