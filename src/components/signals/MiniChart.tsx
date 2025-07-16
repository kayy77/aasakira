
import React, { useEffect, useRef } from 'react';
import { ChartAnalysis, ChartMarkup } from '@/services/enhancedSignalAnalyzer';

interface MiniChartProps {
  chartAnalysis: ChartAnalysis;
  pair: string;
  className?: string;
}

const MiniChart: React.FC<MiniChartProps> = ({ chartAnalysis, pair, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawChart();
  }, [chartAnalysis]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 200;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate sample price data for visualization
    const priceData = generateSamplePriceData(40);
    
    // Draw price chart
    drawPriceChart(ctx, priceData, canvas.width, canvas.height);
    
    // Draw markups
    drawMarkups(ctx, chartAnalysis.markups, canvas.width, canvas.height);
    
    // Draw analysis indicators
    drawAnalysisIndicators(ctx, chartAnalysis, canvas.width, canvas.height);
  };

  const generateSamplePriceData = (count: number) => {
    const data = [];
    let price = 1.0500;
    
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.5) * 0.002;
      price += change;
      data.push({
        open: price,
        high: price + Math.random() * 0.001,
        low: price - Math.random() * 0.001,
        close: price + change,
        x: (i / (count - 1)) * 280 + 10,
        index: i
      });
    }
    
    return data;
  };

  const drawPriceChart = (ctx: CanvasRenderingContext2D, data: any[], width: number, height: number) => {
    const prices = data.map(d => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Draw price line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const y = height - 40 - ((point.close - minPrice) / priceRange) * (height - 80);
      if (index === 0) {
        ctx.moveTo(point.x, y);
      } else {
        ctx.lineTo(point.x, y);
      }
    });
    
    ctx.stroke();

    // Draw candles for last few points
    data.slice(-8).forEach(point => {
      const openY = height - 40 - ((point.open - minPrice) / priceRange) * (height - 80);
      const closeY = height - 40 - ((point.close - minPrice) / priceRange) * (height - 80);
      const highY = height - 40 - ((point.high - minPrice) / priceRange) * (height - 80);
      const lowY = height - 40 - ((point.low - minPrice) / priceRange) * (height - 80);
      
      const isBullish = point.close > point.open;
      ctx.fillStyle = isBullish ? '#10b981' : '#ef4444';
      ctx.strokeStyle = isBullish ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      
      // Draw wick
      ctx.beginPath();
      ctx.moveTo(point.x, highY);
      ctx.lineTo(point.x, lowY);
      ctx.stroke();
      
      // Draw body
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(point.x - 2, bodyY, 4, bodyHeight || 1);
    });
  };

  const drawMarkups = (ctx: CanvasRenderingContext2D, markups: ChartMarkup[], width: number, height: number) => {
    markups.forEach(markup => {
      const x = width * 0.8; // Position most markups near the end
      let y = height * 0.5;
      
      switch (markup.type) {
        case 'Entry':
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(10, y);
          ctx.lineTo(width - 10, y);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Entry label
          ctx.fillStyle = '#fbbf24';
          ctx.font = '10px Arial';
          ctx.fillText('Entry', width - 40, y - 5);
          break;
          
        case 'FVG':
          // Draw FVG zone as rectangle
          ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
          ctx.fillRect(x - 30, y - 15, 60, 30);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 30, y - 15, 60, 30);
          
          // FVG label
          ctx.fillStyle = '#22c55e';
          ctx.font = '9px Arial';
          ctx.fillText('FVG', x - 12, y + 3);
          break;
          
        case 'BOS':
          // Draw BOS arrow
          ctx.fillStyle = '#8b5cf6';
          ctx.beginPath();
          ctx.moveTo(x, y - 20);
          ctx.lineTo(x + 10, y - 10);
          ctx.lineTo(x + 5, y - 10);
          ctx.lineTo(x + 5, y);
          ctx.lineTo(x - 5, y);
          ctx.lineTo(x - 5, y - 10);
          ctx.lineTo(x - 10, y - 10);
          ctx.closePath();
          ctx.fill();
          
          // BOS label
          ctx.fillStyle = '#8b5cf6';
          ctx.font = '9px Arial';
          ctx.fillText('BOS', x - 12, y + 15);
          break;
          
        case 'LiquiditySweep':
          // Draw sweep indicator
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y - 30, 8, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = '#f59e0b';
          ctx.font = '8px Arial';
          ctx.fillText('Sweep', x - 15, y - 40);
          break;
      }
    });
  };

  const drawAnalysisIndicators = (ctx: CanvasRenderingContext2D, analysis: ChartAnalysis, width: number, height: number) => {
    // HTF Bias indicator
    const htfColor = analysis.htfBias.aligned ? '#10b981' : '#ef4444';
    ctx.fillStyle = htfColor;
    ctx.fillRect(10, 10, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.fillText('HTF', 22, 18);
    
    // Volume indicator
    const volColor = analysis.volumeDelta.confirmed ? '#10b981' : '#6b7280';
    ctx.fillStyle = volColor;
    ctx.fillRect(10, 25, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VOL', 22, 33);
    
    // Entry Zone indicator
    const entryColor = analysis.entryZone.valid ? '#10b981' : '#6b7280';
    ctx.fillStyle = entryColor;
    ctx.fillRect(10, 40, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ZONE', 22, 48);
  };

  return (
    <div className={`relative bg-slate-900 rounded border border-slate-700 ${className}`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-auto"
        style={{ maxHeight: '200px' }}
      />
      
      {/* Chart overlay info */}
      <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
        {pair} • 15M
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded ${chartAnalysis.htfBias.aligned ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-300">HTF Aligned</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded ${chartAnalysis.volumeDelta.confirmed ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-gray-300">Volume Confirmed</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded ${chartAnalysis.entryZone.valid ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-gray-300">Entry Zone Valid</span>
        </div>
      </div>
    </div>
  );
};

export default MiniChart;
