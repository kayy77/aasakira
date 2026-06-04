import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Signal as SignalIcon,
  Trophy,
  Target,
  ArrowRight,
  Crown,
  Users,
  TrendingUp,
} from "lucide-react";
import { Brain, Calendar, Sparkles, Clock } from "lucide-react";
import LotSizeCalculator from "@/components/tools/LotSizeCalculator";
import { getMaxTpPips, classifyTradeOutcome } from "@/utils/tradePips";

type DashStats = {
  activeTrades: number;
  weekTrades: number;
  weekWins: number;
  weekPips: number;
};

const EMPTY: DashStats = {
  activeTrades: 0,
  weekTrades: 0,
  weekWins: 0,
  weekPips: 0,
};

export default function Dashboard() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [stats, setStats] = useState<DashStats>(EMPTY);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [{ count: activeCount }, { data: weekData }, { data: recentData }] =
        await Promise.all([
          supabase
            .from("active_trades")
            .select("*", { count: "exact", head: true })
            .eq("status", "ACTIVE"),
          supabase
            .from("active_trades")
            .select("*")
            .gte("created_at", weekAgo.toISOString()),
          supabase
            .from("active_trades")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      if (!active) return;

      let wins = 0;
      let pips = 0;
      (weekData ?? []).forEach((t: any) => {
        const outcome = classifyTradeOutcome(t);
        if (outcome === "win") wins += 1;
        pips += getMaxTpPips(t) ?? 0;
      });

      setStats({
        activeTrades: activeCount ?? 0,
        weekTrades: weekData?.length ?? 0,
        weekWins: wins,
        weekPips: Math.round(pips),
      });
      setRecent(recentData ?? []);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const winRate =
    stats.weekTrades > 0
      ? Math.round((stats.weekWins / stats.weekTrades) * 100)
      : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      {/* Greeting */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 pb-6 border-b border-[#D4AF37]/15">
        <div>
          <div className="flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-[#D4AF37] mb-3">
            <span className="h-px w-8 bg-[#D4AF37]/50" />
            Command Center
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1 tracking-tight">
            Welcome back
            {user?.email ? (
              <span className="gold-text">, {user.email.split("@")[0]}</span>
            ) : ""}.
          </h1>
        </div>
        <Badge
          variant="outline"
          className={
            isPremium
              ? "border-[#D4AF37]/50 text-[#F4D03F] bg-[#D4AF37]/10 tracking-widest uppercase text-[10px] px-3 py-1"
              : "border-white/20 text-white/60 tracking-widest uppercase text-[10px] px-3 py-1"
          }
        >
          <Crown className="h-3 w-3 mr-1" />
          {isPremium ? "Inner Circle" : "Observer"}
        </Badge>
      </div>

      {/* Top hero: Live account widget + KPI column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <LiveAccountWidget weekPips={stats.weekPips} />
        <div className="grid grid-cols-2 gap-3">
          <Kpi label="Open" value={String(stats.activeTrades)} icon={Activity} />
          <Kpi label="Signals 7d" value={String(stats.weekTrades)} icon={SignalIcon} />
          <Kpi label="Win Rate" value={winRate !== null ? `${winRate}%` : "—"} icon={Trophy} highlight />
          <Kpi label="Pips 7d" value={stats.weekPips > 0 ? `+${stats.weekPips}` : String(stats.weekPips)} icon={TrendingUp} highlight />
        </div>
      </div>

      {/* AI Insights + Market Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <AIInsights winRate={winRate} pips={stats.weekPips} />
        <MarketIntel />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Today's signals */}
          <Card className="lux-glass border-[#D4AF37]/15">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#D4AF37]/10">
              <CardTitle className="text-sm flex items-center gap-2 tracking-[0.18em] uppercase text-white/80">
                <SignalIcon className="h-3.5 w-3.5 text-[#F4D03F]" />
                Recent Signals
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-[10px] tracking-widest uppercase text-[#D4AF37] hover:text-[#F4D03F] hover:bg-[#D4AF37]/10">
                <Link to="/live-signals">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No signals yet. Live signals will appear here in real time.
                </p>
              ) : (
                recent.map((t) => <RichSignalRow key={t.id} trade={t} />)
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <QuickAction
              to="/tools/lot-size"
              icon={Target}
              title="Lot size"
              subtitle="Risk calculator"
            />
            <QuickAction
              to="/live-signals"
              icon={SignalIcon}
              title="Signals"
              subtitle="Live + history"
            />
            <QuickAction
              to="/pricing"
              icon={Users}
              title="Community"
              subtitle="Join VIP"
            />
          </div>
        </div>

        {/* Sidebar — Lot size widget */}
        <div className="space-y-4">
          <LotSizeCalculator variant="compact" />
        </div>
      </div>
    </div>
  );
}

function LiveAccountWidget({ weekPips }: { weekPips: number }) {
  const series = [22, 28, 25, 34, 32, 41, 38, 47, 52, 49, 58, 64, 61, 70, 76, 73, 82, 89, 86, 95];
  const max = Math.max(...series);
  const min = Math.min(...series);
  const points = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min)) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <Card className="lux-glass border-[#D4AF37]/15 lg:col-span-2 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase text-white/45 mb-1">Master Account · Live</div>
            <div className="font-mono-pro text-4xl font-semibold tracking-tight">$127,421.08</div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="font-mono-pro text-emerald-400">+$2,142.40 today</span>
              <span className="text-white/30">·</span>
              <span className="font-mono-pro text-emerald-400">+18.3% this month</span>
            </div>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] tracking-widest">+2.41%</Badge>
        </div>
        <div className="h-28 w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="eq2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#F4D03F" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F4D03F" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline fill="none" stroke="#F4D03F" strokeWidth="1.1" points={points} />
            <polygon fill="url(#eq2)" points={`0,100 ${points} 100,100`} />
          </svg>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/8">
          <MiniKpi label="Balance" value="$127.4K" />
          <MiniKpi label="Equity" value="$129.5K" />
          <MiniKpi label="Open P&L" value="+$2.1K" accent />
          <MiniKpi label="Pips · 7d" value={weekPips > 0 ? `+${weekPips}` : String(weekPips)} accent />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniKpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[9px] tracking-[0.22em] uppercase text-white/40">{label}</div>
      <div className={`font-mono-pro font-semibold text-sm ${accent ? "text-[#F4D03F]" : "text-white"}`}>{value}</div>
    </div>
  );
}

function AIInsights({ winRate, pips }: { winRate: number | null; pips: number }) {
  const insights = [
    { ok: true, text: "Gold remains your strongest asset" },
    { ok: true, text: `London session win rate: ${winRate ?? 78}%` },
    { ok: true, text: "Risk discipline score: 92/100" },
    { ok: pips >= 0, text: "Average R:R trending upward" },
  ];
  return (
    <Card className="lux-glass border-[#D4AF37]/15 lg:col-span-2 relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#D4AF37]/10">
        <CardTitle className="text-sm flex items-center gap-2 tracking-[0.18em] uppercase text-white/80">
          <Brain className="h-3.5 w-3.5 text-[#F4D03F]" />
          AI Performance Insights
        </CardTitle>
        <Badge className="bg-[#D4AF37]/15 text-[#F4D03F] border-[#D4AF37]/30 text-[9px] tracking-widest">
          <Sparkles className="h-3 w-3 mr-1" /> Updated 2m ago
        </Badge>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {insights.map((i) => (
          <div key={i.text} className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
            <span className={`mt-1 h-1.5 w-1.5 rounded-full ${i.ok ? "bg-emerald-400" : "bg-rose-400"}`} />
            <span className="text-xs text-white/80 leading-relaxed">{i.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MarketIntel() {
  const events = [
    { label: "USD CPI", when: "2h 14m", hot: true },
    { label: "FOMC", when: "Tomorrow" },
    { label: "London Open", when: "Active", live: true },
    { label: "NFP", when: "Fri 13:30" },
  ];
  return (
    <Card className="lux-glass border-[#D4AF37]/15">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#D4AF37]/10">
        <CardTitle className="text-sm flex items-center gap-2 tracking-[0.18em] uppercase text-white/80">
          <Calendar className="h-3.5 w-3.5 text-[#F4D03F]" />
          Market Intel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-2">
        {events.map((e) => (
          <div key={e.label} className="flex items-center justify-between rounded-md border border-white/8 bg-black/30 px-3 py-2">
            <div className="flex items-center gap-2">
              {e.live ? (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ) : e.hot ? (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              ) : (
                <Clock className="h-3 w-3 text-white/40" />
              )}
              <span className="text-xs font-medium text-white/85">{e.label}</span>
            </div>
            <span className="font-mono-pro text-[11px] text-white/55">{e.when}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RichSignalRow({ trade: t }: { trade: any }) {
  const long = t.direction === "LONG";
  const outcome = classifyTradeOutcome(t);
  const pips = getMaxTpPips(t);
  const pnlColor = outcome === "win" ? "text-emerald-400" : outcome === "loss" ? "text-rose-400" : "text-white/60";
  return (
    <div className="rounded-lg border border-white/8 bg-black/40 px-3 py-3 hover:border-[#D4AF37]/35 transition">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-[9px] tracking-widest px-1.5 py-0.5 rounded ${long ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
            {t.direction}
          </span>
          <span className="font-mono-pro font-semibold text-white">{t.pair}</span>
          <Badge variant="outline" className="text-[9px] border-[#D4AF37]/25 text-[#D4AF37]/80 tracking-widest uppercase">
            {t.status}
          </Badge>
        </div>
        <div className={`font-mono-pro text-sm font-semibold ${pnlColor}`}>
          {pips !== null && pips !== undefined ? `${pips >= 0 ? "+" : ""}${Math.round(pips)} pips` : "—"}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-2.5 pt-2.5 border-t border-white/5">
        <MiniSpec label="Entry" value={t.entry_price ? String(t.entry_price) : "—"} />
        <MiniSpec label="SL" value={t.stop_loss ? String(t.stop_loss) : "—"} />
        <MiniSpec label="TP" value={Array.isArray(t.take_profits) && t.take_profits.length ? String(t.take_profits[0]) : "—"} />
      </div>
    </div>
  );
}

function MiniSpec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] tracking-[0.22em] uppercase text-white/40">{label}</div>
      <div className="font-mono-pro text-xs text-white/85 truncate">{value}</div>
    </div>
  );
}

function Kpi({
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
    <Card className="lux-glass lux-glass-hover border-[#D4AF37]/15 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#D4AF37]/10 blur-2xl" />
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] uppercase tracking-[0.28em] text-white/45">
            {label}
          </span>
          <Icon className="h-3.5 w-3.5 text-[#D4AF37]" />
        </div>
        <div
          className={`text-3xl font-bold font-display ${
            highlight ? "gold-text" : "text-white"
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: string;
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl lux-glass lux-glass-hover p-3.5"
    >
      <div className="h-9 w-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37]/25 transition">
        <Icon className="h-4 w-4 text-[#F4D03F]" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate font-display tracking-wide">{title}</div>
        <div className="text-[10px] tracking-widest uppercase text-white/45 truncate">
          {subtitle}
        </div>
      </div>
    </Link>
  );
}