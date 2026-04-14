import { corsHeaders } from "@supabase/supabase-js/cors";

const MYFXBOOK_URL = "https://www.myfxbook.com/members/Aasakira/khai/11992764";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Fetch the public MyFxBook profile page
    const response = await fetch(MYFXBOOK_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`MyFxBook returned ${response.status}`);
    }

    const html = await response.text();

    // Extract stats from the HTML page
    const stats: Record<string, string | null> = {};

    // Helper to extract values
    const extract = (pattern: RegExp): string | null => {
      const match = html.match(pattern);
      return match ? match[1].trim() : null;
    };

    // Gain
    stats.gain = extract(/Gain[:\s]*<[^>]*>([^<]+)</i) 
      || extract(/id="gain"[^>]*>([^<]+)/i)
      || extract(/"gain"\s*:\s*"?([^",}]+)/i);

    // Abs Gain
    stats.absGain = extract(/Abs\.?\s*Gain[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"absGain"\s*:\s*"?([^",}]+)/i);

    // Daily gain
    stats.daily = extract(/Daily[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"daily"\s*:\s*"?([^",}]+)/i);

    // Monthly gain
    stats.monthly = extract(/Monthly[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"monthly"\s*:\s*"?([^",}]+)/i);

    // Drawdown
    stats.drawdown = extract(/Drawdown[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"drawdown"\s*:\s*"?([^",}]+)/i);

    // Balance
    stats.balance = extract(/Balance[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"balance"\s*:\s*"?([^",}]+)/i);

    // Equity
    stats.equity = extract(/Equity[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"equity"\s*:\s*"?([^",}]+)/i);

    // Profit
    stats.profit = extract(/Profit[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"profit"\s*:\s*"?([^",}]+)/i);

    // Profit Factor
    stats.profitFactor = extract(/Profit\s*Factor[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"profitFactor"\s*:\s*"?([^",}]+)/i);

    // Pips
    stats.pips = extract(/Pips[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"pips"\s*:\s*"?([^",}]+)/i);

    // Deposits
    stats.deposits = extract(/Deposits[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"deposits"\s*:\s*"?([^",}]+)/i);

    // Withdrawals
    stats.withdrawals = extract(/Withdrawals[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"withdrawals"\s*:\s*"?([^",}]+)/i);

    // Trades
    stats.trades = extract(/Trades[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"trades"\s*:\s*"?([^",}]+)/i);

    // Win rate / Won
    stats.winRate = extract(/Won[:\s]*<[^>]*>([^<]+)</i)
      || extract(/"wonPercentage"\s*:\s*"?([^",}]+)/i);

    // Also try to capture from JSON data embedded in page
    const jsonMatch = html.match(/var\s+accountData\s*=\s*(\{[^;]+\})/);
    if (jsonMatch) {
      try {
        const accountData = JSON.parse(jsonMatch[1]);
        if (accountData.gain) stats.gain = String(accountData.gain);
        if (accountData.absGain) stats.absGain = String(accountData.absGain);
        if (accountData.daily) stats.daily = String(accountData.daily);
        if (accountData.monthly) stats.monthly = String(accountData.monthly);
        if (accountData.drawdown) stats.drawdown = String(accountData.drawdown);
        if (accountData.balance) stats.balance = String(accountData.balance);
        if (accountData.equity) stats.equity = String(accountData.equity);
        if (accountData.profit) stats.profit = String(accountData.profit);
        if (accountData.profitFactor) stats.profitFactor = String(accountData.profitFactor);
        if (accountData.pips) stats.pips = String(accountData.pips);
        if (accountData.deposits) stats.deposits = String(accountData.deposits);
        if (accountData.withdrawals) stats.withdrawals = String(accountData.withdrawals);
        if (accountData.trades) stats.trades = String(accountData.trades);
      } catch {
        // JSON parse failed, continue with regex results
      }
    }

    // Return a sample of the HTML for debugging if no stats found
    const hasAnyStats = Object.values(stats).some(v => v !== null);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        hasData: hasAnyStats,
        fetchedAt: new Date().toISOString(),
        // Include a small HTML sample for debugging
        ...(hasAnyStats ? {} : { htmlSample: html.substring(0, 2000) }),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("MyFxBook fetch error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
