// 🚨 ULTRA SIGNAL SCANNER HOOK - Zero Bias, Multi-Scan Consensus

import { useState, useEffect, useRef } from 'react';
import { ultraSignalEngine, UltraSignalResult } from '@/services/enhanced/UltraSignalEngine';

export const useUltraSignalScanner = () => {
  const [signalResult, setSignalResult] = useState<UltraSignalResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<UltraSignalResult[]>([]);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startUltraScanning = () => {
    console.log('🚀 Starting Ultra Signal Scanner with zero-bias protection...');
    setIsScanning(true);
    
    // Initial scan
    performUltraScan();
    
    // Set up 30-second intervals for ultra analysis (longer than basic due to complexity)
    scanIntervalRef.current = setInterval(() => {
      performUltraScan();
    }, 30000);
  };

  const stopUltraScanning = () => {
    console.log('⏹️ Stopping Ultra Signal Scanner');
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const performUltraScan = async () => {
    try {
      console.log('🧠 Performing Ultra Multi-Scan Analysis...');
      const result = await ultraSignalEngine.generateUltraSignal();
      
      setSignalResult(result);
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date().toLocaleTimeString());
      
      // Keep scan history (last 10 scans)
      setScanHistory(prev => {
        const updated = [result, ...prev].slice(0, 10);
        return updated;
      });
      
      if (result.finalSignal) {
        console.log(`✅ ULTRA SIGNAL: ${result.finalSignal.symbol} ${result.finalSignal.direction} @ ${result.finalSignal.entry}`);
        console.log(`📊 Consensus: ${result.consensusAnalysis.agreementCount}/${result.consensusAnalysis.totalScans} | Risk: ${result.finalSignal.riskProfile}`);
      } else {
        console.log(`❌ Ultra scan rejected: ${result.rejectionReasons.join(' | ')}`);
      }
    } catch (error) {
      console.error('❌ Ultra scan failed:', error);
    }
  };

  // Auto-start scanning when component mounts
  useEffect(() => {
    startUltraScanning();
    
    return () => {
      stopUltraScanning();
    };
  }, []);

  // Calculate success rate from scan history
  const successRate = scanHistory.length > 0 
    ? Math.round((scanHistory.filter(h => h.finalSignal).length / scanHistory.length) * 100)
    : 0;

  return {
    signalResult,
    isScanning,
    scanCount,
    lastScanTime,
    scanHistory,
    successRate,
    startUltraScanning,
    stopUltraScanning,
    performUltraScan
  };
};
