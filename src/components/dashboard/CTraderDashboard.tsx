import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Link2, RefreshCw, CheckCircle, XCircle, Loader2, ExternalLink, 
  Wallet, TrendingUp, TrendingDown, Activity, DollarSign, AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Position {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  volume: number;
  entryPrice: number;
  currentPrice?: number;
  profit: number;
  swap: number;
  openTime: string;
}

interface Trade {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  volume: number;
  entryPrice: number;
  closePrice: number;
  profit: number;
  closeTime: string;
}

interface AccountData {
  accountId: string;
  accountNumber: string;
  brokerName: string;
  currency: string;
  balance: number;
  equity: number;
  leverage: string;
  isLive: boolean;
  positions: Position[];
  recentTrades: Trade[];
  error?: string;
}

interface CTraderData {
  connected: boolean;
  expired?: boolean;
  lastSync?: string;
  connectedAt?: string;
  accounts: AccountData[];
  totals: {
    totalBalance: number;
    totalEquity: number;
    totalPositions: number;
    floatingPnL: number;
  };
  error?: string;
}

const CTraderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<CTraderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAccountData();
    }
  }, [user]);

  const fetchAccountData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke('ctrader-account-data', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.error) throw response.error;
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch cTrader data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAccountData();
  };

  const initiateConnect = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('ctrader-auth-url', {
        body: { userId: user.id, redirectTo: window.location.origin }
      });

      if (error) throw error;
      window.location.href = data.authUrl;
    } catch (err: any) {
      toast({
        title: "Connection Error",
        description: err.message || "Failed to initiate connection",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Not connected state
  if (!data?.connected) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-400" />
            Connect cTrader Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Link your cTrader account to view your real trading data, including balance, 
            open positions, and trade history. This is a secure, read-only connection.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="border-blue-500/30">
              <CheckCircle className="h-3 w-3 mr-1 text-green-400" /> OAuth Secure
            </Badge>
            <Badge variant="outline" className="border-blue-500/30">
              <CheckCircle className="h-3 w-3 mr-1 text-green-400" /> Read-Only
            </Badge>
            <Badge variant="outline" className="border-blue-500/30">
              <CheckCircle className="h-3 w-3 mr-1 text-green-400" /> No Trading Access
            </Badge>
          </div>
          <Button onClick={initiateConnect} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Connect cTrader via OAuth
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Expired token state
  if (data.expired) {
    return (
      <Card className="bg-card/50 border-yellow-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-yellow-400" />
              cTrader Connection Expired
            </CardTitle>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
              <AlertCircle className="h-3 w-3 mr-1" /> Requires Reconnection
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your cTrader session has expired. Please reconnect to continue viewing your account data.
          </p>
          <Button onClick={initiateConnect} variant="outline" className="w-full border-yellow-500/30">
            <ExternalLink className="h-4 w-4 mr-2" />
            Reconnect cTrader
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { accounts, totals } = data;
  const primaryAccount = accounts[0];
  const currency = primaryAccount?.currency || 'USD';

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">cTrader Account</h2>
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" /> Connected
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Wallet className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-bold">{formatCurrency(totals.totalBalance, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <DollarSign className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Equity</p>
                <p className="text-lg font-bold">{formatCurrency(totals.totalEquity, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open Positions</p>
                <p className="text-lg font-bold">{totals.totalPositions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totals.floatingPnL >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {totals.floatingPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Floating P/L</p>
                <p className={`text-lg font-bold ${totals.floatingPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totals.floatingPnL >= 0 ? '+' : ''}{formatCurrency(totals.floatingPnL, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details Card */}
      {primaryAccount && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Account Details</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {primaryAccount.brokerName}
                </Badge>
                <Badge variant={primaryAccount.isLive ? 'default' : 'secondary'} className="text-xs">
                  {primaryAccount.isLive ? 'Live' : 'Demo'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Account</p>
                <p className="font-medium">****{primaryAccount.accountNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Currency</p>
                <p className="font-medium">{primaryAccount.currency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Leverage</p>
                <p className="font-medium">{primaryAccount.leverage}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Sync</p>
                <p className="font-medium">
                  {data.lastSync ? formatDistanceToNow(new Date(data.lastSync), { addSuffix: true }) : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Positions & History Tabs */}
      <Card className="bg-card/50 border-border/50">
        <Tabs defaultValue="positions" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
              <TabsTrigger value="positions">Open Positions</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="pt-4">
            <TabsContent value="positions" className="m-0">
              {totals.totalPositions === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No open positions</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead className="text-xs">Symbol</TableHead>
                        <TableHead className="text-xs">Direction</TableHead>
                        <TableHead className="text-xs">Volume</TableHead>
                        <TableHead className="text-xs">Entry</TableHead>
                        <TableHead className="text-xs text-right">P/L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.flatMap(acc => acc.positions || []).map((position) => (
                        <TableRow key={position.id} className="border-border/30">
                          <TableCell className="font-medium">{position.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={position.direction === 'LONG' ? 'default' : 'secondary'} className="text-xs">
                              {position.direction}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{position.volume.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{position.entryPrice?.toFixed(5)}</TableCell>
                          <TableCell className={`text-right font-medium ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.profit >= 0 ? '+' : ''}{formatCurrency(position.profit, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="history" className="m-0">
              {accounts.every(acc => (acc.recentTrades?.length || 0) === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent trades</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead className="text-xs">Symbol</TableHead>
                        <TableHead className="text-xs">Direction</TableHead>
                        <TableHead className="text-xs">Volume</TableHead>
                        <TableHead className="text-xs text-right">Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.flatMap(acc => acc.recentTrades || []).map((trade) => (
                        <TableRow key={trade.id} className="border-border/30">
                          <TableCell className="font-medium">{trade.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={trade.direction === 'LONG' ? 'default' : 'secondary'} className="text-xs">
                              {trade.direction}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{trade.volume.toFixed(2)}</TableCell>
                          <TableCell className={`text-right font-medium ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CTraderDashboard;
