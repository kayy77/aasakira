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

type ScreenshotPayload = {
  kind: string;
  storage_path: string;
  image_url?: string;
};

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
    const screenshots = Array.isArray(body?.screenshots) ? body.screenshots as ScreenshotPayload[] : [];
    const traderType = typeof body?.trader_type === "string" ? body.trader_type : null;
    const uploadedAt = typeof body?.uploaded_at === "string" ? body.uploaded_at : new Date().toISOString();

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    let { data: vr, error: vrErr } = await admin
      .from("verification_requests")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!vr && screenshots.length > 0) {
      validateScreenshots(user.id, requestId, screenshots);
      const imageUrls = screenshots.map((shot) => shot.image_url ?? `storage://verification-screenshots/${shot.storage_path}`);
      const { data: created, error: createErr } = await admin
        .from("verification_requests")
        .insert({
          id: requestId,
          user_id: user.id,
          trader_type: traderType,
          status: "UPLOADED",
          review_status: "uploaded",
          uploaded_at: uploadedAt,
          image_urls: imageUrls,
        })
        .select("*")
        .single();
      if (createErr) throw createErr;

      for (const shot of screenshots) {
        const { error: shotErr } = await admin.from("verification_screenshots").insert({
          request_id: requestId,
          user_id: user.id,
          kind: shot.kind,
          storage_path: shot.storage_path,
        });
        if (shotErr) throw shotErr;
      }

      vr = created;
      await transitionProfile(admin, user.id, requestId, "UPLOADED", "upload_successful", "verify-trading-account", {
        screenshot_count: screenshots.length,
      });
      console.info("Upload successful; database updated", { user_id: user.id, request_id: requestId, screenshot_count: screenshots.length });
    }

    if (vrErr && vrErr.code !== "PGRST116") throw vrErr;
    if (!vr) return json({ error: "Not found" }, 404);

    const startedAt = new Date().toISOString();
    await transitionProfile(admin, user.id, requestId, "PENDING_REVIEW", "upload_successful", "verify-trading-account", {
      request_id: requestId,
      uploaded_at: vr.uploaded_at ?? startedAt,
    });
    await admin.from("verification_requests").update({
      status: "PENDING_REVIEW",
      review_status: "pending_review",
      uploaded_at: vr.uploaded_at ?? startedAt,
      updated_at: startedAt,
    }).eq("id", requestId);
    console.info("AI verification started", { user_id: user.id, request_id: requestId });
    await logEvent(admin, user.id, requestId, null, "PENDING_REVIEW", "ai_verification_started", "verify-trading-account", {});

    const { data: shots } = await admin
      .from("verification_screenshots")
      .select("*")
      .eq("request_id", requestId);
    if (!shots || shots.length === 0) {
      await markRejected(admin, requestId, user.id, "No screenshots found", { reason: "No screenshots found" });
      return json({ status: "REJECTED", reason: "No screenshots found" });
    }
    console.info("Screenshot upload records found", { user_id: user.id, request_id: requestId, count: shots.length });
    await logEvent(admin, user.id, requestId, null, "PENDING_REVIEW", "screenshot_uploaded", "verify-trading-account", { count: shots.length });

    if (!LOVABLE_API_KEY) {
      await markRejected(admin, requestId, user.id, "AI verification unavailable", { reason: "AI verification unavailable" });
      return json({ status: "REJECTED", reason: "AI verification unavailable" });
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

    const newStatus = isVerified ? "VERIFIED" : "REJECTED";
    const rejectionReason = isVerified
      ? null
      : buildRejectionReason({ brokerOk: !!brokerOk, hasAccount, avgConf });

    await admin.from("verification_requests").update({
      account_number: accountNumber,
      broker,
      platform,
      ai_confidence: avgConf,
      ai_raw: { extractions } as any,
      status: newStatus,
      review_status: isVerified ? "approved" : "rejected",
      rejection_reason: rejectionReason,
      verified_by: isVerified ? "AI" : null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", requestId);

    if (isVerified) {
      await transitionProfile(admin, user.id, requestId, "VERIFIED", "ai_verification_passed", "AI", {
        broker,
        account_number: accountNumber,
        confidence: avgConf,
      });
      console.info("AI verification passed; database updated", { user_id: user.id, request_id: requestId, confidence: avgConf });
    } else {
      await transitionProfile(admin, user.id, requestId, "REJECTED", "ai_verification_failed", "AI", {
        reason: rejectionReason,
        broker,
        account_number: accountNumber,
        confidence: avgConf,
      });
      console.warn("AI verification failed; database updated", { user_id: user.id, request_id: requestId, reason: rejectionReason, confidence: avgConf });
    }

    return json({ status: newStatus, confidence: avgConf, broker, account_number: accountNumber, reason: rejectionReason });
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

function validateScreenshots(userId: string, requestId: string, screenshots: ScreenshotPayload[]) {
  if (screenshots.length === 0 || screenshots.length > 10) throw new Error("Invalid screenshot count");
  for (const shot of screenshots) {
    if (typeof shot.kind !== "string" || !shot.kind.trim()) throw new Error("Screenshot kind required");
    if (typeof shot.storage_path !== "string" || !shot.storage_path.startsWith(`${userId}/${requestId}/`)) {
      throw new Error("Invalid screenshot path");
    }
  }
}

function buildRejectionReason({ brokerOk, hasAccount, avgConf }: { brokerOk: boolean; hasAccount: boolean; avgConf: number }) {
  if (!brokerOk) return "Broker could not be verified as STARTRADER.";
  if (!hasAccount) return "Trading account number was not visible in the screenshots.";
  if (avgConf < 0.7) return "Screenshot confidence was too low. Upload clearer screenshots.";
  return "Verification failed. Upload clearer broker and MT5 screenshots.";
}

async function markRejected(admin: any, requestId: string, userId: string, reason: string, details: Record<string, unknown>) {
  await admin.from("verification_requests").update({
    status: "REJECTED",
    review_status: "rejected",
    rejection_reason: reason,
    ai_confidence: 0,
    ai_raw: details,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", requestId);

  await transitionProfile(admin, userId, requestId, "REJECTED", "ai_verification_failed", "AI", { reason, ...details });
  console.warn("AI verification failed; database updated", { user_id: userId, request_id: requestId, reason });
}

async function transitionProfile(
  admin: any,
  userId: string,
  requestId: string,
  toStatus: "PENDING_REVIEW" | "VERIFIED" | "REJECTED",
  event: string,
  actor: string,
  details: Record<string, unknown>,
) {
  const { data: profile } = await admin
    .from("user_profiles")
    .select("onboarding_status")
    .eq("user_id", userId)
    .maybeSingle();

  const fromStatus = profile?.onboarding_status ?? null;
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    onboarding_status: toStatus,
    onboarding_step: 4,
    updated_at: now,
  };

  if (toStatus === "PENDING_REVIEW") {
    patch.verification_uploaded_at = now;
    patch.rejection_reason = null;
  }

  if (toStatus === "VERIFIED") {
    patch.verified_at = now;
    patch.verified_by = actor;
    patch.rejection_reason = null;
  }

  if (toStatus === "REJECTED") {
    patch.rejection_reason = String(details.reason ?? "Verification failed.");
  }

  const { error } = await admin.from("user_profiles").update(patch).eq("user_id", userId);
  if (error) throw error;

  await logEvent(admin, userId, requestId, fromStatus, toStatus, event, actor, details);
  await logEvent(admin, userId, requestId, fromStatus, toStatus, "database_updated", actor, { ...details, table: "user_profiles" });
}

async function logEvent(
  admin: any,
  userId: string,
  requestId: string | null,
  fromStatus: string | null,
  toStatus: string,
  event: string,
  actor: string,
  details: Record<string, unknown>,
) {
  const { error } = await admin.rpc("log_verification_state_event", {
    p_user_id: userId,
    p_request_id: requestId,
    p_from_status: fromStatus,
    p_to_status: toStatus,
    p_event: event,
    p_actor: actor,
    p_details: details,
  });
  if (error) console.error("verification state log failed", { event, error });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
