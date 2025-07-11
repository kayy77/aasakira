
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  RefreshCw,
  Clock,
  DollarSign,
  Activity,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Signals = () => {
  const [signals, setSignals] = useState([
    {
      id: 1,
      pair: 'EURUSD',
      type: 'BUY',
      confidence: 85,
      entry: 1.0850,
      stopLoss: 1.0820,
      takeProfit: 1.0920,
      status: 'active',
      timestamp: new Date().toISOString(),
      analysis: 'Strong bullish momentum with RSI divergence and key support hold'
    },
    {
      id: 2,
      pair: 'GBPJPY',
      type: 'SELL',
      confidence: 78,
      entry: 189.45,
      stopLoss: 190.20,
      takeProfit: 187.80,
      status: 'monitoring',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      analysis: 'Resistance rejection at key level with bearish engulfing pattern'
    },
    {
      id: 3,
      pair: 'XAUUSD',
      type: 'BUY',
      confidence: 92,
      entry: 2045.50,
      stopLoss: 2038.00,
      takeProfit: 2065.00,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      analysis: 'Gold showing strong upward momentum with DXY weakness'
    }
  ]);

  const [performance, setPerformance] = useState({
    winRate: 87,
    totalSignals: 234,
    activeSignals: 3,
    avgRR: 2.8
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'signal-active';
      case 'monitoring': return 'signal-warning';
      case 'confirmed': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      default: return 'signal-inactive';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
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
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover-lift">
                <RefreshCw className="w-4 h-4 mr-2" />
                Auto-refresh
              </Button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {performance.winRate}%
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {performance.totalSignals}
                </div>
                <div className="text-sm text-gray-400">Total Signals</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {performance.activeSignals}
                </div>
                <div className="text-sm text-gray-400">Active</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {performance.avgRR}:1
                </div>
                <div className="text-sm text-gray-400">Avg R:R</div>
              </div>
            </div>

            {/* Beta Notice */}
            <div className="glass-card p-4 border-orange-500/30 bg-orange-500/10 mb-8">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <h3 className="text-orange-400 font-semibold mb-1">Beta Notice</h3>
                  <p className="text-orange-300/80 text-sm">
                    Entry prices may be slightly off from real-time market prices (typically 1-3 pips). 
                    The AI delivers strong, valid trade setups with accurate direction and targets - 
                    you may just need to adjust entry timing for optimal fills.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Signal Generator */}
          <div className="glass-card p-8 mb-8 hover-glow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Signal Generator</h2>
                  <p className="text-gray-400">High-conviction trading signals with institutional-grade analysis</p>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                2 signals remaining
              </Badge>
            </div>

            <div className="glass-card p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Intelligent Market Analysis</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Our AI automatically scans all major currency pairs, analyzes market conditions, 
                and selects the highest probability trade setup. No manual selection required - 
                just click generate for the best available opportunity.
              </p>
              
              <div className="glass-card p-4 border-orange-500/30 bg-orange-500/10 mb-6">
                <div className="flex items-center space-x-2 text-orange-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Entry prices may vary 1-3 pips from live market rates. Trade setups and direction remain highly accurate.</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 hover-lift cyber-glow"
              >
                <Zap className="w-5 h-5 mr-2" />
                Generate Best Signal
              </Button>
            </div>
          </div>

          {/* Active Signals */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Signals</h2>
            
            {signals.map((signal) => (
              <div key={signal.id} className="glass-card p-6 hover-glow animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={signal.type === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                          {signal.type}
                        </Badge>
                        <Badge className={getStatusColor(signal.status)}>
                          {signal.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {signal.confidence}%
                    </div>
                    <div className="text-sm text-gray-400">Confidence</div>
                  </div>
                </div>

                {/* Signal Evolution Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Signal Evolution</span>
                    <span className="text-sm font-semibold text-blue-400">Confirmed ⚡</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Monitoring</span>
                    <span>Developing</span>
                    <span>Confirmed</span>
                    <span>TP Hit</span>
                  </div>
                </div>

                {/* Price Levels */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="glass-card p-4 border-blue-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-400">Entry Price</span>
                    </div>
                    <div className="text-lg font-bold text-white">{signal.entry}</div>
                  </div>
                  <div className="glass-card p-4 border-red-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">Stop Loss</span>
                    </div>
                    <div className="text-lg font-bold text-white">{signal.stopLoss}</div>
                  </div>
                  <div className="glass-card p-4 border-green-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Take Profit</span>
                    </div>
                    <div className="text-lg font-bold text-white">{signal.takeProfit}</div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="glass-card p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400 font-semibold">AI Analysis</span>
                  </div>
                  <p className="text-gray-300 text-sm">{signal.analysis}</p>
                </div>

                {/* Performance */}
                <div className="glass-card p-4 border-green-500/30 bg-green-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <span className="text-green-400">✓</span>
                        <span className="text-green-400">✗</span>
                        <span className="text-green-400">✓</span>
                        <span className="text-green-400">✓</span>
                      </div>
                      <span className="text-sm text-green-400">75% Win Rate</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400">3W / 1L</div>
                      <div className="text-xs text-gray-400">Best Trade: +89 pips</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signals;
