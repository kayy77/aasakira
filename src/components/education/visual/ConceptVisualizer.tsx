
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3,
  Eye,
  Zap
} from 'lucide-react';

interface ConceptVisualizerProps {
  concept: string;
  explanation: string;
}

const ConceptVisualizer = ({ concept, explanation }: ConceptVisualizerProps) => {
  const getConceptData = (conceptName: string) => {
    const concepts = {
      'market structure': {
        image: '/images/concepts/market-structure.png',
        fallbackContent: (
          <div className="relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-green-400/50 rounded animate-pulse"></div>
              <div className="h-2 bg-red-400/50 rounded animate-pulse delay-100"></div>
              <div className="h-2 bg-green-400/50 rounded animate-pulse delay-200"></div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Market Structure: Higher Highs & Higher Lows</p>
          </div>
        ),
        rules: ['Identify swing highs and lows', 'Look for break of structure', 'Confirm with volume']
      },
      'order block': {
        image: '/images/concepts/order-block.png',
        fallbackContent: (
          <div className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-lg border border-purple-500/30">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-8 rounded ${
                    i === 4 ? 'bg-purple-500 shadow-lg shadow-purple-500/50' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Order Block: Institutional Supply/Demand Zone</p>
          </div>
        ),
        rules: ['Last opposite candle before strong move', 'Institutional orderflow', 'High probability reversal zone']
      },
      'fair value gap': {
        image: '/images/concepts/fvg.png',
        fallbackContent: (
          <div className="relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-6 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-4 h-16 bg-green-400 rounded"></div>
              <div className="w-8 h-2 bg-yellow-400 rounded animate-pulse"></div>
              <div className="w-4 h-16 bg-red-400 rounded"></div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Fair Value Gap: Price Imbalance</p>
          </div>
        ),
        rules: ['Three candle pattern', 'Gap between candles', 'Price returns to fill gap']
      },
      'liquidity': {
        image: '/images/concepts/liquidity.png',
        fallbackContent: (
          <div className="relative bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 rounded-lg border border-cyan-500/30">
            <div className="relative">
              <div className="w-full h-12 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded"></div>
              <Target className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400" />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Liquidity: Resting Orders Target</p>
          </div>
        ),
        rules: ['Above/below swing points', 'Stop loss hunting', 'Smart money targets']
      }
    };

    return concepts[conceptName.toLowerCase()] || null;
  };

  const conceptData = getConceptData(concept);

  if (!conceptData) return null;

  return (
    <Card className="glass-card border-purple-500/20 bg-black/40 mt-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-purple-400" />
          <Badge className="bg-purple-500/20 text-purple-400">
            Visual Learning
          </Badge>
          <span className="text-sm font-medium text-white capitalize">{concept}</span>
        </div>
        
        {conceptData.fallbackContent}
        
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
            <Zap className="w-3 h-3" />
            Key Rules:
          </h4>
          <ul className="space-y-1">
            {conceptData.rules.map((rule, index) => (
              <li key={index} className="text-xs text-gray-300 flex items-center gap-2">
                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConceptVisualizer;
