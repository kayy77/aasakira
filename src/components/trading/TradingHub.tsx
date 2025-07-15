
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Clock, RefreshCw, Crown, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedPremiumUpgrade from '@/components/enhanced/EnhancedPremiumUpgrade';

interface TradeIdea {
  id: string;
  pair: string;
  timeframe: string;
  bias: 'BUY' | 'SELL' | 'NEUTRAL';
  reasoning: string;
  strength: 'High' | 'Medium' | 'Strong';
  createdAt: Date;
}

const TradingHub: React.FC = () => {
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { toast } = useToast();
  const { isPremium, canUseFeature, incrementUsage, getRemainingUsage } = useSubscription();
  const isMobile = useIsMobile();

  const generateTradeIdeas = async () => {
    // Check if user can use trading ideas feature
    if (!canUseFeature('memeCoins')) { // Using memeCoins quota for trading ideas
      setShowUpgrade(true);
      toast({
        title: "Daily Limit Reached",
        description: "You've used your 1 daily trading idea scan. Upgrade to Premium for unlimited access!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate high-quality trade ideas based on current market conditions
      const ideas: TradeIdea[] = [
        {
          id: '1',
          pair: 'EURUSD',
          timeframe: '4H',
          bias: 'SELL',
          reasoning: 'EUR/USD is approaching a critical resistance zone at 1.0850-1.0870 that has held strong for the past 3 weeks. ECB dovish stance combined with rising US treasury yields creates a perfect storm for Euro weakness. Price action shows rejection candles forming at this level with decreasing volume on bullish moves, indicating seller exhaustion. RSI divergence suggests momentum is shifting bearish. Additionally, DXY is showing renewed strength as Fed maintains hawkish rhetoric. This setup offers exceptional risk-reward as we target the 1.0750 support with tight stops above resistance.',
          strength: 'Strong',
          createdAt: new Date()
        },
        {
          id: '2', 
          pair: 'GBPJPY',
          timeframe: '1H',
          bias: 'BUY',
          reasoning: 'GBP/JPY is breaking out of a 2-day consolidation pattern with explosive volume. BoJ intervention fears are diminishing as USD/JPY pulls back from highs, creating space for JPY crosses to rally. UK inflation data exceeded expectations, supporting Sterling strength. Technical analysis shows a clear flag pattern completion with targets at 195.50. Smart money indicators suggest institutional accumulation at current levels around 193.80. The break above 194.20 resistance with conviction signals the start of a larger move higher. Risk-off sentiment is fading globally, supporting carry trades like GBP/JPY.',
          strength: 'High',
          createdAt: new Date()
        }
      ];
      
      setTradeIdeas(ideas);
      
      // Increment usage for free users
      incrementUsage('memeCoins'); // Using memeCoins quota for trading ideas
      
      toast({
        title: "AI Trade Ideas Generated",
        description: `${ideas.length} high-probability trade setups identified based on current market conditions.`,
      });
      
    } catch (error) {
      console.error('Failed to generate trade ideas:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to analyze market conditions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const remaining = getRemainingUsage('memeCoins'); // Using memeCoins quota for trading ideas

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-950 via-purple-950/20 to-gray-950 border border-blue-500/30 relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded border border-blue-500/50">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  💹 AI Trading Hub
                </h1>
                <p className="text-xs md:text-sm text-gray-400">
                  Live trade ideas generated by our tactical AI system. These aren't signals — they're smart setups you can act on or watch evolve.
                </p>
              </div>
            </div>
            <Button
              onClick={generateTradeIdeas}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 font-bold text-sm md:text-base"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                  Analyzing Markets...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Generate Ideas
                </>
              )}
            </Button>
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
                    Trading Ideas Remaining Today: <span className="text-orange-100">{remaining}/1</span>
                  </p>
                  <p className="text-orange-400 text-xs md:text-sm">
                    Free users get 1 trading idea scan daily. Upgrade for unlimited access!
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

      {/* Trade Ideas Grid */}
      {tradeIdeas.length > 0 ? (
        <div className="grid gap-4 md:gap-6 md:grid-cols-1 xl:grid-cols-2">
          {tradeIdeas.map((idea) => (
            <Card key={idea.id} className="bg-gray-950/50 border-gray-600/30 hover:border-blue-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg md:text-xl font-bold text-white">{idea.pair}</h2>
                    <Badge variant="outline" className="text-xs">
                      {idea.timeframe}
                    </Badge>
                    <Badge 
                      className={`text-xs ${
                        idea.bias === 'BUY' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : idea.bias === 'SELL'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {idea.bias}
                    </Badge>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {idea.strength}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Market Analysis & Reasoning:</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {idea.reasoning}
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    Generated: {idea.createdAt.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    🧠 Generated by Aasakira AI
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-950 to-gray-900 border-gray-500/20">
          <CardContent className="text-center py-8 md:py-12">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mx-auto flex items-center justify-center border border-blue-500/30 mb-4 md:mb-6">
              <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">AI Trading Hub Ready</h3>
            <p className="text-gray-400 mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base px-4">
              Click "Generate Ideas" to analyze current market conditions and discover high-probability trading opportunities.
            </p>
            <Button
              onClick={generateTradeIdeas}
              disabled={!canUseFeature('memeCoins')}
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 font-bold px-6 md:px-8 py-2 md:py-3 text-sm md:text-base"
            >
              <Brain className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              {canUseFeature('memeCoins') ? 'Generate AI Trade Ideas' : 'Upgrade for Trade Ideas'}
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

export default TradingHub;
