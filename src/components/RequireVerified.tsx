import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Server-trusted verification gate. Re-checks `user_profiles.onboarding_status`
 * on every route mount. Refreshing the page CANNOT bypass it because the
 * status is read fresh from Supabase, never persisted to client storage.
 */
export default function RequireVerified() {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data } = await (supabase as any)
        .from("user_profiles")
        .select("onboarding_status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setStatus(data?.onboarding_status ?? "pending");
      setLoading(false);
    })();
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

  if (status !== "verified") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}