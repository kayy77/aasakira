
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Target, Brain, TrendingUp, Crosshair } from 'lucide-react';
import EliteSignalScanner from './EliteSignalScanner';

const filters = [
  { 
    label: "Sniper", 
    value: "strong", 
    description: "ICT Elite Grade A+/A - Perfect setups only",
    icon: Crosshair,
    color: "bg-red-500/20 text-red-400 border-red-500/30"
  },
  { 
    label: "Professional", 
    value: "medium", 
    description: "SMC Pro Grade B - High-quality structure",
    icon: Target,
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30"
  },
  { 
    label: "Standard", 
    value: "weak", 
    description: "Basic SMC Grade C - Minimum criteria",
    icon: TrendingUp,
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  },
];

export default function EnhancedSignalFilter({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  const [selectedFilter, setSelectedFilter] = useState<string>("strong");

  const handleFilterChange = (filter: string) => {
    console.log(`🎯 ICT Filter Changed: ${filter.toUpperCase()} - Enhanced validation active`);
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Elite Signal Scanner */}
      <EliteSignalScanner />

      {/* ICT/SMC Signal Filter */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-4">
          <div className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            ICT/SMC Signal Filter
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
              SNIPER MODE
            </span>
          </div>
          
          <div className="flex gap-3 mb-4">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? "default" : "outline"}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    selectedFilter === filter.value 
                      ? `${filter.color} scale-105 shadow-lg` 
                      : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
          
          {/* Filter Description */}
          <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <div className="font-medium text-gray-300 mb-1">Current Filter:</div>
            {filters.find(f => f.value === selectedFilter)?.description}
          </div>
          
          {/* ICT Requirements Display */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="text-blue-400 font-medium">Structure Requirements</div>
              <div className="text-gray-300 mt-1">
                ✅ 15M BOS/CHoCH<br/>
                ✅ Fresh FVG/OTE Zone<br/>
                ✅ Liquidity Sweep
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="text-green-400 font-medium">Entry Validation</div>
              <div className="text-gray-300 mt-1">
                ✅ 1M/5M Confirmation<br/>
                ✅ RSI Divergence<br/>
                ✅ Volume Spike
              </div>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="text-purple-400 font-medium">Risk Management</div>
              <div className="text-gray-300 mt-1">
                ✅ SL {'<'} 10 pips<br/>
                ✅ R:R ≥ 2.5:1<br/>
                ✅ Session Timing
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
