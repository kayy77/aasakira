import { useState, useCallback, useEffect } from 'react';
import { signalEngine, SignalResult, MarketData } from '@/services/signalEngine';

interface SignalEngineState {
  currentSignal: SignalResult | null;
  signalHistory: SignalResult[];
  isScanning: boolean;
  scanCount: number;
  lastScanTime: string | null;
  stats: {
    approved: number;
    rejected: number;
    gradeA: number;
    gradeB: number;
    gradeF: number;
  };
}

export function useSignalEngine() {
  const [state, setState] = useState<SignalEngineState>({
    currentSignal: null,
    signalHistory: [],
    isScanning: false,
    scanCount: 0,
    lastScanTime: null,
    stats: {
      approved: 0,
      rejected: 0,
      gradeA: 0,
      gradeB: 0,
      gradeF: 0
    }
  });

  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  // Generate mock market data with enhanced MACD and realistic price data
  const generateMockMarketData = useCallback((): MarketData => {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'];
    const sessions: ('Asian' | 'London' | 'NewYork')[] = ['Asian', 'London', 'NewYork'];
    
    // Generate realistic price history for MACD calculation
    const basePrice = 1.0800 + (Math.random() * 0.2);
    const candleData = Array.from({ length: 30 }, (_, i) => {
      const volatility = 0.0002 + (Math.random() * 0.0003);
      const change = (Math.random() - 0.5) * volatility;
      return {
        close: basePrice + change * (i + 1),
        volume: 500 + Math.random() * 2000
      };
    });
    
    return {
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      currentPrice: candleData[candleData.length - 1].close,
      timeframe: 'M15',
      rsi: Math.floor(Math.random() * 100),
      volume: Math.floor(Math.random() * 5000) + 500,
      session: sessions[Math.floor(Math.random() * sessions.length)],
      candleData
    };
  }, []);

  const generateSignal = useCallback(async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        scanCount: prev.scanCount + 1,
        lastScanTime: new Date().toISOString()
      }));

      const marketData = generateMockMarketData();
      const signal = await signalEngine.generateSignal(marketData);

      setState(prev => {
        const newHistory = [signal, ...prev.signalHistory].slice(0, 50); // Keep last 50
        
        // Update stats
        const newStats = { ...prev.stats };
        if (signal.status === 'approved') {
          newStats.approved++;
          if (signal.validation?.finalGrade === 'A') newStats.gradeA++;
          else if (signal.validation?.finalGrade === 'B') newStats.gradeB++;
        } else {
          newStats.rejected++;
          if (signal.validation?.finalGrade === 'F') newStats.gradeF++;
        }

        return {
          ...prev,
          currentSignal: signal,
          signalHistory: newHistory,
          stats: newStats
        };
      });

      return signal;
    } catch (error) {
      console.error('Error generating signal:', error);
      const errorSignal: SignalResult = {
        status: 'rejected',
        reason: `Error: ${error.message}`,
        pair: 'ERROR',
        timeframe: 'M15',
        timestamp: new Date().toISOString()
      };
      
      setState(prev => ({
        ...prev,
        currentSignal: errorSignal
      }));
      
      return errorSignal;
    }
  }, [generateMockMarketData]);

  const startAutoScanning = useCallback((intervalSeconds: number = 30) => {
    if (scanInterval) {
      clearInterval(scanInterval);
    }

    setState(prev => ({ ...prev, isScanning: true }));
    
    // Generate initial signal
    generateSignal();
    
    // Set up interval for subsequent signals
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
        approved: 0,
        rejected: 0,
        gradeA: 0,
        gradeB: 0,
        gradeF: 0
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
  const getApprovedSignals = useCallback(() => {
    return state.signalHistory.filter(signal => signal.status === 'approved');
  }, [state.signalHistory]);

  const getSignalsByGrade = useCallback((grades: string[]) => {
    return state.signalHistory.filter(signal => 
      signal.validation?.finalGrade && grades.includes(signal.validation.finalGrade)
    );
  }, [state.signalHistory]);

  const getEliteSignals = useCallback(() => {
    return getSignalsByGrade(['A']);
  }, [getSignalsByGrade]);

  const getProfessionalSignals = useCallback(() => {
    return getSignalsByGrade(['B']);
  }, [getSignalsByGrade]);

  // Computed values
  const totalScans = state.scanCount;
  const successRate = totalScans > 0 ? (state.stats.approved / totalScans) * 100 : 0;
  const averageGrade = state.signalHistory.length > 0 ? 
    state.signalHistory
      .filter(s => s.validation?.finalGrade)
      .map(s => s.validation!.finalGrade === 'A' ? 4 : s.validation!.finalGrade === 'B' ? 3 : 0)
      .reduce((sum, grade) => sum + grade, 0) / state.signalHistory.filter(s => s.validation?.finalGrade).length : 0;

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
    getApprovedSignals,
    getSignalsByGrade,
    getEliteSignals,
    getProfessionalSignals,
    
    // Computed
    totalScans,
    successRate,
    averageGrade
  };
}