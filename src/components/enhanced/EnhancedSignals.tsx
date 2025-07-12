import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Zap, 
  Crown, 
  Target, 
  TrendingUp, 
  Brain,
  Swords,
  Trophy,
  Clock
} from 'lucide-react';
import TradingViewChart from '@/components/features/TradingViewChart';
import SwipeToTrade from '@/components/features/SwipeToTrade';
import UsageLimits from '@/components/features/UsageLimits';
import TraderLeaderboard from '@/components/features/TraderLeaderboard';
import EnhancedPremiumUpgrade from '@/components/enhanced/EnhancedPremiumUpgrade';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const EnhancedSignals = () => {
  const { user } = useAuth();
  const { isPremium, canUseFeature, incrementUsage } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Demo signal data
  const demoSignal = {
    id: 'signal-1',
    pair: 'EURUSD',
    direction: 'BUY' as const,
    confidence: 87,
    entry: 1.0845,
    stopLoss: 1.0825,
    takeProfit: 1.0885,
    reason: 'Smart money accumulation detected near key support. Institutional buying pressure increasing with divergence on RSI.',
    timeframe: '1H'
  };

  const generateSignal = async () => {
    if (!canUseFeature('signals') && !isPremium) {
      setShowUpgrade(true);
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI signal generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSignals([demoSignal]);
    incrementUsage('signals');
    setIsGenerating(false);
  };

  const handleTradeAction = (signalId: string, action: 'accept' | 'reject') => {
    console.log(`Trade ${action}ed:`, signalId);
    setSignals(signals.filter(s => s.id !== signalId));
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">AI Signal Generator</h1>
            <p className="text-gray-400">Elite trading signals powered by advanced AI</p>
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
              Analyzing Markets...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Generate AI Signal
            </>
          )}
        </Button>
      </div>

      {/* Usage Limits */}
      <UsageLimits onUpgrade={() => setShowUpgrade(true)} />

      {/* Live Chart */}
      <Card className="bg-black/40 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Live Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TradingViewChart symbol="FX:EURUSD" height="400" />
        </CardContent>
      </Card>

      {/* Active Signals */}
      {signals.length > 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-red-400" />
              Active Signals
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 ml-auto">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals.map((signal) => (
                <SwipeToTrade
                  key={signal.id}
                  signal={signal}
                  onTrade={handleTradeAction}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trader Leaderboard */}
        <TraderLeaderboard />

        {/* Combat Mode Preview */}
        <Card className="bg-black/40 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Swords className="h-5 w-5 text-red-400" />
              Combat Mode
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ml-auto">
                Beta
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Challenge other traders in real-time prediction battles. Test your skills and climb the warrior rankings.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">1v1 Battles</span>
                <Trophy className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Prediction Accuracy</span>
                <span className="text-green-400 font-bold">87.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Streak</span>
                <span className="text-blue-400 font-bold">5 wins</span>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
              <Swords className="mr-2 h-4 w-4" />
              Enter Combat Mode
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Premium Upgrade Modal */}
      <EnhancedPremiumUpgrade open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default EnhancedSignals;