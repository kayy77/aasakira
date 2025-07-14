
import React from 'react';
import Navigation from '@/components/Navigation';
import LiveMemeCoinDashboard from '@/components/memecoins/LiveMemeCoinDashboard';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';

const MemeCoins = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Live Meme Coin Scanner
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover high-potential meme coins with real-time analysis and live market scanning
            </p>
          </div>

          <LiveMemeCoinDashboard />
        </div>
      </div>
    </div>
  );
};

export default MemeCoins;
