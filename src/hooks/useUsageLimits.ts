import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UsageLimitResult {
  allowed: boolean;
  is_premium: boolean;
  remaining: number;
  limit?: number;
}

interface UsageLimitsConfig {
  signals: number;
  setupScans: number;
  chartAnalysis: number;
}

const FREE_LIMITS: UsageLimitsConfig = {
  signals: 1,
  setupScans: 1,
  chartAnalysis: 3,
};

export function useUsageLimits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);

  const checkAndIncrementUsage = useCallback(async (
    feature: 'signals' | 'setupScans' | 'chartAnalysis'
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature",
        variant: "destructive",
      });
      return false;
    }

    setChecking(true);
    try {
      const limit = FREE_LIMITS[feature];
      
      const { data, error } = await supabase.rpc('check_and_increment_usage', {
        p_user_id: user.id,
        p_feature: feature,
        p_daily_limit: limit
      });

      if (error) {
        console.error('Error checking usage:', error);
        throw error;
      }

      const result = data as unknown as UsageLimitResult;

      if (!result.allowed) {
        toast({
          title: "Daily Limit Reached",
          description: `You've reached your daily limit of ${result.limit} ${feature}. Upgrade to Premium for unlimited access!`,
          variant: "destructive",
        });
        return false;
      }

      if (!result.is_premium && result.remaining === 0) {
        toast({
          title: "Last Free Use Today",
          description: `This was your last free ${feature} for today. Consider upgrading to Premium for unlimited access!`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error checking usage limits:', error);
      toast({
        title: "Error",
        description: "Failed to check usage limits. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setChecking(false);
    }
  }, [user, toast]);

  const checkUsageOnly = useCallback(async (
    feature: 'signals' | 'setupScans' | 'chartAnalysis'
  ): Promise<UsageLimitResult | null> => {
    if (!user) return null;

    try {
      // Get today's usage without incrementing
      const { data, error } = await supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('usage_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (error) throw error;

      const currentUsage = data?.usage_count || 0;
      const limit = FREE_LIMITS[feature];

      // Check if premium
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      const isPremium = subscription?.status === 'active';

      return {
        allowed: isPremium || currentUsage < limit,
        is_premium: isPremium,
        remaining: isPremium ? -1 : Math.max(0, limit - currentUsage),
        limit: isPremium ? undefined : limit
      };
    } catch (error) {
      console.error('Error checking usage:', error);
      return null;
    }
  }, [user]);

  return {
    checkAndIncrementUsage,
    checkUsageOnly,
    checking,
    limits: FREE_LIMITS
  };
}