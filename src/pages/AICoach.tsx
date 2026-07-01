import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Clock, Target, Activity, Sparkles } from "lucide-react";
import TraderScoreCard from "@/components/dashboard/TraderScoreCard";

type Trade = {
  id: string; pair: string; direction: string; status: string; outcome: string | null;
  pips_realized: number | null; created_at: string; closed_at: string | null;
};

export default function AICoach() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("active_trades")
        .select("id, pair, direction, status, outcome, pips_realized, created_at, closed_at")
        .order("created_at", { ascending: false })
        .limit(500);
      setTrades((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const intel = useMemo(() => buildIntel(trades), [trades]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-6 pb-6 border-b border-[#D4AF37]/15">
        <div className="flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-[#D4AF37] mb-3">
          <Brain className="h-3.5 w-3.5" /> AI Coach · Account Intelligence
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Your account, <span className="gold-text">analyzed</span>.
        </h1>
        <p className="text-sm text-white/55 mt-2 max-w-2xl">
          Not another ChatGPT wrapper — this reads your actual trades and surfaces edges, leaks and behavioural patterns.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <TraderScoreCard winRate={intel.winRate} weekPips={intel.weekPips} weekTrades={intel.weekTrades} />
        <InsightCard tone="ok" icon={TrendingUp} title="Most Profitable Pair"
          value={intel.bestPair?.pair ?? "—"}
          sub={intel.bestPair ? `${intel.bestPair.winRate.toFixed(0)}% WR · ${intel.bestPair.pips >= 0 ? "+" : ""}${intel.bestPair.pips.toFixed(0)}p` : "Not enough data"} />
        <InsightCard tone="warn" icon={TrendingDown} title="Worst Pair"
          value={intel.worstPair?.pair ?? "—"}
          sub={intel.worstPair ? `${intel.worstPair.winRate.toFixed(0)}% WR · ${intel.worstPair.pips >= 0 ? "+" : ""}${intel.worstPair.pips.toFixed(0)}p` : "Not enough data"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <InsightCard tone="info"  icon={Clock}    title="Best Session"        value={intel.bestSession.name}    sub={`${intel.bestSession.winRate.toFixed(0)}% WR · ${intel.bestSession.trades} trades`} />
        <InsightCard tone="info"  icon={Target}   title="Avg Pips / Trade"    value={`${intel.avgPips >= 0 ? "+" : ""}${intel.avgPips.toFixed(1)}`} sub={`${intel.closed} closed trades`} />
        <InsightCard tone="warn"  icon={Activity} title="Risk Signal"         value={intel.riskLabel}           sub={intel.riskDetail} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="lux-glass border-[#D4AF37]/15">
          <CardContent className="p-5">
            <div className="text-[10px] tracking-widest uppercase text-[#D4AF37]/70 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Behavioural Alerts
            </div>
            {intel.alerts.length === 0 ? (
              <div className="text-sm text-white/50">No warning signs detected in your recent activity.</div>
            ) : (
              <ul className="space-y-2">
                {intel.alerts.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="text-white/80">{a}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="lux-glass border-[#D4AF37]/15">
          <CardContent className="p-5">
            <div className="text-[10px] tracking-widest uppercase text-[#D4AF37]/70 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Weekly Improvement Brief
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              {intel.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#F4D03F]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-[10px] text-white/35">
              Deep-analysis briefs from Claude with full context land next release.
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && <div className="mt-6 text-center text-white/40 text-sm">Loading account data…</div>}
    </div>
  );
}

function InsightCard({ tone, icon: Icon, title, value, sub }: any) {
  const tones: any = {
    ok:   "text-emerald-300",
    warn: "text-amber-300",
    info: "text-sky-300",
  };
  return (
    <Card className="lux-glass border-[#D4AF37]/15">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-widest uppercase text-white/50">{title}</div>
          <Icon className={`h-4 w-4 ${tones[tone]}`} />
        </div>
        <div className="mt-3 font-display text-2xl gold-text">{value}</div>
        <div className="mt-1 text-[11px] text-white/50 font-mono-pro">{sub}</div>
      </CardContent>
    </Card>
  );
}

function buildIntel(trades: Trade[]) {
  const isWin  = (t: Trade) => t.outcome === "WIN" || t.outcome === "PARTIAL" || t.outcome === "BE";
  const isLoss = (t: Trade) => t.outcome === "LOSS";
  const closed = trades.filter((t) => !!t.outcome);
  const wins = closed.filter(isWin).length;
  const winRate = closed.length ? (wins / closed.length) * 100 : null;
  const pipsTotal = closed.reduce((s, t) => s + (Number(t.pips_realized) || 0), 0);
  const avgPips = closed.length ? pipsTotal / closed.length : 0;

  // pairs
  const byPair = new Map<string, { wins: number; total: number; pips: number }>();
  closed.forEach((t) => {
    const e = byPair.get(t.pair) || { wins: 0, total: 0, pips: 0 };
    e.total++;
    if (isWin(t)) e.wins++;
    e.pips += Number(t.pips_realized) || 0;
    byPair.set(t.pair, e);
  });
  const pairArr = Array.from(byPair.entries())
    .map(([pair, v]) => ({ pair, winRate: (v.wins / v.total) * 100, pips: v.pips, total: v.total }))
    .filter((p) => p.total >= 2);
  const bestPair  = [...pairArr].sort((a, b) => b.pips - a.pips)[0] || null;
  const worstPair = [...pairArr].sort((a, b) => a.pips - b.pips)[0] || null;

  // sessions (rough UTC): Asia 0-8, London 8-13, NY 13-21, Off 21-24
  const sessions: Record<string, { wins: number; trades: number }> = {
    Asia: { wins: 0, trades: 0 }, London: { wins: 0, trades: 0 }, "New York": { wins: 0, trades: 0 }, Off: { wins: 0, trades: 0 },
  };
  closed.forEach((t) => {
    const h = new Date(t.created_at).getUTCHours();
    const s = h < 8 ? "Asia" : h < 13 ? "London" : h < 21 ? "New York" : "Off";
    sessions[s].trades++;
    if (isWin(t)) sessions[s].wins++;
  });
  const bestSession = Object.entries(sessions)
    .map(([name, v]) => ({ name, winRate: v.trades ? (v.wins / v.trades) * 100 : 0, trades: v.trades }))
    .filter((s) => s.trades > 0)
    .sort((a, b) => b.winRate - a.winRate)[0] || { name: "—", winRate: 0, trades: 0 };

  // weekly
  const now = Date.now();
  const week = closed.filter((t) => now - new Date(t.created_at).getTime() < 7 * 24 * 60 * 60 * 1000);
  const weekPips = week.reduce((s, t) => s + (Number(t.pips_realized) || 0), 0);

  // alerts
  const alerts: string[] = [];
  // overtrading — > 15 in a week
  if (week.length > 15) alerts.push(`Possible overtrading — ${week.length} trades in the last 7 days.`);
  // revenge trading — 2+ losses within 60min of each other, twice
  const sorted = [...closed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  let revengeStreaks = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (isLoss(sorted[i - 1]) && isLoss(sorted[i]) &&
        (new Date(sorted[i].created_at).getTime() - new Date(sorted[i - 1].created_at).getTime()) < 60 * 60 * 1000) {
      revengeStreaks++;
    }
  }
  if (revengeStreaks >= 2) alerts.push(`Revenge-trading pattern detected — ${revengeStreaks} back-to-back losses within an hour.`);
  if (worstPair && worstPair.pips < -50) alerts.push(`${worstPair.pair} is bleeding — ${worstPair.pips.toFixed(0)} pips. Consider pausing.`);
  if (weekPips < -80) alerts.push(`Weekly drawdown at ${weekPips.toFixed(0)} pips — tighten risk %.`);

  const riskLabel = weekPips < -80 ? "High" : weekPips < 0 ? "Elevated" : "Healthy";
  const riskDetail = `${weekPips >= 0 ? "+" : ""}${weekPips.toFixed(0)} pips this week`;

  const suggestions = [
    bestPair ? `Lean into ${bestPair.pair} — your strongest edge (${bestPair.winRate.toFixed(0)}% WR).` : "Trade more pairs to establish an edge signature.",
    bestSession.name !== "—" ? `You perform best during the ${bestSession.name} session (${bestSession.winRate.toFixed(0)}% WR).` : "Log at least 5 trades to identify your best session.",
    worstPair ? `Cut or refine your ${worstPair.pair} setup — it's your weakest instrument.` : "No clearly weak pair yet.",
    avgPips < 5 ? "Average pips-per-trade is low — either extend targets or filter setups harder." : "Solid pip average — protect it with strict risk rules.",
  ];

  return { winRate, avgPips, closed: closed.length, weekTrades: week.length, weekPips, bestPair, worstPair, bestSession, alerts, suggestions, riskLabel, riskDetail };
}