import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { RiskRewardAnalysis } from '@/services/tradeAnalyticsService';

interface RiskRewardConsistencyProps {
  analysis: RiskRewardAnalysis;
}

export const RiskRewardConsistency: React.FC<RiskRewardConsistencyProps> = ({ analysis }) => {
  const getConsistencyColor = (consistency: number) => {
    if (consistency >= 70) return 'text-green-400';
    if (consistency >= 50) return 'text-blue-400';
    if (consistency >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConsistencyBadge = (consistency: number) => {
    if (consistency >= 70) return { variant: 'default', label: 'Excellent' };
    if (consistency >= 50) return { variant: 'secondary', label: 'Good' };
    if (consistency >= 30) return { variant: 'secondary', label: 'Fair' };
    return { variant: 'destructive', label: 'Needs Work' };
  };

  const formatRatio = (ratio: number) => {
    return `${ratio.toFixed(2)}:1`;
  };

  const totalTrades = analysis.earlyExits + analysis.lateExits + analysis.perfectExits;

  if (totalTrades === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Risk/Reward Consistency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No risk/reward data available for analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const consistencyBadge = getConsistencyBadge(analysis.consistency);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Risk/Reward Consistency Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyze if you're cutting winners too early or holding losers too long
        </p>
      </CardHeader>
      <CardContent>
        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Planned R:R</h3>
            <p className="text-2xl font-bold text-blue-400">{formatRatio(analysis.plannedRR)}</p>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Realized R:R</h3>
            <p className="text-2xl font-bold text-green-400">{formatRatio(analysis.realizedRR)}</p>
          </div>

          <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Consistency</h3>
            <div className="flex items-center justify-center gap-2">
              <p className={`text-2xl font-bold ${getConsistencyColor(analysis.consistency)}`}>
                {analysis.consistency.toFixed(1)}%
              </p>
              <Badge variant={consistencyBadge.variant as any}>
                {consistencyBadge.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Exit Analysis */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Exit Timing Analysis
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Early Exits</span>
                <span className="text-sm font-medium text-red-400">
                  {analysis.earlyExits} ({((analysis.earlyExits / totalTrades) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(analysis.earlyExits / totalTrades) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Exited before reaching target R:R
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Perfect Exits</span>
                <span className="text-sm font-medium text-green-400">
                  {analysis.perfectExits} ({((analysis.perfectExits / totalTrades) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(analysis.perfectExits / totalTrades) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Exited within target R:R range
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Late Exits</span>
                <span className="text-sm font-medium text-blue-400">
                  {analysis.lateExits} ({((analysis.lateExits / totalTrades) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={(analysis.lateExits / totalTrades) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Let winners run beyond target
              </p>
            </div>
          </div>
        </div>

        {/* Performance vs Plan Comparison */}
        <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
          <h4 className="font-semibold mb-3">Performance vs Plan</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Planned R:R Achievement</span>
                <span className="text-sm font-medium">
                  {((analysis.realizedRR / analysis.plannedRR) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min((analysis.realizedRR / analysis.plannedRR) * 100, 100)} 
                className="h-3"
              />
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            {analysis.realizedRR > analysis.plannedRR ? (
              <p className="text-green-400">
                ✅ <strong>Excellent:</strong> You're achieving better R:R than planned. 
                Your exit strategy is working well.
              </p>
            ) : analysis.realizedRR > analysis.plannedRR * 0.8 ? (
              <p className="text-blue-400">
                ℹ️ <strong>Good:</strong> You're close to your planned R:R. 
                Minor tweaks to exit timing could improve results.
              </p>
            ) : analysis.realizedRR > analysis.plannedRR * 0.6 ? (
              <p className="text-yellow-400">
                ⚠️ <strong>Warning:</strong> You're significantly underachieving your R:R targets. 
                Review your exit strategy and consider trailing stops.
              </p>
            ) : (
              <p className="text-red-400">
                🚨 <strong>Critical:</strong> Major gap between planned and realized R:R. 
                Focus on discipline and proper exit execution.
              </p>
            )}
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-400">💡 Actionable Insights</h4>
          <ul className="space-y-1 text-sm">
            {analysis.earlyExits > analysis.perfectExits && (
              <li>• Consider using trailing stops to let winners run longer</li>
            )}
            {analysis.consistency < 50 && (
              <li>• Work on exit discipline - stick to your planned R:R targets</li>
            )}
            {analysis.realizedRR < analysis.plannedRR * 0.8 && (
              <li>• Review your TP levels - they might be too aggressive</li>
            )}
            {analysis.lateExits > totalTrades * 0.3 && (
              <li>• You're good at letting winners run - maintain this strength</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};