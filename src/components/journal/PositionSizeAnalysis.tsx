import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { PositionSizeAnalytics } from '@/services/tradeAnalyticsService';

interface PositionSizeAnalysisProps {
  analytics: PositionSizeAnalytics[];
}

export const PositionSizeAnalysis: React.FC<PositionSizeAnalysisProps> = ({ analytics }) => {
  const getRiskColor = (riskScore: string) => {
    switch (riskScore) {
      case 'Low': return 'text-green-400 border-green-400';
      case 'Medium': return 'text-yellow-400 border-yellow-400';
      case 'High': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRiskIcon = (riskScore: string) => {
    switch (riskScore) {
      case 'Low': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'High': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Scale className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount >= 0 ? '+' : ''}$${Math.abs(amount).toLocaleString()}`;
  };

  // Generate insights
  const generateInsights = () => {
    if (analytics.length === 0) return [];
    
    const insights = [];
    
    // Check for position size vs performance correlation
    const largePositions = analytics.filter(a => a.sizeRange.includes('Large') || a.sizeRange.includes('Very Large'));
    const smallPositions = analytics.filter(a => a.sizeRange.includes('Micro') || a.sizeRange.includes('Small'));
    
    if (largePositions.length > 0 && smallPositions.length > 0) {
      const avgLargeWinRate = largePositions.reduce((sum, p) => sum + p.winRate, 0) / largePositions.length;
      const avgSmallWinRate = smallPositions.reduce((sum, p) => sum + p.winRate, 0) / smallPositions.length;
      
      if (avgLargeWinRate < avgSmallWinRate - 10) {
        insights.push({
          type: 'warning',
          message: 'Large positions are underperforming smaller ones. Consider reducing position sizes.'
        });
      } else if (avgLargeWinRate > avgSmallWinRate + 10) {
        insights.push({
          type: 'success',
          message: 'You perform better with larger positions. Your confidence is well-calibrated.'
        });
      }
    }
    
    // Check for high-risk positions
    const highRiskPositions = analytics.filter(a => a.riskScore === 'High');
    if (highRiskPositions.length > 0) {
      insights.push({
        type: 'error',
        message: `${highRiskPositions.length} position size range(s) showing high risk. Review your sizing strategy.`
      });
    }
    
    return insights;
  };

  const insights = generateInsights();

  if (analytics.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Position Size Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No position size data available for analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Position Size vs Outcome Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Discover if larger positions are impacting your performance
        </p>
      </CardHeader>
      <CardContent>
        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2 mb-6">
            {insights.map((insight, index) => (
              <Alert key={index} className={`border-2 ${
                insight.type === 'error' ? 'border-red-500/50 bg-red-500/10' :
                insight.type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' :
                'border-green-500/50 bg-green-500/10'
              }`}>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  {insight.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.map((item, index) => (
            <div
              key={item.sizeRange}
              className={`p-4 rounded-lg border-2 ${getRiskColor(item.riskScore)} 
                         hover:scale-105 transition-transform cursor-pointer bg-zinc-800/50`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getRiskIcon(item.riskScore)}
                  <h3 className="font-bold text-sm">{item.sizeRange}</h3>
                </div>
                <Badge variant={item.riskScore === 'Low' ? 'default' : 
                               item.riskScore === 'Medium' ? 'secondary' : 'destructive'}>
                  {item.riskScore}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Win Rate</span>
                  <span className={`font-medium text-sm ${item.winRate >= 60 ? 'text-green-400' : 
                                                          item.winRate >= 50 ? 'text-blue-400' : 'text-red-400'}`}>
                    {item.winRate.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Avg P&L</span>
                  <span className={`font-medium text-sm ${item.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(item.avgPnL)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Total Trades</span>
                  <span className="font-medium text-sm">{item.totalTrades}</span>
                </div>
              </div>

              {/* Performance bar */}
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${item.winRate >= 60 ? 'bg-green-500' : 
                                                 item.winRate >= 50 ? 'bg-blue-500' : 
                                                 item.winRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(item.winRate, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Position Sizing Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-400 font-medium">Best Performing Size:</span>
              <br />
              {analytics.sort((a, b) => b.avgPnL - a.avgPnL)[0]?.sizeRange}
              ({analytics.sort((a, b) => b.avgPnL - a.avgPnL)[0]?.avgPnL.toFixed(0)} avg P&L)
            </div>
            <div>
              <span className="text-blue-400 font-medium">Most Consistent:</span>
              <br />
              {analytics.sort((a, b) => b.winRate - a.winRate)[0]?.sizeRange}
              ({analytics.sort((a, b) => b.winRate - a.winRate)[0]?.winRate.toFixed(1)}% win rate)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};