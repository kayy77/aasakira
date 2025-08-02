
import { useState, useEffect, useRef } from 'react';
import { enhancedMultiAIConsensus, ConsensusSignalResult } from '@/services/enhancedMultiAIConsensus';

export const useEnhancedSignalScanner = () => {
  const [consensusResult, setConsensusResult] = useState<ConsensusSignalResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScanning = () => {
    console.log('🔄 Starting enhanced AI consensus scanning...');
    setIsScanning(true);
    
    // Initial scan
    performScan();
    
    // Set up 10-second interval
    scanIntervalRef.current = setInterval(() => {
      performScan();
    }, 10000);
  };

  const stopScanning = () => {
    console.log('⏹️ Stopping AI consensus scanning');
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const performScan = async () => {
    try {
      console.log('🧠 Performing AI consensus scan...');
      const result = await enhancedMultiAIConsensus.scanForHighQualitySignals();
      
      setConsensusResult(result);
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date().toLocaleTimeString());
      
      if (result.hasConsensus) {
        console.log(`✅ High-quality signal found: ${result.signalStrength} (${result.consensusCount}/5 AIs)`);
      } else {
        console.log(`❌ No consensus: ${result.consensusCount}/5 AIs agreed - continuing to scan...`);
      }
    } catch (error) {
      console.error('❌ Scan failed:', error);
    }
  };

  // Auto-start scanning when component mounts
  useEffect(() => {
    startScanning();
    
    return () => {
      stopScanning();
    };
  }, []);

  return {
    consensusResult,
    isScanning,
    scanCount,
    lastScanTime,
    startScanning,
    stopScanning,
    performScan
  };
};
