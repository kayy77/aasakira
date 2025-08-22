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
  username?: string;
  avatar?: string;
  preferences?: any;
  social?: any;
  createdAt?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  canUseFeature: (feature: 'signals' | 'memeScans' | 'mentorMessages') => boolean;
  incrementUsage: (feature: 'signals' | 'memeScans' | 'mentorMessages') => void;
  getRemainingUsage: (feature: 'signals' | 'memeScans' | 'mentorMessages') => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DAILY_LIMITS = {
  signals: 2,
  memeScans: 2,
  mentorMessages: 3,
};

// Admin emails - set these accounts as premium
const ADMIN_EMAILS = ['khaijwh@gmail.com', 'Konejunior09@outlook.com'];

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

    // Check if user is admin, has premium role in metadata, or is in subscribers table
    const isAdmin = ADMIN_EMAILS.includes(authUser.email || '');
    const hasPremiumRole = authUser.user_metadata?.role === 'premium';
    
    // Check subscribers table on login
    checkSubscriptionStatus(authUser.email || '');
    
    return {
      ...authUser,
      role: (isAdmin || hasPremiumRole) ? 'premium' : 'free',
      username: authUser.email?.split('@')[0] || 'User',
      avatar: authUser.user_metadata?.avatar_url || '',
      createdAt: authUser.created_at,
      preferences: {},
      social: {},
      ...usageData,
    };
  };

  const checkSubscriptionStatus = async (email: string) => {
    try {
      const { data } = await supabase.functions.invoke('check-subscription');
      if (data?.subscribed && user) {
        // Update user role if subscription is active
        setUser(prev => prev ? { ...prev, role: 'premium' } : null);
      }
    } catch (error) {
      // Fallback to database check
      try {
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_tier')
          .eq('email', email)
          .single();
        
        if (subscriber?.subscribed && user) {
          setUser(prev => prev ? { ...prev, role: 'premium' } : null);
        }
      } catch (dbError) {
        console.log('No subscription found for user');
      }
    }
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Success toast immediately
      toast({
        title: "Account created successfully!",
        description: "Welcome to AASAKIRA! You can start using all features immediately.",
      });

      // Optional activity logging (non-blocking)
      if (data.user) {
        setTimeout(async () => {
          try {
            await supabase.from('user_activities').insert({
              user_id: data.user.id,
              activity_type: 'signup',
              data: { 
                email, 
                signup_date: new Date().toISOString(),
                signup_method: 'email_password'
              }
            });
          } catch (activityError) {
            console.warn('Activity logging failed (non-critical):', activityError);
          }
        }, 100);
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`
    });
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
    
    const currentUsage = user[usageKey] || 0;
    // Allow usage up to the limit, don't show toast here
    return currentUsage < DAILY_LIMITS[feature];
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
    if (user.role === 'premium') return 999;

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
