import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Target, Shield, Zap, Activity, Radar, Sparkles } from 'lucide-react';
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
      // Only scan XAUUSD and US30
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

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto">
      <BackButton />
      
      {/* Compact Futuristic Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 border border-primary/20 p-4">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg">
              <Radar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Live Signal Engine
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                  <Activity className="h-2.5 w-2.5 mr-1" />
                  Live
                </Badge>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  AI Consensus
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadSignals} 
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="h-9"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={triggerSignalScan}
              disabled={isScanning}
              size="sm"
              className="h-9 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Zap className={`h-3.5 w-3.5 mr-1.5 ${isScanning ? 'animate-pulse' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Prices */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4 text-green-500" />
          Live Market Prices
        </h2>
        <LivePriceDisplay symbols={['XAUUSD', 'US30']} />
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.totalSignals}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Win Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.winRate.toFixed(0)}%</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Sparkles className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Confidence</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgScore.toFixed(0)}</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Active</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activeSignals}</p>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Activity className="h-4 w-4 text-orange-600 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            Trading Signals
          </h2>
          {signals.length > 0 && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {signals.length} found
            </Badge>
          )}
        </div>
        
        {signals.length === 0 ? (
          <Card className="p-6 border-dashed">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                <Radar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">No Active Signals</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Click "Scan" to analyze markets and generate signals
                </p>
                <Button 
                  onClick={triggerSignalScan}
                  disabled={isScanning}
                  size="sm"
                  className="bg-gradient-to-r from-primary to-purple-600"
                >
                  <Zap className={`h-3.5 w-3.5 mr-1.5 ${isScanning ? 'animate-pulse' : ''}`} />
                  {isScanning ? 'Scanning...' : 'Start Scan'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
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