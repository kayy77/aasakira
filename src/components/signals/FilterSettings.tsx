
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Target, Brain, Activity } from 'lucide-react';

interface FilterSettingsProps {
  minFilters: number;
  onMinFiltersChange: (value: number) => void;
  minConfidence: number;
  onMinConfidenceChange: (value: number) => void;
}

const FilterSettings: React.FC<FilterSettingsProps> = ({
  minFilters,
  onMinFiltersChange,
  minConfidence,
  onMinConfidenceChange
}) => {
  const filterOptions = [
    { value: 3, label: '3/6', description: 'Moderate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 4, label: '4/6', description: 'Strong', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 5, label: '5/6', description: 'Elite', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 6, label: '6/6', description: 'Perfect', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
  ];

  const confidenceOptions = [
    { value: 70, label: '70%+', description: 'Standard', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 75, label: '75%+', description: 'Strong', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 80, label: '80%+', description: 'Elite', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 85, label: '85%+', description: 'Perfect', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
  ];

  return (
    <div className="glass-card p-4 border-blue-500/10 mb-4">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-4 h-4 text-blue-400" />
        <h3 className="text-base font-semibold text-white">Signal Quality Settings</h3>
      </div>
      
      {/* Filter Confluence Setting */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-3 h-3 text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">Minimum Filter Confluence</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              className={`${
                minFilters === option.value 
                  ? option.color 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              } p-2 h-auto flex-col space-y-1`}
              onClick={() => onMinFiltersChange(option.value)}
            >
              <span className="font-bold text-xs">{option.label}</span>
              <span className="text-xs opacity-80">{option.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Confidence Setting */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-3 h-3 text-purple-400" />
          <span className="text-sm text-purple-300 font-medium">Minimum AI Confidence</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {confidenceOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              className={`${
                minConfidence === option.value 
                  ? option.color 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              } p-2 h-auto flex-col space-y-1`}
              onClick={() => onMinConfidenceChange(option.value)}
            >
              <span className="font-bold text-xs">{option.label}</span>
              <span className="text-xs opacity-80">{option.description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="mt-3 p-2 bg-gray-800/30 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Current Settings:</span>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
              {minFilters}/6 filters
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
              {minConfidence}%+ confidence
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSettings;
