
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
import { safeInstitutionalSignalEngine } from '@/services/safeInstitutionalSignalEngine';
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
    console.log('🔍 SIGNAL GENERATOR: Starting signal generation...');
    
    if (!canGenerateSignal) {
      console.log('❌ Cannot generate signal - limit reached');
      setShowUpgradePrompt(true);
      return;
    }

    // Check and increment usage first
    const canProceed = await checkAndIncrementSignal();
    if (!canProceed) {
      console.log('❌ Cannot proceed - usage check failed');
      return;
    }

    setIsGenerating(true);
    console.log('🔄 Loading state set to true');
    
    try {
      console.log('🏛️ About to call institutionalSignalEngine...');
      
      // Add a timeout to prevent infinite hanging
      const signalPromise = safeInstitutionalSignalEngine.generateInstitutionalSignal();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signal generation timeout after 30 seconds')), 30000)
      );
      
      const signal = await Promise.race([signalPromise, timeoutPromise]) as any;
      
      console.log('✅ Signal generation completed successfully. Signal:', !!signal);
      
      if (signal) {
        console.log('📊 Signal details:', {
          pair: signal.pair,
          type: signal.type,
          confidence: signal.confidence,
          confluenceScore: signal.confluenceScore,
          grade: signal.institutionalGrade
        });
        
        onSignalGenerated?.(signal);
        
        toast({
          title: `🏛️ ${signal.institutionalGrade || 'B'} Signal Generated`,
          description: `${signal.type} ${signal.pair} - Confidence: ${signal.confidence || 75}%`,
        });
      } else {
        console.log('❌ No signal returned from engine');
        toast({
          title: "❌ No Signal Generated",
          description: "Market conditions don't meet current standards. Try again in a few minutes.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in signal generation:');
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Create fallback signal to prevent complete failure
      const fallbackSignal = {
        id: `fallback_${Date.now()}`,
        pair: 'EURUSD',
        type: 'BUY' as const,
        confidence: 70,
        confluenceScore: 6,
        institutionalGrade: 'B' as const,
        expectedWinRate: 65,
        timestamp: new Date().toISOString(),
        justification: 'Fallback signal generated due to technical issue',
        signalStrength: 'MODERATE' as const,
        tags: ['fallback'],
        warnings: ['This is a fallback signal'],
        validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('🚨 Providing fallback signal to prevent crash');
      onSignalGenerated?.(fallbackSignal);
      
      toast({
        title: "⚠️ Technical Issue - Fallback Signal",
        description: `Fallback signal provided: ${fallbackSignal.type} ${fallbackSignal.pair}`,
        variant: "destructive"
      });
    } finally {
      console.log('🔄 Resetting loading state to false');
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
