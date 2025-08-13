
import { useState, useEffect, useRef } from 'react';
import { ultraSignalEngine, UltraSignalResult } from '@/services/enhanced/UltraSignalEngine';

// Updated to use Ultra Signal Engine with zero-bias protection
export const useEnhancedSignalScanner = () => {
  const [signalResult, setSignalResult] = useState<UltraSignalResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [qualityMetrics, setQualityMetrics] = useState({
    successRate: 0,
    averageConfidence: 0,
    consensusStrength: 0
  });
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scanHistoryRef = useRef<UltraSignalResult[]>([]);

  const startScanning = () => {
    console.log('🚀 Starting Ultra Enhanced Signal Scanner (Zero-Bias Mode)...');
    setIsScanning(true);
    
    // Clear any previous scan history to prevent bias
    scanHistoryRef.current = [];
    
    // Initial scan
    performScan();
    
    // Set up 15-second intervals (more frequent for ultra analysis)
    scanIntervalRef.current = setInterval(() => {
      performScan();
    }, 15000);
  };

  const stopScanning = () => {
    console.log('⏹️ Stopping Ultra Signal Scanner');
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const performScan = async () => {
    try {
      console.log('🧠 Performing Ultra Multi-Scan Analysis with memory reset...');
      
      // Generate ultra-validated signal with complete independence
      const result = await ultraSignalEngine.generateUltraSignal();
      
      setSignalResult(result);
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date().toLocaleTimeString());
      
      // Update scan history (keep last 20 for metrics)
      scanHistoryRef.current = [result, ...scanHistoryRef.current].slice(0, 20);
      
      // Update quality metrics
      updateQualityMetrics();
      
      if (result.finalSignal) {
        console.log(`✅ ULTRA SIGNAL: ${result.finalSignal.symbol} ${result.finalSignal.direction}`);
        console.log(`📊 Quality: ${result.finalSignal.riskProfile} | Consensus: ${result.consensusAnalysis.agreementCount}/${result.consensusAnalysis.totalScans}`);
        console.log(`🎯 RR: ${result.finalSignal.riskReward} | Confidence: ${result.finalSignal.confidence}%`);
      } else {
        console.log(`❌ Ultra scan rejected: ${result.rejectionReasons.slice(0, 2).join(' | ')}`);
      }
    } catch (error) {
      console.error('❌ Ultra scan failed:', error);
    }
  };

  const updateQualityMetrics = () => {
    const history = scanHistoryRef.current;
    if (history.length === 0) return;

    const successfulScans = history.filter(h => h.finalSignal);
    const successRate = Math.round((successfulScans.length / history.length) * 100);
    
    const averageConfidence = successfulScans.length > 0
      ? Math.round(successfulScans.reduce((sum, h) => sum + (h.finalSignal?.confidence || 0), 0) / successfulScans.length)
      : 0;
    
    const consensusStrength = successfulScans.length > 0
      ? Math.round(successfulScans.reduce((sum, h) => sum + (h.finalSignal?.consensusScore || 0), 0) / successfulScans.length * 100)
      : 0;

    setQualityMetrics({
      successRate,
      averageConfidence,
      consensusStrength
    });
  };

  // Auto-start scanning when component mounts
  useEffect(() => {
    startScanning();
    
    return () => {
      stopScanning();
    };
  }, []);

  return {
    signalResult,
    isScanning,
    scanCount,
    lastScanTime,
    qualityMetrics,
    startScanning,
    stopScanning,
    performScan,
    // Legacy compatibility
    consensusResult: signalResult
  };
};
