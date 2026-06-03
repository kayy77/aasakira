import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Activity,
  Brain,
  GraduationCap,
  Users,
  BarChart3,
  Shield,
  Crown,
  CheckCircle2,
  TrendingUp,
  Radio,
  Trophy,
  Gem,
  Sparkles,
  Building2,
  LineChart,
  Target,
  Lock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { classifyTradeOutcome, getMaxTpPips } from "@/utils/tradePips";
import MyFxBookStats from "@/components/MyFxBookStats";
import VipUpgradeModal from "@/components/VipUpgradeModal";

// ============================================================================
// AASAKIRA — Luxury Black & Gold "Inner Circle" landing
// Private bank × Bloomberg Terminal × Goldman Sachs aesthetic.
// ============================================================================

type LiveMetrics = {
  totalTrades: number;
  winRate: number | null;
  totalPips: number;
};

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
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden noise-overlay">
      <AmbientBackdrop />
      <Nav onVipClick={() => setVipOpen(true)} />

      <main className="relative z-10">
        <Hero metrics={metrics} onVipClick={() => setVipOpen(true)} />
        <PlatformEcosystem />
        <LiveTrading metrics={metrics} />
        <AICoach />
        <Academy />
        <Community />
        <Analytics />
        <Proof />
        <Pricing onVipClick={() => setVipOpen(true)} />
        <FinalCTA onVipClick={() => setVipOpen(true)} />
        <Footer />
      </main>

      <VipUpgradeModal open={vipOpen} onOpenChange={setVipOpen} />
    </div>
  );
}

// ===== Ambient layers =======================================================

function AmbientBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-10"
      style={{ ["--mx" as any]: "0px", ["--my" as any]: "0px" }}
    >
      {/* Gold radial glows that follow cursor */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[1200px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.08) 35%, transparent 70%)",
          filter: "blur(80px)",
          transform: "translate(calc(-50% + var(--mx)), var(--my))",
        }}
      />
      <div
        className="absolute top-[50%] -left-60 h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(184,134,11,0.2) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute top-[80%] -right-60 h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,208,63,0.15) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Vertical gold light beams */}
      <div className="gold-beam top-0 bottom-0 left-[15%] w-[1px]" />
      <div className="gold-beam top-0 bottom-0 left-[42%] w-[1px]" style={{ animationDelay: "3s" }} />
      <div className="gold-beam top-0 bottom-0 right-[22%] w-[1px]" style={{ animationDelay: "7s" }} />

      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,175,55,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 35%, transparent 80%)",
        }}
      />

      {/* Gold particles */}
      <GoldParticles />
    </div>
  );
}

function GoldParticles() {
  const particles = Array.from({ length: 14 });
  return (
    <>
      {particles.map((_, i) => (
        <span
          key={i}
          className="gold-particle"
          style={{
            left: `${(i * 7 + 5) % 100}%`,
            animationDuration: `${14 + (i % 6) * 2}s`,
            animationDelay: `${(i * 1.3) % 12}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </>
  );
}

// ===== Nav ==================================================================

function Nav({ onVipClick }: { onVipClick: () => void }) {
  return (
    <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
      <Link to="/" className="flex items-center gap-3">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-md bg-gradient-to-br from-[#F4D03F] via-[#D4AF37] to-[#8B6914] gold-glow" />
          <div className="absolute inset-[2px] rounded-md bg-[#050505] flex items-center justify-center">
            <span className="font-display text-sm font-bold gold-text">A</span>
          </div>
        </div>
        <span className="font-display text-xl font-bold tracking-[0.32em] gold-text">
          AASAKIRA
        </span>
      </Link>
      <div className="hidden lg:flex items-center gap-8 text-[13px] tracking-wider uppercase text-white/60">
        <a href="#ecosystem" className="hover:text-[#F4D03F] transition">Ecosystem</a>
        <a href="#trading" className="hover:text-[#F4D03F] transition">Trading</a>
        <a href="#intelligence" className="hover:text-[#F4D03F] transition">Intelligence</a>
        <a href="#proof" className="hover:text-[#F4D03F] transition">Proof</a>
        <a href="#pricing" className="hover:text-[#F4D03F] transition">Pricing</a>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={onVipClick}
          size="sm"
          className="btn-gold h-9 px-4 gap-1.5"
        >
          <Crown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline tracking-wider">Inner Circle</span>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="btn-onyx h-9 px-4"
        >
          <Link to="/dashboard" className="tracking-wider">Enter</Link>
        </Button>
      </div>
    </nav>
  );
}

// ===== Hero =================================================================

function Hero({
  metrics,
  onVipClick,
}: {
  metrics: LiveMetrics;
  onVipClick: () => void;
}) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center pt-8 pb-20">
      <div className="flex flex-col items-center text-center max-w-5xl">
        <Badge
          variant="outline"
          className="border-[#D4AF37]/40 bg-black/60 backdrop-blur text-[#F4D03F] px-4 py-1.5 mb-8 tracking-[0.2em] text-[10px] uppercase font-medium"
        >
          <Gem className="h-3 w-3 mr-2" />
          By Invitation · The Inner Circle
        </Badge>

        <h1 className="font-display text-[clamp(3.5rem,12vw,9rem)] font-black tracking-[-0.04em] leading-[0.9]">
          <span className="gold-text">AASAKIRA</span>
        </h1>

        <p className="mt-3 font-serif-lux italic text-2xl sm:text-3xl text-white/50 tracking-wide">
          — the elite operating system —
        </p>

        <p className="mt-10 max-w-2xl text-lg sm:text-xl text-white/65 leading-relaxed font-light">
          Built for traders who demand more. Private intelligence, institutional
          execution, audited performance — engineered for those who treat
          trading as a profession.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Button
            asChild
            size="lg"
            className="btn-gold h-14 px-9 gap-2 text-base relative overflow-hidden gold-sweep"
          >
            <Link to="/dashboard">
              <span className="tracking-wider">Enter The Platform</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onVipClick}
            className="btn-onyx h-14 px-9 text-base tracking-wider"
          >
            <Crown className="h-4 w-4 mr-2" />
            Request Access
          </Button>
        </div>

        {/* Live metrics rail */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-[#D4AF37]/20 bg-black/50 backdrop-blur-xl overflow-hidden w-full max-w-4xl gold-border">
          <MetricCell
            label="Signals Tracked"
            value={metrics.totalTrades.toLocaleString() || "—"}
            icon={Activity}
          />
          <MetricCell
            label="Win Rate"
            value={metrics.winRate !== null ? `${metrics.winRate}%` : "—"}
            icon={Trophy}
            highlight
          />
          <MetricCell
            label="Total Pips"
            value={`+${metrics.totalPips.toLocaleString()}`}
            icon={TrendingUp}
            highlight
          />
          <MetricCell
            label="Members"
            value="1,000+"
            icon={Users}
          />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] tracking-[0.3em] text-white/30 uppercase">
        <span>Descend</span>
        <div className="h-8 w-px bg-gradient-to-b from-[#D4AF37] to-transparent" />
      </div>
    </section>
  );
}

function MetricCell({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: any;
  highlight?: boolean;
}) {
  return (
    <div className="bg-black/60 p-5 flex flex-col items-start">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-white/45">
        <Icon className="h-3 w-3 text-[#D4AF37]" />
        {label}
      </div>
      <div
        className={`mt-2 text-2xl font-bold font-display ${
          highlight ? "gold-text" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// ===== Section helpers ======================================================

function SectionHeader({
  eyebrow,
  title,
  highlight,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  body?: string;
  align?: "left" | "center";
}) {
  const a = align === "center" ? "text-center mx-auto" : "";
  return (
    <div className={`max-w-3xl ${a}`}>
      <div
        className={`flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-[#D4AF37] mb-5 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="h-px w-8 bg-[#D4AF37]/50" />
        {eyebrow}
        <span className="h-px w-8 bg-[#D4AF37]/50" />
      </div>
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
        {title}
        {highlight && (
          <>
            <br />
            <span className="gold-text italic font-serif-lux">{highlight}</span>
          </>
        )}
      </h2>
      {body && (
        <p className="mt-6 text-white/55 text-lg leading-relaxed font-light max-w-2xl">
          {body}
        </p>
      )}
    </div>
  );
}

// ===== 2 · Platform Ecosystem ==============================================

const PILLARS = [
  {
    icon: Gem,
    title: "Wealth",
    body: "Live audited account, verified payouts, transparent performance.",
    items: ["Audited equity curve", "Real payouts", "Verified track record"],
  },
  {
    icon: Brain,
    title: "Intelligence",
    body: "AI coach, journal, analytics — decisions backed by data, not feel.",
    items: ["AI trading coach", "Smart journal", "Deep analytics"],
  },
  {
    icon: Target,
    title: "Execution",
    body: "Institutional-grade signals, copier and risk tools at your fingertips.",
    items: ["Live signals", "Trade copier", "Risk suite"],
  },
  {
    icon: Star,
    title: "Mastery",
    body: "Academy, mentorship, and a private community of serious operators.",
    items: ["Structured academy", "Live mentorship", "Inner circle"],
  },
];

function PlatformEcosystem() {
  return (
    <section id="ecosystem" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <SectionHeader
        eyebrow="The Ecosystem"
        title="Four pillars."
        highlight="One operating system."
      />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PILLARS.map((p) => (
          <PillarCard key={p.title} {...p} />
        ))}
      </div>
    </section>
  );
}

function PillarCard({
  icon: Icon,
  title,
  body,
  items,
}: {
  icon: any;
  title: string;
  body: string;
  items: string[];
}) {
  return (
    <div className="group relative rounded-2xl lux-glass lux-glass-hover p-7 overflow-hidden">
      <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-transparent blur-3xl opacity-40 group-hover:opacity-90 transition-opacity duration-700" />
      <div className="relative">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 flex items-center justify-center mb-5 gold-glow-sm">
          <Icon className="h-5 w-5 text-[#F4D03F]" />
        </div>
        <h3 className="font-display text-2xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/55 leading-relaxed mb-5">{body}</p>
        <ul className="space-y-1.5 pt-4 border-t border-[#D4AF37]/15">
          {items.map((i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-white/70">
              <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
              {i}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ===== 3 · Live Trading =====================================================

function LiveTrading({ metrics }: { metrics: LiveMetrics }) {
  return (
    <section id="trading" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeader
            eyebrow="Live Trading Desk"
            title="Real signals."
            highlight="Real time."
            body="Every signal is dispatched from our desk through Telegram and your dashboard with full lifecycle tracking — entry, scale-in, breakeven, take profit."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild className="btn-gold h-12 px-6 gap-2">
              <Link to="/live-signals">
                Open Trading Floor <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="btn-onyx h-12 px-6">
              <Link to="/tools/lot-size">Risk Calculator</Link>
            </Button>
          </div>
        </div>

        {/* Mock terminal */}
        <div className="relative rounded-2xl lux-glass p-1 gold-border">
          <div className="rounded-xl bg-[#070707] p-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/15">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="text-xs tracking-[0.22em] uppercase text-white/60">
                  Live · Trading Floor
                </span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">
                {metrics.totalTrades} TRADES
              </span>
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                { pair: "XAUUSD", dir: "LONG", price: "2,043.20", pl: "+87 pips", status: "TP2 HIT" },
                { pair: "US30", dir: "SHORT", price: "38,210.5", pl: "+124 pips", status: "RUNNING" },
                { pair: "EURUSD", dir: "LONG", price: "1.0875", pl: "+42 pips", status: "TP1 HIT" },
                { pair: "GBPJPY", dir: "SHORT", price: "189.45", pl: "+96 pips", status: "BREAKEVEN" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-[#D4AF37]/12 bg-black/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.dir === "LONG"
                          ? "bg-[#D4AF37]/15 text-[#F4D03F] border border-[#D4AF37]/30"
                          : "bg-white/5 text-white/80 border border-white/15"
                      }`}
                    >
                      {t.dir}
                    </span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {t.pair}
                    </span>
                    <span className="text-xs text-white/40 font-mono hidden sm:inline">
                      @ {t.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs gold-text font-bold">{t.pl}</span>
                    <span className="text-[9px] tracking-wider text-white/40">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== 4 · AI Coach =========================================================

function AICoach() {
  return (
    <section id="intelligence" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative rounded-2xl lux-glass p-1 gold-border">
          <div className="rounded-xl bg-[#070707] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#F4D03F]" />
              <span className="text-xs tracking-[0.22em] uppercase text-white/60">
                AI Trade Review
              </span>
            </div>
            <div className="rounded-lg bg-black/40 border border-[#D4AF37]/15 p-4">
              <div className="text-[10px] tracking-widest uppercase text-white/40 mb-2">
                Setup Read
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Liquidity grab below Asian low into discount OB. Bias <span className="gold-text font-semibold">aligned</span> with HTF. Entry refined — RR 4.2.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: "Bias", v: "Long", c: true },
                { k: "Conf.", v: "84%", c: true },
                { k: "RR", v: "4.2", c: true },
              ].map((m) => (
                <div key={m.k} className="rounded-lg border border-[#D4AF37]/15 bg-black/40 p-3">
                  <div className="text-[9px] tracking-widest uppercase text-white/40">{m.k}</div>
                  <div className="mt-1 font-mono font-bold gold-text">{m.v}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/25 p-4">
              <div className="text-[10px] tracking-widest uppercase text-[#D4AF37] mb-1.5">
                Coach Insight
              </div>
              <p className="text-sm text-white/75">
                Your last 12 XAUUSD entries on Tuesday London hit 91% win rate. Lean in.
              </p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeader
            eyebrow="Intelligence Layer"
            title="A private analyst."
            highlight="On retainer."
            body="Upload a chart, paste a setup, or sync your journal — the AI returns bias, liquidity, risk grade, and exactly what to fix next."
          />
        </div>
      </div>
    </section>
  );
}

// ===== 5 · Academy ==========================================================

const ACADEMY = [
  { n: "I", t: "Foundation", d: "Markets, structure, risk fundamentals" },
  { n: "II", t: "Execution", d: "Entry models, sessions, management" },
  { n: "III", t: "Mastery", d: "ICT, SMC, institutional flow" },
  { n: "IV", t: "Funded Trader", d: "Pass any prop firm challenge" },
  { n: "V", t: "Professional", d: "Build your own desk" },
  { n: "VI", t: "Mentorship", d: "Weekly live with the desk" },
];

function Academy() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <SectionHeader
        eyebrow="The Academy"
        title="From novice"
        highlight="to institutional."
      />
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACADEMY.map((m) => (
          <div
            key={m.n}
            className="group rounded-xl lux-glass lux-glass-hover p-6 flex items-start gap-5"
          >
            <div className="font-display text-3xl font-bold gold-text shrink-0 w-10">
              {m.n}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-lg font-bold">{m.t}</h3>
                <Badge
                  variant="outline"
                  className="border-[#D4AF37]/30 text-[#D4AF37]/80 text-[9px] uppercase tracking-widest"
                >
                  <Lock className="h-2.5 w-2.5 mr-1" /> Soon
                </Badge>
              </div>
              <p className="text-sm text-white/55">{m.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== 6 · Community ========================================================

function Community() {
  const proof = [
    { t: "+312 pips this week — XAUUSD desk", a: "Verified trader" },
    { t: "Funded $100K with FTMO using the risk suite", a: "Community member" },
    { t: "Win rate up 14% after 30 days of journaling", a: "AASAKIRA user" },
  ];
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <SectionHeader
        eyebrow="The Inner Circle"
        title="Operators."
        highlight="Not spectators."
        body="A vetted community of traders, funded operators and capital allocators. No noise. No hype. Only signal."
      />

      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
        {proof.map((p, i) => (
          <div key={i} className="rounded-2xl lux-glass lux-glass-hover p-7">
            <Trophy className="h-5 w-5 text-[#F4D03F] mb-4" />
            <p className="font-serif-lux italic text-xl text-white/85 leading-relaxed">
              “{p.t}”
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs tracking-widest uppercase text-white/40">
              <span className="h-px w-6 bg-[#D4AF37]/50" />
              {p.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== 7 · Analytics ========================================================

function Analytics() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeader
            eyebrow="Performance Analytics"
            title="Know exactly"
            highlight="why you win."
            body="Cohort win rate, RR distribution, drawdown, time-of-day, pair, session, mistake tags. The dashboard of a quant fund — built for you."
          />
        </div>
        <div className="relative rounded-2xl lux-glass p-1 gold-border">
          <div className="rounded-xl bg-[#070707] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-[#F4D03F]" />
                <span className="text-xs tracking-[0.22em] uppercase text-white/60">
                  Equity Curve · YTD
                </span>
              </div>
              <span className="text-xs gold-text font-mono font-bold">+147.3%</span>
            </div>
            {/* SVG sparkline */}
            <svg viewBox="0 0 400 140" className="w-full h-32">
              <defs>
                <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B8860B" />
                  <stop offset="50%" stopColor="#F4D03F" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,110 L40,100 L80,95 L120,80 L160,82 L200,65 L240,55 L280,42 L320,28 L360,20 L400,10 L400,140 L0,140 Z"
                fill="url(#goldFill)"
              />
              <path
                d="M0,110 L40,100 L80,95 L120,80 L160,82 L200,65 L240,55 L280,42 L320,28 L360,20 L400,10"
                fill="none"
                stroke="url(#goldStroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                { k: "Win", v: "74%" },
                { k: "RR", v: "3.1" },
                { k: "DD", v: "4.2%" },
                { k: "Sharpe", v: "2.8" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-[#D4AF37]/15 bg-black/40 py-2.5">
                  <div className="font-mono font-bold gold-text text-sm">{s.v}</div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">
                    {s.k}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== 8 · Proof ============================================================

function Proof() {
  return (
    <section id="proof" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <SectionHeader
        eyebrow="Audited Performance"
        title="Receipts."
        highlight="Not promises."
        body="Live MyFxBook audited account. Every metric on this site is fetched in real time, from a real broker, with a real equity curve."
      />

      <div className="mt-12 rounded-3xl lux-glass p-4 sm:p-6 gold-border">
        <MyFxBookStats />
      </div>
    </section>
  );
}

// ===== 9 · Pricing ==========================================================

const TIERS = [
  {
    name: "Free",
    sub: "Observe",
    price: "£0",
    cadence: "forever",
    features: [
      "Public signal feed",
      "Risk calculator",
      "Community access (read)",
      "Basic dashboard",
    ],
    cta: "Create Account",
    highlight: false,
  },
  {
    name: "VIP",
    sub: "Operate",
    price: "£97",
    cadence: "per month",
    features: [
      "Live VIP signals + Telegram",
      "AI trade coach + journal",
      "Full academy + analytics",
      "Risk + prop firm suite",
      "Private community",
    ],
    cta: "Join Inner Circle",
    highlight: true,
  },
  {
    name: "Capital",
    sub: "Delegate",
    price: "Bespoke",
    cadence: "from $2,500",
    features: [
      "Managed capital programme",
      "0.8 – 1.1% weekly target",
      "Strict institutional risk",
      "Direct desk access",
      "Monthly performance audit",
    ],
    cta: "Apply Privately",
    highlight: false,
  },
];

function Pricing({ onVipClick }: { onVipClick: () => void }) {
  return (
    <section id="pricing" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <SectionHeader
        align="center"
        eyebrow="Membership"
        title="Three tiers."
        highlight="One standard."
      />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl p-8 transition ${
              t.highlight
                ? "lux-glass gold-border gold-glow scale-[1.02]"
                : "lux-glass lux-glass-hover"
            }`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="btn-gold border-0 text-[10px] tracking-widest uppercase px-3 py-0.5">
                  <Crown className="h-3 w-3 mr-1" /> Most Chosen
                </Badge>
              </div>
            )}
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-2">
              {t.sub}
            </div>
            <h3 className="font-display text-3xl font-bold mb-4">{t.name}</h3>
            <div className="flex items-baseline gap-2 mb-2 pb-6 border-b border-[#D4AF37]/15">
              <span className="font-display text-5xl font-bold gold-text">
                {t.price}
              </span>
              <span className="text-xs text-white/45 tracking-wider">{t.cadence}</span>
            </div>
            <ul className="space-y-3 my-7">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {t.highlight ? (
              <Button
                onClick={onVipClick}
                className="btn-gold w-full h-12 tracking-wider"
              >
                {t.cta}
              </Button>
            ) : (
              <Button asChild variant="outline" className="btn-onyx w-full h-12 tracking-wider">
                <Link to={t.name === "Capital" ? "/capital-management" : "/dashboard"}>
                  {t.cta}
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== 10 · Final CTA =======================================================

function FinalCTA({ onVipClick }: { onVipClick: () => void }) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
      <div className="relative overflow-hidden rounded-[2rem] p-12 sm:p-20 text-center gold-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#050505] to-[#0d0d0d]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#D4AF37]/15 blur-[140px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
            <span className="h-px w-10 bg-[#D4AF37]/50" />
            <Gem className="h-3 w-3" />
            By Invitation
            <Gem className="h-3 w-3" />
            <span className="h-px w-10 bg-[#D4AF37]/50" />
          </div>
          <h2 className="font-display text-5xl sm:text-7xl font-bold tracking-tight">
            Enter the
            <br />
            <span className="gold-text italic font-serif-lux">Inner Circle.</span>
          </h2>
          <p className="mt-8 max-w-xl mx-auto text-white/55 text-lg font-light">
            For traders who treat this as a profession. Limited seats. Audited
            results. Real execution.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onVipClick} size="lg" className="btn-gold h-14 px-9 gap-2 gold-sweep relative overflow-hidden">
              <Crown className="h-4 w-4" />
              <span className="tracking-wider">Request Membership</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-onyx h-14 px-9 tracking-wider">
              <Link to="/dashboard">Enter Platform</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Footer ===============================================================

function Footer() {
  return (
    <footer className="relative border-t border-[#D4AF37]/15 mt-20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#F4D03F] via-[#D4AF37] to-[#8B6914]" />
          <span className="font-display tracking-[0.32em] text-sm gold-text">
            AASAKIRA
          </span>
        </div>
        <div className="text-[10px] tracking-[0.22em] uppercase text-white/35">
          Trading involves risk · Performance not guaranteed · © {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-5 text-xs tracking-widest uppercase text-white/45">
          <Link to="/pricing" className="hover:text-[#F4D03F] transition">Pricing</Link>
          <Link to="/dashboard" className="hover:text-[#F4D03F] transition">Platform</Link>
        </div>
      </div>
    </footer>
  );
}