
import React from 'react';
import Navigation from '@/components/Navigation';
import LiveSignalsDashboard from '@/components/signals/LiveSignalsDashboard';
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
              Enhanced AI Signals
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Multi-API price verification with webhook integration for Discord, Telegram, Zapier & Pipedream
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Price Feeds
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Webhook Alerts
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                AI Analysis
              </div>
            </div>
          </div>

          <LiveSignalsDashboard />
        </div>
      </div>
    </div>
  );
};

export default Signals;
