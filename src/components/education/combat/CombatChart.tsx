
import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MarketLevel {
  price: number;
  type: 'support' | 'resistance' | 'rejection';
  strength: number;
  hint: string;
}

interface CombatChartProps {
  candles: CandleData[];
  currentPrice: number;
  bullPower: number;
  bearPower: number;
  volatilityAlert: boolean;
  priceDirection: 'up' | 'down';
  width?: number;
  height?: number;
}

const CombatChart: React.FC<CombatChartProps> = ({
  candles,
  currentPrice,
  bullPower,
  bearPower,
  volatilityAlert,
  priceDirection,
  width = 400,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [marketLevels, setMarketLevels] = useState<MarketLevel[]>([]);
  const [energyPulse, setEnergyPulse] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState(0);

  // Energy pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyPulse(prev => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Volatility shake effect
  useEffect(() => {
    if (volatilityAlert) {
      setShakeIntensity(5);
      const fadeOut = setInterval(() => {
        setShakeIntensity(prev => Math.max(0, prev - 0.5));
      }, 100);
      setTimeout(() => clearInterval(fadeOut), 1000);
    }
  }, [volatilityAlert]);

  // Generate AI market levels
  useEffect(() => {
    if (candles.length < 10) return;

    const levels: MarketLevel[] = [];
    const prices = candles.map(c => [c.high, c.low, c.close]).flat();
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    // Find key levels using price clustering
    const clusters = [];
    let currentCluster = [sortedPrices[0]];
    
    for (let i = 1; i < sortedPrices.length; i++) {
      if (sortedPrices[i] - sortedPrices[i-1] < (sortedPrices[sortedPrices.length-1] - sortedPrices[0]) * 0.002) {
        currentCluster.push(sortedPrices[i]);
      } else {
        if (currentCluster.length > 3) {
          clusters.push(currentCluster);
        }
        currentCluster = [sortedPrices[i]];
      }
    }

    // Convert clusters to market levels
    clusters.forEach(cluster => {
      const avgPrice = cluster.reduce((a, b) => a + b, 0) / cluster.length;
      const strength = Math.min(100, cluster.length * 10);
      
      let type: 'support' | 'resistance' | 'rejection' = 'support';
      let hint = '';
      
      if (avgPrice > currentPrice) {
        type = 'resistance';
        hint = strength > 50 ? '🔥 Zone of Rejection' : '⚡ Resistance Barrier';
      } else {
        type = 'support';
        hint = strength > 50 ? '🛡️ Fortress of Support' : '📈 Bounce Zone';
      }
      
      // Check for rejection patterns
      const recentCandles = candles.slice(-5);
      const hasRejection = recentCandles.some(c => 
        Math.abs(c.high - avgPrice) < (c.high - c.low) * 0.1 && c.close < c.open
      );
      
      if (hasRejection) {
        type = 'rejection';
        hint = '💀 Graveyard of Bulls/Bears';
      }
      
      levels.push({ price: avgPrice, type, strength, hint });
    });

    setMarketLevels(levels.slice(0, 3)); // Show top 3 levels
  }, [candles, currentPrice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply shake effect
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;
    ctx.setTransform(1, 0, 0, 1, shakeX, shakeY);

    // Clear canvas with battle atmosphere
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(0.5, 'rgba(20, 20, 30, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Battle aura effects
    const bullIntensity = bullPower / 100;
    const bearIntensity = bearPower / 100;
    const pulseStrength = Math.sin(energyPulse) * 0.3 + 0.7;

    // Bull aura (left side)
    const bullGradient = ctx.createLinearGradient(0, 0, width * 0.4, 0);
    bullGradient.addColorStop(0, `rgba(34, 197, 94, ${bullIntensity * pulseStrength * 0.3})`);
    bullGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = bullGradient;
    ctx.fillRect(0, 0, width * 0.4, height);

    // Bear aura (right side)
    const bearGradient = ctx.createLinearGradient(width * 0.6, 0, width, 0);
    bearGradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
    bearGradient.addColorStop(1, `rgba(239, 68, 68, ${bearIntensity * pulseStrength * 0.3})`);
    ctx.fillStyle = bearGradient;
    ctx.fillRect(width * 0.6, 0, width * 0.4, height);

    // Calculate price range
    const prices = candles.map(c => [c.high, c.low]).flat();
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    // Helper function to convert price to Y coordinate
    const priceToY = (price: number) => {
      return height - ((price - minPrice + padding) / (priceRange + 2 * padding)) * height;
    };

    // Helper function to convert index to X coordinate
    const indexToX = (index: number) => {
      return (index / (candles.length - 1)) * (width - 40) + 20;
    };

    // Draw market levels with AI hints
    marketLevels.forEach(level => {
      const y = priceToY(level.price);
      
      // Level line with glow effect
      ctx.strokeStyle = level.type === 'resistance' ? 'rgba(239, 68, 68, 0.8)' : 
                       level.type === 'support' ? 'rgba(34, 197, 94, 0.8)' : 
                       'rgba(168, 85, 247, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Glow effect
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    });

    // Draw candlesticks with energy effects
    const candleWidth = Math.max(2, (width - 40) / candles.length - 1);
    
    candles.forEach((candle, index) => {
      const x = indexToX(index);
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);
      
      const isBull = candle.close > candle.open;
      const bodyHeight = Math.abs(closeY - openY);
      
      // Enhanced candle colors with energy
      const baseColor = isBull ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)';
      const glowColor = isBull ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      
      // Wick
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Body with energy glow
      if (index === candles.length - 1) {
        // Current candle gets extra energy
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
      }
      
      ctx.fillStyle = baseColor;
      ctx.fillRect(
        x - candleWidth / 2,
        Math.min(openY, closeY),
        candleWidth,
        Math.max(bodyHeight, 1)
      );
      
      ctx.shadowBlur = 0;
    });

    // Current price line with battle energy
    const currentY = priceToY(currentPrice);
    const priceColor = priceDirection === 'up' ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)';
    
    ctx.strokeStyle = priceColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = priceColor;
    ctx.shadowBlur = 20;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(20, currentY);
    ctx.lineTo(width - 20, currentY);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);

    // Price label
    ctx.fillStyle = priceColor;
    ctx.font = '12px monospace';
    ctx.fillText(currentPrice.toFixed(4), width - 60, currentY - 5);

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [candles, currentPrice, bullPower, bearPower, energyPulse, shakeIntensity, marketLevels, priceDirection, width, height]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-purple-500/20"
      />
      
      {/* Market Level Hints */}
      <div className="absolute top-2 left-2 space-y-1">
        {marketLevels.slice(0, 2).map((level, index) => (
          <div
            key={index}
            className={`text-xs px-2 py-1 rounded-full font-semibold backdrop-blur-sm ${
              level.type === 'resistance' ? 'bg-red-900/40 text-red-300' :
              level.type === 'support' ? 'bg-green-900/40 text-green-300' :
              'bg-purple-900/40 text-purple-300'
            }`}
          >
            {level.hint}
          </div>
        ))}
      </div>

      {/* Volatility Alert */}
      {volatilityAlert && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
          <div className="flex items-center space-x-2 bg-yellow-900/60 text-yellow-300 px-3 py-2 rounded-lg backdrop-blur-sm border border-yellow-500/40">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-bold">VOLATILITY SPIKE!</span>
            <Zap className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      )}

      {/* Battle Power Indicators */}
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-green-400">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-bold">{Math.round(bullPower)}%</span>
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-red-400">
          <span className="text-xs font-bold">{Math.round(bearPower)}%</span>
          <TrendingDown className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default CombatChart;
