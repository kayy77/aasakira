import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface UsageData {
  signals: number;
  memeCoins: number;
  aiMentor: number;
}

interface DailyLimits {
  signals: number;
  memeCoins: number;
  aiMentor: number;
}

interface SubscriptionContextType {
  isPremium: boolean;
  usageToday: UsageData;
  dailyLimits: DailyLimits;
  canUseFeature: (feature: keyof UsageData) => boolean;
  incrementUsage: (feature: keyof UsageData) => void;
  resetDailyUsage: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_LIMITS: DailyLimits = {
  signals: 2,
  memeCoins: 2,
  aiMentor: 10
};

const PREMIUM_LIMITS: DailyLimits = {
  signals: Infinity,
  memeCoins: Infinity,
  aiMentor: Infinity
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const isPremium = user?.isPremium || false;
  
  const [usageToday, setUsageToday] = useState<UsageData>({
    signals: 0,
    memeCoins: 0,
    aiMentor: 0
  });

  const dailyLimits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  // Load usage data from localStorage on mount and when user changes
  useEffect(() => {
    if (user) {
      const today = new Date().toDateString();
      const savedUsage = localStorage.getItem(`usage_${user.id}_${today}`);
      
      if (savedUsage) {
        try {
          setUsageToday(JSON.parse(savedUsage));
        } catch (error) {
          console.error('Failed to parse usage data:', error);
          resetDailyUsage();
        }
      } else {
        resetDailyUsage();
      }
    }
  }, [user]);

  // Save usage data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const today = new Date().toDateString();
      localStorage.setItem(`usage_${user.id}_${today}`, JSON.stringify(usageToday));
    }
  }, [usageToday, user]);

  const canUseFeature = (feature: keyof UsageData): boolean => {
    if (!user) return false;
    if (isPremium) return true;
    return usageToday[feature] < dailyLimits[feature];
  };

  const incrementUsage = (feature: keyof UsageData) => {
    if (!user) return;
    
    setUsageToday(prev => ({
      ...prev,
      [feature]: prev[feature] + 1
    }));
  };

  const resetDailyUsage = () => {
    setUsageToday({
      signals: 0,
      memeCoins: 0,
      aiMentor: 0
    });
  };

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
      usageToday,
      dailyLimits,
      canUseFeature,
      incrementUsage,
      resetDailyUsage
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
