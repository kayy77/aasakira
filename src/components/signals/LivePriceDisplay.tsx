import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { webSocketPriceService, LivePriceUpdate } from '@/services/webSocketPriceService';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface LivePriceDisplayProps {
  symbols: string[];
}

interface PriceData extends LivePriceUpdate {
  previousPrice?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export const LivePriceDisplay = ({ symbols }: LivePriceDisplayProps) => {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<Map<string, 'connected' | 'disconnected' | 'reconnecting'>>(new Map());
  const previousPrices = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    
    symbols.forEach(symbol => {
      const unsubscribe = webSocketPriceService.subscribeToPrice(symbol, (update) => {
        const prevPrice = previousPrices.current.get(symbol);
        const trend = prevPrice 
          ? update.price > prevPrice ? 'up' : update.price < prevPrice ? 'down' : 'neutral'
          : 'neutral';
        
        previousPrices.current.set(symbol, update.price);
        
        setPrices(prev => new Map(prev.set(symbol, {
          ...update,
          previousPrice: prevPrice,
          trend
        })));
        
        setConnectionStatus(prev => new Map(prev.set(symbol, 'connected')));
      });
      
      unsubscribes.push(unsubscribe);
    });
    
    // Check connection status periodically
    const statusInterval = setInterval(() => {
      symbols.forEach(symbol => {
        const status = webSocketPriceService.getSymbolStatus(symbol);
        setConnectionStatus(prev => new Map(prev.set(symbol, status)));
      });
    }, 1000);
    
    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearInterval(statusInterval);
    };
  }, [symbols]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'XAUUSD') return price.toFixed(2);
    if (symbol.includes('30') || symbol.includes('100')) return Math.round(price).toLocaleString();
    return price.toFixed(5);
  };

  const getPriceAge = (timestamp: number) => {
    const ageSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (ageSeconds < 2) return 'Just now';
    if (ageSeconds < 60) return `${ageSeconds}s ago`;
    if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)}m ago`;
    return `${Math.floor(ageSeconds / 3600)}h ago`;
  };

  const getSymbolIcon = (symbol: string) => {
    if (symbol === 'XAUUSD') return '🥇';
    if (symbol.includes('30') || symbol.includes('100')) return '📊';
    return '💱';
  };

  const getStatusBadge = (status: 'connected' | 'disconnected' | 'reconnecting') => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
            <Wifi className="h-2.5 w-2.5 mr-1" />
            LIVE
          </Badge>
        );
      case 'reconnecting':
        return (
          <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" />
            RECONNECTING
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">
            <WifiOff className="h-2.5 w-2.5 mr-1" />
            OFFLINE
          </Badge>
        );
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {symbols.map(symbol => {
          const priceData = prices.get(symbol);
          const status = connectionStatus.get(symbol) || 'disconnected';
          
          return (
            <Card 
              key={symbol} 
              className={`overflow-hidden transition-all duration-300 ${
                priceData?.trend === 'up' ? 'border-green-500/30' :
                priceData?.trend === 'down' ? 'border-red-500/30' :
                'border-border'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getSymbolIcon(symbol)}</span>
                    <div>
                      <h3 className="font-bold text-lg">{symbol}</h3>
                      {getStatusBadge(status)}
                    </div>
                  </div>
                  
                  {priceData?.source && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs uppercase">
                          {priceData.source}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Data source: {priceData.source === 'deriv' ? 'Deriv WebSocket' : 
                          priceData.source === 'rest' ? 'REST API Fallback' : priceData.source}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                
                {priceData ? (
                  <div className="space-y-2">
                    <div className={`text-2xl font-mono font-bold transition-colors duration-300 ${
                      priceData.trend === 'up' ? 'text-green-500' :
                      priceData.trend === 'down' ? 'text-red-500' :
                      'text-foreground'
                    }`}>
                      {formatPrice(priceData.price, symbol)}
                      {priceData.trend === 'up' && <TrendingUp className="inline ml-2 h-5 w-5" />}
                      {priceData.trend === 'down' && <TrendingDown className="inline ml-2 h-5 w-5" />}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span>{getPriceAge(priceData.timestamp)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Activity className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                    <div className="text-sm">
                      {status === 'reconnecting' ? 'Connecting...' : 'Awaiting data...'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
