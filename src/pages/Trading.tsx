
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Swords, 
  TrendingUp, 
  BarChart3,
  Gamepad2,
  Crown
} from 'lucide-react';
import EnhancedCombatMode from '@/components/education/EnhancedCombatMode';
import TradingDashboard from '@/components/trading/TradingDashboard';

const Trading = () => {
  const navigate = useNavigate();

  const handleFeatureUse = () => {
    // Feature usage tracking
    console.log('Trading feature used');
  };

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
              Trading Hub
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Your complete trading ecosystem - from real account management to AI-powered combat arena
            </p>
          </div>

          <Tabs defaultValue="combat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 mb-8">
              <TabsTrigger value="combat" className="data-[state=active]:bg-red-600">
                <Swords className="w-4 h-4 mr-2" />
                <Crown className="w-3 h-3 mr-1" />
                Combat Arena V2
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Live Trading
              </TabsTrigger>
            </TabsList>

            <TabsContent value="combat" className="space-y-6">
              <Card className="glass-card border-red-500/20 bg-gradient-to-r from-red-900/10 to-orange-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-400">
                    <Swords className="w-6 h-6 mr-2" />
                    Aasakira Combat Arena V2
                    <div className="ml-2 px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full animate-pulse">
                      LIVE
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-gray-300 mb-4">
                      Battle other traders in real-time with AI-generated avatars, skill trees, and cinematic market combat
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-lg border border-red-500/20">
                        <Crown className="w-6 h-6 mx-auto mb-2 text-red-400" />
                        <h4 className="font-semibold text-white text-sm">Avatar Evolution</h4>
                        <p className="text-xs text-gray-400">AI-Generated Samurai</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                        <h4 className="font-semibold text-white text-sm">Live Market Arena</h4>
                        <p className="text-xs text-gray-400">Custom Chart Engine</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg border border-blue-500/20">
                        <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                        <h4 className="font-semibold text-white text-sm">Skill Tree RPG</h4>
                        <p className="text-xs text-gray-400">Unlock Trading Abilities</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20">
                        <Swords className="w-6 h-6 mx-auto mb-2 text-green-400" />
                        <h4 className="font-semibold text-white text-sm">Battle Mechanics</h4>
                        <p className="text-xs text-gray-400">Bluffs & Strategy</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <EnhancedCombatMode onFeatureUse={handleFeatureUse} />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <TradingDashboard onFeatureUse={handleFeatureUse} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Trading;
