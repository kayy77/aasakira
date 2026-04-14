
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Activity, TrendingUp, Shield, Target, BarChart3, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MYFXBOOK_URL = 'https://www.myfxbook.com/members/Aasakira/khai/11992764';

const MyFxBookStats = () => {
  return (
    <div className="py-16 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-medium mb-4">
          <Activity className="w-3.5 h-3.5" />
          Verified Track Record
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
              <p className="text-xs text-muted-foreground">Real (GBP) · STARTRADER · 1:500 · MT5</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              ✓ Track Record Verified
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              ✓ Audited on MyFxBook
            </Badge>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Total Gain</span>
            </div>
            <p className="text-2xl font-bold text-green-400">+143.54%</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
            <div className="flex items-center gap-1.5 mb-2">
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Profit</span>
            </div>
            <p className="text-2xl font-bold text-green-400">£59,895</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">84%</p>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">Max Drawdown</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">13.49%</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Balance', value: '£69,895' },
            { label: 'Deposits', value: '£50,000' },
            { label: 'Withdrawals', value: '£40,000' },
            { label: 'Profit Factor', value: '3.67' },
            { label: 'Monthly Avg', value: '+12.8%' },
            { label: 'Trades', value: '847' },
          ].map((stat) => (
            <div key={stat.label} className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-sm font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-3">
            All results independently verified and audited by MyFxBook — view the full transparent report below.
          </p>
          <Button
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10 gap-2"
            onClick={() => window.open(MYFXBOOK_URL, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            View Full Audited Account on MyFxBook
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MyFxBookStats;
