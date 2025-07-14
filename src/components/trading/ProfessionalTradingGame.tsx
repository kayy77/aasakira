
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Zap,
  Trophy,
  BarChart3,
  DollarSign,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface Trade {
  id: number;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  exit?: number;
  pnl?: number;
  status: 'open' | 'closed';
  timestamp: Date;
}

interface GameStats {
  balance: number;
  totalTrades: number;
  winRate: number;
  xp: number;
  level: number;
  achievement?: string;
}

const ProfessionalTradingGame: React.FC = () => {
  const [gameStats, setGameStats] = useState<GameStats>({
    balance: 10000,
    totalTrades: 0,
    winRate: 0,
    xp: 0,
    level: 1
  });
  
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<string>('');
  const [selectedPair, setSelectedPair] = useState('EURUSD');
  const [currentPrice, setCurrentPrice] = useState(1.0892);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const { toast } = useToast();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

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
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series using the correct method
    const candlestickSeries = chart.addSeries('Candlestick', {
      upColor: '#00ff88',
      downColor: '#ff4757',
      borderDownColor: '#ff4757',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff4757',
      wickUpColor: '#00ff88',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Generate sample data
    const generateSampleData = (): CandlestickData[] => {
      const data: CandlestickData[] = [];
      let price = 1.0892;
      const now = new Date();
      
      for (let i = 100; i >= 0; i--) {
        const time = Math.floor((now.getTime() - i * 60000) / 1000) as any;
        const open = price;
        const change = (Math.random() - 0.5) * 0.002;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 0.001;
        const low = Math.min(open, close) - Math.random() * 0.001;
        
        data.push({
          time,
          open: Number(open.toFixed(5)),
          high: Number(high.toFixed(5)),
          low: Number(low.toFixed(5)),
          close: Number(close.toFixed(5))
        });
        
        price = close;
      }
      
      return data;
    };

    candlestickSeries.setData(generateSampleData());
    setCurrentPrice(1.0892);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  const generateMarketAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with realistic trading insights
    const analyses = [
      "📈 BULLISH MOMENTUM: Strong uptrend with higher highs and higher lows. RSI shows room for more upside. Consider BUY on pullbacks to support.",
      "📉 BEARISH PRESSURE: Price breaking below key support levels. Volume increasing on down moves. SELL opportunities on any bounces to resistance.",
      "⚖️ RANGE-BOUND: Market consolidating between 1.0850-1.0920. Trade the range - BUY at support, SELL at resistance.",
      "🎯 BREAKOUT SETUP: Price approaching key resistance. If broken with volume, expect strong continuation. Wait for confirmation.",
      "💥 REVERSAL PATTERN: Double top forming at resistance. Look for SELL signals if price fails to break higher."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
    setMarketAnalysis(randomAnalysis);
    setIsAnalyzing(false);
  };

  const executeTrade = (type: 'BUY' | 'SELL') => {
    if (currentTrade) {
      toast({
        title: "Trade Already Open",
        description: "Close your current trade first!",
        variant: "destructive"
      });
      return;
    }

    const trade: Trade = {
      id: Date.now(),
      pair: selectedPair,
      type,
      entry: currentPrice,
      status: 'open',
      timestamp: new Date()
    };

    setCurrentTrade(trade);
    
    toast({
      title: `🎯 ${type} Trade Opened`,
      description: `${selectedPair} @ ${currentPrice}`,
    });

    // Simulate price movement
    setTimeout(() => {
      const priceChange = (Math.random() - 0.5) * 0.004;
      const newPrice = currentPrice + priceChange;
      setCurrentPrice(Number(newPrice.toFixed(5)));
    }, 3000);
  };

  const closeTrade = () => {
    if (!currentTrade) return;

    const pnl = currentTrade.type === 'BUY' 
      ? (currentPrice - currentTrade.entry) * 10000
      : (currentTrade.entry - currentPrice) * 10000;

    const isWin = pnl > 0;
    const xpGained = isWin ? 50 : 10;

    setGameStats(prev => {
      const newStats = {
        ...prev,
        balance: prev.balance + pnl,
        totalTrades: prev.totalTrades + 1,
        winRate: isWin ? 
          (prev.winRate * prev.totalTrades + 100) / (prev.totalTrades + 1) :
          (prev.winRate * prev.totalTrades) / (prev.totalTrades + 1),
        xp: prev.xp + xpGained,
        level: Math.floor((prev.xp + xpGained) / 100) + 1
      };

      // Check for achievements
      if (newStats.totalTrades === 10) {
        newStats.achievement = "First 10 Trades!";
      } else if (newStats.winRate >= 70 && newStats.totalTrades >= 5) {
        newStats.achievement = "Consistent Trader!";
      }

      return newStats;
    });

    setCurrentTrade(null);
    
    toast({
      title: isWin ? "🎉 Winning Trade!" : "📉 Trade Closed",
      description: `P&L: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)} | +${xpGained} XP`,
      variant: isWin ? "default" : "destructive"
    });
  };

  return (
    <div className="space-y-6">
      {/* Game Stats Header */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Professional Trading Simulator</h2>
                <p className="text-sm text-gray-400">Practice with real market conditions</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
              Level {gameStats.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ${gameStats.balance.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {gameStats.totalTrades}
              </div>
              <div className="text-xs text-gray-400">Total Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {gameStats.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {gameStats.xp}
              </div>
              <div className="text-xs text-gray-400">XP Points</div>
            </div>
          </div>
          
          {/* XP Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>Progress to Level {gameStats.level + 1}</span>
              <span>{gameStats.xp % 100}/100 XP</span>
            </div>
            <Progress value={(gameStats.xp % 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Chart and Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 glass-card border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                {selectedPair} Chart
              </div>
              <div className="text-lg font-mono text-white">
                {currentPrice}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={chartContainerRef} className="w-full h-96 bg-gray-900/50 rounded-lg" />
          </CardContent>
        </Card>

        {/* Trading Panel */}
        <Card className="glass-card border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Trading Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Trade */}
            {currentTrade && (
              <Alert className="border-purple-500/30 bg-purple-500/10">
                <Clock className="h-4 w-4 text-purple-400" />
                <AlertDescription className="text-purple-300">
                  <div className="font-semibold">
                    {currentTrade.type} {currentTrade.pair}
                  </div>
                  <div className="text-sm">
                    Entry: {currentTrade.entry} | Current: {currentPrice}
                  </div>
                  <div className="text-sm">
                    P&L: {currentTrade.type === 'BUY' 
                      ? ((currentPrice - currentTrade.entry) * 10000).toFixed(2)
                      : ((currentTrade.entry - currentPrice) * 10000).toFixed(2)} pips
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* AI Analysis */}
            <div className="space-y-2">
              <Button
                onClick={generateMarketAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    AI Market Analysis
                  </>
                )}
              </Button>

              {marketAnalysis && (
                <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-600">
                  <div className="text-sm text-gray-300 leading-relaxed">
                    {marketAnalysis}
                  </div>
                </div>
              )}
            </div>

            {/* Trade Buttons */}
            <div className="space-y-2">
              {!currentTrade ? (
                <>
                  <Button
                    onClick={() => executeTrade('BUY')}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    BUY {selectedPair}
                  </Button>
                  <Button
                    onClick={() => executeTrade('SELL')}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600"
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    SELL {selectedPair}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={closeTrade}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Close Trade
                </Button>
              )}
            </div>

            {/* Achievement */}
            {gameStats.achievement && (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  <div className="font-semibold">Achievement Unlocked!</div>
                  <div className="text-sm">{gameStats.achievement}</div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalTradingGame;
