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
            Private Terminal
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1 tracking-tight">
            Welcome back
            {user?.email ? (
              <span className="gold-text italic font-serif-lux">, {user.email.split("@")[0]}</span>
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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi
          label="Open Positions"
          value={String(stats.activeTrades)}
          icon={Activity}
        />
        <Kpi
          label="Signals · 7d"
          value={String(stats.weekTrades)}
          icon={SignalIcon}
        />
        <Kpi
          label="Win Rate · 7d"
          value={winRate !== null ? `${winRate}%` : "—"}
          icon={Trophy}
          highlight
        />
        <Kpi
          label="Pips · 7d"
          value={
            stats.weekPips > 0
              ? `+${stats.weekPips}`
              : String(stats.weekPips)
          }
          icon={TrendingUp}
          highlight
        />
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
                recent.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-[#D4AF37]/15 bg-black/40 px-3 py-2.5 transition hover:border-[#D4AF37]/35"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge
                        variant="outline"
                        className={
                          t.direction === "LONG"
                            ? "border-[#D4AF37]/40 text-[#F4D03F] bg-[#D4AF37]/10 text-[10px] tracking-wider"
                            : "border-white/25 text-white/85 bg-white/5 text-[10px] tracking-wider"
                        }
                      >
                        {t.direction}
                      </Badge>
                      <span className="font-mono font-semibold truncate">
                        {t.pair}
                      </span>
                      {t.entry_price && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          @ {t.entry_price}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] border-[#D4AF37]/25 text-[#D4AF37]/80 tracking-widest uppercase"
                    >
                      {t.status}
                    </Badge>
                  </div>
                ))
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