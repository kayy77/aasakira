import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link2, RefreshCw, CheckCircle, XCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';

interface CTraderConnection {
  id: string;
  user_id: string;
  connected_at: string;
  last_sync: string | null;
  accounts: any[];
  expires_at: string;
}

const CTraderConnect = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connection, setConnection] = useState<CTraderConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    if (user) {
      checkConnection();
      handleUrlParams();
    }
  }, [user]);

  const handleUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('ctrader_connected');
    const error = params.get('ctrader_error');
    const accounts = params.get('accounts');

    if (connected === 'true') {
      toast({
        title: "cTrader Connected!",
        description: `Successfully linked ${accounts || 'your'} trading account(s).`,
      });
      checkConnection();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (error) {
      toast({
        title: "Connection Failed",
        description: decodeURIComponent(error),
        variant: "destructive"
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('ctrader_connections')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!error && data) {
        setConnection(data as CTraderConnection);
      } else {
        setConnection(null);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    } finally {
      setLoading(false);
    }
  };

  const initiateConnect = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to connect your cTrader account.",
        variant: "destructive"
      });
      return;
    }

    // Build OAuth URL
    const clientId = '20325_ODH9oO5XpdCvsgzOcGwyMrPphJkknF8brHZgv1whNsnFkVBPUB';
    const redirectUri = encodeURIComponent('https://tnfxxtnfpoavnsabjrii.supabase.co/functions/v1/ctrader-callback');
    const scope = encodeURIComponent('trading accounts');
    const state = user.id;

    const authUrl = `https://openapi.ctrader.com/apps/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    
    console.log('🔗 Redirecting to cTrader OAuth:', authUrl);
    window.location.href = authUrl;
  };

  const syncTrades = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('ctrader-sync', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      toast({
        title: "Sync Complete!",
        description: `Synced ${result.trades_synced} trades from ${result.accounts_synced} account(s).`,
      });

      // Refresh connection to get updated last_sync
      checkConnection();

    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync trades",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      const { error } = await supabase
        .from('ctrader_connections')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setConnection(null);
      toast({
        title: "Disconnected",
        description: "cTrader account has been unlinked.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive"
      });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (connection) {
    const isExpired = new Date(connection.expires_at) <= new Date();
    const accountCount = connection.accounts?.length || 0;

    return (
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              cTrader Connected
            </CardTitle>
            <Badge variant={isExpired ? "destructive" : "default"} className="text-xs">
              {isExpired ? (
                <><XCircle className="h-3 w-3 mr-1" /> Expired</>
              ) : (
                <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Accounts</p>
              <p className="font-medium">{accountCount} linked</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Sync</p>
              <p className="font-medium">
                {connection.last_sync 
                  ? new Date(connection.last_sync).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={syncTrades} 
              disabled={syncing || isExpired}
              className="flex-1"
            >
              {syncing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> Sync Trades</>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={disconnect}
              disabled={disconnecting}
            >
              {disconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isExpired && (
            <Button onClick={initiateConnect} variant="secondary" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" /> Reconnect
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Connect cTrader
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Link your cTrader account to automatically sync your trades to your journal.
        </p>
        <Button onClick={initiateConnect} className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          Connect cTrader Account
        </Button>
      </CardContent>
    </Card>
  );
};

export default CTraderConnect;
