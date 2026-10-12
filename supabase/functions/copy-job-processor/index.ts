// Processes pending copy jobs and places them as real orders on the follower's linked cTrader account.
// Safety: only cTrader DEMO accounts receive orders unless the COPY_LIVE_ENABLED secret is "true".
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkRisk } from "../_shared/risk-engine.ts";
import { openCtraderSession, marketOrder, amendSltp, closePosition, type CtraderSession } from "../_shared/ctrader-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function computeVolume(mode: string, config: any, masterVolume: number, followerBalance: number | null) {
  switch (mode) {
    case "fixed_lot": return Math.max(0.01, Number(config?.lot_size ?? 0.01));
    case "risk_percent": {
      const bal = followerBalance ?? 1000;
      const risk = Number(config?.risk_pct ?? 1) / 100;
      return Math.max(0.01, Math.round((bal * risk) / 1000 * 100) / 100);
    }
    case "balance_multiplier": return Math.max(0.01, masterVolume * Number(config?.multiplier ?? 1));
    default: return 0.01;
  }
}

// The follower's open cTrader position for this symbol = latest completed OPEN copy job with a ticket.
async function findOpenPosition(supabase: any, followerAccountId: string, symbol: string) {
  const { data } = await supabase
    .from("copy_jobs")
    .select("id, broker_ticket, executed_volume, copy_events!inner(event_type, payload)")
    .eq("follower_account_id", followerAccountId)
    .eq("status", "completed")
    .not("broker_ticket", "is", null)
    .order("executed_at", { ascending: false })
    .limit(50);
  const rows = (data ?? []).filter((r: any) => String(r.copy_events?.payload?.symbol ?? "") === symbol);
  const lastClose = rows.find((r: any) => r.copy_events?.event_type === "FULL_CLOSE");
  const lastOpen = rows.find((r: any) => r.copy_events?.event_type === "OPEN");
  if (!lastOpen) return null;
  if (lastClose && rows.indexOf(lastClose) < rows.indexOf(lastOpen)) return null;
  return { positionId: lastOpen.broker_ticket as string, lots: Number(lastOpen.executed_volume ?? 0.01) };
}

async function touchSync(supabase: any, followerAccountId: string, userId: string, latency: number, ok: boolean) {
  const now = new Date().toISOString();
  const { data: existing } = await supabase.from("sync_status").select("id, error_count").eq("follower_account_id", followerAccountId).maybeSingle();
  if (existing) {
    await supabase.from("sync_status").update({ last_heartbeat: now, latency_ms: latency, error_count: ok ? existing.error_count : existing.error_count + 1, updated_at: now }).eq("id", existing.id);
  } else {
    await supabase.from("sync_status").insert({ follower_account_id: followerAccountId, user_id: userId, last_heartbeat: now, latency_ms: latency, error_count: ok ? 0 : 1 });
  }
  await supabase.from("follower_accounts").update({ last_sync_at: now, ...(ok ? { last_error: null } : {}) }).eq("id", followerAccountId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const allowLive = Deno.env.get("COPY_LIVE_ENABLED") === "true";
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: pending } = await supabase
      .from("copy_jobs")
      .select("*, copy_events(payload, event_type, master_account_id), copy_relationships(copy_mode, copy_config, status), follower_accounts(balance, equity, connection_status)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);

    let processed = 0, failed = 0, rejected = 0;
    const sessions = new Map<string, CtraderSession>();

    const reject = async (job: any, reason: string) => {
      await supabase.from("copy_jobs").update({ status: "rejected", last_error: reason }).eq("id", job.id);
      await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "warn", message: `Rejected: ${reason}` });
      rejected++;
    };

    for (const job of pending ?? []) {
      await supabase.from("copy_jobs").update({ status: "processing", attempts: (job.attempts ?? 0) + 1 }).eq("id", job.id);
      const rel = job.copy_relationships, ev = job.copy_events, fa = job.follower_accounts;
      const symbol = String(ev?.payload?.symbol ?? "");

      if (!rel || rel.status !== "active") { await reject(job, "copy relationship inactive"); continue; }

      const masterVolume = Number(ev?.payload?.volume ?? 0.01);
      const planned = computeVolume(rel.copy_mode, rel.copy_config, masterVolume, fa?.balance ?? null);

      if (ev?.event_type === "OPEN") {
        const risk = await checkRisk(supabase, { followerAccountId: job.follower_account_id, symbol, plannedLotSize: planned });
        if (!risk.allowed) { await reject(job, `risk engine: ${risk.reason}`); continue; }
      }

      const started = Date.now();
      try {
        let session = sessions.get(job.user_id);
        if (!session) {
          session = await openCtraderSession(supabase, job.user_id, { allowLive });
          sessions.set(job.user_id, session);
        }

        let ticket: string | null = null, price: number | null = null, volume = planned;
        switch (ev?.event_type) {
          case "OPEN": {
            const side = String(ev?.payload?.type ?? "BUY").toUpperCase() === "SELL" ? "SELL" : "BUY";
            const r = await marketOrder(session, { symbol, side, lots: planned, sl: ev?.payload?.sl ?? null, tp: ev?.payload?.tp ?? null, label: "AASAKIRA Copy", comment: job.id.slice(0, 8) });
            if (!r.positionId) throw new Error("cTrader did not return a position");
            ticket = r.positionId; price = r.fillPrice;
            if (r.sltpError) await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "warn", message: `SL/TP not set: ${r.sltpError}` });
            break;
          }
          case "MODIFY": {
            const pos = await findOpenPosition(supabase, job.follower_account_id, symbol);
            if (!pos) throw new Error("no open position to modify");
            await amendSltp(session, pos.positionId, ev?.payload?.sl ?? null, ev?.payload?.tp ?? null);
            ticket = pos.positionId; volume = pos.lots;
            break;
          }
          case "PARTIAL_CLOSE":
          case "FULL_CLOSE": {
            const pos = await findOpenPosition(supabase, job.follower_account_id, symbol);
            if (!pos) throw new Error("no open position to close");
            volume = ev.event_type === "FULL_CLOSE" ? pos.lots : Math.min(pos.lots, Number(ev?.payload?.volume ?? planned));
            const r = await closePosition(session, pos.positionId, symbol, volume);
            ticket = pos.positionId; price = r.fillPrice;
            break;
          }
          default: throw new Error(`unknown event_type ${ev?.event_type}`);
        }

        const latency = Date.now() - started;
        await supabase.from("copy_jobs").update({
          status: "completed", planned_volume: planned, executed_volume: volume, executed_price: price,
          broker_ticket: ticket, executed_at: new Date().toISOString(), last_error: null,
        }).eq("id", job.id);
        await supabase.from("copy_activity").insert({
          user_id: job.user_id, follower_account_id: job.follower_account_id, master_account_id: ev?.master_account_id,
          copy_job_id: job.id, action: ev?.event_type, symbol, volume, price, result: "success",
        });
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "info", message: `cTrader ${ev?.event_type} ${symbol} ${volume} lots done${session.live ? "" : " (demo account)"}`, context: { ticket, price, latency, live: session.live } });
        await touchSync(supabase, job.follower_account_id, job.user_id, latency, true);
        processed++;
      } catch (e: any) {
        const msg = e?.message ?? "execution failed";
        await supabase.from("copy_jobs").update({ status: "failed", last_error: msg }).eq("id", job.id);
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "error", message: `cTrader: ${msg}`, context: { event_type: ev?.event_type, symbol } });
        await supabase.from("copy_activity").insert({ user_id: job.user_id, follower_account_id: job.follower_account_id, master_account_id: ev?.master_account_id, copy_job_id: job.id, action: ev?.event_type, symbol, volume: planned, result: "failed" });
        await supabase.from("follower_accounts").update({ last_error: msg }).eq("id", job.follower_account_id);
        await touchSync(supabase, job.follower_account_id, job.user_id, Date.now() - started, false);
        failed++;
      }
    }

    for (const s of sessions.values()) s.api.close();
    return json({ ok: true, processed, failed, rejected, total: pending?.length ?? 0, liveEnabled: allowLive });
  } catch (e: any) {
    return json({ error: e?.message ?? "processor failed" }, 500);
  }
});
