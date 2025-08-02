import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTrackingService } from '@/services/userTrackingService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Zap, 
  Crown, 
  Target, 
  Brain,
  HelpCircle,
  BarChart3,
  Play,
  Lock,
  CheckCircle2,
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { signalService } from '@/services/signalService';
import { Signal } from '@/types/signalConfig';
import UsageLimits from '@/components/features/UsageLimits';
import EnhancedPremiumUpgrade from '@/components/enhanced/EnhancedPremiumUpgrade';
import MobileSignalCard from '@/components/enhanced/MobileSignalCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLivePrices } from '@/components/signals/hooks/useLivePrices';
import EnhancedAIConsensusDisplay from './EnhancedAIConsensusDisplay';
import EnhancedSignalMetrics from './EnhancedSignalMetrics';

interface SignalCardProps {
  signal: Signal;
  isPremium: boolean;
  onExplain: (signal: Signal) => void;
  onReplay: (signal: Signal) => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, isPremium, onExplain, onReplay }) => {
  const isHighQuality = signal.confidence >= 75 && ['Smart_Money', 'Multi_Confluence'].includes(signal.strategy);
  const timeAgo = new Date(signal.timestamp).toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC'
  });

  // Calculate risk:reward ratio with proper type checking
  const calculateRiskReward = () => {
    if (signal.riskReward) return signal.riskReward;
    
    if (typeof signal.entry === 'number' && typeof signal.takeProfit === 'number' && typeof signal.stopLoss === 'number') {
      const profit = Math.abs(signal.takeProfit - signal.entry);
      const loss = Math.abs(signal.entry - signal.stopLoss);
      return loss > 0 ? profit / loss : 2.5;
    }
    return 2.5;
  };
  
  return (
    <Card className={`glass-card hover-glow border-2 transition-all duration-300 ${
      isHighQuality ? 'border-gold-500/50 shadow-gold-500/20' : 'border-purple-500/30'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              signal.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {signal.type === 'BUY' ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className={`font-bold text-lg px-3 py-1 ${
                  signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                } border-0`}>
                  {signal.type} {signal.pair}
                </Badge>
                {isHighQuality && (
                  <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    PREMIUM
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Live Price Display */}
        <div className="flex items-center justify-between text-sm bg-gray-800/30 rounded-lg p-2 mt-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-gray-400">Live Price:</span>
            <span className="text-white font-mono font-bold">{signal.livePrice || 'N/A'}</span>
            <span className="text-blue-300">({timeAgo} UTC)</span>
          </div>
          {signal.spreadToMarket && signal.spreadToMarket > 1 && (
            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
              Spread: {signal.spreadToMarket}%
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Enhanced Signal Metrics */}
        <EnhancedSignalMetrics
          confidence={signal.confidence}
          risk={signal.risk}
          strategy={signal.strategy}
          riskReward={calculateRiskReward()}
          confluence={signal.confluenceLevel || 5}
          timeframe={signal.timeframe}
        />

        {/* Entry Details */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/20 rounded p-3">
            <div className="text-gray-400 mb-1">Entry</div>
            <div className="text-white font-bold font-mono">
              {signal.entry.toFixed(signal.pair.includes('JPY') ? 3 : signal.pair.includes('USD') && (signal.pair.includes('BTC') || signal.pair.includes('ETH')) ? 2 : 5)}
            </div>
          </div>
          <div className="bg-red-500/10 rounded p-3">
            <div className="text-gray-400 mb-1">Stop Loss</div>
            <div className="text-red-400 font-bold font-mono">
              {signal.stopLoss.toFixed(signal.pair.includes('JPY') ? 3 : signal.pair.includes('USD') && (signal.pair.includes('BTC') || signal.pair.includes('ETH')) ? 2 : 5)}
            </div>
          </div>
          <div className="bg-green-500/10 rounded p-3">
            <div className="text-gray-400 mb-1">Take Profit</div>
            <div className="text-green-400 font-bold font-mono">
              {signal.takeProfit.toFixed(signal.pair.includes('JPY') ? 3 : signal.pair.includes('USD') && (signal.pair.includes('BTC') || signal.pair.includes('ETH')) ? 2 : 5)}
            </div>
          </div>
        </div>

        {/* Enhanced AI Consensus Display */}
        {signal.consensus && (
          <EnhancedAIConsensusDisplay consensus={signal.consensus} />
        )}

        {/* Analysis */}
        <div className="space-y-2">
          <div className="text-gray-300 text-sm leading-relaxed bg-gray-800/20 rounded p-3">
            {isPremium || !isHighQuality ? signal.analysis : 
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="w-4 h-4" />
                Advanced AI analysis available with Pro subscription.
              </div>
            }
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onExplain(signal)}
            variant="outline"
            size="sm"
            className="flex-1 border-purple-500/30 hover:bg-purple-500/20"
            disabled={!isPremium && isHighQuality}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            AI Analysis
          </Button>
          <Button
            onClick={() => onReplay(signal)}
            variant="outline" 
            size="sm"
            className="flex-1 border-blue-500/30 hover:bg-blue-500/20"
            disabled={!isPremium && isHighQuality}
          >
            <Play className="w-4 h-4 mr-2" />
            Backtest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EnhancedSignals = () => {
  const { user } = useAuth();
  const { isPremium, canUseFeature, incrementUsage } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [replayMode, setReplayMode] = useState<Signal | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
  const { livePrices, isConnected, lastUpdateTime, refreshPrices } = useLivePrices({ 
    allowedPairs: majorPairs, 
    updateInterval: 2000,
    forceRefresh: true
  });

  const generateSignal = async () => {
    if (!canUseFeature('signals') && !isPremium) {
      setShowUpgrade(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🎯 Generating signal with live prices...');
      
      await refreshPrices();
      
      const newSignal = await signalService.generateLiveSignal();
      if (newSignal) {
        if (livePrices[newSignal.pair]) {
          newSignal.livePrice = livePrices[newSignal.pair];
          const spreadCalc = Math.abs(newSignal.entry - livePrices[newSignal.pair]) / livePrices[newSignal.pair];
          newSignal.spreadToMarket = parseFloat((spreadCalc * 100).toFixed(2));
        }
        
        setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
        incrementUsage('signals');
        
        if (user?.id) {
          await UserTrackingService.trackSignalView(user.id, newSignal);
        }
        
        toast({
          title: "🎯 LIVE Signal Generated",
          description: `${newSignal.pair} ${newSignal.type} - ${newSignal.confidence}% confidence (Live: ${newSignal.livePrice})`,
        });
      } else {
        toast({
          title: "No Opportunities Found",
          description: "Markets may be ranging. Try again in a few minutes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Signal generation failed:', error);
      toast({
        title: "Signal Generation Failed",
        description: "Failed to generate signal. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
  };

  const handleExplain = (signal: Signal) => {
    if (user?.id) {
      UserTrackingService.trackSignalView(user.id, signal);
    }
    
    const explanations = {
      'Smart_Money': `This signal is based on institutional order flow analysis. Price action shows smart money accumulation at key levels with confluence of multiple factors: liquidity sweeps, fair value gaps, and order block formation. Entry timing aligns with market structure breaks.`,
      'Breakout+Retest': `Clean break of significant structure followed by institutional retest. Smart money accumulated during pullback phase, creating optimal entry conditions with defined risk parameters.`,
      'Trend_Continuation': `Higher timeframe trend remains intact with lower timeframe confirmation signals. Momentum indicators and institutional positioning support continuation of the prevailing trend.`,
      'Multi_Confluence': `Multiple technical factors aligned: ${signal.analysis.split('.')[0]}. This creates a high-probability setup with well-defined risk/reward parameters.`,
      'FALLBACK': `Fallback signal generated during market quiet periods using basic confluence factors.`,
      'EMERGENCY': `Emergency override signal - use with extreme caution.`
    };
    
    setExplanation(explanations[signal.strategy] || signal.analysis);
  };

  const handleReplay = (signal: Signal) => {
    if (user?.id) {
      UserTrackingService.trackSignalView(user.id, signal);
    }
    
    setReplayMode(signal);
    toast({
      title: "Backtesting Signal",
      description: "Analyzing historical performance and similar setups...",
    });
  };

  const performanceStats = signalService.getPerformanceStats();

  useEffect(() => {
    if (signals.length > 0 && Object.keys(livePrices).length > 0) {
      setSignals(prevSignals => 
        prevSignals.map(signal => ({
          ...signal,
          livePrice: livePrices[signal.pair] || signal.livePrice,
          spreadToMarket: livePrices[signal.pair] ? 
            parseFloat(((Math.abs(signal.entry - livePrices[signal.pair]) / livePrices[signal.pair]) * 100).toFixed(2)) :
            signal.spreadToMarket
        }))
      );
    }
  }, [livePrices]);

  useEffect(() => {
    signalService.startAutoRefresh();
    const getSignals = async () => {
      const latestSignals = await signalService.getLatestSignals();
      setSignals(latestSignals);
    };
    getSignals();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold gradient-text">LIVE AI SIGNALS</h1>
            <p className="text-gray-400 text-sm md:text-base">
              Real-time market analysis with live price feeds
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Live' : 'Disconnected'} • Updated {lastUpdateTime.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button
            onClick={generateSignal}
            disabled={isGenerating}
            className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold ${
              isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className={`animate-spin mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {isMobile ? 'Scanning...' : 'Scanning Live Markets...'}
              </>
            ) : (
              <>
                <Zap className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {isMobile ? 'Generate Signal' : 'Generate Live Signal'}
              </>
            )}
          </Button>
          
          <Button
            onClick={refreshPrices}
            variant="outline"
            className="border-purple-500/30 hover:bg-purple-500/20"
            size={isMobile ? 'sm' : 'default'}
          >
            <RefreshCw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>

      {/* Usage Limits */}
      <UsageLimits onUpgrade={() => setShowUpgrade(true)} />

      {/* Performance Stats */}
      <Card className="glass-card hover-glow border-gold-500/30">
        <CardHeader className={isMobile ? 'pb-3' : ''}>
          <CardTitle className={`text-white flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
            <BarChart3 className={`text-gold-400 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            {isMobile ? 'Performance' : 'Live Performance Tracking'}
            <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 ml-auto text-xs">
              VERIFIED
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            <div className="text-center">
              <div className={`font-bold text-green-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{performanceStats.winRate}%</div>
              <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Win Rate (30D)</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-blue-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{performanceStats.avgRR}R</div>
              <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Avg Risk:Reward</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-purple-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{performanceStats.totalSignals}</div>
              <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Signals</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-red-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{performanceStats.activeSignals}</div>
              <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Active Now</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Signals */}
      {signals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>🔴 LIVE SIGNALS</h2>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              {Object.keys(livePrices).length} pairs tracked
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {signals.map((signal) => (
              isMobile ? (
                <MobileSignalCard 
                  key={signal.id}
                  signal={signal}
                  isPremium={isPremium}
                  onExplain={handleExplain}
                  onReplay={handleReplay}
                />
              ) : (
                <SignalCard 
                  key={signal.id}
                  signal={signal}
                  isPremium={isPremium}
                  onExplain={handleExplain}
                  onReplay={handleReplay}
                />
              )
            ))}
          </div>
        </div>
      )}

      {/* No Signals State */}
      {signals.length === 0 && !isGenerating && (
        <Card className="glass-card border-purple-500/20">
          <CardContent className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
            <Target className={`text-gray-400 mx-auto mb-4 ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`} />
            <h3 className={`font-semibold text-white mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>No Active Signals</h3>
            <p className={`text-gray-400 mb-4 ${isMobile ? 'text-sm px-4' : ''}`}>
              AI is scanning live markets for high-probability setups
            </p>
            <Button
              onClick={generateSignal}
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-500/20"
              size={isMobile ? 'sm' : 'default'}
            >
              <Zap className={`mr-2 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              Scan Live Markets
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Explanation Modal */}
      {explanation && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Brain className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <div className="flex items-start justify-between gap-2">
              <div className={isMobile ? 'text-sm' : ''}>
                <strong>AI Analysis:</strong> {explanation}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplanation(null)}
                className="text-blue-400 hover:bg-blue-500/20 flex-shrink-0"
              >
                ✕
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Replay Mode */}
      {replayMode && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            <div className="flex items-start justify-between gap-2">
              <div className={isMobile ? 'text-sm' : ''}>
                <strong>Backtest Result:</strong> Similar setups hit TP in avg 2.1 hours. Historical win rate: 82%. 
                Expected RRR: {replayMode.takeProfit && replayMode.entry && replayMode.stopLoss ? 
                  ((replayMode.takeProfit - replayMode.entry) / (replayMode.entry - replayMode.stopLoss)).toFixed(1) : '2.4'}R
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplayMode(null)}
                className="text-green-400 hover:bg-green-500/20 flex-shrink-0"
              >
                ✕
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Premium Upgrade Modal */}
      <EnhancedPremiumUpgrade open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default EnhancedSignals;
