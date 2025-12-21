import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
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

      // Fetch ALL closed trades (CLOSED + STOPPED_OUT)
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
          // Fallback classification
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
        <Card className="p-6 bg-card/80 backdrop-blur border-border">
          <div className="text-center">
            <div className="h-6 w-40 bg-muted/50 rounded animate-pulse mx-auto mb-3" />
            <div className="h-12 w-24 bg-muted/50 rounded animate-pulse mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  if (!stats || stats.totalTrades === 0) {
    return (
      <div className="mb-12 animate-fade-in">
        <Card className="p-6 bg-card/80 backdrop-blur border-border">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Weekly Recap</p>
            <p className="text-sm font-medium text-cyber-purple-500">@aasakira.ai</p>
            <p className="text-muted-foreground text-sm mt-3">No closed trades this week yet.</p>
            <Button
              size="sm"
              className="mt-4 bg-gradient-to-r from-cyber-purple-600 to-cyber-pink-500 hover:from-cyber-purple-700 hover:to-cyber-pink-600 text-white"
              onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
            >
              Join FREE Telegram
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isPositive = stats.totalPips >= 0;
  const dateRange = `${format(stats.startDate, 'd MMM')} → ${format(stats.endDate, 'd MMM')}`;

  return (
    <div className="mb-12 animate-fade-in">
      <Card className="p-6 md:p-8 bg-card/90 backdrop-blur border-border">
        <div className="text-center">
          {/* Header with branding */}
          <div className="mb-4">
            <Badge variant="outline" className="border-cyber-purple-500/40 text-cyber-purple-400 text-[10px] uppercase tracking-widest mb-1">
              {dateRange}
            </Badge>
            <p className="text-lg font-semibold text-foreground">Weekly Recap</p>
            <p className="text-xs text-cyber-purple-400 font-medium">@aasakira.ai</p>
          </div>

          {/* Pips */}
          <div className="mb-5">
            <span className={`text-5xl md:text-6xl font-bold tracking-tight ${isPositive ? 'text-neon-green-400' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{stats.totalPips.toLocaleString()}
            </span>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">pips</p>
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-6 text-sm mb-5">
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalTrades}</p>
              <p className="text-muted-foreground text-xs uppercase">Trades</p>
            </div>
            <div>
              <p className="text-xl font-bold">
                <span className="text-neon-green-400">{stats.wins}</span>
                <span className="text-muted-foreground mx-0.5">/</span>
                <span className="text-destructive">{stats.losses}</span>
              </p>
              <p className="text-muted-foreground text-xs uppercase">W / L</p>
            </div>
            <div>
              <p className="text-xl font-bold text-cyber-purple-400">{stats.winRate}%</p>
              <p className="text-muted-foreground text-xs uppercase">Win Rate</p>
            </div>
          </div>

          {/* CTA */}
          <Button
            size="sm"
            className="bg-gradient-to-r from-cyber-purple-600 to-cyber-pink-500 hover:from-cyber-purple-700 hover:to-cyber-pink-600 text-white font-medium px-6"
            onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
          >
            Join FREE Telegram
            <ArrowRight className="ml-1.5 w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
