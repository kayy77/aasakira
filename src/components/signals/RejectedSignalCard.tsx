
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';

interface RejectedSignalProps {
  pair: string;
  reason: string;
  criticalIssues: string[];
  recommendations: string[];
  expectedValue: number;
  confluenceScore: number;
  maxConfluence: number;
  onRetry: () => void;
}

export const RejectedSignalCard: React.FC<RejectedSignalProps> = ({
  pair,
  reason,
  criticalIssues,
  recommendations,
  expectedValue,
  confluenceScore,
  maxConfluence,
  onRetry
}) => {
  return (
    <Card className="border-red-500/30 bg-red-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {pair} - Signal Rejected
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            FAILED
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Reason */}
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-300 font-medium mb-2">Rejection Reason:</p>
          <p className="text-xs text-red-200">{reason}</p>
        </div>

        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-300">Critical Issues:</p>
            <ul className="space-y-1">
              {criticalIssues.map((issue, index) => (
                <li key={index} className="text-xs text-red-200 flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Signal Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">Expected Value</p>
            <p className="text-sm font-semibold text-orange-400">+{expectedValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Confluence</p>
            <p className="text-sm font-semibold text-red-400">{confluenceScore}/{maxConfluence}</p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-yellow-300">Recommendations:</p>
            <ul className="space-y-1">
              {recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-xs text-yellow-200 flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 mt-0.5 text-yellow-400 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Retry Button */}
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-analyze in 30s
        </Button>
      </CardContent>
    </Card>
  );
};
