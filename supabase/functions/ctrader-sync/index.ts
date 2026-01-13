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

    console.log('🔄 Syncing trades for user:', user.id);

    // Get cTrader connection
    const { data: connection, error: connError } = await supabase
      .from('ctrader_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: 'No cTrader connection found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let accessToken = connection.access_token;

    // Check if token needs refresh
    if (new Date(connection.expires_at) <= new Date()) {
      console.log('🔄 Refreshing expired token...');
      
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
        return new Response(JSON.stringify({ error: 'Token refresh failed - please reconnect' }), {
          status: 401,
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
    }

    // Fetch trading history from cTrader
    const accounts = connection.accounts || [];
    const allTrades: any[] = [];

    for (const account of accounts) {
      console.log('📊 Fetching trades for account:', account.accountId || account.login);
      
      try {
        // Fetch closed positions (historical trades)
        const historyResponse = await fetch(
          `https://api.spotware.com/connect/tradingaccounts/${account.accountId || account.login}/deals?from=${getFromDate()}&to=${new Date().toISOString()}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          console.log(`✅ Found ${historyData.length || 0} trades for account`);
          
          if (Array.isArray(historyData)) {
            allTrades.push(...historyData.map((trade: any) => ({
              ...trade,
              accountId: account.accountId || account.login,
              broker: account.brokerTitle || 'cTrader'
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching account trades:', err);
      }
    }

    console.log(`📊 Total trades fetched: ${allTrades.length}`);

    // Convert trades to journal entries
    const journalEntries = allTrades.map((trade: any) => convertToJournalEntry(trade, user.id));
    
    // Insert trades that don't already exist
    let insertedCount = 0;
    for (const entry of journalEntries) {
      const { error: insertErr } = await supabase
        .from('journal_entries')
        .upsert(entry, { 
          onConflict: 'user_id,pair,entry_time',
          ignoreDuplicates: true 
        });
      
      if (!insertErr) insertedCount++;
    }

    // Update last sync time
    await supabase
      .from('ctrader_connections')
      .update({ last_sync: new Date().toISOString() })
      .eq('user_id', user.id);

    console.log(`✅ Synced ${insertedCount} new trades`);

    return new Response(JSON.stringify({
      success: true,
      trades_found: allTrades.length,
      trades_synced: insertedCount,
      accounts_synced: accounts.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Sync error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function getFromDate(): string {
  // Get trades from the last 30 days
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

function convertToJournalEntry(trade: any, userId: string) {
  const direction = trade.tradeSide === 'BUY' || trade.side === 'BUY' ? 'LONG' : 'SHORT';
  const entryPrice = trade.entryPrice || trade.executionPrice || trade.price || 0;
  const exitPrice = trade.closePrice || trade.exitPrice || null;
  const symbol = trade.symbolName || trade.symbol || 'UNKNOWN';
  
  // Calculate pips
  let pips = null;
  if (entryPrice && exitPrice) {
    const pipMultiplier = symbol.includes('JPY') ? 100 : 10000;
    pips = direction === 'LONG' 
      ? (exitPrice - entryPrice) * pipMultiplier
      : (entryPrice - exitPrice) * pipMultiplier;
    pips = Math.round(pips * 10) / 10;
  }

  return {
    user_id: userId,
    pair: symbol,
    direction: direction,
    entry_price: entryPrice,
    exit_price: exitPrice,
    entry_time: trade.executionTime || trade.openTime || new Date().toISOString(),
    exit_time: trade.closeTime || null,
    lot_size: trade.volume ? trade.volume / 100000 : (trade.lots || 0.01),
    fees: trade.commission || trade.swap || 0,
    status: exitPrice ? 'CLOSED' : 'OPEN',
    result_pips: pips,
    strategy: `cTrader Sync - ${trade.broker || 'Auto'}`,
    notes: `Synced from cTrader | Order ID: ${trade.orderId || trade.dealId || 'N/A'}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
