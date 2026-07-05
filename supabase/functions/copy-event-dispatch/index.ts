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

    // Admin only
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return json({ error: "Admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const master_account_id = String(body.master_account_id ?? "");
    const event_type = String(body.event_type ?? "OPEN");
    const master_ticket = body.master_ticket ? String(body.master_ticket) : null;
    const payload = body.payload ?? {};
    if (!master_account_id) return json({ error: "master_account_id required" }, 400);

    const { data: event, error: evErr } = await supabase
      .from("copy_events")
      .insert({ master_account_id, event_type, master_ticket, payload })
      .select()
      .single();
    if (evErr) throw new Error(evErr.message);

    // Fan-out to active relationships
    const { data: rels } = await supabase
      .from("copy_relationships")
      .select("id, follower_account_id, user_id")
      .eq("master_account_id", master_account_id)
      .eq("status", "active");

    const jobs = (rels ?? []).map((r) => ({
      copy_event_id: event.id,
      copy_relationship_id: r.id,
      follower_account_id: r.follower_account_id,
      user_id: r.user_id,
      status: "pending",
    }));
    if (jobs.length) await supabase.from("copy_jobs").insert(jobs);

    return json({ success: true, event_id: event.id, jobs_created: jobs.length });
  } catch (e: any) {
    return json({ error: e?.message || "dispatch failed" }, 400);
  }
});