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
import SignalCardBase, { BaseSignalData } from './SignalCardBase';
import { signalContradictionService } from '@/services/signalContradictionService';

const LiveSignalsDashboard: React.FC = () => {
  const [signals, setSignals] = useState<EnhancedSignal[]>([]);
  const [institutionalSignals, setInstitutionalSignals] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<EnhancedSignal | null>(null);
  const [showWebhookManager, setShowWebhookManager] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'institutional' | 'smc' | 'enhanced'>('all');
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
          description: `${institutionalSignal.direction.toUpperCase()} ${institutionalSignal.pair} @ ${institutionalSignal.livePrice || institutionalSignal.entry} - ${institutionalSignal.filters_passed.length}/6 filters passed`,
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

  const removeInstitutionalSignal = (signalId: string) => {
    setInstitutionalSignals(prev => prev.filter(signal => signal.id !== signalId));
    toast({
      title: "Institutional Signal Removed",
      description: "Signal has been removed from your list.",
    });
  };

  const convertInstitutionalToBase = (signal: any): BaseSignalData => ({
    id: signal.id,
    pair: signal.pair,
    direction: signal.direction,
    entry: signal.entry,
    stopLoss: signal.stop_loss,
    takeProfit: signal.take_profit,
    livePrice: signal.livePrice,
    priceSource: signal.priceSource,
    priceAccuracy: signal.priceAccuracy,
    riskReward: signal.risk_reward,
    timestamp: signal.timestamp,
    type: 'institutional',
    confidence: signal.confidence,
    filtersPassedCount: signal.filters_passed?.length || 0,
    maxFilters: 6,
    reasoning: signal.reasoning,
    session: signal.session,
    timeframe: signal.timeframe
  });

  const convertEnhancedToBase = (signal: any): BaseSignalData => ({
    id: signal.id.toString(),
    pair: signal.pair,
    direction: signal.type.toLowerCase(),
    entry: signal.entry.toString(),
    stopLoss: signal.stopLoss.toString(),
    takeProfit: signal.takeProfit.toString(),
    livePrice: signal.livePrice,
    priceSource: signal.priceSource,
    priceAccuracy: signal.priceAccuracy,
    riskReward: `1:${signal.riskReward}`,
    timestamp: new Date(),
    type: 'enhanced',
    strategy: signal.strategy
  });

  const allSignals: BaseSignalData[] = [
    ...institutionalSignals.map(convertInstitutionalToBase),
    ...signals.map(convertEnhancedToBase)
  ];

  const signalsWithContradictions = signalContradictionService.markSignalsWithContradictions(allSignals);

  const filteredSignals = signalsWithContradictions.filter(signal => {
    if (activeFilter === 'all') return true;
    return signal.type === activeFilter;
  });

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
    console.log(`🔄 Updating institutional signal ${signalId} price: ${newPrice} from ${source}`);
    
    setInstitutionalSignals(prevSignals => 
      prevSignals.map(signal => 
        signal.id === signalId 
          ? { 
              ...signal, 
              livePrice: newPrice,
              entry: newPrice.toFixed(signal.pair.includes('JPY') ? 3 : 5),
              priceSource: source, 
              priceTimestamp: new Date().toISOString(),
              priceAccuracy: source === 'Enhanced Fallback' ? 'FALLBACK' : 'VERIFIED',
              lastPriceUpdate: new Date()
            }
          : signal
      )
    );
  };

  const handleUnifiedSignalRemove = (signalId: string) => {
    // Check if it's institutional or enhanced signal and remove accordingly
    const institutionalSignal = institutionalSignals.find(s => s.id === signalId);
    if (institutionalSignal) {
      removeInstitutionalSignal(signalId);
    } else {
      const enhancedSignal = signals.find(s => s.id.toString() === signalId);
      if (enhancedSignal) {
        removeSignal(enhancedSignal.id);
      }
    }
  };

  const handleUnifiedPriceRefresh = async (signal: BaseSignalData) => {
    if (signal.type === 'institutional') {
      // Find the original institutional signal and update its price
      const institutionalSignal = institutionalSignals.find(s => s.id === signal.id);
      if (institutionalSignal) {
        await institutionalSignalService.updateSignalPrice(signal.id);
        const updatedSignals = institutionalSignalService.getLatestSignals();
        const updatedSignal = updatedSignals.find(s => s.id === signal.id);
        if (updatedSignal && updatedSignal.livePrice) {
          handleInstitutionalPriceUpdate(signal.id, updatedSignal.livePrice, updatedSignal.priceSource);
        }
      }
    }
    // Enhanced signals don't have manual refresh yet
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if signals exist to prevent unnecessary renders
      if (institutionalSignals.length > 0) {
        const latestSignals = institutionalSignalService.getLatestSignals();
        if (latestSignals.length > 0) {
          console.log(`🔄 Refreshing ${latestSignals.length} institutional signals from service...`);
          setInstitutionalSignals(latestSignals);
        }
      }
      
      // Update enhanced signals if any exist
      if (signals.length > 0) {
        setSignals([...enhancedSignalService.getSignals()]);
      }
    }, 5000); // Reduced frequency to 5 seconds for better mobile performance

    return () => clearInterval(interval);
  }, [signals.length, institutionalSignals.length]); // Better dependency array

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
                <h2 className="text-xl font-bold text-white">🧠 Unified Signal Dashboard</h2>
                <p className="text-sm text-gray-400">Multi-Strategy Analysis • Live Price Feed • Contradiction Detection</p>
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
                    Generate Signal
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Strategy Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setActiveFilter('all')}
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          className={activeFilter === 'all' ? 'bg-purple-500/20 text-purple-400' : 'border-gray-500/30'}
        >
          All Signals ({allSignals.length})
        </Button>
        <Button
          onClick={() => setActiveFilter('institutional')}
          variant={activeFilter === 'institutional' ? 'default' : 'outline'}
          size="sm"
          className={activeFilter === 'institutional' ? 'bg-yellow-500/20 text-yellow-400' : 'border-gray-500/30'}
        >
          <Crown className="w-3 h-3 mr-1" />
          Institutional ({institutionalSignals.length})
        </Button>
        <Button
          onClick={() => setActiveFilter('enhanced')}
          variant={activeFilter === 'enhanced' ? 'default' : 'outline'}
          size="sm"
          className={activeFilter === 'enhanced' ? 'bg-blue-500/20 text-blue-400' : 'border-gray-500/30'}
        >
          <Zap className="w-3 h-3 mr-1" />
          Enhanced ({signals.length})
        </Button>
      </div>

      {/* Webhook Manager */}
      {showWebhookManager && (
        <WebhookManager />
      )}

      {/* Enhanced Live Price Status */}
      {filteredSignals.length > 0 && (
        <Alert className="border-green-500/30 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400">
            🔥 Unified Signal System Active - Real-time updates every 5 seconds with contradiction detection
            <div className="mt-1 text-xs text-green-300">
              {signalsWithContradictions.filter(s => s.hasContradiction).length > 0 && (
                <span className="text-orange-400">
                  ⚠️ {signalsWithContradictions.filter(s => s.hasContradiction).length} signals have contradictions - view details
                </span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Unified Signal Cards */}
      <AnimatePresence>
        {filteredSignals.map((signal, index) => (
          <motion.div
            key={`unified-${signal.id}-${signal.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <SignalCardBase
              signal={signal}
              onRemove={handleUnifiedSignalRemove}
              onRefreshPrice={() => handleUnifiedPriceRefresh(signal)}
              onViewAnalysis={() => console.log('View analysis for:', signal)}
              isUpdatingPrice={isAnalyzing === parseInt(signal.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {filteredSignals.length === 0 && !isGenerating && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Signals Available</h3>
            <p className="text-gray-400 mb-4">
              Generate multi-strategy signals with live price feeds and contradiction detection
            </p>
            <Button
              onClick={generateSignal}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate Signal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSignalsDashboard;
