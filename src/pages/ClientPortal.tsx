import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, TrendingUp, Target, History, Settings, LogOut, 
  Crown, ChevronRight, BarChart3, Calendar, Zap
} from 'lucide-react';
import BackButton from '@/components/common/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface PortalStats {
  totalTrades: number;
  winRate: number;
  totalPips: number;
  activeTrade: boolean;
}

export default function ClientPortal() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<PortalStats>({
    totalTrades: 0,
    winRate: 0,
    totalPips: 0,
    activeTrade: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortalStats();
  }, []);

  async function fetchPortalStats() {
    try {
      // Fetch this month's trades
      const monthStart = startOfMonth(new Date()).toISOString();
      const monthEnd = endOfMonth(new Date()).toISOString();

      const { data: trades, error } = await supabase
        .from('active_trades')
        .select('*')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd);

      if (error) throw error;

      const closedTrades = trades?.filter(t => t.status !== 'ACTIVE') || [];
      const wins = closedTrades.filter(t => t.outcome === 'WIN').length;
      const totalPips = closedTrades.reduce((sum, t) => sum + (t.pips_realized || 0), 0);
      const activeTrade = trades?.some(t => t.status === 'ACTIVE') || false;

      setStats({
        totalTrades: closedTrades.length,
        winRate: closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0,
        totalPips,
        activeTrade
      });
    } catch (error) {
      console.error('Error fetching portal stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <h1 className="text-xl font-bold">Client Portal</h1>
                <p className="text-xs text-muted-foreground">Welcome back</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                <Crown className="w-3 h-3 mr-1 text-yellow-500" />
                {user?.role === 'premium' ? 'Premium' : 'Free'}
              </Badge>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quick Stats */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            This Month's Performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.totalTrades}</p>
                <p className="text-xs text-muted-foreground">Trades</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stats.winRate >= 60 ? 'text-green-400' : 'text-foreground'}`}>
                  {stats.winRate}%
                </p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stats.totalPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalPips >= 0 ? '+' : ''}{stats.totalPips}
                </p>
                <p className="text-xs text-muted-foreground">Total Pips</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  {stats.activeTrade ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-sm font-medium text-green-400">Active</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No Active</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Live Trade</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/live-signals">
              <Card className="hover:bg-accent/10 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Live Signals</p>
                      <p className="text-xs text-muted-foreground">View current & past signals</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/journal">
              <Card className="hover:bg-accent/10 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Trading Journal</p>
                      <p className="text-xs text-muted-foreground">Track your trades</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/setup-scanner">
              <Card className="hover:bg-accent/10 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Setup Scanner</p>
                      <p className="text-xs text-muted-foreground">AI-powered analysis</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/pricing">
              <Card className="hover:bg-accent/10 transition-colors cursor-pointer group border-primary/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">Upgrade Plan</p>
                      <p className="text-xs text-muted-foreground">Unlock all features</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Account Info */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Account
          </h2>
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user?.email || 'Guest User'}</p>
                  <p className="text-xs text-muted-foreground">
                    Member since {user ? format(new Date(), 'MMM yyyy') : '—'}
                  </p>
                </div>
                <Badge variant={user?.role === 'premium' ? 'default' : 'secondary'}>
                  {user?.role === 'premium' ? 'Premium' : 'Free Plan'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
