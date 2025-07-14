import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  Trophy,
  BarChart3,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Trade {
  id: number;
  type: 'BUY' | 'SELL';
  entry: number;
  size: number;
  timestamp: number;
  status: 'open' | 'closed';
  pnl?: number;
  exitPrice?: number;
}

interface GameStats {
  balance: number;
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  streak: number;
}

const ProfessionalTradingGame: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(1.0500);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    balance: 10000,
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    streak: 0
  });
  const [selectedPair] = useState('EURUSD');
  const [tradeSize, setTradeSize] = useState(1000);
  const { toast } = useToast();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
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
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#4B5563',
      },
      timeScale: {
        borderColor: '#4B5563',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Generate initial historical data
    const historicalData = generateHistoricalData();
    candlestickSeries.setData(historicalData);

    return () => {
      chart.remove();
    };
  }, []);

  // Generate realistic historical candlestick data
  const generateHistoricalData = (): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let basePrice = 1.0500;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 100; i >= 0; i--) {
      const time = (now - i * 60) as Time;
      const volatility = 0.0005;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = basePrice;
      const close = basePrice + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      data.push({
        time,
        open: Number(open.toFixed(5)),
        high: Number(high.toFixed(5)),
        low: Number(low.toFixed(5)),
        close: Number(close.toFixed(5)),
      });
      
      basePrice = close;
    }
    
    setCurrentPrice(basePrice);
    return data;
  };

  // Simulate real-time price updates
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const volatility = 0.0003;
      const change = (Math.random() - 0.5) * volatility;
      const newPrice = currentPrice + change;
      
      setCurrentPrice(Number(newPrice.toFixed(5)));
      
      // Add new candlestick data point
      if (candlestickSeriesRef.current) {
        const time = Math.floor(Date.now() / 1000) as Time;
        const open = currentPrice;
        const close = newPrice;
        const high = Math.max(open, close) + Math.random() * 0.0001;
        const low = Math.min(open, close) - Math.random() * 0.0001;
        
        candlestickSeriesRef.current.update({
          time,
          open: Number(open.toFixed(5)),
          high: Number(high.toFixed(5)),
          low: Number(low.toFixed(5)),
          close: Number(close.toFixed(5)),
        });
      }
      
      // Update open trades P&L
      updateTradesPnL(newPrice);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentPrice]);

  const updateTradesPnL = (price: number) => {
    setTrades(prevTrades => 
      prevTrades.map(trade => {
        if (trade.status === 'open') {
          const pnl = trade.type === 'BUY' 
            ? (price - trade.entry) * trade.size
            : (trade.entry - price) * trade.size;
          return { ...trade, pnl: Number(pnl.toFixed(2)) };
        }
        return trade;
      })
    );
  };

  const executeTrade = (type: 'BUY' | 'SELL') => {
    if (gameStats.balance < tradeSize * 0.01) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough margin for this trade",
        variant: "destructive"
      });
      return;
    }

    const newTrade: Trade = {
      id: Date.now(),
      type,
      entry: currentPrice,
      size: tradeSize,
      timestamp: Date.now(),
      status: 'open',
      pnl: 0
    };

    setTrades(prev => [...prev, newTrade]);
    
    toast({
      title: "Trade Executed",
      description: `${type} ${tradeSize} ${selectedPair} at ${currentPrice}`,
    });
  };

  const closeTrade = (tradeId: number) => {
    setTrades(prevTrades => {
      const updatedTrades = prevTrades.map(trade => {
        if (trade.id === tradeId && trade.status === 'open') {
          const finalPnL = trade.pnl || 0;
          
          // Update game stats
          setGameStats(prevStats => {
            const newTotalTrades = prevStats.totalTrades + 1;
            const newTotalPnL = prevStats.totalPnL + finalPnL;
            const newBalance = prevStats.balance + finalPnL;
            const isWin = finalPnL > 0;
            const newStreak = isWin ? prevStats.streak + 1 : 0;
            
            return {
              ...prevStats,
              balance: Number(newBalance.toFixed(2)),
              totalTrades: newTotalTrades,
              totalPnL: Number(newTotalPnL.toFixed(2)),
              winRate: newTotalTrades > 0 ? Number(((prevStats.winRate * (newTotalTrades - 1) + (isWin ? 1 : 0)) / newTotalTrades * 100).toFixed(1)) : 0,
              streak: newStreak
            };
          });

          return {
            ...trade,
            status: 'closed' as const,
            exitPrice: currentPrice,
            pnl: finalPnL
          };
        }
        return trade;
      });
      
      return updatedTrades;
    });

    toast({
      title: "Trade Closed",
      description: `Position closed at ${currentPrice}`,
    });
  };

  const resetGame = () => {
    setGameStats({
      balance: 10000,
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      streak: 0
    });
    setTrades([]);
    setIsPlaying(false);
    
    toast({
      title: "Game Reset",
      description: "Starting fresh with $10,000",
    });
  };

  const openTrades = trades.filter(t => t.status === 'open');
  const totalPnL = openTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Balance</p>
                <p className={`text-lg font-bold ${gameStats.balance >= 10000 ? 'text-green-400' : 'text-red-400'}`}>
                  ${gameStats.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-lg font-bold text-white">{gameStats.winRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className={`text-lg font-bold ${gameStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${gameStats.totalPnL}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Streak</p>
                <p className="text-lg font-bold text-white">{gameStats.streak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Open P&L</p>
                <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Controls */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Professional Trading Simulator</span>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-400">
                {selectedPair}: {currentPrice}
              </Badge>
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="outline"
                size="sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                onClick={resetGame}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2">
              <div 
                ref={chartContainerRef}
                className="w-full h-96 bg-gray-900 rounded-lg"
              />
            </div>

            {/* Trading Panel */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Position Size</label>
                <select 
                  value={tradeSize}
                  onChange={(e) => setTradeSize(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value={1000}>1,000 units</option>
                  <option value={5000}>5,000 units</option>
                  <option value={10000}>10,000 units</option>
                  <option value={25000}>25,000 units</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => executeTrade('BUY')}
                  disabled={!isPlaying}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  BUY
                </Button>
                <Button
                  onClick={() => executeTrade('SELL')}
                  disabled={!isPlaying}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  SELL
                </Button>
              </div>

              {/* Open Positions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Open Positions</h4>
                {openTrades.length === 0 ? (
                  <p className="text-xs text-gray-500">No open positions</p>
                ) : (
                  openTrades.map(trade => (
                    <div key={trade.id} className="bg-gray-800 rounded p-3 text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <Badge className={trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {trade.type} {trade.size}
                        </Badge>
                        <Button
                          onClick={() => closeTrade(trade.id)}
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                        >
                          Close
                        </Button>
                      </div>
                      <div className="text-gray-400">
                        Entry: {trade.entry} | Current: {currentPrice}
                      </div>
                      <div className={`font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        P&L: ${(trade.pnl || 0).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This is a simulation for educational purposes. Real trading involves significant risk of loss.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ProfessionalTradingGame;
