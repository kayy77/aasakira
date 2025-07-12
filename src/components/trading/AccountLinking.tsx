
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Plus, 
  Settings, 
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { metaApiService } from '@/services/metaApiService';
import type { TradingAccount, AccountCredentials } from '@/services/metaApiService';

interface LinkedAccount {
  id: string;
  name: string;
  broker: string;
  accountNumber: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'deploying' | 'error';
  lastSync: string;
  statusMessage?: string;
}

interface AccountLinkingProps {
  onAccountLinked: (account: TradingAccount) => void;
}

const AccountLinking = ({ onAccountLinked }: AccountLinkingProps) => {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [connectionDetails, setConnectionDetails] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    broker: '',
    server: '',
    loginId: '',
    password: '',
    accountName: '',
    platform: 'mt4' as 'mt4' | 'mt5'
  });

  const supportedBrokers = [
    'IC Markets',
    'OANDA',
    'XM', 
    'FXCM',
    'IG',
    'Custom MT4/MT5'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-fill server when broker is selected
      if (field === 'broker' && value === 'IC Markets') {
        updated.server = 'ICMarkets-Demo02';
      }
      
      return updated;
    });
  };

  const getServerOptions = (broker: string): string[] => {
    if (broker === 'IC Markets') {
      return metaApiService.getServerOptions(broker);
    }
    return [`${broker}-Demo01`, `${broker}-Live01`];
  };

  const handleConnect = async () => {
    if (!formData.broker || !formData.loginId || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate IC Markets broker selection
    if (formData.broker === 'IC Markets' && !formData.server.includes('ICMarkets')) {
      toast({
        title: "Invalid Server Selection",
        description: "For IC Markets, please select a server that starts with 'ICMarkets-'",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('Initializing...');
    setConnectionDetails('Preparing to connect to MetaAPI');

    try {
      console.log('🔄 Attempting to connect account via MetaAPI...');
      
      const accountCredentials: AccountCredentials = {
        accountId: `acc-${Date.now()}`,
        login: formData.loginId,
        password: formData.password,
        server: formData.server,
        broker: formData.broker,
        platform: formData.platform
      };

      // Add temporary account to show connecting status
      const tempAccount: LinkedAccount = {
        id: accountCredentials.accountId,
        name: formData.accountName || `${formData.broker} Account`,
        broker: formData.broker,
        accountNumber: formData.loginId,
        status: 'connecting',
        lastSync: new Date().toISOString(),
        statusMessage: 'Connecting...'
      };
      
      setLinkedAccounts(prev => [...prev, tempAccount]);

      const accountData = await metaApiService.connectAccount(
        accountCredentials,
        (status: string, details?: string) => {
          console.log(`📊 Connection status: ${status} - ${details || ''}`);
          setConnectionStatus(status);
          setConnectionDetails(details || '');
          
          // Update the temporary account status
          setLinkedAccounts(prev => prev.map(acc => 
            acc.id === accountCredentials.accountId 
              ? { ...acc, status: 'connecting', statusMessage: status }
              : acc
          ));
        }
      );
      
      // Update with successful connection
      const newLinkedAccount: LinkedAccount = {
        id: accountData.id,
        name: formData.accountName || accountData.name,
        broker: accountData.broker,
        accountNumber: formData.loginId,
        status: 'connected',
        lastSync: new Date().toISOString(),
        statusMessage: 'Connected successfully'
      };

      setLinkedAccounts(prev => prev.map(acc => 
        acc.id === accountCredentials.accountId ? newLinkedAccount : acc
      ));
      
      onAccountLinked(accountData);
      
      toast({
        title: "Account Connected Successfully! ✅",
        description: `Connected to ${formData.broker} account via MetaAPI.`,
      });

      // Reset form
      setFormData({
        broker: '',
        server: '',
        loginId: '',
        password: '',
        accountName: '',
        platform: 'mt4'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('❌ Failed to connect account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update account with error status
      setLinkedAccounts(prev => prev.map(acc => 
        acc.id === accountCredentials.accountId 
          ? { ...acc, status: 'error', statusMessage: `Error: ${errorMessage}` }
          : acc
      ));
      
      toast({
        title: "Connection Failed ❌",
        description: `Failed to connect: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
      setConnectionStatus('');
      setConnectionDetails('');
    }
  };

  const handleRemoveAccount = (accountId: string) => {
    setLinkedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    toast({
      title: "Account Removed",
      description: "Trading account has been disconnected.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-3 h-3 mr-1 text-green-400" />;
      case 'connecting':
      case 'deploying':
        return <Loader className="w-3 h-3 mr-1 animate-spin text-blue-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 mr-1 text-red-400" />;
      default:
        return <WifiOff className="w-3 h-3 mr-1 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400';
      case 'connecting':
      case 'deploying':
        return 'bg-blue-500/20 text-blue-400';
      case 'error':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">MetaAPI Account Linking</h2>
          <p className="text-gray-400">Connect your MT4/MT5 accounts via MetaAPI for real-time data</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={isConnecting}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Connection Status Banner */}
      <Card className="glass-card border-blue-500/20 bg-blue-900/10">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Wifi className="w-5 h-5 text-blue-400" />
            <div>
              <h4 className="font-medium text-blue-300">MetaAPI Integration Active</h4>
              <p className="text-sm text-blue-400/80">
                Using professional MetaAPI service for real-time trading data from IC Markets and other brokers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Progress */}
      {isConnecting && (
        <Card className="glass-card border-blue-500/20 bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-blue-400" />
              <div>
                <h4 className="font-medium text-blue-300">{connectionStatus}</h4>
                {connectionDetails && (
                  <p className="text-sm text-blue-400/80">{connectionDetails}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Accounts */}
      {linkedAccounts.length > 0 && (
        <div className="grid gap-4">
          {linkedAccounts.map((account) => (
            <Card key={account.id} className="glass-card border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Activity className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">{account.name}</h3>
                      <p className="text-sm text-gray-400">
                        {account.broker} • Login ID: {account.accountNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last sync: {new Date(account.lastSync).toLocaleString()}
                      </p>
                      {account.statusMessage && (
                        <p className="text-xs text-gray-400 mt-1">{account.statusMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(account.status)}>
                      {getStatusIcon(account.status)}
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </Badge>
                    <Button
                      onClick={() => handleRemoveAccount(account.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      disabled={account.status === 'connecting' || account.status === 'deploying'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Account Form */}
      {showAddForm && (
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="w-5 h-5 mr-2 text-purple-400" />
              Connect MT4/MT5 Account via MetaAPI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="broker" className="text-gray-300">Broker * (Select IC Markets)</Label>
                <select
                  id="broker"
                  value={formData.broker}
                  onChange={(e) => handleInputChange('broker', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Broker</option>
                  {supportedBrokers.map(broker => (
                    <option key={broker} value={broker}>{broker}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="platform" className="text-gray-300">Platform *</Label>
                <select
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value as 'mt4' | 'mt5')}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="mt4">MetaTrader 4</option>
                  <option value="mt5">MetaTrader 5</option>
                </select>
              </div>

              <div>
                <Label htmlFor="accountName" className="text-gray-300">Account Name</Label>
                <Input
                  id="accountName"
                  type="text"
                  placeholder="My Trading Account"
                  value={formData.accountName}
                  onChange={(e) => handleInputChange('accountName', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="loginId" className="text-gray-300">Trading Account Login ID *</Label>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="12345678"
                  value={formData.loginId}
                  onChange={(e) => handleInputChange('loginId', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Your MetaTrader login ID (not account number)</p>
              </div>

              <div>
                <Label htmlFor="server" className="text-gray-300">Server * (Auto-filled for IC Markets)</Label>
                {formData.broker && getServerOptions(formData.broker).length > 1 ? (
                  <select
                    id="server"
                    value={formData.server}
                    onChange={(e) => handleInputChange('server', e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Server</option>
                    {getServerOptions(formData.broker).map(server => (
                      <option key={server} value={server}>{server}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="server"
                    type="text"
                    placeholder="ICMarkets-Demo02"
                    value={formData.server}
                    onChange={(e) => handleInputChange('server', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="password" className="text-gray-300">MT4/MT5 Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your MetaTrader Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Use your trading password, not investor password</p>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="text-sm text-green-300">
                  <p className="font-medium mb-1">MetaAPI Security & IC Markets Integration</p>
                  <p>• Your credentials are processed through MetaAPI's secure infrastructure</p>
                  <p>• For IC Markets, select "IC Markets" as broker (not MetaQuotes Demo)</p>
                  <p>• Server will auto-fill to ICMarkets-Demo02 for proper connection</p>
                  <p>• Use your trading login ID and password (not account number)</p>
                  <p>• Read-only access ensures maximum security</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="border-gray-600 text-gray-300"
                disabled={isConnecting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isConnecting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    {connectionStatus || 'Connecting...'}
                  </>
                ) : (
                  "Connect Account"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Accounts State */}
      {linkedAccounts.length === 0 && !showAddForm && (
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-8 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">No Trading Accounts Connected</h3>
            <p className="text-gray-400 mb-4">
              Connect your MT4/MT5 trading account to view live trading data, positions, and history.
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-4">
          <h4 className="font-semibold text-white mb-2">Need Help?</h4>
          <p className="text-sm text-gray-400 mb-3">
            Having trouble connecting your account? Check our setup guides for popular brokers.
          </p>
          <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Setup Guides
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountLinking;
