
import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileNavigation /> : <Navigation />}
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default Index;
