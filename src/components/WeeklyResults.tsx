import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { getMaxTpPips, classifyTradeOutcome, isTradeCountable } from '@/utils/tradePips';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import MiniSparkline from '@/components/MiniSparkline';
import WinLossBar from '@/components/WinLossBar';
import TradeActivityTicker from '@/components/TradeActivityTicker';
import WeeklyCountdownTimer from '@/components/WeeklyCountdownTimer';
import TradeMap from '@/components/TradeMap';

interface WeeklyStats {
  totalPips: number;
  totalTrades: number;
  wins: number;
  losses: number;
  partials: number;
  breakEven: number;
  winRate: number;
  startDate: Date;
  endDate: Date;
  pairs: string[];
}

export default function WeeklyResults() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const animatedPips = useAnimatedCounter(stats?.totalPips ?? 0, 1200, !loading);
  const animatedTrades = useAnimatedCounter(stats?.totalTrades ?? 0, 1200, !loading);
  const animatedWinRate = useAnimatedCounter(stats?.winRate ?? 0, 1200, !loading);

  useEffect(() => {
    fetchWeeklyStats();

    const channel = supabase
      .channel('weekly-results-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_trades' },
        () => {
          fetchWeeklyStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWeeklyStats = async () => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from('active_trades')
        .select('pips_realized, status, created_at, closed_at, outcome, take_profits, pair')
        .in('status', ['ACTIVE', 'CLOSED', 'STOPPED_OUT'])
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      if (error) throw error;

      const trades = (data || []).filter(isTradeCountable);

      let totalPips = 0;
      let wins = 0;
      let losses = 0;
      let partials = 0;
      let breakEven = 0;
      const pairsSet = new Set<string>();

      trades.forEach((trade) => {
        totalPips += getMaxTpPips(trade);
        pairsSet.add(trade.pair);

        const outcome = trade.outcome?.toUpperCase();
        const result = classifyTradeOutcome(trade);

        if (result === 'loss') {
          losses++;
        } else {
          if (outcome === 'PARTIAL') partials++;
          else if (outcome === 'BE') breakEven++;
          wins++;
        }
      });

      const totalTrades = trades.length;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

      setStats({
        totalPips: Math.round(totalPips * 10) / 10,
        totalTrades,
        wins,
        losses,
        partials,
        breakEven,
        winRate,
        startDate: weekStart,
        endDate: weekEnd,
        pairs: Array.from(pairsSet),
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

  const dateRange = stats
    ? `${format(stats.startDate, 'd MMM')} – ${format(stats.endDate, 'd MMM')}`
    : '';

  const isPositive = stats ? stats.totalPips >= 0 : true;

  return (
    <div className="mb-12 animate-fade-in">
      <Card className="relative p-8 md:p-10 bg-gradient-to-br from-cyber-purple-900/30 via-card to-cyber-pink-600/20 backdrop-blur border-cyber-purple-500/40 shadow-lg shadow-cyber-purple-500/10 overflow-hidden">
        {/* Micro sparkline background */}
        <MiniSparkline color="rgba(168, 85, 247, 0.12)" />

        <div className="relative z-10">
          <div className="text-center">
            {/* Badge */}
            <Badge className="mb-4 bg-neon-green-500/20 text-neon-green-400 border-neon-green-500/30 text-xs px-3 py-1">
              📊 WEEKLY RECAP
            </Badge>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="text-cyber-purple-400">@aasakira.ai</span>{' '}
              <span className="text-foreground">Results</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-6">{dateRange}</p>

            {/* Stats Grid - Animated Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center relative">
                <p className={`text-3xl md:text-4xl font-bold tabular-nums ${isPositive ? 'text-neon-green-400' : 'text-destructive'}`}>
                  {stats && stats.totalTrades > 0 ? `${isPositive ? '+' : ''}${animatedPips}` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">Total Pips</p>
                {/* Green glow flicker on the pips number */}
                {isPositive && stats && stats.totalPips > 0 && (
                  <div className="absolute -inset-2 bg-neon-green-500/5 rounded-lg blur-xl animate-pulse pointer-events-none" />
                )}
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-cyber-pink-400 tabular-nums">
                  {animatedTrades}
                </p>
                <p className="text-sm text-muted-foreground">Trades</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-cyber-purple-400">
                  {stats && stats.totalTrades > 0 ? (
                    <>
                      <span className="text-neon-green-400">{stats.wins}</span>
                      <span className="text-muted-foreground text-xl mx-1">/</span>
                      <span className="text-destructive">{stats.losses}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Wins / Losses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-cyber-blue-400 tabular-nums">
                  {stats && stats.totalTrades > 0 ? `${animatedWinRate}%` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
            </div>

            {/* Win/Loss Visual Bar */}
            {stats && stats.totalTrades > 0 && (
              <div className="mb-6">
                <WinLossBar wins={stats.wins} losses={stats.losses} />
              </div>
            )}

            {/* Trade Map + Activity Ticker row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-left">
              <TradeActivityTicker />
              <TradeMap pairs={stats?.pairs || []} />
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
                {/* Enhanced LIVE pulse badge */}
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

              {/* CTA with shimmer */}
              <Button
                size="sm"
                className="group relative bg-gradient-to-r from-cyber-purple-600 to-cyber-pink-500 hover:from-cyber-purple-700 hover:to-cyber-pink-600 text-white font-medium px-5 overflow-hidden hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
              >
                {/* Shimmer effect */}
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
