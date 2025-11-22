import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChartVisualizerProps {
  tradeData: {
    pair: string;
    direction: 'LONG' | 'SHORT';
    entry_price: number;
    exit_price?: number;
    stop_loss?: number;
    take_profit?: number;
    notes?: string;
  };
}

const ChartVisualizer: React.FC<ChartVisualizerProps> = ({ tradeData }) => {
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateChart();
  }, [tradeData]);

  const generateChart = async () => {
    setGenerating(true);

    try {
      // Generate prompt for AI to create chart visualization
      const prompt = `Create a clean, professional trading chart visualization showing:
- Currency pair: ${tradeData.pair}
- Direction: ${tradeData.direction}
- Entry: ${tradeData.entry_price}
${tradeData.exit_price ? `- Exit: ${tradeData.exit_price}` : ''}
${tradeData.stop_loss ? `- Stop Loss: ${tradeData.stop_loss}` : ''}
${tradeData.take_profit ? `- Take Profit: ${tradeData.take_profit}` : ''}
${tradeData.notes ? `- Setup notes: ${tradeData.notes}` : ''}

Style: Dark theme candlestick chart with price action, clear entry/exit markers with arrows, 
support/resistance levels marked. Professional forex chart aesthetic. No text labels, just visual representation.`;

      const { data, error } = await supabase.functions.invoke('generate-chart-visual', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setChartImage(data.imageUrl);
        toast({
          title: "Chart Generated!",
          description: "Your trade setup has been visualized",
        });
      }
    } catch (error) {
      console.error("Error generating chart:", error);
      
      // Fallback: Generate simple canvas-based chart
      generateCanvasChart();
      
      toast({
        title: "Using Simple Chart",
        description: "AI chart generation unavailable, showing basic visualization",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateCanvasChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1f1f2e';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (height / 10) * i);
      ctx.lineTo(width, (height / 10) * i);
      ctx.stroke();
    }

    // Calculate price range
    const prices = [
      tradeData.entry_price,
      tradeData.exit_price,
      tradeData.stop_loss,
      tradeData.take_profit
    ].filter((p): p is number => p !== undefined);
    
    const maxPrice = Math.max(...prices) * 1.01;
    const minPrice = Math.min(...prices) * 0.99;
    const priceRange = maxPrice - minPrice;

    const priceToY = (price: number) => {
      return height - ((price - minPrice) / priceRange) * height;
    };

    // Draw price levels
    const entryY = priceToY(tradeData.entry_price);
    
    // Entry line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, entryY);
    ctx.lineTo(width, entryY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Entry label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`Entry: ${tradeData.entry_price}`, 10, entryY - 5);

    // Exit line if exists
    if (tradeData.exit_price) {
      const exitY = priceToY(tradeData.exit_price);
      const isProfit = tradeData.direction === 'LONG' ? 
        tradeData.exit_price > tradeData.entry_price : 
        tradeData.exit_price < tradeData.entry_price;
      
      ctx.strokeStyle = isProfit ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, exitY);
      ctx.lineTo(width, exitY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isProfit ? '#10b981' : '#ef4444';
      ctx.fillText(`Exit: ${tradeData.exit_price}`, 10, exitY - 5);

      // Draw arrow showing direction
      const midX = width / 2;
      ctx.strokeStyle = isProfit ? '#10b981' : '#ef4444';
      ctx.fillStyle = isProfit ? '#10b981' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(midX, entryY);
      ctx.lineTo(midX, exitY);
      ctx.stroke();
      
      // Arrow head
      const arrowSize = 10;
      const direction = exitY < entryY ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(midX, exitY);
      ctx.lineTo(midX - arrowSize, exitY - (arrowSize * direction));
      ctx.lineTo(midX + arrowSize, exitY - (arrowSize * direction));
      ctx.closePath();
      ctx.fill();
    }

    // Direction indicator
    const directionColor = tradeData.direction === 'LONG' ? '#10b981' : '#ef4444';
    ctx.fillStyle = directionColor;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(tradeData.direction, width - 80, 30);
    
    // Pair
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(tradeData.pair, 10, 30);
  };

  const downloadChart = () => {
    if (chartImage) {
      const link = document.createElement('a');
      link.download = `${tradeData.pair}_${tradeData.direction}_chart.png`;
      link.href = chartImage;
      link.click();
    } else if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${tradeData.pair}_${tradeData.direction}_chart.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tradeData.direction === 'LONG' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            Trade Setup Visualization
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadChart}
            className="border-purple-500/50 hover:bg-purple-500/10"
          >
            <Download className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {generating ? (
          <div className="flex items-center justify-center h-64 bg-gray-900/50 rounded-lg">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-purple-300">Generating chart visualization...</p>
            </div>
          </div>
        ) : chartImage ? (
          <img 
            src={chartImage} 
            alt="Trade chart visualization" 
            className="w-full rounded-lg border border-purple-500/20"
          />
        ) : (
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={400}
            className="w-full rounded-lg border border-purple-500/20"
          />
        )}
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Pair:</span>
              <span className="text-white ml-2 font-medium">{tradeData.pair}</span>
            </div>
            <div>
              <span className="text-gray-400">Direction:</span>
              <span className={`ml-2 font-medium ${tradeData.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                {tradeData.direction}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Entry:</span>
              <span className="text-white ml-2 font-medium">{tradeData.entry_price}</span>
            </div>
            {tradeData.exit_price && (
              <div>
                <span className="text-gray-400">Exit:</span>
                <span className="text-white ml-2 font-medium">{tradeData.exit_price}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartVisualizer;
