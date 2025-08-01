
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';

interface SignalLimits {
  canGenerateSignal: boolean;
  signalsUsedToday: number;
  dailyLimit: number;
  upgradeRequired: boolean;
}

export const useSignalLimits = (): SignalLimits & { checkAndIncrementSignal: () => Promise<boolean> } => {
  const { user } = useAuth();
  const { subscription, usageStats, incrementUsage } = useSubscription();
  const { toast } = useToast();

  const isPremium = subscription?.tier === 'premium';
  const dailyLimit = isPremium ? 999 : 1;
  const signalsUsed = usageStats?.signals || 0;
  
  // Fixed: Only block AFTER user has actually used their daily limit
  const canGenerateSignal = isPremium || signalsUsed < dailyLimit;

  const checkAndIncrementSignal = async (): Promise<boolean> => {
    console.log('🔒 Checking signal limits:', { isPremium, signalsUsed, dailyLimit, canGenerateSignal });
    
    // Block only if user has already used their daily limit
    if (!isPremium && signalsUsed >= dailyLimit) {
      console.log('❌ Signal generation blocked - FREE USER DAILY LIMIT REACHED (1/day)');
      toast({
        title: "🔒 Daily Signal Limit Reached",
        description: `Free users get 1 signal per day. You've already used yours! Upgrade to Premium for unlimited signals.`,
        variant: "destructive"
      });
      return false;
    }

    try {
      await incrementUsage('signals');
      console.log('✅ Signal usage incremented successfully');
      
      // Show upgrade prompt AFTER using the signal if this was their last free one
      if (!isPremium && signalsUsed + 1 >= dailyLimit) {
        toast({
          title: "✅ Signal Generated!",
          description: "You've used your daily free signal. Upgrade to Premium for unlimited access!",
          variant: "default"
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error incrementing signal usage:', error);
      toast({
        title: "Error",
        description: "Failed to track signal usage. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    canGenerateSignal,
    signalsUsedToday: signalsUsed,
    dailyLimit,
    upgradeRequired: !canGenerateSignal && !isPremium,
    checkAndIncrementSignal
  };
};
