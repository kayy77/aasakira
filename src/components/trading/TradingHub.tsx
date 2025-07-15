
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Clock, 
  Target,
  BarChart3,
  Unlock,
  RefreshCw,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TradingIdea {
  id: string;
  pair: string;
  timeframe: string;
  bias: 'BUY' | 'SELL' | 'NEUTRAL';
  description: string;
  reasoning: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  canConvert: boolean;
  generatedAt: string;
  keyLevels: {
    entry?: number;
    stopLoss?: number;
    takeProfit?: number;
  };
}

const TradingHub = () => {
  const [ideas, setIdeas] = useState<TradingIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useIsMobile();

  // Generate realistic trading ideas
  const generateTradingIdeas = (): TradingIdea[] => {
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'GBP/JPY'];
    const timeframes = ['1H', '4H', '1D'];
    const biases = ['BUY', 'SELL', 'NEUTRAL'] as const;
    const risks = ['LOW', 'MEDIUM', 'HIGH'] as const;
    
    const scenarios = [
      {
        description: "Strong bullish momentum with clean break of key resistance",
        reasoning: "Price action shows institutional buying interest with volume confirmation at previous resistance turned support."
      },
      {
        description: "Bearish rejection at major supply zone with divergence signals",
        reasoning: "RSI showing bearish divergence while price makes higher highs. Perfect setup for short entry."
      },
      {
        description: "Range-bound price action approaching key decision point",
        reasoning: "Market consolidating between major S/R levels. Breakout direction will determine next major move."
      },
      {
        description: "Liquidity sweep setup with smart money footprint visible",
        reasoning: "Recent sweep of retail stops below support suggests institutional accumulation. Watch for reversal."
      },
      {
        description: "Multiple timeframe confluence at critical support level",
        reasoning: "Weekly, daily, and 4H charts all showing bullish signals converging at this key support zone."
      }
    ];

    return Array.from({ length: 6 }, (_, i) => {
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
      const bias = biases[Math.floor(Math.random() * biases.length)];
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      const risk = risks[Math.floor(Math.random() * risks.length)];
      
      return {
        id: `idea-${i + 1}`,
        pair,
        timeframe,
        bias,
        description: scenario.description,
        reasoning: scenario.reasoning,
        riskLevel: risk,
        confidence: Math.floor(Math.random() * 30) + 70,
        canConvert: Math.random() > 0.3,
        generatedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        keyLevels: {
          entry: parseFloat((Math.random() * 2 + 1).toFixed(4)),
          stopLoss: parseFloat((Math.random() * 2 + 0.8).toFixed(4)),
          takeProfit: parseFloat((Math.random() * 2 + 1.2).toFixed(4))
        }
      };
    });
  };

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIdeas(generateTradingIdeas());
      setLoading(false);
    };

    fetchIdeas();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIdeas(generateTradingIdeas());
    setRefreshing(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'BUY': return 'text-green-400 bg-green-900/20';
      case 'SELL': return 'text-red-400 bg-red-900/20';
      default: return 'text-yellow-400 bg-yellow-900/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400 bg-green-900/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-red-400 bg-red-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold gradient-text`}>
            💹 AI Trading Hub
          </h1>
        </div>
        <p className={`text-gray-300 max-w-3xl mx-auto ${isMobile ? 'text-sm px-4' : 'text-lg'}`}>
          Live trade ideas generated by our tactical AI system. These aren't signals — they're smart setups you can act on or watch evolve.
        </p>
        
        {/* Action Buttons */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 justify-center ${isMobile ? 'px-4' : ''}`}>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Ideas
          </Button>
          <Button variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
            <Eye className="w-4 h-4 mr-2" />
            Watch List
          </Button>
        </div>
      </div>

      {/* Trading Ideas Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing market conditions...</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
          {ideas.map((idea) => (
            <Card key={idea.id} className="glass-card border-purple-500/20 hover:border-purple-500/40 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    {idea.bias === 'BUY' && <TrendingUp className="w-5 h-5 mr-2 text-green-400" />}
                    {idea.bias === 'SELL' && <TrendingDown className="w-5 h-5 mr-2 text-red-400" />}
                    {idea.bias === 'NEUTRAL' && <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />}
                    {idea.pair}
                  </CardTitle>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getBiasColor(idea.bias)}>
                      {idea.bias}
                    </Badge>
                    <span className="text-xs text-gray-400">{idea.timeframe}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-lg font-bold text-purple-400">{idea.confidence}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400">Risk</div>
                    <Badge className={`${getRiskColor(idea.riskLevel)} text-xs`}>
                      {idea.riskLevel}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-white mb-2">Setup</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{idea.description}</p>
                </div>

                {/* AI Reasoning */}
                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-blue-400 font-semibold text-sm mb-1">AI Analysis</h5>
                      <p className="text-blue-100 text-xs leading-relaxed">{idea.reasoning}</p>
                    </div>
                  </div>
                </div>

                {/* Key Levels */}
                {idea.keyLevels.entry && (
                  <div className="space-y-2">
                    <h5 className="text-white font-semibold text-sm">Key Levels</h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-1 bg-blue-900/20 rounded">
                        <div className="text-blue-400">Entry</div>
                        <div className="text-white font-mono">{idea.keyLevels.entry}</div>
                      </div>
                      <div className="text-center p-1 bg-red-900/20 rounded">
                        <div className="text-red-400">Stop</div>
                        <div className="text-white font-mono">{idea.keyLevels.stopLoss}</div>
                      </div>
                      <div className="text-center p-1 bg-green-900/20 rounded">
                        <div className="text-green-400">Target</div>
                        <div className="text-white font-mono">{idea.keyLevels.takeProfit}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(idea.generatedAt)}
                  </div>
                  <div className="text-xs text-purple-400">🧠 Aasakira AI</div>
                </div>

                {/* Convert to Signal */}
                {idea.canConvert && (
                  <Button 
                    variant="outline" 
                    className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Convert to Signal
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Risk Disclaimer */}
      <Card className="glass-card border-orange-500/20 bg-orange-900/10">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-400 mb-1">Risk Disclaimer</h4>
              <p className="text-orange-100 text-sm">
                These are AI-generated trade ideas for educational purposes. Always conduct your own analysis and manage risk appropriately. 
                Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingHub;
