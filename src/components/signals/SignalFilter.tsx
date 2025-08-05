
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp } from 'lucide-react';

interface SignalFilterProps {
  selectedStrength: string;
  onChange: (strength: string) => void;
  onFilterChange?: (filter: string) => void;
}

export default function SignalFilter({ selectedStrength, onChange, onFilterChange }: SignalFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState(selectedStrength || "strong");

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedFilter);
    }
    onChange(selectedFilter);
  }, [selectedFilter, onFilterChange, onChange]);

  const filters = [
    { label: "Strong", value: "strong", description: "Elite Grade A+/A signals only", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { label: "Decent", value: "medium", description: "Professional Grade B signals", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { label: "Weak", value: "weak", description: "Standard Grade C signals", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xl font-bold text-white mb-2">
        <Target className="w-5 h-5 text-blue-400" />
        Elite Signal Filter
      </div>
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            onClick={() => setSelectedFilter(filter.value)}
            className={`capitalize px-4 py-2 rounded-lg transition-all ${
              selectedFilter === filter.value 
                ? `${filter.color} scale-105 shadow-md` 
                : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-gray-600/50'
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      {selectedFilter && (
        <div className="text-sm text-gray-400">
          {filters.find(f => f.value === selectedFilter)?.description}
        </div>
      )}
    </div>
  );
}
