
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  TrendingUp,
  TrendingDown,
  Star,
  Crown,
  Swords,
  Brain,
  Share2,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChartViewer from './ChartViewer';
import AITradeAnalysis from './AITradeAnalysis';
import { tradingDuelService, type TradeSubmission, type DuelMatch } from '@/services/tradingDuelService';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const TradingDuelGame = () => {
  const [activeTab, setActiveTab] = useState<'duel' | 'leaderboard' | 'history'>('duel');
  const [currentMatch, setCurrentMatch] = useState<DuelMatch | null>(null);
  const [gamePhase, setGamePhase] = useState<'loading' | 'trading' | 'analysis' | 'results'>('loading');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [userTrade, setUserTrade] = useState<TradeSubmission>({
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    reasoning: ''
  });
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    xp: 1250,
    rank: 'Silver III',
    wins: 23,
    losses: 12,
    winRate: 65.7
  });
  const { toast } = useToast();

  // Initialize match
  useEffect(() => {
    startNewMatch();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gamePhase === 'trading' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gamePhase === 'trading') {
      if (userTrade.entryPrice && userTrade.stopLoss && userTrade.takeProfit) {
        handleTradeSubmit();
      } else {
        toast({
          title: "Time's Up!",
          description: "Match ended without a complete trade submission.",
          variant: "destructive"
        });
        startNewMatch();
      }
    }
  }, [gamePhase, timeLeft, userTrade]);

  const startNewMatch = async () => {
    setGamePhase('loading');
    try {
      const match = await tradingDuelService.createMatch();
      setCurrentMatch(match);
      setTimeLeft(300);
      setUserTrade({
        entryPrice: '',
        stopLoss: '',
        takeProfit: '',
        reasoning: ''
      });
      setAiAnalysis(null);
      setMatchResult(null);
      setGamePhase('trading');
    } catch (error) {
      console.error('Failed to start match:', error);
      toast({
        title: "Match Error",
        description: "Failed to start new match. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTradeSubmit = async () => {
    if (!currentMatch || !userTrade.entryPrice || !userTrade.stopLoss || !userTrade.takeProfit) {
      toast({
        title: "Incomplete Trade",
        description: "Please fill in all trade parameters before submitting.",
        variant: "destructive"
      });
      return;
    }

    setGamePhase('analysis');
    
    try {
      // Get AI analysis
      const analysis = await tradingDuelService.analyzeTradeWithAI(userTrade, currentMatch);
      setAiAnalysis(analysis);

      // Calculate match result
      const result = await tradingDuelService.calculateMatchResult(
        userTrade, 
        currentMatch, 
        analysis.score
      );
      setMatchResult(result);

      // Update user stats
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + result.xpGained,
        wins: result.won ? prev.wins + 1 : prev.wins,
        losses: result.won ? prev.losses : prev.losses + 1,
        winRate: ((result.won ? prev.wins + 1 : prev.wins) / (prev.wins + prev.losses + 1)) * 100
      }));

      // Celebration effect if won
      if (result.won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setGamePhase('results');
    } catch (error) {
      console.error('Failed to submit trade:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit trade. Please try again.",
        variant: "destructive"
      });
      setGamePhase('trading');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateRiskReward = () => {
    if (!userTrade.entryPrice || !userTrade.stopLoss || !userTrade.takeProfit) return null;
    
    const entry = parseFloat(userTrade.entryPrice);
    const sl = parseFloat(userTrade.stopLoss);
    const tp = parseFloat(userTrade.takeProfit);
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    
    return reward / risk;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="glass-card border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">{userStats.xp}</div>
              <div className="text-sm text-gray-400">XP Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{userStats.rank}</div>
              <div className="text-sm text-gray-400">Current Rank</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{userStats.wins}W</div>
              <div className="text-sm text-gray-400">Victories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{userStats.winRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="duel" className="data-[state=active]:bg-red-600">
            <Swords className="w-4 h-4 mr-2" />
            Live Duel
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-yellow-600">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
            <Clock className="w-4 h-4 mr-2" />
            Match History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="duel" className="space-y-6">
          <AnimatePresence mode="wait">
            {gamePhase === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Setting up your trading duel...</p>
              </motion.div>
            )}

            {gamePhase === 'trading' && currentMatch && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Match Info */}
                <Card className="glass-card border-green-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Target className="w-6 h-6 mr-2 text-green-400" />
                        {currentMatch.pair} - {currentMatch.timeframe}
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={`${
                          timeLeft > 180 ? 'bg-green-600' : 
                          timeLeft > 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}>
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(timeLeft)}
                        </Badge>
                        <Badge className="bg-purple-600">
                          Match ID: {currentMatch.id.slice(-6)}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartViewer 
                      pair={currentMatch.pair}
                      timeframe={currentMatch.timeframe}
                      data={currentMatch.chartData}
                      userTrade={userTrade}
                    />
                  </CardContent>
                </Card>

                {/* Trade Input */}
                <Card className="glass-card border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-blue-400">
                      <Zap className="w-5 h-5 mr-2 inline" />
                      Your Trade Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Entry Price</label>
                        <Input
                          type="number"
                          step="0.00001"
                          placeholder="1.23456"
                          value={userTrade.entryPrice}
                          onChange={(e) => setUserTrade(prev => ({ ...prev, entryPrice: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Stop Loss</label>
                        <Input
                          type="number"
                          step="0.00001"
                          placeholder="1.23000"
                          value={userTrade.stopLoss}
                          onChange={(e) => setUserTrade(prev => ({ ...prev, stopLoss: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Take Profit</label>
                        <Input
                          type="number"
                          step="0.00001"
                          placeholder="1.24000"
                          value={userTrade.takeProfit}
                          onChange={(e) => setUserTrade(prev => ({ ...prev, takeProfit: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                    </div>

                    {calculateRiskReward() && (
                      <div className="flex items-center justify-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">
                            1:{calculateRiskReward()?.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">Risk:Reward</div>
                        </div>
                        <div className={`text-center ${
                          (calculateRiskReward() || 0) >= 2 ? 'text-green-400' : 
                          (calculateRiskReward() || 0) >= 1 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {(calculateRiskReward() || 0) >= 2 ? '✅ Good' : 
                           (calculateRiskReward() || 0) >= 1 ? '⚠️ Fair' : '❌ Poor'}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Trade Reasoning</label>
                      <Textarea
                        placeholder="Explain your trade setup (SMC concepts, technical analysis, etc.)"
                        value={userTrade.reasoning}
                        onChange={(e) => setUserTrade(prev => ({ ...prev, reasoning: e.target.value }))}
                        className="bg-gray-800 border-gray-600 min-h-[100px]"
                      />
                    </div>

                    <Button
                      onClick={handleTradeSubmit}
                      disabled={!userTrade.entryPrice || !userTrade.stopLoss || !userTrade.takeProfit}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3"
                      size="lg"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Submit Trade & Analyze
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {gamePhase === 'analysis' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-pulse" />
                <h3 className="text-xl font-bold text-white mb-2">AI Analysis in Progress</h3>
                <p className="text-gray-400">Analyzing your trade with smart money concepts...</p>
              </motion.div>
            )}

            {gamePhase === 'results' && aiAnalysis && matchResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <AITradeAnalysis 
                  analysis={aiAnalysis}
                  matchResult={matchResult}
                  userTrade={userTrade}
                  chartData={currentMatch?.chartData}
                />
                
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={startNewMatch}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Duel
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.share?.({
                        title: `Trading Duel ${matchResult.won ? 'Victory' : 'Battle'}`,
                        text: `Just ${matchResult.won ? 'won' : 'competed in'} a trading duel! Score: ${aiAnalysis.score}/10`,
                        url: window.location.href
                      });
                    }}
                    variant="outline"
                    className="border-purple-500/30 text-purple-400"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Result
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="glass-card border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Crown className="w-6 h-6 mr-2" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'TradeMaster', xp: 5420, winRate: 78.5 },
                  { rank: 2, name: 'ChartWizard', xp: 4890, winRate: 75.2 },
                  { rank: 3, name: 'SMCGuru', xp: 4156, winRate: 72.8 },
                  { rank: 4, name: 'You', xp: userStats.xp, winRate: userStats.winRate },
                  { rank: 5, name: 'PipHunter', xp: 3980, winRate: 69.1 }
                ].map((player, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    player.name === 'You' ? 'bg-purple-900/30 border border-purple-500/30' : 'bg-gray-800/30'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        player.rank === 1 ? 'bg-yellow-500' :
                        player.rank === 2 ? 'bg-gray-400' :
                        player.rank === 3 ? 'bg-amber-600' :
                        'bg-gray-600'
                      }`}>
                        <span className="text-black font-bold text-sm">#{player.rank}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{player.name}</div>
                        <div className="text-xs text-gray-400">{player.winRate}% Win Rate</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-400">{player.xp} XP</div>
                      <div className="text-xs text-gray-400">
                        {player.rank <= 3 && <Star className="w-3 h-3 inline mr-1 text-yellow-400" />}
                        {player.rank <= 10 ? 'Elite' : 'Rising'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="glass-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { pair: 'EUR/USD', result: 'Win', score: 8.5, xp: 45, time: '2 hours ago' },
                  { pair: 'GBP/JPY', result: 'Loss', score: 6.2, xp: 15, time: '5 hours ago' },
                  { pair: 'USD/CAD', result: 'Win', score: 9.1, xp: 52, time: '1 day ago' },
                  { pair: 'AUD/USD', result: 'Win', score: 7.8, xp: 38, time: '2 days ago' }
                ].map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        match.result === 'Win' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <div className="font-semibold text-white">{match.pair}</div>
                        <div className="text-xs text-gray-400">{match.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">Score: {match.score}/10</div>
                      <div className="text-xs text-purple-400">+{match.xp} XP</div>
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

export default TradingDuelGame;
