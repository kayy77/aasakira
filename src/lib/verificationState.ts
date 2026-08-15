import { supabase } from "@/integrations/supabase/client";

export type VerificationStatus =
  | "NOT_STARTED"
  | "UPLOADED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type VerificationProfile = {
  onboarding_status: VerificationStatus;
  onboarding_step?: number | null;
  trader_type?: string | null;
  trial_started_at?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  verification_uploaded_at?: string | null;
};

export type PlatformAccessState = {
  profile: VerificationProfile;
  isAdmin: boolean;
  canAccessPlatform: boolean;
};

const LEGACY_STATUS_MAP: Record<string, VerificationStatus> = {
  pending: "NOT_STARTED",
  in_progress: "NOT_STARTED",
  broker_submitted: "PENDING_REVIEW",
  submitted: "PENDING_REVIEW",
  needs_review: "REJECTED",
  broker_verified: "VERIFIED",
  trial_active: "VERIFIED",
  member: "VERIFIED",
  premium: "VERIFIED",
  admin: "VERIFIED",
};

const PROFILE_FETCH_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: PromiseLike<T>, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), PROFILE_FETCH_TIMEOUT_MS);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function normalizeVerificationStatus(status?: string | null): VerificationStatus {
  if (!status) return "NOT_STARTED";
  if (["NOT_STARTED", "UPLOADED", "PENDING_REVIEW", "VERIFIED", "REJECTED"].includes(status)) {
    return status as VerificationStatus;
  }
  return LEGACY_STATUS_MAP[status] ?? "NOT_STARTED";
}

export function isVerifiedStatus(status?: string | null) {
  return normalizeVerificationStatus(status) === "VERIFIED";
}

export async function fetchVerificationProfile(userId: string): Promise<VerificationProfile> {
  const { data, error } = await withTimeout(
    (supabase as any)
      .from("user_profiles")
      .select(
        "onboarding_status,onboarding_step,trader_type,trial_started_at,verified_at,verified_by,rejection_reason,verification_uploaded_at",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    "Verification status took too long to load.",
  );

  if (error) throw error;

  return {
    ...(data ?? {}),
    onboarding_status: normalizeVerificationStatus(data?.onboarding_status),
  };
}

export async function fetchPlatformAccessState(userId: string): Promise<PlatformAccessState> {
  const [profile, roleResult] = await withTimeout(Promise.all([
    fetchVerificationProfile(userId),
    (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle(),
  ]), "Platform access check took too long to load.");

  if (roleResult.error) throw roleResult.error;

  const isAdmin = roleResult.data?.role === "admin";
  return {
    profile,
    isAdmin,
    canAccessPlatform: isAdmin || isVerifiedStatus(profile.onboarding_status),
  };
}

export function routeForVerificationStatus(status?: string | null) {
  return normalizeVerificationStatus(status) === "VERIFIED" ? "/dashboard" : "/onboarding";
}