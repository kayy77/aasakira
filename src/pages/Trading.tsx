
import React from 'react';
import Navigation from '@/components/Navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import TradingDuelGame from '@/components/trading/TradingDuelGame';

const Trading = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center space-x-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Trading Duel Arena
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Face off in skill-based trading duels with real market data, AI analysis, and competitive scoring
            </p>
          </div>

          {/* Trading Duel Game Component */}
          <TradingDuelGame />
        </div>
      </div>
    </div>
  );
};

export default Trading;
