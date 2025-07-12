
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('forexai_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('forexai_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call - in real app, this would be an actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any username/password combination
    // In real app, this would validate against your backend
    if (username && password) {
      const newUser: User = {
        id: '1',
        username,
        email: `${username}@example.com`,
        isPremium: username.toLowerCase().includes('premium') // Demo: users with "premium" in username get premium
      };
      
      setUser(newUser);
      localStorage.setItem('forexai_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call - in real app, this would be an actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, accept any username/email/password combination
    if (username && email && password) {
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email,
        isPremium: username.toLowerCase().includes('premium') // Demo: users with "premium" in username get premium
      };
      
      setUser(newUser);
      localStorage.setItem('forexai_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('forexai_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      isLoading
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
