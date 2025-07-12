
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Swords, 
  Users, 
  Trophy,
  Target,
  Gamepad2,
  Palette
} from 'lucide-react';
import PixelAvatarDesigner from './PixelAvatarDesigner';
import EnhancedPixelBattle from './EnhancedPixelBattle';

interface PixelDojoProps {
  userStats: {
    xp: number;
    wins: number;
    losses: number;
    streak: number;
    points: number;
  };
  onFeatureUse?: () => void;
}

const PixelDojo = ({ userStats, onFeatureUse }: PixelDojoProps) => {
  const [playerCharacter, setPlayerCharacter] = useState<any>(null);
  const [currentBattle, setCurrentBattle] = useState<any>(null);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);

  const handleCharacterCreate = (character: any) => {
    setPlayerCharacter(character);
    onFeatureUse?.();
  };

  const findMatch = () => {
    setIsSearchingMatch(true);
    
    // Simulate finding a match
    setTimeout(() => {
      const opponents = [
        { name: 'DragonPips', class: 'samurai', level: 12, xp: 1200 },
        { name: 'ShadowMonk', class: 'monk', level: 8, xp: 800 },
        { name: 'NightPhantom', class: 'phantom', level: 15, xp: 1500 }
      ];
      
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      
      setCurrentBattle({
        opponent,
        marketData: {
          symbol: 'EUR/USD',
          currentPrice: 1.0850,
          priceHistory: [1.0845, 1.0847, 1.0849, 1.0850],
          aiHint: 'Watch for liquidity below the last swing low at 1.0845'
        },
        timeLeft: 30,
        battlePhase: 'prediction'
      });
      
      setIsSearchingMatch(false);
    }, 2000);
  };

  const handlePrediction = (direction: 'up' | 'down') => {
    if (!currentBattle) return;
    
    setCurrentBattle(prev => ({
      ...prev,
      playerPrediction: direction,
      battlePhase: 'waiting',
      timeLeft: 10
    }));
    
    // Simulate battle result
    setTimeout(() => {
      const isWin = Math.random() > 0.3; // 70% win rate for demo
      setCurrentBattle(prev => ({
        ...prev,
        battlePhase: 'result',
        result: {
          winner: isWin ? 'player' : 'opponent',
          xpGained: isWin ? 25 : 10,
          correct: isWin
        }
      }));
      
      // Auto-close battle after 5 seconds
      setTimeout(() => {
        setCurrentBattle(null);
      }, 5000);
    }, 10000);
  };

  if (!playerCharacter) {
    return (
      <div className="space-y-6">
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-6 text-center">
            <Crown className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold gradient-text mb-4">Welcome to the Pixel Dojo</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Create your unique pixel warrior and enter the ultimate trading battle arena. 
              Choose your class, customize your appearance, and prove your skills against other traders.
            </p>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-lg">
              🏮 AASAKIRA PIXEL DOJO 🏮
            </Badge>
          </CardContent>
        </Card>

        <PixelAvatarDesigner
          userStats={userStats}
          onCharacterCreate={handleCharacterCreate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dojo Header */}
      <Card className="glass-card border-gradient-to-r from-red-500/20 to-orange-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-orange-800 rounded-lg flex items-center justify-center">
                <Swords className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">Pixel Battle Dojo</h2>
                <p className="text-gray-400">Your warrior awaits combat</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-400">{userStats.xp} XP</div>
              <div className="text-sm text-gray-400">
                {userStats.wins}W / {userStats.losses}L
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="battle" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="battle" className="data-[state=active]:bg-red-600">
            <Swords className="w-4 h-4 mr-2" />
            Battle Arena
          </TabsTrigger>
          <TabsTrigger value="customize" className="data-[state=active]:bg-purple-600">
            <Palette className="w-4 h-4 mr-2" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-yellow-600">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="battle" className="space-y-6">
          {currentBattle ? (
            <EnhancedPixelBattle
              playerCharacter={playerCharacter}
              opponentCharacter={currentBattle.opponent}
              marketData={currentBattle.marketData}
              onPrediction={handlePrediction}
              timeLeft={currentBattle.timeLeft}
              battlePhase={currentBattle.battlePhase}
              result={currentBattle.result}
            />
          ) : (
            <Card className="glass-card border-blue-500/20">
              <CardContent className="p-8 text-center">
                {isSearchingMatch ? (
                  <div className="space-y-4">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
                    <h3 className="text-xl font-bold text-white">Finding Worthy Opponent...</h3>
                    <p className="text-gray-400">Matching you with a skilled trader</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Target className="w-20 h-20 mx-auto text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ready for Battle?</h3>
                      <p className="text-gray-400 mb-6">
                        Test your trading skills against other pixel warriors in real-time market battles
                      </p>
                    </div>
                    
                    {/* Character Preview */}
                    <div className="inline-block p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-700 to-orange-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-white font-semibold">{playerCharacter.name}</div>
                        <div className="text-xs text-gray-400">Level {playerCharacter.level}</div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={findMatch}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold px-8 py-3 text-lg"
                    >
                      <Swords className="w-5 h-5 mr-2" />
                      Enter Battle Arena
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          <PixelAvatarDesigner
            userStats={userStats}
            selectedClass={playerCharacter.class}
            onCharacterCreate={handleCharacterCreate}
          />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="glass-card border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                <h3 className="text-xl font-bold text-white">Pixel Warrior Rankings</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'ShadowMaster', class: 'phantom', level: 25, xp: 2500, wins: 89 },
                  { rank: 2, name: 'BladeStorm', class: 'samurai', level: 23, xp: 2300, wins: 76 },
                  { rank: 3, name: 'ZenTrader', class: 'monk', level: 21, xp: 2100, wins: 68 },
                  { rank: 4, name: 'DragonFX', class: 'samurai', level: 19, xp: 1900, wins: 55 },
                  { rank: 5, name: 'MysticPips', class: 'monk', level: 18, xp: 1800, wins: 42 }
                ].map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20' 
                        : 'bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${
                        player.rank === 1 ? 'text-yellow-400' :
                        player.rank === 2 ? 'text-gray-300' :
                        player.rank === 3 ? 'text-orange-400' : 'text-gray-500'
                      }`}>
                        #{player.rank}
                      </div>
                      
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        player.class === 'monk' ? 'bg-gradient-to-br from-amber-700 to-orange-800' :
                        player.class === 'samurai' ? 'bg-gradient-to-br from-red-700 to-red-900' :
                        'bg-gradient-to-br from-purple-800 to-gray-900'
                      }`}>
                        {player.class === 'monk' && <Mountain className="w-6 h-6 text-white" />}
                        {player.class === 'samurai' && <Swords className="w-6 h-6 text-white" />}
                        {player.class === 'phantom' && <Users className="w-6 h-6 text-white" />}
                      </div>
                      
                      <div>
                        <div className="font-semibold text-white">{player.name}</div>
                        <div className="text-sm text-gray-400">
                          Level {player.level} • {player.xp} XP
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-green-400">{player.wins} Wins</div>
                      <div className="text-xs text-gray-400">Pixel Warrior</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PixelDojo;
