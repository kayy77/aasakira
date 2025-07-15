import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { multiIntelligenceCore, SignalDNA } from '@/services/multiIntelligenceCore';
import { webhookService } from '@/services/webhookService';
import { trueLivePriceService } from '@/services/trueLivePriceService';
import { motion, AnimatePresence } from 'framer-motion';
import SignalCardV2 from './SignalCardV2';
import { 
  Brain, 
  Activity, 
  Clock, 
  RefreshCw,
  Settings,
  Webhook,
  CheckCircle2,
  Target,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WebhookManager from './WebhookManager';

const LiveSignalsDashboard: React.FC = () => {
  const [militarySignals, setMilitarySignals] = useState<(SignalDNA & { id: string, livePrice: number })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showWebhookManager, setShowWebhookManager] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [generationSettings, setGenerationSettings] = useState({
    strategyType: 'Hybrid' as 'SMC' | 'Institutional' | 'Hybrid',
    confidenceThreshold: 80,
    minFilters: 4,
    pairFilter: 'majors' as 'all' | 'majors' | 'eurusd'
  });
  const { toast } = useToast();

  const generateMilitarySignal = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🚀 MULTI-INTELLIGENCE CORE ACTIVATION SEQUENCE INITIATED...');
      
      // Select pair based on filter
      const pairs = generationSettings.pairFilter === 'eurusd' 
        ? ['EURUSD'] 
        : generationSettings.pairFilter === 'majors'
        ? ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD']
        : ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'];
      
      const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];
      
      // Get REAL live price using the original service
      console.log(`🎯 TARGET ACQUIRED: ${selectedPair} - Fetching REAL live price...`);
      const livePriceData = await trueLivePriceService.getTrueLivePrice(selectedPair);
      const livePrice = livePriceData.price;
      
      console.log(`📡 LIVE PRICE CONFIRMED: ${selectedPair} @ ${livePrice} from ${livePriceData.source}`);
      
      // Generate signal through AI council
      const signalDNA = await multiIntelligenceCore.generateSignalDNA(selectedPair, livePrice);
      
      if (!signalDNA) {
        toast({
          title: "Signal Validation Failed",
          description: "AI Council consensus could not be reached. Market conditions do not meet institutional criteria.",
          variant: "destructive"
        });
        return;
      }

      // Check confidence threshold
      if (signalDNA.confidence < generationSettings.confidenceThreshold) {
        toast({
          title: "Confidence Threshold Not Met",
          description: `Signal confidence ${signalDNA.confidence}% below required ${generationSettings.confidenceThreshold}%`,
          variant: "destructive"
        });
        return;
      }

      // Update the price info with real data
      signalDNA.price = {
        source: livePriceData.source,
        status: livePriceData.accuracy,
        lastUpdated: 'Just now'
      };

      const militarySignal = {
        ...signalDNA,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        livePrice
      };

      setMilitarySignals(prev => [militarySignal, ...prev].slice(0, 8));
      setLastUpdate(new Date());
      
      // Trigger webhook
      await webhookService.triggerSignalAlert({
        pair: signalDNA.symbol,
        type: signalDNA.type,
        confidence: signalDNA.confidence,
        entry: signalDNA.structure.entry,
        sl: signalDNA.structure.stopLoss,
        tp: signalDNA.structure.takeProfit,
        rr: signalDNA.structure.rr,
        aiThought: signalDNA.aiThought
      });
      
      const voteCount = Object.values(signalDNA.origin).filter(Boolean).length;
      const gradeLevel = voteCount === 6 ? 'INSTITUTIONAL GRADE' : 'PROFESSIONAL';
      
      toast({
        title: `${gradeLevel} Signal Generated`,
        description: `${signalDNA.symbol} ${signalDNA.type} @ ${signalDNA.structure.entry} | Confidence: ${signalDNA.confidence}% | Confluence: ${voteCount}/6`,
      });
      
    } catch (error) {
      console.error('❌ SIGNAL GENERATION FAILED:', error);
      toast({
        title: "Generation Failure",
        description: "Multi-Intelligence Core experienced critical error. Retry signal generation.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const removeMilitarySignal = (signalId: string) => {
    setMilitarySignals(prev => prev.filter(signal => signal.id !== signalId));
    toast({
      title: "Signal Terminated",
      description: "Signal removed from active monitoring.",
    });
  };

  const refreshSignalPrice = async (signalId: string) => {
    setIsAnalyzing(signalId);
    
    try {
      const signal = militarySignals.find(s => s.id === signalId);
      if (!signal) return;
      
      // Get REAL live price
      const livePriceData = await trueLivePriceService.getTrueLivePrice(signal.symbol);
      const newPrice = livePriceData.price;
      
      setMilitarySignals(prev => 
        prev.map(s => 
          s.id === signalId 
            ? { 
                ...s, 
                livePrice: newPrice, 
                price: { 
                  ...s.price, 
                  source: livePriceData.source,
                  status: livePriceData.accuracy,
                  lastUpdated: 'Just now' 
                } 
              }
            : s
        )
      );
      
      toast({
        title: "Price Updated",
        description: `${signal.symbol} live price refreshed: ${newPrice.toFixed(signal.symbol.includes('JPY') ? 3 : 5)} from ${livePriceData.source}`,
      });
      
    } catch (error) {
      toast({
        title: "Price Update Failed",
        description: "Failed to refresh live price data.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleBacktest = (signalDNA: SignalDNA) => {
    toast({
      title: "Backtest Analysis",
      description: `${signalDNA.symbol} ${signalDNA.type}: ${Math.round(signalDNA.backtest.winRate)}% win rate over ${signalDNA.backtest.totalTrades} trades. Avg R/R: ${signalDNA.backtest.avgRR.toFixed(1)}`,
    });
  };

  // Auto-refresh prices every 5 seconds using REAL price service
  useEffect(() => {
    if (militarySignals.length === 0) return;
    
    const interval = setInterval(async () => {
      const updatedSignals = await Promise.all(
        militarySignals.map(async (signal) => {
          try {
            const livePriceData = await trueLivePriceService.getTrueLivePrice(signal.symbol);
            return {
              ...signal,
              livePrice: livePriceData.price,
              price: { 
                ...signal.price, 
                source: livePriceData.source,
                status: livePriceData.accuracy,
                lastUpdated: '5s ago' 
              }
            };
          } catch {
            return signal;
          }
        })
      );
      
      setMilitarySignals(updatedSignals);
    }, 5000);

    return () => clearInterval(interval);
  }, [militarySignals.length]);

  return (
    <div className="space-y-6">
      {/* Sakura Particles Background */}
      <div className="sakura-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="sakura-petal"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Samurai Command Center Header */}
      <Card className="bg-gradient-to-r from-gray-950 via-purple-950/20 to-gray-950 border border-pink-500/30 relative overflow-hidden glow-soft animate-section-load">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded border border-pink-500/50 glow-soft">
                  <Brain className="w-8 h-8 text-pink-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-gray-950" />
              </div>
              <div>
                <h2 className="text-2xl font-zen-maru font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  ⛩️ AASAKIRA SIGNAL SYSTEM
                </h2>
                <p className="text-sm text-gray-400 font-shippori">
                  Silent precision. Disciplined execution. Every signal is a calculated strike.
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs font-zen-maru glow-soft">
                    <Activity className="w-3 h-3 mr-1" />
                    LIVE FEEDS ACTIVE
                  </Badge>
                  <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 text-xs font-zen-maru glow-soft">
                    <Shield className="w-3 h-3 mr-1" />
                    AI COUNCIL ONLINE
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs font-zen-maru glow-soft">
                    <Target className="w-3 h-3 mr-1" />
                    TACTICAL MODE
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <div className="flex items-center gap-1 text-xs text-gray-400 font-zen-maru">
                  <Clock className="w-3 h-3" />
                  Last: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <Button
                onClick={() => setShowWebhookManager(!showWebhookManager)}
                variant="outline"
                size="sm"
                className="border-blue-500/30 hover:bg-blue-500/20 text-blue-400 font-zen-maru glow-soft"
              >
                <Webhook className="w-4 h-4 mr-2" />
                Webhooks
              </Button>
              <Button
                onClick={generateMilitarySignal}
                disabled={isGenerating}
                className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/50 hover:bg-pink-500/30 font-zen-maru font-bold glow-intense"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    AI COUNCIL VOTING...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    GENERATE SIGNAL
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Tactical Parameters */}
      <Card className="bg-gray-950/50 border-gray-600/30 glow-soft animate-section-load">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 font-zen-maru">
            <Settings className="w-5 h-5" />
            TACTICAL PARAMETERS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block font-zen-maru">Strategy Type</label>
              <select 
                value={generationSettings.strategyType}
                onChange={(e) => setGenerationSettings(prev => ({ ...prev, strategyType: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-noto glow-soft"
              >
                <option value="Hybrid">⚡ Hybrid</option>
                <option value="Institutional">⛩️ Institutional</option>
                <option value="SMC">🥋 SMC</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block font-zen-maru">Min Confidence</label>
              <select 
                value={generationSettings.confidenceThreshold}
                onChange={(e) => setGenerationSettings(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-noto glow-soft"
              >
                <option value={70}>70%+</option>
                <option value={80}>80%+</option>
                <option value={90}>90%+</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block font-zen-maru">Min Confluence</label>
              <select 
                value={generationSettings.minFilters}
                onChange={(e) => setGenerationSettings(prev => ({ ...prev, minFilters: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-noto glow-soft"
              >
                <option value={3}>3/6 Frameworks</option>
                <option value={4}>4/6 Frameworks</option>
                <option value={5}>5/6 Frameworks</option>
                <option value={6}>6/6 Frameworks (Elite)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block font-zen-maru">Pair Filter</label>
              <select 
                value={generationSettings.pairFilter}
                onChange={(e) => setGenerationSettings(prev => ({ ...prev, pairFilter: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm font-noto glow-soft"
              >
                <option value="majors">Major Pairs</option>
                <option value="eurusd">EUR/USD Only</option>
                <option value="all">All Pairs</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Manager */}
      {showWebhookManager && <WebhookManager />}

      {/* System Status */}
      {militarySignals.length > 0 && (
        <Alert className="border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 glow-soft animate-section-load">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400 font-zen-maru">
            ⛩️ AASAKIRA SYSTEM OPERATIONAL - {militarySignals.length} Active Signals | Auto-refresh: 5s intervals
            <div className="mt-1 text-xs text-green-300 font-noto">
              Strategic signal intelligence with live price feeds and multi-framework validation
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Signal Cards */}
      <AnimatePresence>
        {militarySignals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <SignalCardV2
              signalDNA={signal}
              livePrice={signal.livePrice}
              onRemove={removeMilitarySignal}
              onRefresh={() => refreshSignalPrice(signal.id)}
              onBacktest={() => handleBacktest(signal)}
              isUpdating={isAnalyzing === signal.id}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {militarySignals.length === 0 && !isGenerating && (
        <Card className="bg-gradient-to-br from-gray-950 to-gray-900 border-gray-500/20 glow-soft animate-section-load">
          <CardContent className="text-center py-12">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full mx-auto flex items-center justify-center border border-pink-500/30 glow-soft">
                <Brain className="w-10 h-10 text-pink-400" />
              </div>
              <div className="absolute inset-0 bg-pink-400/10 rounded-full blur-xl" />
            </div>
            <h3 className="text-2xl font-zen-maru font-bold text-white mb-2">⛩️ SYSTEM STANDBY</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto font-shippori">
              Multi-Intelligence Core awaiting deployment. Elite signals require AI council consensus of 4/6 minimum.
            </p>
            <Button
              onClick={generateMilitarySignal}
              className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/50 hover:bg-pink-500/30 font-zen-maru font-bold px-8 py-3 glow-intense"
            >
              <Brain className="w-5 h-5 mr-2" />
              ACTIVATE INTELLIGENCE CORE
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSignalsDashboard;
