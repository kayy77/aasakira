import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number;
  current: number;
  pnl: number;
  timestamp: Date;
}

interface GameStats {
  balance: number;
  totalTrades: number;
  winRate: number;
  totalPnL: number;
}

const ProfessionalTradingGame: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    balance: 10000,
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0
  });
  const [currentPrice, setCurrentPrice] = useState(1.1234);
  const [selectedSymbol] = useState('EURUSD');
  
  const { toast } = useToast();

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
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
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

    // Create candlestick series using the correct method
    const candlestickSeries = chart.addSeries('Candlestick', {
      upColor: '#00D2FF',
      downColor: '#FF6B6B',
      borderVisible: false,
      wickUpColor: '#00D2FF',
      wickDownColor: '#FF6B6B',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Generate sample data
    const sampleData: CandlestickData[] = generateSampleData();
    candlestickSeries.setData(sampleData);

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

  // Generate sample candlestick data
  const generateSampleData = (): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let basePrice = 1.1234;
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
      const time = (now - i * 60000) / 1000; // 1 minute intervals
      const volatility = 0.0002;
      
      const open = basePrice + (Math.random() - 0.5) * volatility;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = low + Math.random() * (high - low);
      
      data.push({
        time: time as Time,
        open,
        high,
        low,
        close,
      });
      
      basePrice = close;
    }
    
    setCurrentPrice(data[data.length - 1].close);
    return data;
  };

  const openTrade = (type: 'buy' | 'sell') => {
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: selectedSymbol,
      type,
      entry: currentPrice,
      current: currentPrice,
      pnl: 0,
      timestamp: new Date()
    };

    setActiveTrades(prev => [...prev, newTrade]);
    setGameStats(prev => ({
      ...prev,
      totalTrades: prev.totalTrades + 1
    }));

    toast({
      title: `${type.toUpperCase()} Trade Opened`,
      description: `${selectedSymbol} at ${currentPrice.toFixed(5)}`
    });
  };

  const closeTrade = (tradeId: string) => {
    setActiveTrades(prev => {
      const trade = prev.find(t => t.id === tradeId);
      if (trade) {
        const pnl = trade.type === 'buy' 
          ? (currentPrice - trade.entry) * 10000
          : (trade.entry - currentPrice) * 10000;

        setGameStats(prevStats => ({
          ...prevStats,
          balance: prevStats.balance + pnl,
          totalPnL: prevStats.totalPnL + pnl,
          winRate: pnl > 0 ? 
            ((prevStats.winRate * (prevStats.totalTrades - 1)) + 1) / prevStats.totalTrades * 100 :
            (prevStats.winRate * (prevStats.totalTrades - 1)) / prevStats.totalTrades * 100
        }));

        toast({
          title: `Trade Closed`,
          description: `P&L: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)} pips`,
          variant: pnl > 0 ? 'default' : 'destructive'
        });
      }

      return prev.filter(t => t.id !== tradeId);
    });
  };

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-lg font-bold text-white">${gameStats.balance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Win Rate</p>
                <p className="text-lg font-bold text-white">{gameStats.winRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">Total P&L</p>
                <p className={`text-lg font-bold ${gameStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gameStats.totalPnL >= 0 ? '+' : ''}{gameStats.totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-400">Trades</p>
                <p className="text-lg font-bold text-white">{gameStats.totalTrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{selectedSymbol}</span>
            <Badge className="bg-green-500/20 text-green-400">
              {currentPrice.toFixed(5)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={chartContainerRef} className="w-full h-[400px]" />
        </CardContent>
      </Card>

      {/* Trading Controls */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => openTrade('buy')}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          BUY
        </Button>
        <Button
          onClick={() => openTrade('sell')}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <TrendingDown className="w-4 h-4 mr-2" />
          SELL
        </Button>
      </div>

      {/* Active Trades */}
      {activeTrades.length > 0 && (
        <Card className="glass-card border-blue-500/20">
          <CardHeader>
            <CardTitle>Active Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeTrades.map((trade) => {
                const pnl = trade.type === 'buy' 
                  ? (currentPrice - trade.entry) * 10000
                  : (trade.entry - currentPrice) * 10000;

                return (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {trade.type.toUpperCase()}
                      </Badge>
                      <span className="text-white">{trade.symbol}</span>
                      <span className="text-gray-400">@{trade.entry.toFixed(5)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)} pips
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
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalTradingGame;
