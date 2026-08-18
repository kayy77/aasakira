import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData, error: userErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);
    const uid = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "pause"); // pause | resume | stop | disconnect
    const scope = String(body.scope ?? "user"); // user | master | follower
    const target_id = body.target_id ? String(body.target_id) : null;

    const { data: adminRow } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    const isAdmin = !!adminRow;

    if (scope === "master") {
      if (!isAdmin) return json({ error: "Admin only for master scope" }, 403);
      const relStatus = action === "resume" ? "active" : action === "stop" ? "stopped" : "paused";
      const masterStatus = action === "resume" ? "active" : action === "stop" ? "disabled" : "paused";
      await supabase.from("copy_relationships").update({ status: relStatus }).eq("master_account_id", target_id!);
      await supabase.from("master_accounts").update({ status: masterStatus, is_active: action !== "stop" }).eq("id", target_id!);
      return json({ ok: true });
    }

    if (scope === "follower") {
      // ensure ownership unless admin
      const q = supabase.from("copy_relationships").update({ status: action === "resume" ? "active" : action === "stop" ? "stopped" : "paused" }).eq("follower_account_id", target_id!);
      if (!isAdmin) q.eq("user_id", uid);
      await q;
      if (action === "disconnect") {
        const dq = supabase.from("follower_accounts").update({ connection_status: "disconnected" }).eq("id", target_id!);
        if (!isAdmin) dq.eq("user_id", uid);
        await dq;
      }
      return json({ ok: true });
    }

    // scope === user (self)
    const status = action === "resume" ? "active" : action === "stop" ? "stopped" : "paused";
    await supabase.from("copy_relationships").update({ status }).eq("user_id", uid);
    return json({ ok: true });
  } catch (e: any) {
    return json({ error: e?.message ?? "emergency-stop failed" }, 400);
  }
});