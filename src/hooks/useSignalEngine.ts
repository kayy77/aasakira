import { useState, useCallback, useEffect } from 'react';
import { stateMachineEngine } from '@/services/stateMachineEngine';
import { BaseSignal, safeMarketContext } from '@/types/signalTypes';

interface SignalEngineState {
  currentSignal: BaseSignal | null;
  signalHistory: BaseSignal[];
  isScanning: boolean;
  scanCount: number;
  lastScanTime: string | null;
  rejectionHistory: Array<{ reason: string; gate: string; timestamp: number }>;
  stats: {
    approved: number;
    rejected: number;
    elite: number;
    professional: number;
    standard: number;
  };
}

export function useSignalEngine() {
  const [state, setState] = useState<SignalEngineState>({
    currentSignal: null,
    signalHistory: [],
    isScanning: false,
    scanCount: 0,
    lastScanTime: null,
    rejectionHistory: [],
    stats: {
      approved: 0,
      rejected: 0,
      elite: 0,
      professional: 0,
      standard: 0
    }
  });

  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  // Generate enhanced mock market data for state machine engine
  const generateMockMarketData = useCallback(() => {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'];
    const sessions = ['ASIAN', 'LONDON', 'NEWYORK', 'SYDNEY'];
    
    const basePrice = 1.0800 + (Math.random() * 0.2);
    const spread = 0.0001 + (Math.random() * 0.0003);
    const atr = 0.0010 + (Math.random() * 0.0020);
    
    // Simulate ICT/SMC setup progression
    const setupProgression = Math.random();
    let setupState = 'IDLE';
    let hasLiquiditySweep = false;
    let hasDisplacement = false;
    let taggedPOI = false;
    let ltfBOSConfirm = false;
    let inEntryZone = false;
    
    if (setupProgression > 0.8) {
      setupState = 'READY';
      hasLiquiditySweep = true;
      hasDisplacement = true;
      taggedPOI = true;
      ltfBOSConfirm = true;
      inEntryZone = true;
    } else if (setupProgression > 0.6) {
      setupState = 'CONFIRM';
      hasLiquiditySweep = true;
      hasDisplacement = true;
      taggedPOI = true;
      ltfBOSConfirm = true;
    } else if (setupProgression > 0.4) {
      setupState = 'RETRACE';
      hasLiquiditySweep = true;
      hasDisplacement = true;
      taggedPOI = true;
    } else if (setupProgression > 0.2) {
      setupState = 'DISPLACE';
      hasLiquiditySweep = true;
      hasDisplacement = true;
    } else if (setupProgression > 0.1) {
      setupState = 'SWEEP';
      hasLiquiditySweep = true;
    }

    return {
      symbol: pairs[Math.floor(Math.random() * pairs.length)],
      currentPrice: basePrice,
      spread,
      atr,
      session: sessions[Math.floor(Math.random() * sessions.length)],
      primary: {
        bid: basePrice - spread/2,
        ask: basePrice + spread/2,
        ts: Date.now(),
        source: 'primary'
      },
      secondary: {
        bid: basePrice - spread/2 + (Math.random() - 0.5) * 0.00005,
        ask: basePrice + spread/2 + (Math.random() - 0.5) * 0.00005,
        ts: Date.now() - Math.random() * 500,
        source: 'secondary'
      },
      setupState,
      hasLiquiditySweep,
      hasDisplacement,
      taggedPOI,
      ltfBOSConfirm,
      inEntryZone,
      poiQuality: Math.floor(Math.random() * 21),
      ltfConfirmScore: Math.floor(Math.random() * 21),
      liquidityMapAlign: Math.floor(Math.random() * 16),
      regimeFit: Math.floor(Math.random() * 11),
      priceIntegrityOK: Math.random() > 0.1 // 90% chance of good price integrity
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
      const signal = await stateMachineEngine.generateRobustSignal(marketData);

      setState(prev => {
        if (signal) {
          // Signal approved
          const newHistory = [signal, ...prev.signalHistory].slice(0, 50);
          const newStats = { ...prev.stats };
          newStats.approved++;
          
          if (signal.quality === 'ELITE') newStats.elite++;
          else if (signal.quality === 'PROFESSIONAL') newStats.professional++;
          else if (signal.quality === 'STANDARD') newStats.standard++;

          return {
            ...prev,
            currentSignal: signal,
            signalHistory: newHistory,
            stats: newStats
          };
        } else {
          // Signal rejected - log but don't add to history
          const rejection = {
            reason: 'Setup not ready or validation failed',
            gate: 'SYSTEM',
            timestamp: Date.now()
          };
          
          const newRejectionHistory = [rejection, ...prev.rejectionHistory].slice(0, 100);
          const newStats = { ...prev.stats };
          newStats.rejected++;

          return {
            ...prev,
            rejectionHistory: newRejectionHistory,
            stats: newStats
          };
        }
      });

      return signal;
    } catch (error) {
      console.error('Error generating robust signal:', error);
      
      setState(prev => {
        const rejection = {
          reason: `TIMEOUT or ERROR: ${error.message}`,
          gate: 'SYSTEM_ERROR',
          timestamp: Date.now()
        };
        
        return {
          ...prev,
          rejectionHistory: [rejection, ...prev.rejectionHistory].slice(0, 100),
          stats: { ...prev.stats, rejected: prev.stats.rejected + 1 }
        };
      });
      
      return null;
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
      rejectionHistory: [],
      scanCount: 0,
      stats: {
        approved: 0,
        rejected: 0,
        elite: 0,
        professional: 0,
        standard: 0
      }
    }));
    stateMachineEngine.resetDailyStats();
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
    return state.signalHistory; // All signals in history are approved
  }, [state.signalHistory]);

  const getSignalsByQuality = useCallback((qualities: string[]) => {
    return state.signalHistory.filter(signal => 
      qualities.includes(signal.quality)
    );
  }, [state.signalHistory]);

  const getEliteSignals = useCallback(() => {
    return getSignalsByQuality(['ELITE']);
  }, [getSignalsByQuality]);

  const getProfessionalSignals = useCallback(() => {
    return getSignalsByQuality(['PROFESSIONAL', 'ELITE']);
  }, [getSignalsByQuality]);

  // Computed values
  const totalScans = state.scanCount;
  const successRate = totalScans > 0 ? (state.stats.approved / totalScans) * 100 : 0;
  const averageEvidence = state.signalHistory.length > 0 ? 
    state.signalHistory.reduce((sum, signal) => sum + signal.evidenceScore, 0) / state.signalHistory.length : 0;

  return {
    // State
    currentSignal: state.currentSignal,
    signalHistory: state.signalHistory,
    isScanning: state.isScanning,
    scanCount: state.scanCount,
    lastScanTime: state.lastScanTime,
    stats: state.stats,
    rejectionHistory: state.rejectionHistory,
    
    // Actions
    generateSignal,
    startAutoScanning,
    stopScanning,
    clearHistory,
    
    // Filters
    getApprovedSignals,
    getSignalsByQuality,
    getEliteSignals,
    getProfessionalSignals,
    
    // Computed
    totalScans,
    successRate,
    averageEvidence
  };
}