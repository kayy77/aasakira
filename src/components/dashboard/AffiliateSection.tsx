import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Copy, Check, MousePointerClick, Users, UserCheck, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AffiliateSummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

const AffiliateSummaryCard = ({ label, value, icon }: AffiliateSummaryCardProps) => (
  <Card className="bg-muted/30 border-border/30">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface AffiliateStats {
  clicks: number;
  signups: number;
  activeReferrals: number;
  earnings: number;
}

interface ReferralActivity {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'converted';
  joinedAt: Date;
  earnings: number;
}

interface AffiliateSectionProps {
  affiliateLink?: string;
  stats?: AffiliateStats;
  referrals?: ReferralActivity[];
}

// Mock data
const mockStats: AffiliateStats = {
  clicks: 142,
  signups: 18,
  activeReferrals: 12,
  earnings: 0,
};

const mockReferrals: ReferralActivity[] = [
  { id: '1', email: 'j***@gmail.com', status: 'active', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), earnings: 0 },
  { id: '2', email: 'm***@yahoo.com', status: 'pending', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), earnings: 0 },
  { id: '3', email: 's***@outlook.com', status: 'active', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), earnings: 0 },
];

const mockEarningsData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  earnings: 0,
}));

const AffiliateSection = ({
  affiliateLink = 'https://aasakira.lovable.app?ref=YOUR_CODE',
  stats = mockStats,
  referrals = mockReferrals,
}: AffiliateSectionProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      toast({ title: 'Link copied!', description: 'Affiliate link copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: ReferralActivity['status']) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      active: 'bg-green-500/20 text-green-400',
      converted: 'bg-blue-500/20 text-blue-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Affiliate Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AffiliateSummaryCard
          label="Referral Clicks"
          value={stats.clicks}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
        <AffiliateSummaryCard
          label="Signups"
          value={stats.signups}
          icon={<Users className="h-4 w-4" />}
        />
        <AffiliateSummaryCard
          label="Active Referrals"
          value={stats.activeReferrals}
          icon={<UserCheck className="h-4 w-4" />}
        />
        <AffiliateSummaryCard
          label="Total Earnings"
          value={`$${stats.earnings.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* Affiliate Link */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Affiliate Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={affiliateLink}
              readOnly
              className="bg-muted/50 border-border/50 text-sm"
            />
            <Button onClick={handleCopyLink} variant="outline" className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Earnings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockEarningsData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Referral Table */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No referrals yet
                    </TableCell>
                  </TableRow>
                ) : (
                  referrals.map((referral) => (
                    <TableRow key={referral.id} className="border-border/30">
                      <TableCell className="text-sm">{referral.email}</TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      <TableCell className="text-right text-sm">${referral.earnings.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateSection;
