import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createChart, IChartApi, CandlestickData, SeriesApi } from 'lightweight-charts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Trophy,
  Timer,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  id: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  pnl?: number;
  timestamp: number;
  status: 'open' | 'closed';
}

const ProfessionalTradingGame = () => {
  const [balance, setBalance] = useState(10000);
  const [currentPrice, setCurrentPrice] = useState(1.1234);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isTrading, setIsTrading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [profit, setProfit] = useState(0);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<SeriesApi<'Candlestick'> | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (chartContainerRef.current && gameStarted) {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
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
      const formattedData: CandlestickData[] = marketData.map(item => ({
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
  }, [gameStarted, marketData]);

  const generateMarketData = () => {
    const data: MarketData[] = [];
    let price = 1.1234;
    const now = Date.now();
    
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now - (50 - i) * 60000).toISOString();
      const open = price;
      const volatility = 0.001;
      const change = (Math.random() - 0.5) * volatility;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      data.push({
        time: timestamp,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000000) + 500000,
      });
      
      price = close;
    }
    
    return data;
  };

  const simulatePrice = () => {
    if (!gameStarted) return;
    
    setCurrentPrice(prev => {
      const change = (Math.random() - 0.5) * 0.002;
      return Math.max(0.01, prev + change);
    });
    
    // Update market data
    setMarketData(prev => {
      const newData = [...prev];
      if (newData.length > 0) {
        const lastCandle = newData[newData.length - 1];
        const newTimestamp = new Date(Date.now()).toISOString();
        
        newData.push({
          time: newTimestamp,
          open: lastCandle.close,
          high: Math.max(lastCandle.close, currentPrice),
          low: Math.min(lastCandle.close, currentPrice),
          close: currentPrice,
          volume: Math.floor(Math.random() * 1000000) + 500000,
        });
        
        // Keep only last 100 candles
        return newData.slice(-100);
      }
      return newData;
    });
  };

  const executeTrade = (direction: 'long' | 'short', quantity: number) => {
    if (isTrading || !gameStarted) return;
    
    setIsTrading(true);
    
    const trade: Trade = {
      id: Date.now().toString(),
      direction,
      entryPrice: currentPrice,
      quantity,
      timestamp: Date.now(),
      status: 'open',
    };
    
    setTrades(prev => [...prev, trade]);
    
    toast({
      title: `${direction.toUpperCase()} Trade Opened`,
      description: `${quantity} units at ${currentPrice.toFixed(5)}`,
    });
    
    // Auto-close trade after 30 seconds for demo
    setTimeout(() => {
      closeTrade(trade.id);
    }, 30000);
    
    setTimeout(() => setIsTrading(false), 1000);
  };

  const closeTrade = (tradeId: string) => {
    setTrades(prev => prev.map(trade => {
      if (trade.id === tradeId && trade.status === 'open') {
        const pnl = trade.direction === 'long' 
          ? (currentPrice - trade.entryPrice) * trade.quantity
          : (trade.entryPrice - currentPrice) * trade.quantity;
          
        setBalance(prev => prev + pnl);
        setProfit(prev => prev + pnl);
        
        toast({
          title: pnl > 0 ? "Profitable Trade!" : "Trade Closed",
          description: `P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`,
          variant: pnl > 0 ? "default" : "destructive"
        });
        
        return {
          ...trade,
          exitPrice: currentPrice,
          pnl,
          status: 'closed' as const,
        };
      }
      return trade;
    }));
  };

  const startGame = () => {
    setGameStarted(true);
    setBalance(10000);
    setProfit(0);
    setTrades([]);
    setTimeLeft(300);
    setMarketData(generateMarketData());
    
    const priceInterval = setInterval(simulatePrice, 2000);
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(priceInterval);
          clearInterval(timerInterval);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameStarted(false);
    
    // Close all open trades
    trades.forEach(trade => {
      if (trade.status === 'open') {
        closeTrade(trade.id);
      }
    });
    
    toast({
      title: "Game Over!",
      description: `Final P&L: ${profit > 0 ? '+' : ''}$${profit.toFixed(2)}`,
      variant: profit > 0 ? "default" : "destructive"
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">${balance.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Balance</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold text-white">{currentPrice.toFixed(5)}</div>
            <div className="text-sm text-gray-400">EUR/USD</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profit > 0 ? '+' : ''}${profit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">P&L</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Timer className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-400">Time Left</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>EUR/USD Live Chart</span>
            {!gameStarted ? (
              <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                <Zap className="w-4 h-4 mr-2" />
                Start Trading
              </Button>
            ) : (
              <Badge className="bg-green-500/20 text-green-400">Live</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={chartContainerRef} className="w-full h-96" />
        </CardContent>
      </Card>

      {/* Trading Controls */}
      {gameStarted && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => executeTrade('long', 1000)}
                disabled={isTrading}
                className="bg-green-600 hover:bg-green-700 h-16"
              >
                <TrendingUp className="w-6 h-6 mr-2" />
                BUY (Long)
              </Button>
              <Button
                onClick={() => executeTrade('short', 1000)}
                disabled={isTrading}
                className="bg-red-600 hover:bg-red-700 h-16"
              >
                <TrendingDown className="w-6 h-6 mr-2" />
                SELL (Short)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Trades */}
      {trades.filter(t => t.status === 'open').length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Active Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trades.filter(t => t.status === 'open').map(trade => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={trade.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {trade.direction.toUpperCase()}
                    </Badge>
                    <span className="text-white">{trade.quantity} units @ {trade.entryPrice.toFixed(5)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${
                      trade.direction === 'long' 
                        ? currentPrice > trade.entryPrice ? 'text-green-400' : 'text-red-400'
                        : currentPrice < trade.entryPrice ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.direction === 'long' 
                        ? ((currentPrice - trade.entryPrice) * trade.quantity).toFixed(2)
                        : ((trade.entryPrice - currentPrice) * trade.quantity).toFixed(2)
                      }
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => closeTrade(trade.id)}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalTradingGame;
