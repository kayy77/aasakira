
import React from 'react';
import Navigation from '@/components/Navigation';
import TradingDashboard from '@/components/trading/TradingDashboard';
import FeatureGate from '@/components/FeatureGate';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';

const Trading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Live Trading Dashboard
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Connect your MetaTrader account to view real-time balance, equity, open trades, and trading history
            </p>
          </div>

          <FeatureGate feature="signals" featureName="Trading Dashboard">
            <TradingDashboard />
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

export default Trading;
