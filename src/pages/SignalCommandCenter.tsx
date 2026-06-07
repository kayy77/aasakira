import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, Target, Clock } from "lucide-react";

type Trade = {
  id: string; pair: string; direction: string; status: string; outcome: string | null;
  pips_realized: number | null; created_at: string; closed_at: string | null;
};

export default function SignalCommandCenter() {
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

  const m = useMemo(() => computeMetrics(trades), [trades]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="px-8 py-8 border-b border-[#D4AF37]/10">
        <div className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37]/70">Signal Command Center</div>
        <h1 className="mt-2 font-display text-3xl">Live Trading Engine</h1>
        <p className="mt-2 text-sm text-white/55">Real-time view of every signal, outcome and edge across the floor.</p>
      </div>

      <div className="px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Active Now" value={m.active} icon={Activity} loading={loading} />
        <Metric label="Today's Pips" value={`${m.todayPips >= 0 ? "+" : ""}${m.todayPips.toFixed(0)}`} icon={Clock} loading={loading} />
        <Metric label="Weekly Win Rate" value={`${m.weekWinRate.toFixed(0)}%`} icon={Target} loading={loading} />
        <Metric label="Monthly Pips" value={`+${m.monthPips.toFixed(0)}`} icon={TrendingUp} loading={loading} />
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        <Card className="lux-glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs tracking-widest uppercase text-[#D4AF37]/70">Recent Closures</div>
            <div className="text-[10px] text-white/40 tracking-widest uppercase">Last 20</div>
          </div>
          <div className="divide-y divide-white/5">
            {m.recent.slice(0, 20).map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    t.direction?.toUpperCase() === "BUY" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"
                  }`}>{t.direction}</span>
                  <span className="font-mono-pro">{t.pair}</span>
                  <span className="text-[10px] text-white/40">{t.outcome ?? "OPEN"}</span>
                </div>
                <span className={`font-mono-pro tabular-nums ${ (t.pips_realized ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {(t.pips_realized ?? 0) >= 0 ? "+" : ""}{(t.pips_realized ?? 0).toFixed(1)}
                </span>
              </div>
            ))}
            {!loading && m.recent.length === 0 && <div className="py-8 text-center text-white/40 text-sm">No signals yet.</div>}
          </div>
        </Card>

        <Card className="lux-glass p-6">
          <div className="text-xs tracking-widest uppercase text-[#D4AF37]/70 mb-4">Win Rate by Pair</div>
          <div className="space-y-3">
            {m.byPair.slice(0, 8).map((p) => (
              <div key={p.pair}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-pro text-white/80">{p.pair}</span>
                  <span className="text-white/50">{p.winRate.toFixed(0)}% · {p.pips >= 0 ? "+" : ""}{p.pips.toFixed(0)}p</span>
                </div>
                <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#8B6914] to-[#F4D03F]" style={{ width: `${Math.max(4, p.winRate)}%` }} />
                </div>
              </div>
            ))}
            {!loading && m.byPair.length === 0 && <div className="text-white/40 text-sm">No data yet.</div>}
          </div>
        </Card>

        <Card className="lux-glass p-6 lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Range label="Today" wins={m.today.wins} losses={m.today.losses} pips={m.todayPips} />
            <Range label="This Week" wins={m.week.wins} losses={m.week.losses} pips={m.week.pips} />
            <Range label="This Month" wins={m.month.wins} losses={m.month.losses} pips={m.monthPips} />
            <Range label="All-Time" wins={m.all.wins} losses={m.all.losses} pips={m.all.pips} />
            <Range label="Avg / Trade" wins={0} losses={0} pips={m.all.closed > 0 ? m.all.pips / m.all.closed : 0} compact />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, loading }: any) {
  return (
    <Card className="lux-glass p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] tracking-widest uppercase text-white/50">{label}</div>
        <Icon className="w-4 h-4 text-[#F4D03F]" />
      </div>
      <div className="mt-3 font-display text-3xl gold-text tabular-nums">{loading ? "…" : value}</div>
    </Card>
  );
}

function Range({ label, wins, losses, pips, compact }: any) {
  return (
    <div>
      <div className="text-[10px] tracking-widest uppercase text-white/50">{label}</div>
      <div className={`mt-2 font-display ${compact ? "text-xl" : "text-2xl"} gold-text tabular-nums`}>{pips >= 0 ? "+" : ""}{pips.toFixed(0)}p</div>
      {!compact && <div className="mt-1 text-[11px] text-white/45 font-mono-pro">{wins}W · {losses}L</div>}
    </div>
  );
}

function computeMetrics(trades: Trade[]) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);

  const isWin = (t: Trade) => t.outcome === "WIN" || t.outcome === "PARTIAL" || t.outcome === "BE";
  const isLoss = (t: Trade) => t.outcome === "LOSS";
  const isClosed = (t: Trade) => !!t.outcome;

  const windowed = (ms: number) => trades.filter((t) => new Date(t.created_at).getTime() >= now - ms);
  const todayList = trades.filter((t) => new Date(t.created_at).getTime() >= startOfToday.getTime());
  const weekList = windowed(7 * dayMs);
  const monthList = windowed(30 * dayMs);

  const agg = (list: Trade[]) => {
    const wins = list.filter(isWin).length;
    const losses = list.filter(isLoss).length;
    const closed = list.filter(isClosed).length;
    const pips = list.reduce((s, t) => s + (Number(t.pips_realized) || 0), 0);
    return { wins, losses, closed, pips };
  };

  const today = agg(todayList);
  const week = agg(weekList);
  const month = agg(monthList);
  const all = agg(trades);

  const byPairMap = new Map<string, { wins: number; total: number; pips: number }>();
  trades.forEach((t) => {
    const e = byPairMap.get(t.pair) || { wins: 0, total: 0, pips: 0 };
    if (isClosed(t)) {
      e.total++;
      if (isWin(t)) e.wins++;
      e.pips += Number(t.pips_realized) || 0;
    }
    byPairMap.set(t.pair, e);
  });
  const byPair = Array.from(byPairMap.entries())
    .map(([pair, v]) => ({ pair, winRate: v.total > 0 ? (v.wins / v.total) * 100 : 0, pips: v.pips, total: v.total }))
    .filter((p) => p.total >= 2)
    .sort((a, b) => b.pips - a.pips);

  return {
    active: trades.filter((t) => ["OPEN", "ACTIVE"].includes((t.status || "").toUpperCase())).length,
    today, week, month, all,
    todayPips: today.pips,
    monthPips: month.pips,
    weekWinRate: week.closed > 0 ? (week.wins / week.closed) * 100 : 0,
    recent: trades.filter(isClosed).slice(0, 50),
    byPair,
  };
}