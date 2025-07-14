import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap,
  Trophy,
  DollarSign,
  BarChart3,
  Clock
} from 'lucide-react';

const ProfessionalTradingGame = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candlestickSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const [currentPrice, setCurrentPrice] = useState(1.0850);
  const [prediction, setPrediction] = useState<'up' | 'down' | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);

  // Generate realistic forex data
  const generateCandleData = (): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let price = 1.0800;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 50; i >= 0; i--) {
      const time = (now - i * 300) as UTCTimestamp; // 5-minute candles
      const volatility = 0.0015;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      data.push({
        time,
        open,
        high,
        low,
        close
      });
      
      price = close;
    }
    
    setCurrentPrice(data[data.length - 1].close);
    return data;
  };

  useEffect(() => {
    if (chartContainerRef.current) {
      chart.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#ffffff',
        },
        grid: {
          vertLines: { color: '#333' },
          horzLines: { color: '#333' },
        },
        timeScale: {
          borderColor: '#485158',
        },
        rightPriceScale: {
          borderColor: '#485158',
        },
      });

      // Fix: Use addCandlestickSeries() method directly
      candlestickSeries.current = chart.current.addCandlestickSeries({
        upColor: '#4ade80',
        downColor: '#f87171',
        borderVisible: false,
        wickUpColor: '#4ade80',
        wickDownColor: '#f87171',
      });

      const data = generateCandleData();
      candlestickSeries.current.setData(data);

      // Handle resize
      const handleResize = () => {
        if (chart.current && chartContainerRef.current) {
          chart.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart.current) {
          chart.current.remove();
        }
      };
    }
  }, []);

  const [candleData, setCandleData] = useState<CandlestickData[]>([]);

  useEffect(() => {
    const initialData = generateCandleData();
    setCandleData(initialData);

    if (candlestickSeries.current) {
      candlestickSeries.current.setData(initialData);
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (gameActive) {
      intervalId = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 0) {
            clearInterval(intervalId);
            setGameActive(false);
            setPrediction(null);
            return 0;
          } else {
            return prevTime - 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [gameActive]);

  useEffect(() => {
    if (candlestickSeries.current && gameActive) {
      const interval = setInterval(() => {
        const newData = generateCandleData();
        setCandleData(newData);
        candlestickSeries.current?.update(newData[newData.length - 1]);
        setCurrentPrice(newData[newData.length - 1].close);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [gameActive]);

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(30);
    setPrediction(null);
  };

  const makePrediction = (direction: 'up' | 'down') => {
    if (!gameActive) return;
    setPrediction(direction);
    
    // Simulate price movement after 3 seconds
    setTimeout(() => {
      const change = (Math.random() - 0.5) * 0.002;
      const newPrice = currentPrice + change;
      setCurrentPrice(newPrice);
      
      const correct = (change > 0 && direction === 'up') || (change < 0 && direction === 'down');
      if (correct) {
        setScore(prev => prev + 1);
      }
      
      setGameActive(false);
      setPrediction(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Professional Trading Game
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 text-green-400">
                <Trophy className="w-4 h-4 mr-1" />
                Score: {score}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400">
                <Clock className="w-4 h-4 mr-1" />
                {timeLeft}s
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={chartContainerRef} className="w-full h-96 bg-gray-900 rounded-lg" />
          
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-400">Current Price</div>
              <div className="text-2xl font-bold text-white">
                {currentPrice.toFixed(5)}
              </div>
            </div>
            
            {!gameActive ? (
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Round
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => makePrediction('up')}
                  disabled={prediction !== null}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  UP
                </Button>
                <Button
                  onClick={() => makePrediction('down')}
                  disabled={prediction !== null}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  DOWN
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalTradingGame;
