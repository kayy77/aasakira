import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Shield, Clock, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { webSocketPriceService } from '@/services/webSocketPriceService';

interface LiveSignal {
  id: string;
  pair: string;
  direction: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  confidence: number;
  created_at: string;
  status: string;
  consensus: any;
  raw_ai_responses: any[];
  risk_reward_ratio: number;
  outcome?: string;
  pips_result?: number;
}

interface LiveSignalCardProps {
  signal: LiveSignal;
}

export const LiveSignalCard = ({ signal }: LiveSignalCardProps) => {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceAge, setPriceAge] = useState<number>(0);
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(false);
  
  useEffect(() => {
    const unsubscribe = webSocketPriceService.subscribeToPrice(signal.pair, (update) => {
      setLivePrice(update.price);
      const age = Math.floor((Date.now() - update.timestamp) / 1000);
      setPriceAge(age);
      setIsLiveFeed(age <= 3);
    });
    
    return unsubscribe;
  }, [signal.pair]);
  
  const formatPrice = (price: number) => {
    const decimals = signal.pair === 'XAUUSD' ? 2 : signal.pair.includes('USD') ? 5 : 2;
    return price.toFixed(decimals);
  };
  
  const getPipsMove = () => {
    if (!livePrice) return 0;
    const pipFactor = signal.pair === 'XAUUSD' ? 0.01 : 0.0001;
    const diff = (livePrice - signal.entry_price) / pipFactor;
    return signal.direction === 'BUY' ? diff : -diff;
  };
  
  const getProgressToTP = () => {
    if (!livePrice) return 0;
    const totalMove = signal.direction === 'BUY' 
      ? signal.take_profit - signal.entry_price
      : signal.entry_price - signal.take_profit;
    const currentMove = signal.direction === 'BUY'
      ? livePrice - signal.entry_price  
      : signal.entry_price - livePrice;
    return Math.max(0, Math.min(100, (currentMove / totalMove) * 100));
  };
  
  const getTimeAgo = () => {
    const date = new Date(signal.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };
  
  const pipsMove = getPipsMove();
  const progressToTP = getProgressToTP();
  
  return (
    <Card className="overflow-hidden border-2 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className={`p-4 ${
        signal.direction === 'BUY' 
          ? 'bg-gradient-to-r from-green-500/10 to-green-600/5' 
          : 'bg-gradient-to-r from-red-500/10 to-red-600/5'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              signal.direction === 'BUY' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {signal.direction === 'BUY' ? (
                <TrendingUp className="h-4 w-4 text-white" />
              ) : (
                <TrendingDown className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold">{signal.pair}</h3>
              <p className="text-sm text-muted-foreground">
                {signal.direction} • {getTimeAgo()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant={signal.confidence > 70 ? 'default' : 'secondary'} className="mb-2">
              {signal.confidence}% Confidence
            </Badge>
            {livePrice && (
              <div className="text-sm">
                <div className="font-mono text-lg">{formatPrice(livePrice)}</div>
                <Badge 
                  variant={isLiveFeed ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {isLiveFeed ? 'LIVE' : 'NO FEED'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* Price Levels */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Entry</div>
            <div className="font-mono font-bold">{formatPrice(signal.entry_price)}</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <div className="text-xs text-red-600 mb-1">Stop Loss</div>
            <div className="font-mono font-bold text-red-600">{formatPrice(signal.stop_loss)}</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="text-xs text-green-600 mb-1">Take Profit</div>
            <div className="font-mono font-bold text-green-600">{formatPrice(signal.take_profit)}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {livePrice && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progress to TP</span>
              <span className={pipsMove >= 0 ? 'text-green-500' : 'text-red-500'}>
                {pipsMove > 0 ? '+' : ''}{pipsMove.toFixed(1)} pips
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  progressToTP > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.abs(progressToTP))}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>R:R {signal.risk_reward_ratio?.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span>{signal.consensus?.filters_passed || 0}/{signal.consensus?.total_filters || 6}</span>
            </div>
          </div>
          
          <Badge variant={signal.status === 'APPROVED' ? 'default' : 'secondary'}>
            {signal.status}
          </Badge>
        </div>
        
        {/* Filters */}
        {signal.raw_ai_responses && signal.raw_ai_responses.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Filter Analysis</div>
            <div className="flex flex-wrap gap-1">
              {signal.raw_ai_responses.map((filter: any, index: number) => (
                <Badge 
                  key={index}
                  variant={filter.pass ? "default" : "outline"}
                  className={`text-xs ${filter.pass ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}
                >
                  {filter.name?.replace('_', ' ')} 
                  {filter.confidence && ` (${Math.round(filter.confidence * 100)}%)`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};