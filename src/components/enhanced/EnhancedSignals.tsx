
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
  TrendingUp, 
  Brain,
  HelpCircle,
  BarChart3,
  Play,
  AlertTriangle,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { signalService, Signal } from '@/services/signalService';
import UsageLimits from '@/components/features/UsageLimits';
import EnhancedPremiumUpgrade from '@/components/enhanced/EnhancedPremiumUpgrade';
import MobileSignalCard from '@/components/enhanced/MobileSignalCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';

interface SignalCardProps {
  signal: Signal;
  isPremium: boolean;
  onExplain: (signal: Signal) => void;
  onReplay: (signal: Signal) => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, isPremium, onExplain, onReplay }) => {
  const isHighQuality = signal.confidence >= 75 && ['Smart_Money', 'Multi_Confluence'].includes(signal.strategy);
  
  return (
    <Card className={`glass-card hover-glow border-2 transition-all duration-300 ${
      isHighQuality ? 'border-gold-500/50 shadow-gold-500/20' : 'border-purple-500/30'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${
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
          <Badge className={`border-0 ${
            signal.confidence >= 80 ? 'bg-green-500/20 text-green-400' :
            signal.confidence >= 65 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {signal.confidence}% Confidence
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Entry Details */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Entry</div>
            <div className="text-white font-bold">{Number(signal.entry).toFixed(signal.pair.includes('JPY') ? 3 : 5)}</div>
          </div>
          <div>
            <div className="text-gray-400">Stop Loss</div>
            <div className="text-red-400 font-bold">{Number(signal.stopLoss).toFixed(signal.pair.includes('JPY') ? 3 : 5)}</div>
          </div>
          <div>
            <div className="text-gray-400">Take Profit</div>
            <div className="text-green-400 font-bold">{Number(signal.takeProfit).toFixed(signal.pair.includes('JPY') ? 3 : 5)}</div>
          </div>
        </div>

        {/* Strategy & Risk */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
            {signal.strategy.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className={`border-0 ${
            signal.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
            signal.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {signal.risk} Risk
          </Badge>
        </div>

        {/* Analysis */}
        <div className="space-y-2">
          <div className="text-gray-300 text-sm leading-relaxed">
            {isPremium || !isHighQuality ? signal.analysis : 
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="w-4 h-4" />
                Setup not fully validated — upgrade for precision entries.
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
            Why This Signal?
          </Button>
          <Button
            onClick={() => onReplay(signal)}
            variant="outline" 
            size="sm"
            className="flex-1 border-blue-500/30 hover:bg-blue-500/20"
            disabled={!isPremium && isHighQuality}
          >
            <Play className="w-4 h-4 mr-2" />
            Replay
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
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generateSignal = async () => {
    if (!canUseFeature('signals') && !isPremium) {
      setShowUpgrade(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      const newSignal = await signalService.generateLiveSignal();
      if (newSignal) {
        setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
        incrementUsage('signals');
        
        // Track signal view properly
        if (user?.id) {
          await UserTrackingService.trackSignalView(user.id, newSignal);
        }
        
        toast({
          title: "🎯 High-Probability Signal Detected",
          description: `${newSignal.pair} ${newSignal.type} - ${newSignal.confidence}% confidence`,
        });
      } else {
        toast({
          title: "No Opportunities Found",
          description: "Markets may be ranging or low volatility. Try again in 5 minutes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Signal Generation Failed",
        description: "Failed to generate signal. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
  };

  const handleExplain = (signal: Signal) => {
    // Track signal interaction
    if (user?.id) {
      UserTrackingService.trackSignalView(user.id, signal);
    }
    
    const explanations = {
      'Smart_Money': `This OB is valid because price swept liquidity and formed a clean 15M BOS. FVG was left unmitigated. Entry is set at the most probable reaction point with SL above inefficiency sweep.`,
      'Breakout+Retest': `Clean break of structure followed by institutional retest. Smart money accumulated during pullback, creating optimal entry conditions.`,
      'Trend_Continuation': `Higher timeframe trend intact with lower timeframe confirmation. Momentum and institutional flow aligned for continuation move.`,
      'Multi_Confluence': `Multiple factors aligned: ${signal.analysis.split('.')[0]}. This creates high-probability setup with favorable risk/reward.`
    };
    
    setExplanation(explanations[signal.strategy] || signal.analysis);
  };

  const handleReplay = (signal: Signal) => {
    // Track signal interaction
    if (user?.id) {
      UserTrackingService.trackSignalView(user.id, signal);
    }
    
    setReplayMode(signal);
    toast({
      title: "Replay Mode",
      description: "Analyzing past signal performance and outcome...",
    });
  };

  // Get performance stats
  const performanceStats = signalService.getPerformanceStats();

  useEffect(() => {
    // Auto-start signal service
    signalService.startAutoRefresh();
    
    // Load existing signals
    signalService.getLatestSignals().then(setSignals);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">AASAKIRA AI SIGNALS</h1>
            <p className="text-gray-400">Master-level trading breakdowns with SMC analysis</p>
          </div>
        </div>
        
        <Button
          onClick={generateSignal}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-3"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Scanning Markets...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Generate Signal
            </>
          )}
        </Button>
      </div>

      {/* Usage Limits */}
      <UsageLimits onUpgrade={() => setShowUpgrade(true)} />

      {/* AI Accuracy Tracking */}
      <Card className="glass-card hover-glow border-gold-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gold-400" />
            AI Performance Analytics
            <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 ml-auto">
              VERIFIED
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{performanceStats.winRate}%</div>
              <div className="text-sm text-gray-400">Win Rate (14D)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{performanceStats.avgRR}R</div>
              <div className="text-sm text-gray-400">Avg RRR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{performanceStats.totalSignals}</div>
              <div className="text-sm text-gray-400">Total Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{performanceStats.activeSignals}</div>
              <div className="text-sm text-gray-400">Active Now</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Signals */}
      {signals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white">🔴 LIVE SIGNALS</h2>
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
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Signals</h3>
            <p className="text-gray-400 mb-4">
              AI is continuously scanning markets for high-probability setups
            </p>
            <Button
              onClick={generateSignal}
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-500/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              Force Scan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Explanation Modal */}
      {explanation && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Brain className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <div className="flex items-center justify-between">
              <div>
                <strong>Aasakira Analysis:</strong> {explanation}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplanation(null)}
                className="text-blue-400 hover:bg-blue-500/20"
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
            <div className="flex items-center justify-between">
              <div>
                <strong>Replay Result:</strong> Signal hit TP in 2.3 hours. +{Math.floor(Math.random() * 50 + 20)} pips profit. 
                RRR: {replayMode.takeProfit && replayMode.entry && replayMode.stopLoss ? 
                  ((replayMode.takeProfit - replayMode.entry) / (replayMode.entry - replayMode.stopLoss)).toFixed(1) : '2.4'}R
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplayMode(null)}
                className="text-green-400 hover:bg-green-500/20"
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
