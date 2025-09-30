import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown, Clock, Target, Shield, Zap, Activity, Radar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LiveSignalCard } from './LiveSignalCard';
import { LivePriceDisplay } from './LivePriceDisplay';
import BackButton from '@/components/common/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface LiveSignal {
  id: string;
  pair: string;
  direction: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  confidence: number;
  created_at: string;
  status: string;
  consensus: any;
  raw_ai_responses: any[];
  risk_reward_ratio: number;
  outcome?: string;
  pips_result?: number;
}

interface SignalStats {
  totalSignals: number;
  winRate: number;
  avgScore: number;
  activeSignals: number;
}

const LiveSignalsDashboard = () => {
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [stats, setStats] = useState<SignalStats>({
    totalSignals: 0,
    winRate: 0,
    avgScore: 0,
    activeSignals: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  useEffect(() => {
    loadSignals();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('live-signals')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'signals' },
        (payload) => {
          if (payload.new.signal_type === 'LIVE') {
            setSignals(prev => [payload.new as LiveSignal, ...prev]);
            toast({
              title: "🎯 New Live Signal!",
              description: `${payload.new.pair} ${payload.new.direction} @ ${payload.new.entry_price}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSignals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('signal_type', 'LIVE')
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const signalsData = (data || []).map(signal => ({
        ...signal,
        raw_ai_responses: Array.isArray(signal.raw_ai_responses) ? signal.raw_ai_responses : []
      }));
      setSignals(signalsData);

      // Calculate stats
      const totalSignals = signalsData.length;
      const completedSignals = signalsData.filter(s => s.outcome && s.outcome !== 'PENDING');
      const winCount = completedSignals.filter(s => s.outcome === 'WIN').length;
      const winRate = completedSignals.length > 0 ? (winCount / completedSignals.length) * 100 : 0;
      const avgScore = signalsData.reduce((sum, s) => sum + (s.confidence || 0), 0) / (totalSignals || 1);
      const activeSignals = signalsData.filter(s => !s.outcome || s.outcome === 'PENDING').length;

      setStats({
        totalSignals,
        winRate,
        avgScore,
        activeSignals
      });

    } catch (error) {
      console.error('Error loading signals:', error);
      toast({
        title: "Error",
        description: "Failed to load signals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSignalScan = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the signal scanner",
        variant: "destructive"
      });
      return;
    }

    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Live signal scanning is available for premium members only. Upgrade your plan to unlock this feature.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-live-signal', {
        body: { symbols: ['XAUUSD', 'US30'] }
      });

      if (error) throw error;

      toast({
        title: "🔄 Signal Scan Initiated",
        description: "Analyzing live market data for signal opportunities...",
      });

      // Refresh signals after a delay
      setTimeout(() => {
        loadSignals();
      }, 3000);

    } catch (error) {
      console.error('Error triggering signal scan:', error);
      toast({
        title: "Error",
        description: "Failed to initiate signal scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const deleteSignal = async (signalId: string) => {
    try {
      const { error } = await supabase
        .from('signals')
        .delete()
        .eq('id', signalId);

      if (error) throw error;

      setSignals(prev => prev.filter(s => s.id !== signalId));
      toast({
        title: "Signal Deleted",
        description: "Signal has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting signal:', error);
      toast({
        title: "Error",
        description: "Failed to delete signal",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number, symbol: string) => {
    const decimals = symbol === 'XAUUSD' ? 2 : 0;
    return price.toFixed(decimals);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getOutcomeBadge = (signal: LiveSignal) => {
    if (!signal.outcome || signal.outcome === 'PENDING') {
      return <Badge variant="secondary">Active</Badge>;
    }
    
    if (signal.outcome === 'WIN') {
      return (
        <Badge variant="default" className="bg-green-500">
          WIN {signal.pips_result ? `+${signal.pips_result} pips` : ''}
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive">
        LOSS {signal.pips_result ? `${signal.pips_result} pips` : ''}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 border">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Radar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Live Signal Engine
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Real-time trading signals with institutional-grade AI analysis
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                Live Market Data
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-700">
                Multi-AI Consensus
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-700">
                Real-time Analysis
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadSignals} 
              disabled={isLoading}
              variant="outline"
              className="shadow-lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={triggerSignalScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
            >
              <Zap className={`h-4 w-4 mr-2 ${isScanning ? 'animate-pulse' : ''}`} />
              {isScanning ? 'Scanning Markets...' : 'Scan Now'}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Price Display */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Live Market Prices
        </h2>
        <LivePriceDisplay symbols={['XAUUSD', 'US30', 'EURUSD', 'GBPUSD']} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/10 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Signals</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalSignals}</p>
                <p className="text-xs text-blue-500">Generated today</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-green-600/10 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-3xl font-bold text-green-600">{stats.winRate.toFixed(1)}%</p>
                <p className="text-xs text-green-500">Success ratio</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-600/10 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-3xl font-bold text-purple-600">{stats.avgScore.toFixed(0)}</p>
                <p className="text-xs text-purple-500">AI consensus</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-600/10 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Signals</p>
                <p className="text-3xl font-bold text-orange-600">{stats.activeSignals}</p>
                <p className="text-xs text-orange-500">Currently running</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full shadow-lg">
                <Clock className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Live Trading Signals
          </h2>
          {signals.length > 0 && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-700">
              {signals.length} signals found
            </Badge>
          )}
        </div>
        
        {signals.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Radar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No Active Signals</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Scan Now" to analyze current market conditions and generate new trading signals.
                </p>
                <Button 
                  onClick={triggerSignalScan}
                  disabled={isScanning}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Zap className={`h-4 w-4 mr-2 ${isScanning ? 'animate-pulse' : ''}`} />
                  {isScanning ? 'Scanning Markets...' : 'Start Market Scan'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {signals.map((signal) => (
              <LiveSignalCard 
                key={signal.id} 
                signal={signal} 
                onDelete={deleteSignal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSignalsDashboard;