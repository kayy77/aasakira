import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock3, ShieldCheck, Sparkles, Crown, ArrowRight } from "lucide-react";

type Status =
  | "pending"
  | "in_progress"
  | "broker_submitted"
  | "broker_verified"
  | "trial_active"
  | "member"
  | "premium"
  | "admin";

const CONFIG: Record<
  Status,
  { tone: "warn" | "info" | "ok" | "gold"; icon: any; title: string; desc: string; cta?: { label: string; to: string } }
> = {
  pending:          { tone: "warn", icon: AlertTriangle, title: "Complete Broker Verification", desc: "Upload broker screenshots to unlock signals, analytics and the AI coach.", cta: { label: "Start Verification", to: "/onboarding" } },
  in_progress:      { tone: "warn", icon: AlertTriangle, title: "Finish Verification", desc: "You started onboarding — pick up where you left off.", cta: { label: "Resume", to: "/onboarding" } },
  broker_submitted: { tone: "info", icon: Clock3,        title: "Verification Under Review", desc: "Our team is reviewing your broker submission. This usually takes minutes.", cta: { label: "View Status", to: "/account/verification" } },
  broker_verified:  { tone: "ok",   icon: ShieldCheck,   title: "Verified Trader", desc: "You now have full access to the AASAKIRA terminal." },
  trial_active:     { tone: "gold", icon: Sparkles,      title: "Trial Active", desc: "You're inside the 3-day trial. Explore every module.", cta: { label: "Upgrade", to: "/pricing" } },
  member:           { tone: "ok",   icon: ShieldCheck,   title: "Member", desc: "Standard access to signals, journal and academy.", cta: { label: "Upgrade to Premium", to: "/pricing" } },
  premium:          { tone: "gold", icon: Crown,         title: "Inner Circle · Premium", desc: "Full access — signals, AI coach, analytics and risk suite." },
  admin:            { tone: "gold", icon: Crown,         title: "Admin", desc: "Full platform access." },
};

export default function VerificationBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("user_profiles")
        .select("onboarding_status")
        .eq("user_id", user.id)
        .maybeSingle();
      setStatus(((data?.onboarding_status as Status) ?? "pending") as Status);
    })();
  }, [user?.id]);

  if (!status) return null;
  const cfg = CONFIG[status] ?? CONFIG.pending;
  const Icon = cfg.icon;

  const tones = {
    warn: "border-amber-500/30 bg-amber-500/5 text-amber-200",
    info: "border-sky-500/30 bg-sky-500/5 text-sky-200",
    ok:   "border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
    gold: "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F4D03F]",
  } as const;

  return (
    <div className={`mb-4 rounded-xl border ${tones[cfg.tone]} px-4 py-3 flex flex-wrap items-center justify-between gap-3`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs tracking-widest uppercase font-semibold">{cfg.title}</div>
          <div className="text-[11px] text-white/60 truncate">{cfg.desc}</div>
        </div>
      </div>
      {cfg.cta && (
        <Link
          to={cfg.cta.to}
          className="text-[10px] tracking-widest uppercase inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-white/15 hover:border-white/40 hover:bg-white/5"
        >
          {cfg.cta.label} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}