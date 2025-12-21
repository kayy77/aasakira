import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

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
}

export default function WeeklyResults() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyStats();
  }, []);

  const fetchWeeklyStats = async () => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from('active_trades')
        .select('pips_realized, status, closed_at, outcome')
        .in('status', ['CLOSED', 'STOPPED_OUT'])
        .gte('closed_at', weekStart.toISOString())
        .lte('closed_at', weekEnd.toISOString());

      if (error) throw error;

      const trades = data || [];

      let totalPips = 0;
      let wins = 0;
      let losses = 0;
      let partials = 0;
      let breakEven = 0;

      trades.forEach((trade) => {
        const pips = Number(trade.pips_realized) || 0;
        totalPips += pips;

        const outcome = trade.outcome?.toUpperCase();
        if (outcome === 'WIN') wins++;
        else if (outcome === 'LOSS') losses++;
        else if (outcome === 'PARTIAL') {
          partials++;
          if (pips > 0) wins++;
          else losses++;
        } else if (outcome === 'BE') breakEven++;
        else {
          if (pips > 0) wins++;
          else if (pips < 0) losses++;
          else breakEven++;
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
      <Card className="p-8 md:p-10 bg-gradient-to-br from-cyber-purple-900/30 via-card to-cyber-pink-600/20 backdrop-blur border-cyber-purple-500/40 shadow-lg shadow-cyber-purple-500/10">
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <p className={`text-3xl md:text-4xl font-bold ${isPositive ? 'text-neon-green-400' : 'text-destructive'}`}>
                {stats && stats.totalTrades > 0 ? `${isPositive ? '+' : ''}${stats.totalPips}` : '—'}
              </p>
              <p className="text-sm text-muted-foreground">Total Pips</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-cyber-pink-400">
                {stats?.totalTrades || 0}
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
              <p className="text-3xl md:text-4xl font-bold text-cyber-blue-400">
                {stats && stats.totalTrades > 0 ? `${stats.winRate}%` : '—'}
              </p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
          </div>

          {/* Live Indicator + CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-cyber-purple-400" />
              <span>Live Trade Signals</span>
              <Badge className="bg-neon-green-500/20 text-neon-green-400 border-neon-green-500/30 text-[10px] px-2 py-0.5">
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-green-500"></span>
                </span>
                LIVE
              </Badge>
            </div>

            <Button
              size="sm"
              className="bg-gradient-to-r from-cyber-purple-600 to-cyber-pink-500 hover:from-cyber-purple-700 hover:to-cyber-pink-600 text-white font-medium px-5"
              onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
            >
              Join FREE Telegram
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
