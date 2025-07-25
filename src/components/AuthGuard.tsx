
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import LoginDialog from './LoginDialog';
import Dashboard from './Dashboard';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Public routes that don't require authentication
  const publicRoutes = ['/'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading Aasakira...</div>
          <div className="text-gray-400 mt-2">Initializing your trading dashboard</div>
        </div>
      </div>
    );
  }

  // If user is authenticated and on dashboard route, show dashboard
  if (isAuthenticated && location.pathname === '/dashboard') {
    return <Dashboard />;
  }

  // If user is not authenticated and trying to access protected route, show login
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md w-full mx-4">
          <div className="text-white text-xl font-semibold mb-4">Authentication Required</div>
          <div className="text-gray-400 mb-6">Please sign in to access this page</div>
          <LoginDialog>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Sign In / Sign Up
            </Button>
          </LoginDialog>
        </div>
      </div>
    );
  }

  // For all other cases (authenticated users on any route, or public routes), show the children
  return <>{children}</>;
};

export default AuthGuard;
