
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { TrendingUp, TrendingDown, Target, DollarSign, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface Trade {
  id: number;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  exit?: number;
  profit?: number;
  status: 'open' | 'closed';
  timestamp: Date;
}

const ProfessionalTradingGame: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const [currentPair] = useState('EURUSD');
  const [currentPrice, setCurrentPrice] = useState(1.0845);
  const [balance, setBalance] = useState(10000);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [aiAnalysis, setAiAnalysis] = useState('');
  
  const { toast } = useToast();

  // Generate realistic candlestick data
  const generateCandlestickData = () => {
    const data = [];
    let price = 1.0845;
    const startTime = Math.floor(Date.now() / 1000) - (100 * 60); // 100 minutes ago
    
    for (let i = 0; i < 100; i++) {
      const time = startTime + (i * 60); // 1-minute intervals
      const volatility = 0.0002;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      data.push({
        time: time,
        open: Number(open.toFixed(5)),
        high: Number(high.toFixed(5)),
        low: Number(low.toFixed(5)),
        close: Number(close.toFixed(5))
      });
      
      price = close;
    }
    
    setCurrentPrice(Number(price.toFixed(5)));
    return data;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: 'transparent' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.3)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff4444',
      borderDownColor: '#ff4444',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff4444',
      wickUpColor: '#00ff88',
    });

    const data = generateCandlestickData();
    candlestickSeries.setData(data);

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Generate AI analysis
  const generateAIAnalysis = () => {
    const analyses = [
      "Strong bullish momentum detected with higher highs forming. Consider long positions with tight stop loss.",
      "Price is approaching key resistance level. Watch for breakout or reversal signals.",
      "Consolidation pattern suggests potential breakout. Wait for clear direction before entering.",
      "RSI showing oversold conditions. Potential bounce expected from current support level.",
      "Volume increasing with price action. Trend continuation likely in current direction."
    ];
    
    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
    setAiAnalysis(randomAnalysis);
  };

  // Execute trade
  const executeTrade = (type: 'BUY' | 'SELL') => {
    const newTrade: Trade = {
      id: Date.now(),
      pair: currentPair,
      type,
      entry: currentPrice,
      status: 'open',
      timestamp: new Date()
    };

    setTrades(prev => [newTrade, ...prev]);
    generateAIAnalysis();
    
    // Simulate trade outcome after 3 seconds
    setTimeout(() => {
      const outcome = Math.random() > 0.4; // 60% win rate
      const pips = Math.random() * 20 + 5; // 5-25 pips
      const profit = outcome ? pips * 10 : -pips * 10; // $10 per pip
      
      setTrades(prev => prev.map(trade => 
        trade.id === newTrade.id 
          ? { ...trade, status: 'closed', profit, exit: currentPrice + (outcome ? 0.0001 : -0.0001) }
          : trade
      ));
      
      setBalance(prev => prev + profit);
      setXp(prev => prev + (outcome ? 50 : 10));
      
      if (outcome) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast({
          title: "🎉 Winning Trade!",
          description: `Profit: $${profit.toFixed(2)}`,
        });
      } else {
        toast({
          title: "📉 Trade Closed",
          description: `Loss: $${Math.abs(profit).toFixed(2)}`,
          variant: "destructive"
        });
      }
    }, 3000);

    toast({
      title: "🎯 Trade Executed",
      description: `${type} ${currentPair} at ${currentPrice}`,
    });
  };

  // Update level based on XP
  useEffect(() => {
    const newLevel = Math.floor(xp / 200) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
      toast({
        title: "🌟 Level Up!",
        description: `You've reached Level ${newLevel}!`,
      });
    }
  }, [xp, level]);

  const winRate = trades.length > 0 
    ? (trades.filter(t => t.profit && t.profit > 0).length / trades.filter(t => t.status === 'closed').length * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-green-500/30">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">${balance.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Balance</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{xp}</div>
            <div className="text-xs text-gray-400">XP Points</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">Lv.{level}</div>
            <div className="text-xs text-gray-400">Trader Level</div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white">{currentPair}</span>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {currentPrice}
                </Badge>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                LIVE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={chartContainerRef} className="w-full h-[400px]" />
          </CardContent>
        </Card>

        {/* Trading Panel */}
        <div className="space-y-4">
          {/* AI Analysis */}
          <Card className="glass-card border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-blue-400" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 mb-4">
                {aiAnalysis || "Execute a trade to get AI analysis"}
              </p>
              <Button 
                onClick={generateAIAnalysis}
                variant="outline" 
                size="sm" 
                className="w-full border-blue-500/30"
              >
                Get Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Trading Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => executeTrade('BUY')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 h-12"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              BUY
            </Button>
            <Button
              onClick={() => executeTrade('SELL')}
              className="bg-gradient-to-r from-red-600 to-rose-600 h-12"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              SELL
            </Button>
          </div>

          {/* Recent Trades */}
          <Card className="glass-card border-gray-500/30">
            <CardHeader>
              <CardTitle className="text-sm">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-40 overflow-y-auto">
              {trades.slice(0, 5).map((trade) => (
                <div key={trade.id} className="flex justify-between items-center text-xs">
                  <span className={`font-medium ${
                    trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.type} {trade.pair}
                  </span>
                  <span className={`${
                    trade.profit && trade.profit > 0 ? 'text-green-400' : 
                    trade.profit && trade.profit < 0 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {trade.status === 'open' ? 'OPEN' : 
                     trade.profit ? `$${trade.profit.toFixed(2)}` : 'CLOSED'}
                  </span>
                </div>
              ))}
              {trades.length === 0 && (
                <p className="text-gray-400 text-xs text-center">No trades yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTradingGame;
