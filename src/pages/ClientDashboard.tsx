import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  ArrowLeft, 
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Dashboard components
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import GrowthOpportunities from '@/components/dashboard/GrowthOpportunities';
import ScannerWidget from '@/components/dashboard/ScannerWidget';
import ConnectionsCard from '@/components/dashboard/ConnectionsCard';
import PerformanceBlock from '@/components/dashboard/PerformanceBlock';
import CTraderDashboard from '@/components/dashboard/CTraderDashboard';

interface DashboardStats {
  activeTrades: number;
  totalTrades: number;
  winRate: number | null;
}

const ClientDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    activeTrades: 0,
    totalTrades: 0,
    winRate: null
  });
  const [loading, setLoading] = useState(true);
  const [ctraderConnected, setCtraderConnected] = useState(false);
  const [telegramLinked, setTelegramLinked] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Load dashboard data
  useEffect(() => {
    if (user) {
      loadDashboardData();
      checkConnections();
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

      // Fetch closed trades for stats
      const { data: closedTrades } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .not('exit_price', 'is', null);

      let totalTrades = closedTrades?.length || 0;
      let winRate: number | null = null;

      if (closedTrades && closedTrades.length > 0) {
        // Calculate wins/losses from entry/exit prices
        let wins = 0;
        let losses = 0;
        closedTrades.forEach((t: any) => {
          const pnl = t.exit_price && t.entry_price
            ? (t.direction === 'buy' ? t.exit_price - t.entry_price : t.entry_price - t.exit_price)
            : 0;
          if (pnl > 0) wins++;
          else if (pnl < 0) losses++;
        });
        if (wins + losses > 0) {
          winRate = (wins / (wins + losses)) * 100;
        }
      }

      setStats({
        activeTrades: activeCount || 0,
        totalTrades,
        winRate
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkConnections = async () => {
    if (!user) return;

    try {
      // Check cTrader connection
      const { data: ctraderData } = await supabase
        .from('ctrader_connections')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setCtraderConnected(!!ctraderData);

      // Check Telegram link (from user profiles)
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // telegram_user_id may not exist in schema - just check if profile exists for now
      setTelegramLinked(false);
    } catch (err) {
      // Connections not found - that's okay
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email?.split('@')[0]}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Summary Cards */}
            <DashboardSummaryCards
              activeTrades={stats.activeTrades}
              totalTrades={stats.totalTrades}
              winRate={stats.winRate}
              planStatus={isPremium ? 'Premium' : 'Free'}
            />

            {/* Performance Chart */}
            <PerformanceChart />

            {/* cTrader Integration */}
            <CTraderDashboard />

            {/* Recent Activity */}
            <RecentActivityFeed />
          </div>

          {/* Right Column - Widgets */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Scanner Widget - Best Setups Now */}
            <ScannerWidget />

            {/* Performance Block */}
            <PerformanceBlock />

            {/* Connections Status */}
            <ConnectionsCard
              ctraderConnected={ctraderConnected}
              telegramLinked={telegramLinked}
              onConnectCTrader={() => {/* handled by CTraderDashboard */}}
              onLinkTelegram={() => navigate('/live-signals')}
            />

            {/* Growth Opportunities */}
            <GrowthOpportunities isPremium={isPremium} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
