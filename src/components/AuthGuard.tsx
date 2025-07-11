
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginDialog from './LoginDialog';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginDialog open={true} onOpenChange={() => {}} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
