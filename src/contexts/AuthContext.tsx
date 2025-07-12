import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'free' | 'premium';
  aiSignalsUsedToday: number;
  memeScansUsedToday: number;
  mentorMessagesUsedToday: number;
  resetAt: string;
  createdAt: string;
  avatar?: string;
  social?: {
    instagram?: string;
    twitter?: string;
  };
  preferences?: {
    newsletter: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  incrementUsage: (feature: 'signals' | 'memeScans' | 'mentorMessages') => void;
  canUseFeature: (feature: 'signals' | 'memeScans' | 'mentorMessages') => boolean;
  getRemainingUsage: (feature: 'signals' | 'memeScans' | 'mentorMessages') => number;
  upgradeToPremium: () => void;
  updateUserProfile: (profileData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_LIMITS = {
  signals: 2,
  memeScans: 3,
  mentorMessages: 10,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const shouldResetUsage = (resetAt: string) => {
    const resetTime = new Date(resetAt);
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setUTCHours(24, 0, 0, 0);
    return now >= resetTime;
  };

  const resetDailyUsage = (currentUser: User) => {
    const nextMidnight = new Date();
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
    nextMidnight.setUTCHours(0, 0, 0, 0);
    
    const updatedUser = {
      ...currentUser,
      aiSignalsUsedToday: 0,
      memeScansUsedToday: 0,
      mentorMessagesUsedToday: 0,
      resetAt: nextMidnight.toISOString(),
    };
    
    setUser(updatedUser);
    localStorage.setItem('aasakira_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('aasakira_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Check if usage should be reset
        if (shouldResetUsage(parsedUser.resetAt)) {
          resetDailyUsage(parsedUser);
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        localStorage.removeItem('aasakira_user');
      }
    }
    setIsLoading(false);
  }, []);

  const createUser = (username: string, email: string, role: 'free' | 'premium' = 'free'): User => {
    const nextMidnight = new Date();
    nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
    nextMidnight.setUTCHours(0, 0, 0, 0);

    return {
      id: Date.now().toString(),
      username,
      email,
      role,
      aiSignalsUsedToday: 0,
      memeScansUsedToday: 0,
      mentorMessagesUsedToday: 0,
      resetAt: nextMidnight.toISOString(),
      createdAt: new Date().toISOString(),
      preferences: {
        newsletter: false,
      },
    };
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username && password) {
      // Check for premium users (demo: users with "premium" in username get premium)
      const role = username.toLowerCase().includes('premium') ? 'premium' : 'free';
      const newUser = createUser(username, `${username}@example.com`, role);
      
      setUser(newUser);
      localStorage.setItem('aasakira_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (username && email && password) {
      const role = username.toLowerCase().includes('premium') ? 'premium' : 'free';
      const newUser = createUser(username, email, role);
      
      setUser(newUser);
      localStorage.setItem('aasakira_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aasakira_user');
  };

  const incrementUsage = (feature: 'signals' | 'memeScans' | 'mentorMessages') => {
    if (!user || user.role === 'premium') return;

    const updatedUser = { ...user };
    switch (feature) {
      case 'signals':
        updatedUser.aiSignalsUsedToday += 1;
        break;
      case 'memeScans':
        updatedUser.memeScansUsedToday += 1;
        break;
      case 'mentorMessages':
        updatedUser.mentorMessagesUsedToday += 1;
        break;
    }

    setUser(updatedUser);
    localStorage.setItem('aasakira_user', JSON.stringify(updatedUser));
  };

  const canUseFeature = (feature: 'signals' | 'memeScans' | 'mentorMessages'): boolean => {
    if (!user) return false;
    if (user.role === 'premium') return true;

    switch (feature) {
      case 'signals':
        return user.aiSignalsUsedToday < FREE_LIMITS.signals;
      case 'memeScans':
        return user.memeScansUsedToday < FREE_LIMITS.memeScans;
      case 'mentorMessages':
        return user.mentorMessagesUsedToday < FREE_LIMITS.mentorMessages;
      default:
        return false;
    }
  };

  const getRemainingUsage = (feature: 'signals' | 'memeScans' | 'mentorMessages'): number => {
    if (!user) return 0;
    if (user.role === 'premium') return Infinity;

    switch (feature) {
      case 'signals':
        return Math.max(0, FREE_LIMITS.signals - user.aiSignalsUsedToday);
      case 'memeScans':
        return Math.max(0, FREE_LIMITS.memeScans - user.memeScansUsedToday);
      case 'mentorMessages':
        return Math.max(0, FREE_LIMITS.mentorMessages - user.mentorMessagesUsedToday);
      default:
        return 0;
    }
  };

  const upgradeToPremium = () => {
    if (!user) return;
    
    const updatedUser = { ...user, role: 'premium' as const };
    setUser(updatedUser);
    localStorage.setItem('aasakira_user', JSON.stringify(updatedUser));
  };

  const updateUserProfile = (profileData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem('aasakira_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      isLoading,
      incrementUsage,
      canUseFeature,
      getRemainingUsage,
      upgradeToPremium,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
