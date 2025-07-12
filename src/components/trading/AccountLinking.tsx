
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
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LinkedAccount {
  id: string;
  name: string;
  broker: string;
  accountNumber: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
}

interface AccountLinkingProps {
  onAccountLinked: (account: any) => void;
}

const AccountLinking = ({ onAccountLinked }: AccountLinkingProps) => {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    broker: '',
    accountNumber: '',
    server: '',
    username: '',
    password: '',
    accountName: ''
  });

  const supportedBrokers = [
    'IC Markets',
    'OANDA',
    'XM',
    'FXCM',
    'IG',
    'MetaQuotes Demo',
    'Custom MT4/MT5'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    if (!formData.broker || !formData.accountNumber || !formData.username || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Simulate API call to connect account
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newAccount: LinkedAccount = {
        id: `acc-${Date.now()}`,
        name: formData.accountName || `${formData.broker} Account`,
        broker: formData.broker,
        accountNumber: formData.accountNumber,
        status: 'connected',
        lastSync: new Date().toISOString()
      };

      setLinkedAccounts(prev => [...prev, newAccount]);
      
      // Create mock account data for the trading dashboard
      const accountData = {
        id: newAccount.id,
        name: newAccount.name,
        broker: newAccount.broker,
        type: 'Live',
        balance: 10000 + Math.random() * 50000,
        equity: 10000 + Math.random() * 55000,
        margin: Math.random() * 5000,
        freeMargin: 8000 + Math.random() * 40000,
        leverage: 100,
        currency: 'USD',
        server: formData.server,
        connectionStatus: 'connected' as const
      };

      onAccountLinked(accountData);
      
      toast({
        title: "Account Connected",
        description: `Successfully connected to ${formData.broker} account.`,
      });

      // Reset form
      setFormData({
        broker: '',
        accountNumber: '',
        server: '',
        username: '',
        password: '',
        accountName: ''
      });
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your trading account. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRemoveAccount = (accountId: string) => {
    setLinkedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    toast({
      title: "Account Removed",
      description: "Trading account has been disconnected.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trading Accounts</h2>
          <p className="text-gray-400">Connect your MT4/MT5 trading accounts</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

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
                        {account.broker} • Account #{account.accountNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last sync: {new Date(account.lastSync).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={
                        account.status === 'connected' 
                          ? 'bg-green-500/20 text-green-400'
                          : account.status === 'error'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }
                    >
                      {account.status === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {account.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </Badge>
                    <Button
                      onClick={() => handleRemoveAccount(account.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
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
              Connect Trading Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="broker" className="text-gray-300">Broker *</Label>
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
                <Label htmlFor="accountNumber" className="text-gray-300">Account Number *</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="123456789"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="server" className="text-gray-300">Server</Label>
                <Input
                  id="server"
                  type="text"
                  placeholder="ICMarkets-Live02"
                  value={formData.server}
                  onChange={(e) => handleInputChange('server', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-gray-300">Login *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your MT4/MT5 Login"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your MT4/MT5 Password"
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
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>Your credentials are encrypted and stored securely. We use read-only access to fetch your trading data.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isConnecting ? "Connecting..." : "Connect Account"}
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
