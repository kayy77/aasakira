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
  const [cherryBlossoms, setCherryBlossoms] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
  }>>([]);

  // Initialize cherry blossoms
  useEffect(() => {
    const blossoms = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setCherryBlossoms(blossoms);
  }, []);

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const PixelWarrior = ({ character, side, isPlayer }: { 
    character: any; 
    side: 'left' | 'right'; 
    isPlayer: boolean;
  }) => {
    const getCharacterSprite = () => {
      if (character.class === 'monk') {
        return (
          <div className="relative w-20 h-24 mx-auto">
            {/* Monk pixel sprite */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg pixel-art">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-amber-300 rounded-full" />
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-cyan-400 rounded-lg" />
              <div className="absolute bottom-2 left-2 w-4 h-6 bg-amber-700 rounded" />
              <div className="absolute bottom-2 right-2 w-4 h-6 bg-amber-700 rounded" />
            </div>
            {/* Blue aura */}
            <div className="absolute inset-0 bg-cyan-400/20 rounded-lg animate-pulse blur-sm scale-110" />
          </div>
        );
      } else if (character.class === 'samurai') {
        return (
          <div className="relative w-20 h-24 mx-auto">
            {/* Samurai pixel sprite */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-700 to-red-900 rounded-lg pixel-art">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-300 rounded-full" />
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800 rounded-lg" />
              <div className="absolute bottom-2 left-2 w-4 h-6 bg-red-800 rounded" />
              <div className="absolute bottom-2 right-2 w-4 h-6 bg-red-800 rounded" />
              {/* Katana */}
              <div className={`absolute top-4 ${side === 'left' ? 'right-0' : 'left-0'} w-2 h-12 bg-gray-300 rounded-full`} />
            </div>
            {/* Red aura */}
            <div className="absolute inset-0 bg-red-500/20 rounded-lg animate-pulse blur-sm scale-110" />
          </div>
        );
      } else {
        return (
          <div className="relative w-20 h-24 mx-auto">
            {/* Phantom pixel sprite */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-700 to-gray-900 rounded-lg pixel-art">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-300 rounded-full" />
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-purple-900 rounded-lg" />
              <div className="absolute bottom-2 left-2 w-4 h-6 bg-purple-800 rounded" />
              <div className="absolute bottom-2 right-2 w-4 h-6 bg-purple-800 rounded" />
            </div>
            {/* Purple aura */}
            <div className="absolute inset-0 bg-purple-500/20 rounded-lg animate-pulse blur-sm scale-110" />
          </div>
        );
      }
    };

    const getClassName = () => {
      if (character.class === 'monk') return 'Wandering Monk';
      if (character.class === 'samurai') return 'Rising Samurai';
      return 'Market Phantom';
    };

    const getXP = () => character.xp || (isPlayer ? 1250 : 1450);
    const getLevel = () => character.level || (isPlayer ? 13 : 14);

    return (
      <div className="text-center">
        {getCharacterSprite()}
        <div className="mt-2">
          <div className="text-yellow-400 text-sm font-bold pixel-font">
            {getClassName()}
          </div>
          <div className="text-gray-300 text-xs">
            Level {getLevel()} • {getXP()} XP
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden pixel-battle-arena">
      {/* Cherry Blossom Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black to-purple-900/20">
        {cherryBlossoms.map(blossom => (
          <div
            key={blossom.id}
            className="absolute text-pink-300 text-xl animate-pulse opacity-60"
            style={{
              left: `${blossom.x}%`,
              top: `${blossom.y}%`,
              animationDelay: `${blossom.delay}s`,
              animationDuration: '3s'
            }}
          >
            🌸
          </div>
        ))}
      </div>

      {/* Dojo Background Elements */}
      <div className="absolute inset-0">
        {/* Side lanterns */}
        <div className="absolute left-8 top-1/3 w-6 h-8 bg-orange-500 rounded-lg opacity-80 animate-pulse" />
        <div className="absolute right-8 top-1/3 w-6 h-8 bg-orange-500 rounded-lg opacity-80 animate-pulse" />
        
        {/* Trading screens on walls */}
        <div className="absolute left-16 top-32 w-24 h-16 bg-green-900 rounded border-2 border-green-400 opacity-60">
          <div className="p-2 text-xs text-green-400">
            {/* Mini chart */}
            <div className="flex items-end h-8 space-x-1">
              {marketData.priceHistory.slice(-6).map((_, i) => (
                <div key={i} className="w-1 bg-green-400" style={{ height: `${Math.random() * 20 + 10}px` }} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute right-16 top-32 w-24 h-16 bg-green-900 rounded border-2 border-green-400 opacity-60">
          <div className="p-2 text-xs text-green-400">
            {/* Mini chart */}
            <div className="flex items-end h-8 space-x-1">
              {marketData.priceHistory.slice(-6).map((_, i) => (
                <div key={i} className="w-1 bg-green-400" style={{ height: `${Math.random() * 20 + 10}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/80 border-4 border-yellow-500 rounded-lg px-6 py-2">
          <div className="text-yellow-400 text-3xl font-bold pixel-font">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* AI Mentor Hint */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 max-w-md">
        <div className="bg-cyan-500/90 rounded-lg p-3 border-2 border-cyan-300 relative">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cyan-700 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="text-white text-sm font-medium">
              {marketData.aiHint}
            </div>
          </div>
          {/* Speech bubble tail */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-cyan-500/90" />
        </div>
      </div>

      {/* Market Data Display */}
      <div className="absolute top-12 left-8 z-10">
        <div className="bg-black/80 border-2 border-green-400 rounded-lg p-3">
          <div className="text-green-400 text-lg font-bold">
            {marketData.symbol}
          </div>
          <div className="text-green-300 text-2xl font-bold">
            {marketData.currentPrice.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="absolute top-12 right-8 z-10">
        <div className="bg-black/80 border-2 border-orange-400 rounded-lg p-2 text-xs">
          <div className="text-orange-400 font-bold mb-1">👑 Leaders</div>
          <div className="text-orange-300">🥇 ShadowTrader</div>
          <div className="text-gray-400">🥈 MarketPhantom</div>
          <div className="text-gray-500">🥉 DragonSlayer</div>
        </div>
      </div>

      {/* Battle Arena Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-800 to-transparent">
        {/* Dojo platform */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-16 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg border-t-4 border-amber-500" />
      </div>

      {/* Characters */}
      <div className="absolute bottom-20 left-32">
        <PixelWarrior character={playerCharacter} side="left" isPlayer={true} />
        {/* Player XP bar */}
        <div className="mt-2 bg-black/80 rounded p-2 border border-cyan-400">
          <div className="text-cyan-400 text-xs font-bold">18 XP</div>
          <div className="w-16 h-2 bg-gray-700 rounded">
            <div className="w-3/4 h-2 bg-cyan-400 rounded" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 right-32">
        <PixelWarrior character={opponentCharacter} side="right" isPlayer={false} />
        {/* Opponent XP bar */}
        <div className="mt-2 bg-black/80 rounded p-2 border border-red-400">
          <div className="text-red-400 text-xs font-bold">25 XP</div>
          <div className="w-16 h-2 bg-gray-700 rounded">
            <div className="w-4/5 h-2 bg-red-400 rounded" />
          </div>
        </div>
      </div>

      {/* Central Battle Interface */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        {battlePhase === 'prediction' && (
          <div className="space-y-4">
            {/* Battle Title */}
            <div className="text-center mb-4">
              <div className="text-orange-400 text-2xl font-bold pixel-font mb-2">
                CHOOSE YOUR STRIKE
              </div>
              <div className="text-orange-300 text-sm">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Battle Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => onPrediction('up')}
                className="relative group"
              >
                <div className="w-32 h-20 bg-gradient-to-b from-green-500 to-green-700 border-4 border-green-300 rounded-lg flex flex-col items-center justify-center hover:scale-105 transition-transform pixel-button">
                  <TrendingUp className="w-6 h-6 text-white mb-1" />
                  <div className="text-white font-bold text-sm pixel-font">BULLISH</div>
                  <div className="text-white font-bold text-sm pixel-font">STRIKE</div>
                </div>
                {/* Aura effect */}
                <div className="absolute inset-0 bg-green-400/20 rounded-lg blur-md animate-pulse scale-110 -z-10" />
              </button>

              <button
                onClick={() => onPrediction('down')}
                className="relative group"
              >
                <div className="w-32 h-20 bg-gradient-to-b from-red-500 to-red-700 border-4 border-red-300 rounded-lg flex flex-col items-center justify-center hover:scale-105 transition-transform pixel-button">
                  <TrendingDown className="w-6 h-6 text-white mb-1" />
                  <div className="text-white font-bold text-sm pixel-font">BEARISH</div>
                  <div className="text-white font-bold text-sm pixel-font">ATTACK</div>
                </div>
                {/* Aura effect */}
                <div className="absolute inset-0 bg-red-400/20 rounded-lg blur-md animate-pulse scale-110 -z-10" />
              </button>
            </div>
          </div>
        )}

        {battlePhase === 'waiting' && (
          <div className="text-center">
            <div className="text-yellow-400 text-xl font-bold pixel-font mb-2 animate-pulse">
              BATTLE IN PROGRESS...
            </div>
            <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-1000"
                style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        {battlePhase === 'result' && result && (
          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold pixel-font ${
              result.winner === 'player' ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.winner === 'player' ? '🏆 VICTORY!' : '💀 DEFEAT'}
            </div>
            
            <div className="flex space-x-4">
              <div className="bg-black/80 border-2 border-blue-400 rounded-lg p-3 text-center">
                <div className="text-blue-400 text-sm">XP GAINED</div>
                <div className="text-white text-2xl font-bold">+{result.xpGained}</div>
              </div>
              <div className="bg-black/80 border-2 border-purple-400 rounded-lg p-3 text-center">
                <div className="text-purple-400 text-sm">PREDICTION</div>
                <div className={`text-lg font-bold ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
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