
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Swords, 
  Trophy, 
  Target, 
  Clock,
  TrendingUp,
  TrendingDown,
  Crown,
  Fire,
  Zap,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CombatMatch {
  id: string;
  opponent: string;
  currency: string;
  timeframe: string;
  prediction: 'up' | 'down' | null;
  result: 'win' | 'lose' | 'pending';
  points: number;
  timestamp: Date;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  wins: number;
  losses: number;
  streak: number;
  points: number;
  title: string;
}

const CombatMode = () => {
  const [activeMatch, setActiveMatch] = useState<CombatMatch | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userStats, setUserStats] = useState({
    wins: 12,
    losses: 3,
    streak: 5,
    points: 1847,
    rank: 23,
    title: 'Rising Samurai'
  });
  const { toast } = useToast();

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, username: 'ShadowTrader', wins: 89, losses: 11, streak: 15, points: 4521, title: 'Legendary Shogun' },
    { rank: 2, username: 'DragonSlayer', wins: 76, losses: 24, streak: 8, points: 3892, title: 'Elite Ronin' },
    { rank: 3, username: 'NinjaFX', wins: 68, losses: 32, streak: 12, points: 3456, title: 'Master Warrior' },
    { rank: 4, username: 'SamuraiPips', wins: 55, losses: 25, streak: 6, points: 2876, title: 'Skilled Fighter' },
    { rank: 5, username: 'BladeMaster', wins: 42, losses: 18, streak: 9, points: 2234, title: 'Rising Samurai' }
  ];

  // Timer for active matches
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeMatch && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeMatch) {
      // Auto-resolve match when time runs out
      resolveMatch();
    }
    return () => clearInterval(interval);
  }, [activeMatch, timeLeft]);

  const findMatch = () => {
    setIsSearching(true);
    
    // Simulate finding an opponent
    setTimeout(() => {
      const currencies = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'];
      const opponents = ['DragonPips', 'NinjaTrader', 'SamuraiFX', 'BladeRunner', 'ShadowHawk'];
      
      const newMatch: CombatMatch = {
        id: Date.now().toString(),
        opponent: opponents[Math.floor(Math.random() * opponents.length)],
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        timeframe: '5M',
        prediction: null,
        result: 'pending',
        points: 0,
        timestamp: new Date()
      };
      
      setActiveMatch(newMatch);
      setTimeLeft(30); // 30 seconds to make prediction
      setIsSearching(false);
      
      toast({
        title: "Combat Match Found!",
        description: `You're facing ${newMatch.opponent} on ${newMatch.currency}`,
      });
    }, 2000);
  };

  const makePrediction = (direction: 'up' | 'down') => {
    if (!activeMatch) return;
    
    setActiveMatch(prev => prev ? { ...prev, prediction: direction } : null);
    
    toast({
      title: "Prediction Locked!",
      description: `You predicted ${direction.toUpperCase()} for ${activeMatch.currency}`,
    });
    
    // Start result countdown
    setTimeLeft(10);
  };

  const resolveMatch = () => {
    if (!activeMatch) return;
    
    // Simulate match result (70% win rate for demo)
    const isWin = Math.random() > 0.3;
    const points = isWin ? 50 : -25;
    
    setActiveMatch(prev => prev ? {
      ...prev,
      result: isWin ? 'win' : 'lose',
      points: points
    } : null);
    
    // Update user stats
    setUserStats(prev => ({
      ...prev,
      wins: isWin ? prev.wins + 1 : prev.wins,
      losses: !isWin ? prev.losses + 1 : prev.losses,
      streak: isWin ? prev.streak + 1 : 0,
      points: prev.points + points
    }));
    
    toast({
      title: isWin ? "Victory! 🏆" : "Defeat 💀",
      description: `${isWin ? 'You won' : 'You lost'} ${Math.abs(points)} points`,
      variant: isWin ? "default" : "destructive"
    });
    
    // Clear match after 3 seconds
    setTimeout(() => {
      setActiveMatch(null);
      setTimeLeft(0);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Combat Stats Header */}
      <Card className="glass-card border-red-500/20 bg-gradient-to-r from-red-900/10 to-orange-900/10">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <Swords className="w-6 h-6 mr-2" />
            Combat Arena
            <Badge className="ml-2 bg-gradient-to-r from-red-500 to-orange-500">
              {userStats.title}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{userStats.wins}</div>
              <div className="text-sm text-gray-400">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{userStats.losses}</div>
              <div className="text-sm text-gray-400">Losses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{userStats.streak}</div>
              <div className="text-sm text-gray-400">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{userStats.points}</div>
              <div className="text-sm text-gray-400">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">#{userStats.rank}</div>
              <div className="text-sm text-gray-400">Global Rank</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combat Arena */}
        <Card className="glass-card border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-400" />
                Battle Arena
              </div>
              {timeLeft > 0 && (
                <div className="flex items-center text-yellow-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!activeMatch && !isSearching && (
              <div className="text-center py-8">
                <Swords className="w-16 h-16 mx-auto text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Ready for Combat?</h3>
                <p className="text-gray-400 mb-4">
                  Challenge other traders in real-time prediction battles
                </p>
                <Button 
                  onClick={findMatch}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  Find Match
                </Button>
              </div>
            )}

            {isSearching && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-white mb-2">Finding Opponent...</h3>
                <p className="text-gray-400">Matching you with a worthy challenger</p>
              </div>
            )}

            {activeMatch && (
              <div className="space-y-4">
                <div className="text-center border border-red-500/20 rounded-lg p-4 bg-red-900/10">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-white font-semibold">VS {activeMatch.opponent}</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {activeMatch.currency}
                  </div>
                  <div className="text-sm text-gray-400">
                    {activeMatch.timeframe} Timeframe
                  </div>
                </div>

                {!activeMatch.prediction && timeLeft > 10 && (
                  <div className="space-y-3">
                    <p className="text-center text-gray-300">
                      Where will {activeMatch.currency} move in the next 5 minutes?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => makePrediction('up')}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        UP
                      </Button>
                      <Button
                        onClick={() => makePrediction('down')}
                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                      >
                        <TrendingDown className="w-4 h-4 mr-2" />
                        DOWN
                      </Button>
                    </div>
                  </div>
                )}

                {activeMatch.prediction && activeMatch.result === 'pending' && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-400 mb-2">
                      Prediction: {activeMatch.prediction.toUpperCase()}
                    </div>
                    <div className="text-gray-400">Waiting for market result...</div>
                    <Progress value={(10 - timeLeft) * 10} className="mt-2" />
                  </div>
                )}

                {activeMatch.result !== 'pending' && (
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${
                      activeMatch.result === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {activeMatch.result === 'win' ? 'VICTORY!' : 'DEFEAT'}
                    </div>
                    <div className="text-lg text-gray-300">
                      {activeMatch.result === 'win' ? '+' : ''}{activeMatch.points} points
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="glass-card border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-400">
              <Trophy className="w-5 h-5 mr-2" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.rank <= 3 
                      ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20' 
                      : 'bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-bold ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-300' :
                      entry.rank === 3 ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                      #{entry.rank}
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.rank === 1 && <Crown className="w-4 h-4 text-yellow-400" />}
                      {entry.streak >= 10 && <Fire className="w-4 h-4 text-red-400" />}
                      <div>
                        <div className="font-semibold text-white">{entry.username}</div>
                        <div className="text-xs text-gray-400">{entry.title}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-400">{entry.points}</div>
                    <div className="text-xs text-gray-400">
                      {entry.wins}W / {entry.losses}L
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combat Rewards */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <Zap className="w-5 h-5 mr-2" />
            Combat Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-green-500/20 rounded-lg bg-green-900/10">
              <Trophy className="w-8 h-8 mx-auto text-green-400 mb-2" />
              <div className="font-semibold text-green-400">Win Streak 5</div>
              <div className="text-sm text-gray-400">+100 Bonus Points</div>
            </div>
            <div className="text-center p-4 border border-yellow-500/20 rounded-lg bg-yellow-900/10">
              <Crown className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
              <div className="font-semibold text-yellow-400">Top 10 Rank</div>
              <div className="text-sm text-gray-400">Exclusive Badge</div>
            </div>
            <div className="text-center p-4 border border-purple-500/20 rounded-lg bg-purple-900/10">
              <Fire className="w-8 h-8 mx-auto text-purple-400 mb-2" />
              <div className="font-semibold text-purple-400">Daily Champion</div>
              <div className="text-sm text-gray-400">Premium Features</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CombatMode;
