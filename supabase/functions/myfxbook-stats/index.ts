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

    // Debug: log all account IDs and names
    console.log('Available accounts:', accData.accounts?.map((a: any) => ({ id: a.id, name: a.name, gain: a.gain, balance: a.balance })));
    console.log('Selected account:', { id: account.id, name: account.name, gain: account.gain, balance: account.balance });

    // Fetch gain data for win rate (optional, best effort)
    let wonPercentage = null;
    let trades = null;
    try {
      const histRes = await fetch(`${API_BASE}/get-history.json?session=${session}&id=${account.id}`);
      const histData = await histRes.json();
      if (!histData.error && histData.history) {
        const total = histData.history.length;
        const wins = histData.history.filter((t: any) => Number(t.profit) > 0).length;
        trades = total;
        wonPercentage = total > 0 ? Math.round((wins / total) * 100) : null;
      }
    } catch {
      // Non-critical
    }

    // Logout
    fetch(`${API_BASE}/logout.json?session=${session}`).catch(() => {});

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          gain: account.gain,
          absGain: account.absGain,
          daily: account.daily,
          monthly: account.monthly,
          drawdown: account.drawdown,
          balance: account.balance,
          equity: account.equity,
          profit: account.profit,
          profitFactor: account.profitFactor,
          pips: account.pips,
          deposits: account.deposits,
          withdrawals: account.withdrawals,
          trades: account.trades,
          wonPercentage: wonPercentage ?? account.wonPercentage ?? null,
          currency: account.currency,
          name: account.name,
          lastUpdateDate: account.lastUpdateDate,
          ...(trades !== null ? { trades } : {}),
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
