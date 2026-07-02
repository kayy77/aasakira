import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Extraction {
  account_number: string | null;
  broker: string | null;
  platform: string | null;
  confidence: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.slice(7);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const requestId = body?.request_id;
    if (typeof requestId !== "string") return json({ error: "request_id required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: vr, error: vrErr } = await admin
      .from("verification_requests")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single();
    if (vrErr || !vr) return json({ error: "Not found" }, 404);

    await admin.from("verification_requests").update({ status: "broker_submitted" }).eq("id", requestId);

    const { data: shots } = await admin
      .from("verification_screenshots")
      .select("*")
      .eq("request_id", requestId);
    if (!shots || shots.length === 0) {
      await markNeedsReview(admin, requestId, user.id, { reason: "No screenshots found" });
      return json({ status: "needs_review", reason: "No screenshots found" });
    }

    if (!LOVABLE_API_KEY) {
      await markNeedsReview(admin, requestId, user.id, { reason: "AI verification unavailable" });
      return json({ status: "needs_review", reason: "AI verification unavailable" });
    }

    const extractions: Extraction[] = [];
    for (const shot of shots) {
      const { data: signed } = await admin.storage
        .from("verification-screenshots")
        .createSignedUrl(shot.storage_path, 300);
      if (!signed?.signedUrl) continue;
      const ext = await extractFromImage(signed.signedUrl, LOVABLE_API_KEY);
      extractions.push(ext);
      await admin.from("verification_screenshots").update({ ai_extraction: ext as any }).eq("id", shot.id);
    }

    // Aggregate
    const accountNumber = extractions.map(e => e.account_number).find(Boolean) || null;
    const broker = extractions.map(e => e.broker).find(Boolean) || null;
    const platform = extractions.map(e => e.platform).find(Boolean) || null;
    const avgConf = extractions.reduce((s, e) => s + (e.confidence || 0), 0) / Math.max(1, extractions.length);

    const brokerOk = broker && /startrader/i.test(broker);
    const hasAccount = !!accountNumber;
    const isVerified = brokerOk && hasAccount && avgConf >= 0.7;

    const newStatus = isVerified ? "broker_verified" : "needs_review";

    await admin.from("verification_requests").update({
      account_number: accountNumber,
      broker,
      platform,
      ai_confidence: avgConf,
      ai_raw: { extractions } as any,
      status: newStatus,
      reviewed_at: isVerified ? new Date().toISOString() : null,
    }).eq("id", requestId);

    if (isVerified) {
      await admin.from("user_profiles").update({ onboarding_status: "broker_verified" }).eq("user_id", user.id);
    }

    return json({ status: newStatus, confidence: avgConf, broker, account_number: accountNumber });
  } catch (e) {
    console.error("verify-trading-account error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});

async function extractFromImage(imageUrl: string, key: string): Promise<Extraction> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You extract trading account info from broker screenshots. Reply ONLY with JSON: {account_number, broker, platform, confidence} where confidence is 0..1.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the trading account number, broker name, and platform (MT4/MT5/cTrader). Reply JSON only." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });
  if (!resp.ok) {
    console.error("AI gateway error", resp.status, await resp.text());
    return { account_number: null, broker: null, platform: null, confidence: 0 };
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || "{}";
  const cleaned = String(text).replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      account_number: parsed.account_number ?? null,
      broker: parsed.broker ?? null,
      platform: parsed.platform ?? null,
      confidence: Number(parsed.confidence ?? 0.5),
    };
  } catch {
    return { account_number: null, broker: null, platform: null, confidence: 0 };
  }
}

async function markNeedsReview(admin: any, requestId: string, userId: string, details: Record<string, unknown>) {
  await admin.from("verification_requests").update({
    status: "needs_review",
    ai_confidence: 0,
    ai_raw: details,
  }).eq("id", requestId);

  await admin.from("user_profiles").update({
    onboarding_status: "broker_submitted",
    onboarding_step: 4,
  }).eq("user_id", userId);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
