import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPlatformAccessState } from "@/lib/verificationState";
import { Loader2 } from "lucide-react";

/**
 * Server-trusted access gate. Re-checks `user_profiles.onboarding_status` on
 * every route mount and only allows the canonical VERIFIED state.
 */
export default function RequireVerified() {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const access = await fetchPlatformAccessState(user.id);
      if (cancelled) return;
      setCanAccess(access.canAccessPlatform);
      setLoading(false);
    })().catch((error) => {
      console.error("Verification gate failed", error);
      if (!cancelled) {
        setCanAccess(false);
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

  if (!canAccess) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}