
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProfessionalTradingGame = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [balance, setBalance] = useState(10000);
  const [position, setPosition] = useState<'long' | 'short' | null>(null);

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

    const candlestickSeries = chart.addCandlestickSeries({
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

  const openPosition = (type: 'long' | 'short') => {
    setPosition(type);
  };

  const closePosition = () => {
    setPosition(null);
    const profit = Math.random() * 200 - 100;
    setBalance(prev => prev + profit);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Professional Trading Game
            <Badge className="bg-green-500/20 text-green-400">
              Balance: ${balance.toFixed(2)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={chartContainerRef} className="mb-4" />
          
          <div className="flex gap-4">
            <Button
              onClick={() => openPosition('long')}
              disabled={position !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              Buy Long
            </Button>
            <Button
              onClick={() => openPosition('short')}
              disabled={position !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              Sell Short
            </Button>
            {position && (
              <Button
                onClick={closePosition}
                variant="outline"
                className="border-yellow-500/30"
              >
                Close Position
              </Button>
            )}
          </div>

          {position && (
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
              <p className="text-blue-400">
                Position: {position.toUpperCase()} | Status: Open
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalTradingGame;
