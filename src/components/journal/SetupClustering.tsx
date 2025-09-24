import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Tag, TrendingUp, Users, Eye } from 'lucide-react';
import { SetupCluster } from '@/services/tradeAnalyticsService';

interface SetupClusteringProps {
  clusters: SetupCluster[];
  onViewTrades?: (trades: any[]) => void;
}

export const SetupClustering: React.FC<SetupClusteringProps> = ({ clusters, onViewTrades }) => {
  const getPerformanceColor = (winRate: number, avgPnL: number) => {
    if (winRate >= 70 && avgPnL > 0) return 'border-green-500/50 bg-green-500/10';
    if (winRate >= 50 && avgPnL > 0) return 'border-blue-500/50 bg-blue-500/10';
    if (winRate >= 40) return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-red-500/50 bg-red-500/10';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-blue-400';
    if (confidence >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatCurrency = (amount: number) => {
    return `${amount >= 0 ? '+' : ''}$${Math.abs(amount).toLocaleString()}`;
  };

  if (clusters.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Setup Clustering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No trade setups found for clustering analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI-Assisted Setup Clustering
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Discover patterns in your trading setups and which ones work best
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clusters.map((cluster, index) => (
            <div
              key={cluster.category}
              className={`p-4 rounded-lg border-2 ${getPerformanceColor(cluster.winRate, cluster.avgPnL)} 
                         hover:scale-105 transition-transform`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <h3 className="font-bold">{cluster.category}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={index < 3 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">{cluster.trades.length}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className={`font-bold ${cluster.winRate >= 60 ? 'text-green-400' : 
                                            cluster.winRate >= 50 ? 'text-blue-400' : 'text-red-400'}`}>
                    {cluster.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Avg P&L</p>
                  <p className={`font-bold ${cluster.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(cluster.avgPnL)}
                  </p>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">AI Confidence</span>
                  <span className={`text-xs font-medium ${getConfidenceColor(cluster.confidence)}`}>
                    {cluster.confidence.toFixed(0)}%
                  </span>
                </div>
                <Progress value={cluster.confidence} className="h-2" />
              </div>

              {/* Keywords */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Key Patterns:</p>
                <div className="flex flex-wrap gap-1">
                  {cluster.keywords.slice(0, 4).map((keyword, kidx) => (
                    <Badge key={kidx} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {cluster.keywords.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{cluster.keywords.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mb-3 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${cluster.winRate >= 60 ? 'bg-green-500' : 
                                                 cluster.winRate >= 50 ? 'bg-blue-500' : 
                                                 cluster.winRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(cluster.winRate, 100)}%` }}
                />
              </div>

              {/* View Trades Button */}
              {onViewTrades && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewTrades(cluster.trades)}
                  className="w-full text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View {cluster.trades.length} Trades
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Summary Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Best Setup
            </h4>
            <p className="text-sm">
              <strong>{clusters[0]?.category}</strong>
              <br />
              {clusters[0]?.winRate.toFixed(1)}% win rate
              <br />
              {formatCurrency(clusters[0]?.avgPnL)} avg P&L
            </p>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Most Frequent
            </h4>
            <p className="text-sm">
              <strong>{clusters.sort((a, b) => b.trades.length - a.trades.length)[0]?.category}</strong>
              <br />
              {clusters.sort((a, b) => b.trades.length - a.trades.length)[0]?.trades.length} trades
              <br />
              {clusters.sort((a, b) => b.trades.length - a.trades.length)[0]?.winRate.toFixed(1)}% win rate
            </p>
          </div>

          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Confidence
            </h4>
            <p className="text-sm">
              <strong>
                {clusters.sort((a, b) => b.confidence - a.confidence)[0]?.category}
              </strong>
              <br />
              {clusters.sort((a, b) => b.confidence - a.confidence)[0]?.confidence.toFixed(0)}% confidence
              <br />
              Well-defined pattern
            </p>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Recommendations
          </h4>
          <ul className="space-y-1 text-sm">
            {clusters[0] && clusters[0].winRate > 70 && (
              <li className="text-green-400">
                ✅ Focus more on <strong>{clusters[0].category}</strong> setups - they're your strongest edge
              </li>
            )}
            {clusters.find(c => c.winRate < 40) && (
              <li className="text-red-400">
                🚨 Consider avoiding <strong>{clusters.find(c => c.winRate < 40)?.category}</strong> setups - low success rate
              </li>
            )}
            {clusters.length > 5 && (
              <li className="text-blue-400">
                💡 You have diverse trading setups - consider specializing in your top 3 performers
              </li>
            )}
            <li className="text-yellow-400">
              📊 Track setup keywords in your notes to improve AI clustering accuracy
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};