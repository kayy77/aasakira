import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Target, TrendingUp, TrendingDown, Award } from 'lucide-react';

interface Trade {
  id: number;
  pair: string;
  type: 'buy' | 'sell';
  entry: number;
  exit?: number;
  pnl?: number;
  status: 'open' | 'closed';
  timestamp: number;
}

const ProfessionalTradingGame = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candleSeries, setCandleSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [balance, setBalance] = useState(10000);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPrice, setCurrentPrice] = useState(1.2500);
  const [selectedPair] = useState('EURUSD');

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

    const series = chartInstance.addCandlestickSeries({
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
    setCurrentPrice(price);
    
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

  const openTrade = (type: 'buy' | 'sell') => {
    const newTrade: Trade = {
      id: Date.now(),
      pair: selectedPair,
      type,
      entry: currentPrice,
      status: 'open',
      timestamp: Date.now(),
    };
    
    setTrades(prev => [...prev, newTrade]);
  };

  const closeTrade = (tradeId: number) => {
    setTrades(prev => prev.map(trade => {
      if (trade.id === tradeId && trade.status === 'open') {
        const pnl = trade.type === 'buy' 
          ? (currentPrice - trade.entry) * 1000
          : (trade.entry - currentPrice) * 1000;
        
        setBalance(prev => prev + pnl);
        
        return {
          ...trade,
          exit: currentPrice,
          pnl,
          status: 'closed' as const,
        };
      }
      return trade;
    }));
  };

  const openTrades = trades.filter(trade => trade.status === 'open');
  const totalPnL = trades.filter(trade => trade.status === 'closed')
    .reduce((sum, trade) => sum + (trade.pnl || 0), 0);

  return (
    <div className="space-y-6">
      <Card className="glass-card border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Professional Trading Arena
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              Balance: ${balance.toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2">
              <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />
            </div>
            
            {/* Trading Panel */}
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">{selectedPair}</h3>
                <div className="text-2xl font-bold text-white mb-4">
                  {currentPrice.toFixed(5)}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => openTrade('buy')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    BUY
                  </Button>
                  <Button 
                    onClick={() => openTrade('sell')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    SELL
                  </Button>
                </div>
              </div>
              
              {/* Open Trades */}
              {openTrades.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-3">Open Positions</h4>
                  <div className="space-y-2">
                    {openTrades.map(trade => {
                      const unrealizedPnL = trade.type === 'buy'
                        ? (currentPrice - trade.entry) * 1000
                        : (trade.entry - currentPrice) * 1000;
                      
                      return (
                        <div key={trade.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                          <div>
                            <Badge className={trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {trade.type.toUpperCase()}
                            </Badge>
                            <div className="text-sm text-gray-300">
                              Entry: {trade.entry.toFixed(5)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => closeTrade(trade.id)}
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Stats */}
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total P&L:</span>
                    <span className={`font-semibold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Trades:</span>
                    <span className="text-white">{trades.filter(t => t.status === 'closed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Open Positions:</span>
                    <span className="text-white">{openTrades.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalTradingGame;
