
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Shield, Zap } from 'lucide-react';

interface EnhancedSignalMetricsProps {
  confidence: number;
  risk: string;
  strategy: string;
  riskReward?: number;
  timeframe?: string;
  confluence?: number;
  className?: string;
}

const EnhancedSignalMetrics: React.FC<EnhancedSignalMetricsProps> = ({
  confidence,
  risk,
  strategy,
  riskReward = 2.5,
  timeframe = "4H",
  confluence = 5,
  className = ""
}) => {
  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (confidence >= 65) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const getRiskColor = () => {
    if (risk === 'Low') return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (risk === 'Medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getConfluenceRating = () => {
    if (confluence >= 6) return { text: 'Institutional', color: 'text-gold-400 bg-gold-500/20 border-gold-500/30' };
    if (confluence >= 5) return { text: 'Strong', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
    if (confluence >= 4) return { text: 'Moderate', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
    return { text: 'Weak', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
  };

  const confluenceRating = getConfluenceRating();

  return (
    <Card className={`glass-card border-purple-500/30 ${className}`}>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Confidence Score */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-xs text-gray-400">Confidence</span>
            </div>
            <Badge className={`${getConfidenceColor()} font-bold text-lg px-3 py-1 border-2`}>
              {confidence}%
            </Badge>
          </div>

          {/* Risk Level */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-xs text-gray-400">Risk</span>
            </div>
            <Badge className={`${getRiskColor()} font-semibold px-3 py-1 border-2`}>
              {risk}
            </Badge>
          </div>

          {/* Risk:Reward */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-xs text-gray-400">R:R</span>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold px-3 py-1 border-2">
              1:{riskReward.toFixed(1)}
            </Badge>
          </div>

          {/* Confluence */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-xs text-gray-400">Confluence</span>
            </div>
            <Badge className={`${confluenceRating.color} font-bold px-3 py-1 border-2`}>
              {confluence}/6
            </Badge>
          </div>
        </div>

        {/* Strategy & Timeframe */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
            {strategy.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="border-gray-500/30 text-gray-300">
            {timeframe}
          </Badge>
        </div>

        {/* Confluence Rating Description */}
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-400">Quality: </span>
          <span className={`text-xs font-semibold ${confluenceRating.color.split(' ')[0]}`}>
            {confluenceRating.text} Setup
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSignalMetrics;
