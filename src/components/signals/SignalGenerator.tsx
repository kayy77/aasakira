
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Crown,
  Lock
} from 'lucide-react';
import { useSignalLimits } from '@/hooks/useSignalLimits';
import { useSubscription } from '@/contexts/SubscriptionContext';
import UpgradePrompt from '@/components/common/UpgradePrompt';
import { institutionalSignalEngine } from '@/services/institutionalSignalEngine';
import { useToast } from '@/hooks/use-toast';

interface SignalGeneratorProps {
  onSignalGenerated?: (signal: any) => void;
}

const SignalGenerator: React.FC<SignalGeneratorProps> = ({ onSignalGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { subscription } = useSubscription();
  const { canGenerateSignal, signalsUsedToday, dailyLimit, upgradeRequired, checkAndIncrementSignal } = useSignalLimits();
  const { toast } = useToast();

  const isPremium = subscription?.tier === 'premium';
  const usagePercentage = (signalsUsedToday / dailyLimit) * 100;

  const handleGenerateSignal = async () => {
    if (!canGenerateSignal) {
      setShowUpgradePrompt(true);
      return;
    }

    // Check and increment usage first
    const canProceed = await checkAndIncrementSignal();
    if (!canProceed) {
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🏛️ Generating institutional-grade signal...');
      console.log('🔍 DEBUG: Starting signal generation process...');
      
      // Generate signal with new institutional engine
      const signal = await institutionalSignalEngine.generateInstitutionalSignal();
      
      console.log('🔍 DEBUG: Signal generation completed. Result:', signal);
      
      // Handle different signal outcomes
      if (signal && signal.confidence >= 85 && signal.confluenceScore >= 7) {
        console.log('✅ High-quality institutional signal generated');
        onSignalGenerated?.(signal);
        
        toast({
          title: `🏛️ ${signal.institutionalGrade} Institutional Signal`,
          description: `${signal.type} ${signal.pair} - ${signal.confluenceScore}/10 confluence, ${signal.expectedWinRate}% win rate`,
        });
      } else if (signal) {
        console.log('⚠️ Lower-quality signal generated, but still valid');
        // Signal generated but below institutional standards
        onSignalGenerated?.(signal);
        
        toast({
          title: "⚠️ Signal Generated",
          description: `${signal.type} ${signal.pair} - Grade: ${signal.institutionalGrade}. Monitor carefully.`,
          variant: "destructive"
        });
      } else {
        console.log('❌ No signal generated - all filters rejected or validation failed');
        toast({
          title: "❌ No Institutional Signal",
          description: "Market conditions don't meet institutional standards. Fallback strategies blocked, validation filters active.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ Signal generation error:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      toast({
        title: "❌ Signal Generation Error",
        description: "Failed to generate enhanced signal. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Always reset loading state
      console.log('🔍 DEBUG: Resetting loading state');
      setIsGenerating(false);
    }
  };

  if (showUpgradePrompt && !canGenerateSignal) {
    return (
      <UpgradePrompt
        title="🔒 Signal Limit Reached"
        description="You've used your daily free signal. Upgrade for unlimited elite signals!"
        feature="unlimited signal generation"
        onClose={() => setShowUpgradePrompt(false)}
      />
    );
  }

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Institutional Signal Engine
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-400 border-purple-500/30">
              {signalsUsedToday}/{isPremium ? '∞' : dailyLimit}
            </Badge>
            {!isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Free
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Usage Progress */}
        {!isPremium && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Daily Usage</span>
              <span>{signalsUsedToday}/{dailyLimit}</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className="h-2"
            />
            {usagePercentage >= 80 && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Almost at daily limit!</span>
              </div>
            )}
          </div>
        )}

        {/* Generation Button */}
        <Button
          onClick={handleGenerateSignal}
          disabled={!canGenerateSignal || isGenerating}
          className={`w-full py-3 text-lg font-semibold ${
            canGenerateSignal 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <TrendingUp className="w-5 h-5 mr-2 animate-pulse" />
              Generating Institutional Signal...
            </>
          ) : !canGenerateSignal ? (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Daily Limit Reached
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Generate Institutional Signal
            </>
          )}
        </Button>

        {/* Upgrade CTA for Free Users */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
            <h4 className="text-white font-semibold mb-2">
              🚀 Want Unlimited Signals?
            </h4>
            <p className="text-gray-300 text-sm mb-3">
              Get unlimited institutional signals, order flow analysis, and advanced confluences.
            </p>
            <Button
              onClick={() => setShowUpgradePrompt(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignalGenerator;
