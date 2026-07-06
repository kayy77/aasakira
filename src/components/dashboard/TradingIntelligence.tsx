import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Loader2, RefreshCw, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Insight = {
  id: string;
  kind: string;
  title: string;
  body: string;
  score: number | null;
  metadata: any;
  created_at: string;
};

export default function TradingIntelligence() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [daily, setDaily] = useState<Insight | null>(null);
  const [weekly, setWeekly] = useState<Insight | null>(null);
  const [loading, setLoading] = useState<null | "daily" | "weekly">(null);

  const loadLatest = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .in("kind", ["review_daily", "review_weekly"])
      .order("created_at", { ascending: false })
      .limit(20);
    const rows = (data ?? []) as Insight[];
    setDaily(rows.find((r) => r.kind === "review_daily") ?? null);
    setWeekly(rows.find((r) => r.kind === "review_weekly") ?? null);
  };

  useEffect(() => { loadLatest(); }, [user?.id]);

  const generate = async (period: "daily" | "weekly") => {
    setLoading(period);
    try {
      const { data, error } = await supabase.functions.invoke("generate-trading-review", {
        body: { period },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      if ((data as any)?.insight) {
        if (period === "daily") setDaily((data as any).insight);
        else setWeekly((data as any).insight);
      }
      toast({ title: `${period === "daily" ? "Daily" : "Weekly"} review ready` });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="lux-glass border-[#D4AF37]/15 lg:col-span-3 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#D4AF37]/10 relative">
        <CardTitle className="text-sm flex items-center gap-2 tracking-[0.18em] uppercase text-white/80">
          <Brain className="h-3.5 w-3.5 text-[#F4D03F]" />
          Trading Intelligence Engine
        </CardTitle>
        <Badge className="bg-[#D4AF37]/15 text-[#F4D03F] border-[#D4AF37]/30 text-[9px] tracking-widest">
          <Sparkles className="h-3 w-3 mr-1" /> Powered by AASAKIRA AI
        </Badge>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        <ReviewCard
          label="Daily Review"
          icon={Calendar}
          insight={daily}
          loading={loading === "daily"}
          onGenerate={() => generate("daily")}
        />
        <ReviewCard
          label="Weekly Review"
          icon={TrendingUp}
          insight={weekly}
          loading={loading === "weekly"}
          onGenerate={() => generate("weekly")}
        />
      </CardContent>
    </Card>
  );
}

function ReviewCard({
  label,
  icon: Icon,
  insight,
  loading,
  onGenerate,
}: {
  label: string;
  icon: any;
  insight: Insight | null;
  loading: boolean;
  onGenerate: () => void;
}) {
  const meta = insight?.metadata ?? {};
  const stale = insight
    ? Date.now() - new Date(insight.created_at).getTime() > 24 * 60 * 60 * 1000
    : true;

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-[#F4D03F]" />
          <span className="text-[10px] tracking-[0.28em] uppercase text-white/60">{label}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={onGenerate}
          className="h-7 text-[10px] tracking-widest uppercase text-[#D4AF37] hover:text-[#F4D03F] hover:bg-[#D4AF37]/10"
        >
          {loading ? (
            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analysing</>
          ) : (
            <><RefreshCw className="h-3 w-3 mr-1" /> {insight ? "Regenerate" : "Generate"}</>
          )}
        </Button>
      </div>

      {!insight ? (
        <div className="text-sm text-white/50 py-6 text-center">
          Generate your first {label.toLowerCase()} to see AI-powered coaching on your trades.
        </div>
      ) : (
        <>
          <h3 className="font-display text-lg font-semibold tracking-tight mb-1">
            {insight.title}
          </h3>
          {insight.score != null && (
            <div className="text-[10px] tracking-widest uppercase text-white/40 mb-2">
              Score <span className="text-[#F4D03F] font-mono-pro">{Math.round(insight.score)}/100</span>
              {stale && <span className="ml-2 text-amber-400/70">· Stale</span>}
            </div>
          )}
          <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line mb-3">
            {insight.body}
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {meta.best_market && (
              <Row label="Best market" value={meta.best_market} tone="good" />
            )}
            {meta.worst_market && (
              <Row label="Worst market" value={meta.worst_market} tone="bad" />
            )}
            {meta.win_rate != null && (
              <Row label="Win rate" value={`${Math.round(Number(meta.win_rate))}%`} />
            )}
            {meta.avg_rr != null && (
              <Row label="Avg R:R" value={String(meta.avg_rr)} />
            )}
          </div>
          {meta.recommendation && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/5 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-[#F4D03F] mt-0.5 shrink-0" />
              <p className="text-xs text-white/80"><span className="text-[#F4D03F]">Recommendation:</span> {meta.recommendation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/8 bg-white/[0.02] px-2.5 py-1.5">
      <span className="text-white/45 tracking-widest uppercase text-[9px]">{label}</span>
      <span className={`font-mono-pro ${tone === "good" ? "text-emerald-400" : tone === "bad" ? "text-rose-400" : "text-white"}`}>{value}</span>
    </div>
  );
}