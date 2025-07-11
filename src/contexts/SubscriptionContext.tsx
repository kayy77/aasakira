
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UsageLimits {
  signals: number;
  memeCoins: number;
  aiMentorMessages: number;
}

interface SubscriptionContextType {
  isPremium: boolean;
  usageToday: UsageLimits;
  dailyLimits: UsageLimits;
  canUseFeature: (feature: 'signals' | 'memeCoins' | 'aiMentor') => boolean;
  incrementUsage: (feature: 'signals' | 'memeCoins' | 'aiMentor') => void;
  resetDailyUsage: () => void;
  upgradeToPremium: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_LIMITS: UsageLimits = {
  signals: 2,
  memeCoins: 2,
  aiMentorMessages: 10
};

const PREMIUM_LIMITS: UsageLimits = {
  signals: 999,
  memeCoins: 999,
  aiMentorMessages: 999
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [usageToday, setUsageToday] = useState<UsageLimits>({
    signals: 0,
    memeCoins: 0,
    aiMentorMessages: 0
  });

  const dailyLimits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  // Load usage from localStorage on mount
  useEffect(() => {
    const savedUsage = localStorage.getItem('dailyUsage');
    const savedDate = localStorage.getItem('usageDate');
    const today = new Date().toDateString();

    if (savedUsage && savedDate === today) {
      setUsageToday(JSON.parse(savedUsage));
    } else {
      // Reset if it's a new day
      resetDailyUsage();
    }

    // Check premium status (you can integrate with Stripe here later)
    const premiumStatus = localStorage.getItem('isPremium') === 'true';
    setIsPremium(premiumStatus);
  }, []);

  // Save usage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dailyUsage', JSON.stringify(usageToday));
    localStorage.setItem('usageDate', new Date().toDateString());
  }, [usageToday]);

  const canUseFeature = (feature: 'signals' | 'memeCoins' | 'aiMentor'): boolean => {
    if (isPremium) return true;
    
    switch (feature) {
      case 'signals':
        return usageToday.signals < dailyLimits.signals;
      case 'memeCoins':
        return usageToday.memeCoins < dailyLimits.memeCoins;
      case 'aiMentor':
        return usageToday.aiMentorMessages < dailyLimits.aiMentorMessages;
      default:
        return false;
    }
  };

  const incrementUsage = (feature: 'signals' | 'memeCoins' | 'aiMentor'): void => {
    if (isPremium) return; // No limits for premium users
    
    setUsageToday(prev => ({
      ...prev,
      [feature]: prev[feature] + 1
    }));
  };

  const resetDailyUsage = (): void => {
    setUsageToday({
      signals: 0,
      memeCoins: 0,
      aiMentorMessages: 0
    });
    localStorage.removeItem('dailyUsage');
    localStorage.removeItem('usageDate');
  };

  const upgradeToPremium = (): void => {
    setIsPremium(true);
    localStorage.setItem('isPremium', 'true');
  };

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
      usageToday,
      dailyLimits,
      canUseFeature,
      incrementUsage,
      resetDailyUsage,
      upgradeToPremium
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
