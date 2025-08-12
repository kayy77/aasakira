
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';

interface SignalLimits {
  canGenerateSignal: boolean;
  canViewSignals: boolean;
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
  
  // Fixed: Allow signal generation if user hasn't reached their limit yet
  const canGenerateSignal = isPremium || signalsUsed < dailyLimit;

  const checkAndIncrementSignal = async (): Promise<boolean> => {
    console.log('🔒 Checking signal limits:', { isPremium, signalsUsed, dailyLimit, canGenerateSignal });
    
    // For premium users, always allow
    if (isPremium) {
      console.log('✅ Premium user - unlimited signals');
      await incrementUsage('signals');
      return true;
    }

    // For free users, check if they have signals remaining
    if (signalsUsed >= dailyLimit) {
      console.log('❌ Signal generation blocked - FREE USER DAILY LIMIT REACHED');
      toast({
        title: "🔒 Daily Signal Limit Reached",
        description: `You can generate 1 signal every 24 hours. Your limit will reset tomorrow!`,
        variant: "destructive"
      });
      return false;
    }

    // Allow signal generation and increment usage
    try {
      await incrementUsage('signals');
      console.log('✅ Signal usage incremented successfully');
      
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
    canViewSignals: true, // Users can always view their generated signals
    signalsUsedToday: signalsUsed,
    dailyLimit,
    upgradeRequired: !canGenerateSignal && !isPremium,
    checkAndIncrementSignal
  };
};
