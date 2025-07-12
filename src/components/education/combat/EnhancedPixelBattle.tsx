
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CombatChart from './CombatChart';
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
  BarChart3,
  Settings
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
  onCustomizeCharacter?: () => void;
}

const EnhancedPixelBattle = ({
  playerCharacter,
  opponentCharacter,
  marketData,
  onPrediction,
  timeLeft,
  battlePhase,
  result,
  onCustomizeCharacter
}: PixelBattleProps) => {
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const [battleEffects, setBattleEffects] = useState<Array<{
    id: number;
    type: 'slash' | 'energy' | 'impact';
    x: number;
    y: number;
    timestamp: number;
  }>>([]);

  // Generate realistic market scenario data
  const [scenarioData, setScenarioData] = useState(() => {
    const scenarios = [
      {
        name: "Breaking Resistance",
        description: "Price is testing a major resistance level. Bulls are gathering strength!",
        candles: generateScenarioCandles('breakout'),
        hint: "Watch for volume spike and strong close above resistance"
      },
      {
        name: "Support Bounce",
        description: "Bears pushed price down but support is holding strong!",
        hint: "Look for rejection wicks and bullish divergence"
      },
      {
        name: "Liquidity Hunt",
        description: "Smart money is hunting stops below recent lows...",
        hint: "Expect fake-out then reversal - be patient!"
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  });

  function generateScenarioCandles(type: string) {
    const candles = [];
    let basePrice = 1.0850;
    
    for (let i = 0; i < 30; i++) {
      const volatility = 0.0005 + Math.random() * 0.0003;
      const trend = type === 'breakout' ? 0.0001 : type === 'bounce' ? -0.0001 : 0;
      
      const open = basePrice;
      const close = open + (Math.random() - 0.5) * volatility + trend;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      candles.push({
        timestamp: Date.now() - (30 - i) * 60000,
        open,
        high,
        low,
        close,
        volume: 1000 + Math.random() * 500
      });
      
      basePrice = close;
    }
    
    return candles;
  }

  const currentCandles = scenarioData.candles || generateScenarioCandles('neutral');

  // Animation loop for breathing characters
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 60);
      
      // Clean up old battle effects
      setBattleEffects(prev => 
        prev.filter(effect => Date.now() - effect.timestamp < 1000)
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const addBattleEffect = (type: 'slash' | 'energy' | 'impact', x: number, y: number) => {
    const newEffect = {
      id: Date.now(),
      type,
      x,
      y,
      timestamp: Date.now()
    };
    setBattleEffects(prev => [...prev, newEffect]);
  };

  const DetailedPixelWarrior = ({ character, side, isPlayer }: { 
    character: any; 
    side: 'left' | 'right'; 
    isPlayer: boolean;
  }) => {
    const breatheOffset = Math.sin(animationFrame * 0.2) * 2;
    const isReadyStance = timeLeft <= 10 && battlePhase === 'prediction';
    const isStriking = isAttacking && ((isPlayer && selectedDirection) || (!isPlayer && battlePhase === 'waiting'));
    const isVictorious = result && ((isPlayer && result.winner === 'player') || (!isPlayer && result.winner === 'opponent'));
    const isDefeated = result && ((isPlayer && result.winner === 'opponent') || (!isPlayer && result.winner === 'player'));

    // Street Fighter style emotions
    const getExpression = () => {
      if (isVictorious) return 'victorious';
      if (isDefeated) return 'defeated';
      if (isStriking) return 'attacking';
      if (isReadyStance) return 'focused';
      return 'neutral';
    };

    const expression = getExpression();

    if (character.class === 'monk') {
      return (
        <div className="relative" style={{ transform: `translateY(${breatheOffset}px) ${isStriking ? 'scale(1.1)' : ''}` }}>
          {/* Enhanced Monk with Street Fighter quality */}
          <div className="relative w-40 h-52">
            {/* Dynamic Aura based on state */}
            <div className={`absolute inset-0 scale-110 transition-all duration-300 ${
              isVictorious ? 'animate-pulse' : isStriking ? 'animate-bounce' : ''
            }`}>
              <div className={`w-full h-full rounded-full animate-pulse blur-md ${
                isVictorious ? 'bg-yellow-400/30' : 
                isStriking ? 'bg-cyan-500/40' : 
                'bg-cyan-400/20'
              }`} />
              <div className="absolute inset-2 bg-cyan-300/10 rounded-full animate-ping" />
            </div>
            
            {/* Main Body with enhanced details */}
            <div className="relative z-10">
              {/* Head with dynamic expression */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg pixel-art border-3 border-amber-600 shadow-lg">
                {/* Dynamic Eyes based on expression */}
                <div className={`absolute top-4 left-3 w-2 h-2 bg-black rounded-full transition-all ${
                  expression === 'attacking' ? 'w-3 h-1' : 
                  expression === 'focused' ? 'w-1 h-3' :
                  expression === 'victorious' ? 'animate-bounce' :
                  expression === 'defeated' ? 'opacity-50' : ''
                }`} />
                <div className={`absolute top-4 right-3 w-2 h-2 bg-black rounded-full transition-all ${
                  expression === 'attacking' ? 'w-3 h-1' : 
                  expression === 'focused' ? 'w-1 h-3' :
                  expression === 'victorious' ? 'animate-bounce' :
                  expression === 'defeated' ? 'opacity-50' : ''
                }`} />
                
                {/* Dynamic Mouth */}
                <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 transition-all ${
                  expression === 'victorious' ? 'w-6 h-2 bg-white rounded-full' :
                  expression === 'attacking' ? 'w-4 h-3 bg-red-600 rounded-full' :
                  expression === 'defeated' ? 'w-4 h-1 bg-gray-600 rounded' :
                  'w-3 h-1 bg-gray-700 rounded'
                }`} />
                
                {/* Beard */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-lg" />
              </div>
              
              {/* Enhanced Golden Hat with details */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-18 h-8 bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 rounded-t-lg border-3 border-yellow-200 shadow-lg">
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              
              {/* Enhanced Robe with battle damage */}
              <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-cyan-400 via-cyan-600 to-cyan-800 rounded-lg pixel-art border-3 border-cyan-300 shadow-xl transition-all ${
                isDefeated ? 'opacity-75 grayscale' : ''
              }`}>
                {/* Battle scars if defeated */}
                {isDefeated && (
                  <div className="absolute top-2 right-2 w-4 h-1 bg-red-600 rounded transform rotate-45" />
                )}
                
                {/* Enhanced Sash */}
                <div className="absolute top-3 left-0 right-0 h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 border-y border-yellow-300 shadow-inner" />
                
                {/* Enhanced Arms with muscle definition */}
                <div className={`absolute top-6 -left-3 w-8 h-12 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded-lg border-2 border-cyan-400 shadow-lg transition-transform ${
                  isStriking ? 'rotate-12 scale-110' : ''
                }`} />
                <div className={`absolute top-6 -right-3 w-8 h-12 bg-gradient-to-b from-cyan-500 to-cyan-700 rounded-lg border-2 border-cyan-400 shadow-lg transition-transform ${
                  isStriking ? '-rotate-12 scale-110' : ''
                }`} />
              </div>
              
              {/* Enhanced Mystical Staff */}
              <div className={`absolute ${side === 'left' ? '-right-6' : '-left-6'} top-12 transition-all duration-300 ${
                isReadyStance ? 'animate-pulse scale-105' : ''
              } ${isStriking ? 'animate-bounce scale-125 rotate-12' : ''}`}>
                <div className="w-4 h-36 bg-gradient-to-b from-amber-600 via-amber-800 to-amber-900 rounded-full pixel-art shadow-lg border border-amber-500">
                  {/* Enhanced Staff Orb with power level */}
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full animate-pulse border-3 border-cyan-200 shadow-lg ${
                    isStriking ? 'bg-cyan-300 animate-spin' :
                    isVictorious ? 'bg-yellow-400 animate-bounce' :
                    'bg-cyan-400'
                  }`}>
                    <div className="absolute inset-1 bg-white/30 rounded-full animate-ping" />
                  </div>
                  
                  {/* Power rings around staff */}
                  {(isStriking || isVictorious) && (
                    <>
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-cyan-400/50 rounded-full animate-pulse" />
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-cyan-400/30 rounded-full animate-pulse" />
                    </>
                  )}
                </div>
              </div>
              
              {/* Enhanced Legs */}
              <div className="absolute top-36 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <div className="w-5 h-12 bg-gradient-to-b from-cyan-600 to-cyan-800 rounded-lg pixel-art border border-cyan-500 shadow-lg" />
                <div className="w-5 h-12 bg-gradient-to-b from-cyan-600 to-cyan-800 rounded-lg pixel-art border border-cyan-500 shadow-lg" />
              </div>
              
              {/* Enhanced Spirit Fox companion */}
              <div className={`absolute -bottom-2 -left-10 w-12 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg pixel-art border-2 border-orange-300 shadow-lg transition-all ${
                isStriking ? 'animate-bounce' : 'animate-pulse'
              }`}>
                <div className={`absolute top-2 left-2 w-1 h-1 bg-black rounded-full ${
                  isStriking ? 'bg-red-500' : ''
                }`} />
                <div className={`absolute top-2 right-3 w-1 h-1 bg-black rounded-full ${
                  isStriking ? 'bg-red-500' : ''
                }`} />
                <div className="absolute -right-2 top-3 w-8 h-3 bg-orange-700 rounded-full shadow-lg" />
                <div className="absolute top-0 left-2 w-2 h-3 bg-orange-300 rounded-t-full transform -rotate-12" />
                <div className="absolute top-0 right-2 w-2 h-3 bg-orange-300 rounded-t-full transform rotate-12" />
              </div>
            </div>
          </div>
          
          {/* Enhanced Character Info */}
          <div className="text-center mt-6">
            <div className={`text-cyan-400 text-xl font-bold pixel-font transition-all ${
              isVictorious ? 'text-yellow-400 animate-pulse' :
              isDefeated ? 'text-gray-500' : ''
            }`}>
              {isVictorious ? '🏆 ' : isDefeated ? '💀 ' : '🧘 '}
              Wandering Monk
            </div>
            <div className="text-cyan-300 text-sm">Level 13 • 1250 XP</div>
            <div className="text-xs text-gray-400 flex items-center justify-center space-x-2">
              <span>🧘 Meditation Master</span>
              {isPlayer && (
                <button
                  onClick={onCustomizeCharacter}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {/* Battle stats */}
            <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div className="text-blue-400">WIS</div>
                <div className="text-white font-bold">85</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">STL</div>
                <div className="text-white font-bold">60</div>
              </div>
              <div className="text-center">
                <div className="text-red-400">AGG</div>
                <div className="text-white font-bold">35</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Enhanced Samurai with Street Fighter quality
      return (
        <div className="relative" style={{ transform: `translateY(${breatheOffset}px) ${isStriking ? 'scale(1.1)' : ''}` }}>
          <div className="relative w-40 h-52">
            {/* Dynamic Red Aura */}
            <div className={`absolute inset-0 scale-110 transition-all duration-300 ${
              isVictorious ? 'animate-pulse' : isStriking ? 'animate-bounce' : ''
            }`}>
              <div className={`w-full h-full rounded-full animate-pulse blur-md ${
                isVictorious ? 'bg-yellow-400/30' : 
                isStriking ? 'bg-red-600/50' : 
                'bg-red-500/20'
              }`} />
              <div className="absolute inset-2 bg-red-400/10 rounded-full animate-ping" />
            </div>
            
            <div className="relative z-10">
              {/* Enhanced Head with Demon Mask */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-red-200 to-red-400 rounded-lg pixel-art border-3 border-red-600 shadow-lg">
                {/* Enhanced Demon Mask */}
                <div className={`absolute inset-2 bg-gradient-to-br from-red-800 to-red-900 rounded border-2 border-red-700 shadow-inner transition-all ${
                  isStriking ? 'animate-pulse' : ''
                }`}>
                  <div className={`absolute top-2 left-2 w-2 h-2 rounded-full transition-all ${
                    expression === 'attacking' ? 'bg-red-400 animate-pulse' :
                    expression === 'victorious' ? 'bg-yellow-400 animate-bounce' :
                    expression === 'defeated' ? 'bg-gray-600' :
                    'bg-yellow-400'
                  }`} />
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full transition-all ${
                    expression === 'attacking' ? 'bg-red-400 animate-pulse' :
                    expression === 'victorious' ? 'bg-yellow-400 animate-bounce' :
                    expression === 'defeated' ? 'bg-gray-600' :
                    'bg-yellow-400'
                  }`} />
                  <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-white rounded transition-all ${
                    expression === 'attacking' ? 'bg-red-200' :
                    expression === 'defeated' ? 'bg-gray-400' : ''
                  }`} />
                </div>
              </div>
              
              {/* Enhanced Horned Helmet */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-18 h-8 bg-gradient-to-b from-gray-600 via-gray-800 to-black rounded-t-lg border-3 border-gray-500 shadow-lg">
                <div className={`absolute -top-2 left-3 w-3 h-6 bg-red-600 transform rotate-12 shadow-lg transition-all ${
                  isStriking ? 'bg-red-400 animate-pulse' : ''
                }`} />
                <div className={`absolute -top-2 right-3 w-3 h-6 bg-red-600 transform -rotate-12 shadow-lg transition-all ${
                  isStriking ? 'bg-red-400 animate-pulse' : ''
                }`} />
              </div>
              
              {/* Enhanced Dark Armor */}
              <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-gray-700 via-gray-900 to-black rounded-lg pixel-art border-3 border-gray-600 shadow-xl transition-all ${
                isDefeated ? 'opacity-75 grayscale' : ''
              }`}>
                {/* Battle damage */}
                {isDefeated && (
                  <>
                    <div className="absolute top-3 left-3 w-6 h-1 bg-red-600 rounded transform rotate-45" />
                    <div className="absolute top-3 left-3 w-6 h-1 bg-red-600 rounded transform -rotate-45" />
                  </>
                )}
                
                {/* Enhanced Red Accents */}
                <div className="absolute top-3 left-3 right-3 h-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 border border-red-400 shadow-inner" />
                <div className="absolute top-8 left-3 right-3 h-2 bg-red-500 shadow-inner" />
                
                {/* Enhanced Shoulder Plates */}
                <div className={`absolute top-0 -left-4 w-10 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg border-2 border-gray-500 transform -rotate-12 shadow-lg transition-transform ${
                  isStriking ? 'scale-110' : ''
                }`} />
                <div className={`absolute top-0 -right-4 w-10 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg border-2 border-gray-500 transform rotate-12 shadow-lg transition-transform ${
                  isStriking ? 'scale-110' : ''
                }`} />
              </div>
              
              {/* Enhanced Aasakira Katana */}
              <div className={`absolute ${side === 'left' ? '-right-8' : '-left-8'} top-8 transition-all duration-300 ${
                isReadyStance ? 'animate-bounce scale-105' : ''
              } ${isStriking ? 'animate-pulse scale-125 -rotate-12' : ''}`}>
                {/* Sword Handle */}
                <div className="w-4 h-16 bg-gradient-to-b from-red-800 via-red-900 to-black rounded-lg pixel-art border-2 border-red-700 shadow-lg" />
                
                {/* Enhanced Blade with flame effect */}
                <div className={`absolute -top-24 left-1/2 transform -translate-x-1/2 w-3 h-28 bg-gradient-to-t from-gray-200 via-gray-100 to-white rounded-t-full border-2 border-gray-300 shadow-lg transition-all ${
                  isStriking ? 'animate-pulse' : ''
                }`}>
                  {/* Flame Effect */}
                  <div className={`absolute inset-0 rounded-t-full transition-all ${
                    isStriking ? 'bg-red-400/60 animate-pulse' :
                    isVictorious ? 'bg-yellow-400/40 animate-pulse' :
                    'bg-red-400/30'
                  }`} />
                  
                  {/* Power trail when striking */}
                  {isStriking && (
                    <div className="absolute -right-2 top-4 w-8 h-2 bg-red-400/50 rounded-full animate-ping" />
                  )}
                </div>
                
                {/* Enhanced Guard */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded shadow-lg" />
              </div>
              
              {/* Enhanced Legs */}
              <div className="absolute top-36 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <div className="w-5 h-12 bg-gradient-to-b from-gray-700 to-black rounded-lg pixel-art border border-gray-600 shadow-lg" />
                <div className="w-5 h-12 bg-gradient-to-b from-gray-700 to-black rounded-lg pixel-art border border-gray-600 shadow-lg" />
              </div>
              
              {/* Enhanced Mechanical Dragon */}
              <div className={`absolute -bottom-2 -right-12 w-16 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg pixel-art border-2 border-gray-500 shadow-lg transition-all ${
                isStriking ? 'animate-bounce' : 'animate-pulse'
              }`}>
                <div className={`absolute top-2 left-2 w-1 h-1 rounded-full animate-pulse ${
                  isStriking ? 'bg-red-400' : 'bg-red-400'
                }`} />
                <div className={`absolute top-2 right-3 w-1 h-1 rounded-full animate-pulse ${
                  isStriking ? 'bg-red-400' : 'bg-red-400'
                }`} />
                <div className="absolute -right-3 top-3 w-12 h-4 bg-gray-600 rounded-full shadow-lg" />
                <div className="absolute top-6 left-3 right-3 h-3 bg-red-500 animate-pulse rounded" />
                <div className="absolute top-1 left-4 w-3 h-2 bg-gray-400 rounded transform -rotate-12" />
                <div className="absolute top-1 right-4 w-3 h-2 bg-gray-400 rounded transform rotate-12" />
              </div>
            </div>
          </div>
          
          {/* Enhanced Character Info */}
          <div className="text-center mt-6">
            <div className={`text-red-400 text-xl font-bold pixel-font transition-all ${
              isVictorious ? 'text-yellow-400 animate-pulse' :
              isDefeated ? 'text-gray-500' : ''
            }`}>
              {isVictorious ? '🏆 ' : isDefeated ? '💀 ' : '⚔️ '}
              Rising Samurai
            </div>
            <div className="text-red-300 text-sm">Level 14 • 1450 XP</div>
            <div className="text-xs text-gray-400 flex items-center justify-center space-x-2">
              <span>⚔️ Aasakira Katana</span>
              {isPlayer && (
                <button
                  onClick={onCustomizeCharacter}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {/* Battle stats */}
            <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div className="text-blue-400">WIS</div>
                <div className="text-white font-bold">60</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">STL</div>
                <div className="text-white font-bold">35</div>
              </div>
              <div className="text-center">
                <div className="text-red-400">AGG</div>
                <div className="text-white font-bold">85</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const handlePrediction = (direction: 'up' | 'down') => {
    setSelectedDirection(direction);
    setIsAttacking(true);
    onPrediction(direction);
    
    // Add battle effects
    addBattleEffect('slash', 50, 50);
    if (direction === 'up') {
      addBattleEffect('energy', 30, 40);
    } else {
      addBattleEffect('energy', 70, 60);
    }
    
    // Reset animation after 1 second
    setTimeout(() => {
      setIsAttacking(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden pixel-battle-arena">
      {/* Enhanced Dojo Background */}
      <div className="absolute inset-0">
        {/* Dynamic gradient based on battle phase */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          battlePhase === 'result' && result?.winner === 'player' ? 'bg-gradient-to-b from-yellow-900/40 via-black to-yellow-800/30' :
          battlePhase === 'result' && result?.winner === 'opponent' ? 'bg-gradient-to-b from-red-900/40 via-black to-red-800/30' :
          battlePhase === 'waiting' ? 'bg-gradient-to-b from-purple-900/50 via-black to-purple-800/40' :
          'bg-gradient-to-b from-purple-900/40 via-black to-purple-800/30'
        }`} />
        
        {/* Enhanced Dojo Floor with reflections */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700 border-t-4 border-amber-600 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute top-0 left-1/4 right-1/4 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
          
          {/* Floor pattern */}
          <div className="absolute top-4 left-0 right-0 flex justify-center space-x-8">
            <div className="w-2 h-2 bg-amber-500 rounded-full opacity-60" />
            <div className="w-2 h-2 bg-amber-500 rounded-full opacity-60" />
            <div className="w-2 h-2 bg-amber-500 rounded-full opacity-60" />
          </div>
        </div>
        
        {/* Enhanced Dojo Architecture */}
        <div className="absolute left-12 bottom-40 w-8 h-52 bg-gradient-to-t from-red-900 via-red-800 to-red-700 rounded-t-lg border-3 border-red-600 shadow-xl">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-red-800 rounded" />
        </div>
        <div className="absolute right-12 bottom-40 w-8 h-52 bg-gradient-to-t from-red-900 via-red-800 to-red-700 rounded-t-lg border-3 border-red-600 shadow-xl">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-red-800 rounded" />
        </div>
        
        {/* Enhanced Sakura Tree */}
        <div className="absolute right-20 bottom-40 w-32 h-60 opacity-40">
          <div className="w-6 h-40 bg-gradient-to-t from-gray-800 to-gray-700 mx-auto rounded-t-lg shadow-lg" />
          <div className="absolute top-12 left-6 w-20 h-20 bg-pink-900/30 rounded-full animate-pulse" />
          <div className="absolute top-16 left-4 w-16 h-16 bg-pink-800/30 rounded-full animate-pulse" />
          <div className="absolute top-20 right-4 w-12 h-12 bg-pink-900/30 rounded-full animate-pulse" />
          
          {/* Falling petals */}
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-pink-300 animate-float opacity-60"
                style={{
                  left: `${20 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '6s'
                }}
              >
                🌸
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced Floating Lanterns with glow */}
        <div className="absolute left-16 top-1/4 w-10 h-16 bg-gradient-to-b from-orange-500 to-orange-700 rounded-lg border-3 border-orange-400 animate-pulse shadow-lg">
          <div className="absolute inset-2 bg-yellow-400 rounded opacity-80 animate-pulse" />
          <div className="absolute -inset-2 bg-orange-400/20 rounded-lg blur-md animate-pulse" />
        </div>
        <div className="absolute right-16 top-1/4 w-10 h-16 bg-gradient-to-b from-orange-500 to-orange-700 rounded-lg border-3 border-orange-400 animate-pulse shadow-lg">
          <div className="absolute inset-2 bg-yellow-400 rounded opacity-80 animate-pulse" />
          <div className="absolute -inset-2 bg-orange-400/20 rounded-lg blur-md animate-pulse" />
        </div>
      </div>

      {/* Battle Effects */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {battleEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              animation: 'battleEffect 1s ease-out forwards'
            }}
          >
            {effect.type === 'slash' && (
              <div className="text-yellow-400 text-6xl font-bold transform rotate-45 animate-pulse">⚡</div>
            )}
            {effect.type === 'energy' && (
              <div className="w-16 h-16 bg-purple-500/60 rounded-full animate-ping" />
            )}
            {effect.type === 'impact' && (
              <div className="text-red-500 text-8xl animate-bounce">💥</div>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Top UI */}
      <div className="absolute top-8 left-0 right-0 z-20">
        {/* Market Scenario Info */}
        <div className="absolute left-8 top-0">
          <div className="bg-black/95 border-4 border-green-400 rounded-lg p-4 pixel-border shadow-xl">
            <div className="text-green-400 text-lg font-bold pixel-font">{marketData.symbol}</div>
            <div className="text-green-300 text-2xl font-bold">{marketData.currentPrice}</div>
            <div className="text-yellow-400 text-xs mt-1">{scenarioData.name}</div>
            <div className="text-gray-300 text-xs">{scenarioData.description}</div>
          </div>
        </div>

        {/* Enhanced Timer */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0">
          <div className={`bg-black/95 rounded-lg px-8 py-4 pixel-border shadow-xl transition-all ${
            timeLeft <= 10 ? 'border-4 border-red-500 animate-pulse' :
            timeLeft <= 30 ? 'border-4 border-yellow-500' :
            'border-4 border-green-500'
          }`}>
            <div className={`text-4xl font-bold pixel-font transition-colors ${
              timeLeft <= 10 ? 'text-red-400 animate-pulse' :
              timeLeft <= 30 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Enhanced Battle Status */}
        <div className="absolute right-8 top-0">
          <div className="bg-black/95 border-4 border-purple-400 rounded-lg p-3 pixel-border shadow-xl">
            <div className="text-purple-400 text-sm font-bold pixel-font mb-2">Battle Status</div>
            <div className="space-y-1 text-xs">
              <div className={`flex items-center space-x-2 ${
                battlePhase === 'prediction' ? 'text-yellow-400' :
                battlePhase === 'waiting' ? 'text-blue-400' :
                'text-green-400'
              }`}>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>{
                  battlePhase === 'prediction' ? 'Choose Strike' :
                  battlePhase === 'waiting' ? 'Battle Active' :
                  'Results'
                }</span>
              </div>
              {selectedDirection && (
                <div className="text-white">
                  Your move: <span className={selectedDirection === 'up' ? 'text-green-400' : 'text-red-400'}>
                    {selectedDirection === 'up' ? '🐂 Bullish' : '🐻 Bearish'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Mentor with scenario hints */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20 max-w-2xl">
        <div className="bg-cyan-500/95 rounded-lg p-4 border-4 border-cyan-300 pixel-border relative shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-cyan-700 rounded-full flex items-center justify-center pixel-art shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white text-lg font-bold pixel-font">
                Master's Wisdom
              </div>
              <div className="text-cyan-100 text-sm">
                {scenarioData.hint || marketData.aiHint}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chart Integration */}
      <div className="absolute top-48 left-1/2 transform -translate-x-1/2 z-20">
        <Card className="bg-black/90 border-purple-500/50">
          <CardContent className="p-4">
            <CombatChart
              candles={currentCandles}
              currentPrice={marketData.currentPrice}
              bullPower={selectedDirection === 'up' ? 75 : 25}
              bearPower={selectedDirection === 'down' ? 75 : 25}
              volatilityAlert={timeLeft <= 5}
              priceDirection={selectedDirection || 'up'}
              width={500}
              height={200}
            />
          </CardContent>
        </Card>
      </div>

      {/* Characters */}
      <div className="absolute bottom-48 left-20 z-15">
        <DetailedPixelWarrior character={playerCharacter} side="left" isPlayer={true} />
      </div>

      <div className="absolute bottom-48 right-20 z-15">
        <DetailedPixelWarrior character={opponentCharacter} side="right" isPlayer={false} />
      </div>

      {/* Enhanced Battle Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        {battlePhase === 'prediction' && (
          <div className="flex space-x-8">
            <button
              onClick={() => handlePrediction('up')}
              className="relative group pixel-battle-button"
            >
              <div className="w-48 h-20 bg-gradient-to-b from-green-400 via-green-600 to-green-800 border-4 border-green-300 rounded-lg flex items-center justify-center hover:scale-105 transition-all pixel-art shadow-xl">
                <div className="text-center">
                  <div className="text-white font-bold text-xl pixel-font">🐂 BULLISH STRIKE</div>
                  <div className="text-green-100 text-sm">Price will rise!</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-green-400/40 rounded-lg blur-lg animate-pulse scale-110 -z-10" />
            </button>

            <button
              onClick={() => handlePrediction('down')}
              className="relative group pixel-battle-button"
            >
              <div className="w-48 h-20 bg-gradient-to-b from-red-400 via-red-600 to-red-800 border-4 border-red-300 rounded-lg flex items-center justify-center hover:scale-105 transition-all pixel-art shadow-xl">
                <div className="text-center">
                  <div className="text-white font-bold text-xl pixel-font">🐻 BEARISH ATTACK</div>
                  <div className="text-red-100 text-sm">Price will fall!</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-red-400/40 rounded-lg blur-lg animate-pulse scale-110 -z-10" />
            </button>
          </div>
        )}

        {battlePhase === 'waiting' && (
          <div className="text-center">
            <div className="text-yellow-400 text-3xl font-bold pixel-font mb-4 animate-pulse">
              ⚔️ BATTLE IN PROGRESS ⚔️
            </div>
            <div className="text-white text-lg mb-4">
              Analyzing market movement...
            </div>
            <div className="w-96 h-8 bg-gray-800 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-1000 animate-pulse"
                style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        {battlePhase === 'result' && result && (
          <div className="text-center space-y-6">
            <div className={`text-6xl font-bold pixel-font animate-bounce ${
              result.winner === 'player' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {result.winner === 'player' ? '🏆 VICTORY!' : '⚔️ DEFEAT'}
            </div>
            
            <div className="text-white text-xl mb-4">
              {result.correct ? 
                'Your prediction was correct! The market moved as expected.' :
                'Your prediction was wrong. Study the patterns more carefully.'
              }
            </div>
            
            <div className="flex space-x-8 justify-center">
              <div className="bg-black/90 border-4 border-blue-400 rounded-lg p-6 text-center pixel-border shadow-xl">
                <div className="text-blue-400 text-lg font-bold pixel-font">XP GAINED</div>
                <div className="text-white text-4xl font-bold">+{result.xpGained}</div>
              </div>
              <div className="bg-black/90 border-4 border-purple-400 rounded-lg p-6 text-center pixel-border shadow-xl">
                <div className="text-purple-400 text-lg font-bold pixel-font">PREDICTION</div>
                <div className={`text-2xl font-bold ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {result.correct ? '✅ CORRECT' : '❌ WRONG'}
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
