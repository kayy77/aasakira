
import { useState, useEffect, useRef } from 'react';
import { coreSignalEngine, EliteSignalResult, MultiAIConsensus } from '@/services/coreSignalEngine';

interface ScannerState {
  isScanning: boolean;
  latestSignal: EliteSignalResult | null;
  aiConsensus: MultiAIConsensus | null;
  scanCount: number;
  lastScanTime: string;
  signalHistory: Array<{
    signal: EliteSignalResult;
    consensus: MultiAIConsensus;
    timestamp: string;
  }>;
}

export const useAutoSignalScanner = () => {
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    latestSignal: null,
    aiConsensus: null,
    scanCount: 0,
    lastScanTime: '',
    signalHistory: []
  });
  
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pairs = ['USDCAD', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
  
  const startAutoScan = () => {
    console.log('🔄 Starting auto-scan for elite signals...');
    setState(prev => ({ ...prev, isScanning: true }));
    
    // Initial scan
    performScan();
    
    // Set up interval scanning every 30 seconds
    scanIntervalRef.current = setInterval(() => {
      performScan();
    }, 30000);
  };
  
  const stopAutoScan = () => {
    console.log('⏹️ Stopping auto-scan');
    setState(prev => ({ ...prev, isScanning: false }));
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };
  
  const performScan = async () => {
    try {
      // Random pair selection for each scan
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      console.log(`🎯 Scanning ${randomPair} for elite signals...`);
      
      // Generate signal
      const signal = await coreSignalEngine.generateEliteSignal(randomPair);
      
      setState(prev => ({
        ...prev,
        scanCount: prev.scanCount + 1,
        lastScanTime: new Date().toLocaleTimeString()
      }));
      
      // Check if signal meets quality threshold
      if (signal.confidenceGrade === 'A+' || signal.confidenceGrade === 'A') {
        console.log(`✅ Elite signal found: ${signal.pair} ${signal.confidenceGrade} grade`);
        
        // Get AI consensus
        const consensus = await coreSignalEngine.getMultiAIConsensus(signal);
        
        // Update state with new signal
        setState(prev => ({
          ...prev,
          latestSignal: signal,
          aiConsensus: consensus,
          signalHistory: [{
            signal,
            consensus,
            timestamp: new Date().toISOString()
          }, ...prev.signalHistory.slice(0, 9)] // Keep last 10 signals
        }));
        
        // Stop scanning after finding elite signal
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
          setState(prev => ({ ...prev, isScanning: false }));
        }
        
      } else {
        console.log(`⏳ Signal quality: ${signal.confidenceGrade} - continuing scan...`);
        
        // Archive lower-grade signals for learning
        setState(prev => ({
          ...prev,
          signalHistory: [{
            signal,
            consensus: null, // Don't run AI consensus for lower grades
            timestamp: new Date().toISOString()
          }, ...prev.signalHistory.slice(0, 19)] // Keep more history for learning
        }));
      }
      
    } catch (error) {
      console.error('❌ Scan failed:', error);
    }
  };
  
  const manualScan = async (pair?: string) => {
    const targetPair = pair || pairs[Math.floor(Math.random() * pairs.length)];
    console.log(`🔍 Manual scan requested for ${targetPair}`);
    
    try {
      const signal = await coreSignalEngine.generateEliteSignal(targetPair);
      const consensus = await coreSignalEngine.getMultiAIConsensus(signal);
      
      setState(prev => ({
        ...prev,
        latestSignal: signal,
        aiConsensus: consensus,
        scanCount: prev.scanCount + 1,
        lastScanTime: new Date().toLocaleTimeString(),
        signalHistory: [{
          signal,
          consensus,
          timestamp: new Date().toISOString()
        }, ...prev.signalHistory.slice(0, 9)]
      }));
      
      return { signal, consensus };
    } catch (error) {
      console.error('❌ Manual scan failed:', error);
      return null;
    }
  };
  
  // Auto-start scanning on mount
  useEffect(() => {
    startAutoScan();
    
    return () => {
      stopAutoScan();
    };
  }, []);
  
  return {
    ...state,
    startAutoScan,
    stopAutoScan,
    performScan,
    manualScan
  };
};
