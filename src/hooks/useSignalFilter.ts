
import { useState, useEffect, useMemo } from 'react';

interface SignalFilterStats {
  totalSignals: number;
  strongCount: number;
  mediumCount: number;
  weakCount: number;
}

interface FilteredSignal {
  id: string;
  strength: 'STRONG' | 'MEDIUM' | 'WEAK' | 'ULTRA' | 'STANDARD' | 'DECENT';
  confidence: number;
  [key: string]: any;
}

export const useSignalFilter = (signals: FilteredSignal[]) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("strong");

  // Calculate signal statistics
  const signalStats: SignalFilterStats = useMemo(() => {
    const stats = {
      totalSignals: signals.length,
      strongCount: 0,
      mediumCount: 0,
      weakCount: 0
    };

    signals.forEach(signal => {
      const confidence = signal.confidence || 0;
      const strength = signal.strength;

      // Map signal strength to filter categories
      if (strength === 'ULTRA' || strength === 'STRONG' || confidence >= 85) {
        stats.strongCount++;
      } else if (strength === 'DECENT' || strength === 'MEDIUM' || confidence >= 70) {
        stats.mediumCount++;
      } else {
        stats.weakCount++;
      }
    });

    return stats;
  }, [signals]);

  // Filter signals based on selected filter
  const filteredSignals = useMemo(() => {
    return signals.filter(signal => {
      const confidence = signal.confidence || 0;
      const strength = signal.strength;

      switch (selectedFilter) {
        case 'strong':
          return strength === 'ULTRA' || strength === 'STRONG' || confidence >= 85;
        case 'medium':
          return strength === 'DECENT' || strength === 'MEDIUM' || 
                 (confidence >= 70 && confidence < 85);
        case 'weak':
          return strength === 'STANDARD' || strength === 'WEAK' || confidence < 70;
        default:
          return true;
      }
    });
  }, [signals, selectedFilter]);

  const handleFilterChange = (filter: string) => {
    console.log(`🎯 Signal Filter Changed: ${filter.toUpperCase()}`);
    setSelectedFilter(filter);
  };

  return {
    selectedFilter,
    filteredSignals,
    signalStats,
    handleFilterChange
  };
};
