
import React from 'react';
import LoginDialog from '@/components/LoginDialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const { isAuthenticated } = useAuth();

  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
      <div className="glass-card p-8 text-center max-w-md w-full mx-4">
        <div className="text-white text-3xl font-bold mb-2">🚀 AASAKIRA</div>
        <div className="text-purple-400 text-xl font-semibold mb-4">Elite Trading Platform</div>
        <div className="text-gray-400 mb-8">Sign in to access your trading dashboard and AI-powered signals</div>
        
        <LoginDialog>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold mb-4">
            Sign In / Sign Up
          </Button>
        </LoginDialog>
        
        <div className="text-sm text-gray-500">
          ✅ No email confirmation required • Start trading immediately
        </div>
      </div>
    </div>
  );
};

export default Auth;
