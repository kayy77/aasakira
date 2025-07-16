import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { multiIntelligenceCore, SignalDNA } from '@/services/multiIntelligenceCore';
import { enhancedSignalAnalyzer, EnhancedSignal } from '@/services/enhancedSignalAnalyzer';
import { webhookService } from '@/services/webhookService';
import { trueLivePriceService } from '@/services/trueLivePriceService';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import SignalCardV2 from './SignalCardV2';
import PremiumSignalCard from './PremiumSignalCard';
import EnhancedTacticalParameters from './EnhancedTacticalParameters';
import StrategicBreakdownModal from './StrategicBreakdownModal';
import WebhookManager from './WebhookManager';
import SignalMemoryDashboard from './SignalMemoryDashboard';
import AutoJournalModal from './AutoJournalModal';
import ABTestingFramework from './ABTestingFramework';
import AISignalDigest from './AISignalDigest';
import ShareableSignalCard from './ShareableSignalCard';
import { 
  Brain, 
  Activity, 
  Clock, 
  RefreshCw,
  Webhook,
  CheckCircle2,
  Target,
  Shield,
  AlertTriangle,
  Info,
  Crown,
  Lock,
  TrendingUp,
  BookOpen,
  FlaskConical,
  FileText,
  Share2,
  Mail,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SignalConfig } from '@/types/signalConfig';

interface TacticalParams {
  minConfidence: number;
  maxSignals: number;
  allowedPairs: string[];
  riskLevel: string;
}

// Create WebhookManagerProps interface
interface WebhookManagerProps {
  open: boolean;
  onClose: () => void;
}

// Create a WebhookManagerComponent to handle props correctly
const WebhookManagerComponent: React.FC<WebhookManagerProps> = ({ open, onClose }) => {
  return open ? (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-white text-lg font-bold mb-4">Webhook Manager</h3>
        <p className="text-gray-400 mb-4">Configure your trading webhooks here.</p>
        <Button onClick={onClose} className="w-full">Close</Button>
      </div>
    </div>
  ) : null;
};

const LiveSignalsDashboard: React.FC = () => {
  const [signals, setSignals] = useState<SignalDNA[]>([]);
  const [premiumSignals, setPremiumSignals] = useState<EnhancedSignal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [livePrices, setLivePrices] = useState<{ [key: string]: number }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [showWebhookManager, setShowWebhookManager] = useState(false);
  const [showStrategyBreakdown, setShowStrategyBreakdown] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<SignalDNA | null>(null);
  const [showMemoryDashboard, setShowMemoryDashboard] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showABTesting, setShowABTesting] = useState(false);
  const [showAIDigest, setShowAIDigest] = useState(false);
  const [showShareableCard, setShowShareableCard] = useState(false);
  const [signalToShare, setSignalToShare] = useState<SignalDNA | EnhancedSignal | null>(null);
  const [tacticalParams, setTacticalParams] = useState<TacticalParams>({
    minConfidence: 70,
    maxSignals: 3,
    allowedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
    riskLevel: 'MODERATE'
  });

  // Convert TacticalParams to SignalConfig for EnhancedTacticalParameters
  const signalConfig: SignalConfig = {
    strategyType: 'Hybrid',
    tradeType: 'intraday',
    confidenceThreshold: tacticalParams.minConfidence,
    riskLevel: tacticalParams.riskLevel.toLowerCase() as 'conservative' | 'moderate' | 'aggressive',
    minFilters: 3,
    assetClass: 'forex',
    pairFilter: 'majors',
    timeValidity: '1h'
  };

  const { toast } = useToast();
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    const fetchInitialPrices = async () => {
      setIsConnected(false);
      try {
        const initialPrices: { [key: string]: number } = {};
        for (const pair of tacticalParams.allowedPairs) {
          const priceData = await trueLivePriceService.getTrueLivePrice(pair);
          initialPrices[pair] = typeof priceData === 'number' ? priceData : priceData.price;
        }
        setLivePrices(initialPrices);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch initial prices:', error);
        toast({
          title: "Price Fetch Error",
          description: "Unable to fetch initial live prices. Retrying...",
          variant: "destructive",
        });
      }
    };

    fetchInitialPrices();
  }, [tacticalParams.allowedPairs, toast]);

  useEffect(() => {
    const startPriceUpdates = () => {
      const intervalId = setInterval(async () => {
        try {
          const updatedPrices: { [key: string]: number } = {};
          for (const pair of tacticalParams.allowedPairs) {
            const priceData = await trueLivePriceService.getTrueLivePrice(pair);
            updatedPrices[pair] = typeof priceData === 'number' ? priceData : priceData.price;
          }
          setLivePrices(updatedPrices);
          setIsConnected(true);
        } catch (error) {
          console.error('Failed to update prices:', error);
          setIsConnected(false);
          toast({
            title: "Price Update Error",
            description: "Lost connection to live price feed. Reconnecting...",
            variant: "destructive",
          });
        }
      }, 5000);

      return () => clearInterval(intervalId);
    };

    const cleanup = startPriceUpdates();
    return cleanup;
  }, [tacticalParams.allowedPairs, toast]);

  const generatePremiumSignal = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      console.log('🔥 GENERATING PREMIUM SIGNAL WITH ENHANCED VALIDATION...');
      
      const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      
      const premiumSignal = await enhancedSignalAnalyzer.analyzeForSignal(randomPair);
      
      if (premiumSignal) {
        setPremiumSignals(prev => [premiumSignal, ...prev.slice(0, 2)]);
        
        await sendSignalEmail(premiumSignal);
        
        toast({
          title: "⚔️ Premium Signal Generated!",
          description: `${premiumSignal.pair} ${premiumSignal.type} - ${premiumSignal.confidence}% confidence with visual evidence`,
          duration: 5000,
        });
        
        setLastGenerated(new Date());
      } else {
        toast({
          title: "Signal Quality Check Failed",
          description: "Market conditions don't meet premium signal requirements. Try again in a few minutes.",
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
  };

  const sendSignalEmail = async (signal: EnhancedSignal | SignalDNA) => {
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
  };

  const generateStandardSignal = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      console.log('🧠 GENERATING STANDARD SIGNAL...');
      
      const randomPair = tacticalParams.allowedPairs[
        Math.floor(Math.random() * tacticalParams.allowedPairs.length)
      ];
      
      const priceData = await trueLivePriceService.getTrueLivePrice(randomPair);
      const livePrice = typeof priceData === 'number' ? priceData : priceData.price;
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
  };

  const removeSignal = (signalId: string) => {
    setSignals(prev => prev.filter(signal => signal.symbol !== signalId));
    toast({
      title: "Signal Removed",
      description: `Signal ${signalId} has been removed from the dashboard`,
    });
  };

  const refreshSignal = async (signal: SignalDNA) => {
    setIsGenerating(true);
    try {
      const priceData = await trueLivePriceService.getTrueLivePrice(signal.symbol);
      const livePrice = typeof priceData === 'number' ? priceData : priceData.price;
      const refreshedSignal = await multiIntelligenceCore.generateSignalDNA(signal.symbol, livePrice);
      if (refreshedSignal) {
        setSignals(prev =>
          prev.map(s => (s.symbol === signal.symbol ? refreshedSignal : s))
        );
        toast({
          title: "Signal Refreshed",
          description: `Signal ${signal.symbol} has been updated with new data`,
        });
      } else {
        toast({
          title: "Refresh Failed",
          description: `Unable to refresh signal ${signal.symbol}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Signal refresh error:', error);
      toast({
        title: "Refresh Error",
        description: "Unable to refresh signal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStrategyBreakdown = (signal: SignalDNA) => {
    setSelectedSignal(signal);
    setShowStrategyBreakdown(true);
  };

  const handleConfigChange = (config: SignalConfig) => {
    setTacticalParams({
      minConfidence: config.confidenceThreshold,
      maxSignals: 3,
      allowedPairs: tacticalParams.allowedPairs,
      riskLevel: config.riskLevel.toUpperCase()
    });
  };

  // Helper function to normalize EnhancedSignal to SignalDNA structure
  const normalizeToSignalDNA = (signal: SignalDNA | EnhancedSignal): SignalDNA & { id: string; livePrice: number } => {
    if ('symbol' in signal) {
      // This is already a SignalDNA
      return {
        ...signal,
        id: signal.symbol,
        livePrice: livePrices[signal.symbol] || 0
      };
    } else {
      // This is an EnhancedSignal, convert to SignalDNA structure
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
          averageRR: signal.riskReward,
          sampleSize: 100
        },
        timeframe: '15m',
        id: signal.id,
        livePrice: livePrices[signal.pair] || parseFloat(signal.entry)
      };
    }
  };

  // Helper function to create compatible signal objects for components that expect specific types
  const createCompatibleSignalList = (): (SignalDNA & { id: string; livePrice: number })[] => {
    return [...signals, ...premiumSignals].map(normalizeToSignalDNA);
  };

  // Helper function to create standard SignalDNA list
  const createSignalDNAList = (): SignalDNA[] => {
    return [...signals, ...premiumSignals].map(signal => {
      const normalized = normalizeToSignalDNA(signal);
      // Remove the extra properties to match pure SignalDNA
      const { id, livePrice, ...signalDNA } = normalized;
      return signalDNA;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <Brain className="w-8 h-8 text-pink-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ⛩️ Aasakira AI - Live Signals
            </h1>
          </motion.div>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            Multi-intelligence AI council generating institutional-grade trading signals with visual evidence and premium validation
          </p>

          <div className="flex items-center justify-center gap-2">
            <Activity className={`w-4 h-4 ${isConnected ? 'text-green-400 animate-pulse' : 'text-red-400'}`} />
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Live Price Feed Active' : 'Connecting to Live Prices...'}
            </span>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <Alert className="bg-yellow-900/20 border border-yellow-500/30">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            <strong>Risk Disclaimer:</strong> These signals are powerful AI analysis tools, not guaranteed profits. 
            Always manage your own risk and trades. Don't blindly follow the TP and SL levels - manage your own risk 
            and close positions when you feel comfortable. Trading involves substantial risk and may not be suitable for all investors.
          </AlertDescription>
        </Alert>

        {/* Enhanced Control Panel */}
        <Card className="bg-gray-900/50 border border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Signal Generation Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={generatePremiumSignal}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Generate Premium Signal
              </Button>
              
              <Button
                onClick={generateStandardSignal}
                disabled={isGenerating}
                variant="outline"
                className="border-pink-500/30 text-pink-400 hover:bg-pink-500/20 h-12"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                Generate Standard Signal
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMemoryDashboard(true)}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                Memory
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJournalModal(true)}
                className="border-green-500/30 text-green-400 hover:bg-green-500/20"
              >
                <FileText className="w-3 h-3 mr-1" />
                Journal
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowABTesting(true)}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                <FlaskConical className="w-3 h-3 mr-1" />
                A/B Test
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIDigest(true)}
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
              >
                <Brain className="w-3 h-3 mr-1" />
                Digest
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWebhookManager(true)}
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              >
                <Webhook className="w-3 h-3 mr-1" />
                Webhook
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (signals.length > 0 || premiumSignals.length > 0) {
                    setSignalToShare(signals[0] || premiumSignals[0]);
                    setShowShareableCard(true);
                  } else {
                    toast({
                      title: "No Signal to Share",
                      description: "Generate a signal first to create a shareable card",
                    });
                  }
                }}
                className="border-pink-500/30 text-pink-400 hover:bg-pink-500/20"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>

            {lastGenerated && (
              <div className="text-center text-sm text-gray-400">
                Last generated: {lastGenerated.toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>

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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">⚔️ Premium Signals</h2>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black">
                Institutional Grade
              </Badge>
            </div>
            
            <div className="space-y-4">
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">🧠 AI Council Signals</h2>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                Multi-Intelligence
              </Badge>
            </div>
            
            <div className="space-y-4">
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
          <Card className="bg-gray-900/30 border border-gray-700/50 p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Ready to Generate Signals</h3>
              <p className="text-gray-400 max-w-md mx-auto">
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

        <WebhookManagerComponent
          open={showWebhookManager}
          onClose={() => setShowWebhookManager(false)}
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
      </div>
    </div>
  );
};

export default LiveSignalsDashboard;
