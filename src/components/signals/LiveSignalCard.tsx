import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Clock, Trash2, Activity } from 'lucide-react';
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
  onDelete?: (signalId: string) => void;
}

export const LiveSignalCard = ({ signal, onDelete }: LiveSignalCardProps) => {
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
  
  const isBuy = signal.direction === 'BUY';
  
  const formatPrice = (price: number) => {
    return signal.pair === 'XAUUSD' ? price.toFixed(2) : Math.round(price).toString();
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
  
  const canDelete = () => {
    const signalAge = Date.now() - new Date(signal.created_at).getTime();
    return signalAge > 24 * 60 * 60 * 1000; // 24 hours
  };

  // Calculate progress to TP/SL
  const calculateProgress = () => {
    if (!livePrice) return { tpProgress: 0, slProgress: 0 };
    
    const totalRange = Math.abs(signal.take_profit - signal.entry_price);
    const currentMove = isBuy 
      ? livePrice - signal.entry_price 
      : signal.entry_price - livePrice;
    
    const tpProgress = Math.max(0, Math.min(100, (currentMove / totalRange) * 100));
    
    const slDistance = Math.abs(signal.stop_loss - signal.entry_price);
    const slMove = isBuy 
      ? signal.entry_price - livePrice 
      : livePrice - signal.entry_price;
    
    const slProgress = Math.max(0, Math.min(100, (slMove / slDistance) * 100));
    
    return { tpProgress, slProgress };
  };

  const { tpProgress, slProgress } = calculateProgress();
  const currentPrice = livePrice || signal.entry_price;

  return (
    <Card className={`overflow-hidden border-l-4 ${isBuy ? 'border-l-green-500 bg-gradient-to-r from-green-50/30 to-transparent' : 'border-l-red-500 bg-gradient-to-r from-red-50/30 to-transparent'}`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}>
              {isBuy ? (
                <TrendingUp className="h-5 w-5 text-white" />
              ) : (
                <TrendingDown className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{signal.pair}</h3>
                <Badge 
                  variant={isBuy ? 'default' : 'destructive'} 
                  className={isBuy ? 'bg-green-500' : 'bg-red-500'}
                >
                  {signal.direction}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                  {signal.confidence}% Confidence
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {getTimeAgo()}
                {isLiveFeed && (
                  <>
                    <span>•</span>
                    <Activity className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Live feed active</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {canDelete() && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(signal.id)}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Price Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Entry</div>
            <div className="text-base font-mono font-bold">{formatPrice(signal.entry_price)}</div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Current</div>
            <div className={`text-base font-mono font-bold ${!isLiveFeed ? 'text-orange-500' : isBuy ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(currentPrice)}
            </div>
          </div>
          
          <div className="text-center bg-green-50 rounded p-2">
            <div className="text-xs text-green-700 mb-1">TP</div>
            <div className="text-base font-mono font-bold text-green-700">
              {formatPrice(signal.take_profit)}
            </div>
          </div>
          
          <div className="text-center bg-red-50 rounded p-2">
            <div className="text-xs text-red-700 mb-1">SL</div>
            <div className="text-base font-mono font-bold text-red-700">
              {formatPrice(signal.stop_loss)}
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        {livePrice && (
          <div className="space-y-2 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-600">Progress to TP</span>
                <span className="font-mono text-green-600">{tpProgress.toFixed(0)}%</span>
              </div>
              <Progress value={tpProgress} className="h-2 bg-green-100" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-600">Risk to SL</span>
                <span className="font-mono text-red-600">{slProgress.toFixed(0)}%</span>
              </div>
              <Progress value={slProgress} className="h-2 bg-red-100" />
            </div>
          </div>
        )}

        {/* Filters */}
        {signal.raw_ai_responses && (
          <div className="flex flex-wrap gap-2">
            {signal.raw_ai_responses.map((filter: any, idx: number) => (
              <Badge 
                key={idx} 
                variant="outline"
                className={`text-xs ${filter.pass ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}
              >
                {filter.pass ? '✓' : '✗'} {filter.name.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};