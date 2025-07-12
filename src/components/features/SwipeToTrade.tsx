import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Target, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradeSignal {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  reason: string;
  timeframe: string;
}

interface SwipeToTradeProps {
  signal: TradeSignal;
  onTrade: (signalId: string, action: 'accept' | 'reject') => void;
}

const SwipeToTrade: React.FC<SwipeToTradeProps> = ({ signal, onTrade }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const offset = currentX - startX;
    setDragOffset(Math.max(-150, Math.min(150, offset)));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const offset = currentX - startX;
    setDragOffset(Math.max(-150, Math.min(150, offset)));
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    if (dragOffset > 100) {
      // Swiped right - Accept trade
      onTrade(signal.id, 'accept');
      toast({
        title: "Trade Accepted! 📈",
        description: `${signal.direction} ${signal.pair} position opened`,
      });
    } else if (dragOffset < -100) {
      // Swiped left - Reject trade
      onTrade(signal.id, 'reject');
      toast({
        title: "Trade Rejected ❌",
        description: `${signal.pair} signal dismissed`,
        variant: "destructive",
      });
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
  };

  const getSwipeIndicator = () => {
    if (dragOffset > 50) return 'ACCEPT';
    if (dragOffset < -50) return 'REJECT';
    return null;
  };

  const getCardStyle = () => {
    const rotation = dragOffset * 0.1;
    return {
      transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    };
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Swipe Indicators */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-0">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity duration-200 ${
          dragOffset < -50 ? 'opacity-100 bg-red-500/20 border border-red-500/30' : 'opacity-0'
        }`}>
          <TrendingDown className="h-5 w-5 text-red-400" />
          <span className="text-red-400 font-bold">REJECT</span>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity duration-200 ${
          dragOffset > 50 ? 'opacity-100 bg-green-500/20 border border-green-500/30' : 'opacity-0'
        }`}>
          <TrendingUp className="h-5 w-5 text-green-400" />
          <span className="text-green-400 font-bold">ACCEPT</span>
        </div>
      </div>

      {/* Main Card */}
      <Card
        ref={cardRef}
        className="bg-black/60 backdrop-blur-sm border-white/20 cursor-grab active:cursor-grabbing relative z-10"
        style={getCardStyle()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                signal.direction === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {signal.direction === 'BUY' ? 
                  <TrendingUp className="h-5 w-5 text-green-400" /> :
                  <TrendingDown className="h-5 w-5 text-red-400" />
                }
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
                <p className="text-sm text-gray-400">{signal.timeframe}</p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`${
                signal.confidence >= 80 ? 'bg-green-500/20 text-green-400' :
                signal.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}
            >
              {signal.confidence}% Confidence
            </Badge>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-xs text-gray-400">Entry</div>
              <div className="text-sm font-bold text-white">{signal.entry}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Shield className="h-4 w-4 text-red-400" />
              </div>
              <div className="text-xs text-gray-400">Stop Loss</div>
              <div className="text-sm font-bold text-white">{signal.stopLoss}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-xs text-gray-400">Take Profit</div>
              <div className="text-sm font-bold text-white">{signal.takeProfit}</div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white/5 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-purple-400 uppercase font-medium">Analysis</span>
            </div>
            <p className="text-sm text-gray-300">{signal.reason}</p>
          </div>

          {/* Swipe Instructions */}
          <div className="text-center text-xs text-gray-500">
            ← Swipe left to reject • Swipe right to accept →
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwipeToTrade;