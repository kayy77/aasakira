
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createChart, CandlestickData } from 'lightweight-charts';
import { Trophy, Target, TrendingUp, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const generateSampleData = (): TradingData[] => {
  const data: TradingData[] = [];
  let price = 1.20000;
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.5) * 0.01;
    const newPrice = price + change;
    const open = price;
    const close = newPrice;
    const high = Math.max(open, close) + Math.random() * 0.005;
    const low = Math.min(open, close) - Math.random() * 0.005;
    price = newPrice;
    data.push({
      time: `${i + 1}`,
      open,
      high,
      low,
      close,
    });
  }
  return data;
};

const ProfessionalTradingGame = () => {
  const [balance, setBalance] = useState(10000);
  const [profit, setProfit] = useState(0);
  const [tradesTaken, setTradesTaken] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(1.20500);
  const [sampleData, setSampleData] = useState<TradingData[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
      toast({
        title: "Time's Up!",
        description: `Your final balance is $${balance.toFixed(2)}.`,
      });
    }

    return () => clearInterval(intervalId);
  }, [isRunning, timeRemaining, balance, toast]);

  const startGame = () => {
    setIsRunning(true);
    setBalance(10000);
    setProfit(0);
    setTradesTaken(0);
    setAccuracy(0);
    setTimeRemaining(60);
  };

  const buy = () => {
    if (!isRunning) {
      toast({
        title: "Game Paused",
        description: "Please start the game to begin trading.",
      });
      return;
    }

    const investment = balance * 0.1;
    const potentialProfit = investment * 0.005;

    setBalance((prevBalance) => prevBalance + potentialProfit - investment);
    setProfit((prevProfit) => prevProfit + potentialProfit - investment);
    setTradesTaken((prevTrades) => prevTrades + 1);
    setAccuracy((prevAccuracy) => prevAccuracy + 1);

    toast({
      title: "Trade Executed",
      description: `Bought at ${currentPrice.toFixed(
        5
      )}. Potential profit: $${potentialProfit.toFixed(2)}.`,
    });
  };

  const sell = () => {
    if (!isRunning) {
      toast({
        title: "Game Paused",
        description: "Please start the game to begin trading.",
      });
      return;
    }

    const investment = balance * 0.1;
    const potentialProfit = investment * 0.005;

    setBalance((prevBalance) => prevBalance - potentialProfit + investment);
    setProfit((prevProfit) => prevProfit - potentialProfit + investment);
    setTradesTaken((prevTrades) => prevTrades + 1);

    toast({
      title: "Trade Executed",
      description: `Sold at ${currentPrice.toFixed(
        5
      )}. Potential profit: $${potentialProfit.toFixed(2)}.`,
    });
  };

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#ffffff',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#485158',
        },
        timeScale: {
          borderColor: '#485158',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#4ade80',
        downColor: '#f87171',
        borderDownColor: '#f87171',
        borderUpColor: '#4ade80',
        wickDownColor: '#f87171',
        wickUpColor: '#4ade80',
      });

      candlestickSeriesRef.current = candlestickSeries;

      // Generate sample data
      const data = generateSampleData();
      setSampleData(data);
      candlestickSeries.setData(data);
      
      // Set current price from the last data point
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }

      return () => {
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    }
  }, []);

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-white">
              Professional Trading Game
            </span>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400">
            {isRunning ? 'Live' : 'Paused'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Balance:</span>
            <span className="text-sm text-white">${balance.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Profit:</span>
            <span className="text-sm text-white">${profit.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400">Time:</span>
            <span className="text-sm text-white">{timeRemaining}s</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Trades:</span>
            <span className="text-sm text-white">{tradesTaken}</span>
          </div>
        </div>

        <div
          ref={chartContainerRef}
          className="w-full h-96 bg-gray-900 rounded-lg"
        ></div>

        <div className="flex justify-between">
          <Button
            onClick={buy}
            disabled={!isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            Buy
          </Button>
          <Button
            onClick={sell}
            disabled={!isRunning}
            className="bg-red-600 hover:bg-red-700"
          >
            Sell
          </Button>
        </div>

        {!isRunning ? (
          <Button
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Start Game
          </Button>
        ) : (
          <Progress
            value={timeRemaining}
            max={60}
            className="bg-gray-800"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalTradingGame;
