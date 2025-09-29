import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { webSocketPriceService } from '@/services/webSocketPriceService';

interface LivePriceDisplayProps {
  symbols: string[];
}

interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  source: string;
  change24h?: number;
}

export const LivePriceDisplay = ({ symbols }: LivePriceDisplayProps) => {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    
    symbols.forEach(symbol => {
      const unsubscribe = webSocketPriceService.subscribeToPrice(symbol, (update) => {
        setPrices(prev => new Map(prev.set(symbol, {
          symbol,
          price: update.price,
          timestamp: update.timestamp,
          source: update.source
        })));
        
        setConnectionStatus(prev => new Map(prev.set(symbol, true)));
      });
      
      unsubscribes.push(unsubscribe);
    });
    
    // Check connection status periodically (strict 3-second freshness)
    const statusInterval = setInterval(() => {
      const now = Date.now();
      setConnectionStatus(prev => {
        const updated = new Map(prev);
        prices.forEach((priceData, symbol) => {
          const ageMs = now - priceData.timestamp;
          const isLive = ageMs <= 3000;
          updated.set(symbol, isLive);
        });
        return updated;
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
    if (ageSeconds < 60) return `${ageSeconds}s`;
    if (ageSeconds < 3600) return `${Math.floor(ageSeconds / 60)}m`;
    return `${Math.floor(ageSeconds / 3600)}h`;
  };

  const getSymbolIcon = (symbol: string) => {
    if (symbol === 'XAUUSD') return '🥇';
    if (symbol.includes('30') || symbol.includes('100')) return '📊';
    return '💱';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {symbols.map(symbol => {
        const priceData = prices.get(symbol);
        const isConnected = connectionStatus.get(symbol) || false;
        
        return (
          <Card key={symbol} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSymbolIcon(symbol)}</span>
                  <div>
                    <h3 className="font-bold text-lg">{symbol}</h3>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <Wifi className="h-3 w-3 text-green-500" />
                      ) : (
                        <WifiOff className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isConnected ? 'LIVE ONLY' : 'NO FEED'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {priceData?.source && (
                  <Badge 
                    variant={priceData.source === 'deriv' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {priceData.source === 'deriv' ? 'LIVE' : 'STALE'}
                  </Badge>
                )}
              </div>
              
              {priceData ? (
                <div className="space-y-2">
                  <div className="text-2xl font-mono font-bold">
                    {formatPrice(priceData.price, symbol)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>Updated {getPriceAge(priceData.timestamp)} ago</span>
                    </div>
                  </div>
                  
                  {/* Simulated 24h change for demo */}
                  <div className="flex items-center gap-1">
                    {Math.random() > 0.5 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                      {(Math.random() * 2 - 1).toFixed(2)}%
                    </span>
                    <span className="text-xs text-muted-foreground">24h</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <div className="text-sm">Connecting to live feed...</div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};