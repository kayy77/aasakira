
import React from 'react';
import Navigation from '@/components/Navigation';
import EnhancedSignals from '@/components/enhanced/EnhancedSignals';
import { PerformanceStats } from '@/components/signals/PerformanceStats';
import FeatureGate from '@/components/FeatureGate';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';

const Signals = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              AI Trading Signals
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Get real-time trading signals powered by advanced AI analysis across multiple market data sources
            </p>
          </div>

          <FeatureGate feature="signals" featureName="AI Trading Signals">
            <EnhancedSignals />
          </FeatureGate>
          
          <PerformanceStats winRate={78} totalSignals={156} activeSignals={3} avgRR={2.4} />
        </div>
      </div>
    </div>
  );
};

export default Signals;
