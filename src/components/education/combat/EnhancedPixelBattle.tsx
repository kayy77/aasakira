import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap,
  Crown,
  Target,
  Swords,
  Activity,
  Brain,
  BarChart3
} from 'lucide-react';

interface PixelBattleProps {
  playerCharacter: any;
  opponentCharacter: any;
  marketData: {
    symbol: string;
    currentPrice: number;
    priceHistory: number[];
    aiHint: string;
  };
  onPrediction: (direction: 'up' | 'down') => void;
  timeLeft: number;
  battlePhase: 'prediction' | 'waiting' | 'result';
  result?: {
    winner: 'player' | 'opponent';
    xpGained: number;
    correct: boolean;
  };
}

const EnhancedPixelBattle = ({
  playerCharacter,
  opponentCharacter,
  marketData,
  onPrediction,
  timeLeft,
  battlePhase,
  result
}: PixelBattleProps) => {
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const [cherryBlossoms, setCherryBlossoms] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    size: number;
  }>>([]);

  // Initialize cherry blossoms
  useEffect(() => {
    const blossoms = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      size: Math.random() * 0.5 + 0.5
    }));
    setCherryBlossoms(blossoms);
  }, []);

  // Animation loop for breathing characters
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const DetailedPixelWarrior = ({ character, side, isPlayer }: { 
    character: any; 
    side: 'left' | 'right'; 
    isPlayer: boolean;
  }) => {
    const breatheOffset = Math.sin(animationFrame * 0.2) * 2;
    const isReadyStance = timeLeft <= 10 && battlePhase === 'prediction';
    const isStriking = isAttacking && ((isPlayer && selectedDirection) || (!isPlayer && battlePhase === 'waiting'));

    if (character.class === 'monk') {
      return (
        <div className="relative" style={{ transform: `translateY(${breatheOffset}px)` }}>
          {/* Monk Detailed Sprite */}
          <div className="relative w-32 h-40">
            {/* Blue Aura */}
            <div className="absolute inset-0 scale-110">
              <div className="w-full h-full bg-cyan-400/20 rounded-full animate-pulse blur-md" />
              <div className="absolute inset-2 bg-cyan-300/10 rounded-full animate-ping" />
            </div>
            
            {/* Main Body */}
            <div className="relative z-10">
              {/* Head */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-amber-300 rounded-lg pixel-art border-2 border-amber-600">
                {/* Eyes */}
                <div className="absolute top-3 left-2 w-2 h-2 bg-black rounded-full" />
                <div className="absolute top-3 right-2 w-2 h-2 bg-black rounded-full" />
                {/* Beard */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-gray-600 rounded-b-lg" />
              </div>
              
              {/* Golden Hat */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-14 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-lg border-2 border-yellow-300" />
              
              {/* Cyan Robe */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded-lg pixel-art border-2 border-cyan-400">
                {/* Yellow Sash */}
                <div className="absolute top-2 left-0 right-0 h-3 bg-yellow-500 border-y border-yellow-400" />
                {/* Arms */}
                <div className="absolute top-4 -left-2 w-6 h-8 bg-cyan-600 rounded-lg border border-cyan-500" />
                <div className="absolute top-4 -right-2 w-6 h-8 bg-cyan-600 rounded-lg border border-cyan-500" />
              </div>
              
              {/* Staff */}
              <div className={`absolute ${side === 'left' ? '-right-4' : '-left-4'} top-8 w-3 h-28 bg-amber-800 rounded-full pixel-art ${isReadyStance ? 'animate-pulse' : ''}`}>
                {/* Staff Top Orb */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-cyan-400 rounded-full animate-pulse border-2 border-cyan-300" />
              </div>
              
              {/* Legs */}
              <div className="absolute top-28 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <div className="w-4 h-10 bg-cyan-700 rounded-lg pixel-art" />
                <div className="w-4 h-10 bg-cyan-700 rounded-lg pixel-art" />
              </div>
              
              {/* Pet Fox */}
              <div className="absolute -bottom-2 -left-8 w-8 h-6 bg-orange-500 rounded-lg pixel-art border border-orange-400">
                <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full" />
                <div className="absolute top-1 right-2 w-1 h-1 bg-black rounded-full" />
                <div className="absolute -right-1 top-2 w-6 h-2 bg-orange-600 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Character Info */}
          <div className="text-center mt-4">
            <div className="text-cyan-400 text-lg font-bold pixel-font">Wandering Monk</div>
            <div className="text-cyan-300 text-sm">Level 13 • 1250 XP</div>
            <div className="text-xs text-gray-400">🧘 Meditation Master</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative" style={{ transform: `translateY(${breatheOffset}px)` }}>
          {/* Samurai Detailed Sprite */}
          <div className="relative w-32 h-40">
            {/* Red Aura */}
            <div className="absolute inset-0 scale-110">
              <div className="w-full h-full bg-red-500/20 rounded-full animate-pulse blur-md" />
              <div className="absolute inset-2 bg-red-400/10 rounded-full animate-ping" />
            </div>
            
            {/* Main Body */}
            <div className="relative z-10">
              {/* Head with Helmet */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-300 rounded-lg pixel-art border-2 border-red-600">
                {/* Demon Mask */}
                <div className="absolute inset-1 bg-red-800 rounded border border-red-700">
                  <div className="absolute top-2 left-1 w-2 h-2 bg-yellow-400 rounded-full" />
                  <div className="absolute top-2 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-white rounded" />
                </div>
              </div>
              
              {/* Horned Helmet */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-14 h-6 bg-gradient-to-b from-gray-700 to-gray-900 rounded-t-lg border-2 border-gray-600">
                <div className="absolute -top-1 left-2 w-2 h-4 bg-red-600 transform rotate-12" />
                <div className="absolute -top-1 right-2 w-2 h-4 bg-red-600 transform -rotate-12" />
              </div>
              
              {/* Dark Armor */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-b from-gray-800 to-black rounded-lg pixel-art border-2 border-gray-700">
                {/* Red Accents */}
                <div className="absolute top-2 left-2 right-2 h-2 bg-red-600 border border-red-500" />
                <div className="absolute top-6 left-2 right-2 h-1 bg-red-500" />
                {/* Shoulder Plates */}
                <div className="absolute top-0 -left-3 w-8 h-6 bg-gray-700 rounded-lg border border-gray-600 transform -rotate-12" />
                <div className="absolute top-0 -right-3 w-8 h-6 bg-gray-700 rounded-lg border border-gray-600 transform rotate-12" />
              </div>
              
              {/* Aasakira Katana */}
              <div className={`absolute ${side === 'left' ? '-right-6' : '-left-6'} top-6 ${isReadyStance ? 'animate-bounce' : ''} ${isStriking ? 'transform scale-110' : ''}`}>
                {/* Sword Handle */}
                <div className="w-3 h-12 bg-red-900 rounded-lg pixel-art border border-red-800" />
                {/* Blade */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-2 h-20 bg-gradient-to-t from-gray-300 to-white rounded-t-full border border-gray-400">
                  {/* Flame Effect */}
                  <div className="absolute inset-0 bg-red-400/30 animate-pulse rounded-t-full" />
                </div>
                {/* Guard */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-gold rounded" />
              </div>
              
              {/* Legs */}
              <div className="absolute top-28 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <div className="w-4 h-10 bg-gray-800 rounded-lg pixel-art border border-gray-700" />
                <div className="w-4 h-10 bg-gray-800 rounded-lg pixel-art border border-gray-700" />
              </div>
              
              {/* Pet Mechanical Dragon */}
              <div className="absolute -bottom-2 -right-8 w-10 h-8 bg-gray-700 rounded-lg pixel-art border border-gray-600">
                <div className="absolute top-1 left-1 w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                <div className="absolute top-1 right-2 w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                <div className="absolute -right-2 top-2 w-8 h-3 bg-gray-600 rounded-full" />
                <div className="absolute top-4 left-2 right-2 h-2 bg-red-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Character Info */}
          <div className="text-center mt-4">
            <div className="text-red-400 text-lg font-bold pixel-font">Rising Samurai</div>
            <div className="text-red-300 text-sm">Level 14 • 1450 XP</div>
            <div className="text-xs text-gray-400">⚔️ Aasakira Katana</div>
          </div>
        </div>
      );
    }
  };

  const handlePrediction = (direction: 'up' | 'down') => {
    setSelectedDirection(direction);
    setIsAttacking(true);
    onPrediction(direction);
    
    // Reset animation after 1 second
    setTimeout(() => {
      setIsAttacking(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden pixel-battle-arena">
      {/* Dojo Background Architecture */}
      <div className="absolute inset-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-black to-purple-800/30" />
        
        {/* Dojo Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900 to-amber-700 border-t-4 border-amber-600">
          {/* Floor Reflections */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-amber-500 animate-pulse" />
        </div>
        
        {/* Dojo Pillars */}
        <div className="absolute left-8 bottom-32 w-6 h-40 bg-gradient-to-t from-red-900 to-red-700 rounded-t-lg border-2 border-red-600" />
        <div className="absolute right-8 bottom-32 w-6 h-40 bg-gradient-to-t from-red-900 to-red-700 rounded-t-lg border-2 border-red-600" />
        
        {/* Sakura Tree Silhouette */}
        <div className="absolute right-16 bottom-32 w-24 h-48 opacity-30">
          <div className="w-4 h-32 bg-gray-800 mx-auto rounded-t-lg" />
          <div className="absolute top-8 left-4 w-16 h-16 bg-pink-900/20 rounded-full" />
          <div className="absolute top-12 left-2 w-12 h-12 bg-pink-800/20 rounded-full" />
          <div className="absolute top-16 right-2 w-10 h-10 bg-pink-900/20 rounded-full" />
        </div>
        
        {/* Floating Lanterns */}
        <div className="absolute left-12 top-1/4 w-8 h-12 bg-orange-600 rounded-lg border-2 border-orange-400 animate-pulse">
          <div className="absolute inset-1 bg-yellow-400 rounded opacity-80" />
        </div>
        <div className="absolute right-12 top-1/4 w-8 h-12 bg-orange-600 rounded-lg border-2 border-orange-400 animate-pulse">
          <div className="absolute inset-1 bg-yellow-400 rounded opacity-80" />
        </div>
      </div>

      {/* Cherry Blossoms */}
      <div className="absolute inset-0 pointer-events-none">
        {cherryBlossoms.map(blossom => (
          <div
            key={blossom.id}
            className="absolute text-pink-300 animate-float opacity-70"
            style={{
              left: `${blossom.x}%`,
              top: `${blossom.y}%`,
              fontSize: `${blossom.size}rem`,
              animationDelay: `${blossom.delay}s`,
              animationDuration: '4s'
            }}
          >
            🌸
          </div>
        ))}
      </div>

      {/* Top UI Elements */}
      <div className="absolute top-8 left-0 right-0 z-20">
        {/* Market Data */}
        <div className="absolute left-8 top-0">
          <div className="bg-black/90 border-4 border-green-400 rounded-lg p-4 pixel-border">
            <div className="text-green-400 text-xl font-bold pixel-font">EUR/USD</div>
            <div className="text-green-300 text-3xl font-bold">1.0850</div>
            <div className="text-yellow-400 text-sm">1250 XP</div>
          </div>
        </div>

        {/* Timer */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0">
          <div className="bg-black/90 border-4 border-yellow-500 rounded-lg px-8 py-4 pixel-border">
            <div className="text-yellow-400 text-4xl font-bold pixel-font">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="absolute right-8 top-0">
          <div className="bg-black/90 border-4 border-orange-400 rounded-lg p-3 pixel-border">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">👑</span>
                <span className="text-orange-400 text-sm font-bold">ShadowTrader</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-cyan-400">🧘</span>
                <span className="text-cyan-300 text-sm">MarketPhantom</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-400">🗡️</span>
                <span className="text-red-300 text-sm">DragonSlayer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Mentor */}
      <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-20 max-w-md">
        <div className="bg-cyan-500/95 rounded-lg p-4 border-4 border-cyan-300 pixel-border relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-700 rounded-full flex items-center justify-center pixel-art">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="text-white text-sm font-bold pixel-font">
              Watch for liquidity at 1.0345
            </div>
          </div>
        </div>
      </div>

      {/* Central Battle Area */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        {/* Trading Crystal */}
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full border-4 border-white/50 animate-pulse pixel-art mx-auto mb-8">
          <div className="absolute inset-2 bg-white/20 rounded-full animate-ping" />
          <div className="flex items-center justify-center h-full">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Choose Your Strike */}
        {battlePhase === 'prediction' && (
          <div className="text-center mb-6">
            <div className="text-orange-400 text-3xl font-bold pixel-font mb-2 animate-pulse">
              CHOOSE YOUR STRIKE
            </div>
            <div className="text-orange-300 text-lg pixel-font">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>

      {/* Characters */}
      <div className="absolute bottom-40 left-16 z-15">
        <DetailedPixelWarrior character={playerCharacter} side="left" isPlayer={true} />
      </div>

      <div className="absolute bottom-40 right-16 z-15">
        <DetailedPixelWarrior character={opponentCharacter} side="right" isPlayer={false} />
      </div>

      {/* Battle Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        {battlePhase === 'prediction' && (
          <div className="flex space-x-6">
            <button
              onClick={() => handlePrediction('up')}
              className="relative group pixel-battle-button"
            >
              <div className="w-40 h-16 bg-gradient-to-b from-green-500 to-green-700 border-4 border-green-300 rounded-lg flex items-center justify-center hover:scale-105 transition-transform pixel-art">
                <div className="text-center">
                  <div className="text-white font-bold text-lg pixel-font">BULLISH STRIKE</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-green-400/30 rounded-lg blur-lg animate-pulse scale-110 -z-10" />
            </button>

            <button
              onClick={() => handlePrediction('down')}
              className="relative group pixel-battle-button"
            >
              <div className="w-40 h-16 bg-gradient-to-b from-red-500 to-red-700 border-4 border-red-300 rounded-lg flex items-center justify-center hover:scale-105 transition-transform pixel-art">
                <div className="text-center">
                  <div className="text-white font-bold text-lg pixel-font">BEARISH ATTACK</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-red-400/30 rounded-lg blur-lg animate-pulse scale-110 -z-10" />
            </button>
          </div>
        )}

        {battlePhase === 'waiting' && (
          <div className="text-center">
            <div className="text-yellow-400 text-2xl font-bold pixel-font mb-4 animate-pulse">
              BATTLE IN PROGRESS...
            </div>
            <div className="w-80 h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-yellow-400">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 animate-pulse"
                style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        {battlePhase === 'result' && result && (
          <div className="text-center space-y-6">
            <div className={`text-5xl font-bold pixel-font animate-bounce ${
              result.winner === 'player' ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.winner === 'player' ? '🏆 VICTORY!' : '💀 DEFEAT'}
            </div>
            
            <div className="flex space-x-6">
              <div className="bg-black/90 border-4 border-blue-400 rounded-lg p-4 text-center pixel-border">
                <div className="text-blue-400 text-lg font-bold pixel-font">XP GAINED</div>
                <div className="text-white text-3xl font-bold">+{result.xpGained}</div>
              </div>
              <div className="bg-black/90 border-4 border-purple-400 rounded-lg p-4 text-center pixel-border">
                <div className="text-purple-400 text-lg font-bold pixel-font">PREDICTION</div>
                <div className={`text-xl font-bold ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {result.correct ? 'CORRECT' : 'WRONG'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPixelBattle;