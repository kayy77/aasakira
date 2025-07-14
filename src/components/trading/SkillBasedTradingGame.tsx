
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Trophy, Target, TrendingUp, Clock, Users, Zap, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TradingData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const generateGameData = (): TradingData[] => {
  const now = new Date();
  const data: TradingData[] = [];
  let price = 100;

  for (let i = 0; i < 50; i++) {
    const time = new Date(now.getTime() - i * 60000).toISOString().slice(0, 16).replace('T', ' ');
    const change = Math.random() * 4 - 2;
    const open = price;
    price += change;
    const high = open + Math.random() * 2;
    const low = open - Math.random() * 2;
    const close = price;

    data.push({ time, open, high, low, close });
  }

  return data.reverse();
};

const SkillBasedTradingGame = () => {
  const [score, setScore] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [position, setPosition] = useState<'long' | 'short' | null>(null);
  const [entryPrice, setEntryPrice] = useState(0);
  const [tradingActive, setTradingActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [gameData, setGameData] = useState<TradingData[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { toast } = useToast();
  const { user, canUseFeature, incrementUsage } = useAuth();

  useEffect(() => {
    if (chartContainerRef.current) {
      chart.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      candleSeries.current = chart.current.addCandlestickSeries({
        upColor: '#4ade80',
        downColor: '#f87171',
        borderDownColor: '#f87171',
        borderUpColor: '#4ade80',
        wickDownColor: '#f87171',
        wickUpColor: '#4ade80',
      });

      // Generate sample data for the game
      const data = generateGameData();
      setGameData(data);
      candleSeries.current.setData(data);

      return () => {
        if (chart.current) {
          chart.current.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (tradingActive && timeRemaining > 0) {
      countdownInterval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTradingActive(false);
      handleGameEnd();
    }

    return () => clearInterval(countdownInterval);
  }, [tradingActive, timeRemaining]);

  const handleBuy = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to start trading.",
        variant: "destructive",
      });
      return;
    }

    if (!canUseFeature('signals')) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit for trading signals. Upgrade to premium for unlimited access.",
        variant: "destructive",
      });
      return;
    }

    if (!tradingActive) {
      setTradingActive(true);
      setTimeRemaining(60);
      setEntryPrice(getCurrentPrice());
      setPosition('long');
      incrementUsage('signals');
      toast({
        title: "Long Position Opened",
        description: "Good luck! Let's see if you can make a profit.",
      });
    }
  };

  const handleSell = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to start trading.",
        variant: "destructive",
      });
      return;
    }

    if (!canUseFeature('signals')) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit for trading signals. Upgrade to premium for unlimited access.",
        variant: "destructive",
      });
      return;
    }

    if (!tradingActive) {
      setTradingActive(true);
      setTimeRemaining(60);
      setEntryPrice(getCurrentPrice());
      setPosition('short');
      incrementUsage('signals');
      toast({
        title: "Short Position Opened",
        description: "Good luck! Let's see if you can make a profit.",
      });
    }
  };

  const getCurrentPrice = (): number => {
    if (gameData.length > 0) {
      return gameData[gameData.length - 1].close;
    }
    return 100;
  };

  const handleGameEnd = () => {
    if (position) {
      const exitPrice = getCurrentPrice();
      const profit = position === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice;
      const profitPercentage = (profit / entryPrice) * 100;
      const newBalance = balance + profit;

      setBalance(newBalance);

      if (profit > 0) {
        setScore((prevScore) => prevScore + 1);
        toast({
          title: "Congratulations!",
          description: `You made a profit of ${profitPercentage.toFixed(2)}%. Your new balance is ${newBalance.toFixed(2)}.`,
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: `You incurred a loss of ${Math.abs(profitPercentage).toFixed(2)}%. Your balance is now ${newBalance.toFixed(2)}.`,
          variant: "destructive",
        });
      }

      setPosition(null);
      setTradingActive(false);
    }
  };

  return (
    <Card className="glass-card border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Skill-Based Trading Game
          </div>
          <Badge variant="secondary">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Score: {score}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Balance: ${balance.toFixed(2)}
          </div>
        </div>

        <div ref={chartContainerRef} className="w-full h-64" />

        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleBuy} disabled={tradingActive} className="bg-green-600 hover:bg-green-700">
            {tradingActive && position === 'long' ? 'Long Position Active' : 'Buy'}
          </Button>
          <Button onClick={handleSell} disabled={tradingActive} className="bg-red-600 hover:bg-red-700">
            {tradingActive && position === 'short' ? 'Short Position Active' : 'Sell'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Time Remaining: {timeRemaining}s
          </div>
          <Button variant="outline" size="sm" onClick={handleGameEnd} disabled={!tradingActive}>
            End Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillBasedTradingGame;
