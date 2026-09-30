import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPlatformAccessState, type VerificationStatus } from "@/lib/verificationState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Lock, ShieldCheck, XCircle } from "lucide-react";

export function useAcademyAccess() {
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>("NOT_STARTED");
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!user) {
      setCanAccess(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPlatformAccessState(user.id)
      .then((state) => {
        if (cancelled) return;
        setStatus(state.profile.onboarding_status);
        setCanAccess(state.canAccessPlatform);
      })
      .catch(() => {
        if (!cancelled) setCanAccess(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { status, canAccess, loading: loading || authLoading };
}

const COPY: Record<VerificationStatus, { icon: typeof Clock; title: string; body: string; cta: string; href: string }> = {
  NOT_STARTED: {
    icon: Lock,
    title: "Verify your account to unlock the Academy",
    body: "Academy lessons, tasks and quizzes are reserved for verified members. Complete the short verification step and your account will be reviewed.",
    cta: "Start verification",
    href: "/onboarding",
  },
  UPLOADED: {
    icon: Clock,
    title: "Your verification is being processed",
    body: "We've received your documents. Lessons unlock as soon as your account is approved — you'll usually hear back within 24 hours.",
    cta: "View verification status",
    href: "/account/verification",
  },
  PENDING_REVIEW: {
    icon: Clock,
    title: "Your account is pending review",
    body: "A member of the team is reviewing your account now. The full Academy unlocks automatically the moment you're approved — no need to do anything else.",
    cta: "View verification status",
    href: "/account/verification",
  },
  REJECTED: {
    icon: XCircle,
    title: "Verification needs another look",
    body: "We couldn't approve your account with the details provided. Resubmit your verification and the Academy will unlock once you're approved.",
    cta: "Resubmit verification",
    href: "/onboarding",
  },
  VERIFIED: {
    icon: ShieldCheck,
    title: "Verified",
    body: "You have full access to the Academy.",
    cta: "Open Academy",
    href: "/academy",
  },
};

export function AcademyLockedNotice({ status }: { status: VerificationStatus }) {
  const copy = COPY[status] ?? COPY.NOT_STARTED;
  const Icon = copy.icon;
  return (
    <Card className="bg-[#0a0a0a] border-[#D4AF37]/30">
      <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="h-11 w-11 rounded-md bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-white font-medium">{copy.title}</div>
            <p className="text-sm text-white/60 mt-1 max-w-2xl">{copy.body}</p>
          </div>
          <Link to={copy.href}>
            <Button size="sm" className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">
              {copy.cta}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
