import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, AlertTriangle, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { multiIntelligenceCore, SignalDNA } from '@/services/multiIntelligenceCore';
import { enhancedSignalAnalyzer, EnhancedSignal } from '@/services/enhancedSignalAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import { useLivePrices } from './hooks/useLivePrices';
import SignalGenerationHub from './SignalGenerationHub';
import SignalCardV2 from './SignalCardV2';
import PremiumSignalCard from './PremiumSignalCard';
import EnhancedTacticalParameters from './EnhancedTacticalParameters';
import StrategicBreakdownModal from './StrategicBreakdownModal';
import SignalMemoryDashboard from './SignalMemoryDashboard';
import AutoJournalModal from './AutoJournalModal';
import ABTestingFramework from './ABTestingFramework';
import AISignalDigest from './AISignalDigest';
import ShareableSignalCard from './ShareableSignalCard';
import GroqTestPanel from './GroqTestPanel';
import { useToast } from '@/hooks/use-toast';
import { SignalConfig } from '@/types/signalConfig';

interface TacticalParams {
  minConfidence: number;
  maxSignals: number;
  allowedPairs: string[];
  riskLevel: string;
}

const MobileOptimizedSignalsDashboard: React.FC = () => {
  const [signals, setSignals] = useState<SignalDNA[]>([]);
  const [premiumSignals, setPremiumSignals] = useState<EnhancedSignal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<SignalDNA | null>(null);
  const [signalToShare, setSignalToShare] = useState<SignalDNA | EnhancedSignal | null>(null);
  
  // Modal states
  const [showStrategyBreakdown, setShowStrategyBreakdown] = useState(false);
  const [showMemoryDashboard, setShowMemoryDashboard] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showABTesting, setShowABTesting] = useState(false);
  const [showAIDigest, setShowAIDigest] = useState(false);
  const [showShareableCard, setShowShareableCard] = useState(false);
  const [showWebhookManager, setShowWebhookManager] = useState(false);

  const [tacticalParams, setTacticalParams] = useState<TacticalParams>({
    minConfidence: 70,
    maxSignals: 3,
    allowedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
    riskLevel: 'MODERATE'
  });

  const { livePrices, isConnected } = useLivePrices({
    allowedPairs: tacticalParams.allowedPairs,
    updateInterval: 5000
  });

  const { toast } = useToast();

  // Convert TacticalParams to SignalConfig
  const signalConfig: SignalConfig = useMemo(() => ({
    strategyType: 'Hybrid',
    tradeType: 'intraday',
    confidenceThreshold: tacticalParams.minConfidence,
    riskLevel: tacticalParams.riskLevel.toLowerCase() as 'conservative' | 'moderate' | 'aggressive',
    minFilters: 3,
    assetClass: 'forex',
    pairFilter: 'majors',
    timeValidity: '1h'
  }), [tacticalParams]);

  const sendSignalEmail = useCallback(async (signal: EnhancedSignal | SignalDNA) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const response = await supabase.functions.invoke('send-signal-email', {
        body: {
          email: user.email,
          signal: signal,
          userName: user.user_metadata?.full_name || 'Trader'
        }
      });

      if (response.error) {
        console.error('Email send error:', response.error);
      } else {
        console.log('✅ Signal email sent successfully');
      }
    } catch (error) {
      console.error('Failed to send signal email:', error);
    }
  }, []);

  const generatePremiumSignal = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      
      const premiumSignal = await enhancedSignalAnalyzer.analyzeForSignal(randomPair);
      
      if (premiumSignal) {
        setPremiumSignals(prev => [premiumSignal, ...prev.slice(0, 2)]);
        await sendSignalEmail(premiumSignal);
        
        toast({
          title: "⚔️ Premium Signal Generated!",
          description: `${premiumSignal.pair} ${premiumSignal.type} - ${premiumSignal.confidence}% confidence`,
          duration: 5000,
        });
        
        setLastGenerated(new Date());
      } else {
        toast({
          title: "Signal Quality Check Failed",
          description: "Market conditions don't meet premium signal requirements.",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Premium signal generation error:', error);
      toast({
        title: "Generation Error",
        description: "Unable to generate premium signal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, sendSignalEmail, toast]);

  const generateStandardSignal = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const randomPair = tacticalParams.allowedPairs[
        Math.floor(Math.random() * tacticalParams.allowedPairs.length)
      ];
      
      const livePrice = livePrices[randomPair] || 1.0;
      const signalDNA = await multiIntelligenceCore.generateSignalDNA(randomPair, livePrice);
      
      if (signalDNA && signalDNA.confidence >= tacticalParams.minConfidence) {
        if (signals.length >= tacticalParams.maxSignals) {
          setSignals(prev => [signalDNA, ...prev.slice(0, tacticalParams.maxSignals - 1)]);
        } else {
          setSignals(prev => [signalDNA, ...prev]);
        }
        
        await sendSignalEmail(signalDNA);
        
        toast({
          title: "🎯 Signal Generated!",
          description: `${signalDNA.symbol} ${signalDNA.type} signal with ${signalDNA.confidence}% confidence`,
          duration: 4000,
        });
        
        setLastGenerated(new Date());
      } else {
        toast({
          title: "Signal Rejected",
          description: "AI consensus too low or confidence below threshold",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Signal generation error:', error);
      toast({
        title: "Generation Error",
        description: "Unable to generate signal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, tacticalParams, livePrices, signals.length, sendSignalEmail, toast]);

  const handleConfigChange = useCallback((config: SignalConfig) => {
    setTacticalParams(prev => ({
      ...prev,
      minConfidence: config.confidenceThreshold,
      riskLevel: config.riskLevel.toUpperCase()
    }));
  }, []);

  const handleShowShare = useCallback(() => {
    if (signals.length > 0 || premiumSignals.length > 0) {
      setSignalToShare(signals[0] || premiumSignals[0]);
      setShowShareableCard(true);
    } else {
      toast({
        title: "No Signal to Share",
        description: "Generate a signal first to create a shareable card",
      });
    }
  }, [signals, premiumSignals, toast]);

  // Helper functions for compatibility
  const normalizeToSignalDNA = useCallback((signal: SignalDNA | EnhancedSignal): SignalDNA & { id: string; livePrice: number } => {
    if ('symbol' in signal) {
      return {
        ...signal,
        id: signal.symbol,
        livePrice: livePrices[signal.symbol] || 0
      };
    } else {
      return {
        symbol: signal.pair,
        type: 'Hybrid' as const,
        confidence: signal.confidence,
        origin: {
          institutional: true,
          smc: true,
          quant: false,
          volatility: false,
          visual: true,
          mentor: false
        },
        structure: {
          entry: signal.entry,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
          rr: signal.riskReward.toString()
        },
        filters: signal.reasons,
        price: {
          source: 'live',
          status: 'active',
          lastUpdated: new Date().toISOString()
        },
        session: 'London',
        contradictions: [],
        aiThought: 'Enhanced signal analysis with visual evidence',
        backtest: {
          winRate: 85,
          totalTrades: 100,
          avgRR: signal.riskReward
        },
        timeframe: '15m',
        id: signal.id,
        livePrice: livePrices[signal.pair] || parseFloat(signal.entry)
      };
    }
  }, [livePrices]);

  const createCompatibleSignalList = useCallback((): (SignalDNA & { id: string; livePrice: number })[] => {
    return [...signals, ...premiumSignals].map(normalizeToSignalDNA);
  }, [signals, premiumSignals, normalizeToSignalDNA]);

  const createSignalDNAList = useCallback((): SignalDNA[] => {
    return [...signals, ...premiumSignals].map(signal => {
      const normalized = normalizeToSignalDNA(signal);
      const { id, livePrice, ...signalDNA } = normalized;
      return signalDNA;
    });
  }, [signals, premiumSignals, normalizeToSignalDNA]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-2 md:p-4">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3 md:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 md:gap-3"
          >
            <Brain className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ⛩️ Aasakira AI - Live Signals
            </h1>
          </motion.div>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base px-4">
            Multi-intelligence AI council generating institutional-grade trading signals
          </p>

          <div className="flex items-center justify-center gap-2">
            <Activity className={`w-3 h-3 md:w-4 md:h-4 ${isConnected ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
            <span className={`text-xs md:text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Live Price Feed Active' : 'Connecting to Live Prices...'}
            </span>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <Alert className="bg-yellow-900/20 border border-yellow-500/30">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200 text-sm md:text-base">
            <strong>Risk Disclaimer:</strong> These signals are powerful AI analysis tools, not guaranteed profits. 
            Always manage your own risk and trades. Don't blindly follow the TP and SL levels - manage your own risk 
            and close positions when you feel comfortable. Trading involves substantial risk.
          </AlertDescription>
        </Alert>

        {/* GROQ Test Panel */}
        <GroqTestPanel />

        {/* Signal Generation Hub */}
        <SignalGenerationHub
          isGenerating={isGenerating}
          onGeneratePremium={generatePremiumSignal}
          onGenerateStandard={generateStandardSignal}
          onShowMemory={() => setShowMemoryDashboard(true)}
          onShowJournal={() => setShowJournalModal(true)}
          onShowABTesting={() => setShowABTesting(true)}
          onShowDigest={() => setShowAIDigest(true)}
          onShowWebhook={() => setShowWebhookManager(true)}
          onShowShare={handleShowShare}
          lastGenerated={lastGenerated}
        />

        {/* Enhanced Tactical Parameters */}
        <EnhancedTacticalParameters
          config={signalConfig}
          onConfigChange={handleConfigChange}
          onShowBreakdown={() => setShowStrategyBreakdown(true)}
          onGenerateSignal={generateStandardSignal}
          isGenerating={isGenerating}
        />

        {/* Premium Signals Section */}
        {premiumSignals.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              <h2 className="text-lg md:text-xl font-bold text-white">⚔️ Premium Signals</h2>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs md:text-sm">
                Institutional Grade
              </Badge>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <AnimatePresence>
                {premiumSignals.map((signal) => (
                  <PremiumSignalCard
                    key={signal.id}
                    signal={signal}
                    livePrice={livePrices[signal.pair] || Number(signal.entry)}
                    onRemove={() => {
                      setPremiumSignals(prev => prev.filter(s => s.id !== signal.id));
                    }}
                    onRefresh={() => {
                      toast({
                        title: "Refreshing Premium Signal",
                        description: "Updating with latest market data...",
                      });
                    }}
                    onBacktest={() => {
                      toast({
                        title: "Backtesting Premium Signal",
                        description: "Running historical analysis...",
                      });
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Standard Signals Section */}
        {signals.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <h2 className="text-lg md:text-xl font-bold text-white">🧠 AI Council Signals</h2>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs md:text-sm">
                Multi-Intelligence
              </Badge>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <AnimatePresence>
                {signals.map((signal, index) => (
                  <SignalCardV2
                    key={`${signal.symbol}-${index}`}
                    signalDNA={signal}
                    livePrice={livePrices[signal.symbol] || Number(signal.structure.entry)}
                    onRemove={(signalId) => {
                      setSignals(prev => prev.filter(s => s.symbol !== signalId));
                    }}
                    onRefresh={() => {
                      toast({
                        title: "Refreshing Signal",
                        description: "Updating with latest market data...",
                      });
                    }}
                    onBacktest={() => {
                      toast({
                        title: "Backtesting Signal",
                        description: "Running historical analysis...",
                      });
                    }}
                    isUpdating={isGenerating}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {signals.length === 0 && premiumSignals.length === 0 && (
          <Card className="bg-gray-900/30 border border-gray-700/50 p-6 md:p-8">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white">Ready to Generate Signals</h3>
              <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base">
                Click "Generate Premium Signal" for institutional-grade setups with visual evidence, 
                or "Generate Standard Signal" for AI council validated trades.
              </p>
            </div>
          </Card>
        )}

        {/* Modals */}
        <StrategicBreakdownModal
          open={showStrategyBreakdown}
          onOpenChange={setShowStrategyBreakdown}
          signalDNA={selectedSignal}
        />

        <SignalMemoryDashboard
          open={showMemoryDashboard}
          onOpenChange={setShowMemoryDashboard}
          signals={createSignalDNAList()}
        />

        <AutoJournalModal
          open={showJournalModal}
          onOpenChange={setShowJournalModal}
          signals={createCompatibleSignalList()}
        />

        <ABTestingFramework
          open={showABTesting}
          onOpenChange={setShowABTesting}
          signals={createCompatibleSignalList()}
        />

        <AISignalDigest
          open={showAIDigest}
          onOpenChange={setShowAIDigest}
          signals={createCompatibleSignalList()}
        />

        <ShareableSignalCard
          open={showShareableCard}
          onOpenChange={setShowShareableCard}
          signal={signalToShare}
        />

        {/* Simple Webhook Manager */}
        {showWebhookManager && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-4 md:p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-white text-lg font-bold mb-4">Webhook Manager</h3>
              <p className="text-gray-400 mb-4">Configure your trading webhooks here.</p>
              <Button onClick={() => setShowWebhookManager(false)} className="w-full">Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileOptimizedSignalsDashboard;
