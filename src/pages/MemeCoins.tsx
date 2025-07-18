
import React from 'react';
import Navigation from '@/components/Navigation';
import EnhancedMemeCoinScanner from '@/components/memecoins/EnhancedMemeCoinScanner';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import FeatureGate from '@/components/FeatureGate';

const MemeCoins = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <div className="relative z-10 pt-20 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-3 md:mb-4">
              AI-Powered Meme Coin Scanner
            </h1>
            <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Real opportunities analyzed by Groq AI with live market scanning and deep technical analysis
            </p>
          </div>

          <FeatureGate feature="memeScans" featureName="AI Meme Coin Analysis">
            <EnhancedMemeCoinScanner />
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

export default MemeCoins;
