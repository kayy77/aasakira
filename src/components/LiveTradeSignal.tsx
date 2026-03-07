import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, TrendingUp, TrendingDown, Clock, History, Target, AlertTriangle, Trophy } from 'lucide-react';
import DateFilter, { DateRange } from '@/components/signals/DateFilter';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { getMaxTpPips, classifyTradeOutcome } from '@/utils/tradePips';

interface TakeProfit {
  level: number;
  price: number;
  hit: boolean;
  pips: number | null;
}

const COMMUNITY_CHANNEL_ID = -1002187927163;
const VIP_CHANNEL_ID = -1003491244183;

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
  channel_id: number;
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


function TradeSection({ 
  label, 
  badgeColor, 
  activeTrade, 
  history, 
  stats, 
  dateRange, 
  onDateChange 
}: { 
  label: string; 
  badgeColor: string; 
  activeTrade: ActiveTrade | null; 
  history: ActiveTrade[]; 
  stats: TradeStats; 
  dateRange: DateRange; 
  onDateChange: (range: DateRange) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Active Trade */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          {label} Live Signal
          <Badge className={`${badgeColor} text-xs ml-2`}>{label}</Badge>
        </h2>

        {activeTrade ? (
          <TradeCard trade={activeTrade} isActive={true} />
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">No active {label.toLowerCase()} signal</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Waiting for next signal...</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Stats */}
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

      {/* History */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          {label} Trade History
        </h2>
        <div className="mb-6">
          <DateFilter onRangeChange={onDateChange} currentRange={dateRange} />
        </div>
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((trade) => (
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

function computeStats(trades: ActiveTrade[]): TradeStats {
  const losses = trades.filter(t => classifyTradeOutcome(t) === 'loss').length;
  const wins = trades.length - losses;
  const totalPips = trades.reduce((sum, trade) => sum + getMaxTpPips(trade), 0);
  return {
    totalTrades: trades.length,
    wins,
    losses,
    winRate: trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0,
    totalPips,
  };
}

export default function LiveTradeSignal() {
  const [communityActive, setCommunityActive] = useState<ActiveTrade | null>(null);
  const [vipActive, setVipActive] = useState<ActiveTrade | null>(null);
  const [communityAll, setCommunityAll] = useState<ActiveTrade[]>([]);
  const [vipAll, setVipAll] = useState<ActiveTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'community' | 'vip'>('vip');

  const [communityDateRange, setCommunityDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: 'This Month'
  });
  const [vipDateRange, setVipDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: 'This Month'
  });

  useEffect(() => {
    fetchTrades();

    const channel = supabase
      .channel('active-trades-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_trades' }, () => {
        fetchTrades();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const communityFiltered = communityAll.filter(t => {
    const d = new Date(t.closed_at || t.created_at);
    return isWithinInterval(d, { start: communityDateRange.from, end: communityDateRange.to });
  });
  const vipFiltered = vipAll.filter(t => {
    const d = new Date(t.closed_at || t.created_at);
    return isWithinInterval(d, { start: vipDateRange.from, end: vipDateRange.to });
  });

  const communityStats = computeStats(communityFiltered);
  const vipStats = computeStats(vipFiltered);

  async function fetchTrades() {
    try {
      // Fetch active trades
      const { data: actives } = await supabase
        .from('active_trades')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      const parseTrade = (t: any): ActiveTrade => ({
        ...t,
        take_profits: Array.isArray(t.take_profits) ? t.take_profits as unknown as TakeProfit[] : null,
      });

      const activeList = (actives || []).map(parseTrade);
      setCommunityActive(activeList.find(t => t.channel_id === COMMUNITY_CHANNEL_ID) || null);
      setVipActive(activeList.find(t => t.channel_id === VIP_CHANNEL_ID) || null);

      // Fetch closed trades
      const { data: history } = await supabase
        .from('active_trades')
        .select('*')
        .neq('status', 'ACTIVE')
        .order('closed_at', { ascending: false });

      const historyList = (history || []).map(parseTrade);
      setCommunityAll(historyList.filter(t => t.channel_id === COMMUNITY_CHANNEL_ID));
      setVipAll(historyList.filter(t => t.channel_id === VIP_CHANNEL_ID));
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
      {/* Tab Switcher */}
      <div className="flex gap-2">
      <Button
          variant={activeTab === 'vip' ? 'default' : 'outline'}
          onClick={() => setActiveTab('vip')}
          className="flex items-center gap-2"
        >
          <span className="text-yellow-400">⭐</span>
          VIP Trades
        </Button>
        <Button
          variant={activeTab === 'community' ? 'default' : 'outline'}
          onClick={() => setActiveTab('community')}
          className="flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          FREE Trades
        </Button>
      </div>

      {activeTab === 'vip' ? (
        <TradeSection
          label="VIP"
          badgeColor="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          activeTrade={vipActive}
          history={vipFiltered}
          stats={vipStats}
          dateRange={vipDateRange}
          onDateChange={setVipDateRange}
        />
      ) : (
        <TradeSection
          label="FREE"
          badgeColor="bg-blue-500/20 text-blue-400 border-blue-500/30"
          activeTrade={communityActive}
          history={communityFiltered}
          stats={communityStats}
          dateRange={communityDateRange}
          onDateChange={setCommunityDateRange}
        />
      )}
    </div>
  );
}