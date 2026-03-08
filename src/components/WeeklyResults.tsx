import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Star, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { getMaxTpPips, classifyTradeOutcome, isTradeCountable } from '@/utils/tradePips';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import MiniSparkline from '@/components/MiniSparkline';
import WinLossBar from '@/components/WinLossBar';
import TradeActivityTicker from '@/components/TradeActivityTicker';
import WeeklyCountdownTimer from '@/components/WeeklyCountdownTimer';
import TradeMap from '@/components/TradeMap';

const COMMUNITY_CHANNEL_ID = -1002187927163;
const VIP_CHANNEL_ID = -1003491244183;

interface ChannelStats {
  totalPips: number;
  totalTrades: number;
  wins: number;
  losses: number;
  partials: number;
  breakEven: number;
  winRate: number;
  pairs: string[];
}

interface WeeklyData {
  vip: ChannelStats;
  free: ChannelStats;
  combined: ChannelStats;
  startDate: Date;
  endDate: Date;
}

function computeStats(trades: any[]): ChannelStats {
  const countable = trades.filter(isTradeCountable);
  let totalPips = 0;
  let wins = 0, losses = 0, partials = 0, breakEven = 0;
  const pairsSet = new Set<string>();

  countable.forEach((trade) => {
    totalPips += getMaxTpPips(trade);
    pairsSet.add(trade.pair);
    const outcome = trade.outcome?.toUpperCase();
    const result = classifyTradeOutcome(trade);
    if (result === 'loss') { losses++; }
    else {
      if (outcome === 'PARTIAL') partials++;
      else if (outcome === 'BE') breakEven++;
      wins++;
    }
  });

  const totalTrades = countable.length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  return {
    totalPips: Math.round(totalPips * 10) / 10,
    totalTrades, wins, losses, partials, breakEven, winRate,
    pairs: Array.from(pairsSet),
  };
}

function StatColumn({ stats, label, icon, accentClass }: {
  stats: ChannelStats;
  label: string;
  icon: React.ReactNode;
  accentClass: string;
}) {
  const animPips = useAnimatedCounter(stats.totalPips, 1200, true);
  const animTrades = useAnimatedCounter(stats.totalTrades, 1200, true);
  const animWinRate = useAnimatedCounter(stats.winRate, 1200, true);
  const isPositive = stats.totalPips >= 0;

  return (
    <div className="flex-1 text-center space-y-1.5">
      <div className="flex items-center justify-center gap-1.5 mb-1.5">
        {icon}
        <span className={`text-xs font-bold uppercase tracking-wider ${accentClass}`}>{label}</span>
      </div>

      {/* Pips */}
      <div className="relative">
        <p className={`text-xl md:text-2xl font-bold tabular-nums ${isPositive ? 'text-neon-green-400' : 'text-destructive'}`}>
          {stats.totalTrades > 0 ? `${isPositive ? '+' : ''}${animPips}` : '—'}
        </p>
        <p className="text-[10px] text-muted-foreground">Pips</p>
        {isPositive && stats.totalPips > 0 && (
          <div className="absolute -inset-2 bg-neon-green-500/5 rounded-lg blur-xl animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Trades */}
      <div>
        <p className="text-2xl md:text-3xl font-bold text-cyber-pink-400 tabular-nums">{animTrades}</p>
        <p className="text-xs text-muted-foreground">Trades</p>
      </div>

      {/* W/L */}
      <div>
        <p className="text-xl font-bold">
          {stats.totalTrades > 0 ? (
            <>
              <span className="text-neon-green-400">{stats.wins}</span>
              <span className="text-muted-foreground text-sm mx-1">/</span>
              <span className="text-destructive">{stats.losses}</span>
            </>
          ) : '—'}
        </p>
        <p className="text-xs text-muted-foreground">W / L</p>
      </div>

      {/* Win Rate */}
      <div>
        <p className="text-xl font-bold text-cyber-blue-400 tabular-nums">
          {stats.totalTrades > 0 ? `${animWinRate}%` : '—'}
        </p>
        <p className="text-xs text-muted-foreground">Win Rate</p>
      </div>

      {/* Mini Win/Loss Bar */}
      {stats.totalTrades > 0 && (
        <WinLossBar wins={stats.wins} losses={stats.losses} />
      )}
    </div>
  );
}

export default function WeeklyResults() {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyStats();
    const channel = supabase
      .channel('weekly-results-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_trades' }, () => {
        fetchWeeklyStats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchWeeklyStats = async () => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const { data: raw, error } = await supabase
        .from('active_trades')
        .select('pips_realized, status, created_at, closed_at, outcome, take_profits, pair, channel_id')
        .in('status', ['ACTIVE', 'CLOSED', 'STOPPED_OUT'])
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (error) throw error;
      const all = raw || [];

      const vipTrades = all.filter(t => t.channel_id === VIP_CHANNEL_ID);
      const freeTrades = all.filter(t => t.channel_id === COMMUNITY_CHANNEL_ID);

      setData({
        vip: computeStats(vipTrades),
        free: computeStats(freeTrades),
        combined: computeStats(all),
        startDate: weekStart,
        endDate: weekEnd,
      });
    } catch (err) {
      console.error('Error fetching weekly stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-12 animate-fade-in">
        <Card className="p-8 bg-gradient-to-br from-cyber-purple-900/20 via-card to-cyber-pink-600/10 backdrop-blur border-cyber-purple-500/30">
          <div className="text-center">
            <div className="h-5 w-24 bg-muted/50 rounded-full animate-pulse mx-auto mb-4" />
            <div className="h-8 w-64 bg-muted/50 rounded animate-pulse mx-auto mb-6" />
            <div className="flex justify-center gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-8 w-16 bg-muted/50 rounded animate-pulse mx-auto mb-1" />
                  <div className="h-3 w-20 bg-muted/50 rounded animate-pulse mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const dateRange = data
    ? `${format(data.startDate, 'd MMM')} – ${format(data.endDate, 'd MMM')}`
    : '';

  const allPairs = data ? [...new Set([...data.vip.pairs, ...data.free.pairs])] : [];

  return (
    <div className="mb-12 animate-fade-in">
      <Card className="relative p-8 md:p-10 bg-gradient-to-br from-cyber-purple-900/30 via-card to-cyber-pink-600/20 backdrop-blur border-cyber-purple-500/40 shadow-lg shadow-cyber-purple-500/10 overflow-hidden">
        <MiniSparkline color="rgba(168, 85, 247, 0.12)" />

        <div className="relative z-10">
          <div className="text-center">
            <Badge className="mb-4 bg-neon-green-500/20 text-neon-green-400 border-neon-green-500/30 text-xs px-3 py-1">
              📊 WEEKLY RECAP
            </Badge>

            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="text-cyber-purple-400">AASAKIRA</span>{' '}
              <span className="text-foreground">Results</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-6">{dateRange}</p>

            {/* VIP vs FREE Comparison */}
            <div className="flex gap-4 md:gap-8 mb-6">
              <StatColumn
                stats={data?.vip ?? { totalPips: 0, totalTrades: 0, wins: 0, losses: 0, partials: 0, breakEven: 0, winRate: 0, pairs: [] }}
                label="VIP"
                icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                accentClass="text-amber-400"
              />

              {/* Divider */}
              <div className="w-px bg-border/50 self-stretch" />

              <StatColumn
                stats={data?.free ?? { totalPips: 0, totalTrades: 0, wins: 0, losses: 0, partials: 0, breakEven: 0, winRate: 0, pairs: [] }}
                label="FREE"
                icon={<Users className="w-4 h-4 text-cyber-blue-400" />}
                accentClass="text-cyber-blue-400"
              />
            </div>

            {/* Trade Map + Activity Ticker row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-left">
              <TradeActivityTicker />
              <TradeMap pairs={allPairs} />
            </div>

            {/* Weekly Timer */}
            <div className="flex justify-center mb-6">
              <WeeklyCountdownTimer />
            </div>

            {/* Live Indicator + CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-cyber-purple-400" />
                <span>Live Trade Signals</span>
                <Badge className="bg-neon-green-500/20 text-neon-green-400 border-neon-green-500/30 text-[10px] px-2 py-0.5 relative">
                  <span className="absolute inset-0 rounded-full bg-neon-green-500/20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <span className="relative flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green-500 shadow-[0_0_8px_2px_rgba(74,222,128,0.6)]"></span>
                    </span>
                    LIVE
                  </span>
                </Badge>
              </div>

              <Button
                size="sm"
                className="group relative bg-gradient-to-r from-cyber-purple-600 to-cyber-pink-500 hover:from-cyber-purple-700 hover:to-cyber-pink-600 text-white font-medium px-5 overflow-hidden hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
              >
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative">Join FREE Telegram</span>
                <ArrowRight className="ml-1.5 w-4 h-4 relative" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
