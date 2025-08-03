
import React from 'react';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <div className="relative z-10 pt-20 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-6">
              Welcome to Aasakira
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Your AI-powered trading companion. We're building the future of intelligent trading.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="glass-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  Coming Soon
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <p className="text-gray-300 text-lg leading-relaxed">
                  We're working hard to bring you the most advanced AI trading platform. 
                  Stay tuned for exciting features including:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-xl border border-purple-500/20">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white mb-2">AI Trading Signals</h3>
                    <p className="text-gray-400">Advanced multi-AI consensus engine for high-probability trades</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6 rounded-xl border border-blue-500/20">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white mb-2">Smart Analytics</h3>
                    <p className="text-gray-400">Comprehensive market analysis and educational tools</p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 text-lg"
                    disabled
                  >
                    Launch Coming Soon...
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
