import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Activity, Trophy, ShieldCheck, BarChart3, GraduationCap, Calculator, Brain, Sparkles, LineChart, Lock, Smartphone, Apple, Play } from "lucide-react";

const previewTiles = [
  { icon: Activity, title: "Live Signals", desc: "Institutional-grade entries streamed in real time." },
  { icon: Trophy, title: "Recent Wins", desc: "Verified outcomes from the past 7 trading days." },
  { icon: ShieldCheck, title: "Verified Trading Account", desc: "Every member proves a funded account before access." },
  { icon: BarChart3, title: "Performance Metrics", desc: "Win rate, RR, drawdown, equity curve — wired to your broker." },
  { icon: GraduationCap, title: "Academy", desc: "Foundation → Live Floor curriculum with progression." },
  { icon: Calculator, title: "Risk Suite", desc: "9 calculators: lot, risk, drawdown, prop firm rules." },
  { icon: Brain, title: "AI Coach", desc: "Daily and weekly intelligence reviews on your trades." },
];

const funnelSteps = [
  { n: "01", title: "Create Workspace", desc: "Free account in 30 seconds." },
  { n: "02", title: "Verify Account", desc: "Upload broker screenshots — AI auto-verifies." },
  { n: "03", title: "Unlock AASAKIRA", desc: "Signals, analytics and AI coaching go live." },
];

export default function AasakiraLandingV2() {
  const [stats, setStats] = useState<{ total: number; wins: number; closed: number; pips: number; active: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("active_trades")
        .select("status, outcome, pips_realized, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      const rows = (data as any[]) || [];
      const wins = rows.filter((r) => ["WIN", "PARTIAL", "BE"].includes(r.outcome)).length;
      const closed = rows.filter((r) => !!r.outcome).length;
      const pips = rows.reduce((s, r) => s + (Number(r.pips_realized) || 0), 0);
      const active = rows.filter((r) => ["OPEN", "ACTIVE"].includes((r.status || "").toUpperCase())).length;
      setStats({ total: rows.length, wins, closed, pips, active });
      setStatsLoading(false);
    })();
  }, []);

  const winRate = stats && stats.closed > 0 ? (stats.wins / stats.closed) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 noise-overlay">
        <div className="gold-beam absolute top-0 left-1/4 w-[260px] h-[110vh] -rotate-12" />
        <div className="gold-beam absolute top-0 right-1/4 w-[200px] h-[110vh] rotate-12" style={{ animationDelay: "4s" }} />
      </div>

      {/* Nav */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-[0.35em] gold-text">AASAKIRA</Link>
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-white/60">
          <a href="#preview" className="hover:text-[#F4D03F] transition">Platform</a>
          <a href="#proof" className="hover:text-[#F4D03F] transition">Verified Results</a>
          <a href="#funnel" className="hover:text-[#F4D03F] transition">How it works</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs tracking-widest uppercase text-white/70 hover:text-white">Sign in</Link>
          <Link to="/signup" className="btn-gold rounded-full px-5 py-2 text-xs tracking-widest uppercase">Start Free</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-black/40 text-[10px] tracking-[0.3em] uppercase text-[#F4D03F]">
          <Sparkles className="w-3 h-3" /> The Operating System for Serious Traders
        </div>
        <h1 className="mt-8 font-display text-5xl md:text-7xl leading-[1.05] tracking-tight">
          Trade with an <span className="gold-text">institutional</span>
          <br /> intelligence layer.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-white/60 text-lg">
          Live signals. Verified accounts. AI coaching. The entire trading workflow in one private workspace —
          built for funded traders and capital allocators.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link to="/signup" className="btn-gold rounded-full px-8 py-4 text-sm tracking-widest uppercase inline-flex items-center gap-2">
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#proof" className="btn-onyx rounded-full px-8 py-4 text-sm tracking-widest uppercase">See Verified Results</a>
        </div>

        {/* Live ticker */}
        <div className="mt-14 lux-glass rounded-2xl p-5 max-w-3xl mx-auto flex items-center justify-around text-sm font-mono-pro">
          <Ticker symbol="XAUUSD" />
          <span className="w-px h-8 bg-[#D4AF37]/20" />
          <Ticker symbol="US30" />
          <span className="w-px h-8 bg-[#D4AF37]/20" />
          <Ticker symbol="EURUSD" />
        </div>
      </section>

      {/* Preview rail */}
      <section id="preview" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <SectionHeader eyebrow="The Platform" title="Everything a trader needs. In one workspace." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {previewTiles.map((t) => (
            <Link key={t.title} to="/signup" className="lux-glass lux-glass-hover rounded-2xl p-6 group">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-4">
                <t.icon className="w-5 h-5 text-[#F4D03F]" />
              </div>
              <div className="font-display text-lg mb-1">{t.title}</div>
              <p className="text-sm text-white/55 leading-relaxed">{t.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-[#D4AF37]/70 group-hover:text-[#F4D03F] transition">
                <Lock className="w-3 h-3" /> Members only
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Proof / trust band */}
      <section id="proof" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <SectionHeader eyebrow="Verified Performance" title="Audited. Not anecdotal." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat label="Total Signals" value={statsLoading ? "…" : (stats?.total ?? 0).toLocaleString()} sub="Live trading floor history" icon={Activity} />
          <Stat label="Win Rate" value={statsLoading ? "…" : `${winRate.toFixed(0)}%`} sub={`${stats?.wins ?? 0} of ${stats?.closed ?? 0} closed`} icon={Trophy} />
          <Stat label="Total Pips" value={statsLoading ? "…" : `+${Math.round(stats?.pips ?? 0).toLocaleString()}`} sub="All-time realized" icon={LineChart} />
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Stat label="Active Signals" value={statsLoading ? "…" : (stats?.active ?? 0).toString()} sub="Currently live on the floor" icon={ShieldCheck} />
          <Stat label="MyFxBook Verified" value="Live" sub="Third-party audited trading account" icon={ShieldCheck} />
        </div>
      </section>

      {/* Funnel */}
      <section id="funnel" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <SectionHeader eyebrow="The Path" title="From visitor to verified trader in 3 steps." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {funnelSteps.map((s) => (
            <div key={s.n} className="lux-glass rounded-2xl p-8">
              <div className="font-mono-pro text-xs tracking-widest text-[#D4AF37]/70">{s.n}</div>
              <div className="mt-4 font-display text-2xl">{s.title}</div>
              <p className="mt-3 text-sm text-white/55">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-28 text-center">
        <h2 className="font-display text-4xl md:text-5xl leading-tight">
          Ready to <span className="gold-text">trade like an institution</span>?
        </h2>
        <p className="mt-5 text-white/55 max-w-xl mx-auto">
          Create your trading workspace. Verify your broker. Unlock the full AASAKIRA platform.
        </p>
        <Link to="/signup" className="mt-10 btn-gold rounded-full px-10 py-4 inline-flex items-center gap-2 text-sm tracking-widest uppercase">
          Create Your Trading Workspace <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="relative z-10 border-t border-[#D4AF37]/10 mt-10 py-10 text-center text-xs text-white/40 tracking-widest uppercase">
        © {new Date().getFullYear()} AASAKIRA — Private Trading Intelligence
      </footer>
    </div>
  );
}


function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37]/70">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl md:text-5xl tracking-tight">{title}</h2>
    </div>
  );
}

function Stat({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: any }) {
  return (
    <div className="lux-glass rounded-2xl p-8">
      <div className="flex items-center justify-between">
        <div className="text-[10px] tracking-widest uppercase text-white/50">{label}</div>
        <Icon className="w-4 h-4 text-[#F4D03F]" />
      </div>
      <div className="mt-4 font-display text-4xl gold-text">{value}</div>
      <div className="mt-2 text-xs text-white/45">{sub}</div>
    </div>
  );
}

function Ticker({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await supabase.functions.invoke("fetch-live-prices", { body: { symbols: [symbol] } });
        const p = (data as any)?.prices?.[symbol]?.price ?? (data as any)?.[symbol]?.price ?? (data as any)?.price;
        if (!cancelled && typeof p === "number") setPrice(p);
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, [symbol]);
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] tracking-widest uppercase text-white/40">{symbol}</span>
      <span className="text-[#F4D03F] tabular-nums">{price !== null ? price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</span>
    </div>
  );
}
