import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { fetchVerificationProfile, normalizeVerificationStatus, type VerificationStatus } from "@/lib/verificationState";
import AccountLayout from "./_AccountLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function Verification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const profile = await fetchVerificationProfile(user.id);
      setStatus(profile.onboarding_status);
      setRejectionReason(profile.rejection_reason ?? null);
      setLoading(false);
    })().catch((error) => {
      console.error("Verification page failed", error);
      setStatus("NOT_STARTED");
      setLoading(false);
    });
  }, [user]);

  const normalized = normalizeVerificationStatus(status);
  const verified = normalized === "VERIFIED";
  const rejected = normalized === "REJECTED";
  const Icon = verified ? ShieldCheck : rejected ? AlertCircle : Clock;

  return (
    <AccountLayout title="Verification" subtitle="Your broker proof and current access tier.">
      <Card className="lux-glass p-8 max-w-2xl">
        {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" /> : (
          <>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                verified ? "bg-emerald-500/10 border-emerald-500/40" : "bg-amber-500/10 border-amber-500/40"
              }`}>
                <Icon className={`w-6 h-6 ${verified ? "text-emerald-400" : "text-amber-400"}`} />
              </div>
              <div>
                <div className="text-xs tracking-widest uppercase text-white/50">Status</div>
                <div className="font-display text-xl mt-0.5">{(status || "NOT_STARTED").replace(/_/g, " ")}</div>
                {rejected && rejectionReason && <div className="text-xs text-white/50 mt-1">{rejectionReason}</div>}
              </div>
            </div>
            {!verified ? (
              <Button onClick={() => navigate("/onboarding")} className="mt-8 btn-gold rounded-full px-6 py-2.5 text-xs tracking-widest uppercase">
                Continue Verification <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/account/trading-accounts")} className="mt-8 btn-gold rounded-full px-6 py-2.5 text-xs tracking-widest uppercase">
                Manage Trading Accounts <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            )}
          </>
        )}
      </Card>
    </AccountLayout>
  );
}