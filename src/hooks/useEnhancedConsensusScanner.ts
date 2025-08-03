
import { useState, useEffect } from 'react';
import { enhancedMultiAIConsensus, ConsensusSignalResult } from '@/services/enhancedMultiAIConsensus';

interface ScannerState {
  isScanning: boolean;
  consensusResult: ConsensusSignalResult | null;
  scanCount: number;
  lastScanTime: string;
}

export const useEnhancedConsensusScanner = () => {
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    consensusResult: null,
    scanCount: 0,
    lastScanTime: ''
  });

  const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD'];
  const basePrices = { EURUSD: 1.0850, GBPUSD: 1.2650, USDJPY: 150.25, USDCAD: 1.3580, AUDUSD: 0.6596 };

  const performScan = async () => {
    try {
      // Random pair for demo
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      const basePrice = basePrices[randomPair as keyof typeof basePrices];
      const livePrice = basePrice + (Math.random() - 0.5) * 0.002; // ±0.2% variation
      
      console.log(`🔍 Enhanced Consensus Scan: ${randomPair} at ${livePrice.toFixed(5)}`);
      
      const result = await enhancedMultiAIConsensus.scanForHighQualitySignals(randomPair, livePrice);
      
      setState(prev => ({
        ...prev,
        consensusResult: result,
        scanCount: prev.scanCount + 1,
        lastScanTime: new Date().toLocaleTimeString()
      }));
      
      // Stop scanning if we get a strong consensus
      if (result.hasConsensus && (result.signalStrength === 'ELITE' || result.signalStrength === 'STRONG')) {
        setState(prev => ({ ...prev, isScanning: false }));
        console.log(`✅ High-conviction signal found: ${result.signalStrength}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Enhanced scan failed:', error);
      return null;
    }
  };

  const startScanning = () => {
    console.log('🚀 Starting enhanced consensus scanner...');
    setState(prev => ({ ...prev, isScanning: true }));
    
    // Initial scan
    performScan();
    
    // Continue scanning every 30s until high-conviction signal found
    const interval = setInterval(async () => {
      if (state.isScanning) {
        await performScan();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  };

  const stopScanning = () => {
    console.log('⏹️ Stopping enhanced consensus scanner');
    setState(prev => ({ ...prev, isScanning: false }));
  };

  const refreshScan = () => {
    performScan();
  };

  useEffect(() => {
    const cleanup = startScanning();
    return cleanup;
  }, []);

  return {
    ...state,
    startScanning,
    stopScanning,
    refreshScan,
    performScan
  };
};
