import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceStats {
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number | null;
  avgRMultiple: number | null;
  lastTradeResult: 'win' | 'loss' | 'be' | null;
  pipsTotal: number;
}

const PerformanceBlock: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PerformanceStats>({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    breakeven: 0,
    winRate: null,
    avgRMultiple: null,
    lastTradeResult: null,
    pipsTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPerformanceStats();
    }
  }, [user]);

  const loadPerformanceStats = async () => {
    if (!user) return;

    try {
      // Fetch from journal_entries for actual trade history
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .not('exit_price', 'is', null)
        .order('exit_time', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setStats({
          totalTrades: 0,
          wins: 0,
          losses: 0,
          breakeven: 0,
          winRate: null,
          avgRMultiple: null,
          lastTradeResult: null,
          pipsTotal: 0
        });
        setLoading(false);
        return;
      }

      // Calculate stats from actual data
      let wins = 0;
      let losses = 0;
      let breakeven = 0;
      let totalR = 0;
      let pipsTotal = 0;

      data.forEach((trade: any) => {
        // Calculate PnL from entry/exit prices
        const pnl = trade.exit_price && trade.entry_price
          ? (trade.direction === 'buy' 
            ? trade.exit_price - trade.entry_price 
            : trade.entry_price - trade.exit_price)
          : 0;
        
        if (pnl > 0) {
          wins++;
        } else if (pnl < 0) {
          losses++;
        } else {
          breakeven++;
          wins++; // BE counted as wins
        }

        // Calculate R if we have target_sl data
        if (trade.entry_price && trade.target_sl && trade.exit_price) {
          const risk = Math.abs(trade.entry_price - trade.target_sl);
          const result = trade.direction === 'buy' 
            ? trade.exit_price - trade.entry_price
            : trade.entry_price - trade.exit_price;
          if (risk > 0) {
            totalR += result / risk;
          }
        }
      });

      const totalTrades = wins + losses + breakeven;
      const winRate = totalTrades > 0 && (wins + losses) > 0 
        ? (wins / (wins + losses)) * 100 
        : null;
      const avgRMultiple = totalTrades > 0 ? totalR / totalTrades : null;

      // Last trade result
      let lastTradeResult: 'win' | 'loss' | 'be' | null = null;
      if (data[0]) {
        const lastTrade = data[0] as any;
        const lastPnl = lastTrade.exit_price && lastTrade.entry_price
          ? (lastTrade.direction === 'buy' 
            ? lastTrade.exit_price - lastTrade.entry_price 
            : lastTrade.entry_price - lastTrade.exit_price)
          : 0;
        if (lastPnl > 0) lastTradeResult = 'win';
        else if (lastPnl < 0) lastTradeResult = 'loss';
        else lastTradeResult = 'be';
      }

      setStats({
        totalTrades,
        wins,
        losses,
        breakeven,
        winRate,
        avgRMultiple,
        lastTradeResult,
        pipsTotal
      });
    } catch (err) {
      console.error('Failed to load performance stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatItem: React.FC<{ 
    label: string; 
    value: string | number; 
    subtext?: string;
    trend?: 'up' | 'down' | 'neutral';
    highlight?: boolean;
  }> = ({ label, value, subtext, trend, highlight }) => (
    <div className={cn(
      'p-3 rounded-lg border border-border/50',
      highlight && 'bg-primary/5 border-primary/30'
    )}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-lg font-bold',
          trend === 'up' && 'text-green-500',
          trend === 'down' && 'text-red-500'
        )}>
          {value}
        </span>
        {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
        {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
      </div>
      {subtext && <p className="text-[10px] text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-8 text-center text-muted-foreground">
          <BarChart3 className="h-6 w-6 animate-pulse mx-auto mb-2" />
          <p className="text-sm">Loading stats...</p>
        </CardContent>
      </Card>
    );
  }

  const hasData = stats.totalTrades > 0;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Performance
          </CardTitle>
          {hasData && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                stats.lastTradeResult === 'win' && 'border-green-500/50 text-green-500',
                stats.lastTradeResult === 'loss' && 'border-red-500/50 text-red-500',
                stats.lastTradeResult === 'be' && 'border-yellow-500/50 text-yellow-500'
              )}
            >
              Last: {stats.lastTradeResult?.toUpperCase() || '-'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">No Trade History Yet</p>
            <p className="text-xs text-muted-foreground">
              Complete trades will appear here with real stats
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatItem 
              label="Trades Taken" 
              value={stats.totalTrades}
              subtext={`${stats.wins}W / ${stats.losses}L`}
            />
            <StatItem 
              label="Win Rate" 
              value={stats.winRate !== null ? `${stats.winRate.toFixed(0)}%` : '-'}
              trend={stats.winRate !== null ? (stats.winRate >= 50 ? 'up' : 'down') : undefined}
              highlight={stats.winRate !== null && stats.winRate >= 50}
            />
            <StatItem 
              label="Avg R" 
              value={stats.avgRMultiple !== null ? `${stats.avgRMultiple.toFixed(2)}R` : '-'}
              trend={stats.avgRMultiple !== null ? (stats.avgRMultiple >= 0 ? 'up' : 'down') : undefined}
            />
            <StatItem 
              label="Total Pips" 
              value={stats.pipsTotal.toFixed(1)}
              trend={stats.pipsTotal >= 0 ? 'up' : 'down'}
            />
          </div>
        )}

        {/* Honest disclaimer */}
        <div className="mt-4 p-2 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-[10px] text-muted-foreground text-center">
            Stats from closed journal entries only. Past performance does not guarantee future results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceBlock;
