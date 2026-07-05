import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// Stub executor — real MT5 broker adapter plugs in here.
async function stubExecute(_ctx: any) {
  return { success: true, executed_volume: _ctx.planned_volume, executed_price: null, broker_ticket: `SIM-${Date.now()}` };
}

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

      if (!rel || rel.status !== "active") {
        await supabase.from("copy_jobs").update({ status: "rejected", last_error: "relationship inactive" }).eq("id", job.id);
        rejected++; continue;
      }
      if (!fa || fa.connection_status !== "connected") {
        await supabase.from("copy_jobs").update({ status: "rejected", last_error: "follower not connected" }).eq("id", job.id);
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "warn", message: "Follower not connected" });
        rejected++; continue;
      }

      // Risk check
      const { data: risk } = await supabase.from("risk_profiles").select("*").eq("follower_account_id", job.follower_account_id).maybeSingle();
      const masterVolume = Number(ev?.payload?.volume ?? 0.01);
      const planned = computeVolume(rel.copy_mode, rel.copy_config, masterVolume, fa.balance);

      if (risk && planned > Number(risk.max_lot_size)) {
        await supabase.from("copy_jobs").update({ status: "rejected", last_error: `lot ${planned} exceeds max ${risk.max_lot_size}` }).eq("id", job.id);
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "warn", message: "Rejected by risk engine", context: { planned, max_lot_size: risk.max_lot_size } });
        rejected++; continue;
      }

      try {
        const result = await stubExecute({ ...ev?.payload, planned_volume: planned });
        await supabase.from("copy_jobs").update({
          status: "completed",
          planned_volume: planned,
          executed_volume: result.executed_volume,
          executed_price: result.executed_price,
          broker_ticket: result.broker_ticket,
          executed_at: new Date().toISOString(),
        }).eq("id", job.id);

        await supabase.from("copy_activity").insert({
          user_id: job.user_id,
          follower_account_id: job.follower_account_id,
          master_account_id: ev?.master_account_id,
          copy_job_id: job.id,
          action: ev?.event_type,
          symbol: ev?.payload?.symbol,
          volume: planned,
          price: result.executed_price,
          result: "success",
        });
        await supabase.from("execution_logs").insert({ copy_job_id: job.id, user_id: job.user_id, level: "info", message: "Executed", context: result });
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