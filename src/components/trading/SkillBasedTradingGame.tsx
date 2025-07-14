
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Trade {
  id: number;
  type: 'long' | 'short';
  entry: number;
  exit?: number;
  profit?: number;
  timestamp: number;
}

const SkillBasedTradingGame = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [balance, setBalance] = useState(10000);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [skillLevel, setSkillLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [activePosition, setActivePosition] = useState<Trade | null>(null);

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
    });

    const candlestickSeries = chart.addSeries('Candlestick', {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Generate sample data
    const data: CandlestickData[] = [];
    const basePrice = 1.2500;
    let currentPrice = basePrice;

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 0.002;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;

      data.push({
        time: Date.now() / 1000 - (100 - i) * 60 as any,
        open,
        high,
        low,
        close,
      });

      currentPrice = close;
    }

    candlestickSeries.setData(data);
    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    return () => {
      chart.remove();
    };
  }, []);

  const openTrade = (type: 'long' | 'short') => {
    const newTrade: Trade = {
      id: Date.now(),
      type,
      entry: 1.2500 + (Math.random() - 0.5) * 0.01,
      timestamp: Date.now(),
    };

    setActivePosition(newTrade);
  };

  const closeTrade = () => {
    if (!activePosition) return;

    const exitPrice = activePosition.entry + (Math.random() - 0.5) * 0.01;
    const profit = activePosition.type === 'long' 
      ? (exitPrice - activePosition.entry) * 10000
      : (activePosition.entry - exitPrice) * 10000;

    const completedTrade = {
      ...activePosition,
      exit: exitPrice,
      profit,
    };

    setTrades(prev => [...prev, completedTrade]);
    setBalance(prev => prev + profit);
    setExperience(prev => prev + Math.max(10, Math.abs(profit) / 10));
    setActivePosition(null);

    // Level up check
    const newLevel = Math.floor(experience / 1000) + 1;
    if (newLevel > skillLevel) {
      setSkillLevel(newLevel);
    }
  };

  const winRate = trades.length > 0 
    ? (trades.filter(t => (t.profit || 0) > 0).length / trades.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">Skill-Based Trading Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">${balance.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{skillLevel}</div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{trades.length}</div>
              <div className="text-sm text-gray-400">Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{winRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>

          {/* Experience Progress */}
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Experience</span>
              <span>{experience}/{(skillLevel) * 1000}</span>
            </div>
            <Progress value={(experience % 1000) / 10} className="h-2" />
          </div>

          {/* Chart */}
          <div ref={chartContainerRef} className="mb-4" />

          {/* Trading Controls */}
          <div className="flex gap-4">
            <Button
              onClick={() => openTrade('long')}
              disabled={activePosition !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              Buy Long
            </Button>
            <Button
              onClick={() => openTrade('short')}
              disabled={activePosition !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              Sell Short
            </Button>
            {activePosition && (
              <Button
                onClick={closeTrade}
                variant="outline"
                className="border-yellow-500/30"
              >
                Close Position
              </Button>
            )}
          </div>

          {/* Active Position */}
          {activePosition && (
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <p className="text-blue-400">
                Active: {activePosition.type.toUpperCase()} @ {activePosition.entry.toFixed(5)}
              </p>
            </div>
          )}

          {/* Recent Trades */}
          {trades.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-semibold">Recent Trades</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {trades.slice(-5).reverse().map((trade) => (
                  <div key={trade.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {trade.type.toUpperCase()} @ {trade.entry.toFixed(5)}
                    </span>
                    <span className={trade.profit! > 0 ? 'text-green-400' : 'text-red-400'}>
                      {trade.profit! > 0 ? '+' : ''}{trade.profit!.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillBasedTradingGame;
