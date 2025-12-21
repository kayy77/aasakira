import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklyStats {
  totalPips: number;
  totalTrades: number;
  wins: number;
  losses: number;
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
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

      // Fetch ALL closed trades (CLOSED status includes all outcomes)
      const { data, error } = await supabase
        .from('active_trades')
        .select('pips_realized, status, closed_at, outcome')
        .eq('status', 'CLOSED')
        .gte('closed_at', weekStart.toISOString())
        .lte('closed_at', weekEnd.toISOString());

      if (error) throw error;

      const trades = data || [];
      
      let totalPips = 0;
      let wins = 0;
      let losses = 0;
      let partials = 0;
      let breakEven = 0;

      trades.forEach(trade => {
        const pips = Number(trade.pips_realized) || 0;
        totalPips += pips; // Always add pips regardless of outcome
        
        // Use outcome column if available, fallback to pips-based logic
        const outcome = trade.outcome?.toUpperCase();
        if (outcome === 'WIN') wins++;
        else if (outcome === 'LOSS') losses++;
        else if (outcome === 'PARTIAL') {
          partials++;
          // Count partials as wins if pips are positive
          if (pips > 0) wins++;
          else losses++;
        }
        else if (outcome === 'BE') breakEven++;
        else {
          // Fallback: classify by pips if no outcome set
          if (pips > 0) wins++;
          else if (pips < 0) losses++;
          else breakEven++;
        }
      });

      const totalTrades = trades.length;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

      setStats({
        totalPips: Math.round(totalPips),
        totalTrades,
        wins,
        losses,
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
      <div className="mb-16 animate-fade-in">
        <Card className="p-8 md:p-12 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur border-border">
          <div className="text-center">
            <div className="h-8 w-48 bg-muted/50 rounded animate-pulse mx-auto mb-4" />
            <div className="h-16 w-32 bg-muted/50 rounded animate-pulse mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  if (!stats || stats.totalTrades === 0) {
    return (
      <div className="mb-16 animate-fade-in">
        <Card className="p-8 md:p-12 bg-gradient-to-br from-purple-900/20 via-card to-pink-900/20 backdrop-blur border-purple-500/30">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              WEEKLY RESULTS
            </Badge>
            <p className="text-muted-foreground mb-6">No closed trades this week yet.</p>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
            >
              Join FREE Telegram Group
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isPositive = stats.totalPips >= 0;
  const dateRange = `${format(stats.startDate, 'd MMM')} → ${format(stats.endDate, 'd MMM')}`;

  return (
    <div className="mb-16 animate-fade-in">
      <Card className="p-8 md:p-12 bg-gradient-to-br from-purple-900/30 via-card to-pink-900/30 backdrop-blur border-purple-500/40 shadow-xl shadow-purple-500/10">
        <div className="text-center">
          {/* Date Range */}
          <Badge className="mb-6 bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm px-4 py-1">
            RESULTS — {dateRange.toUpperCase()}
          </Badge>

          {/* Big Pips Number */}
          <div className="mb-8">
            <div className={`text-6xl md:text-8xl font-bold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{stats.totalPips.toLocaleString()}
            </div>
            <p className="text-xl text-muted-foreground mt-2 uppercase tracking-wide">PIPS</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.totalTrades}</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Trades</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                <span className="text-green-400">{stats.wins}</span>
                <span className="text-muted-foreground mx-1">•</span>
                <span className="text-red-400">{stats.losses}</span>
              </p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">W / L</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{stats.winRate}%</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Win Rate</p>
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 shadow-lg shadow-purple-500/30"
            onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
          >
            Join the FREE Telegram Group
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
