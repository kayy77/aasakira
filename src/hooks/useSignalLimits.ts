
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
  const dailyLimit = isPremium ? 999 : 1; // STRICT: Only 1 signal per day for free users
  const signalsUsed = usageStats?.signals || 0;
  
  // STRICT CHECK: Free users can only generate if they haven't used any signals today
  const canGenerateSignal = isPremium || signalsUsed === 0;

  const checkAndIncrementSignal = async (): Promise<boolean> => {
    console.log('🔒 Checking signal limits:', { isPremium, signalsUsed, dailyLimit, canGenerateSignal });
    
    // STRICT enforcement for free users - block completely after first signal
    if (!isPremium && signalsUsed >= 1) {
      console.log('❌ Signal generation blocked - FREE USER DAILY LIMIT REACHED (1/day)');
      toast({
        title: "🔒 Daily Signal Limit Reached",
        description: `Free users get only 1 signal per day. You've already used yours! Upgrade to Premium for unlimited signals.`,
        variant: "destructive"
      });
      return false;
    }

    if (!canGenerateSignal) {
      console.log('❌ Signal generation blocked - general limit reached');
      toast({
        title: "🔒 Signal Generation Blocked",
        description: "You've reached your daily limit. Upgrade to Premium for unlimited access.",
        variant: "destructive"
      });
      return false;
    }

    try {
      await incrementUsage('signals');
      console.log('✅ Signal usage incremented successfully');
      
      // Show warning for free users that they've used their only signal
      if (!isPremium) {
        toast({
          title: "✅ Signal Generated!",
          description: "You've used your 1 daily free signal. Upgrade to Premium for unlimited access!",
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
