
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
  const dailyLimit = isPremium ? 999 : 1; // Strict 1 signal per day for free users
  const signalsUsed = usageStats?.signals || 0;
  const canGenerateSignal = isPremium || signalsUsed < dailyLimit;

  const checkAndIncrementSignal = async (): Promise<boolean> => {
    console.log('🔒 Checking signal limits:', { isPremium, signalsUsed, dailyLimit, canGenerateSignal });
    
    // Strict enforcement for free users
    if (!isPremium && signalsUsed >= dailyLimit) {
      console.log('❌ Signal generation blocked - FREE USER DAILY LIMIT REACHED');
      toast({
        title: "🔒 Daily Signal Limit Reached",
        description: `Free users get only ${dailyLimit} signal per day. You've used ${signalsUsed}/${dailyLimit}. Upgrade to Premium for unlimited signals!`,
        variant: "destructive"
      });
      return false;
    }

    if (!canGenerateSignal) {
      console.log('❌ Signal generation blocked - general limit reached');
      toast({
        title: "🔒 Signal Generation Blocked",
        description: "Signal generation is currently not available. Please try again later.",
        variant: "destructive"
      });
      return false;
    }

    try {
      await incrementUsage('signals');
      console.log('✅ Signal usage incremented successfully');
      
      // Show warning if approaching limit (for free users)
      if (!isPremium && signalsUsed + 1 >= dailyLimit) {
        toast({
          title: "⚠️ Daily Limit Reached",
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
