
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
  
  // Fix: Allow free users to use their daily signal properly
  const canGenerateSignal = isPremium || signalsUsed < dailyLimit;

  const checkAndIncrementSignal = async (): Promise<boolean> => {
    console.log('🔒 Checking signal limits:', { isPremium, signalsUsed, dailyLimit, canGenerateSignal });
    
    // Fixed logic: Only block after user has actually used their daily limit
    if (!isPremium && signalsUsed >= dailyLimit) {
      console.log('❌ Signal generation blocked - FREE USER DAILY LIMIT REACHED (1/day)');
      toast({
        title: "🔒 Daily Signal Limit Reached",
        description: `Free users get 1 signal per day. You've already used yours! Upgrade to Premium for unlimited signals.`,
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
      
      // Only show limit warning AFTER using the signal, not before
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
