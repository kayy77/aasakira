import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Trophy,
  Users,
  Zap,
  Clock,
  DollarSign,
  BarChart3,
  Crown,
  Star
} from 'lucide-react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { useToast } from '@/hooks/use-toast';

interface TradePredicton {
  direction: 'long' | 'short';
  entry: number;
  takeProfit: number;
  stopLoss: number;
}

interface GameMatch {
  id: string;
  opponent: string;
  pair: string;
  status: 'waiting' | 'active' | 'completed';
  timeLeft: number;
  playerPrediction?: TradePredicton;
  opponentPrediction?: TradePredicton;
  result?: 'win' | 'lose' | 'draw';
  xpGained?: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  wins: number;
  losses: number;
  winRate: number;
  badge: string;
}

const SkillBasedTradingGame = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const [gameMode, setGameMode] = useState<'menu' | 'matchmaking' | 'game' | 'results'>('menu');
  const [currentMatch, setCurrentMatch] = useState<GameMatch | null>(null);
  const [prediction, setPrediction] = useState<Partial<TradePredicton>>({});
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [userStats, setUserStats] = useState({
    xp: 1250,
    rank: 15,
    wins: 23,
    losses: 8,
    winRate: 74.2,
    badge: 'Silver Trader'
  });
  
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, username: 'TradeMaster', xp: 5420, wins: 89, losses: 23, winRate: 79.5, badge: 'Elite Champion' },
    { rank: 2, username: 'ChartWizard', xp: 4890, wins: 76, losses: 19, winRate: 80.0, badge: 'Grand Master' },  
    { rank: 3, username: 'PipHunter', xp: 4156, wins: 68, losses: 25, winRate: 73.1, badge: 'Master Trader' },
    { rank: 4, username: 'YoungWolf', xp: 3980, wins: 61, losses: 22, winRate: 73.5, badge: 'Diamond Pro' },
    { rank: 5, username: 'You', xp: userStats.xp, wins: userStats.wins, losses: userStats.losses, winRate: userStats.winRate, badge: userStats.badge }
  ]);

  const { toast } = useToast();

  const generateChartData = (pair: string): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let basePrice = pair === 'EURUSD' ? 1.0850 : pair === 'XAUUSD' ? 2050.50 : 147.25;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 100; i >= 1; i--) {
      const time = (now - i * 300) as UTCTimestamp; // 5-minute candles
      const volatility = pair === 'XAUUSD' ? 15 : pair === 'EURUSD' ? 0.002 : 0.8;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = basePrice;
      const close = basePrice + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      
      data.push({ time, open, high, low, close });
      basePrice = close;
    }
    
    setCurrentPrice(data[data.length - 1].close);
    return data;
  };

  useEffect(() => {
    if (chartRef.current && gameMode === 'game') {
      chart.current = createChart(chartRef.current, {
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#ffffff',
        },
        grid: {
          vertLines: { color: '#333' },
          horzLines: { color: '#333' },
        },
        width: chartRef.current.clientWidth,
        height: 400,
      });

      candleSeries.current = chart.current.addCandlestickSeries({
        upColor: '#4ade80',
        downColor: '#f87171',
        borderVisible: false,
        wickUpColor: '#4ade80',
        wickDownColor: '#f87171',
      });

      return () => {
        if (chart.current) {
          chart.current.remove();
        }
      };
    }
  }, [gameMode]);

  useEffect(() => {
    if (candleSeries.current && currentMatch) {
      const data = generateChartData(currentMatch.pair);
      setChartData(data);
      candleSeries.current.setData(data);
    }
  }, [currentMatch]);

  const startMatchmaking = (mode: '1v1' | 'bot') => {
    setGameMode('matchmaking');
    
    setTimeout(() => {
      const pairs = ['EURUSD', 'XAUUSD', 'USDJPY', 'GBPUSD'];
      const opponents = mode === 'bot' ? ['AI Bot'] : ['TradingNinja', 'ChartMaster', 'PipSeeker'];
      
      const match: GameMatch = {
        id: Date.now().toString(),
        opponent: opponents[Math.floor(Math.random() * opponents.length)],
        pair: pairs[Math.floor(Math.random() * pairs.length)],
        status: 'active',
        timeLeft: 60
      };
      
      setCurrentMatch(match);
      setGameMode('game');
      
      toast({
        title: "Match Found! 🎯",
        description: `Trading ${match.pair} against ${match.opponent}`
      });
    }, 2000);
  };

  const submitPrediction = () => {
    if (!currentMatch || !prediction.direction || !prediction.entry || !prediction.takeProfit || !prediction.stopLoss) {
      toast({
        title: "Incomplete Prediction",
        description: "Please fill in all trade parameters",
        variant: "destructive"
      });
      return;
    }

    const playerPrediction: TradePredicton = {
      direction: prediction.direction,
      entry: prediction.entry,
      takeProfit: prediction.takeProfit,
      stopLoss: prediction.stopLoss
    };

    setCurrentMatch(prev => prev ? { ...prev, playerPrediction } : null);
    
    setTimeout(() => {
      resolveMatch(playerPrediction);
    }, 3000);
  };

  const resolveMatch = (playerPrediction: TradePredicton) => {
    if (!currentMatch) return;

    const priceMove = (Math.random() - 0.5) * 0.02; // ±2% movement
    const finalPrice = currentPrice * (1 + priceMove);
    
    const directionCorrect = (priceMove > 0 && playerPrediction.direction === 'long') || 
                           (priceMove < 0 && playerPrediction.direction === 'short');
    
    const entryAccuracy = Math.max(0, 100 - Math.abs((playerPrediction.entry - currentPrice) / currentPrice * 100));
    const tpAccuracy = Math.max(0, 100 - Math.abs((playerPrediction.takeProfit - finalPrice) / finalPrice * 100));
    
    const totalScore = (directionCorrect ? 50 : 0) + (entryAccuracy * 0.3) + (tpAccuracy * 0.2);
    const opponentScore = Math.random() * 100; // Simulate opponent score
    
    const won = totalScore > opponentScore;
    const xpGained = won ? 50 + Math.floor(totalScore * 0.5) : Math.floor(totalScore * 0.2);
    
    setCurrentMatch(prev => prev ? {
      ...prev,
      status: 'completed',
      result: won ? 'win' : 'lose',
      xpGained
    } : null);

    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + xpGained,
      wins: won ? prev.wins + 1 : prev.wins,
      losses: won ? prev.losses : prev.losses + 1,
      winRate: ((won ? prev.wins + 1 : prev.wins) / (prev.wins + prev.losses + 1)) * 100
    }));

    setGameMode('results');
    
    toast({
      title: won ? "Victory! 🏆" : "Good Try! 💪",
      description: `${won ? 'You won' : 'You earned'} ${xpGained} XP`,
      variant: won ? "default" : "destructive"
    });
  };

  const resetGame = () => {
    setGameMode('menu');
    setCurrentMatch(null);
    setPrediction({});
  };

  if (gameMode === 'menu') {
    return (
      <div className="space-y-6">
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-purple-400">
              <div className="flex items-center">
                <Crown className="w-6 h-6 mr-2" />
                Your Trading Profile
              </div>
              <Badge className="bg-purple-600 text-white">{userStats.badge}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{userStats.xp}</div>
                <div className="text-sm text-gray-400">XP Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">#{userStats.rank}</div>
                <div className="text-sm text-gray-400">Global Rank</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{userStats.wins}W</div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{userStats.winRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                1v1 Duel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Challenge real traders in live prediction battles. Test your skills against the community!
              </p>
              <Button 
                onClick={() => startMatchmaking('1v1')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Find Opponent
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-500/20 hover:border-blue-500/40 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <Zap className="w-6 h-6 mr-2" />
                Practice vs AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Train your skills against our intelligent AI bot. Perfect for honing your strategy!
              </p>
              <Button 
                onClick={() => startMatchmaking('bot')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Start Practice
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.username === 'You' 
                      ? 'bg-purple-900/30 border border-purple-500/30' 
                      : entry.rank <= 3 
                        ? 'bg-yellow-900/20 border border-yellow-500/20'
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
                    <div>
                      <div className="font-semibold text-white flex items-center">
                        {entry.username}
                        {entry.rank <= 3 && <Crown className="w-4 h-4 ml-2 text-yellow-400" />}
                      </div>
                      <div className="text-xs text-gray-400">{entry.badge}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-400">{entry.xp} XP</div>
                    <div className="text-xs text-gray-400">
                      {entry.winRate.toFixed(1)}% WR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameMode === 'matchmaking') {
    return (
      <Card className="glass-card border-purple-500/20">
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-white mb-2">Finding Your Match...</h3>
          <p className="text-gray-400">Connecting you with a worthy opponent</p>
        </CardContent>
      </Card>
    );
  }

  if (gameMode === 'game' && currentMatch) {
    return (
      <div className="space-y-6">
        <Card className="glass-card border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <Target className="w-6 h-6 mr-2 text-green-400" />
                {currentMatch.pair} Trading Duel
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-red-600">VS {currentMatch.opponent}</Badge>
                <Badge className="bg-blue-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {currentMatch.timeLeft}s
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={chartRef} className="w-full h-96 bg-gray-900 rounded-lg mb-4" />
            
            <div className="text-center mb-4">
              <div className="text-sm text-gray-400">Current Price</div>
              <div className="text-2xl font-bold text-white">
                {currentPrice.toFixed(currentMatch.pair === 'XAUUSD' ? 2 : 5)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400">Your Trade Prediction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setPrediction(prev => ({ ...prev, direction: 'long' }))}
                variant={prediction.direction === 'long' ? "default" : "outline"}
                className={prediction.direction === 'long' ? "bg-green-600" : ""}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                LONG
              </Button>
              <Button
                onClick={() => setPrediction(prev => ({ ...prev, direction: 'short' }))}
                variant={prediction.direction === 'short' ? "default" : "outline"}
                className={prediction.direction === 'short' ? "bg-red-600" : ""}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                SHORT
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Entry Price</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder={currentPrice.toFixed(5)}
                  value={prediction.entry || ''}
                  onChange={(e) => setPrediction(prev => ({ ...prev, entry: parseFloat(e.target.value) }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Take Profit</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="TP Level"
                  value={prediction.takeProfit || ''}
                  onChange={(e) => setPrediction(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Stop Loss</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="SL Level"
                  value={prediction.stopLoss || ''}
                  onChange={(e) => setPrediction(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
            </div>

            <Button
              onClick={submitPrediction}
              disabled={!prediction.direction || !prediction.entry || !prediction.takeProfit || !prediction.stopLoss}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              size="lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Submit Prediction
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameMode === 'results' && currentMatch) {
    return (
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              currentMatch.result === 'win' ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentMatch.result === 'win' ? '🏆 VICTORY!' : '💪 GOOD FIGHT!'}
            </div>
            <div className="text-lg text-gray-300">
              +{currentMatch.xpGained} XP Earned
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-sm text-gray-400">Your Score</div>
              <div className="text-2xl font-bold text-white">85/100</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-sm text-gray-400">{currentMatch.opponent}</div>
              <div className="text-2xl font-bold text-white">72/100</div>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={resetGame} className="w-full bg-green-600 hover:bg-green-700">
              Play Again
            </Button>
            <Button 
              onClick={() => setGameMode('menu')} 
              variant="outline" 
              className="w-full border-gray-600"
            >
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <div>Loading...</div>;
};

export default SkillBasedTradingGame;
