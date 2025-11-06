// Hook for Powerful Multi-Timeframe Signal Engine

import { useState, useCallback, useEffect } from 'react';
import { powerfulSignalEngine } from '@/services/powerfulSignalEngine';

interface PowerfulSignalState {
  currentSignal: any | null;
  signalHistory: any[];
  isScanning: boolean;
  scanCount: number;
  lastScanTime: string | null;
  stats: {
    total: number;
    elite: number;
    institutional: number;
    professional: number;
    standard: number;
    avgConfidence: number;
    avgTFAlignment: number;
  };
}

export function usePowerfulSignals() {
  const [state, setState] = useState<PowerfulSignalState>({
    currentSignal: null,
    signalHistory: [],
    isScanning: false,
    scanCount: 0,
    lastScanTime: null,
    stats: {
      total: 0,
      elite: 0,
      institutional: 0,
      professional: 0,
      standard: 0,
      avgConfidence: 0,
      avgTFAlignment: 0
    }
  });

  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  const generateSignal = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        scanCount: prev.scanCount + 1,
        lastScanTime: new Date().toISOString()
      }));

      const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'XAUUSD', 'NAS100'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      console.log('🚀 Generating powerful signal for', symbol);
      const signal = await powerfulSignalEngine.generatePowerfulSignal(symbol);

      if (signal) {
        setState(prev => {
          const newHistory = [signal, ...prev.signalHistory].slice(0, 50);
          
          // Update stats
          const newStats = { ...prev.stats };
          newStats.total++;
          
          if (signal.institutionalGrade === 'ELITE') newStats.elite++;
          else if (signal.institutionalGrade === 'INSTITUTIONAL') newStats.institutional++;
          else if (signal.institutionalGrade === 'PROFESSIONAL') newStats.professional++;
          else newStats.standard++;
          
          // Recalculate averages
          const allSignals = newHistory;
          newStats.avgConfidence = allSignals.reduce((sum, s) => sum + s.confidence, 0) / allSignals.length;
          newStats.avgTFAlignment = allSignals.reduce((sum, s) => sum + s.timeframeAlignment, 0) / allSignals.length;

          return {
            ...prev,
            currentSignal: signal,
            signalHistory: newHistory,
            stats: newStats
          };
        });
      } else {
        console.log('❌ Signal generation failed or rejected');
      }

      return signal;
    } catch (error) {
      console.error('Error generating powerful signal:', error);
      return null;
    }
  }, []);

  const startAutoScanning = useCallback((intervalSeconds: number = 45) => {
    if (scanInterval) {
      clearInterval(scanInterval);
    }

    setState(prev => ({ ...prev, isScanning: true }));
    
    // Generate initial signal
    generateSignal();
    
    // Set up interval
    const interval = setInterval(() => {
      generateSignal();
    }, intervalSeconds * 1000);
    
    setScanInterval(interval);
  }, [generateSignal, scanInterval]);

  const stopScanning = useCallback(() => {
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
    setState(prev => ({ ...prev, isScanning: false }));
  }, [scanInterval]);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      signalHistory: [],
      scanCount: 0,
      stats: {
        total: 0,
        elite: 0,
        institutional: 0,
        professional: 0,
        standard: 0,
        avgConfidence: 0,
        avgTFAlignment: 0
      }
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanInterval]);

  // Filter functions
  const getEliteSignals = useCallback(() => {
    return state.signalHistory.filter(s => s.institutionalGrade === 'ELITE');
  }, [state.signalHistory]);

  const getInstitutionalSignals = useCallback(() => {
    return state.signalHistory.filter(s => 
      s.institutionalGrade === 'ELITE' || s.institutionalGrade === 'INSTITUTIONAL'
    );
  }, [state.signalHistory]);

  const getProfessionalSignals = useCallback(() => {
    return state.signalHistory.filter(s => 
      ['ELITE', 'INSTITUTIONAL', 'PROFESSIONAL'].includes(s.institutionalGrade)
    );
  }, [state.signalHistory]);

  return {
    // State
    currentSignal: state.currentSignal,
    signalHistory: state.signalHistory,
    isScanning: state.isScanning,
    scanCount: state.scanCount,
    lastScanTime: state.lastScanTime,
    stats: state.stats,
    
    // Actions
    generateSignal,
    startAutoScanning,
    stopScanning,
    clearHistory,
    
    // Filters
    getEliteSignals,
    getInstitutionalSignals,
    getProfessionalSignals
  };
}
