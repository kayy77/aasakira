import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TakeProfit {
  level: number;
  price: number;
  hit: boolean;
  pips?: number;
}

interface ActiveTrade {
  id: string;
  pair: string;
  direction: string;
  entry_price: number | null;
  stop_loss: number | null;
  take_profits: TakeProfit[];
  pips_realized: number;
  status: string;
  created_at: string;
}

const HomeLiveTrades = () => {
  const [trades, setTrades] = useState<ActiveTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
    
    // Real-time subscription
    const channel = supabase
      .channel('home-live-trades')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_trades' },
        () => fetchTrades()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrades = async () => {
    const { data, error } = await supabase
      .from('active_trades')
      .select('*')
      .in('status', ['active', 'partial'])
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      const parsed = data.map((trade) => ({
        id: trade.id,
        pair: trade.pair,
        direction: trade.direction,
        entry_price: trade.entry_price,
        stop_loss: trade.stop_loss,
        take_profits: Array.isArray(trade.take_profits) 
          ? (trade.take_profits as unknown as TakeProfit[])
          : [],
        pips_realized: typeof trade.pips_realized === 'number' ? trade.pips_realized : 0,
        status: trade.status,
        created_at: trade.created_at || new Date().toISOString(),
      }));
      setTrades(parsed);
    }
    setLoading(false);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '—';
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 });
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Activity className="w-5 h-5 animate-pulse" />
            Loading live trades...
          </div>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return null; // Don't show section if no active trades
  }

  return (
    <div className="py-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">LIVE TRADES</h2>
        </div>
        <p className="text-muted-foreground text-sm">Real-time signals from our Telegram channel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {trades.map((trade) => (
          <Card 
            key={trade.id} 
            className="p-5 bg-card/90 backdrop-blur border-border hover:border-purple-500/50 transition-all"
          >
            {/* Header: Pair + Direction + Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{trade.pair}</span>
                <Badge 
                  className={`text-xs font-semibold ${
                    trade.direction === 'BUY' || trade.direction === 'LONG'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {trade.direction}
                </Badge>
              </div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                {trade.status.toUpperCase()}
              </Badge>
            </div>

            {/* Entry & SL */}
            <div className="space-y-1 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry</span>
                <span className="font-mono font-medium">{formatPrice(trade.entry_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">SL</span>
                <span className="font-mono font-medium text-red-400">{formatPrice(trade.stop_loss)}</span>
              </div>
            </div>

            {/* TPs */}
            {trade.take_profits.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Take Profits</span>
                <div className="mt-2 space-y-1.5">
                  {trade.take_profits
                    .sort((a, b) => a.level - b.level)
                    .map((tp) => (
                      <div 
                        key={tp.level} 
                        className={`flex items-center justify-between text-sm px-2 py-1 rounded ${
                          tp.hit 
                            ? 'bg-green-500/10 border border-green-500/30' 
                            : 'bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={tp.hit ? 'text-green-400' : 'text-muted-foreground'}>
                            {tp.hit ? '✅' : '⬜'}
                          </span>
                          <span className={tp.hit ? 'text-green-400 font-medium' : 'text-muted-foreground'}>
                            TP{tp.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono ${tp.hit ? 'text-green-400' : ''}`}>
                            {formatPrice(tp.price)}
                          </span>
                          {tp.hit && tp.pips !== undefined && (
                            <span className="text-green-400 text-xs font-medium">
                              +{tp.pips} pips
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Footer: Pips + Time */}
            <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
              <div>
                {trade.pips_realized > 0 && (
                  <span className="text-green-400 font-semibold">
                    Running: +{trade.pips_realized} pips
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                Opened {getTimeAgo(trade.created_at)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomeLiveTrades;
