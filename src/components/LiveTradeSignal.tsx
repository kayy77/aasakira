import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, TrendingUp, TrendingDown, Clock, History, Target, AlertTriangle, Trophy } from 'lucide-react';
import DateFilter, { DateRange } from '@/components/signals/DateFilter';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface TakeProfit {
  level: number;
  price: number;
  hit: boolean;
  pips: number | null;
}

interface ActiveTrade {
  id: string;
  pair: string;
  direction: string;
  entry_price: number | null;
  stop_loss: number | null;
  take_profits: TakeProfit[] | null;
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
  pips_realized: number | null;
  outcome: string | null;
}

interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPips: number;
}

function TPCheckbox({ tp }: { tp: TakeProfit }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          tp.hit 
            ? 'bg-green-500 border-green-500' 
            : 'border-muted-foreground/30 bg-background'
        }`}>
          {tp.hit && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className={`font-mono ${tp.hit ? 'text-green-400' : 'text-foreground'}`}>
          TP{tp.level} — {tp.price}
        </span>
      </div>
      {tp.hit && tp.pips !== null && (
        <span className="text-green-400 font-semibold text-sm">
          +{tp.pips} pips
        </span>
      )}
    </div>
  );
}

function TradeCard({ trade, isActive }: { trade: ActiveTrade; isActive: boolean }) {
  const isLong = trade.direction === 'LONG';
  const isClosed = trade.status !== 'ACTIVE';
  const isStoppedOut = trade.status === 'STOPPED_OUT';

  // Get take profits from new column or fallback to legacy
  const takeProfits: TakeProfit[] = trade.take_profits && trade.take_profits.length > 0
    ? trade.take_profits
    : [
        trade.tp1 && { level: 1, price: trade.tp1, hit: trade.tp1_hit || false, pips: null },
        trade.tp2 && { level: 2, price: trade.tp2, hit: trade.tp2_hit || false, pips: null },
        trade.tp3 && { level: 3, price: trade.tp3, hit: trade.tp3_hit || false, pips: null },
      ].filter(Boolean) as TakeProfit[];

  const tpsHit = takeProfits.filter(tp => tp.hit).length;

  // Display “Total pips” as the furthest TP reached (not a sum of each TP step)
  const maxHitTpPips = takeProfits
    .filter((tp) => tp.hit && typeof tp.pips === 'number')
    .map((tp) => tp.pips as number);

  const totalPips = (() => {
    // Prefer TP-derived pips when available (fixes old records where pips_realized was summed)
    if (maxHitTpPips.length > 0) return Math.max(...maxHitTpPips);

    // Fallback to stored value (useful for SL / manual close when no TP pips exist)
    if (typeof trade.pips_realized === 'number') return trade.pips_realized;

    return 0;
  })();

  return (
    <Card className={`${isActive ? 'border-primary/50 shadow-lg' : 'opacity-80'} ${
      isStoppedOut ? 'border-destructive/50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl font-bold tracking-tight">{trade.pair}</CardTitle>
            <Badge 
              variant={isLong ? 'default' : 'destructive'}
              className={`${isLong ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold`}
            >
              {isLong ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trade.direction}
            </Badge>
          </div>
          <Badge 
            variant={isClosed ? (isStoppedOut ? 'destructive' : 'secondary') : 'default'}
            className={`text-sm px-3 py-1 ${
              !isClosed ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              isStoppedOut ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
              'bg-muted text-muted-foreground'
            }`}
          >
            {!isClosed ? '🟢 ACTIVE' : isStoppedOut ? '❌ STOPPED' : '✅ CLOSED'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {new Date(trade.created_at).toLocaleString()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Entry & SL Row */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Entry</p>
            <p className="text-xl font-mono font-bold">{trade.entry_price || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Stop Loss {trade.be_activated && <span className="text-yellow-500 text-xs">(BE)</span>}
            </p>
            <p className={`text-xl font-mono font-bold ${trade.be_activated ? 'text-yellow-500' : 'text-red-400'}`}>
              {trade.stop_loss || '—'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Take Profits */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Target className="w-3 h-3" />
              Take Profits ({tpsHit}/{takeProfits.length})
            </p>
            {totalPips !== 0 && (
              <span className={`${totalPips > 0 ? 'text-green-400' : 'text-red-400'} font-bold text-sm`}>
                Total: {totalPips > 0 ? '+' : ''}{totalPips} pips
              </span>
            )}
          </div>
          <div className="space-y-1">
            {takeProfits.map((tp) => (
              <TPCheckbox key={tp.level} tp={tp} />
            ))}
          </div>
        </div>

        {/* Stopped out indicator */}
        {isStoppedOut && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <X className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Trade stopped out</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function LiveTradeSignal() {
  const [activeTrade, setActiveTrade] = useState<ActiveTrade | null>(null);
  const [allTrades, setAllTrades] = useState<ActiveTrade[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ActiveTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: 'This Month'
  });
  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0, wins: 0, losses: 0, winRate: 0, totalPips: 0
  });

  useEffect(() => {
    fetchTrades();

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

  // Filter trades when date range changes
  useEffect(() => {
    const filtered = allTrades.filter(trade => {
      const tradeDate = new Date(trade.closed_at || trade.created_at);
      return isWithinInterval(tradeDate, { start: dateRange.from, end: dateRange.to });
    });
    setFilteredHistory(filtered);

    // Calculate stats for filtered trades
    // A trade is a WIN if at least TP1 was hit (closed in profit)
    const wins = filtered.filter(t => t.tp1_hit === true).length;
    // A trade is a LOSS only if stopped out and no TP was hit
    const losses = filtered.filter(t => t.status === 'STOPPED_OUT' && !t.tp1_hit).length;
    
    // Calculate total pips correctly:
    // For winning trades: use the HIGHEST TP level hit (not sum)
    // For losing trades: use the negative pips_realized
    const totalPips = filtered.reduce((sum, trade) => {
      // If trade has take_profits array, get max pips from hit TPs
      if (trade.take_profits && Array.isArray(trade.take_profits)) {
        const hitTps = trade.take_profits.filter((tp: any) => tp.hit && typeof tp.pips === 'number');
        if (hitTps.length > 0) {
          const maxPips = Math.max(...hitTps.map((tp: any) => tp.pips as number));
          return sum + maxPips;
        }
      }
      // Fallback for losses or trades without take_profits array
      return sum + (trade.pips_realized || 0);
    }, 0);

    setStats({
      totalTrades: filtered.length,
      wins,
      losses,
      winRate: filtered.length > 0 ? Math.round((wins / filtered.length) * 100) : 0,
      totalPips
    });
  }, [dateRange, allTrades]);

  async function fetchTrades() {
    try {
      const { data: active, error: activeError } = await supabase
        .from('active_trades')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeError) throw activeError;
      
      if (active) {
        const parsed = {
          ...active,
          take_profits: Array.isArray(active.take_profits) 
            ? active.take_profits as unknown as TakeProfit[]
            : null
        };
        setActiveTrade(parsed as ActiveTrade);
      } else {
        setActiveTrade(null);
      }

      // Fetch ALL closed trades for filtering
      const { data: history, error: historyError } = await supabase
        .from('active_trades')
        .select('*')
        .neq('status', 'ACTIVE')
        .order('closed_at', { ascending: false });

      if (historyError) throw historyError;
      
      const parsedHistory = (history || []).map(trade => ({
        ...trade,
        take_profits: Array.isArray(trade.take_profits)
          ? trade.take_profits as unknown as TakeProfit[]
          : null
      })) as ActiveTrade[];
      setAllTrades(parsedHistory);
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
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">No active trade signal</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Waiting for next signal from Telegram...
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Stats Summary */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalTrades}</p>
              <p className="text-xs text-muted-foreground">Trades</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stats.winRate >= 60 ? 'text-green-400' : 'text-foreground'}`}>
                {stats.winRate}%
              </p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stats.totalPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalPips >= 0 ? '+' : ''}{stats.totalPips}
              </p>
              <p className="text-xs text-muted-foreground">Pips</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trade History Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Trade History
        </h2>

        {/* Date Filter */}
        <div className="mb-6">
          <DateFilter onRangeChange={setDateRange} currentRange={dateRange} />
        </div>

        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((trade) => (
              <TradeCard key={trade.id} trade={trade} isActive={false} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">No trades found for this period</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}