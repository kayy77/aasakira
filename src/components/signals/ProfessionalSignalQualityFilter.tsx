import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Building, Shield, Target } from 'lucide-react';

interface ProfessionalSignalCounts {
  all: number;
  ELITE: number;
  PROFESSIONAL: number;
  INSTITUTIONAL: number;
  STANDARD: number;
}

interface ProfessionalSignalQualityFilterProps {
  selectedQuality: 'all' | 'ELITE' | 'PROFESSIONAL' | 'INSTITUTIONAL' | 'STANDARD';
  onChange: (quality: 'all' | 'ELITE' | 'PROFESSIONAL' | 'INSTITUTIONAL' | 'STANDARD') => void;
  signalCounts: ProfessionalSignalCounts;
}

const ProfessionalSignalQualityFilter: React.FC<ProfessionalSignalQualityFilterProps> = ({
  selectedQuality,
  onChange,
  signalCounts
}) => {
  const filterOptions = [
    {
      key: 'all' as const,
      label: 'All Signals',
      count: signalCounts.all,
      icon: Target,
      color: 'text-gray-400 border-gray-500/30 hover:bg-gray-500/10'
    },
    {
      key: 'ELITE' as const,
      label: 'Elite',
      count: signalCounts.ELITE,
      icon: Crown,
      color: 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10'
    },
    {
      key: 'PROFESSIONAL' as const,
      label: 'Professional',
      count: signalCounts.PROFESSIONAL,
      icon: Building,
      color: 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10'
    },
    {
      key: 'INSTITUTIONAL' as const,
      label: 'Institutional',
      count: signalCounts.INSTITUTIONAL,
      icon: Shield,
      color: 'text-green-400 border-green-500/30 hover:bg-green-500/10'
    },
    {
      key: 'STANDARD' as const,
      label: 'Standard',
      count: signalCounts.STANDARD,
      icon: Target,
      color: 'text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10'
    }
  ];

  return (
    <Card className="glass-card border-blue-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Signal Quality Filter</h3>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Professional Grade Classification
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedQuality === option.key;
            
            return (
              <Button
                key={option.key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onChange(option.key)}
                className={`
                  ${isSelected 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500' 
                    : `${option.color} bg-transparent`
                  } 
                  transition-all duration-200
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {option.label}
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs bg-gray-800 text-gray-300"
                >
                  {option.count}
                </Badge>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-3 text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-purple-400" />
              <span>Elite: 90%+ conviction, institutional-grade setups</span>
            </div>
            <div className="flex items-center gap-1">
              <Building className="w-3 h-3 text-blue-400" />
              <span>Professional: 80%+ conviction, professional analysis</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-400" />
              <span>Institutional: 70%+ conviction, institutional standards</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-yellow-400" />
              <span>Standard: 60%+ conviction, basic professional grade</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalSignalQualityFilter;