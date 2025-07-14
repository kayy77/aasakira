
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { enhancedSignalService, EnhancedSignal } from '@/services/enhancedSignalService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Wifi,
  WifiOff,
  X,
  HelpCircle,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LiveSignalsDashboard: React.FC = () => {
  const [signals, setSignals] = useState<EnhancedSignal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<EnhancedSignal | null>(null);
  const { toast } = useToast();

  const generateSignal = async () => {
    setIsGenerating(true);
    
    try {
      const newSignal = await enhancedSignalService.generateLiveSignal();
      if (newSignal) {
        setSignals(enhancedSignalService.getSignals());
        setLastUpdate(new Date());
        
        toast({
          title: "🎯 Live FX Signal Generated",
          description: `${newSignal.pair} ${newSignal.type} at ${newSignal.livePrice} (${newSignal.priceSource})`,
        });
      }
    } catch (error) {
      toast({
        title: "Signal Generation Failed",
        description: "Failed to fetch live market data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const removeSignal = (signalId: number) => {
    enhancedSignalService.removeSignal(signalId);
    setSignals(enhancedSignalService.getSignals());
    toast({
      title: "Signal Removed",
      description: "Signal has been removed from your list.",
    });
  };

  // Auto-refresh signals every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (signals.length > 0) {
        setSignals([...enhancedSignalService.getSignals()]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [signals.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Live FX Signals</h2>
                <p className="text-sm text-gray-400">Real-time forex analysis with live price feeds</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <Button
                onClick={generateSignal}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-600 to-blue-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Live Signal
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Live Signals */}
      <AnimatePresence>
        {signals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-purple-500/30 hover:border-purple-400/50 transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Signal Info */}
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      signal.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {signal.type === 'BUY' ? (
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
                        <Badge className={`${
                          signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        } border-0`}>
                          {signal.type}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 border-0">
                          {signal.confidence}%
                        </Badge>
                        <Button
                          onClick={() => removeSignal(signal.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-red-500/20"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-400">{signal.strategy.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Live Price */}
                  <div className="bg-gray-800/40 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {signal.priceSource === 'fallback' ? (
                        <WifiOff className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Wifi className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-xs text-gray-400">
                        Live Price ({signal.priceSource})
                      </span>
                    </div>
                    <div className="text-lg font-mono font-bold text-white">
                      {signal.livePrice}
                    </div>
                    <div className="text-xs text-gray-400">
                      Updated: {signal.lastUpdated}
                    </div>
                  </div>

                  {/* Trade Levels */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-gray-400 mb-1">Entry</div>
                      <div className="text-white font-mono font-bold">
                        {signal.entry}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 mb-1">Stop Loss</div>
                      <div className="text-red-400 font-mono font-bold">
                        {signal.stopLoss}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 mb-1">Take Profit</div>
                      <div className="text-green-400 font-mono font-bold">
                        {signal.takeProfit}
                      </div>
                    </div>
                  </div>

                  {/* Risk Reward & Action */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${
                      signal.riskReward >= 2 ? 'bg-green-500/20 text-green-400' : 
                      signal.riskReward >= 1.5 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    } border-0 text-lg font-bold`}>
                      1:{signal.riskReward}
                    </Badge>
                    <Button
                      onClick={() => setSelectedSignal(signal)}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/30 hover:bg-blue-500/20"
                    >
                      <HelpCircle className="w-4 h-4 mr-1" />
                      See Why?
                    </Button>
                  </div>
                </div>

                {/* Analysis */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="bg-gray-800/20 rounded-lg p-3">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {signal.analysis}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Signal Explanation Modal */}
      {selectedSignal && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Brain className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Why This Signal Was Chosen</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSignal(null)}
                  className="text-blue-400 hover:bg-blue-500/20"
                >
                  ✕
                </Button>
              </div>
              <p className="text-sm">{selectedSignal.whyChosen}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h5 className="font-semibold text-green-300 mb-2">✅ Pros:</h5>
                  <ul className="text-xs space-y-1">
                    {selectedSignal.pros.map((pro, index) => (
                      <li key={index}>• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-red-300 mb-2">⚠️ Cons:</h5>
                  <ul className="text-xs space-y-1">
                    {selectedSignal.cons.map((con, index) => (
                      <li key={index}>• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {signals.length === 0 && !isGenerating && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Signals</h3>
            <p className="text-gray-400 mb-4">
              Generate a live forex signal to start analyzing real market opportunities
            </p>
            <Button
              onClick={generateSignal}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate First Signal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSignalsDashboard;
