
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Shield, Activity } from "lucide-react";

interface EnhancedSignalFilterProps {
  onFilterChange: (filter: string) => void;
  signalStats?: {
    totalSignals: number;
    strongCount: number;
    mediumCount: number;
    weakCount: number;
  };
}

export default function EnhancedSignalFilter({ 
  onFilterChange, 
  signalStats = { totalSignals: 0, strongCount: 0, mediumCount: 0, weakCount: 0 }
}: EnhancedSignalFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState("strong");

  useEffect(() => {
    onFilterChange(selectedFilter);
  }, [selectedFilter, onFilterChange]);

  const filters = [
    { 
      label: "Elite", 
      value: "strong",
      description: "A+ Grade | 85%+ AI Confidence",
      icon: Shield,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      count: signalStats.strongCount
    },
    { 
      label: "Professional", 
      value: "medium",
      description: "A/B Grade | 70%+ AI Confidence", 
      icon: Target,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      count: signalStats.mediumCount
    },
    { 
      label: "Standard", 
      value: "weak",
      description: "C Grade | 60%+ AI Confidence",
      icon: Activity,
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      count: signalStats.weakCount
    }
  ];

  return (
    <div className="glass-card p-4 border-blue-500/10">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">AI Signal Quality Filter</h3>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
          {signalStats.totalSignals} Total
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isSelected = selectedFilter === filter.value;
          
          return (
            <Button
              key={filter.value}
              variant="ghost"
              onClick={() => setSelectedFilter(filter.value)}
              className={`${
                isSelected 
                  ? filter.color 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border-gray-700/50'
              } h-auto p-4 flex-col space-y-2 border transition-all duration-200 ${
                isSelected ? 'scale-105 shadow-lg' : 'hover:scale-102'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="font-semibold text-sm">{filter.label}</span>
                {filter.count > 0 && (
                  <Badge className="bg-white/10 text-white text-xs">
                    {filter.count}
                  </Badge>
                )}
              </div>
              <p className="text-xs opacity-80 text-center leading-tight">
                {filter.description}
              </p>
            </Button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-900/30 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Current Filter:</span>
          <div className="flex items-center space-x-1">
            <span className="text-white font-medium">
              {filters.find(f => f.value === selectedFilter)?.label}
            </span>
            <span className="text-gray-500">Grade Signals</span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        <p>
          🧠 Powered by Multi-AI Consensus Engine | 
          🏛️ Institutional-Grade Analysis | 
          ⚡ Real-Time Signal Validation
        </p>
      </div>
    </div>
  );
}
