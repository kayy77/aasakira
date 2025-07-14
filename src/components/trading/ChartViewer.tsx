
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradeSubmission {
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  reasoning: string;
}

interface ChartViewerProps {
  pair: string;
  timeframe: string;
  data: ChartData[];
  userTrade?: TradeSubmission;
}

const ChartViewer: React.FC<ChartViewerProps> = ({ pair, timeframe, data, userTrade }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      const previous = data[data.length - 2];
      setCurrentPrice(latest.close);
      setPriceChange(latest.close - (previous?.close || latest.close));
    }
  }, [data]);

  // Simplified chart visualization
  const renderChart = () => {
    if (!data || data.length === 0) return null;

    const maxPrice = Math.max(...data.map(d => d.high));
    const minPrice = Math.min(...data.map(d => d.low));
    const priceRange = maxPrice - minPrice;

    return (
      <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
        {/* Price levels */}
        <div className="absolute top-2 left-2 text-green-400 font-mono text-sm">
          High: {maxPrice.toFixed(5)}
        </div>
        <div className="absolute bottom-2 left-2 text-red-400 font-mono text-sm">
          Low: {minPrice.toFixed(5)}
        </div>
        
        {/* Current price */}
        <div className="absolute top-2 right-2">
          <div className="text-white font-mono text-lg font-bold">
            {currentPrice.toFixed(5)}
          </div>
          <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(5)}
          </div>
        </div>

        {/* Simplified candlestick representation */}
        <div className="flex items-end justify-center h-full p-4 space-x-1">
          {data.slice(-20).map((candle, index) => {
            const isBull = candle.close > candle.open;
            const bodyHeight = Math.abs(candle.close - candle.open) / priceRange * 200;
            const wickHeight = (candle.high - candle.low) / priceRange * 200;
            const bottomWick = (Math.min(candle.open, candle.close) - candle.low) / priceRange * 200;
            const topWick = (candle.high - Math.max(candle.open, candle.close)) / priceRange * 200;

            return (
              <div key={index} className="flex flex-col items-center justify-end h-full relative">
                {/* Top wick */}
                <div 
                  className={`w-px ${isBull ? 'bg-green-400' : 'bg-red-400'}`}
                  style={{ height: `${topWick}px` }}
                />
                {/* Body */}
                <div 
                  className={`w-2 ${isBull ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                  style={{ height: `${Math.max(bodyHeight, 1)}px` }}
                />
                {/* Bottom wick */}
                <div 
                  className={`w-px ${isBull ? 'bg-green-400' : 'bg-red-400'}`}
                  style={{ height: `${bottomWick}px` }}
                />
              </div>
            );
          })}
        </div>

        {/* Trade levels overlay */}
        {userTrade && userTrade.entryPrice && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Entry price line */}
            <div 
              className="absolute w-full border-t-2 border-blue-400 border-dashed"
              style={{ 
                top: `${((maxPrice - parseFloat(userTrade.entryPrice)) / priceRange) * 100}%` 
              }}
            >
              <span className="absolute right-2 -top-3 text-xs text-blue-400 bg-gray-900 px-1 rounded">
                Entry: {userTrade.entryPrice}
              </span>
            </div>

            {/* Stop loss line */}
            {userTrade.stopLoss && (
              <div 
                className="absolute w-full border-t-2 border-red-400 border-dashed"
                style={{ 
                  top: `${((maxPrice - parseFloat(userTrade.stopLoss)) / priceRange) * 100}%` 
                }}
              >
                <span className="absolute right-2 -top-3 text-xs text-red-400 bg-gray-900 px-1 rounded">
                  SL: {userTrade.stopLoss}
                </span>
              </div>
            )}

            {/* Take profit line */}
            {userTrade.takeProfit && (
              <div 
                className="absolute w-full border-t-2 border-green-400 border-dashed"
                style={{ 
                  top: `${((maxPrice - parseFloat(userTrade.takeProfit)) / priceRange) * 100}%` 
                }}
              >
                <span className="absolute right-2 -top-3 text-xs text-green-400 bg-gray-900 px-1 rounded">
                  TP: {userTrade.takeProfit}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-black/40 border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-white">{pair}</h3>
            <Badge variant="outline" className="text-gray-400">
              {timeframe}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {priceChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              priceChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {priceChange >= 0 ? '+' : ''}{(priceChange / currentPrice * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      
      <div ref={chartRef} className="p-4">
        {renderChart()}
      </div>
    </Card>
  );
};

export default ChartViewer;
