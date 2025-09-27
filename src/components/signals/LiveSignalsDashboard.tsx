import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, TrendingUp, TrendingDown, Clock, Target, Shield, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Signal Engine</h1>
          <p className="text-muted-foreground">
            Real-time trading signals with institutional-grade analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadSignals} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={triggerSignalScan}
            disabled={isScanning}
          >
            <Zap className={`h-4 w-4 mr-2 ${isScanning ? 'animate-pulse' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Signals</p>
                <p className="text-2xl font-bold">{stats.totalSignals}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{stats.avgScore.toFixed(0)}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.activeSignals}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {signals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No signals available. Click "Scan Now" to generate new signals.
            </div>
          ) : (
            <div className="space-y-4">
              {signals.map((signal) => (
                <Card key={signal.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[80px]">
                        <div className="text-lg font-bold">{signal.pair}</div>
                        <div className="flex items-center gap-1 text-sm">
                          {signal.direction === 'BUY' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={signal.direction === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                            {signal.direction}
                          </span>
                        </div>
                      </div>

                      <Separator orientation="vertical" className="h-16" />

                      <div className="space-y-1">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Entry:</span>
                            <span className="ml-2 font-mono">
                              {formatPrice(signal.entry_price, signal.pair)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">SL:</span>
                            <span className="ml-2 font-mono">
                              {formatPrice(signal.stop_loss, signal.pair)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">TP:</span>
                            <span className="ml-2 font-mono">
                              {formatPrice(signal.take_profit, signal.pair)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          R:R {signal.risk_reward_ratio?.toFixed(2)} • 
                          Score {signal.confidence} • 
                          {getTimeAgo(signal.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      {getOutcomeBadge(signal)}
                      {signal.consensus?.filters_passed && (
                        <div className="text-xs text-muted-foreground">
                          {signal.consensus.filters_passed}/{signal.consensus.total_filters} filters
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Filter Details */}
                  {signal.raw_ai_responses && signal.raw_ai_responses.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Filter Analysis:</div>
                      <div className="flex flex-wrap gap-2">
                        {signal.raw_ai_responses.map((filter: any, index: number) => (
                          <Badge 
                            key={index}
                            variant={filter.pass ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {filter.name.replace('_', ' ')} 
                            {filter.confidence && ` (${Math.round(filter.confidence * 100)}%)`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSignalsDashboard;