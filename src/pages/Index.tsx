
import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, the AuthGuard will show Dashboard instead
  // This component only renders for non-authenticated users on the homepage
  if (isAuthenticated) {
    return null; // AuthGuard handles showing Dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      <main className="relative z-10">
        <Hero />
        <Features />
      </main>
    </div>
  );
};

export default Index;
