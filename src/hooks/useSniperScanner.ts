// 🎯 SNIPER SCANNER HOOK - Precision Trading with Zero Garbage Signals

import { useState, useEffect, useRef } from 'react';
import { sniperSignalEngine, SniperScanResult } from '@/services/enhanced/SniperSignalEngine';

export const useSniperScanner = () => {
  const [scanResult, setScanResult] = useState<SniperScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<SniperScanResult[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState({
    eliteSignalRate: 0,
    averageConfluence: 0,
    sessionOptimization: 0
  });
  
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scanHistoryRef = useRef<SniperScanResult[]>([]);

  const startSniperScanning = () => {
    console.log('🎯 Starting SNIPER Scanner - Precision institutional signals only...');
    setIsScanning(true);
    
    // Clear previous scan history
    scanHistoryRef.current = [];
    setScanHistory([]);
    
    // Initial scan
    performSniperScan();
    
    // Set up 20-second intervals (longer for deep analysis)
    scanIntervalRef.current = setInterval(() => {
      performSniperScan();
    }, 20000);
  };

  const stopSniperScanning = () => {
    console.log('⏹️ Stopping SNIPER Scanner');
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const performSniperScan = async () => {
    try {
      console.log('🎯 Executing SNIPER precision scan...');
      const result = await sniperSignalEngine.executeSniperScan();
      
      setScanResult(result);
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date().toLocaleTimeString());
      
      // Update scan history (keep last 20 scans)
      const updatedHistory = [result, ...scanHistoryRef.current].slice(0, 20);
      scanHistoryRef.current = updatedHistory;
      setScanHistory(updatedHistory);
      
      // Update quality metrics
      updateQualityMetrics();
      
      if (result.signal) {
        console.log(`🎯 SNIPER SIGNAL: ${result.signal.symbol} ${result.signal.direction} @ ${result.signal.entry}`);
        console.log(`📊 Confluence: ${result.signal.confluenceScore}% | Grade: ${result.signal.grade} | RR: ${result.signal.riskReward}`);
        console.log(`⚡ Entry: ${result.signal.entryMethod} | Session: ${result.signal.metadata.sessionScore}%`);
      } else {
        console.log(`❌ SNIPER scan rejected: ${result.rejectionReasons.join(' | ')}`);
      }
    } catch (error) {
      console.error('❌ SNIPER scan failed:', error);
    }
  };

  const updateQualityMetrics = () => {
    const history = scanHistoryRef.current;
    if (history.length === 0) return;

    // Calculate elite signal rate (signals with 90+ confluence)
    const eliteSignals = history.filter(h => h.signal && h.signal.confluenceScore >= 90).length;
    const eliteSignalRate = Math.round((eliteSignals / history.length) * 100);

    // Calculate average confluence for successful signals
    const successfulScans = history.filter(h => h.signal);
    const averageConfluence = successfulScans.length > 0
      ? Math.round(successfulScans.reduce((sum, h) => sum + h.signal!.confluenceScore, 0) / successfulScans.length)
      : 0;

    // Calculate session optimization (signals during optimal sessions)
    const optimalSessionSignals = history.filter(h => 
      h.signal && h.signal.metadata.sessionScore >= 80
    ).length;
    const sessionOptimization = Math.round((optimalSessionSignals / history.length) * 100);

    setQualityMetrics({
      eliteSignalRate,
      averageConfluence,
      sessionOptimization
    });
  };

  // Auto-start scanning when component mounts
  useEffect(() => {
    startSniperScanning();
    
    return () => {
      stopSniperScanning();
    };
  }, []);

  // Calculate success rate (signals generated vs rejections)
  const successRate = scanHistory.length > 0 
    ? Math.round((scanHistory.filter(h => h.signal).length / scanHistory.length) * 100)
    : 0;

  return {
    scanResult,
    isScanning,
    scanCount,
    lastScanTime,
    scanHistory,
    qualityMetrics,
    successRate,
    startSniperScanning,
    stopSniperScanning,
    performSniperScan
  };
};
