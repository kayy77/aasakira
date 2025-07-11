
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Clock, 
  Users,
  BarChart3,
  Droplets,
  Target
} from 'lucide-react';
import { TokenMetrics } from '@/services/memeCoinsService';

interface TokenCardProps {
  token: TokenMetrics;
  riskLevel: string;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, riskLevel }) => {
  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  const formatPrice = (price: number) => {
    if (price < 0.000001) return price.toExponential(3);
    if (price < 0.01) return price.toFixed(8);
    return price.toFixed(6);
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low Risk': return 'border-green-500/30 bg-green-500/5';
      case 'Medium Risk': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'High Risk': return 'border-red-500/30 bg-red-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const getPriceChangeColor = () => {
    return token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getPriceChangeIcon = () => {
    return token.priceChange24h >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className={`glass-card p-6 hover-lift border ${getRiskColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{token.symbol}</h3>
          <p className="text-sm text-gray-400 truncate">{token.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {token.dexId.toUpperCase()}
          </Badge>
          <Button size="sm" variant="ghost" asChild>
            <a href={token.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>

      {/* Price & Change */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-white mb-1">
          ${formatPrice(token.price)}
        </div>
        <div className={`flex items-center text-sm font-semibold ${getPriceChangeColor()}`}>
          {React.createElement(getPriceChangeIcon(), { className: "w-4 h-4 mr-1" })}
          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-3 h-3 text-purple-400" />
          <div>
            <div className="text-gray-400">Market Cap</div>
            <div className="text-white font-semibold">{formatNumber(token.marketCap)}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Droplets className="w-3 h-3 text-blue-400" />
          <div>
            <div className="text-gray-400">Liquidity</div>
            <div className="text-white font-semibold">{formatNumber(token.liquidity)}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-3 h-3 text-green-400" />
          <div>
            <div className="text-gray-400">24h Volume</div>
            <div className="text-white font-semibold">{formatNumber(token.volume24h)}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Activity className="w-3 h-3 text-yellow-400" />
          <div>
            <div className="text-gray-400">24h Txns</div>
            <div className="text-white font-semibold">{token.transactions24h.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between mb-4 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{token.pairAge.toFixed(1)}h old</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{token.holders.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="sm"
      >
        <Target className="w-4 h-4 mr-2" />
        Track Token
      </Button>
    </div>
  );
};
