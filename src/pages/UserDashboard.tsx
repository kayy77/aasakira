import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import AffiliateSection from '@/components/dashboard/AffiliateSection';
import GrowthOpportunities from '@/components/dashboard/GrowthOpportunities';

interface DashboardStats {
  activeTrades: number;
  totalTrades: number;
  winRate: number | null;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPremium } = useSubscription();
  
  const [stats, setStats] = useState<DashboardStats>({
    activeTrades: 0,
    totalTrades: 0,
    winRate: null,
  });
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch active trades count
      const { count: activeCount } = await supabase
        .from('active_trades')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

      // Fetch total trades and calculate win rate from journal
      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('status, result_pips')
        .eq('user_id', user.id);

      const totalTrades = journalData?.length || 0;
      const closedTrades = journalData?.filter(t => t.status === 'closed') || [];
      const wins = closedTrades.filter(t => (t.result_pips || 0) > 0).length;
      const winRate = closedTrades.length > 0 
        ? Math.round((wins / closedTrades.length) * 100) 
        : null;

      setStats({
        activeTrades: activeCount || 0,
        totalTrades,
        winRate,
      });

      // Check if user is an affiliate (placeholder - would check affiliate table)
      // For now, using a simple check
      setIsAffiliate(false); // Set to true when affiliate system is implemented

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const planStatus = isPremium ? 'Premium' : 'Free';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.email?.split('@')[0]}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Cards */}
        <DashboardSummaryCards
          activeTrades={stats.activeTrades}
          totalTrades={stats.totalTrades}
          winRate={stats.winRate}
          planStatus={planStatus}
        />

        {/* Performance & Activity Row */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PerformanceChart />
          </div>
          <div className="lg:col-span-2">
            <RecentActivityFeed />
          </div>
        </div>

        {/* Growth Opportunities */}
        <GrowthOpportunities isPremium={isPremium} isAffiliate={isAffiliate} />

        {/* Affiliate Section - Only visible for affiliates */}
        {isAffiliate && (
          <>
            <Separator className="my-8" />
            <AffiliateSection />
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
