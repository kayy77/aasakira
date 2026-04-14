
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, BarChart3, Shield, Target, Activity, ExternalLink, Award } from 'lucide-react';

const MyFxBookStats = () => {
  const stats = [
    { label: 'Total Gain', value: '+143.54%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Profit', value: '£59,895', icon: DollarSign, color: 'text-green-400' },
    { label: 'Win Rate', value: '84%', icon: Target, color: 'text-blue-400' },
    { label: 'Profit Factor', value: '3.67', icon: Award, color: 'text-amber-400' },
    { label: 'Total Trades', value: '133', icon: BarChart3, color: 'text-purple-400' },
    { label: 'Pips Gained', value: '90,992', icon: Activity, color: 'text-cyan-400' },
    { label: 'Max Drawdown', value: '13.49%', icon: Shield, color: 'text-yellow-400' },
    { label: 'Daily Avg', value: '3.62%', icon: TrendingUp, color: 'text-green-400' },
  ];

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
          Real, verified results from our personal trading account on MyFxBook — fully transparent and audited.
        </p>
      </div>

      <Card className="p-6 md:p-8 bg-gradient-to-br from-green-900/15 via-background to-blue-900/10 border-green-500/20 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
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
              ✓ Live Update
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/5 rounded-lg p-4 text-center border border-white/10 hover:border-white/20 transition-colors">
                <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Account Summary Bar */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6 py-3 bg-white/5 rounded-lg border border-white/10">
          <div>Balance: <span className="text-foreground font-semibold">£69,895</span></div>
          <div>Deposits: <span className="text-foreground font-semibold">£50,000</span></div>
          <div>Withdrawals: <span className="text-foreground font-semibold">£40,000</span></div>
          <div>Highest: <span className="text-green-400 font-semibold">£86,856</span></div>
        </div>

        {/* Myfxbook Widget Embed */}
        <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
          <iframe
            src="https://widgets.myfxbook.com/widgets/11992764/large.html"
            width="100%"
            height="300"
            className="bg-black/30"
            style={{ border: 'none' }}
            title="MyFxBook Performance Chart"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10 gap-2"
            onClick={() => window.open('https://www.myfxbook.com/members/Aasakira/khai/11992764', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            View Full Account on MyFxBook
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MyFxBookStats;
