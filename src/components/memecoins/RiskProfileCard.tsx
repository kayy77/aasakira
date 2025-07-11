
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { RiskProfile } from '@/services/memeCoinsService';

interface RiskProfileCardProps {
  profile: RiskProfile;
  tokenCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export const RiskProfileCard: React.FC<RiskProfileCardProps> = ({ 
  profile, 
  tokenCount, 
  isSelected, 
  onClick 
}) => {
  const getRiskIcon = () => {
    switch (profile.name) {
      case 'Low Risk': return Shield;
      case 'Medium Risk': return TrendingUp;
      case 'High Risk': return Zap;
      default: return AlertTriangle;
    }
  };

  const getRiskColor = () => {
    switch (profile.name) {
      case 'Low Risk': return 'border-green-500/30 bg-green-500/10 text-green-400';
      case 'Medium Risk': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
      case 'High Risk': return 'border-red-500/30 bg-red-500/10 text-red-400';
      default: return 'border-gray-500/30 bg-gray-500/10 text-gray-400';
    }
  };

  const getSelectedStyle = () => {
    if (!isSelected) return '';
    switch (profile.name) {
      case 'Low Risk': return 'ring-2 ring-green-500/50 bg-green-500/20';
      case 'Medium Risk': return 'ring-2 ring-yellow-500/50 bg-yellow-500/20';
      case 'High Risk': return 'ring-2 ring-red-500/50 bg-red-500/20';
      default: return 'ring-2 ring-gray-500/50 bg-gray-500/20';
    }
  };

  const Icon = getRiskIcon();

  return (
    <div 
      className={`glass-card p-6 cursor-pointer transition-all duration-300 hover-lift border ${getRiskColor()} ${getSelectedStyle()}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getRiskColor()}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{profile.name}</h3>
            <p className="text-sm text-gray-400">{profile.expectedReturn}</p>
          </div>
        </div>
        <Badge className="bg-white/10 text-white border-white/20">
          {tokenCount}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-4">
        {profile.description}
      </p>

      {/* Criteria */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Min Liquidity:</span>
          <span className="text-white">${profile.criteria.liquidity.min.toLocaleString()}</span>
        </div>
        
        {profile.criteria.marketCap.min && (
          <div className="flex justify-between">
            <span className="text-gray-400">Min Market Cap:</span>
            <span className="text-white">${(profile.criteria.marketCap.min / 1e6).toFixed(1)}M</span>
          </div>
        )}
        
        {profile.criteria.marketCap.max && (
          <div className="flex justify-between">
            <span className="text-gray-400">Max Market Cap:</span>
            <span className="text-white">
              {profile.criteria.marketCap.max >= 1e6 
                ? `$${(profile.criteria.marketCap.max / 1e6).toFixed(1)}M`
                : `$${(profile.criteria.marketCap.max / 1e3).toFixed(0)}K`
              }
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-400">Max Age:</span>
          <span className="text-white">{profile.criteria.pairAge.max}h</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Min Txns/day:</span>
          <span className="text-white">{profile.criteria.transactions24h.min.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
