
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { type RarityAnalysis } from '@/services/rarityEngine';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RarityBadgeProps {
  analysis: RarityAnalysis;
  showDetails?: boolean;
}

const RarityBadge: React.FC<RarityBadgeProps> = ({ analysis, showDetails = false }) => {
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'mythical':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold shadow-lg shadow-yellow-500/30 animate-pulse';
      case 'epic':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/20';
      case 'common':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const BadgeContent = () => (
    <Badge className={`${getRarityStyle(analysis.rarity)} px-3 py-1`}>
      <span className="mr-1">{analysis.emoji}</span>
      {analysis.rarity.toUpperCase()}
      <span className="ml-2 text-xs">
        {analysis.score}/100
      </span>
    </Badge>
  );

  if (!showDetails) {
    return <BadgeContent />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <BadgeContent />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4">
          <div className="space-y-2">
            <div className="font-semibold text-sm">
              {analysis.description}
            </div>
            <div className="text-xs space-y-1">
              <div className="font-medium">Key Factors:</div>
              {analysis.factors.map((factor, index) => (
                <div key={index} className="text-gray-300">
                  • {factor}
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RarityBadge;
