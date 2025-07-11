
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { SignalCard } from '@/components/signals/SignalCard';
import { SignalGenerator } from '@/components/signals/SignalGenerator';
import { PerformanceStats } from '@/components/signals/PerformanceStats';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Signals = () => {
  const [signals, setSignals] = useState([
    {
      id: 1,
      pair: 'EURUSD',
      type: 'BUY' as const,
      confidence: 85,
      entry: 1.0850,
      stopLoss: 1.0820,
      takeProfit: 1.0920,
      status: 'active' as const,
      timestamp: new Date().toISOString(),
      timeframe: 'H1',
      risk: 'Medium' as const,
      analysis: 'Strong bullish momentum with RSI divergence and key support hold. Institutional buying pressure evident.',
      reason: 'FVG tap with liquidity sweep confirmed'
    },
    {
      id: 2,
      pair: 'GBPJPY',
      type: 'SELL' as const,
      confidence: 78,
      entry: 189.45,
      stopLoss: 190.20,
      takeProfit: 187.80,
      status: 'monitoring' as const,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      timeframe: 'H4',
      risk: 'High' as const,
      analysis: 'Resistance rejection at key level with bearish engulfing pattern. Smart money distribution phase.',
      reason: 'Break of structure + Order block confluence'
    },
    {
      id: 3,
      pair: 'XAUUSD',
      type: 'BUY' as const,
      confidence: 92,
      entry: 2045.50,
      stopLoss: 2038.00,
      takeProfit: 2065.00,
      status: 'confirmed' as const,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      timeframe: 'D1',
      risk: 'Low' as const,
      analysis: 'Gold showing strong upward momentum with DXY weakness. Perfect institutional accumulation setup.',
      reason: 'Internal liquidity grab at key level'
    }
  ]);

  const [performance, setPerformance] = useState({
    winRate: 87,
    totalSignals: 234,
    activeSignals: 3,
    avgRR: 2.8
  });

  const [remainingSignals, setRemainingSignals] = useState(2);
  const { toast } = useToast();

  const handleSignalGenerated = (newSignal: any) => {
    setSignals(prev => [newSignal, ...prev]);
    setRemainingSignals(prev => Math.max(0, prev - 1));
    setPerformance(prev => ({
      ...prev,
      totalSignals: prev.totalSignals + 1,
      activeSignals: prev.activeSignals + 1
    }));
  };

  const handleTakeSignal = (signal: any) => {
    toast({
      title: "Signal Taken!",
      description: `${signal.type} signal for ${signal.pair} added to your portfolio`,
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing signals...",
      description: "Checking for new market opportunities",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                  AI Trading Signals
                </h1>
                <p className="text-xl text-gray-300">
                  Professional-grade trading signals powered by advanced AI analysis
                </p>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover-lift"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Auto-refresh
              </Button>
            </div>

            {/* Performance Stats */}
            <PerformanceStats {...performance} />
          </div>

          {/* AI Signal Generator */}
          <SignalGenerator 
            onSignalGenerated={handleSignalGenerated}
            remainingSignals={remainingSignals}
          />

          {/* Active Signals */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              Recent Signals
              <span className="ml-3 text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                {signals.length} Total
              </span>
            </h2>
            
            {signals.map((signal) => (
              <SignalCard 
                key={signal.id} 
                signal={signal} 
                onTakeSignal={handleTakeSignal}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signals;
