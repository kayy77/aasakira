import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { loadRealTrades, type RealTrade, type TradeSource } from "@/lib/academy/realTradeChecks";
import { tradeKey, tradeLabel } from "@/components/academy/LessonStepJournal";
import { getTrack } from "@/data/academy/tracks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, TrendingDown, TrendingUp } from "lucide-react";

type Entry = {
  id: string; track: string; lesson_id: string; step_index: number; step_text: string;
  note: string; trade_key: string | null; trade_label: string | null; trade_time: string | null; updated_at: string;
};

const lessonTitle = (track: string, id: string) => getTrack(track)?.lessons.find((l) => l.id === id)?.title ?? id;

export default function AcademyJournal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [trades, setTrades] = useState<RealTrade[]>([]);
  const [source, setSource] = useState<TradeSource>("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setLoading(false);
      const [{ data: rows }, real] = await Promise.all([
        supabase.from("academy_journal" as any).select("*").order("updated_at", { ascending: false }),
        loadRealTrades(data.user.id),
      ]);
      setEntries((rows as unknown as Entry[]) ?? []);
      setTrades(real.trades);
      setSource(real.source);
      setLoading(false);
    })();
  }, []);

  // Trading history timeline: every trade, with any lesson steps attached to it.
  const timeline = useMemo(() => {
    const byTrade = new Map<string, Entry[]>();
    entries.forEach((e) => e.trade_key && byTrade.set(e.trade_key, [...(byTrade.get(e.trade_key) ?? []), e]));
    const items = [...trades]
      .sort((a, b) => b.openTime.getTime() - a.openTime.getTime())
      .map((t) => ({ trade: t, steps: byTrade.get(tradeKey(t)) ?? [] }));
    // Steps linked to trades no longer in the 90-day window
    const known = new Set(trades.map(tradeKey));
    const orphaned = entries.filter((e) => e.trade_key && !known.has(e.trade_key));
    return { items, orphaned, unlinked: entries.filter((e) => !e.trade_key) };
  }, [entries, trades]);

  const linkedCount = entries.filter((e) => e.trade_key).length;

  const StepCard = ({ e }: { e: Entry }) => (
    <Link to={`/academy/${e.track}/${e.lesson_id}`} className="block rounded-md border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3 hover:border-[#D4AF37]/50">
      <div className="flex items-center gap-2 text-[11px] text-[#F4D03F]">
        <GraduationCap className="h-3.5 w-3.5" /> {getTrack(e.track)?.name ?? e.track} · {lessonTitle(e.track, e.lesson_id)} · Step {e.step_index + 1}
      </div>
      <p className="mt-1 text-xs text-white/50">{e.step_text}</p>
      {e.note && <p className="mt-1 text-sm text-white/85">{e.note}</p>}
    </Link>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display gold-text flex items-center gap-2"><BookOpen className="h-5 w-5" /> Academy Journal</h1>
        <p className="text-sm text-white/60 mt-1">Your lesson steps, recorded against the trades where you applied them.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[["Steps recorded", entries.length], ["Linked to trades", linkedCount], ["Trades (90 days)", trades.length]].map(([k, v]) => (
          <Card key={k as string} className="bg-[#0a0a0a] border-white/10"><CardContent className="p-4">
            <div className="font-mono text-2xl text-white">{v}</div><div className="text-xs text-white/50">{k}</div>
          </CardContent></Card>
        ))}
      </div>

      {loading ? <p className="text-sm text-white/40">Loading…</p> : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm uppercase tracking-wider text-white/60">Trading history</h2>
              {source !== "none" && <Badge variant="outline" className="text-[10px] border-white/15 text-white/50">{source === "account" ? "Linked account" : "Journal"}</Badge>}
            </div>
            {timeline.items.length === 0 && (
              <p className="text-sm text-white/50">No trades yet. <Link to="/account/trading-accounts" className="text-[#F4D03F]">Link a trading account</Link> to see your history here.</p>
            )}
            {timeline.items.map(({ trade, steps }) => (
              <div key={tradeKey(trade)} className="rounded-md border border-white/10 bg-[#0a0a0a] p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-white">
                  {(trade.pnl ?? 0) >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
                  <span className="font-mono">{tradeLabel(trade)}</span>
                  {steps.length > 0 && <Badge className="ml-auto bg-[#D4AF37]/15 text-[#F4D03F] border-[#D4AF37]/40 text-[10px]">{steps.length} lesson step{steps.length > 1 ? "s" : ""}</Badge>}
                </div>
                {steps.map((e) => <StepCard key={e.id} e={e} />)}
              </div>
            ))}
            {timeline.orphaned.map((e) => (
              <div key={e.id} className="rounded-md border border-white/10 bg-[#0a0a0a] p-3 space-y-2">
                <div className="text-sm font-mono text-white/70">{e.trade_label} <span className="text-[10px] text-white/40">(older than 90 days)</span></div>
                <StepCard e={e} />
              </div>
            ))}
          </section>

          {timeline.unlinked.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm uppercase tracking-wider text-white/60">Notes not tied to a trade</h2>
              {timeline.unlinked.map((e) => <StepCard key={e.id} e={e} />)}
            </section>
          )}

          {entries.length === 0 && (
            <p className="text-sm text-white/50">Nothing recorded yet. Open any lesson and use “Journal each step” under the practical task.</p>
          )}
        </>
      )}
    </div>
  );
}
