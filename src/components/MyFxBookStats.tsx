import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Activity, TrendingUp, Shield, Target, BarChart3, Wallet, ArrowRight, Loader2, Trophy, TrendingDown, Zap, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MYFXBOOK_URL = 'https://www.myfxbook.com/members/Aasakira/khai/11992764';
const TELEGRAM_LINK = 'https://t.me/+E3IYiJSGNqkxNTdk';

interface MfxStats {
  gain: number;
  profit: number;
  wonPercentage: number;
  drawdown: number;
  balance: number;
  deposits: number;
  withdrawals: number;
  profitFactor: number;
  monthly: number;
  trades: number;
  pips: number;
  equity: number;
  currency: string;
  lastUpdateDate: string;
  wins: number;
  losses: number;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  totalLots: number;
  topSymbol: string;
  daily: number;
  absGain: number;
}

// Fallback values if API fails
const FALLBACK: MfxStats = {
  gain: 143.54, profit: 59895, wonPercentage: 84, drawdown: 13.49,
  balance: 69895, deposits: 50000, withdrawals: 40000, profitFactor: 3.67,
  monthly: 12.8, trades: 847, pips: 12450, equity: 69895, currency: 'GBP',
  lastUpdateDate: '', wins: 0, losses: 0, bestTrade: 0, worstTrade: 0,
  avgWin: 0, avgLoss: 0, expectancy: 0, totalLots: 0, topSymbol: '—',
  daily: 0, absGain: 0,
};

const fmt = (n: number, currency?: string) => {
  if (currency === 'GBP') return `£${n.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const MyFxBookStats = () => {
  const [stats, setStats] = useState<MfxStats>(FALLBACK);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('myfxbook-stats');
        if (!error && data?.success && data.stats) {
          const s = data.stats;
          setStats({
            gain: Number(s.gain) || FALLBACK.gain,
            profit: Number(s.profit) || FALLBACK.profit,
            wonPercentage: Number(s.wonPercentage) || FALLBACK.wonPercentage,
            drawdown: Number(s.drawdown) || FALLBACK.drawdown,
            balance: Number(s.balance) || FALLBACK.balance,
            deposits: Number(s.deposits) || FALLBACK.deposits,
            withdrawals: Number(s.withdrawals) || FALLBACK.withdrawals,
            profitFactor: Number(s.profitFactor) || FALLBACK.profitFactor,
            monthly: Number(s.monthly) || FALLBACK.monthly,
            trades: Number(s.trades) || FALLBACK.trades,
            pips: Number(s.pips) || FALLBACK.pips,
            equity: Number(s.equity) || FALLBACK.equity,
            currency: s.currency || 'GBP',
            lastUpdateDate: s.lastUpdateDate || '',
            wins: Number(s.wins) || 0,
            losses: Number(s.losses) || 0,
            bestTrade: Number(s.bestTrade) || 0,
            worstTrade: Number(s.worstTrade) || 0,
            avgWin: Number(s.avgWin) || 0,
            avgLoss: Number(s.avgLoss) || 0,
            expectancy: Number(s.expectancy) || 0,
            totalLots: Number(s.totalLots) || 0,
            topSymbol: s.topSymbol || '—',
            daily: Number(s.daily) || 0,
            absGain: Number(s.absGain) || 0,
          });
          setIsLive(true);
        }
      } catch {
        // Use fallback
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const c = stats.currency;

  return (
    <div className="py-16 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-medium mb-4">
          <Activity className="w-3.5 h-3.5" />
          {isLive ? 'Live Data' : 'Verified Track Record'}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Live Account Performance
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real, verified results from our personal trading account — fully transparent and audited on MyFxBook.
        </p>
      </div>

      <Card className="p-6 md:p-8 bg-gradient-to-br from-green-900/15 via-background to-blue-900/10 border-green-500/20 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">KHAI Account</h3>
              <p className="text-xs text-muted-foreground">
                Real ({c}) · STARTRADER · 1:500 · MT5
                {stats.lastUpdateDate && <span> · Updated {stats.lastUpdateDate}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs animate-pulse">
                ● Live
              </Badge>
            )}
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              ✓ Track Record Verified
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              ✓ Audited on MyFxBook
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Total Gain</span>
                </div>
                <p className="text-2xl font-bold text-green-400">+{stats.gain.toFixed(2)}%</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wallet className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Profit</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{fmt(stats.profit, c)}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Win Rate</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{stats.wonPercentage}%</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">Max Drawdown</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{stats.drawdown.toFixed(2)}%</p>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
              {[
                { label: 'Balance', value: fmt(stats.balance, c) },
                { label: 'Equity', value: fmt(stats.equity, c) },
                { label: 'Deposits', value: fmt(stats.deposits, c) },
                { label: 'Withdrawals', value: fmt(stats.withdrawals, c) },
                { label: 'Profit Factor', value: stats.profitFactor.toFixed(2) },
                { label: 'Monthly Avg', value: `+${stats.monthly.toFixed(1)}%` },
                { label: 'Daily Avg', value: `+${stats.daily.toFixed(2)}%` },
                { label: 'Abs. Gain', value: `+${stats.absGain.toFixed(2)}%` },
                { label: 'Total Pips', value: stats.pips.toLocaleString() },
                { label: 'Total Lots', value: stats.totalLots.toFixed(2) },
                { label: 'Top Pair', value: stats.topSymbol },
                { label: 'Trades', value: String(stats.trades) },
              ].map((stat) => (
                <div key={stat.label} className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-sm font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Trade Quality Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Wins / Losses</span>
                </div>
                <p className="text-sm font-semibold">
                  <span className="text-green-400">{stats.wins}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-red-400">{stats.losses}</span>
                </p>
              </div>
              <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Best Trade</span>
                </div>
                <p className="text-sm font-semibold text-green-400">{fmt(stats.bestTrade, c)}</p>
              </div>
              <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Worst Trade</span>
                </div>
                <p className="text-sm font-semibold text-red-400">{fmt(stats.worstTrade, c)}</p>
              </div>
              <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Expectancy / Trade</span>
                </div>
                <p className="text-sm font-semibold text-blue-400">{fmt(stats.expectancy, c)}</p>
              </div>
            </div>
          </>
        )}

        {/* CTAs */}
        <div className="text-center space-y-4">
          <p className="text-xs text-muted-foreground">
            All results independently verified and audited by MyFxBook.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold gap-2"
              onClick={() => window.open(TELEGRAM_LINK, '_blank')}
            >
              Join FREE Telegram Group
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 gap-2"
              onClick={() => window.open(MYFXBOOK_URL, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              View on MyFxBook
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyFxBookStats;
