import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";

type Step = "method" | "instructions" | "form" | "syncing" | "done";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(255),
  system_name: z.string().trim().min(1).max(120),
});

export default function ConnectTradingAccountFlow({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("method");
  const [form, setForm] = useState({ email: "", password: "", system_name: "" });
  const [progress, setProgress] = useState<{ label: string; ok?: boolean }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Check your details", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setStep("syncing");
    setSubmitting(true);
    setProgress([{ label: "Locating account" }]);

    try {
      const { data, error } = await supabase.functions.invoke("trading-account-connect", {
        body: parsed.data,
      });
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Could not connect");
      }

      setProgress([
        { label: "Account found", ok: true },
        { label: "Trade history available", ok: true },
        { label: "Sync complete", ok: true },
      ]);
      setStep("done");
    } catch (err: any) {
      toast({
        title: "Couldn't connect",
        description: err?.message || "Verify your credentials and try again.",
        variant: "destructive",
      });
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-xs tracking-widest uppercase text-white/50 hover:text-[#F4D03F] mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <StepDots step={step} />

      {step === "method" && (
        <MethodStep onPick={() => setStep("instructions")} />
      )}
      {step === "instructions" && (
        <InstructionsStep
          onBack={() => setStep("method")}
          onNext={() => setStep("form")}
        />
      )}
      {step === "form" && (
        <FormStep
          form={form}
          setForm={setForm}
          onBack={() => setStep("instructions")}
          onSubmit={submit}
          submitting={submitting}
        />
      )}
      {step === "syncing" && <SyncingStep progress={progress} />}
      {step === "done" && (
        <DoneStep onContinue={onComplete} />
      )}
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["method", "instructions", "form", "syncing", "done"];
  const idx = order.indexOf(step);
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {order.map((s, i) => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all ${
            i <= idx ? "bg-[#D4AF37] w-8" : "bg-white/15 w-4"
          }`}
        />
      ))}
    </div>
  );
}

function MethodStep({ onPick }: { onPick: () => void }) {
  const options = [
    { name: "Myfxbook", recommended: true, available: true, desc: "Best for MT4/MT5 accounts. Verified, read-only." },
    { name: "MT5 Direct", available: false },
    { name: "MT4 Direct", available: false },
    { name: "cTrader", available: false },
    { name: "TradeLocker", available: false },
  ];
  return (
    <Card className="lux-glass border-[#D4AF37]/15">
      <CardContent className="p-7">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">
          How would you like to connect your account?
        </h2>
        <p className="text-sm text-white/55 mb-6">
          AASAKIRA reads your trading history — never executes trades.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((o) => (
            <button
              key={o.name}
              disabled={!o.available}
              onClick={onPick}
              className={`text-left rounded-xl border px-4 py-4 transition-all ${
                o.available
                  ? "border-[#D4AF37]/30 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 bg-white/[0.02]"
                  : "border-white/10 bg-white/[0.01] opacity-55 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-display font-semibold text-white">{o.name}</div>
                {o.recommended && (
                  <Badge className="bg-[#D4AF37]/20 text-[#F4D03F] border-[#D4AF37]/40 text-[9px] tracking-widest">
                    Recommended
                  </Badge>
                )}
                {!o.available && (
                  <Badge variant="outline" className="border-white/15 text-white/45 text-[9px] tracking-widest">
                    Coming soon
                  </Badge>
                )}
              </div>
              {o.desc && <p className="text-xs text-white/55 mt-2">{o.desc}</p>}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InstructionsStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <Card className="lux-glass border-[#D4AF37]/15">
      <CardContent className="p-7">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">
          Connect via <span className="gold-text">Myfxbook</span>
        </h2>
        <p className="text-sm text-white/55 mb-6">
          A one-time setup. Takes about 5 minutes.
        </p>

        <ol className="space-y-3 mb-6">
          {[
            "Create or sign in to your Myfxbook account at myfxbook.com",
            "Connect your MT4 or MT5 trading account inside Myfxbook",
            "Allow Myfxbook to sync your trading history (usually a few minutes)",
            "Return to AASAKIRA and enter your Myfxbook details below",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="h-6 w-6 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F4D03F] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-white/75 leading-relaxed">{t}</span>
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-4 py-4 mb-6">
          <div className="text-[10px] tracking-[0.28em] uppercase text-[#D4AF37] mb-2 flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> What happens after connecting
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-white/75">
            {["Win Rate", "Drawdown", "Risk Management", "Trading Consistency", "Performance Trends", "Trading Psychology Patterns"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder for screenshots/video */}
        <div className="rounded-xl border border-dashed border-white/10 bg-black/30 p-6 text-center text-xs text-white/40 mb-6">
          [ Tutorial video & screenshots coming soon ]
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack} className="text-white/60 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
          </Button>
          <Button onClick={onNext} className="btn-gold">
            Continue <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FormStep({
  form,
  setForm,
  onBack,
  onSubmit,
  submitting,
}: {
  form: { email: string; password: string; system_name: string };
  setForm: (f: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <Card className="lux-glass border-[#D4AF37]/15">
      <CardContent className="p-7">
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">
          Sync your trading account
        </h2>
        <p className="text-sm text-white/55 mb-6">
          Your credentials are used once to authorize the sync and are not stored on AASAKIRA.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-white/60">Myfxbook email</Label>
            <Input
              type="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-black/40 border-white/10 focus-visible:border-[#D4AF37]/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-white/60">Myfxbook password</Label>
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-black/40 border-white/10 focus-visible:border-[#D4AF37]/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wider uppercase text-white/60">System name (account label in Myfxbook)</Label>
            <Input
              required
              value={form.system_name}
              onChange={(e) => setForm({ ...form, system_name: e.target.value })}
              placeholder="e.g. My Live FTMO"
              className="bg-black/40 border-white/10 focus-visible:border-[#D4AF37]/50"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-white/50 pt-1">
            <Lock className="h-3 w-3" /> Sent over HTTPS · used once · never written to the database
          </div>

          <div className="flex justify-between pt-3">
            <Button type="button" variant="ghost" onClick={onBack} className="text-white/60">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
            </Button>
            <Button type="submit" disabled={submitting} className="btn-gold">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>Sync my trading account <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SyncingStep({ progress }: { progress: { label: string; ok?: boolean }[] }) {
  return (
    <Card className="lux-glass border-[#D4AF37]/15">
      <CardContent className="p-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37] mx-auto mb-5" />
        <h2 className="font-display text-xl font-bold tracking-tight mb-1">Importing your trading data</h2>
        <p className="text-sm text-white/55 mb-7">Hang tight — this usually takes 10–30 seconds.</p>
        <div className="max-w-xs mx-auto space-y-2">
          {progress.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/75 justify-center">
              {p.ok ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
              )}
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DoneStep({ onContinue }: { onContinue: () => void }) {
  return (
    <Card className="lux-glass border-[#D4AF37]/20">
      <CardContent className="p-10 text-center">
        <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
          You're <span className="gold-text">connected</span>
        </h2>
        <p className="text-sm text-white/60 mb-7 max-w-sm mx-auto">
          Your dashboard is now populated with your real trading data. Insights will refresh automatically.
        </p>
        <Button onClick={onContinue} className="btn-gold h-11 px-6 tracking-widest uppercase text-xs">
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}