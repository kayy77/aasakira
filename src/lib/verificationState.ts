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
  const { data, error } = await (supabase as any)
    .from("user_profiles")
    .select(
      "onboarding_status,onboarding_step,trader_type,trial_started_at,verified_at,verified_by,rejection_reason,verification_uploaded_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return {
    ...(data ?? {}),
    onboarding_status: normalizeVerificationStatus(data?.onboarding_status),
  };
}

export function routeForVerificationStatus(status?: string | null) {
  return normalizeVerificationStatus(status) === "VERIFIED" ? "/dashboard" : "/onboarding";
}