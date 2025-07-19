
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Brain, Target, Zap, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhancedSignalService } from '@/services/enhancedSignalService';
import GroqTestPanel from '@/components/signals/GroqTestPanel';
import SignalGenerationHub from '@/components/signals/SignalGenerationHub';

const EnhancedSignals: React.FC = () => {
  const [signals, setSignals] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSignals = () => {
      const currentSignals = enhancedSignalService.getSignals();
      setSignals(currentSignals);
    };

    loadSignals();
    const interval = setInterval(loadSignals, 2000);
    return () => clearInterval(interval);
  }, []);

  const generatePremiumSignal = async () => {
    setIsGenerating(true);
    try {
      const signal = await enhancedSignalService.generateLiveSignal();
      if (signal) {
        setSignals(prev => [signal, ...prev.slice(0, 4)]);
        setLastGenerated(new Date());
        toast({
          title: "🚨 Premium Signal Generated!",
          description: `${signal.pair} ${signal.type} - Enhanced with GROQ AI validation`,
        });
      } else {
        toast({
          title: "No Premium Signals Available",
          description: "Market conditions don't meet premium standards right now",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Signal Generation Failed",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStandardSignal = async () => {
    setIsGenerating(true);
    try {
      const signal = await enhancedSignalService.generateLiveSignal();
      if (signal) {
        setSignals(prev => [signal, ...prev.slice(0, 4)]);
        setLastGenerated(new Date());
        toast({
          title: "Standard Signal Generated",
          description: `${signal.pair} ${signal.type}`,
        });
      }
    } catch (error) {
      toast({
        title: "Signal Generation Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* GROQ AI Test Panel */}
      <GroqTestPanel />

      {/* Signal Generation Hub */}
      <SignalGenerationHub
        isGenerating={isGenerating}
        onGeneratePremium={generatePremiumSignal}
        onGenerateStandard={generateStandardSignal}
        onShowMemory={() => {}}
        onShowJournal={() => {}}
        onShowABTesting={() => {}}
        onShowDigest={() => {}}
        onShowWebhook={() => {}}
        onShowShare={() => {}}
        lastGenerated={lastGenerated}
      />

      {/* Live Signals Display */}
      <Card className="bg-gray-900/50 border border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live Enhanced Signals
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
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {signal.pair} {signal.type}
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {signal.confidence}% Confidence
                        </Badge>
                        {signal.groqAnalysis && (
                          <Badge className="bg-purple-500/20 text-purple-400">
                            <Brain className="w-3 h-3 mr-1" />
                            GROQ Validated
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Entry</p>
                        <p className="text-white font-mono">{signal.entry}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Stop Loss</p>
                        <p className="text-red-400 font-mono">{signal.stopLoss}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Take Profit</p>
                        <p className="text-green-400 font-mono">{signal.takeProfit}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-300">Live: {signal.livePrice}</span>
                        </div>
                        <span className="text-xs text-gray-400">({signal.priceSource})</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        R:R {signal.riskReward?.toFixed(1) || '2.0'}:1
                      </div>
                    </div>

                    {signal.analysis && (
                      <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                        <p className="text-xs text-blue-300">{signal.analysis}</p>
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
