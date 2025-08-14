import { useState, useCallback, useEffect } from 'react';
import { stateMachineEngine, SignalResult } from '@/services/enhanced/StateMachineSignalEngine';

interface StateMachineState {
  currentSignal: SignalResult | null;
  signalHistory: SignalResult[];
  isScanning: boolean;
  scanCount: number;
  lastScanTime: string | null;
  stats: {
    approved: number;
    rejected: number;
    evidenceScoreAvg: number;
    shadowModePassRate: number;
    priceIntegrityRate: number;
  };
  dailyStats: {
    signalsGenerated: number;
    signalsApproved: number;
    pnl: number;
    consecutiveLosses: number;
  };
}

export function useStateMachineEngine() {
  const [state, setState] = useState<StateMachineState>({
    currentSignal: null,
    signalHistory: [],
    isScanning: false,
    scanCount: 0,
    lastScanTime: null,
    stats: {
      approved: 0,
      rejected: 0,
      evidenceScoreAvg: 0,
      shadowModePassRate: 0,
      priceIntegrityRate: 0
    },
    dailyStats: {
      signalsGenerated: 0,
      signalsApproved: 0,
      pnl: 0,
      consecutiveLosses: 0
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

      const signal = await stateMachineEngine.generateSignal();

      setState(prev => {
        const newHistory = [signal, ...prev.signalHistory].slice(0, 100); // Keep last 100
        
        // Update stats
        const newStats = { ...prev.stats };
        if (signal.status === 'APPROVED') {
          newStats.approved++;
        } else {
          newStats.rejected++;
        }

        // Calculate averages
        const totalSignals = newStats.approved + newStats.rejected;
        const evidenceScores = newHistory.map(s => s.evidenceScore).filter(s => s > 0);
        newStats.evidenceScoreAvg = evidenceScores.length > 0 
          ? evidenceScores.reduce((sum, score) => sum + score, 0) / evidenceScores.length 
          : 0;

        newStats.shadowModePassRate = newHistory.filter(s => s.shadowModeValidated).length / newHistory.length * 100;
        newStats.priceIntegrityRate = newHistory.filter(s => s.priceIntegrityPassed).length / newHistory.length * 100;

        // Get daily stats from engine
        const dailyStats = stateMachineEngine.getDailyStats();

        return {
          ...prev,
          currentSignal: signal,
          signalHistory: newHistory,
          stats: newStats,
          dailyStats
        };
      });

      return signal;
    } catch (error) {
      console.error('Error generating signal:', error);
      const errorSignal: SignalResult = {
        status: 'REJECTED',
        symbol: 'ERROR',
        direction: 'BUY',
        evidenceScore: 0,
        setupState: 'IDLE',
        rejectionReasons: [`Error: ${error.message}`],
        shadowModeValidated: false,
        priceIntegrityPassed: false,
        dailyLossBreaker: false,
        tradabilityScore: 0,
        metadata: {
          session: 'UNKNOWN',
          regime: 'UNKNOWN',
          processingTime: 0,
          scanId: `error_${Date.now()}`,
          spreadPips: 0,
          atrPips: 0,
          entryQuality: 'POOR'
        }
      };
      
      setState(prev => ({
        ...prev,
        currentSignal: errorSignal
      }));
      
      return errorSignal;
    }
  }, []);

  const startAutoScanning = useCallback((intervalSeconds: number = 60) => {
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
        evidenceScoreAvg: 0,
        shadowModePassRate: 0,
        priceIntegrityRate: 0
      }
    }));
  }, []);

  const resetDailyStats = useCallback(() => {
    stateMachineEngine.resetDailyStats();
    setState(prev => ({
      ...prev,
      dailyStats: {
        signalsGenerated: 0,
        signalsApproved: 0,
        pnl: 0,
        consecutiveLosses: 0
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
    return state.signalHistory.filter(signal => signal.status === 'APPROVED');
  }, [state.signalHistory]);

  const getEliteSignals = useCallback(() => {
    return state.signalHistory.filter(signal => 
      signal.status === 'APPROVED' && signal.evidenceScore >= 90
    );
  }, [state.signalHistory]);

  const getProfessionalSignals = useCallback(() => {
    return state.signalHistory.filter(signal => 
      signal.status === 'APPROVED' && signal.evidenceScore >= 80 && signal.evidenceScore < 90
    );
  }, [state.signalHistory]);

  const getSignalsByState = useCallback((setupState: string) => {
    return state.signalHistory.filter(signal => signal.setupState === setupState);
  }, [state.signalHistory]);

  const getSignalsByEntryQuality = useCallback((quality: string) => {
    return state.signalHistory.filter(signal => signal.metadata.entryQuality === quality);
  }, [state.signalHistory]);

  // Computed values
  const totalScans = state.scanCount;
  const successRate = totalScans > 0 ? (state.stats.approved / totalScans) * 100 : 0;
  const avgEvidenceScore = state.stats.evidenceScoreAvg;
  const shadowModePassRate = state.stats.shadowModePassRate;
  const priceIntegrityRate = state.stats.priceIntegrityRate;

  return {
    // State
    currentSignal: state.currentSignal,
    signalHistory: state.signalHistory,
    isScanning: state.isScanning,
    scanCount: state.scanCount,
    lastScanTime: state.lastScanTime,
    stats: state.stats,
    dailyStats: state.dailyStats,
    
    // Actions
    generateSignal,
    startAutoScanning,
    stopScanning,
    clearHistory,
    resetDailyStats,
    
    // Filters
    getApprovedSignals,
    getEliteSignals,
    getProfessionalSignals,
    getSignalsByState,
    getSignalsByEntryQuality,
    
    // Computed
    totalScans,
    successRate,
    avgEvidenceScore,
    shadowModePassRate,
    priceIntegrityRate
  };
}