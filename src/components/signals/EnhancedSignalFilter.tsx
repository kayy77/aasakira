import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

const filters = [
  { label: "All", value: "all" },
  { label: "Strong", value: "strong" },
  { label: "Medium", value: "medium" },
  { label: "Weak", value: "weak" },
];

import { useEnhancedSignalScanner } from '@/hooks/useEnhancedSignalScanner';
import EnhancedConsensusDisplay from './EnhancedConsensusDisplay';

export default function EnhancedSignalFilter({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  const [selectedFilter, setSelectedFilter] = useState<string>("strong");

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  // Add enhanced signal scanner
  const {
    consensusResult,
    isScanning,
    scanCount,
    lastScanTime,
    performScan
  } = useEnhancedSignalScanner();

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Enhanced AI Consensus Display */}
      <EnhancedConsensusDisplay
        consensusResult={consensusResult}
        isScanning={isScanning}
        scanCount={scanCount}
        lastScanTime={lastScanTime}
        onRefresh={performScan}
      />

      {/* Original Filter Controls */}
      <div className="text-xl font-bold text-white">Signal Filter</div>
      <div className="flex gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            onClick={() => setSelectedFilter(filter.value)}
            className="capitalize px-4 py-2 rounded-2xl"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Quality Status Indicator */}
      {consensusResult && (
        <div className="bg-gray-800/30 rounded-lg p-3 text-sm">
          <div className="text-gray-400 mb-1">Signal Quality Status:</div>
          <div className="text-white">
            {consensusResult.hasConsensus 
              ? `✅ ${consensusResult.signalStrength} quality signal with ${consensusResult.consensusCount}/5 AI agreement`
              : `⏳ Scanning for high-quality signals... (${consensusResult.consensusCount}/5 AIs in agreement)`
            }
          </div>
        </div>
      )}
    </div>
  );
}
