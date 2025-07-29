
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, Target, TrendingUp, Zap } from 'lucide-react';

interface SignalStrengthFilterProps {
  selectedStrength: string;
  onChange: (strength: string) => void;
  signalCounts?: {
    all: number;
    weak: number;
    decent: number;
    strong: number;
  };
}

const SignalStrengthFilter: React.FC<SignalStrengthFilterProps> = ({
  selectedStrength,
  onChange,
  signalCounts = { all: 0, weak: 0, decent: 0, strong: 0 }
}) => {
  const strengthOptions = [
    { 
      value: 'all', 
      label: 'All Signals', 
      icon: Filter, 
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      count: signalCounts.all
    },
    { 
      value: 'weak', 
      label: 'Weak Signals', 
      icon: Target, 
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      count: signalCounts.weak
    },
    { 
      value: 'decent', 
      label: 'Decent Signals', 
      icon: TrendingUp, 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      count: signalCounts.decent
    },
    { 
      value: 'strong', 
      label: 'Strong Signals', 
      icon: Zap, 
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      count: signalCounts.strong
    }
  ];

  const currentOption = strengthOptions.find(opt => opt.value === selectedStrength) || strengthOptions[0];

  return (
    <div className="glass-card p-4 border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-400" />
          Signal Strength Filter
        </h3>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          User Control
        </Badge>
      </div>

      <div className="space-y-4">
        <Select value={selectedStrength} onValueChange={onChange}>
          <SelectTrigger className="w-full bg-gray-800/50 border-gray-700/50">
            <SelectValue placeholder="Select signal strength" />
          </SelectTrigger>
          <SelectContent>
            {strengthOptions.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                    <Badge variant="outline" className="ml-2">
                      {option.count}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Current Selection Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Current Filter:</span>
          <Badge className={currentOption.color}>
            <currentOption.icon className="w-3 h-3 mr-1" />
            {currentOption.label}
          </Badge>
        </div>

        {/* Filter Description */}
        <div className="text-xs text-gray-500 bg-gray-800/30 p-3 rounded-lg">
          {selectedStrength === 'all' && "Shows all signals regardless of strength. Use this to see the full market picture."}
          {selectedStrength === 'weak' && "Shows signals with lower confidence (45-64%). Use with caution and smaller position sizes."}
          {selectedStrength === 'decent' && "Shows signals with moderate confidence (65-79%). Good for standard position sizing."}
          {selectedStrength === 'strong' && "Shows signals with high confidence (80%+). Best for larger position sizes."}
        </div>
      </div>
    </div>
  );
};

export default SignalStrengthFilter;
