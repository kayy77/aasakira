
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Swords, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Zap,
  Crown,
  Target,
  Flame
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
  const [battleEffects, setBattleEffects] = useState<Array<{
    id: string;
    type: 'slash' | 'block' | 'aura';
    x: number;
    y: number;
    timestamp: number;
  }>>([]);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Add battle effects
  const addBattleEffect = (type: 'slash' | 'block' | 'aura', x: number, y: number) => {
    const newEffect = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
      timestamp: Date.now()
    };
    setBattleEffects(prev => [...prev.slice(-5), newEffect]);
  };

  // Clean up old effects
  useEffect(() => {
    const cleanup = setInterval(() => {
      setBattleEffects(prev => prev.filter(effect => Date.now() - effect.timestamp < 2000));
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  const PixelCharacterDisplay = ({ character, side, isActive }: { 
    character: any; 
    side: 'left' | 'right'; 
    isActive: boolean;
  }) => {
    const auraIntensity = isActive ? 1 : 0.5;
    const bounce = isActive ? 'animate-bounce' : '';

    return (
      <div className={`relative ${bounce}`}>
        {/* Character Aura */}
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${character.aura?.color || '#3B82F6'}40 0%, transparent 70%)`,
            transform: `scale(${1 + auraIntensity * 0.2})`
          }}
        />
        
        {/* Character Avatar */}
        <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${
          character.class === 'monk' ? 'from-amber-700 to-orange-800' :
          character.class === 'samurai' ? 'from-red-700 to-red-900' :
          'from-purple-800 to-gray-900'
        } flex items-center justify-center border-4 border-white/20 shadow-2xl relative overflow-hidden`}>
          
          {/* Class Icon */}
          {character.class === 'monk' && <div className="w-12 h-12 text-white">🧘</div>}
          {character.class === 'samurai' && <Swords className="w-12 h-12 text-white" />}
          {character.class === 'phantom' && <div className="w-12 h-12 text-white">👤</div>}
          
          {/* Equipment Overlays */}
          {character.equipment?.mask !== 'none' && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
          )}
          
          {character.equipment?.weapon && character.equipment.weapon !== 'none' && (
            <div className={`absolute ${side === 'left' ? 'bottom-0 right-0' : 'bottom-0 left-0'} w-6 h-6 text-yellow-400`}>
              <Swords className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="text-center mt-2">
          <div className="text-sm font-bold text-white">
            {character.name || (character.class === 'monk' ? 'Monk' : character.class === 'samurai' ? 'Samurai' : 'Phantom')}
          </div>
          <div className="text-xs text-gray-400">
            Level {character.level || 1} • {character.xp || 0} XP
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-card border-red-500/20 bg-black/60 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Battle Header */}
        <div className="p-4 bg-gradient-to-r from-red-900/30 to-orange-900/30 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Swords className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Pixel Battle Arena</h3>
                <p className="text-sm text-gray-400">{marketData.symbol} Combat</p>
              </div>
            </div>
            
            {battlePhase !== 'result' && (
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AI Mentor Hint */}
        <div className="p-3 bg-blue-900/20 border-b border-blue-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="text-blue-300 text-sm font-medium">
              {marketData.aiHint || "Watch the price action carefully..."}
            </span>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="relative h-64 bg-gradient-to-b from-gray-900 via-purple-900/20 to-black overflow-hidden">
          {/* Cherry Blossom Background Effect */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-pink-300 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                🌸
              </div>
            ))}
          </div>

          {/* Battle Effects */}
          {battleEffects.map(effect => (
            <div
              key={effect.id}
              className="absolute pointer-events-none animate-ping"
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {effect.type === 'slash' && <span className="text-2xl">⚡</span>}
              {effect.type === 'block' && <span className="text-2xl">🛡️</span>}
              {effect.type === 'aura' && <span className="text-2xl">✨</span>}
            </div>
          ))}

          {/* Characters */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
            <PixelCharacterDisplay 
              character={{ ...playerCharacter, name: 'You' }} 
              side="left" 
              isActive={battlePhase === 'prediction'} 
            />
          </div>

          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <PixelCharacterDisplay 
              character={{ ...opponentCharacter, name: 'Opponent' }} 
              side="right" 
              isActive={battlePhase === 'waiting'} 
            />
          </div>

          {/* VS Symbol */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
              <span className="text-white font-bold text-xl">VS</span>
            </div>
          </div>

          {/* Market Price Display */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-500/30">
              <div className="text-center">
                <div className="text-yellow-400 text-sm font-medium">{marketData.symbol}</div>
                <div className="text-white text-lg font-bold">{marketData.currentPrice.toFixed(4)}</div>
              </div>
            </div>
          </div>

          {/* Battle Phase Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            {battlePhase === 'prediction' && (
              <Badge className="bg-blue-600 text-white animate-pulse">
                Choose Your Stance!
              </Badge>
            )}
            {battlePhase === 'waiting' && (
              <Badge className="bg-yellow-600 text-white animate-pulse">
                Battle in Progress...
              </Badge>
            )}
            {battlePhase === 'result' && result && (
              <Badge className={`${result.winner === 'player' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                {result.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}
              </Badge>
            )}
          </div>
        </div>

        {/* Battle Controls */}
        <div className="p-4 bg-gradient-to-r from-gray-900/50 to-purple-900/50">
          {battlePhase === 'prediction' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-300 mb-4">
                  Where will {marketData.symbol} move in the next 5 minutes?
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    onPrediction('up');
                    addBattleEffect('slash', 25, 50);
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-lg font-semibold"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  BULLISH STRIKE
                </Button>
                
                <Button
                  onClick={() => {
                    onPrediction('down');
                    addBattleEffect('slash', 75, 50);
                  }}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 h-12 text-lg font-semibold"
                >
                  <TrendingDown className="w-5 h-5 mr-2" />
                  BEARISH ATTACK
                </Button>
              </div>
            </div>
          )}

          {battlePhase === 'waiting' && (
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-400 mb-2">
                Watching the Battle Unfold...
              </div>
              <Progress value={(30 - timeLeft) * (100/30)} className="mb-2" />
              <p className="text-gray-400 text-sm">May the best trader win!</p>
            </div>
          )}

          {battlePhase === 'result' && result && (
            <div className="text-center space-y-4">
              <div className={`text-3xl font-bold ${result.winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                {result.winner === 'player' ? '🏆 VICTORY!' : '💀 DEFEAT'}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                  <div className="text-blue-400 text-sm">XP Gained</div>
                  <div className="text-white text-xl font-bold">+{result.xpGained}</div>
                </div>
                <div className="text-center p-3 bg-purple-900/20 rounded-lg">
                  <div className="text-purple-400 text-sm">Prediction</div>
                  <div className={`text-lg font-bold ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {result.correct ? 'CORRECT' : 'WRONG'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPixelBattle;
