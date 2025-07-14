import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createChart, IChartApi, CandlestickData, SeriesApi } from 'lightweight-charts';
import { 
  TrendingUp, 
  TrendingDown, 
  Star,
  Award,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PriceData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Challenge {
  id: string;
  type: 'breakout' | 'support' | 'resistance' | 'trend';
  question: string;
  correctAnswer: 'up' | 'down';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

const SkillBasedTradingGame = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answered, setAnswered] = useState(false);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<SeriesApi<'Candlestick'> | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (chartContainerRef.current && priceData.length > 0) {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: {
          background: { color: 'transparent' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Add candlestick series with proper type
      const candleSeries = chart.addSeries('Candlestick', {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      // Format data for lightweight-charts
      const formattedData: CandlestickData[] = priceData.map(item => ({
        time: Math.floor(new Date(item.time).getTime() / 1000) as any,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      candleSeries.setData(formattedData);
      
      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [priceData]);

  const generatePriceData = (type: Challenge['type']): PriceData[] => {
    const data: PriceData[] = [];
    let price = 1.2000;
    const now = Date.now();
    
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(now - (30 - i) * 60000).toISOString();
      const open = price;
      
      let close: number;
      switch (type) {
        case 'breakout':
          // Create a consolidation then breakout pattern
          if (i < 20) {
            close = open + (Math.random() - 0.5) * 0.002; // Tight range
          } else {
            close = open + 0.005; // Strong breakout
          }
          break;
        case 'support':
          // Create support level testing
          if (i > 15) {
            close = Math.max(open - 0.003, 1.1950); // Bounce from support
          } else {
            close = open + (Math.random() - 0.5) * 0.003;
          }
          break;
        case 'resistance':
          // Create resistance level testing
          if (i > 15) {
            close = Math.min(open + 0.003, 1.2050); // Reject at resistance
          } else {
            close = open + (Math.random() - 0.5) * 0.003;
          }
          break;
        default:
          close = open + (Math.random() - 0.5) * 0.004;
      }
      
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;
      
      data.push({
        time: timestamp,
        open,
        high,
        low,
        close,
      });
      
      price = close;
    }
    
    return data;
  };

  const generateChallenge = (): Challenge => {
    const types: Challenge['type'][] = ['breakout', 'support', 'resistance', 'trend'];
    const type = types[Math.floor(Math.random() * types.length)];
    const difficulty = level <= 3 ? 'easy' : level <= 6 ? 'medium' : 'hard';
    
    const challenges = {
      breakout: {
        question: "Price has been consolidating. What's the likely next move after this pattern?",
        correctAnswer: 'up' as const,
        points: 10
      },
      support: {
        question: "Price is testing a key support level. What's the expected reaction?",
        correctAnswer: 'up' as const,
        points: 15
      },
      resistance: {
        question: "Price is approaching strong resistance. What's the likely outcome?",
        correctAnswer: 'down' as const,
        points: 15
      },
      trend: {
        question: "Based on the trend structure, what's the next probable direction?",
        correctAnswer: Math.random() > 0.5 ? 'up' as const : 'down' as const,
        points: 20
      }
    };
    
    return {
      id: Date.now().toString(),
      type,
      ...challenges[type],
      difficulty
    };
  };

  const startNewChallenge = () => {
    const challenge = generateChallenge();
    const data = generatePriceData(challenge.type);
    
    setCurrentChallenge(challenge);
    setPriceData(data);
    setTimeLeft(30);
    setAnswered(false);
    setGameActive(true);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (prediction: 'up' | 'down') => {
    if (!currentChallenge || answered) return;
    
    setAnswered(true);
    setGameActive(false);
    
    const isCorrect = prediction === currentChallenge.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + currentChallenge.points);
      setStreak(prev => prev + 1);
      
      if (streak > 0 && (streak + 1) % 3 === 0) {
        setLevel(prev => prev + 1);
        toast({
          title: "Level Up! 🎉",
          description: `Welcome to Level ${level + 1}!`,
        });
      }
      
      toast({
        title: "Correct! 🎯",
        description: `+${currentChallenge.points} points`,
      });
    } else {
      setStreak(0);
      toast({
        title: "Incorrect ❌",
        description: "Keep learning and try again!",
        variant: "destructive"
      });
    }
  };

  const handleTimeout = () => {
    setAnswered(true);
    setGameActive(false);
    setStreak(0);
    
    toast({
      title: "Time's Up! ⏰",
      description: "Try to answer faster next time.",
      variant: "destructive"
    });
  };

  const calculateProgress = () => {
    const pointsNeeded = level * 100;
    const currentLevelPoints = score % 100;
    return (currentLevelPoints / pointsNeeded) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className="text-sm text-gray-400">Score</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{level}</div>
            <div className="text-sm text-gray-400">Level</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">{streak}</div>
            <div className="text-sm text-gray-400">Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Level {level} Progress</span>
            <span className="text-sm text-gray-400">{score % 100}/100</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </CardContent>
      </Card>

      {/* Chart Challenge */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Market Analysis Challenge</span>
            {gameActive && (
              <Badge className={`${timeLeft <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {timeLeft}s
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentChallenge ? (
            <div className="space-y-4">
              <div ref={chartContainerRef} className="w-full h-64" />
              
              <div className="text-center">
                <p className="text-lg text-white mb-4">{currentChallenge.question}</p>
                
                {!answered && gameActive ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleAnswer('up')}
                      className="bg-green-600 hover:bg-green-700 h-16"
                    >
                      <TrendingUp className="w-6 h-6 mr-2" />
                      Price Will Rise
                    </Button>
                    <Button
                      onClick={() => handleAnswer('down')}
                      className="bg-red-600 hover:bg-red-700 h-16"
                    >
                      <TrendingDown className="w-6 h-6 mr-2" />
                      Price Will Fall
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={startNewChallenge}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {answered ? 'Next Challenge' : 'Start Challenge'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-400 mb-4">Ready to test your trading skills?</p>
              <Button 
                onClick={startNewChallenge}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start First Challenge
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillBasedTradingGame;
