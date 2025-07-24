
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

export const useSignalLimits = (): SignalLimits => {
  const { user } = useAuth();
  const { subscription, usageStats, checkUsageLimit, incrementUsage } = useSubscription();
  const { toast } = useToast();
  const [signalsUsedToday, setSignalsUsedToday] = useState(0);

  const isPremium = subscription?.tier === 'premium';
  const dailyLimit = isPremium ? 999 : 1; // Unlimited for premium, 1 for free
  const signalsUsed = usageStats?.signals_generated || 0;
  const canGenerateSignal = isPremium || signalsUsed < dailyLimit;

  useEffect(() => {
    setSignalsUsedToday(signalsUsed);
  }, [signalsUsed]);

  const checkAndIncrementSignal = async (): Promise<boolean> => {
    if (!canGenerateSignal) {
      toast({
        title: "🔒 Signal Limit Reached",
        description: `You've used ${signalsUsed}/${dailyLimit} signals today. Upgrade to Premium for unlimited signals!`,
        variant: "destructive"
      });
      return false;
    }

    try {
      await incrementUsage('signals_generated');
      setSignalsUsedToday(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error incrementing signal usage:', error);
      return false;
    }
  };

  return {
    canGenerateSignal,
    signalsUsedToday,
    dailyLimit,
    upgradeRequired: !canGenerateSignal
  };
};
