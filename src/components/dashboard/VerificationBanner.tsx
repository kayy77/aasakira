import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchVerificationProfile, type VerificationStatus } from "@/lib/verificationState";
import { AlertTriangle, Clock3, ShieldCheck, Sparkles, Crown, ArrowRight } from "lucide-react";

const CONFIG: Record<
  VerificationStatus,
  { tone: "warn" | "info" | "ok" | "gold"; icon: any; title: string; desc: string; cta?: { label: string; to: string } }
> = {
  NOT_STARTED:    { tone: "warn", icon: AlertTriangle, title: "Complete Broker Verification", desc: "Upload broker screenshots to unlock signals, analytics and the coach.", cta: { label: "Start Verification", to: "/onboarding" } },
  UPLOADED:       { tone: "info", icon: Clock3,        title: "Upload Received", desc: "Your broker screenshots were received and queued for review.", cta: { label: "View Status", to: "/account/verification" } },
  PENDING_REVIEW: { tone: "info", icon: Clock3,        title: "Verification Under Review", desc: "Your broker submission is being reviewed.", cta: { label: "View Status", to: "/account/verification" } },
  VERIFIED:       { tone: "ok",   icon: ShieldCheck,   title: "Verified Trader", desc: "You now have full access to the AASAKIRA terminal." },
  REJECTED:       { tone: "warn", icon: AlertTriangle, title: "Verification Needs Attention", desc: "Your proof could not be verified. Upload a clearer set of screenshots.", cta: { label: "Retry", to: "/onboarding" } },
};

export default function VerificationBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await fetchVerificationProfile(user.id);
      setStatus(data.onboarding_status);
    })().catch((error) => console.error("Verification banner failed", error));
  }, [user?.id]);

  if (!status) return null;
  const cfg = CONFIG[status] ?? CONFIG.NOT_STARTED;
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