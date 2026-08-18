import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPlatformAccessState } from "@/lib/verificationState";
import { Loader2 } from "lucide-react";

/** Admin-only gate backed by the server-trusted `user_roles` table. */
export default function RequireAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPlatformAccessState(user.id)
      .then((access) => {
        if (cancelled) return;
        setIsAdmin(access.isAdmin);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Admin gate failed", error);
        if (!cancelled) {
          setIsAdmin(false);
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

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}