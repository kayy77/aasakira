
import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

console.log('🔍 DEBUG: Index.tsx starting to load...');

const Index = () => {
  console.log('🔍 DEBUG: Index component rendering...');
  
  let isMobile = false;
  try {
    isMobile = useIsMobile();
    console.log('🔍 DEBUG: useIsMobile hook successful:', isMobile);
  } catch (error) {
    console.error('❌ DEBUG: useIsMobile hook failed:', error);
  }

  console.log('🔍 DEBUG: About to render Index component JSX...');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      <main className="relative z-10">
        <Hero />
        <Features />
      </main>
    </div>
  );
};

console.log('🔍 DEBUG: Index.tsx loaded successfully');

export default Index;
