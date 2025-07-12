
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Swords, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Shield,
  Target,
  Flame,
  Crown
} from 'lucide-react';

interface PriceAction {
  price: number;
  direction: 'up' | 'down';
  strength: 'weak' | 'medium' | 'strong';
  timestamp: number;
}

interface BattleEffect {
  id: string;
  type: 'slash' | 'block' | 'break' | 'explosion';
  x: number;
  y: number;
  timestamp: number;
}

interface BattlefieldVisualizationProps {
  currentPrice: number;
  priceHistory: PriceAction[];
  supportLevel: number;
  resistanceLevel: number;
  isActive: boolean;
  playerPrediction?: 'up' | 'down';
  opponentPrediction?: 'up' | 'down';
}

const BattlefieldVisualization = ({
  currentPrice,
  priceHistory,
  supportLevel,
  resistanceLevel,
  isActive,
  playerPrediction,
  opponentPrediction
}: BattlefieldVisualizationProps) => {
  const [battleEffects, setBattleEffects] = useState<BattleEffect[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
      
      // Clean up old effects
      setBattleEffects(prev => 
        prev.filter(effect => Date.now() - effect.timestamp < 2000)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (priceHistory.length < 2) return;

    const latest = priceHistory[priceHistory.length - 1];
    const previous = priceHistory[priceHistory.length - 2];

    // Generate battle effects based on price action
    if (latest.price > previous.price) {
      // Bull rush forward
      addBattleEffect('slash', Math.random() * 100, 60);
    } else if (latest.price < previous.price) {
      // Bear attack
      addBattleEffect('slash', Math.random() * 100, 40);
    }

    // Check for level breaks
    if (latest.price > resistanceLevel && previous.price <= resistanceLevel) {
      addBattleEffect('break', 80, 20);
    } else if (latest.price < supportLevel && previous.price >= supportLevel) {
      addBattleEffect('break', 20, 80);
    }

    // Check for strong rejections
    if (latest.strength === 'strong') {
      addBattleEffect('explosion', 50, 50);
    }
  }, [priceHistory, supportLevel, resistanceLevel]);

  const addBattleEffect = (type: BattleEffect['type'], x: number, y: number) => {
    const newEffect: BattleEffect = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
      timestamp: Date.now()
    };
    setBattleEffects(prev => [...prev, newEffect]);
  };

  const getBattlegroundStyle = () => {
    const priceRange = resistanceLevel - supportLevel;
    const pricePosition = ((currentPrice - supportLevel) / priceRange) * 100;
    
    return {
      background: `linear-gradient(to top, 
        rgba(239, 68, 68, 0.1) 0%, 
        rgba(59, 130, 246, 0.1) ${100 - pricePosition}%, 
        rgba(34, 197, 94, 0.1) 100%)`
    };
  };

  const renderWarrior = (side: 'player' | 'opponent', prediction?: 'up' | 'down') => {
    const isLeft = side === 'player';
    const baseX = isLeft ? 15 : 85;
    const warriorClass = prediction === 'up' ? 'samurai' : prediction === 'down' ? 'oni' : 'neutral';
    
    return (
      <div 
        className={`absolute transition-all duration-500 ${
          prediction ? 'animate-bounce' : ''
        }`}
        style={{ 
          left: `${baseX}%`, 
          top: '45%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className={`relative w-12 h-12 ${
          warriorClass === 'samurai' 
            ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
            : warriorClass === 'oni'
            ? 'bg-gradient-to-br from-red-500 to-orange-500'
            : 'bg-gradient-to-br from-gray-600 to-gray-800'
        } rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg`}>
          {prediction === 'up' ? (
            <TrendingUp className="w-6 h-6 text-white" />
          ) : prediction === 'down' ? (
            <TrendingDown className="w-6 h-6 text-white" />
          ) : (
            <Swords className="w-6 h-6 text-white" />
          )}
        </div>
        
        {/* Prediction aura */}
        {prediction && (
          <div className={`absolute inset-0 rounded-full animate-ping ${
            prediction === 'up' ? 'bg-blue-400' : 'bg-red-400'
          } opacity-20`} />
        )}
      </div>
    );
  };

  const renderBattleEffect = (effect: BattleEffect) => {
    const age = Date.now() - effect.timestamp;
    const opacity = Math.max(0, 1 - (age / 2000));
    
    return (
      <div
        key={effect.id}
        className="absolute pointer-events-none"
        style={{
          left: `${effect.x}%`,
          top: `${effect.y}%`,
          opacity,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {effect.type === 'slash' && (
          <div className="text-yellow-400 text-2xl animate-pulse">⚡</div>
        )}
        {effect.type === 'block' && (
          <Shield className="w-8 h-8 text-blue-400 animate-spin" />
        )}
        {effect.type === 'break' && (
          <div className="text-red-500 text-3xl animate-bounce">💥</div>
        )}
        {effect.type === 'explosion' && (
          <Flame className="w-10 h-10 text-orange-500 animate-ping" />
        )}
      </div>
    );
  };

  return (
    <Card className="glass-card border-red-500/20 bg-black/40 overflow-hidden">
      <CardContent className="p-0">
        {/* Battle Status Header */}
        <div className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Swords className="w-5 h-5 text-red-400" />
              <span className="text-white font-semibold">Live Battlefield</span>
              {isActive && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  COMBAT ACTIVE
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400">{resistanceLevel}</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{currentPrice}</div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400">{supportLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Battlefield */}
        <div 
          className="relative h-64 overflow-hidden"
          style={getBattlegroundStyle()}
        >
          {/* Price Level Lines */}
          <div className="absolute top-4 left-0 right-0 border-t-2 border-red-500/50 border-dashed">
            <span className="absolute right-2 -top-4 text-xs text-red-400">Resistance</span>
          </div>
          <div className="absolute bottom-4 left-0 right-0 border-t-2 border-green-500/50 border-dashed">
            <span className="absolute right-2 -bottom-4 text-xs text-green-400">Support</span>
          </div>

          {/* Current Price Line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-yellow-400 shadow-lg"
            style={{ 
              top: `${100 - ((currentPrice - supportLevel) / (resistanceLevel - supportLevel)) * 100}%` 
            }}
          >
            <div className="absolute right-2 -top-6 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
              {currentPrice}
            </div>
          </div>

          {/* Warriors */}
          {renderWarrior('player', playerPrediction)}
          {renderWarrior('opponent', opponentPrediction)}

          {/* Battle Effects */}
          {battleEffects.map(renderBattleEffect)}

          {/* Energy Waves */}
          {isActive && (
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse"
                style={{
                  transform: `translateX(${(animationFrame * 5) % 200 - 100}px)`
                }}
              />
            </div>
          )}

          {/* Combat Instructions */}
          {!playerPrediction && !opponentPrediction && isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white bg-black/60 px-6 py-4 rounded-lg">
                <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <h3 className="font-bold mb-1">Choose Your Battle Stance!</h3>
                <p className="text-sm text-gray-300">Will the samurai charge upward or will the oni drag prices down?</p>
              </div>
            </div>
          )}
        </div>

        {/* Battle Stats Footer */}
        <div className="p-3 bg-gradient-to-r from-gray-900/40 to-purple-900/40 border-t border-purple-500/20">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-400">Bull Force</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-gray-400">Bear Power</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-400">Market Energy: High</span>
              </div>
            </div>
            <div className="text-purple-400">
              Effects: {battleEffects.length} active
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattlefieldVisualization;
