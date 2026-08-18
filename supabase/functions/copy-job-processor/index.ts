import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { MockTradeExecutionProvider, type TradeDirection } from "../_shared/trade-execution.ts";
import { checkRisk } from "../_shared/risk-engine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// NOTE: this function is triggered by pg_cron polling every few seconds (or
// invoked manually from the admin UI) for Phase 1. At higher scale this
// should move to a Postgres LISTEN/NOTIFY-driven worker or an external queue
// (SQS/Cloud Tasks/etc.) so jobs are processed the moment they're created
// instead of on a polling interval.

function computeVolume(mode: string, config: any, masterVolume: number, followerBalance: number | null) {
  switch (mode) {
    case "fixed_lot":
      return Math.max(0.01, Number(config?.lot_size ?? 0.01));
    case "risk_percent": {
      const bal = followerBalance ?? 1000;
      const risk = Number(config?.risk_pct ?? 1) / 100;
      // Naive: 1% of balance -> lot proxy (real risk sizing uses SL distance).
      return Math.max(0.01, Math.round((bal * risk) / 1000 * 100) / 100);
    }
    case "balance_multiplier":
      return Math.max(0.01, masterVolume * Number(config?.multiplier ?? 1));
    default:
      return 0.01;
  }
}

async function findOpenTrade(supabase: any, followerAccountId: string, symbol: string) {
  const { data } = await supabase
    .from("trade_history")
    .select("id")
    .eq("follower_account_id", followerAccountId)
    .eq("symbol", symbol)
    .is("close_time", null)
    .order("open_time", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: pending } = await supabase
      .from("copy_jobs")
      .select("*, copy_events(payload, event_type, master_account_id), copy_relationships(copy_mode, copy_config, status), follower_accounts(balance, equity, connection_status)")
      .eq("status", "pending")
      .limit(100);

    let processed = 0, failed = 0, rejected = 0;

    for (const job of pending ?? []) {
      await supabase.from("copy_jobs").update({ status: "processing", attempts: (job.attempts ?? 0) + 1 }).eq("id", job.id);

      const rel = job.copy_relationships;
      const ev = job.copy_events;
      const fa = job.follower_accounts;
      const symbol = String(ev?.payload?.symbol ?? "");

      if (!rel || rel.status !== "active") {
        await supabase.from("copy_jobs").update({ status: "rejected", last_error: "relationship inactive" }).eq("id", job.id);
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "warn", message: "Rejected: copy relationship inactive" });
        rejected++; continue;
      }
      if (!fa || fa.connection_status !== "connected") {
        await supabase.from("copy_jobs").update({ status: "rejected", last_error: "follower not connected" }).eq("id", job.id);
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "warn", message: "Rejected: follower not connected" });
        rejected++; continue;
      }

      const masterVolume = Number(ev?.payload?.volume ?? 0.01);
      const planned = computeVolume(rel.copy_mode, rel.copy_config, masterVolume, fa.balance);

      // Server-side risk engine — always re-checked here, never trusts
      // anything the client computed.
      const risk = await checkRisk(supabase, { followerAccountId: job.follower_account_id, symbol, plannedLotSize: planned });
      if (!risk.allowed) {
        await supabase.from("copy_jobs").update({ status: "rejected", last_error: risk.reason }).eq("id", job.id);
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "warn", message: `Rejected by risk engine: ${risk.reason}` });
        rejected++; continue;
      }

      const provider = new MockTradeExecutionProvider(supabase, job.user_id);
      const meta = { copyJobId: job.id as string };

      try {
        let result;
        switch (ev?.event_type) {
          case "OPEN": {
            const direction = (String(ev?.payload?.type ?? "BUY").toUpperCase() as TradeDirection);
            result = await provider.openTrade({
              accountId: job.follower_account_id,
              symbol,
              direction,
              lotSize: planned,
              sl: ev?.payload?.sl ?? null,
              tp: ev?.payload?.tp ?? null,
              meta,
            });
            break;
          }
          case "MODIFY": {
            const openTrade = await findOpenTrade(supabase, job.follower_account_id, symbol);
            if (!openTrade) { result = { success: false, error: "no open position to modify" }; break; }
            result = await provider.modifyTrade({ tradeId: openTrade.id, sl: ev?.payload?.sl ?? null, tp: ev?.payload?.tp ?? null, meta });
            break;
          }
          case "PARTIAL_CLOSE": {
            const openTrade = await findOpenTrade(supabase, job.follower_account_id, symbol);
            if (!openTrade) { result = { success: false, error: "no open position to partially close" }; break; }
            result = await provider.partialClose({ tradeId: openTrade.id, lotSize: Number(ev?.payload?.volume ?? planned), meta });
            break;
          }
          case "FULL_CLOSE": {
            const openTrade = await findOpenTrade(supabase, job.follower_account_id, symbol);
            if (!openTrade) { result = { success: false, error: "no open position to close" }; break; }
            result = await provider.closeTrade(openTrade.id, meta);
            break;
          }
          default:
            result = { success: false, error: `unknown event_type ${ev?.event_type}` };
        }

        if (!result.success) {
          await supabase.from("copy_jobs").update({ status: "failed", last_error: result.error ?? "execution failed" }).eq("id", job.id);
          // The provider already logs its own execution failures; this covers
          // the "no matching open position" cases resolved above it, which
          // never reach the provider and would otherwise fail silently.
          await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "error", message: result.error ?? "execution failed", context: { event_type: ev?.event_type, symbol } });
          failed++;
          continue;
        }

        await supabase.from("copy_jobs").update({
          status: "completed",
          planned_volume: planned,
          executed_volume: result.executedVolume ?? planned,
          executed_price: result.executedPrice ?? null,
          broker_ticket: result.brokerTicket ?? null,
          executed_at: new Date().toISOString(),
        }).eq("id", job.id);

        await supabase.from("copy_activity").insert({
          user_id: job.user_id,
          follower_account_id: job.follower_account_id,
          master_account_id: ev?.master_account_id,
          copy_job_id: job.id,
          action: ev?.event_type,
          symbol,
          volume: result.executedVolume ?? planned,
          price: result.executedPrice ?? null,
          result: "success",
        });
        processed++;
      } catch (e: any) {
        await supabase.from("copy_jobs").update({ status: "failed", last_error: e?.message ?? "unknown" }).eq("id", job.id);
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "error", message: e?.message ?? "execution failed" });
        failed++;
      }
    }

    return json({ ok: true, processed, failed, rejected, total: pending?.length ?? 0 });
  } catch (e: any) {
    return json({ error: e?.message ?? "processor failed" }, 500);
  }
});
