import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { marketHeatSync, type MarketHeat } from '@/services/marketHeatSync';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Flame,
  Snowflake,
  Crosshair,
  RefreshCw
} from 'lucide-react';

const MarketHeatDisplay: React.FC = () => {
  const [marketHeat, setMarketHeat] = useState<MarketHeat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMarketHeat = async () => {
      setIsLoading(true);
      try {
        const heat = await marketHeatSync.getMarketHeat();
        setMarketHeat(heat);
      } catch (error) {
        console.error('Failed to load market heat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketHeat();
    const interval = setInterval(loadMarketHeat, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getHeatIcon = (heat: string) => {
    switch (heat) {
      case 'blazing': return <Flame className="w-4 h-4 text-red-400" />;
      case 'hot': return <Zap className="w-4 h-4 text-orange-400" />;
      case 'neutral': return <Activity className="w-4 h-4 text-yellow-400" />;
      case 'cold': return <Snowflake className="w-4 h-4 text-blue-400" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getHeatColor = (heat: string) => {
    switch (heat) {
      case 'blazing': return 'bg-red-500/20 border-red-500/30';
      case 'hot': return 'bg-orange-500/20 border-orange-500/30';
      case 'neutral': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'cold': return 'bg-blue-500/20 border-blue-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Market Heat...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!marketHeat) return null;

  return (
    <div className="space-y-4">
      {/* Overall Market Heat */}
      <Card className={`${getHeatColor(marketHeat.overall)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getHeatIcon(marketHeat.overall)}
            Market Heat Sync
            <Badge className="ml-auto">
              {marketHeat.overall.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-300">
            Last updated: {new Date(marketHeat.lastUpdated).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Hot Pairs */}
      <Card className="border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" />
            🔥 Hot Pairs to Watch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {marketHeat.pairs
            .filter(pair => pair.heat === 'blazing' || pair.heat === 'hot')
            .map((pair) => (
              <div key={pair.pair} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{pair.emoji}</span>
                  <div>
                    <div className="font-semibold text-white">{pair.pair}</div>
                    <div className="text-sm text-gray-400">{pair.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={pair.color}>
                    {pair.heat.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-400 mt-1">
                    {pair.score}/100
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Battle Zones */}
      <Card className="border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-purple-400" />
            ⚔️ Battle Zones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {marketHeat.battleZones.map((zone, index) => (
            <div key={index} className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-white">{zone.pair}</div>
                <Badge className="bg-purple-500/20 text-purple-400">
                  {zone.strength}/100
                </Badge>
              </div>
              <div className="text-sm text-gray-300 mb-2">
                Level: {zone.level}
              </div>
              <div className="text-sm text-gray-400">
                {zone.description}
              </div>
              <Progress 
                value={zone.strength} 
                className="mt-2 h-2" 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Institutional Flow */}
      <Card className="border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {marketHeat.institutionalFlow.sentiment === 'bullish' ? 
              <TrendingUp className="w-5 h-5 text-green-400" /> :
              <TrendingDown className="w-5 h-5 text-red-400" />
            }
            💰 Institutional Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge className={
              marketHeat.institutionalFlow.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
              marketHeat.institutionalFlow.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }>
              {marketHeat.institutionalFlow.sentiment.toUpperCase()}
            </Badge>
            <div className="text-sm text-gray-400">
              Strength: {marketHeat.institutionalFlow.strength}/100
            </div>
            <Badge className={marketHeat.institutionalFlow.riskOn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
              {marketHeat.institutionalFlow.riskOn ? 'RISK ON' : 'RISK OFF'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {marketHeat.institutionalFlow.details.map((detail, index) => (
              <div key={index} className="text-sm text-gray-300 p-2 bg-gray-800/30 rounded">
                • {detail}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketHeatDisplay;
