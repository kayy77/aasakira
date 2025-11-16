// Hook for Ultra Signal Engine (XAUUSD & US30 only)

import { useState, useCallback, useEffect } from 'react';
import { ultraSignalEngine } from '@/services/ultraSignalEngine';

export function useUltraSignals() {
  const [currentSignal, setCurrentSignal] = useState<any | null>(null);
  const [signalHistory, setSignalHistory] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    legendary: 0,
    elite: 0,
    institutional: 0,
    xauusd: 0,
    us30: 0,
    avgConfidence: 0,
    avgRR: 0
  });

  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  const scanMarkets = useCallback(async () => {
    try {
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date().toISOString());

      console.log('🎯 ULTRA SCAN: Searching for XAUUSD/US30 setups...');
      const signal = await ultraSignalEngine.scanForUltraSetup();

      if (signal) {
        setCurrentSignal(signal);
        setSignalHistory(prev => {
          const newHistory = [signal, ...prev].slice(0, 30);
          
          // Update stats
          const newStats = {
            total: newHistory.length,
            legendary: newHistory.filter(s => s.grade === 'LEGENDARY').length,
            elite: newHistory.filter(s => s.grade === 'ELITE').length,
            institutional: newHistory.filter(s => s.grade === 'INSTITUTIONAL').length,
            xauusd: newHistory.filter(s => s.symbol === 'XAUUSD').length,
            us30: newHistory.filter(s => s.symbol === 'US30').length,
            avgConfidence: newHistory.reduce((sum, s) => sum + s.confidence, 0) / newHistory.length,
            avgRR: newHistory.reduce((sum, s) => sum + s.riskReward, 0) / newHistory.length
          };
          
          setStats(newStats);
          return newHistory;
        });

        console.log(`✅ ULTRA SIGNAL FOUND:`, {
          symbol: signal.symbol,
          grade: signal.grade,
          confidence: signal.confidence,
          direction: signal.direction
        });
      } else {
        console.log('⏳ No ultra setups found, continuing scan...');
      }

      return signal;
    } catch (error) {
      console.error('Error scanning markets:', error);
      return null;
    }
  }, []);

  const startAutoScanning = useCallback((intervalSeconds: number = 30) => {
    if (scanInterval) {
      clearInterval(scanInterval);
    }

    setIsScanning(true);
    
    // Immediate scan
    scanMarkets();
    
    // Set up interval - scan every 30s for gold/nasdaq
    const interval = setInterval(() => {
      scanMarkets();
    }, intervalSeconds * 1000);
    
    setScanInterval(interval);
    console.log(`🚀 Auto-scanning started: every ${intervalSeconds}s for XAUUSD/US30`);
  }, [scanMarkets, scanInterval]);

  const stopScanning = useCallback(() => {
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
    setIsScanning(false);
    console.log('⏸️ Auto-scanning stopped');
  }, [scanInterval]);

  const clearHistory = useCallback(() => {
    setSignalHistory([]);
    setScanCount(0);
    setStats({
      total: 0,
      legendary: 0,
      elite: 0,
      institutional: 0,
      xauusd: 0,
      us30: 0,
      avgConfidence: 0,
      avgRR: 0
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanInterval]);

  return {
    currentSignal,
    signalHistory,
    isScanning,
    scanCount,
    lastScanTime,
    stats,
    scanMarkets,
    startAutoScanning,
    stopScanning,
    clearHistory
  };
}
