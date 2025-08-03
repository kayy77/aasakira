
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Target, Brain, TrendingUp } from 'lucide-react';
import EliteSignalScanner from './EliteSignalScanner';

const filters = [
  { label: "All", value: "all" },
  { label: "Strong", value: "strong" },
  { label: "Medium", value: "medium" },
  { label: "Weak", value: "weak" },
];

export default function EnhancedSignalFilter({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  const [selectedFilter, setSelectedFilter] = useState<string>("strong");

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Elite Signal Scanner */}
      <EliteSignalScanner />

      {/* Original Filter Controls */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-4">
          <div className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Signal Filter
          </div>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedFilter === filter.value ? "default" : "outline"}
                onClick={() => handleFilterChange(filter.value)}
                className="capitalize px-4 py-2 rounded-2xl"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
