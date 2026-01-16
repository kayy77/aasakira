import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📊 Fetching account data for user:', user.id);

    // Get cTrader connection
    const { data: connection, error: connError } = await supabase
      .from('ctrader_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ 
        connected: false,
        error: 'No cTrader connection found' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let accessToken = connection.access_token;
    const isExpired = new Date(connection.expires_at) <= new Date();

    // Refresh token if expired
    if (isExpired) {
      console.log('🔄 Token expired, refreshing...');
      
      const clientId = Deno.env.get('CTRADER_CLIENT_ID');
      const clientSecret = Deno.env.get('CTRADER_CLIENT_SECRET');

      const refreshResponse = await fetch('https://openapi.ctrader.com/apps/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: connection.refresh_token,
          client_id: clientId!,
          client_secret: clientSecret!,
        }),
      });

      if (!refreshResponse.ok) {
        console.error('❌ Token refresh failed');
        return new Response(JSON.stringify({ 
          connected: true,
          expired: true,
          error: 'Token expired - please reconnect' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const tokenData = await refreshResponse.json();
      accessToken = tokenData.access_token;

      // Update stored tokens
      await supabase
        .from('ctrader_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      
      console.log('✅ Token refreshed successfully');
    }

    // Fetch accounts data
    const accounts = connection.accounts || [];
    const accountsData: any[] = [];

    for (const account of accounts) {
      const accountId = account.accountId || account.login;
      console.log('📊 Fetching data for account:', accountId);

      try {
        // Fetch account details (balance, equity)
        const accountResponse = await fetch(
          `https://api.spotware.com/connect/tradingaccounts/${accountId}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );

        let accountDetails = null;
        if (accountResponse.ok) {
          accountDetails = await accountResponse.json();
        }

        // Fetch open positions
        const positionsResponse = await fetch(
          `https://api.spotware.com/connect/tradingaccounts/${accountId}/positions`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );

        let positions: any[] = [];
        if (positionsResponse.ok) {
          const posData = await positionsResponse.json();
          positions = Array.isArray(posData) ? posData : [];
        }

        // Fetch recent deals (trade history)
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);
        
        const dealsResponse = await fetch(
          `https://api.spotware.com/connect/tradingaccounts/${accountId}/deals?from=${fromDate.toISOString()}&to=${new Date().toISOString()}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );

        let deals: any[] = [];
        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json();
          deals = Array.isArray(dealsData) ? dealsData.slice(0, 50) : []; // Limit to last 50
        }

        accountsData.push({
          accountId: accountId,
          accountNumber: account.accountNumber || accountId.toString().slice(-4),
          brokerName: account.brokerTitle || account.brokerName || 'cTrader',
          currency: accountDetails?.depositCurrency || account.currency || 'USD',
          balance: accountDetails?.balance ? accountDetails.balance / 100 : account.balance || 0,
          equity: accountDetails?.equity ? accountDetails.equity / 100 : account.equity || 0,
          leverage: account.leverage || '1:100',
          isLive: account.isLive !== false,
          positions: positions.map((p: any) => ({
            id: p.positionId || p.id,
            symbol: p.symbolName || p.symbol,
            direction: p.tradeSide === 'BUY' ? 'LONG' : 'SHORT',
            volume: p.volume ? p.volume / 100000 : 0.01,
            entryPrice: p.entryPrice || p.price,
            currentPrice: p.currentPrice,
            profit: p.profit ? p.profit / 100 : 0,
            swap: p.swap ? p.swap / 100 : 0,
            openTime: p.openTimestamp || p.openTime,
          })),
          recentTrades: deals.slice(0, 20).map((d: any) => ({
            id: d.dealId || d.id,
            symbol: d.symbolName || d.symbol,
            direction: d.tradeSide === 'BUY' ? 'LONG' : 'SHORT',
            volume: d.volume ? d.volume / 100000 : 0.01,
            entryPrice: d.entryPrice,
            closePrice: d.closePrice,
            profit: d.profit ? d.profit / 100 : 0,
            closeTime: d.closeTimestamp || d.closeTime,
          })),
        });

      } catch (err) {
        console.error('Error fetching account data:', err);
        accountsData.push({
          accountId,
          error: 'Failed to fetch account data',
        });
      }
    }

    // Calculate totals
    const totals = {
      totalBalance: accountsData.reduce((sum, a) => sum + (a.balance || 0), 0),
      totalEquity: accountsData.reduce((sum, a) => sum + (a.equity || 0), 0),
      totalPositions: accountsData.reduce((sum, a) => sum + (a.positions?.length || 0), 0),
      floatingPnL: accountsData.reduce((sum, a) => {
        const positionProfit = (a.positions || []).reduce((pSum: number, p: any) => pSum + (p.profit || 0), 0);
        return sum + positionProfit;
      }, 0),
    };

    console.log('✅ Account data fetched successfully');

    return new Response(JSON.stringify({
      connected: true,
      expired: false,
      lastSync: connection.last_sync,
      connectedAt: connection.connected_at,
      accounts: accountsData,
      totals,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error fetching account data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
