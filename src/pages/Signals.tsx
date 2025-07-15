
import React from 'react';
import Navigation from '@/components/Navigation';
import LiveSignalsDashboard from '@/components/signals/LiveSignalsDashboard';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import FeatureGate from '@/components/FeatureGate';

const Signals = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <div className="relative z-10 pt-20 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8 lg:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-3 md:mb-4">
              Enhanced AI Signals
            </h1>
            <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-4">
              Multi-API price verification with enhanced signal digest, coach mode explanations, and real-time accuracy tracking
            </p>
            <div className={`flex justify-center gap-2 md:gap-4 mt-3 md:mt-4 ${
              isMobile ? 'flex-wrap px-4' : ''
            }`}>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Price Feeds
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Enhanced Digest
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                Coach Mode
              </div>
            </div>
          </div>

          <FeatureGate feature="signals" featureName="AI Signals">
            <LiveSignalsDashboard />
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

export default Signals;
