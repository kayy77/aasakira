import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signalPersistenceService, SignalRecord } from '@/services/signalPersistenceService';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, Clock, Target, DollarSign } from 'lucide-react';

const formatPrice = (price: number) => price.toFixed(5);
const formatPips = (pips: number) => `${pips > 0 ? '+' : ''}${pips.toFixed(1)} pips`;

const getOutcomeBadge = (outcome: string) => {
  switch (outcome) {
    case 'WIN':
      return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">✅ WIN</Badge>;
    case 'LOSS':
      return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">❌ LOSS</Badge>;
    case 'BREAKEVEN':
      return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">⚖️ BE</Badge>;
    default:
      return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">⏳ PENDING</Badge>;
  }
};

export function SignalHistoryDashboard() {
  const { user } = useAuth();
  const [userSignals, setUserSignals] = useState<SignalRecord[]>([]);
  const [allSignals, setAllSignals] = useState<SignalRecord[]>([]);
  const [userStats, setUserStats] = useState({ totalSignals: 0, winRate: 0, avgRR: 0, totalPips: 0 });
  const [globalStats, setGlobalStats] = useState({ totalSignals: 0, winRate: 0, avgRR: 0, totalPips: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignalData();
  }, [user]);

  const loadSignalData = async () => {
    setLoading(true);
    try {
      // Load user signals if authenticated
      if (user) {
        const [signals, stats] = await Promise.all([
          signalPersistenceService.getUserSignals(user.id),
          signalPersistenceService.getSignalStats(user.id)
        ]);
        setUserSignals(signals);
        setUserStats(stats);
      }

      // Load all approved signals and global stats
      const [allApproved, globalStats] = await Promise.all([
        signalPersistenceService.getAllApprovedSignals(),
        signalPersistenceService.getSignalStats()
      ]);
      setAllSignals(allApproved);
      setGlobalStats(globalStats);
    } catch (error) {
      console.error('Error loading signal data:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold text-primary">
                  {user ? userStats.winRate.toFixed(1) : globalStats.winRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Avg R:R</p>
                <p className="text-lg font-bold text-green-500">
                  1:{user ? userStats.avgRR.toFixed(1) : globalStats.avgRR.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Pips</p>
                <p className="text-lg font-bold text-blue-500">
                  {formatPips(user ? userStats.totalPips : globalStats.totalPips)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Signals</p>
                <p className="text-lg font-bold text-purple-500">
                  {user ? userStats.totalSignals : globalStats.totalSignals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signal History Tabs */}
      <Tabs defaultValue={user ? "your-signals" : "all-signals"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {user && <TabsTrigger value="your-signals">Your Signals</TabsTrigger>}
          <TabsTrigger value="all-signals">All Signals</TabsTrigger>
        </TabsList>

        {user && (
          <TabsContent value="your-signals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Signal History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userSignals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No signals found. Start trading to see your history here.
                    </p>
                  ) : (
                    userSignals.map((signal) => (
                      <SignalHistoryCard key={signal.id} signal={signal} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="all-signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allSignals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No signals available.
                  </p>
                ) : (
                  allSignals.map((signal) => (
                    <SignalHistoryCard key={signal.id} signal={signal} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SignalHistoryCard({ signal }: { signal: SignalRecord }) {
  const directionIcon = signal.direction === 'BUY' ? 
    <TrendingUp className="h-4 w-4 text-green-500" /> : 
    <TrendingDown className="h-4 w-4 text-red-500" />;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
          <div className="flex items-center space-x-2">
            {directionIcon}
            <div>
              <p className="font-semibold">{signal.pair}</p>
              <p className="text-xs text-muted-foreground">{signal.direction}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Entry</p>
            <p className="font-mono text-sm">{formatPrice(signal.entry_price)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">SL / TP</p>
            <p className="font-mono text-xs">
              {formatPrice(signal.stop_loss)} / {formatPrice(signal.take_profit)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">R:R</p>
            <p className="font-semibold">1:{signal.risk_reward_ratio.toFixed(1)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Result</p>
            {signal.pips_result !== null && signal.pips_result !== undefined ? (
              <p className={`text-sm font-semibold ${signal.pips_result >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPips(signal.pips_result)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Pending</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            {getOutcomeBadge(signal.outcome)}
            <p className="text-xs text-muted-foreground">
              {new Date(signal.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}