import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchVerificationProfile, normalizeVerificationStatus, type VerificationStatus } from "@/lib/verificationState";
import { Loader2 } from "lucide-react";

/**
 * Server-trusted access gate. Re-checks `user_profiles.onboarding_status` on
 * every route mount and only allows the canonical VERIFIED state.
 */
export default function RequireVerified() {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const data = await fetchVerificationProfile(user.id);
      if (cancelled) return;
      setStatus(data.onboarding_status);
      setLoading(false);
    })().catch((error) => {
      console.error("Verification gate failed", error);
      if (!cancelled) {
        setStatus("NOT_STARTED");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [user, location.pathname]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (normalizeVerificationStatus(status) !== "VERIFIED") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}