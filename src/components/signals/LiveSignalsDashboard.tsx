
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { enhancedSignalService, EnhancedSignal } from '@/services/enhancedSignalService';
import { institutionalSignalService } from '@/services/institutionalSignalService';
import { enhancedPriceService } from '@/services/enhancedPriceService';
import { webhookService } from '@/services/webhookService';
import { motion, AnimatePresence } from 'framer-motion';
import InstitutionalSignalCard from './InstitutionalSignalCard';
import { 
  Zap, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  X,
  HelpCircle,
  Brain,
  Settings,
  Webhook,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LivePriceVerification from './LivePriceVerification';
import PriceAccuracyCheck from './PriceAccuracyCheck';
import WebhookManager from './WebhookManager';

const LiveSignalsDashboard: React.FC = () => {
  const [signals, setSignals] = useState<EnhancedSignal[]>([]);
  const [institutionalSignals, setInstitutionalSignals] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<EnhancedSignal | null>(null);
  const [showWebhookManager, setShowWebhookManager] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null);
  const { toast } = useToast();

  const generateSignal = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🧠 GENERATING INSTITUTIONAL-GRADE SIGNAL...');
      
      // Try to generate institutional signal first (higher priority)
      const institutionalSignal = await institutionalSignalService.generateInstitutionalSignal();
      
      if (institutionalSignal) {
        setInstitutionalSignals(prev => [institutionalSignal, ...prev].slice(0, 10));
        
        toast({
          title: "🧠 Institutional Signal Generated!",
          description: `${institutionalSignal.direction.toUpperCase()} ${institutionalSignal.pair} - ${institutionalSignal.filters_passed.length}/6 filters passed`,
        });
        
        return;
      }

      // Fallback to enhanced signal if institutional doesn't meet criteria
      console.log('🔴 GENERATING ENHANCED SIGNAL...');
      const newSignal = await enhancedSignalService.generateLiveSignal();
      if (newSignal) {
        setSignals(enhancedSignalService.getSignals());
        setLastUpdate(new Date());
        
        // Trigger webhook for new signal
        await webhookService.triggerSignalAlert(newSignal);
        
        toast({
          title: "⚡ Enhanced Signal Generated",
          description: `${newSignal.pair} ${newSignal.type} @ ${newSignal.entry} | Live: ${newSignal.livePrice}`,
        });
      } else {
        toast({
          title: "No Signal Generated",
          description: "Market conditions don't meet institutional criteria (need 3/6 filters minimum)",
          variant: "destructive"
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

  const handleAIAnalysis = async (signal: EnhancedSignal) => {
    setIsAnalyzing(signal.id);
    
    try {
      // Trigger AI analysis webhook
      await webhookService.triggerAIAnalysis({
        pair: signal.pair,
        entry: signal.entry,
        sl: signal.stopLoss,
        tp: signal.takeProfit,
        strategy: signal.strategy,
        request: "Provide detailed technical analysis for this signal"
      });
      
      setSelectedSignal(signal);
      
      toast({
        title: "🧠 AI Analysis Triggered",
        description: "Enhanced analysis has been sent to your connected webhooks",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to trigger AI analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handlePriceUpdate = (signalId: number, newPrice: number, source: string) => {
    setSignals(prevSignals => 
      prevSignals.map(signal => 
        signal.id === signalId 
          ? { ...signal, livePrice: newPrice, priceSource: source, lastUpdated: new Date().toLocaleTimeString() }
          : signal
      )
    );
  };

  const handleInstitutionalPriceUpdate = (signalId: string, newPrice: number, source: string) => {
    setInstitutionalSignals(prevSignals => 
      prevSignals.map(signal => 
        signal.id === signalId 
          ? { 
              ...signal, 
              entry: newPrice.toFixed(signal.pair.includes('JPY') ? 3 : 5),
              priceSource: source, 
              priceTimestamp: new Date().toISOString(),
              priceAccuracy: source === 'Enhanced Fallback' ? 'FALLBACK' : 'VERIFIED'
            }
          : signal
      )
    );
  };

  // Auto-refresh signals and update live prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (signals.length > 0) {
        setSignals([...enhancedSignalService.getSignals()]);
      }
      
      // Update live prices for institutional signals
      if (institutionalSignals.length > 0) {
        for (const signal of institutionalSignals) {
          if (signal.status === 'ACTIVE') {
            try {
              const priceData = await enhancedPriceService.getLivePrice(signal.pair);
              handleInstitutionalPriceUpdate(signal.id, priceData.price, priceData.source);
            } catch (error) {
              console.error(`Failed to update price for ${signal.pair}:`, error);
            }
          }
        }
      }
    }, 5000); // Every 5 seconds for better real-time feel

    return () => clearInterval(interval);
  }, [signals.length, institutionalSignals.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">🧠 Institutional AI Signals</h2>
                <p className="text-sm text-gray-400">Smart Money Concepts • 3/6 Filter Logic • Live Analysis</p>
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
                onClick={() => setShowWebhookManager(!showWebhookManager)}
                variant="outline"
                size="sm"
                className="border-blue-500/30 hover:bg-blue-500/20"
              >
                <Webhook className="w-4 h-4 mr-2" />
                Webhooks
              </Button>
              <Button
                onClick={generateSignal}
                disabled={isGenerating}
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Markets...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Institutional Signal
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Webhook Manager */}
      {showWebhookManager && (
        <WebhookManager />
      )}

      {/* Institutional Signals */}
      <AnimatePresence>
        {institutionalSignals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <InstitutionalSignalCard
              signal={signal}
              onAnalyze={(s) => console.log('Analyzing signal:', s)}
              onPriceUpdate={(newPrice, source) => handleInstitutionalPriceUpdate(signal.id, newPrice, source)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Enhanced Signals */}
      {signals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Enhanced Trading Signals
          </h3>
          <AnimatePresence>
            {signals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="space-y-4">
                  <Card className="glass-card border-purple-500/30 hover:border-purple-400/50 transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        {/* Signal Header */}
                        <div className="flex items-center justify-between">
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
                              </div>
                              <p className="text-sm text-gray-400">{signal.strategy.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`border-0 text-lg font-bold ${
                              signal.riskReward >= 2 ? 'bg-green-500/20 text-green-400' : 
                              signal.riskReward >= 1.5 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              1:{signal.riskReward}
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
                        </div>

                        {/* Trade Levels */}
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center bg-gray-800/40 rounded-lg p-3">
                            <div className="text-gray-400 mb-1">Entry</div>
                            <div className="text-white font-mono font-bold">
                              {signal.entry}
                            </div>
                          </div>
                          <div className="text-center bg-red-500/10 rounded-lg p-3">
                            <div className="text-gray-400 mb-1">Stop Loss</div>
                            <div className="text-red-400 font-mono font-bold">
                              {signal.stopLoss}
                            </div>
                          </div>
                          <div className="text-center bg-green-500/10 rounded-lg p-3">
                            <div className="text-gray-400 mb-1">Take Profit</div>
                            <div className="text-green-400 font-mono font-bold">
                              {signal.takeProfit}
                            </div>
                          </div>
                        </div>

                        {/* Analysis */}
                        <div className="bg-gray-800/20 rounded-lg p-3">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {signal.analysis}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Price Accuracy Verification */}
                  <PriceAccuracyCheck signal={signal} />

                  {/* Live Price Verification */}
                  <LivePriceVerification
                    signal={signal}
                    onPriceUpdate={(newPrice, source) => handlePriceUpdate(signal.id, newPrice, source)}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {signals.length === 0 && institutionalSignals.length === 0 && !isGenerating && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Institutional Signals</h3>
            <p className="text-gray-400 mb-4">
              Generate institutional-grade signals based on Smart Money Concepts and multi-filter confluence
            </p>
            <Button
              onClick={generateSignal}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate Institutional Signal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSignalsDashboard;
