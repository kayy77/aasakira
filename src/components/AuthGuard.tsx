
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import LoginDialog from './LoginDialog';
import Dashboard from './Dashboard';

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

  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    return <LoginDialog open={true} onOpenChange={() => {}} />;
  }

  // If user is authenticated and on the home page, show dashboard
  if (isAuthenticated && location.pathname === '/') {
    return <Dashboard />;
  }

  // If user is not authenticated and on public route, show the content
  if (!isAuthenticated && isPublicRoute) {
    return <>{children}</>;
  }

  // For authenticated users on protected routes
  return <>{children}</>;
};

export default AuthGuard;
