const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE = 'https://www.myfxbook.com/api';
// The MyFxBook profile page uses ID 11992764, but the API account IDs differ.
// Match by name "khai" (case-insensitive) to find the correct account.
const ACCOUNT_NAME = 'khai';

async function login(): Promise<string> {
  const email = Deno.env.get('MYFXBOOK_EMAIL');
  const password = Deno.env.get('MYFXBOOK_PASSWORD');
  if (!email || !password) throw new Error('MyFxBook credentials not configured');

  const res = await fetch(
    `${API_BASE}/login.json?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  );
  const data = await res.json();
  if (!data.error && data.session) return data.session;
  throw new Error(`MyFxBook login failed: ${data.message || JSON.stringify(data)}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const session = await login();

    // Fetch account info
    const accRes = await fetch(`${API_BASE}/get-my-accounts.json?session=${session}`);
    const accData = await accRes.json();

    if (accData.error) throw new Error(accData.message);

    // Find the account named "khai" (the one linked to myfxbook.com/members/Aasakira/khai/11992764)
    const account = accData.accounts?.find(
      (a: any) => a.name?.toLowerCase() === ACCOUNT_NAME
    ) || accData.accounts?.[0];
    if (!account) throw new Error('Account not found');

    // Compute rich, accurate stats from full trade history
    let computed: Record<string, any> = {};
    try {
      const histRes = await fetch(`${API_BASE}/get-history.json?session=${session}&id=${account.id}`);
      const histData = await histRes.json();
      if (!histData.error && Array.isArray(histData.history)) {
        // Only count actual closed trades (exclude balance/deposit/withdrawal entries with no symbol)
        const trades = histData.history.filter(
          (t: any) => t.symbol && t.action && (t.action === 'Buy' || t.action === 'Sell')
        );
        const total = trades.length;
        const wins = trades.filter((t: any) => Number(t.profit) > 0);
        const losses = trades.filter((t: any) => Number(t.profit) < 0);
        const breakEvens = trades.filter((t: any) => Number(t.profit) === 0);
        const totalProfit = trades.reduce((s: number, t: any) => s + Number(t.profit || 0), 0);
        const totalPips = trades.reduce((s: number, t: any) => s + Number(t.pips || 0), 0);
        const totalLots = trades.reduce(
          (s: number, t: any) => s + Number(t?.sizing?.value || 0),
          0
        );
        const grossWin = wins.reduce((s: number, t: any) => s + Number(t.profit), 0);
        const grossLoss = Math.abs(losses.reduce((s: number, t: any) => s + Number(t.profit), 0));
        const bestTrade = trades.reduce((m: number, t: any) => Math.max(m, Number(t.profit || 0)), 0);
        const worstTrade = trades.reduce((m: number, t: any) => Math.min(m, Number(t.profit || 0)), 0);
        const avgWin = wins.length ? grossWin / wins.length : 0;
        const avgLoss = losses.length ? grossLoss / losses.length : 0;
        const symbols: Record<string, number> = {};
        for (const t of trades) symbols[t.symbol] = (symbols[t.symbol] || 0) + 1;
        const topSymbol =
          Object.entries(symbols).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        computed = {
          trades: total,
          wins: wins.length,
          losses: losses.length,
          breakEvens: breakEvens.length,
          wonPercentage: total > 0 ? Math.round((wins.length / total) * 1000) / 10 : null,
          lostPercentage: total > 0 ? Math.round((losses.length / total) * 1000) / 10 : null,
          totalPipsHistory: Math.round(totalPips),
          totalLots: Math.round(totalLots * 100) / 100,
          grossWin: Math.round(grossWin * 100) / 100,
          grossLoss: Math.round(grossLoss * 100) / 100,
          profitFactorComputed:
            grossLoss > 0 ? Math.round((grossWin / grossLoss) * 100) / 100 : null,
          avgWin: Math.round(avgWin * 100) / 100,
          avgLoss: Math.round(avgLoss * 100) / 100,
          bestTrade: Math.round(bestTrade * 100) / 100,
          worstTrade: Math.round(worstTrade * 100) / 100,
          expectancy:
            total > 0 ? Math.round((totalProfit / total) * 100) / 100 : null,
          topSymbol,
        };
      }
    } catch (e) {
      console.error('History fetch failed:', e);
    }

    // Logout
    fetch(`${API_BASE}/logout.json?session=${session}`).catch(() => {});

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          // Account-level (from MyFxBook summary)
          name: account.name,
          currency: account.currency,
          server: account.server?.name || null,
          tracking: account.tracking,
          views: account.views,
          creationDate: account.creationDate,
          firstTradeDate: account.firstTradeDate,
          lastUpdateDate: account.lastUpdateDate,
          gain: account.gain,
          absGain: account.absGain,
          daily: account.daily,
          monthly: account.monthly,
          drawdown: account.drawdown,
          balance: account.balance,
          equity: account.equity,
          profit: account.profit,
          interest: account.interest,
          profitFactor: account.profitFactor,
          pips: account.pips,
          deposits: account.deposits,
          withdrawals: account.withdrawals,
          // Computed from full history (overrides account-level when available)
          ...computed,
          // Keep wonPercentage falling back to account value if computation failed
          wonPercentage:
            computed.wonPercentage ?? account.wonPercentage ?? null,
          trades: computed.trades ?? account.trades ?? null,
        },
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('MyFxBook API error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
