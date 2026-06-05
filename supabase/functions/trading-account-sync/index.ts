import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API_BASE = "https://www.myfxbook.com/api";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function mfxLogin(email: string, password: string) {
  const r = await fetch(`${API_BASE}/login.json?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  const d = await r.json();
  if (d.error) throw new Error(d.message || "Myfxbook login failed");
  return d.session as string;
}

/**
 * Sync a previously connected trading account.
 *
 * We don't store passwords, so for now this re-uses the master AASAKIRA
 * Myfxbook credentials (already configured via the MYFXBOOK_EMAIL /
 * MYFXBOOK_PASSWORD secrets) and matches the account by provider_account_id.
 *
 * When the user-supplied password is sent in the request body, that one
 * is preferred — that's how the connect flow performs the initial sync.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401);
    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);
    const user_id = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const account_id = String(body.account_id ?? "");
    if (!account_id) return json({ error: "account_id required" }, 400);

    const { data: account, error: accErr } = await supabase
      .from("trading_accounts")
      .select("*")
      .eq("id", account_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (accErr || !account) return json({ error: "Account not found" }, 404);

    const email = body.email ?? Deno.env.get("MYFXBOOK_EMAIL");
    const password = body.password ?? Deno.env.get("MYFXBOOK_PASSWORD");
    if (!email || !password) {
      return json({ error: "Provide your Myfxbook credentials to re-sync." }, 400);
    }

    const session = await mfxLogin(email, password);
    try {
      const accRes = await fetch(`${API_BASE}/get-my-accounts.json?session=${session}`);
      const accData = await accRes.json();
      if (accData.error) throw new Error(accData.message);

      const match = (accData.accounts || []).find(
        (a: any) => String(a.id) === account.provider_account_id,
      ) || (accData.accounts || []).find(
        (a: any) => a.name?.toLowerCase() === account.account_name?.toLowerCase(),
      );
      if (!match) throw new Error("Myfxbook account not found anymore.");

      await supabase.from("account_snapshots").insert({
        account_id,
        user_id,
        balance: Number(match.balance) || null,
        equity: Number(match.equity) || null,
        growth_pct: Number(match.gain) || null,
        abs_gain_pct: Number(match.absGain) || null,
        daily_pct: Number(match.daily) || null,
        monthly_pct: Number(match.monthly) || null,
        drawdown_pct: Number(match.drawdown) || null,
        profit: Number(match.profit) || null,
      });

      const histRes = await fetch(`${API_BASE}/get-history.json?session=${session}&id=${match.id}`);
      const histData = await histRes.json();
      const trades = (histData.history || []).filter(
        (t: any) => t.symbol && (t.action === "Buy" || t.action === "Sell"),
      );

      if (trades.length) {
        const rows = trades.slice(0, 500).map((t: any) => ({
          account_id,
          user_id,
          external_ticket: String(t.ticket ?? t.openTime + t.symbol),
          symbol: t.symbol,
          side: t.action.toLowerCase(),
          lots: Number(t.sizing?.value) || Number(t.lots) || null,
          open_price: Number(t.openPrice) || null,
          close_price: Number(t.closePrice) || null,
          open_time: t.openTime ? new Date(t.openTime).toISOString() : null,
          close_time: t.closeTime ? new Date(t.closeTime).toISOString() : null,
          pips: Number(t.pips) || null,
          profit: Number(t.profit) || null,
          commission: Number(t.commission) || null,
          swap: Number(t.swap) || null,
          comment: t.comment || null,
          raw: t,
        }));
        await supabase.from("trade_history").upsert(rows, {
          onConflict: "account_id,external_ticket",
          ignoreDuplicates: true,
        });

        const wins = trades.filter((t: any) => Number(t.profit) > 0);
        const losses = trades.filter((t: any) => Number(t.profit) < 0);
        const grossWin = wins.reduce((s: number, t: any) => s + Number(t.profit), 0);
        const grossLoss = Math.abs(losses.reduce((s: number, t: any) => s + Number(t.profit), 0));
        const totalPips = trades.reduce((s: number, t: any) => s + Number(t.pips || 0), 0);
        const totalProfit = trades.reduce((s: number, t: any) => s + Number(t.profit || 0), 0);

        await supabase.from("performance_metrics").upsert(
          {
            account_id,
            user_id,
            period: "all",
            trades: trades.length,
            wins: wins.length,
            losses: losses.length,
            win_rate: trades.length ? Math.round((wins.length / trades.length) * 1000) / 10 : null,
            profit_factor: grossLoss > 0 ? Math.round((grossWin / grossLoss) * 100) / 100 : null,
            avg_win: wins.length ? Math.round((grossWin / wins.length) * 100) / 100 : null,
            avg_loss: losses.length ? Math.round((grossLoss / losses.length) * 100) / 100 : null,
            best_trade: trades.reduce((m: number, t: any) => Math.max(m, Number(t.profit || 0)), 0),
            worst_trade: trades.reduce((m: number, t: any) => Math.min(m, Number(t.profit || 0)), 0),
            total_pips: Math.round(totalPips),
            total_profit: Math.round(totalProfit * 100) / 100,
            computed_at: new Date().toISOString(),
          },
          { onConflict: "account_id,period" },
        );
      }

      await supabase
        .from("trading_accounts")
        .update({ status: "active", last_sync_at: new Date().toISOString(), last_error: null })
        .eq("id", account_id);

      return json({ success: true });
    } finally {
      try { await fetch(`${API_BASE}/logout.json?session=${session}`); } catch {}
    }
  } catch (err: any) {
    console.error("sync error:", err);
    return json({ error: err?.message || "Sync failed" }, 400);
  }
});