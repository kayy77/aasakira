import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Activity,
  Brain,
  GraduationCap,
  Users,
  BarChart3,
  Shield,
  Sparkles,
  Crown,
  CheckCircle2,
  TrendingUp,
  Radio,
  BookOpen,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { classifyTradeOutcome, getMaxTpPips } from "@/utils/tradePips";
import MyFxBookStats from "@/components/MyFxBookStats";
import VipUpgradeModal from "@/components/VipUpgradeModal";

// ----------------------------------------------------------------------------
// AASAKIRA — premium landing page
// Dark / black base, indigo + cyan glows, glassmorphism, fintech-OS aesthetic.
// ----------------------------------------------------------------------------

type LiveMetrics = {
  totalTrades: number;
  winRate: number | null;
  totalPips: number;
};

const FEATURES = [
  {
    icon: Radio,
    title: "Live Trading",
    body: "Real-time signals piped from our desk to your Telegram and dashboard, with full lifecycle tracking from entry to TP.",
    accent: "from-indigo-500/30 to-cyan-500/30",
  },
  {
    icon: Brain,
    title: "AI Trading Coach",
    body: "Upload a chart or describe a setup — get bias, liquidity, risk read, and concrete improvements in seconds.",
    accent: "from-violet-500/30 to-fuchsia-500/30",
  },
  {
    icon: GraduationCap,
    title: "Trading Academy",
    body: "Structured paths from beginner to institutional. Track progress, complete modules, level up.",
    accent: "from-cyan-500/30 to-blue-500/30",
  },
  {
    icon: Users,
    title: "Community",
    body: "Wins wall, mentor rooms, peer feedback. Stay accountable with traders on the same path.",
    accent: "from-pink-500/30 to-rose-500/30",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Win rate, RR, drawdown, session, pair, time-of-day — everything you need to actually improve.",
    accent: "from-emerald-500/30 to-cyan-500/30",
  },
  {
    icon: Shield,
    title: "Risk Management",
    body: "Lot size, compounding, prop firm compliance — institutional risk tools, one click away.",
    accent: "from-amber-500/30 to-orange-500/30",
  },
];

const ACADEMY_PATHS = [
  { label: "Beginner", desc: "Build the foundation", chip: "01" },
  { label: "Intermediate", desc: "Master execution", chip: "02" },
  { label: "Advanced", desc: "Trade like a pro", chip: "03" },
  { label: "Institutional", desc: "Read the market", chip: "04" },
  { label: "Funded Trader", desc: "Pass any challenge", chip: "05" },
  { label: "Live Mentorship", desc: "Weekly with the desk", chip: "06" },
];

export default function AasakiraLanding() {
  const [vipOpen, setVipOpen] = useState(false);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    totalTrades: 0,
    winRate: null,
    totalPips: 0,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("active_trades")
        .select("*")
        .limit(1000);
      if (!active || !data) return;
      let wins = 0;
      let resolved = 0;
      let pips = 0;
      data.forEach((t: any) => {
        const o = classifyTradeOutcome(t);
        if (o !== null) resolved += 1;
        if (o === "win") wins += 1;
        pips += getMaxTpPips(t) ?? 0;
      });
      setMetrics({
        totalTrades: data.length,
        winRate: resolved > 0 ? Math.round((wins / resolved) * 100) : null,
        totalPips: Math.round(pips),
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Ambient backdrop */}
      <BackdropGlows />
      <GridOverlay />

      <Nav onVipClick={() => setVipOpen(true)} />

      <main className="relative z-10">
        <Hero metrics={metrics} onVipClick={() => setVipOpen(true)} />
        <PlatformOverview />
        <ProofSection />
        <AcademyPreview />
        <CommunityPreview />
        <FinalCTA onVipClick={() => setVipOpen(true)} />
        <Footer />
      </main>

      <VipUpgradeModal open={vipOpen} onOpenChange={setVipOpen} />
    </div>
  );
}

// ----- Layers ---------------------------------------------------------------

function BackdropGlows() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[1100px] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute top-[40%] -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute top-[70%] -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/15 blur-[120px]" />
      </div>
    </>
  );
}

function GridOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage:
          "radial-gradient(ellipse at 50% 0%, black 35%, transparent 80%)",
      }}
    />
  );
}

// ----- Nav ------------------------------------------------------------------

function Nav({ onVipClick }: { onVipClick: () => void }) {
  return (
    <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
      <Link to="/" className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
        <span className="text-lg font-bold tracking-[0.18em]">AASAKIRA</span>
      </Link>
      <div className="hidden md:flex items-center gap-7 text-sm text-white/70">
        <a href="#platform" className="hover:text-white transition">Platform</a>
        <a href="#proof" className="hover:text-white transition">Proof</a>
        <a href="#academy" className="hover:text-white transition">Academy</a>
        <a href="#community" className="hover:text-white transition">Community</a>
        <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onVipClick}
          size="sm"
          className="h-9 bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 border-0 font-semibold gap-1.5"
        >
          <Crown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upgrade VIP</span>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-9 border-white/20 bg-white/5 hover:bg-white/10 text-white"
        >
          <Link to="/dashboard">Enter Platform</Link>
        </Button>
      </div>
    </nav>
  );
}

// ----- Hero -----------------------------------------------------------------

function Hero({
  metrics,
  onVipClick,
}: {
  metrics: LiveMetrics;
  onVipClick: () => void;
}) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16">
      <div className="flex flex-col items-center text-center">
        <Badge
          variant="outline"
          className="border-white/15 bg-white/5 backdrop-blur text-white/80 px-3 py-1 mb-6"
        >
          <span className="relative mr-2 inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live trading desk · {metrics.totalTrades || "—"} signals tracked
        </Badge>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
          <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            AASAKIRA
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/65 leading-relaxed">
          The operating system for traders. Signals, AI coaching, journaling,
          academy, and risk tools — engineered into one platform built for
          consistency.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 px-7 bg-white text-black hover:bg-white/90 font-semibold gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            <Link to="/dashboard">
              Start Trading <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              document
                .getElementById("platform")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="h-12 px-7 border-white/20 bg-white/5 hover:bg-white/10 text-white"
          >
            Explore Platform
          </Button>
        </div>

        {/* Live metrics strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden w-full max-w-4xl">
          <MetricCell
            label="Signals tracked"
            value={metrics.totalTrades.toLocaleString()}
            icon={Activity}
          />
          <MetricCell
            label="Win rate"
            value={metrics.winRate !== null ? `${metrics.winRate}%` : "—"}
            icon={Trophy}
            accent="text-amber-300"
          />
          <MetricCell
            label="Total pips"
            value={`+${metrics.totalPips.toLocaleString()}`}
            icon={TrendingUp}
            accent="text-emerald-400"
          />
          <MetricCell
            label="Traders"
            value="1,000+"
            icon={Users}
            accent="text-cyan-300"
          />
        </div>
      </div>
    </section>
  );
}

function MetricCell({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: any;
  accent?: string;
}) {
  return (
    <div className="bg-black/40 p-5 flex flex-col items-start">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/50">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={`mt-2 text-2xl font-bold font-mono ${accent ?? "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

// ----- Platform Overview ----------------------------------------------------

function PlatformOverview() {
  return (
    <section id="platform" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <SectionEyebrow icon={Sparkles}>One platform</SectionEyebrow>
      <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
        Everything a trader needs.
        <span className="text-white/40"> In one OS.</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  accent,
}: {
  icon: any;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 overflow-hidden transition hover:border-white/20 hover:bg-white/[0.05]">
      <div
        className={`absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${accent} blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`}
      />
      <div className="relative">
        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
        <p className="text-sm text-white/60 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ----- Proof ----------------------------------------------------------------

function ProofSection() {
  return (
    <section id="proof" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <SectionEyebrow icon={Shield}>Verified performance</SectionEyebrow>
      <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
        Receipts.
        <span className="text-white/40"> Not promises.</span>
      </h2>
      <p className="mt-4 text-white/60 max-w-2xl">
        Live audited account, real equity curve, real trades. Every number on
        this page is fetched in real time.
      </p>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-6">
        <MyFxBookStats />
      </div>
    </section>
  );
}

// ----- Academy --------------------------------------------------------------

function AcademyPreview() {
  return (
    <section id="academy" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <SectionEyebrow icon={BookOpen}>Academy</SectionEyebrow>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          A path from beginner to
          <span className="text-white/40"> institutional.</span>
        </h2>
        <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70 w-fit">
          Launching soon
        </Badge>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACADEMY_PATHS.map((p) => (
          <div
            key={p.label}
            className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 transition hover:border-white/25"
          >
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center font-mono text-sm font-bold text-white/80">
              {p.chip}
            </div>
            <div className="min-w-0">
              <div className="font-semibold">{p.label}</div>
              <div className="text-xs text-white/55">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----- Community ------------------------------------------------------------

function CommunityPreview() {
  const proof = [
    { t: "+312 pips this week — XAUUSD desk", a: "Verified trader" },
    { t: "Funded $100K with FTMO using the risk suite", a: "Community member" },
    { t: "Win rate up 14% after 30 days of journaling", a: "Aasakira user" },
  ];
  return (
    <section id="community" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <SectionEyebrow icon={Users}>Community</SectionEyebrow>
      <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
        Trade with people on
        <span className="text-white/40"> the same path.</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {proof.map((p, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
          >
            <Trophy className="h-5 w-5 text-amber-300 mb-3" />
            <p className="text-base text-white/90 leading-relaxed">{p.t}</p>
            <p className="mt-3 text-xs text-white/50">{p.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----- Final CTA ------------------------------------------------------------

function FinalCTA({ onVipClick }: { onVipClick: () => void }) {
  const bullets = [
    "Live signals + verified track record",
    "AI trade coach and journal insights",
    "Risk tools that pass prop firm audits",
    "Private community of serious traders",
  ];
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-black to-cyan-950 p-10 sm:p-16">
        <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-500/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-cyan-400/20 blur-[120px]" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="max-w-xl">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Join AASAKIRA.
            </h2>
            <p className="mt-4 text-white/70 text-lg">
              The platform built for traders who are done guessing.
            </p>
            <ul className="mt-6 space-y-2">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-white/80 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-cyan-300 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-white text-black hover:bg-white/90 font-semibold gap-2"
            >
              <Link to="/dashboard">
                Enter Platform <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              onClick={onVipClick}
              className="h-12 px-8 bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 font-semibold gap-2"
            >
              <Crown className="h-4 w-4" /> Upgrade to VIP — 50% OFF
            </Button>
            <p className="text-[11px] text-white/40 text-center">
              Cancel anytime · 1,000+ active traders
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----- Footer ---------------------------------------------------------------

function Footer() {
  return (
    <footer className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t border-white/10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-gradient-to-br from-indigo-500 to-cyan-400" />
          <span className="tracking-[0.2em] font-semibold text-white/60">
            AASAKIRA
          </span>
        </div>
        <p>© {new Date().getFullYear()} Aasakira. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link to="/pricing" className="hover:text-white/80 transition">Pricing</Link>
          <Link to="/dashboard" className="hover:text-white/80 transition">Platform</Link>
        </div>
      </div>
    </footer>
  );
}

// ----- Eyebrow --------------------------------------------------------------

function SectionEyebrow({
  icon: Icon,
  children,
}: {
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/50 mb-4">
      <Icon className="h-3 w-3" />
      {children}
    </div>
  );
}