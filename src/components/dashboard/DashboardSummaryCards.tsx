import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Activity, Target, Crown } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}

const SummaryCard = ({ label, value, icon, subtitle }: SummaryCardProps) => (
  <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface DashboardSummaryCardsProps {
  activeTrades: number;
  totalTrades: number;
  winRate: number | null;
  planStatus: string;
}

const DashboardSummaryCards = ({
  activeTrades,
  totalTrades,
  winRate,
  planStatus,
}: DashboardSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Active Trades"
        value={activeTrades}
        icon={<Activity className="h-5 w-5" />}
        subtitle="Currently open"
      />
      <SummaryCard
        label="Total Trades"
        value={totalTrades}
        icon={<TrendingUp className="h-5 w-5" />}
        subtitle="All time"
      />
      <SummaryCard
        label="Win Rate"
        value={winRate !== null ? `${winRate}%` : '—'}
        icon={<Target className="h-5 w-5" />}
        subtitle={winRate !== null ? 'Based on closed trades' : 'No data yet'}
      />
      <SummaryCard
        label="Account Status"
        value={planStatus}
        icon={<Crown className="h-5 w-5" />}
        subtitle="Current plan"
      />
    </div>
  );
};

export default DashboardSummaryCards;
