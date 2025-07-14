import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target,
  Award,
  Clock
} from 'lucide-react';
import { createChart, ColorType } from 'lightweight-charts';
import { useToast } from '@/hooks/use-toast';

interface PredictionResult {
  id: string;
  prediction: 'up' | 'down';
  confidence: number;
  actualDirection?: 'up' | 'down';
  correct?: boolean;
  timestamp: Date;
  points: number;
}

const SkillBasedTradingGame = () => {
  const { toast } = useToast();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [currentPrice, setCurrentPrice] = useState(1.0850);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<'up' | 'down' | null>(null);

  // Generate chart data
  const generateChartData = () => {
    const data = [];
    const startTime = Date.now() - (50 * 60 * 1000); // 50 minutes ago
    let price = 1.0850;
    
    for (let i = 0; i < 50; i++) {
      const time = startTime + (i * 60 * 1000); // 1 minute intervals
      const change = (Math.random() - 0.5) * 0.001;
      price += change;
      
      data.push({
        time: Math.floor(time / 1000),
        open: price - change,
        high: price + Math.abs(change) * 0.5,
        low: price - Math.abs(change) * 0.5,
        close: price,
      });
    }
    
    return data;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Use the correct API method for adding candlestick series
    const candlestickSeries = chart.addSeries('Candlestick', {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const chartData = generateChartData();
    candlestickSeries.setData(chartData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            evaluatePrediction();
            return 30; // Reset timer
          }
          return prev - 1;
        });
        
        // Update price
        setCurrentPrice(prev => {
          const change = (Math.random() - 0.5) * 0.002;
          const newPrice = prev + change;
          setPriceHistory(prevHistory => [...prevHistory.slice(-19), newPrice]);
          return newPrice;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameActive, timeRemaining]);

  const startGame = () => {
    setGameActive(true);
    setTimeRemaining(30);
    setCurrentPrediction(null);
    setPriceHistory([currentPrice]);
  };

  const makePrediction = (direction: 'up' | 'down') => {
    if (!gameActive || currentPrediction) return;
    
    setCurrentPrediction(direction);
    
    toast({
      title: "Prediction Made!",
      description: `You predicted the price will go ${direction}`,
    });
  };

  const evaluatePrediction = () => {
    if (!currentPrediction || priceHistory.length < 2) return;
    
    const startPrice = priceHistory[0];
    const endPrice = currentPrice;
    const actualDirection = endPrice > startPrice ? 'up' : 'down';
    const correct = currentPrediction === actualDirection;
    
    const points = correct ? (streak + 1) * 10 : 0;
    
    const result: PredictionResult = {
      id: Date.now().toString(),
      prediction: currentPrediction,
      actualDirection,
      correct,
      timestamp: new Date(),
      points,
      confidence: 75 // Could be user input
    };
    
    setPredictions(prev => [result, ...prev.slice(0, 9)]);
    setScore(prev => prev + points);
    setStreak(prev => correct ? prev + 1 : 0);
    
    if (correct) {
      setLevel(prev => Math.floor((score + points) / 100) + 1);
    }
    
    setCurrentPrediction(null);
    
    toast({
      title: correct ? "Correct!" : "Incorrect",
      description: `${correct ? `+${points} points` : 'Better luck next time'}`,
      variant: correct ? "default" : "destructive"
    });
  };

  const accuracy = predictions.length > 0 
    ? (predictions.filter(p => p.correct).length / predictions.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-yellow-400">{score}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-blue-400">{level}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold text-green-400">{streak}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold text-purple-400">{accuracy.toFixed(1)}%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-blue-400">Price Prediction Challenge</span>
            {gameActive && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                <Clock className="w-4 h-4 mr-1" />
                {timeRemaining}s
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={chartContainerRef} className="w-full h-72 mb-4" />
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Current Price</p>
              <p className="text-2xl font-bold text-white">{currentPrice.toFixed(5)}</p>
            </div>
          </div>
          
          {!gameActive ? (
            <div className="text-center">
              <Button 
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Start Game
              </Button>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => makePrediction('up')}
                disabled={!!currentPrediction}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Predict UP
              </Button>
              
              <Button 
                onClick={() => makePrediction('down')}
                disabled={!!currentPrediction}
                className="bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <TrendingDown className="w-5 h-5 mr-2" />
                Predict DOWN
              </Button>
            </div>
          )}
          
          {currentPrediction && (
            <div className="text-center mt-4">
              <Badge className="bg-yellow-500/20 text-yellow-400">
                Prediction: {currentPrediction.toUpperCase()} - Waiting for result...
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      {predictions.length > 0 && (
        <Card className="glass-card border-gray-500/20">
          <CardHeader>
            <CardTitle className="text-gray-400">Recent Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {prediction.prediction === 'up' ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm">
                        Predicted: {prediction.prediction.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Actual: {prediction.actualDirection?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={prediction.correct ? "default" : "destructive"}>
                      {prediction.correct ? "✓" : "✗"}
                    </Badge>
                    <span className="text-sm font-semibold text-yellow-400">
                      +{prediction.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress to Next Level */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-400">Progress to Level {level + 1}</span>
            <span className="text-sm text-gray-400">{score % 100}/100</span>
          </div>
          <Progress value={(score % 100)} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillBasedTradingGame;
