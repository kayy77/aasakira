import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { multiIntelligenceCore, SignalDNA } from '@/services/multiIntelligenceCore';
import { webhookService } from '@/services/webhookService';
import { trueLivePriceService } from '@/services/trueLivePriceService';
import { motion, AnimatePresence } from 'framer-motion';
import SignalCardV2 from './SignalCardV2';
import EnhancedTacticalParameters from './EnhancedTacticalParameters';
import StrategyBreakdownModal from './StrategyBreakdownModal';
import WebhookManager from './WebhookManager';
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
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useIsMobile } from '@/hooks/use-mobile';
import FeatureGate from '@/components/FeatureGate';
import EnhancedPremiumUpgrade from '@/components/enhanced/EnhancedPremiumUpgrade';
import { SignalConfig, StrategyBreakdown } from '@/types/signalConfig';

const LiveSignalsDashboard: React.FC = () => {
  const [militarySignals, setMilitarySignals] = useState<(SignalDNA & { id: string, livePrice: number })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showWebhookManager, setShowWebhookManager] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [currentBreakdown, setCurrentBreakdown] = useState<StrategyBreakdown>({
    smc: false,
    liquidity: false,
    fvg: false,
    volume: false,
    session: false,
    rsiEma: false
  });
  const [currentConfidence, setCurrentConfidence] = useState(0);

  // Enhanced configuration state
  const [signalConfig, setSignalConfig] = useState<SignalConfig>({
    strategyType: 'Hybrid',
    tradeType: 'intraday',
    confidenceThreshold: 80,
    riskLevel: 'moderate',
    minFilters: 4,
    assetClass: 'forex',
    pairFilter: 'majors'
  });

  const { toast } = useToast();
  const { isPremium, canUseFeature, incrementUsage, getRemainingUsage } = useSubscription();
  const isMobile = useIsMobile();

  // Adjust SL/TP logic based on trade type
  const getAdjustedStopLoss = (baseStopLoss: number, entry: number, tradeType: string) => {
    const multipliers = {
      scalp: 0.6,      // Tighter stops for scalps
      intraday: 1.0,   // Normal stops
      swing: 1.5,      // Wider stops for swings
      position: 2.0    // Very wide stops for positions
    };
    
    const multiplier = multipliers[tradeType as keyof typeof multipliers] || 1.0;
    const distance = Math.abs(entry - baseStopLoss);
    return entry > baseStopLoss 
      ? entry - (distance * multiplier)
      : entry + (distance * multiplier);
  };

  const getAdjustedTakeProfit = (baseTakeProfit: number, entry: number, tradeType: string, riskLevel: string) => {
    const typeMultipliers = {
      scalp: 0.8,      // Smaller targets for scalps
      intraday: 1.0,   // Normal targets
      swing: 1.8,      // Larger targets for swings
      position: 3.0    // Very large targets for positions
    };
    
    const riskMultipliers = {
      conservative: 0.8,  // Smaller targets, safer
      moderate: 1.0,      // Normal targets
      aggressive: 1.5     // Larger targets, higher risk
    };
    
    const typeMultiplier = typeMultipliers[tradeType as keyof typeof typeMultipliers] || 1.0;
    const riskMultiplier = riskMultipliers[riskLevel as keyof typeof riskMultipliers] || 1.0;
    const finalMultiplier = typeMultiplier * riskMultiplier;
    
    const distance = Math.abs(baseTakeProfit - entry);
    return entry < baseTakeProfit 
      ? entry + (distance * finalMultiplier)
      : entry - (distance * finalMultiplier);
  };

  const generateMilitarySignal = async () => {
    // Check if user can use signals feature
    if (!canUseFeature('signals')) {
      setShowUpgrade(true);
      toast({
        title: "Daily Limit Reached",
        description: "You've used your 2 daily signals. Upgrade to Premium for unlimited access!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 ENHANCED MULTI-INTELLIGENCE CORE ACTIVATION...');
      
      // Select pair based on asset class and filter
      let pairs: string[] = [];
      
      switch (signalConfig.assetClass) {
        case 'forex':
          pairs = signalConfig.pairFilter === 'eurusd' 
            ? ['EURUSD'] 
            : signalConfig.pairFilter === 'majors'
            ? ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD']
            : ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'];
          break;
        case 'crypto':
          pairs = ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD'];
          break;
        case 'commodities':
          pairs = ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL'];
          break;
        case 'indices':
          pairs = ['US30', 'US500', 'NAS100', 'UK100'];
          break;
      }
      
      const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];
      
      // Get REAL live price using the original service (NEVER TOUCH THIS)
      console.log(`🎯 TARGET ACQUIRED: ${selectedPair} - Fetching REAL live price...`);
      const livePriceData = await trueLivePriceService.getTrueLivePrice(selectedPair);
      const livePrice = livePriceData.price;
      
      console.log(`📡 LIVE PRICE CONFIRMED: ${selectedPair} @ ${livePrice} from ${livePriceData.source}`);
      
      // Generate signal through AI council with enhanced parameters
      const signalDNA = await multiIntelligenceCore.generateSignalDNA(selectedPair, livePrice);
      
      if (!signalDNA) {
        toast({
          title: "Signal Validation Failed",
          description: "AI Council consensus could not be reached. Market conditions do not meet enhanced criteria.",
          variant: "destructive"
        });
        return;
      }

      // Enhanced filtering based on new parameters
      if (signalDNA.confidence < signalConfig.confidenceThreshold) {
        toast({
          title: "Confidence Threshold Not Met",
          description: `Signal confidence ${signalDNA.confidence}% below required ${signalConfig.confidenceThreshold}%`,
          variant: "destructive"
        });
        return;
      }

      const frameworkCount = Object.values(signalDNA.origin).filter(Boolean).length;
      if (frameworkCount < signalConfig.minFilters) {
        toast({
          title: "Confluence Threshold Not Met",
          description: `Only ${frameworkCount}/${signalConfig.minFilters} frameworks passed validation`,
          variant: "destructive"
        });
        return;
      }

      // Apply trade type and risk level adjustments to SL/TP
      const adjustedStopLoss = getAdjustedStopLoss(
        signalDNA.structure.stopLoss, 
        signalDNA.structure.entry, 
        signalConfig.tradeType
      );
      
      const adjustedTakeProfit = getAdjustedTakeProfit(
        signalDNA.structure.takeProfit, 
        signalDNA.structure.entry, 
        signalConfig.tradeType,
        signalConfig.riskLevel
      );

      // Update signal with adjusted values
      signalDNA.structure.stopLoss = adjustedStopLoss;
      signalDNA.structure.takeProfit = adjustedTakeProfit;
      signalDNA.structure.rr = Math.abs((adjustedTakeProfit - signalDNA.structure.entry) / (signalDNA.structure.entry - adjustedStopLoss));

      // Set breakdown for modal
      setCurrentBreakdown({
        smc: signalDNA.origin.smartMoney || false,
        liquidity: signalDNA.origin.liquidity || false,
        fvg: signalDNA.origin.fvg || false,
        volume: signalDNA.origin.volume || false,
        session: signalDNA.origin.session || false,
        rsiEma: signalDNA.origin.technical || false
      });
      setCurrentConfidence(signalDNA.confidence);

      // Update the price info with real data (NEVER CHANGE THIS PART)
      signalDNA.price = {
        source: livePriceData.source,
        status: livePriceData.accuracy,
        lastUpdated: 'Just now'
      };

      const militarySignal = {
        ...signalDNA,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        livePrice,
        // Add enhanced metadata
        tradeType: signalConfig.tradeType,
        riskLevel: signalConfig.riskLevel,
        assetClass: signalConfig.assetClass
      };

      setMilitarySignals(prev => [militarySignal, ...prev].slice(0, 8));
      setLastUpdate(new Date());
      
      // Increment usage for free users
      incrementUsage('signals');
      
      // Trigger webhook
      await webhookService.triggerSignalAlert({
        pair: signalDNA.symbol,
        type: signalDNA.type,
        confidence: signalDNA.confidence,
        entry: signalDNA.structure.entry,
        sl: signalDNA.structure.stopLoss,
        tp: signalDNA.structure.takeProfit,
        rr: signalDNA.structure.rr,
        aiThought: signalDNA.aiThought,
        tradeType: signalConfig.tradeType,
        riskLevel: signalConfig.riskLevel
      });
      
      const voteCount = Object.values(signalDNA.origin).filter(Boolean).length;
      const gradeLevel = voteCount === 6 ? 'INSTITUTIONAL GRADE' : 
                        voteCount === 5 ? 'PROFESSIONAL' : 'QUALIFIED';
      
      toast({
        title: `${gradeLevel} ${signalConfig.tradeType.toUpperCase()} Signal Generated`,
        description: `${signalDNA.symbol} ${signalDNA.type} @ ${signalDNA.structure.entry} | Confidence: ${signalDNA.confidence}% | Risk: ${signalConfig.riskLevel}`,
      });
      
    } catch (error) {
      console.error('❌ ENHANCED SIGNAL GENERATION FAILED:', error);
      toast({
        title: "Generation Failure",
        description: "Enhanced Multi-Intelligence Core experienced critical error. Retry signal generation.",
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
      
      // Get REAL live price (NEVER CHANGE THIS)
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

  // Auto-refresh prices every 5 seconds using REAL price service (NEVER CHANGE THIS)
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

  const remaining = getRemainingUsage('signals');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Sakura Particles Background */}
      <div className="sakura-container">
        {[...Array(isMobile ? 10 : 20)].map((_, i) => (
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
          <CardTitle className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative">
                <div className="p-2 md:p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded border border-pink-500/50 glow-soft">
                  <Brain className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-gray-950" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-zen-maru font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  ⛩️ AASAKIRA ENHANCED SIGNAL SYSTEM
                </h2>
                <p className="text-xs md:text-sm text-gray-400 font-shippori">
                  God-tier signal generation with trade type optimization and risk level adaptation.
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
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
                    ENHANCED MODE
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              {lastUpdate && (
                <div className="flex items-center gap-1 text-xs text-gray-400 font-zen-maru">
                  <Clock className="w-3 h-3" />
                  Last: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              {!isMobile && (
                <Button
                  onClick={() => setShowWebhookManager(!showWebhookManager)}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 hover:bg-blue-500/20 text-blue-400 font-zen-maru glow-soft"
                >
                  <Webhook className="w-4 h-4 mr-2" />
                  Webhooks
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Free User Limit Display */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-orange-950/20 via-yellow-950/20 to-orange-950/20 border border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-orange-300 font-semibold text-sm md:text-base">
                    Enhanced Signals Remaining Today: <span className="text-orange-100">{remaining}/2</span>
                  </p>
                  <p className="text-orange-400 text-xs md:text-sm">
                    Free users get 2 enhanced signals daily. Upgrade for unlimited access!
                  </p>
                </div>
              </div>
              <Button 
                size={isMobile ? "sm" : "default"}
                onClick={() => setShowUpgrade(true)}
                className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Tactical Parameters */}
      <EnhancedTacticalParameters
        config={signalConfig}
        onConfigChange={setSignalConfig}
        onShowBreakdown={() => setShowBreakdown(true)}
        onGenerateSignal={generateMilitarySignal}
        isGenerating={isGenerating}
      />

      {/* Premium Signal Disclaimer */}
      <Card className="bg-gradient-to-r from-orange-950/20 via-red-950/20 to-orange-950/20 border border-orange-500/30 relative overflow-hidden glow-soft animate-section-load">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-orange-400 text-lg md:text-xl">
            <div className="p-2 bg-orange-500/20 rounded border border-orange-500/50">
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            🔒 Enhanced Signal Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-3 text-orange-100 text-sm md:text-base">
              <p>
                These enhanced signals use advanced AI with trade type optimization and risk level adaptation. 
                However, <strong>no signal system is 100% accurate</strong>. Stop Loss and Take Profit levels are 
                automatically adjusted based on your trade type and risk preferences, but you should always monitor 
                trades and manage risk accordingly.
              </p>
              
              <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-3 md:p-4">
                <h4 className="text-orange-300 font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                  <Target className="w-4 h-4" />
                  Enhanced Trade Management:
                </h4>
                <ul className="text-xs md:text-sm space-y-1 text-orange-200">
                  <li>• Trade type automatically adjusts SL/TP distances</li>
                  <li>• Risk level modifies target expectations</li>
                  <li>• Asset class filtering ensures relevance</li>
                  <li>• Strategy breakdown provides transparency</li>
                </ul>
              </div>
              
              <p className="text-orange-300 font-semibold text-sm md:text-base">
                Enhanced signals are opportunities with intelligent optimization, not guarantees. Trade responsibly.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size={isMobile ? "sm" : "default"} className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20">
                  <Info className="w-4 h-4 mr-2" />
                  View Enhanced Risk Notice
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-950 border-orange-500/30 max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-orange-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Enhanced Signal Risk Management
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300 space-y-3 text-sm">
                    <p>
                      Our enhanced AI signals include intelligent trade type optimization and risk level adaptation, 
                      creating more personalized trading opportunities based on your preferences.
                    </p>
                    <div className="bg-orange-900/20 border border-orange-500/20 rounded p-3">
                      <p className="text-orange-200 font-medium mb-2">Enhanced Features Include:</p>
                      <ul className="text-sm space-y-1 text-gray-300">
                        <li>✓ Trade type optimization (Scalp/Intraday/Swing/Position)</li>
                        <li>✓ Risk level adaptation (Conservative/Moderate/Aggressive)</li>
                        <li>✓ Asset class filtering for focused opportunities</li>
                        <li>✓ Strategy breakdown transparency</li>
                        <li>✓ Intelligent SL/TP adjustment based on trade style</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction className="bg-orange-600 hover:bg-orange-700">
                    I Understand Enhanced Features
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Manager - Hidden on Mobile */}
      {showWebhookManager && !isMobile && <WebhookManager />}

      {/* Strategy Breakdown Modal */}
      <StrategyBreakdownModal
        open={showBreakdown}
        onOpenChange={setShowBreakdown}
        breakdown={currentBreakdown}
        confidence={currentConfidence}
      />

      {/* System Status */}
      {militarySignals.length > 0 && (
        <Alert className="border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 glow-soft animate-section-load">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-400 font-zen-maru text-sm md:text-base">
            ⛩️ ENHANCED AASAKIRA SYSTEM OPERATIONAL - {militarySignals.length} Active Enhanced Signals | Auto-refresh: 5s intervals
            <div className="mt-1 text-xs text-green-300 font-noto">
              Enhanced strategic intelligence with trade type optimization and live price feeds
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
          <CardContent className="text-center py-8 md:py-12">
            <div className="relative mb-4 md:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full mx-auto flex items-center justify-center border border-pink-500/30 glow-soft">
                <Brain className="w-8 h-8 md:w-10 md:h-10 text-pink-400" />
              </div>
              <div className="absolute inset-0 bg-pink-400/10 rounded-full blur-xl" />
            </div>
            <h3 className="text-xl md:text-2xl font-zen-maru font-bold text-white mb-2">⛩️ ENHANCED SYSTEM STANDBY</h3>
            <p className="text-gray-400 mb-4 md:mb-6 max-w-md mx-auto font-shippori text-sm md:text-base px-4">
              Enhanced Multi-Intelligence Core awaiting deployment. Configure your preferred trade type and risk level for optimized signals.
            </p>
            <Button
              onClick={generateMilitarySignal}
              disabled={!canUseFeature('signals')}
              className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/50 hover:bg-pink-500/30 font-zen-maru font-bold px-6 md:px-8 py-2 md:py-3 glow-intense text-sm md:text-base"
            >
              <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              {canUseFeature('signals') ? 'ACTIVATE ENHANCED INTELLIGENCE' : 'UPGRADE FOR MORE SIGNALS'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Premium Upgrade Modal */}
      {showUpgrade && (
        <EnhancedPremiumUpgrade 
          open={showUpgrade} 
          onOpenChange={setShowUpgrade} 
        />
      )}
    </div>
  );
};

export default LiveSignalsDashboard;
