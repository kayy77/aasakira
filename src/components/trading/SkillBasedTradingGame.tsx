import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Brain, Target, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface TradingChallenge {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  targetPnL: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const SkillBasedTradingGame = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candleSeries, setCandleSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<TradingChallenge | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const challenges: TradingChallenge[] = [
    {
      id: 1,
      title: "Trend Following",
      description: "Identify and trade with the trend. Target: +50 pips in 5 minutes",
      timeLimit: 300,
      targetPnL: 50,
      difficulty: 'beginner'
    },
    {
      id: 2,
      title: "Support & Resistance",
      description: "Trade bounces from key levels. Target: +75 pips in 3 minutes",
      timeLimit: 180,
      targetPnL: 75,
      difficulty: 'intermediate'
    },
    {
      id: 3,
      title: "Smart Money Concepts",
      description: "Find order blocks and trade like institutions. Target: +100 pips in 8 minutes",
      timeLimit: 480,
      targetPnL: 100,
      difficulty: 'advanced'
    }
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartInstance = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      timeScale: {
        borderColor: '#374151',
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
    });

    const series = chartInstance.addSeries('Candlestick', {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Generate sample data
    const data = [];
    let time = Date.now() / 1000 - 86400;
    let price = 1.2500;
    
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 0.01;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 0.005;
      const low = Math.min(open, close) - Math.random() * 0.005;
      
      data.push({
        time: time + i * 900,
        open,
        high,
        low,
        close,
      });
      
      price = close;
    }
    
    series.setData(data);
    
    setChart(chartInstance);
    setCandleSeries(series);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chartInstance.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.remove();
    };
  }, []);

  const startChallenge = (challenge: TradingChallenge) => {
    setCurrentChallenge(challenge);
    setTimeRemaining(challenge.timeLimit);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endChallenge = () => {
    setCurrentChallenge(null);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Skill-Based Trading Challenges
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-500/20 text-purple-400">
                Level {level}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400">
                Score: {score}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentChallenge ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {challenges.map(challenge => (
                <Card key={challenge.id} className="glass-card border-gray-500/20 hover:border-purple-500/40 transition-all">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{challenge.title}</h3>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-400">{challenge.description}</p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Time Limit:</span>
                          <span>{formatTime(challenge.timeLimit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target P&L:</span>
                          <span>+{challenge.targetPnL} pips</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => startChallenge(challenge)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Start Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2">
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{currentChallenge.title}</h3>
                      <p className="text-sm text-gray-300">{currentChallenge.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{formatTime(timeRemaining)}</div>
                      <Badge className={getDifficultyColor(currentChallenge.difficulty)}>
                        {currentChallenge.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />
              </div>
              
              {/* Challenge Panel */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-3">Challenge Progress</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target:</span>
                      <span className="text-green-400">+{currentChallenge.targetPnL} pips</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current P&L:</span>
                      <span className="text-white">+0 pips</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '0%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-3">Trading Actions</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      BUY
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <TrendingDown className="w-4 h-4 mr-2" />
                      SELL
                    </Button>
                  </div>
                  <Button 
                    onClick={endChallenge}
                    variant="outline" 
                    className="w-full border-gray-600"
                  >
                    End Challenge
                  </Button>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-3">Challenge Tips</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    {currentChallenge.difficulty === 'beginner' && (
                      <>
                        <p>• Follow the overall trend direction</p>
                        <p>• Use higher timeframes for confirmation</p>
                        <p>• Don't fight the trend</p>
                      </>
                    )}
                    {currentChallenge.difficulty === 'intermediate' && (
                      <>
                        <p>• Look for bounces at key levels</p>
                        <p>• Use volume for confirmation</p>
                        <p>• Watch for false breakouts</p>
                      </>
                    )}
                    {currentChallenge.difficulty === 'advanced' && (
                      <>
                        <p>• Identify institutional order blocks</p>
                        <p>• Look for liquidity sweeps</p>
                        <p>• Trade market structure breaks</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillBasedTradingGame;
