
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserData extends User {
  role?: 'free' | 'premium';
  aiSignalsUsedToday?: number;
  memeScansUsedToday?: number;
  mentorMessagesUsedToday?: number;
  resetAt?: string;
  // Add compatibility properties
  username?: string;
  avatar?: string;
  preferences?: any;
  social?: any;
  createdAt?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  // Add compatibility properties
  isAuthenticated: boolean;
  isLoading: boolean;
  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  // Compatibility methods
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  // Usage methods
  canUseFeature: (feature: 'signals' | 'memeScans' | 'mentorMessages') => boolean;
  incrementUsage: (feature: 'signals' | 'memeScans' | 'mentorMessages') => void;
  getRemainingUsage: (feature: 'signals' | 'memeScans' | 'mentorMessages') => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DAILY_LIMITS = {
  signals: 2,
  memeScans: 3,
  mentorMessages: 5,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = initializeUserData(session.user);
        setUser(userData);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = initializeUserData(session.user);
        setUser(userData);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: "You're successfully signed in.",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const initializeUserData = (authUser: User): UserData => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`user_usage_${authUser.id}`);
    let usageData = { aiSignalsUsedToday: 0, memeScansUsedToday: 0, mentorMessagesUsedToday: 0, resetAt: today };

    if (stored) {
      const parsed = JSON.parse(stored);
      // Reset usage if it's a new day
      if (parsed.resetAt !== today) {
        usageData = { aiSignalsUsedToday: 0, memeScansUsedToday: 0, mentorMessagesUsedToday: 0, resetAt: today };
      } else {
        usageData = parsed;
      }
    }

    return {
      ...authUser,
      role: 'free', // Default to free
      username: authUser.email?.split('@')[0] || 'User',
      avatar: authUser.user_metadata?.avatar_url || '',
      createdAt: authUser.created_at,
      preferences: {},
      social: {},
      ...usageData,
    };
  };

  const saveUsageData = (userData: UserData) => {
    if (userData.id) {
      localStorage.setItem(`user_usage_${userData.id}`, JSON.stringify({
        aiSignalsUsedToday: userData.aiSignalsUsedToday,
        memeScansUsedToday: userData.memeScansUsedToday,
        mentorMessagesUsedToday: userData.mentorMessagesUsedToday,
        resetAt: userData.resetAt,
      }));
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    
    toast({
      title: "Check your email",
      description: "We've sent you a confirmation link.",
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    
    toast({
      title: "Password reset email sent",
      description: "Check your email for the reset link.",
    });
  };

  // Compatibility methods
  const login = signIn;
  const signup = signUp;
  const logout = signOut;

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const upgradeToPremium = async () => {
    // This will be handled by the Stripe integration
    toast({
      title: "Upgrade to Premium",
      description: "Redirecting to payment...",
    });
  };

  const canUseFeature = (feature: 'signals' | 'memeScans' | 'mentorMessages'): boolean => {
    if (!user) return false;
    if (user.role === 'premium') return true;

    const usageKey = feature === 'signals' ? 'aiSignalsUsedToday' : 
                    feature === 'memeScans' ? 'memeScansUsedToday' : 'mentorMessagesUsedToday';
    
    return (user[usageKey] || 0) < DAILY_LIMITS[feature];
  };

  const incrementUsage = (feature: 'signals' | 'memeScans' | 'mentorMessages') => {
    if (!user || user.role === 'premium') return;

    const usageKey = feature === 'signals' ? 'aiSignalsUsedToday' : 
                    feature === 'memeScans' ? 'memeScansUsedToday' : 'mentorMessagesUsedToday';

    const updatedUser = {
      ...user,
      [usageKey]: (user[usageKey] || 0) + 1,
    };

    setUser(updatedUser);
    saveUsageData(updatedUser);
  };

  const getRemainingUsage = (feature: 'signals' | 'memeScans' | 'mentorMessages'): number => {
    if (!user) return 0;
    if (user.role === 'premium') return 999; // Unlimited for premium

    const usageKey = feature === 'signals' ? 'aiSignalsUsedToday' : 
                    feature === 'memeScans' ? 'memeScansUsedToday' : 'mentorMessagesUsedToday';
    
    return Math.max(0, DAILY_LIMITS[feature] - (user[usageKey] || 0));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    login,
    signup,
    logout,
    updateUserProfile,
    upgradeToPremium,
    canUseFeature,
    incrementUsage,
    getRemainingUsage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
