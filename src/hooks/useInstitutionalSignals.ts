
import { useState, useEffect, useCallback } from 'react';
import { institutionalSignalEngine, InstitutionalSignal } from '@/services/institutionalSignalEngine';

interface InstitutionalSignalsState {
  currentSignal: InstitutionalSignal | null;
  signalHistory: InstitutionalSignal[];
  isScanning: boolean;
  scanCount: number;
  lastScanTime: string;
  scanningStats: {
    eliteCount: number;
    institutionalCount: number;
    professionalCount: number;
    rejectedCount: number;
  };
}

export const useInstitutionalSignals = () => {
  const [state, setState] = useState<InstitutionalSignalsState>({
    currentSignal: null,
    signalHistory: [],
    isScanning: false,
    scanCount: 0,
    lastScanTime: '',
    scanningStats: {
      eliteCount: 0,
      institutionalCount: 0,
      professionalCount: 0,
      rejectedCount: 0
    }
  });

  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  const generateSignal = useCallback(async () => {
    try {
      console.log('🔍 Generating institutional-grade signal...');
      
      const signal = await institutionalSignalEngine.generateInstitutionalSignal();
      
      setState(prev => {
        const newStats = { ...prev.scanningStats };
        
        if (signal) {
          // Update stats based on signal grade
          switch (signal.institutionalGrade) {
            case 'A+':
            case 'A':
              newStats.eliteCount++;
              break;
            case 'B+':
            case 'B':
              newStats.institutionalCount++;
              break;
            case 'C':
              newStats.professionalCount++;
              break;
            default:
              break;
          }
          
          return {
            ...prev,
            currentSignal: signal,
            signalHistory: [signal, ...prev.signalHistory].slice(0, 20), // Keep last 20
            scanCount: prev.scanCount + 1,
            lastScanTime: new Date().toLocaleTimeString(),
            scanningStats: newStats
          };
        } else {
          // Signal was rejected
          newStats.rejectedCount++;
          
          return {
            ...prev,
            scanCount: prev.scanCount + 1,
            lastScanTime: new Date().toLocaleTimeString(),
            scanningStats: newStats
          };
        }
      });
      
      if (signal) {
        console.log(`✅ Institutional signal generated: ${signal.institutionalGrade} grade`);
      } else {
        console.log('❌ Signal rejected by institutional validation');
      }
      
      return signal;
    } catch (error) {
      console.error('❌ Signal generation failed:', error);
      
      setState(prev => ({
        ...prev,
        scanCount: prev.scanCount + 1,
        lastScanTime: new Date().toLocaleTimeString()
      }));
      
      return null;
    }
  }, []);

  const startAutoScanning = useCallback((intervalSeconds: number = 60) => {
    console.log(`🚀 Starting institutional signal auto-scan (${intervalSeconds}s interval)`);
    
    setState(prev => ({ ...prev, isScanning: true }));
    
    // Clear any existing interval
    if (scanInterval) {
      clearInterval(scanInterval);
    }
    
    // Initial scan
    generateSignal();
    
    // Set up recurring scans
    const interval = setInterval(() => {
      generateSignal();
    }, intervalSeconds * 1000);
    
    setScanInterval(interval);
  }, [generateSignal, scanInterval]);

  const stopScanning = useCallback(() => {
    console.log('⏹️ Stopping institutional signal scanning');
    
    setState(prev => ({ ...prev, isScanning: false }));
    
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
  }, [scanInterval]);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      signalHistory: [],
      scanningStats: {
        eliteCount: 0,
        institutionalCount: 0,
        professionalCount: 0,
        rejectedCount: 0
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

  // Filter signals by grade
  const getSignalsByGrade = useCallback((grades: string[]) => {
    return state.signalHistory.filter(signal => 
      grades.includes(signal.institutionalGrade)
    );
  }, [state.signalHistory]);

  // Get elite signals only (A+, A grades)
  const getEliteSignals = useCallback(() => {
    return getSignalsByGrade(['A+', 'A']);
  }, [getSignalsByGrade]);

  // Get institutional signals (B+, B grades)
  const getInstitutionalSignals = useCallback(() => {
    return getSignalsByGrade(['B+', 'B']);
  }, [getSignalsByGrade]);

  return {
    ...state,
    generateSignal,
    startAutoScanning,
    stopScanning,
    clearHistory,
    getSignalsByGrade,
    getEliteSignals,
    getInstitutionalSignals,
    
    // Computed values
    totalScans: state.scanCount,
    successRate: state.scanCount > 0 ? 
      ((state.signalHistory.length / state.scanCount) * 100).toFixed(1) : '0',
    averageGrade: state.signalHistory.length > 0 ?
      state.signalHistory.reduce((sum, signal) => {
        const gradePoints = {
          'A+': 4.3, 'A': 4.0, 'B+': 3.3, 'B': 3.0, 
          'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0
        };
        return sum + (gradePoints[signal.institutionalGrade] || 0);
      }, 0) / state.signalHistory.length : 0
  };
};
