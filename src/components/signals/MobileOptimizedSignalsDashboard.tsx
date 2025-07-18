import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Activity,
  Settings,
  RefreshCw,
  Zap,
  Shield
} from 'lucide-react';
import { SignalConfig, Signal } from '@/types/signalConfig';
import { enhancedSignalService } from '@/services/enhancedSignalService';
import { useToast } from '@/hooks/use-toast';

const MobileOptimizedSignalsDashboard: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const defaultConfig: SignalConfig = {
    pair: 'EURUSD',
    timeframe: 'H1',
    strategyType: "Hybrid",
    tradeType: "intraday",
    confidenceThreshold: 75,
    riskLevel: "moderate",
    minFilters: 3,
    assetClass: "forex",
    pairFilter: 'major',
    timeValidity: '4h',
    marketConditions: ['trending', 'ranging'],
    technicalIndicators: ['RSI', 'MACD', 'EMA'],
    riskManagement: {
      maxRiskPerTrade: 2,
      stopLossMethod: 'ATR',
      takeProfitRatio: 2
    },
    sessionFilters: ['london', 'newyork'],
    volumeFilter: true,
    newsFilter: true
  };

  const generateSignals = async () => {
    setIsLoading(true);
    try {
      const newSignals = await enhancedSignalService.generateSignals(defaultConfig);
      setSignals(newSignals);
      setLastUpdate(new Date());
      toast({
        title: "Signals Updated",
        description: `Generated ${newSignals.length} new signals`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate signals",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    generateSignals();
  }, []);

  const getDirectionColor = (direction: string) => {
    return direction === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Live Signals</h2>
        <Button
          onClick={generateSignals}
          disabled={isLoading}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Status Bar */}
      <Card className="glass-card">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Live</span>
            </div>
            <div className="text-gray-400">
              {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'No updates'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals List */}
      <div className="space-y-3">
        {signals.length === 0 && !isLoading ? (
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">No signals available</p>
              <Button onClick={generateSignals} className="mt-3" variant="outline">
                Generate Signals
              </Button>
            </CardContent>
          </Card>
        ) : (
          signals.map((signal) => (
            <Card key={signal.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-white border-gray-600">
                      {signal.pair}
                    </Badge>
                    <Badge 
                      className={`${
                        signal.direction === 'BUY' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {signal.direction === 'BUY' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {signal.direction}
                    </Badge>
                  </div>
                  <div className={`text-sm font-bold ${getConfidenceColor(signal.confidence)}`}>
                    {signal.confidence}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div>
                    <div className="text-gray-400">Entry</div>
                    <div className="text-white font-mono">{signal.entry}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Stop Loss</div>
                    <div className="text-red-400 font-mono">{signal.stopLoss}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Take Profit</div>
                    <div className="text-green-400 font-mono">{signal.takeProfit}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <Progress value={signal.confidence} className="h-2" />
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  {signal.reason}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {signal.timeframe}
                  </div>
                  <div>
                    {new Date(signal.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400">Generating elite signals...</p>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedSignalsDashboard;
