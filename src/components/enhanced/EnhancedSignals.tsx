
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Brain, Target, Zap, TrendingUp, AlertCircle, Loader, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signalService } from '@/services/signalService';
import type { Signal } from '@/services/signalService';

const EnhancedSignals: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const currentSignals = await signalService.getLatestSignals();
        setSignals(currentSignals);
      } catch (error) {
        console.error('Failed to load signals:', error);
      }
    };

    loadSignals();
    const interval = setInterval(loadSignals, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateSignal = async () => {
    setIsGenerating(true);
    try {
      const signal = await signalService.generateLiveSignal();
      if (signal) {
        const updatedSignals = await signalService.getLatestSignals();
        setSignals(updatedSignals);
        setLastGenerated(new Date());
        toast({
          title: "🚨 Live Signal Generated!",
          description: `${signal.pair} ${signal.type} - ${signal.confidence}% confidence`,
        });
      } else {
        toast({
          title: "No Signals Available",
          description: "Market conditions don't meet institutional standards",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Signal generation error:', error);
      toast({
        title: "Signal Generation Failed",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCurrentSession = () => {
    const hour = new Date().getUTCHours();
    if (hour >= 8 && hour <= 17) return 'London';
    if (hour >= 13 && hour <= 22) return 'New York';
    return 'Asian';
  };

  const getPerformanceStats = () => {
    return signalService.getPerformanceStats();
  };

  const stats = getPerformanceStats();

  return (
    <div className="space-y-6">
      {/* Enhanced Signal Generator */}
      <Card className="bg-gray-900/50 border border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                <Brain className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">🧠 Enhanced Institutional Signal Protocol</CardTitle>
                <p className="text-gray-400">Live Market Analysis + AI Validation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                {getCurrentSession()}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Brain className="w-3 h-3 mr-1" />
                AI ENHANCED
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 text-center border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{stats.winRate}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
            <div className="glass-card p-4 text-center border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{stats.totalSignals}</div>
              <div className="text-xs text-gray-400">Total Signals</div>
            </div>
            <div className="glass-card p-4 text-center border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">{stats.activeSignals}</div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
            <div className="glass-card p-4 text-center border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{stats.avgRR}:1</div>
              <div className="text-xs text-gray-400">Avg R:R</div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4"
            onClick={generateSignal}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Markets...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate Live Signal
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Live Signals Display */}
      <Card className="bg-gray-900/50 border border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live Institutional Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {signals.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No signals generated yet</p>
              <p className="text-sm text-gray-500">Click generate to create your first signal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {signals.map((signal, index) => (
                <Card key={signal.id || index} className="bg-gray-800/50 border border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} px-3 py-1`}>
                          {signal.pair} {signal.type}
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 px-3 py-1">
                          {signal.confidence}% Confidence
                        </Badge>
                        {signal.institutionalGrade && (
                          <Badge className="bg-purple-500/20 text-purple-400 px-3 py-1">
                            <Crown className="w-3 h-3 mr-1" />
                            INSTITUTIONAL
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Entry Price</p>
                        <p className="text-white font-mono text-lg">{signal.entry}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Stop Loss</p>
                        <p className="text-red-400 font-mono text-lg">{signal.stopLoss}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Take Profit</p>
                        <p className="text-green-400 font-mono text-lg">{signal.takeProfit}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-300">Live: {signal.livePrice}</span>
                        </div>
                        <span className="text-sm text-gray-400">({signal.priceAge})</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                          R:R {typeof signal.riskReward === 'number' ? signal.riskReward.toFixed(1) : '2.0'}:1
                        </div>
                        <Badge className="bg-gray-700/50 text-gray-300">
                          {signal.strategy}
                        </Badge>
                      </div>
                    </div>

                    {signal.confluenceScore && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Confluence Score</span>
                          <span className="text-sm text-orange-400">{signal.confluenceScore}/{signal.maxConfluence || 6}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full" 
                            style={{ width: `${(signal.confluenceScore / (signal.maxConfluence || 6)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {signal.analysis && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-300">{signal.analysis}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSignals;
