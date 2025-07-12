
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  incrementUsage: (type: keyof UsageData) => void;
  canUseFeature: (type: keyof UsageData) => boolean;
  getRemainingUsage: (type: keyof UsageData) => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_LIMITS: DailyLimits = {
  signals: 2,
  memeCoins: 2,
  aiMentorMessages: 10,
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData>({
    signals: 0,
    memeCoins: 0,
    aiMentorMessages: 0,
    lastReset: new Date().toDateString(),
  });

  const isPremium = user?.isPremium || false;

  // Reset usage daily
  useEffect(() => {
    const today = new Date().toDateString();
    if (usage.lastReset !== today) {
      setUsage({
        signals: 0,
        memeCoins: 0,
        aiMentorMessages: 0,
        lastReset: today,
      });
    }
  }, [usage.lastReset]);

  // Load usage from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedUsage = localStorage.getItem(`aasakira_usage_${user.id}`);
      if (savedUsage) {
        try {
          const parsedUsage = JSON.parse(savedUsage);
          setUsage(parsedUsage);
        } catch (error) {
          console.error('Error parsing saved usage:', error);
        }
      }
    }
  }, [user]);

  // Save usage to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`aasakira_usage_${user.id}`, JSON.stringify(usage));
    }
  }, [usage, user]);

  const incrementUsage = (type: keyof UsageData) => {
    if (isPremium) return; // Premium users have unlimited usage
    
    setUsage(prev => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const canUseFeature = (type: keyof UsageData): boolean => {
    if (isPremium) return true;
    return usage[type] < FREE_LIMITS[type];
  };

  const getRemainingUsage = (type: keyof UsageData): number => {
    if (isPremium) return Infinity;
    return Math.max(0, FREE_LIMITS[type] - usage[type]);
  };

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
      dailyLimits: FREE_LIMITS,
      usageToday: usage,
      incrementUsage,
      canUseFeature,
      getRemainingUsage,
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
