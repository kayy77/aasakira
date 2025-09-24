import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';
import { PairAnalytics } from '@/services/tradeAnalyticsService';

interface PairHeatmapProps {
  analytics: PairAnalytics[];
}

export const PairHeatmap: React.FC<PairHeatmapProps> = ({ analytics }) => {
  const getPerformanceColor = (winRate: number, totalPnL: number) => {
    if (winRate >= 70 && totalPnL > 0) return 'bg-green-500/20 border-green-500';
    if (winRate >= 50 && totalPnL > 0) return 'bg-blue-500/20 border-blue-500';
    if (winRate >= 40) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-red-500/20 border-red-500';
  };

  const getPerformanceIcon = (winRate: number, totalPnL: number) => {
    if (winRate >= 70 && totalPnL > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (winRate >= 50 && totalPnL > 0) return <Target className="w-4 h-4 text-blue-400" />;
    if (winRate >= 40) return <DollarSign className="w-4 h-4 text-yellow-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const formatCurrency = (amount: number) => {
    return `${amount >= 0 ? '+' : ''}$${Math.abs(amount).toLocaleString()}`;
  };

  if (analytics.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Pair/Instrument Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No closed trades found for analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Pair/Instrument Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Discover which markets are your true edge
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.map((pair, index) => (
            <div
              key={pair.pair}
              className={`p-4 rounded-lg border-2 ${getPerformanceColor(pair.winRate, pair.totalPnL)} 
                         hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getPerformanceIcon(pair.winRate, pair.totalPnL)}
                  <h3 className="font-bold text-lg">{pair.pair}</h3>
                </div>
                <Badge variant={index < 3 ? 'default' : 'secondary'}>
                  #{index + 1}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                  <span className={`font-medium ${pair.winRate >= 60 ? 'text-green-400' : 
                                                  pair.winRate >= 50 ? 'text-blue-400' : 'text-red-400'}`}>
                    {pair.winRate.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total P&L</span>
                  <span className={`font-medium ${pair.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(pair.totalPnL)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg P&L</span>
                  <span className={`font-medium ${pair.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(pair.avgPnL)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trades</span>
                  <span className="font-medium">{pair.totalTrades}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Loss</span>
                  <span className="font-medium text-red-400">
                    {formatCurrency(pair.maxLoss)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg R:R</span>
                  <span className="font-medium text-blue-400">
                    {pair.avgRiskReward.toFixed(2)}:1
                  </span>
                </div>
              </div>

              {/* Performance bar */}
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${pair.winRate >= 60 ? 'bg-green-500' : 
                                                 pair.winRate >= 50 ? 'bg-blue-500' : 
                                                 pair.winRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(pair.winRate, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary insights */}
        <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Key Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-400 font-medium">Best Performer:</span>
              <br />
              {analytics[0]?.pair} ({analytics[0]?.winRate.toFixed(1)}% win rate)
            </div>
            <div>
              <span className="text-blue-400 font-medium">Most Traded:</span>
              <br />
              {analytics.sort((a, b) => b.totalTrades - a.totalTrades)[0]?.pair} 
              ({analytics.sort((a, b) => b.totalTrades - a.totalTrades)[0]?.totalTrades} trades)
            </div>
            <div>
              <span className="text-yellow-400 font-medium">Highest R:R:</span>
              <br />
              {analytics.sort((a, b) => b.avgRiskReward - a.avgRiskReward)[0]?.pair} 
              ({analytics.sort((a, b) => b.avgRiskReward - a.avgRiskReward)[0]?.avgRiskReward.toFixed(2)}:1)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};