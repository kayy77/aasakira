
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  RefreshCw,
  Wifi,
  WifiOff,
  BarChart3,
  History,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { metaApiService, TradingAccount, Position, HistoryOrder } from '@/services/metaApiService';

interface TradingDashboardProps {
  onFeatureUse?: () => void;
}

const TradingDashboard = ({ onFeatureUse }: TradingDashboardProps) => {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<HistoryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const accountsData = await metaApiService.getAccounts();
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0]);
        await loadAccountData(accountsData[0].id);
      }
      onFeatureUse?.();
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to load trading accounts. Using demo data.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const loadAccountData = async (accountId: string) => {
    try {
      const [positionsData, historyData] = await Promise.all([
        metaApiService.getPositions(accountId),
        metaApiService.getHistory(accountId, 20)
      ]);
      setPositions(positionsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load account data:', error);
    }
  };

  const refreshData = async () => {
    if (!selectedAccount) return;
    setIsLoading(true);
    await loadAccountData(selectedAccount.id);
    setIsLoading(false);
    toast({
      title: "Data Refreshed",
      description: "Trading data has been updated successfully."
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!selectedAccount) {
    return (
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-semibold text-white mb-2">No Trading Account Connected</h3>
          <p className="text-gray-400 mb-4">Connect your MetaTrader account to view live trading data</p>
          <Button 
            onClick={loadAccounts}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
            Connect Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalProfit = positions.reduce((sum, pos) => sum + pos.profit, 0);
  const openTrades = positions.length;

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card className="glass-card hover-glow border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <Activity className="w-6 h-6 mr-2 text-purple-400" />
              {selectedAccount.name}
              <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500">
                {selectedAccount.type}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {selectedAccount.connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <Button
                onClick={refreshData}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="border-purple-500/30"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </div>
              <div className="text-sm text-gray-400">Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(selectedAccount.equity, selectedAccount.currency)}
              </div>
              <div className="text-sm text-gray-400">Equity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {formatCurrency(selectedAccount.freeMargin, selectedAccount.currency)}
              </div>
              <div className="text-sm text-gray-400">Free Margin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                1:{selectedAccount.leverage}
              </div>
              <div className="text-sm text-gray-400">Leverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Open Trades</p>
                <div className="text-2xl font-bold text-white">{openTrades}</div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(totalProfit, selectedAccount.currency)}
                </div>
              </div>
              {totalProfit >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Broker</p>
                <div className="text-lg font-semibold text-white">{selectedAccount.broker}</div>
              </div>
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions and History Tabs */}
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger value="positions" className="data-[state=active]:bg-purple-600">
            <Activity className="w-4 h-4 mr-2" />
            Open Positions ({positions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
            <History className="w-4 h-4 mr-2" />
            Trade History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          {positions.length === 0 ? (
            <Card className="glass-card border-purple-500/20">
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-white mb-2">No Open Positions</h3>
                <p className="text-gray-400">Your open trades will appear here</p>
              </CardContent>
            </Card>
          ) : (
            positions.map((position) => (
              <Card key={position.id} className="glass-card border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{position.symbol}</span>
                          <Badge 
                            variant={position.type === 'buy' ? 'default' : 'destructive'}
                            className={position.type === 'buy' ? 'bg-green-600' : 'bg-red-600'}
                          >
                            {position.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          {position.lots} lots @ {position.openPrice}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(position.profit, selectedAccount.currency)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Current: {position.currentPrice}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <Card className="glass-card border-purple-500/20">
              <CardContent className="p-8 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-white mb-2">No Trade History</h3>
                <p className="text-gray-400">Your completed trades will appear here</p>
              </CardContent>
            </Card>
          ) : (
            history.map((trade) => (
              <Card key={trade.id} className="glass-card border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{trade.symbol}</span>
                          <Badge 
                            variant={trade.type === 'buy' ? 'default' : 'destructive'}
                            className={trade.type === 'buy' ? 'bg-green-600' : 'bg-red-600'}
                          >
                            {trade.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          {trade.lots} lots | {formatDateTime(trade.openTime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(trade.profit, selectedAccount.currency)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {trade.openPrice} → {trade.closePrice}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingDashboard;
