
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Swords, 
  User, 
  Trophy,
  Zap,
  Settings,
  Star,
  Target,
  Activity,
  Users,
  BookOpen,
  ShoppingBag
} from 'lucide-react';

import EnhancedPixelBattle from './EnhancedPixelBattle';
import CharacterStats from './CharacterStats';
import ItemShop from './ItemShop';
import TrainingHall from './TrainingHall';
import PixelAvatarDesigner from './PixelAvatarDesigner';

interface PixelDojoProps {
  userStats: {
    wins: number;
    losses: number;
    streak: number;
    points: number;
    xp: number;
    tradingStyle: string;
  };
  onFeatureUse?: () => void;
}

const PixelDojo = ({ userStats, onFeatureUse }: PixelDojoProps) => {
  const [activeTab, setActiveTab] = useState('battle');
  const [showCharacterCustomizer, setShowCharacterCustomizer] = useState(false);
  
  // Updated player character with all required properties
  const [playerCharacter, setPlayerCharacter] = useState({
    name: 'Shadow Warrior',
    class: 'monk' as 'monk' | 'samurai' | 'phantom',
    level: Math.floor(userStats.xp / 100) + 1,
    xp: userStats.xp,
    maxXp: (Math.floor(userStats.xp / 100) + 1) * 100,
    equipment: {
      weapon: 'mystic_staff',
      armor: 'silk_robe',
      pet: 'spirit_fox'
    },
    stats: {
      wisdom: 85,
      stealth: 60,
      aggression: 35
    },
    titles: ['Novice Trader', 'Market Observer'],
    rank: 'Ronin'
  });

  // Updated opponent character with all required properties
  const [opponentCharacter, setOpponentCharacter] = useState({
    name: 'Steel Blade',
    class: 'samurai' as 'monk' | 'samurai' | 'phantom',
    level: Math.floor(userStats.xp / 100) + 1,
    xp: userStats.xp + 200,
    maxXp: (Math.floor(userStats.xp / 100) + 1) * 100,
    equipment: {
      weapon: 'katana',
      armor: 'battle_gi',
      pet: 'steel_dragon'
    },
    stats: {
      wisdom: 60,
      stealth: 35,
      aggression: 85
    },
    titles: ['Battle Tested', 'Swift Strike'],
    rank: 'Samurai'
  });

  // Battle state
  const [battlePhase, setBattlePhase] = useState<'prediction' | 'waiting' | 'result'>('prediction');
  const [timeLeft, setTimeLeft] = useState(60);
  const [battleResult, setBattleResult] = useState<any>(null);

  // Market scenario data
  const [marketData, setMarketData] = useState({
    symbol: 'EUR/USD',
    currentPrice: 1.0850,
    priceHistory: [1.0845, 1.0847, 1.0850],
    aiHint: 'Price is testing resistance at 1.0855. Watch for breakout confirmation.'
  });

  // Sample quests for TrainingHall
  const [quests] = useState([
    {
      id: 'basic_support_resistance',
      title: 'Support & Resistance Master',
      description: 'Learn to identify key levels where price bounces',
      type: 'education' as 'education' | 'battle' | 'mastery',
      difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' | 'Master',
      xpReward: 100,
      statBonus: { wisdom: 5 },
      requirements: ['Complete tutorial'],
      progress: 0,
      maxProgress: 3,
      completed: false,
      locked: false
    },
    {
      id: 'market_structure',
      title: 'Market Structure Analysis',
      description: 'Master the art of reading market flow and structure',
      type: 'education' as 'education' | 'battle' | 'mastery',
      difficulty: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced' | 'Master',
      xpReward: 250,
      statBonus: { wisdom: 10, stealth: 5 },
      requirements: ['Complete Support & Resistance Master'],
      progress: 0,
      maxProgress: 5,
      completed: false,
      locked: true
    }
  ]);

  // Timer for battle phases
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (battlePhase === 'prediction' || battlePhase === 'waiting') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (battlePhase === 'prediction') {
              setBattlePhase('waiting');
              return 30; // 30 seconds for battle resolution
            } else {
              // Battle finished, show results
              setBattlePhase('result');
              setBattleResult({
                winner: Math.random() > 0.5 ? 'player' : 'opponent',
                xpGained: 50 + Math.floor(Math.random() * 100),
                correct: Math.random() > 0.4 // 60% chance of being correct
              });
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [battlePhase]);

  const handlePrediction = (direction: 'up' | 'down') => {
    console.log(`Player predicted: ${direction}`);
    onFeatureUse?.();
  };

  const handleCharacterCreate = (character: any) => {
    setPlayerCharacter(prev => ({
      ...prev,
      ...character,
      level: Math.floor(userStats.xp / 100) + 1,
      xp: userStats.xp,
      maxXp: (Math.floor(userStats.xp / 100) + 1) * 100
    }));
    setShowCharacterCustomizer(false);
    onFeatureUse?.();
  };

  const handleStartQuest = (questId: string) => {
    console.log(`Starting quest: ${questId}`);
    onFeatureUse?.();
  };

  const handleClaimReward = (questId: string) => {
    console.log(`Claiming reward for quest: ${questId}`);
    onFeatureUse?.();
  };

  const handlePurchase = (itemId: string) => {
    console.log(`Purchasing item: ${itemId}`);
    onFeatureUse?.();
  };

  const startNewBattle = () => {
    setBattlePhase('prediction');
    setTimeLeft(60);
    setBattleResult(null);
    
    // Generate new market scenario
    const scenarios = [
      {
        symbol: 'EUR/USD',
        currentPrice: 1.0850 + (Math.random() - 0.5) * 0.01,
        hint: 'Bulls testing resistance - volume increasing!'
      },
      {
        symbol: 'GBP/USD',
        currentPrice: 1.2650 + (Math.random() - 0.5) * 0.01,
        hint: 'Support zone ahead - watch for bounce signals.'
      },
      {
        symbol: 'USD/JPY',
        currentPrice: 150.25 + (Math.random() - 0.5) * 2,
        hint: 'Range breakout incoming - be ready to strike!'
      }
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setMarketData(prev => ({
      ...prev,
      ...randomScenario,
      aiHint: randomScenario.hint
    }));
    
    onFeatureUse?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Dojo Header */}
      <Card className="glass-card border-gradient-to-r from-red-500/20 to-orange-500/20 bg-gradient-to-r from-red-900/10 to-orange-900/10">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center justify-center pixel-font">
              <Crown className="w-10 h-10 mr-4 text-yellow-400" />
              🏯 AASAKIRA PIXEL DOJO 🏯
              <Crown className="w-10 h-10 ml-4 text-yellow-400" />
            </h1>
            <p className="text-gray-300 text-lg">
              Where Trading Warriors Are Forged in Digital Fire
            </p>
            <div className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-lg rounded-full inline-block animate-pulse pixel-font">
              🔥 STREET FIGHTER STYLE BATTLES 🔥
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">{userStats.wins}</div>
              <div className="text-sm text-gray-300">Victories</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg border border-blue-500/20">
              <Zap className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">{userStats.streak}</div>
              <div className="text-sm text-gray-300">Win Streak</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
              <Star className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">{userStats.xp}</div>
              <div className="text-sm text-gray-300">Total XP</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-500/20">
              <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-400">Level {Math.floor(userStats.xp / 100) + 1}</div>
              <div className="text-sm text-gray-300">Warrior Rank</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dojo Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 p-1">
          <TabsTrigger value="battle" className="data-[state=active]:bg-red-600 pixel-font">
            <Swords className="w-4 h-4 mr-2" />
            Battle
          </TabsTrigger>
          <TabsTrigger value="character" className="data-[state=active]:bg-purple-600 pixel-font">
            <User className="w-4 h-4 mr-2" />
            Character
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-blue-600 pixel-font">
            <BookOpen className="w-4 h-4 mr-2" />
            Training
          </TabsTrigger>
          <TabsTrigger value="shop" className="data-[state=active]:bg-green-600 pixel-font">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-yellow-600 pixel-font">
            <Trophy className="w-4 h-4 mr-2" />
            Rankings
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-cyan-600 pixel-font">
            <Activity className="w-4 h-4 mr-2" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Battle Arena */}
        <TabsContent value="battle" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-4 pixel-font">
              ⚔️ LIVE BATTLE ARENA ⚔️
            </h2>
            
            {battlePhase === 'result' && (
              <Button
                onClick={startNewBattle}
                className="mb-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold pixel-font"
                size="lg"
              >
                <Target className="w-5 h-5 mr-2" />
                Start New Battle
              </Button>
            )}
            
            <div className="flex justify-center space-x-4 mb-4">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pixel-font">
                Battle Phase: {battlePhase.toUpperCase()}
              </Badge>
              <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white pixel-font">
                Time: {formatTime(timeLeft)}
              </Badge>
            </div>
          </div>

          <EnhancedPixelBattle
            playerCharacter={playerCharacter}
            opponentCharacter={opponentCharacter}
            marketData={marketData}
            onPrediction={handlePrediction}
            timeLeft={timeLeft}
            battlePhase={battlePhase}
            result={battleResult}
            onCustomizeCharacter={() => setShowCharacterCustomizer(true)}
          />
        </TabsContent>

        {/* Character Management */}
        <TabsContent value="character" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-4 pixel-font">
              👤 CHARACTER PROFILE 👤
            </h2>
            <Button
              onClick={() => setShowCharacterCustomizer(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold pixel-font"
              size="lg"
            >
              <Settings className="w-5 h-5 mr-2" />
              Customize Character
            </Button>
          </div>
          
          <CharacterStats character={playerCharacter} />
        </TabsContent>

        {/* Training Hall */}
        <TabsContent value="training" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-4 pixel-font">
              🎯 TRAINING HALL 🎯
            </h2>
            <p className="text-gray-400">
              Master your skills through focused training quests
            </p>
          </div>
          
          <TrainingHall
            quests={quests}
            onStartQuest={handleStartQuest}
            onClaimReward={handleClaimReward}
          />
        </TabsContent>

        {/* Item Shop */}
        <TabsContent value="shop" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-4 pixel-font">
              🏪 LEGENDARY GEAR SHOP 🏪
            </h2>
            <p className="text-gray-400">
              Acquire legendary weapons, armor, and companions
            </p>
          </div>
          
          <ItemShop
            userCurrency={{
              xp: userStats.xp,
              legendPoints: userStats.points
            }}
            onPurchase={handlePurchase}
          />
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-4 pixel-font">
              🏆 WARRIOR RANKINGS 🏆
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Global Rankings */}
            <Card className="glass-card border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center pixel-font">
                  <Crown className="w-5 h-5 mr-2" />
                  Global Champions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'DragonMaster', xp: 12500, class: 'samurai' },
                    { rank: 2, name: 'ZenTrader', xp: 11200, class: 'monk' },
                    { rank: 3, name: 'ShadowStrike', xp: 10800, class: 'phantom' }
                  ].map(player => (
                    <div key={player.rank} className="flex items-center justify-between p-2 bg-black/40 rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          player.rank === 1 ? 'bg-yellow-500' :
                          player.rank === 2 ? 'bg-gray-400' :
                          'bg-amber-600'
                        }`}>
                          <span className="text-black font-bold text-sm">#{player.rank}</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">{player.name}</div>
                          <div className="text-xs text-gray-400">{player.class}</div>
                        </div>
                      </div>
                      <div className="text-purple-400 font-bold">{player.xp} XP</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Champions */}
            <Card className="glass-card border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center pixel-font">
                  <Activity className="w-5 h-5 mr-2" />
                  Weekly Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'QuickStrike', wins: 25, streak: 8 },
                    { name: 'MarketMage', wins: 22, streak: 5 },
                    { name: 'BullKnight', wins: 20, streak: 7 }
                  ].map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-black/40 rounded">
                      <div className="text-white font-semibold">{player.name}</div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{player.wins} Wins</div>
                        <div className="text-xs text-gray-400">{player.streak} Streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Your Ranking */}
            <Card className="glass-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center pixel-font">
                  <Users className="w-5 h-5 mr-2" />
                  Your Standing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-purple-400">#{Math.floor(Math.random() * 500) + 100}</div>
                  <div className="text-gray-300">Global Rank</div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-black/40 rounded p-2">
                      <div className="text-green-400 font-bold">{userStats.wins}</div>
                      <div className="text-gray-400">Victories</div>
                    </div>
                    <div className="bg-black/40 rounded p-2">
                      <div className="text-red-400 font-bold">{userStats.losses}</div>
                      <div className="text-gray-400">Defeats</div>
                    </div>
                  </div>

                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pixel-font">
                    Rising Warrior
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Stats */}
        <TabsContent value="stats" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-4 pixel-font">
              📊 BATTLE STATISTICS 📊
            </h2>
          </div>
          
          <CharacterStats character={playerCharacter} />
        </TabsContent>
      </Tabs>

      {/* Character Customizer Modal */}
      {showCharacterCustomizer && (
        <PixelAvatarDesigner
          userStats={userStats}
          selectedClass={playerCharacter.class}
          onCharacterCreate={handleCharacterCreate}
          onClose={() => setShowCharacterCustomizer(false)}
        />
      )}
    </div>
  );
};

export default PixelDojo;
