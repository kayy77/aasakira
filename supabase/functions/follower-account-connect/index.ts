import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getKey(): Promise<CryptoKey> {
  const raw = Deno.env.get("COPY_TRADING_ENCRYPTION_KEY");
  if (!raw) throw new Error("Encryption key missing");
  // Derive a 32-byte key from the secret via SHA-256
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptPassword(password: string): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(password)),
  );
  return { ciphertext, iv };
}

function toHex(bytes: Uint8Array): string {
  return "\\x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Missing auth" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);
    const user_id = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const account_number = String(body.account_number ?? "").trim();
    const server = String(body.server ?? "").trim();
    const broker = body.broker ? String(body.broker) : null;
    const password = String(body.password ?? "");
    if (!account_number || !server || !password) {
      return json({ error: "account_number, server and password are required" }, 400);
    }

    const { ciphertext, iv } = await encryptPassword(password);

    const { data: inserted, error } = await supabase
      .from("follower_accounts")
      .insert({
        user_id,
        account_number,
        server,
        broker,
        encrypted_password: toHex(ciphertext),
        encryption_iv: toHex(iv),
        connection_status: "connecting",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Seed defaults
    await supabase.from("risk_profiles").insert({ follower_account_id: inserted.id, user_id });
    await supabase.from("copy_settings").insert({ follower_account_id: inserted.id, user_id });
    await supabase.from("sync_status").insert({ follower_account_id: inserted.id, user_id, last_heartbeat: new Date().toISOString() });

    // Simulate immediate transition to connected (real MT5 socket to be plugged in later)
    await supabase
      .from("follower_accounts")
      .update({ connection_status: "connected", last_sync_at: new Date().toISOString() })
      .eq("id", inserted.id);

    return json({ success: true, follower_account_id: inserted.id });
  } catch (e: any) {
    console.error("follower-account-connect error:", e);
    return json({ error: e?.message || "connect failed" }, 400);
  }
});