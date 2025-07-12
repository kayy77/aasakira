
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

interface SubscriptionContextType {
  isPremium: boolean;
  dailyLimits: DailyLimits;
  usageToday: UsageData;
  incrementUsage: (type: keyof Omit<UsageData, 'lastReset'>) => void;
  canUseFeature: (type: keyof Omit<UsageData, 'lastReset'>) => boolean;
  getRemainingUsage: (type: keyof Omit<UsageData, 'lastReset'>) => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_LIMITS: DailyLimits = {
  signals: 2,
  memeCoins: 3,
  aiMentorMessages: 10,
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, incrementUsage, canUseFeature, getRemainingUsage } = useAuth();

  const isPremium = user?.role === 'premium' || false;

  // Map auth context usage to subscription context format
  const usageToday: UsageData = {
    signals: user?.aiSignalsUsedToday || 0,
    memeCoins: user?.memeScansUsedToday || 0,
    aiMentorMessages: user?.mentorMessagesUsedToday || 0,
    lastReset: user?.resetAt || new Date().toISOString(),
  };

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
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
