
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';

const Trading = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Trading Hub
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Your gateway to AI-powered trading education and combat arena battles
            </p>
          </div>

          <Card className="glass-card border-purple-500/20 text-center p-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                🏛️ Combat Arena Available in Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-300">
                The Aasakira Combat Arena V2 is now integrated into your AI Trading Mentor experience!
              </p>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 p-4 rounded-lg border border-red-500/20">
                  <h3 className="text-red-400 font-semibold mb-2">⚔️ Avatar Combat System</h3>
                  <p className="text-gray-400 text-sm">Progress from Ronin to Shogun AI through victories</p>
                </div>
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/20">
                  <h3 className="text-purple-400 font-semibold mb-2">🧠 Educational Skill Trees</h3>
                  <p className="text-gray-400 text-sm">Unlock trading abilities as you learn and win</p>
                </div>
                <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-4 rounded-lg border border-blue-500/20">
                  <h3 className="text-blue-400 font-semibold mb-2">🎮 Cinematic Battles</h3>
                  <p className="text-gray-400 text-sm">Watch price action come alive in real-time combat</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/education')}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 text-lg"
              >
                Enter Combat Arena →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Trading;
