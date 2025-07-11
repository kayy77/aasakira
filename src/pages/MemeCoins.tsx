
import React from 'react';
import Navigation from '@/components/Navigation';
import MemeCoinScanner from '@/components/memecoins/MemeCoinScanner';

const MemeCoins = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MemeCoinScanner />
        </div>
      </div>
    </div>
  );
};

export default MemeCoins;
