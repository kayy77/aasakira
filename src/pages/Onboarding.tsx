import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchVerificationProfile, normalizeVerificationStatus, type VerificationStatus } from "@/lib/verificationState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, Upload, ExternalLink, ArrowRight, ShieldCheck, Clock, Briefcase, Award, Target, AlertCircle } from "lucide-react";

type TraderType = "personal" | "funded" | "prop";
type Slot = "account_number" | "broker_dashboard" | "mt5_screen";

const STARTRADER_URL = "https://startrader.com/en/live-account-registration";
const VIP_WHATSAPP = "https://wa.me/447XXXXXXXXX?text=I%20want%20AASAKIRA%20Pro";

const personalSteps = [
  "Open MT5 Hedge STP account",
  "Claim 100% deposit bonus",
  "Verify ID",
  "Submit address verification",
  "Fund account",
];

const slotMeta: { key: Slot; title: string; hint: string }[] = [
  { key: "account_number", title: "Trading Account Number", hint: "Clear screenshot showing your live account number." },
  { key: "broker_dashboard", title: "Broker Dashboard", hint: "Logged-in broker portal screen." },
  { key: "mt5_screen", title: "MT5 Account Screen", hint: "MT5 'Trade' tab showing balance + account." },
];

export default function Onboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [traderType, setTraderType] = useState<TraderType | null>(null);
  const [completedChecks, setCompletedChecks] = useState<Record<string, boolean>>({});
  const [trialStartedAt, setTrialStartedAt] = useState<string | null>(null);
  const [files, setFiles] = useState<Partial<Record<Slot, File>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Load profile state
  useEffect(() => {
    if (!user) return;
    (async () => {
      const profile = await fetchVerificationProfile(user.id);
      const dbStatus = normalizeVerificationStatus(profile.onboarding_status);

      if (dbStatus === "VERIFIED") {
        console.info("Redirect to dashboard", { reason: "verified_onboarding_load" });
        navigate("/dashboard", { replace: true });
        return;
      }

      if (profile.trader_type) setTraderType(profile.trader_type as TraderType);
      if (profile.trial_started_at) setTrialStartedAt(profile.trial_started_at);
      setStatus(dbStatus);
      setRejectionReason(profile.rejection_reason ?? null);

      // Most recent verification request
      const { data: req } = await (supabase as any)
        .from("verification_requests")
        .select("id, status, review_status, rejection_reason")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (req) {
        setRequestId(req.id);
        if (!profile.rejection_reason && req.rejection_reason) setRejectionReason(req.rejection_reason);
      }

      if (["UPLOADED", "PENDING_REVIEW", "REJECTED"].includes(dbStatus)) {
        setStep(4);
      } else if (profile.onboarding_step && profile.onboarding_step > 0 && profile.onboarding_step < 4) {
        setStep(profile.onboarding_step);
      } else {
        setStep(1);
      }
      setLoading(false);
    })().catch((error) => {
      console.error("Onboarding status load failed", error);
      toast({ title: "Could not load verification status", description: error?.message ?? "Try refreshing.", variant: "destructive" });
      setStatus("NOT_STARTED");
      setLoading(false);
    });
  }, [user, navigate]);

  const saveProfile = useCallback(async (patch: Record<string, any>) => {
    if (!user) return;

    const payload = {
      ...patch,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase as any)
      .from("user_profiles")
      .update(payload)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      const { error: insertError } = await (supabase as any)
        .from("user_profiles")
        .insert({
          user_id: user.id,
          email: user.email ?? null,
          country: "Unknown",
          ...payload,
        });
      if (insertError) throw insertError;
    }
  }, [user]);

  const pickTraderType = async (t: TraderType) => {
    setTraderType(t);
    const next = t === "personal" ? 2 : 2; // both go to step 2 (broker or trial)
    setStep(next);
    const patch: any = { trader_type: t, onboarding_step: next };
    if ((t === "funded" || t === "prop") && !trialStartedAt) {
      patch.trial_started_at = new Date().toISOString();
      setTrialStartedAt(patch.trial_started_at);
    }
    await saveProfile(patch);
  };

  const goToVerification = async () => {
    setStep(3);
    await saveProfile({ onboarding_step: 3 });
  };

  const onSubmit = async () => {
    if (!user) return;
    if (!traderType) {
      toast({ title: "Choose trader type first", variant: "destructive" });
      setStep(1);
      return;
    }
    if (!files.account_number || !files.broker_dashboard || !files.mt5_screen) {
      toast({ title: "Upload all 3 screenshots", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const rId = crypto.randomUUID();
      const uploadedAt = new Date().toISOString();
      const plannedUploads = slotMeta.map((slot) => {
        const file = files[slot.key]!;
        const ext = file.name.split(".").pop() || "png";
        return {
          ...slot,
          file,
          path: `${user.id}/${rId}/${slot.key}-${Date.now()}.${ext}`,
        };
      });

      await saveProfile({ onboarding_step: 4, trader_type: traderType });

      for (const upload of plannedUploads) {
        const { error: upErr } = await supabase.storage
          .from("verification-screenshots")
          .upload(upload.path, upload.file, { upsert: false, contentType: upload.file.type });
        if (upErr) throw upErr;
        console.info("Screenshot uploaded", { requestId: rId, kind: upload.key });
      }

      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-trading-account", {
        body: {
          request_id: rId,
          trader_type: traderType,
          uploaded_at: uploadedAt,
          screenshots: plannedUploads.map((upload) => ({
            kind: upload.key,
            storage_path: upload.path,
            image_url: `storage://verification-screenshots/${upload.path}`,
          })),
        },
      });
      if (verifyError) throw verifyError;

      const nextStatus = normalizeVerificationStatus((verifyData as any)?.status ?? "PENDING_REVIEW");
      setRequestId(rId);
      setStatus(nextStatus);
      setRejectionReason((verifyData as any)?.reason ?? null);
      setStep(4);

      if (nextStatus === "VERIFIED") {
        console.info("Redirect to dashboard", { reason: "verification_approved", requestId: rId });
        navigate("/dashboard", { replace: true });
      } else {
        toast({ title: "Submitted", description: "Your proof is now pending review." });
      }
    } catch (e: any) {
      console.error("Verification submission failed", e);
      try {
        const profile = await fetchVerificationProfile(user.id);
        if (["UPLOADED", "PENDING_REVIEW"].includes(profile.onboarding_status)) {
          setStatus(profile.onboarding_status);
          setStep(4);
          toast({ title: "Submission received", description: "Your verification is pending review." });
          return;
        }
      } catch (recoveryError) {
        console.error("Verification recovery check failed", recoveryError);
      }
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Poll server-owned profile status every 10 seconds while pending.
  useEffect(() => {
    if (step !== 4 || !user || !["UPLOADED", "PENDING_REVIEW"].includes(status ?? "NOT_STARTED")) return;
    const interval = setInterval(async () => {
      try {
        const profile = await fetchVerificationProfile(user.id);
        const dbStatus = normalizeVerificationStatus(profile.onboarding_status);
        setStatus(dbStatus);
        setRejectionReason(profile.rejection_reason ?? null);
        if (dbStatus === "VERIFIED") {
          console.info("Redirect to dashboard", { reason: "poll_detected_verified", requestId });
          clearInterval(interval);
          navigate("/dashboard", { replace: true });
        }
        if (dbStatus === "REJECTED") clearInterval(interval);
      } catch (error) {
        console.error("Verification polling failed", error);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [step, requestId, status, user, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37]/70">Onboarding</div>
            <h1 className="font-display text-3xl mt-2">Create Your Trading Workspace</h1>
          </div>
          <div className="font-mono-pro text-xs text-white/40">Step {step} of 4</div>
        </div>
        <StepStrip step={step} />

        {step === 1 && <Step1 onPick={pickTraderType} />}
        {step === 2 && traderType === "personal" && (
          <Step2Personal
            completed={completedChecks}
            setCompleted={setCompletedChecks}
            onNext={goToVerification}
          />
        )}
        {step === 2 && (traderType === "funded" || traderType === "prop") && (
          <Step2Trial
            traderType={traderType}
            trialStartedAt={trialStartedAt}
            onContinue={goToVerification}
          />
        )}
        {step === 3 && (
          <Step3Upload files={files} setFiles={setFiles} submitting={submitting} onSubmit={onSubmit} />
        )}
        {step === 4 && <Step4Status status={status} rejectionReason={rejectionReason} onRetry={() => setStep(3)} />}
      </div>
    </div>
  );
}

function StepStrip({ step }: { step: number }) {
  const items = ["Trader Type", "Broker / Trial", "Verification", "Status"];
  return (
    <div className="flex items-center gap-2 mb-10">
      {items.map((label, i) => {
        const n = i + 1;
        const active = n <= step;
        return (
          <div key={label} className="flex-1">
            <div className={`h-1 rounded-full ${active ? "bg-[#D4AF37]" : "bg-white/10"}`} />
            <div className={`mt-2 text-[10px] tracking-widest uppercase ${active ? "text-[#F4D03F]" : "text-white/40"}`}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function Step1({ onPick }: { onPick: (t: TraderType) => void }) {
  const opts: { key: TraderType; title: string; desc: string; icon: any }[] = [
    { key: "personal", title: "Personal Account", desc: "I trade with my own capital.", icon: Briefcase },
    { key: "funded", title: "Funded Account", desc: "I'm already trading a funded account.", icon: Award },
    { key: "prop", title: "Prop Firm Challenge", desc: "I'm passing a prop firm evaluation.", icon: Target },
  ];
  return (
    <div>
      <h2 className="font-display text-2xl mb-2">What type of trader are you?</h2>
      <p className="text-sm text-white/55 mb-8">This routes you to the right onboarding path.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {opts.map((o) => (
          <button key={o.key} onClick={() => onPick(o.key)} className="lux-glass lux-glass-hover rounded-2xl p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-4">
              <o.icon className="w-5 h-5 text-[#F4D03F]" />
            </div>
            <div className="font-display text-lg">{o.title}</div>
            <p className="text-sm text-white/55 mt-2">{o.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2Personal({ completed, setCompleted, onNext }: {
  completed: Record<string, boolean>;
  setCompleted: (v: Record<string, boolean>) => void;
  onNext: () => void;
}) {
  const allDone = personalSteps.every((s) => completed[s]);
  return (
    <div>
      <h2 className="font-display text-2xl mb-2">Open your trading account</h2>
      <p className="text-sm text-white/55 mb-6">Complete the steps below with our partner broker, then upload verification.</p>
      <Card className="lux-glass p-6 mb-6">
        <a href={STARTRADER_URL} target="_blank" rel="noopener noreferrer" className="btn-gold rounded-full px-6 py-3 inline-flex items-center gap-2 text-xs tracking-widest uppercase">
          Open STARTRADER Live Account <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <ul className="mt-6 space-y-3">
          {personalSteps.map((s) => (
            <li key={s} className="flex items-center gap-3">
              <button
                onClick={() => setCompleted({ ...completed, [s]: !completed[s] })}
                className={`w-5 h-5 rounded border flex items-center justify-center transition ${completed[s] ? "bg-[#D4AF37] border-[#D4AF37]" : "border-white/20"}`}
              >
                {completed[s] && <CheckCircle2 className="w-4 h-4 text-black" />}
              </button>
              <span className={completed[s] ? "text-white" : "text-white/60"}>{s}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Button disabled={!allDone} onClick={onNext} className="btn-gold rounded-full px-6 py-3 text-xs tracking-widest uppercase">
        I've completed all steps <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function Step2Trial({ traderType, trialStartedAt, onContinue }: {
  traderType: TraderType;
  trialStartedAt: string | null;
  onContinue: () => void;
}) {
  const trialEnd = trialStartedAt ? new Date(new Date(trialStartedAt).getTime() + 3 * 24 * 60 * 60 * 1000) : null;
  const remaining = trialEnd ? Math.max(0, trialEnd.getTime() - Date.now()) : 0;
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining / (60 * 60 * 1000)) % 24);
  return (
    <div>
      <Card className="lux-glass p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#F4D03F]" />
          <div>
            <div className="text-xs tracking-widest uppercase text-[#F4D03F]">3-Day Free Trial Active</div>
            <div className="text-sm text-white/60">Time remaining: <span className="font-mono-pro text-white">{days}d {hours}h</span></div>
          </div>
        </div>
        <span className="text-[10px] tracking-widest uppercase text-white/50">{traderType === "prop" ? "Prop Firm Challenge" : "Funded Account"}</span>
      </Card>

      <h2 className="font-display text-2xl mb-2">Choose your plan after the trial</h2>
      <p className="text-sm text-white/55 mb-6">Continue access to signals, AI coaching, analytics and the full Risk Suite.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <PricingCard title="Monthly" price="$75" period="/month" features={["All signals", "AI trade reviews", "Risk Suite", "Community access"]} />
        <PricingCard title="Lifetime" price="$475" period="one-time" features={["Everything monthly", "Lifetime updates", "Priority support", "Inner Circle access"]} highlight />
      </div>
      <Button onClick={onContinue} className="btn-gold rounded-full px-6 py-3 text-xs tracking-widest uppercase">
        Continue to Verification <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function PricingCard({ title, price, period, features, highlight }: { title: string; price: string; period: string; features: string[]; highlight?: boolean }) {
  return (
    <Card className={`lux-glass p-6 ${highlight ? "gold-border" : ""}`}>
      <div className="text-[10px] tracking-widest uppercase text-[#D4AF37]/70">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-4xl gold-text">{price}</span>
        <span className="text-xs text-white/50">{period}</span>
      </div>
      <ul className="mt-5 space-y-2 text-sm text-white/65">
        {features.map((f) => <li key={f} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#F4D03F]" /> {f}</li>)}
      </ul>
      <a href={VIP_WHATSAPP} target="_blank" rel="noopener noreferrer" className="mt-6 btn-onyx rounded-full px-5 py-2.5 text-xs tracking-widest uppercase inline-flex items-center gap-2">
        Upgrade <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </Card>
  );
}

function Step3Upload({ files, setFiles, submitting, onSubmit }: {
  files: Partial<Record<Slot, File>>;
  setFiles: (v: Partial<Record<Slot, File>>) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl mb-2">Verify your trading account</h2>
      <p className="text-sm text-white/55 mb-8">Upload 3 screenshots. AI will auto-verify within seconds.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {slotMeta.map((s) => (
          <Card key={s.key} className="lux-glass p-5">
            <div className="text-xs tracking-widest uppercase text-[#D4AF37]/80">{s.title}</div>
            <p className="text-xs text-white/45 mt-1 mb-3">{s.hint}</p>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFiles({ ...files, [s.key]: f });
              }} />
              <div className="h-32 rounded-xl border border-dashed border-[#D4AF37]/30 bg-black/30 flex items-center justify-center text-white/50 hover:border-[#D4AF37]/60 transition">
                {files[s.key] ? (
                  <span className="text-xs text-[#F4D03F] flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {files[s.key]!.name}</span>
                ) : (
                  <span className="flex items-center gap-2 text-xs"><Upload className="w-4 h-4" /> Upload</span>
                )}
              </div>
            </label>
          </Card>
        ))}
      </div>
      <Button onClick={onSubmit} disabled={submitting} className="btn-gold rounded-full px-6 py-3 text-xs tracking-widest uppercase">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
        Submit for Verification
      </Button>
    </div>
  );
}

function Step4Status({ status, rejectionReason, onRetry }: { status: VerificationStatus | null; rejectionReason?: string | null; onRetry: () => void }) {
  const navigate = useNavigate();
  const normalized = normalizeVerificationStatus(status);
  const isVerified = normalized === "VERIFIED";
  const isRejected = normalized === "REJECTED";
  return (
    <Card className="lux-glass p-10 text-center">
      {isVerified ? (
        <>
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl mb-2">Account Verified</h2>
          <p className="text-sm text-white/55 mb-8">You're in. Connect your trading account to unlock live signals and analytics.</p>
          <Button onClick={() => navigate("/account/trading-accounts")} className="btn-gold rounded-full px-6 py-3 text-xs tracking-widest uppercase">
            Connect Trading Account <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      ) : isRejected ? (
        <>
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mb-5">
            <AlertCircle className="w-8 h-8 text-red-300" />
          </div>
          <h2 className="font-display text-2xl mb-2">Verification Rejected</h2>
          <p className="text-sm text-white/55 mb-8">{rejectionReason || "Upload clearer screenshots showing your broker, live account number and platform."}</p>
          <Button onClick={onRetry} className="btn-gold rounded-full px-6 py-3 text-xs tracking-widest uppercase">
            Upload Again <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      ) : (
        <>
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mb-5">
            <Loader2 className="w-8 h-8 text-[#F4D03F] animate-spin" />
          </div>
          <h2 className="font-display text-2xl mb-2">Pending Verification</h2>
          <p className="text-sm text-white/55">Your status is checked automatically every 10 seconds.</p>
        </>
      )}
    </Card>
  );
}
