
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

interface DailyLimits {
  signals: number;
  memeCoins: number;
  aiMentorMessages: number;
}

interface UsageData {
  signals: number;
  memeCoins: number;
  aiMentorMessages: number;
  lastReset: string;
}

interface Subscription {
  tier: 'free' | 'premium';
  status: string;
}

interface UsageStats {
  mentor_messages: number;
  signals: number;
  meme_scans: number;
}

interface SubscriptionContextType {
  isPremium: boolean;
  isSubscribed: boolean;
  subscription?: Subscription;
  usageStats?: UsageStats;
  dailyLimits: DailyLimits;
  usageToday: UsageData;
  incrementUsage: (type: keyof Omit<UsageData, 'lastReset'>) => void;
  canUseFeature: (type: keyof Omit<UsageData, 'lastReset'>) => boolean;
  getRemainingUsage: (type: keyof Omit<UsageData, 'lastReset'>) => number;
  getUsagePercentage: (type: keyof Omit<UsageData, 'lastReset'>) => number;
  getTimeUntilReset: () => string;
  checkUsageLimit: (type: keyof Omit<UsageData, 'lastReset'>) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_LIMITS: DailyLimits = {
  signals: 2,
  memeCoins: 2,
  aiMentorMessages: 3,
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, incrementUsage, canUseFeature, getRemainingUsage } = useAuth();

  const isPremium = user?.role === 'premium' || false;
  const isSubscribed = isPremium;

  const subscription: Subscription = {
    tier: isPremium ? 'premium' : 'free',
    status: isPremium ? 'active' : 'inactive'
  };

  const usageStats: UsageStats = {
    mentor_messages: user?.mentorMessagesUsedToday || 0,
    signals: user?.aiSignalsUsedToday || 0,
    meme_scans: user?.memeScansUsedToday || 0,
  };

  const usageToday: UsageData = {
    signals: user?.aiSignalsUsedToday || 0,
    memeCoins: user?.memeScansUsedToday || 0,
    aiMentorMessages: user?.mentorMessagesUsedToday || 0,
    lastReset: user?.resetAt || new Date().toISOString(),
  };

  const getUsagePercentage = (type: keyof Omit<UsageData, 'lastReset'>): number => {
    if (isPremium) return 0;
    const used = usageToday[type];
    const limit = FREE_LIMITS[type];
    return Math.min((used / limit) * 100, 100);
  };

  const getTimeUntilReset = (): string => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
    nextMidnight.setUTCHours(0, 0, 0, 0);
    
    const diff = nextMidnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const checkUsageLimit = (type: keyof Omit<UsageData, 'lastReset'>): boolean => {
    if (isPremium) return true;
    return usageToday[type] < FREE_LIMITS[type];
  };

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
      isSubscribed,
      subscription,
      usageStats,
      dailyLimits: FREE_LIMITS,
      usageToday,
      incrementUsage: (type) => {
        const mapping = {
          signals: 'signals' as const,
          memeCoins: 'memeScans' as const,
          aiMentorMessages: 'mentorMessages' as const,
        };
        incrementUsage(mapping[type]);
      },
      canUseFeature: (type) => {
        const mapping = {
          signals: 'signals' as const,
          memeCoins: 'memeScans' as const,
          aiMentorMessages: 'mentorMessages' as const,
        };
        return canUseFeature(mapping[type]);
      },
      getRemainingUsage: (type) => {
        const mapping = {
          signals: 'signals' as const,
          memeCoins: 'memeScans' as const,
          aiMentorMessages: 'mentorMessages' as const,
        };
        return getRemainingUsage(mapping[type]);
      },
      getUsagePercentage,
      getTimeUntilReset,
      checkUsageLimit,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
