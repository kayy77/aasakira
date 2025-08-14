import { useState, useCallback, useEffect } from 'react';
import { enhancedSignalEngine, EnhancedSignalResult, MarketData } from '@/services/enhancedSignalEngine';

interface SignalEngineState {
  currentSignal: EnhancedSignalResult | null;
  signalHistory: EnhancedSignalResult[];
  isScanning: boolean;
  scanCount: number;
  lastScanTime: string | null;
  stats: {
    approved: number;
    rejected: number;
    elite: number;
    normal: number;
    caution: number;
  };
}

export function useSignalEngine() {
  const [state, setState] = useState<SignalEngineState>({
    currentSignal: null,
    signalHistory: [],
    isScanning: false,
    scanCount: 0,
    lastScanTime: null,
    stats: {
      approved: 0,
      rejected: 0,
      elite: 0,
      normal: 0,
      caution: 0
    }
  });

  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  // Generate enhanced market data with more accurate pricing
  const generateMockMarketData = useCallback((): MarketData => {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'];
    const sessions: ('Asian' | 'London' | 'NewYork')[] = ['Asian', 'London', 'NewYork'];
    
    // More realistic base prices
    const basePrices: Record<string, number> = {
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650, 
      'USDJPY': 148.50,
      'AUDUSD': 0.6750,
      'USDCAD': 1.3650,
      'NZDUSD': 0.6150
    };
    
    const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];
    const basePrice = basePrices[selectedPair] || 1.0000;
    
    // Generate more realistic price movements with proper volatility
    const dailyVolatility = selectedPair.includes('JPY') ? 0.3 : 0.0015;
    const currentSession = sessions[Math.floor(Math.random() * sessions.length)];
    
    // Session-based volatility adjustment
    const sessionMultiplier = currentSession === 'London' ? 1.2 : 
                             currentSession === 'NewYork' ? 1.1 : 0.8;
    
    const adjustedVolatility = dailyVolatility * sessionMultiplier;
    const priceChange = (Math.random() - 0.5) * adjustedVolatility;
    const currentPrice = basePrice + priceChange;
    
    // Generate realistic price history
    const candleData = Array.from({ length: 50 }, (_, i) => {
      const candleVolatility = adjustedVolatility * (0.8 + Math.random() * 0.4);
      const change = (Math.random() - 0.5) * candleVolatility;
      return {
        close: basePrice + change * (i / 25), // Gradual trend
        volume: 800 + Math.random() * 3000,
        high: basePrice + change * (i / 25) + Math.abs(change) * 0.3,
        low: basePrice + change * (i / 25) - Math.abs(change) * 0.3
      };
    });
    
    return {
      pair: selectedPair,
      currentPrice,
      timeframe: 'M15',
      rsi: 30 + Math.random() * 40, // More realistic RSI range
      volume: Math.floor(Math.random() * 4000) + 1000,
      session: currentSession,
      candleData,
      atr: adjustedVolatility,
      spread: selectedPair.includes('JPY') ? 0.02 : 0.00015
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
      const signal = await enhancedSignalEngine.generateSignal(marketData);

      setState(prev => {
        const newHistory = [signal, ...prev.signalHistory].slice(0, 50); // Keep last 50
        
        // Update stats
        const newStats = { ...prev.stats };
        if (signal.status === 'approved') {
          newStats.approved++;
          if (signal.signalType === 'ELITE') newStats.elite++;
          else if (signal.signalType === 'CAUTION') newStats.caution++;
          else newStats.normal++;
        } else {
          newStats.rejected++;
        }

        return {
          ...prev,
          currentSignal: signal,
          signalHistory: newHistory,
          stats: newStats
        };
      });

      return signal;
    } catch (error) {
      console.error('Error generating signal:', error);
      const errorSignal: EnhancedSignalResult = {
        status: 'rejected',
        reason: `Error: ${error.message}`,
        pair: 'ERROR',
        timeframe: 'M15',
        timestamp: new Date().toISOString(),
        signalType: 'NORMAL',
        confluenceScore: 0,
        riskReward: 0
      };
      
      setState(prev => ({
        ...prev,
        currentSignal: errorSignal
      }));
      
      return errorSignal;
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
      scanCount: 0,
      stats: {
        approved: 0,
        rejected: 0,
        elite: 0,
        normal: 0,
        caution: 0
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
    return state.signalHistory.filter(signal => signal.status === 'approved');
  }, [state.signalHistory]);

  const getSignalsByType = useCallback((types: string[]) => {
    return state.signalHistory.filter(signal => 
      signal.signalType && types.includes(signal.signalType)
    );
  }, [state.signalHistory]);

  const getEliteSignals = useCallback(() => {
    return getSignalsByType(['ELITE']);
  }, [getSignalsByType]);

  const getCautionSignals = useCallback(() => {
    return getSignalsByType(['CAUTION']);
  }, [getSignalsByType]);

  // Computed values
  const totalScans = state.scanCount;
  const successRate = totalScans > 0 ? (state.stats.approved / totalScans) * 100 : 0;
  const averageConfluence = state.signalHistory.length > 0 ? 
    state.signalHistory
      .filter(s => s.confluenceScore)
      .reduce((sum, signal) => sum + signal.confluenceScore, 0) / state.signalHistory.filter(s => s.confluenceScore).length : 0;

  return {
    // State
    currentSignal: state.currentSignal,
    signalHistory: state.signalHistory,
    isScanning: state.isScanning,
    scanCount: state.scanCount,
    lastScanTime: state.lastScanTime,
    stats: state.stats,
    
    // Actions
    generateSignal,
    startAutoScanning,
    stopScanning,
    clearHistory,
    
    // Filters
    getApprovedSignals,
    getSignalsByType,
    getEliteSignals,
    getCautionSignals,
    
    // Computed
    totalScans,
    successRate,
    averageConfluence
  };
}