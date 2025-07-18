
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Shield, 
  Zap,
  Settings,
  Activity,
  Bell
} from 'lucide-react';
import { Signal, SignalConfig } from '@/types/signalConfig';
import EnhancedTacticalParameters from './EnhancedTacticalParameters';

const MobileOptimizedSignalsDashboard: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [config, setConfig] = useState<SignalConfig>({
    pair: 'EURUSD',
    timeframe: '1H',
    strategyType: 'Hybrid',
    tradeType: 'intraday',
    confidenceThreshold: 75,
    riskLevel: 'moderate',
    minFilters: 3,
    assetClass: 'forex',
    marketConditions: 'trending',
    technicalIndicators: ['RSI', 'MACD'],
    pairFilter: 'major',
    timeValidity: '24h',
    riskRewardRatio: 2.0,
    maxSignalsPerDay: 5,
    sessionFilters: ['London', 'New York'],
    volumeFilter: true,
    newsFilter: true,
    correlationFilter: false
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSignal = async () => {
    setIsGenerating(true);
    
    // Simulate signal generation
    setTimeout(() => {
      const newSignal: Signal = {
        pair: config.pair,
        direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entry: 1.0850 + (Math.random() - 0.5) * 0.01,
        stopLoss: 1.0820,
        takeProfit: 1.0920,
        riskReward: config.riskRewardRatio,
        confidence: config.confidenceThreshold + Math.floor(Math.random() * 20) - 10,
        timeframe: config.timeframe,
        analysis: 'Smart Money Concepts detected institutional buying interest...',
        timestamp: new Date(),
        signalStrength: Math.floor(Math.random() * 100),
        status: 'active'
      };
      
      setSignals(prev => [newSignal, ...prev.slice(0, 9)]);
      setIsGenerating(false);
    }, 2000);
  };

  const stats = {
    totalSignals: signals.length,
    winRate: 73,
    avgRR: 2.1,
    activeSignals: signals.filter(s => s.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card className="glass-card border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-400" />
                Elite Signals
              </div>
              <Badge className="bg-green-600">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{stats.totalSignals}</div>
                <div className="text-xs text-gray-400">Signals</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{stats.winRate}%</div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{stats.avgRR}</div>
                <div className="text-xs text-gray-400">Avg R:R</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{stats.activeSignals}</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="signals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="signals" className="text-white data-[state=active]:bg-purple-600">
              Signals
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-purple-600">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-4">
            {/* Generate Button */}
            <Button
              onClick={generateSignal}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing Markets...
                </div>
              ) : (
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Generate Elite Signal
                </div>
              )}
            </Button>

            {/* Signals List */}
            <div className="space-y-3">
              {signals.length === 0 ? (
                <Card className="glass-card border-gray-700/50">
                  <CardContent className="p-6 text-center">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">No signals generated yet</p>
                    <p className="text-sm text-gray-500 mt-1">Tap the button above to generate your first signal</p>
                  </CardContent>
                </Card>
              ) : (
                signals.map((signal, index) => (
                  <Card key={index} className="glass-card border-gray-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${
                            signal.direction === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                          } text-white`}>
                            {signal.direction}
                          </Badge>
                          <span className="font-semibold text-white">{signal.pair}</span>
                        </div>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                          {signal.confidence}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                        <div>
                          <div className="text-gray-400">Entry</div>
                          <div className="text-white font-medium">{signal.entry.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">SL</div>
                          <div className="text-red-400 font-medium">{signal.stopLoss.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">TP</div>
                          <div className="text-green-400 font-medium">{signal.takeProfit.toFixed(4)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Signal Strength</span>
                        <span className="text-xs text-gray-300">{signal.signalStrength}/100</span>
                      </div>
                      <Progress value={signal.signalStrength} className="h-1 mb-3" />

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{signal.timeframe}</span>
                        <span className="text-gray-400">R:R {signal.riskReward}:1</span>
                        <span className="text-gray-400">
                          {signal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <EnhancedTacticalParameters
              onConfigChange={setConfig}
              initialConfig={config}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileOptimizedSignalsDashboard;
