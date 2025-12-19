import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus, TrendingUp, TrendingDown, Clock, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ActiveTrade {
  id: string;
  pair: string;
  direction: string;
  entry_price: number | null;
  stop_loss: number | null;
  tp1: number | null;
  tp2: number | null;
  tp3: number | null;
  tp1_hit: boolean;
  tp2_hit: boolean;
  tp3_hit: boolean;
  be_activated: boolean;
  status: string;
  created_at: string;
  closed_at: string | null;
  raw_text: string | null;
}

function TPCheckbox({ label, value, hit }: { label: string; value: number | null; hit: boolean }) {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
        hit 
          ? 'bg-green-500 border-green-500' 
          : 'border-muted-foreground/30 bg-background'
      }`}>
        {hit && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm ${hit ? 'text-green-400 line-through' : 'text-foreground'}`}>
        {label}: {value}
      </span>
    </div>
  );
}

function TradeCard({ trade, isActive }: { trade: ActiveTrade; isActive: boolean }) {
  const isLong = trade.direction === 'LONG';
  const isClosed = trade.status !== 'ACTIVE';
  const isStoppedOut = trade.status === 'STOPPED_OUT';

  return (
    <Card className={`${isActive ? 'border-primary/50 shadow-lg' : 'opacity-75'} ${
      isStoppedOut ? 'border-destructive/50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold">{trade.pair}</CardTitle>
            <Badge 
              variant={isLong ? 'default' : 'destructive'}
              className={`${isLong ? 'bg-green-600' : 'bg-red-600'} text-white`}
            >
              {isLong ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trade.direction}
            </Badge>
          </div>
          <Badge 
            variant={isClosed ? (isStoppedOut ? 'destructive' : 'secondary') : 'default'}
            className={`${
              !isClosed ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              isStoppedOut ? 'bg-red-500/20 text-red-400' : ''
            }`}
          >
            {isClosed ? (isStoppedOut ? '❌ STOPPED OUT' : '✅ CLOSED') : '🟢 ACTIVE'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {new Date(trade.created_at).toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entry & SL */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">Entry</p>
            <p className="text-lg font-mono font-semibold">{trade.entry_price || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase">
              Stop Loss {trade.be_activated && <span className="text-yellow-500">(BE)</span>}
            </p>
            <p className={`text-lg font-mono font-semibold ${trade.be_activated ? 'text-yellow-500' : 'text-red-400'}`}>
              {trade.stop_loss || '—'}
            </p>
          </div>
        </div>

        <Separator />

        {/* Take Profit Checklist */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase">Take Profit Targets</p>
          <div className="space-y-2">
            <TPCheckbox label="TP1" value={trade.tp1} hit={trade.tp1_hit} />
            <TPCheckbox label="TP2" value={trade.tp2} hit={trade.tp2_hit} />
            <TPCheckbox label="TP3" value={trade.tp3} hit={trade.tp3_hit} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LiveTradeSignal() {
  const [activeTrade, setActiveTrade] = useState<ActiveTrade | null>(null);
  const [tradeHistory, setTradeHistory] = useState<ActiveTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    fetchTrades();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('active-trades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_trades'
        },
        (payload) => {
          console.log('🔄 Trade update received:', payload);
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTrades() {
    try {
      // Fetch active trade
      const { data: active, error: activeError } = await supabase
        .from('active_trades')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeError) throw activeError;
      setActiveTrade(active);

      // Fetch trade history (closed trades)
      const { data: history, error: historyError } = await supabase
        .from('active_trades')
        .select('*')
        .neq('status', 'ACTIVE')
        .order('closed_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;
      setTradeHistory(history || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading signals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Trade Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Trade Signal
        </h2>
        
        {activeTrade ? (
          <TradeCard trade={activeTrade} isActive={true} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Minus className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No active trade signal</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Waiting for next signal from Telegram...
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Trade History Section */}
      {tradeHistory.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Trade History
          </h2>
          <div className="space-y-4">
            {tradeHistory.map((trade) => (
              <TradeCard key={trade.id} trade={trade} isActive={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
