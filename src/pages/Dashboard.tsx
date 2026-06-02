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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Greeting */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Command Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Welcome back
            {user?.email ? `, ${user.email.split("@")[0]}` : ""}.
          </h1>
        </div>
        <Badge
          variant="outline"
          className={
            isPremium
              ? "border-amber-400/40 text-amber-300"
              : "border-border/60 text-muted-foreground"
          }
        >
          <Crown className="h-3 w-3 mr-1" />
          {isPremium ? "VIP Member" : "Free Plan"}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi
          label="Open trades"
          value={String(stats.activeTrades)}
          icon={Activity}
          accent="text-emerald-400"
        />
        <Kpi
          label="Signals this week"
          value={String(stats.weekTrades)}
          icon={SignalIcon}
        />
        <Kpi
          label="Win rate (7d)"
          value={winRate !== null ? `${winRate}%` : "—"}
          icon={Trophy}
          accent="text-amber-300"
        />
        <Kpi
          label="Pips (7d)"
          value={
            stats.weekPips > 0
              ? `+${stats.weekPips}`
              : String(stats.weekPips)
          }
          icon={TrendingUp}
          accent={
            stats.weekPips >= 0 ? "text-emerald-400" : "text-rose-400"
          }
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Today's signals */}
          <Card className="border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <SignalIcon className="h-4 w-4 text-primary" />
                Recent signals
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link to="/live-signals">
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No signals yet. Live signals will appear here in real time.
                </p>
              ) : (
                recent.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge
                        variant="outline"
                        className={
                          t.direction === "LONG"
                            ? "border-emerald-400/30 text-emerald-300"
                            : "border-rose-400/30 text-rose-300"
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
                      className="text-[10px] border-border/60"
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
  accent,
}: {
  label: string;
  value: string;
  icon: any;
  accent?: string;
}) {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <Icon className={`h-3.5 w-3.5 ${accent ?? "text-muted-foreground"}`} />
        </div>
        <div className={`text-2xl font-bold font-mono ${accent ?? ""}`}>
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
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur p-3 transition hover:border-primary/40 hover:bg-card"
    >
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">
          {subtitle}
        </div>
      </div>
    </Link>
  );
}