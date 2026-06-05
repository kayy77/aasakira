import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API_BASE = "https://www.myfxbook.com/api";

async function mfxLogin(email: string, password: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/login.json?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  );
  const data = await res.json();
  if (data.error) throw new Error(data.message || "Myfxbook login failed");
  return data.session as string;
}

async function mfxLogout(session: string) {
  try { await fetch(`${API_BASE}/logout.json?session=${session}`); } catch {}
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing auth" }, 401);
    }
    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
    if (userErr || !userData.user) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }
    const user_id = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const system_name = String(body.system_name ?? "").trim();
    if (!email || !password || !system_name) {
      return jsonResponse({ error: "email, password and system_name are required" }, 400);
    }

    // Authenticate against Myfxbook
    const session = await mfxLogin(email, password);

    try {
      const accRes = await fetch(`${API_BASE}/get-my-accounts.json?session=${session}`);
      const accData = await accRes.json();
      if (accData.error) throw new Error(accData.message);

      const accounts = accData.accounts || [];
      const match = accounts.find(
        (a: any) => a.name?.toLowerCase() === system_name.toLowerCase(),
      ) || accounts[0];

      if (!match) throw new Error("No Myfxbook accounts found on this profile.");

      // Insert trading_accounts row (do NOT store password)
      const { data: inserted, error: insertErr } = await supabase
        .from("trading_accounts")
        .insert({
          user_id,
          provider: "myfxbook",
          provider_account_id: String(match.id),
          account_name: match.name || system_name,
          account_login: match.accountId ? String(match.accountId) : null,
          broker: match.server?.name || null,
          server: match.server?.name || null,
          currency: match.currency || "USD",
          leverage: match.leverage ? Number(match.leverage) : null,
          status: "active",
          last_sync_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr) throw new Error(insertErr.message);

      // Initial snapshot
      await supabase.from("account_snapshots").insert({
        account_id: inserted.id,
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

      // Pull history
      try {
        const histRes = await fetch(`${API_BASE}/get-history.json?session=${session}&id=${match.id}`);
        const histData = await histRes.json();
        if (!histData.error && Array.isArray(histData.history)) {
          const trades = histData.history
            .filter((t: any) => t.symbol && (t.action === "Buy" || t.action === "Sell"))
            .slice(0, 500);

          if (trades.length) {
            const rows = trades.map((t: any) => ({
              account_id: inserted.id,
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

            // upsert by (account_id, external_ticket)
            await supabase.from("trade_history").upsert(rows, {
              onConflict: "account_id,external_ticket",
              ignoreDuplicates: true,
            });

            // Compute aggregate performance_metrics (period=all)
            const wins = trades.filter((t: any) => Number(t.profit) > 0);
            const losses = trades.filter((t: any) => Number(t.profit) < 0);
            const grossWin = wins.reduce((s: number, t: any) => s + Number(t.profit), 0);
            const grossLoss = Math.abs(losses.reduce((s: number, t: any) => s + Number(t.profit), 0));
            const totalPips = trades.reduce((s: number, t: any) => s + Number(t.pips || 0), 0);
            const totalProfit = trades.reduce((s: number, t: any) => s + Number(t.profit || 0), 0);

            await supabase.from("performance_metrics").upsert(
              {
                account_id: inserted.id,
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
        }
      } catch (e) {
        console.error("history pull failed:", e);
      }

      return jsonResponse({ success: true, account_id: inserted.id });
    } finally {
      mfxLogout(session);
    }
  } catch (err: any) {
    console.error("connect error:", err);
    return jsonResponse({ error: err?.message || "Could not connect" }, 400);
  }
});