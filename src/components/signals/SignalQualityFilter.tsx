
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, CheckCircle2, Target, AlertTriangle } from 'lucide-react';

interface SignalQualityFilterProps {
  selectedQuality: 'all' | 'weak' | 'medium' | 'strong';
  onChange: (quality: 'all' | 'weak' | 'medium' | 'strong') => void;
  signalCounts?: {
    all: number;
    weak: number;
    medium: number;
    strong: number;
  };
}

const SignalQualityFilter: React.FC<SignalQualityFilterProps> = ({
  selectedQuality,
  onChange,
  signalCounts = { all: 0, weak: 0, medium: 0, strong: 0 }
}) => {
  const qualityOptions = [
    { 
      value: 'all', 
      label: 'All Signals', 
      icon: Filter, 
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      count: signalCounts.all
    },
    { 
      value: 'strong', 
      label: 'Strong', 
      icon: CheckCircle2, 
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      count: signalCounts.strong
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      icon: Target, 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      count: signalCounts.medium
    },
    { 
      value: 'weak', 
      label: 'Weak', 
      icon: AlertTriangle, 
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      count: signalCounts.weak
    }
  ];

  return (
    <div className="glass-card p-4 border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-400" />
          Signal Quality Filter
        </h3>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          EV-Based
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {qualityOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={selectedQuality === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(option.value as any)}
              className={`flex items-center gap-2 transition-all ${
                selectedQuality === option.value 
                  ? `${option.color} scale-105 shadow-md` 
                  : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{option.label}</span>
              <Badge variant="outline" className="ml-1">
                {option.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Quality Description */}
      <div className="text-xs text-gray-500 bg-gray-800/30 p-3 rounded-lg mt-4">
        {selectedQuality === 'all' && "Shows all signals regardless of quality. Complete market picture with EV scoring."}
        {selectedQuality === 'strong' && "Shows signals with 85%+ confidence and positive expected value. Best for larger positions."}
        {selectedQuality === 'medium' && "Shows signals with 60-84% confidence. Good for standard position sizing."}
        {selectedQuality === 'weak' && "Shows signals with <60% confidence. Use smaller position sizes and tight stops."}
      </div>
    </div>
  );
};

export default SignalQualityFilter;
