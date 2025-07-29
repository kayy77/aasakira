import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import FeatureGate from '@/components/FeatureGate';
import SignalFilter from '@/components/signals/SignalFilter';
import LiveSignalsDashboard from '@/components/signals/LiveSignalsDashboard';

import EnhancedSignalsDashboard from '@/components/signals/EnhancedSignalsDashboard';

const Signals = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <div className="relative z-10 pt-16 md:pt-20 lg:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-4 md:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-2 md:mb-3 lg:mb-4">
              Enhanced Elite AI Signals
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 md:px-4">
              Multi-strategy analysis with EV scoring, institutional-grade logic, and Groq-enhanced explanations
            </p>
            <div className={`flex justify-center gap-1 sm:gap-2 md:gap-4 mt-2 md:mt-3 lg:mt-4 ${
              isMobile ? 'flex-wrap px-2' : ''
            }`}>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>Live Price Feeds</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>EV Scoring</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>Institutional Logic</span>
              </div>
            </div>
          </div>

          <FeatureGate feature="signals" featureName="Enhanced Elite AI Signals">
            <EnhancedSignalsDashboard />
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

export default Signals;
