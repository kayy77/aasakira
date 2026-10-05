import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { loadRealTrades, type RealTrade } from "@/lib/academy/realTradeChecks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Check } from "lucide-react";

export const tradeKey = (t: RealTrade) => `${t.symbol}|${t.openTime.toISOString()}`;
export const tradeLabel = (t: RealTrade) =>
  `${t.symbol} · ${t.openTime.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}${t.pnl != null ? ` · ${t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}` : ""}`;

type Row = { step_index: number; note: string; trade_key: string | null };
type Draft = { note: string; trade_key: string };

export default function LessonStepJournal({ track, lessonId, steps }: { track: string; lessonId: string; steps: string[] }) {
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [trades, setTrades] = useState<RealTrade[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id;
      if (!id) return;
      setUid(id);
      const [{ data: rows }, real] = await Promise.all([
        supabase.from("academy_journal" as any).select("step_index, note, trade_key").eq("track", track).eq("lesson_id", lessonId),
        loadRealTrades(id),
      ]);
      const d: Record<number, Draft> = {};
      const s: Record<number, boolean> = {};
      ((rows as unknown as Row[]) ?? []).forEach((r) => {
        d[r.step_index] = { note: r.note, trade_key: r.trade_key ?? "" };
        s[r.step_index] = true;
      });
      setDrafts(d);
      setSaved(s);
      setTrades([...real.trades].sort((a, b) => b.openTime.getTime() - a.openTime.getTime()).slice(0, 50));
    })();
  }, [track, lessonId]);

  const update = (i: number, patch: Partial<Draft>) => {
    setDrafts((p) => ({ ...p, [i]: { note: "", trade_key: "", ...p[i], ...patch } }));
    setSaved((p) => ({ ...p, [i]: false }));
  };

  const saveStep = async (i: number) => {
    if (!uid) return;
    const d = drafts[i] ?? { note: "", trade_key: "" };
    if (!d.note.trim() && !d.trade_key) return toast({ title: "Add a note or pick a trade first", variant: "destructive" });
    const t = trades.find((x) => tradeKey(x) === d.trade_key);
    const { error } = await supabase.from("academy_journal" as any).upsert(
      {
        user_id: uid, track, lesson_id: lessonId, step_index: i, step_text: steps[i],
        note: d.note.trim(), trade_key: t ? d.trade_key : null,
        trade_label: t ? tradeLabel(t) : null, trade_time: t ? t.openTime.toISOString() : null,
      },
      { onConflict: "user_id,track,lesson_id,step_index" },
    );
    if (error) return toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    setSaved((p) => ({ ...p, [i]: true }));
    toast({ title: `Step ${i + 1} saved to your Academy Journal` });
  };

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#F4D03F]"><BookOpen className="h-4 w-4" /> Journal each step</div>
        <Link to="/academy/journal" className="text-xs text-white/50 hover:text-[#F4D03F]">Open journal →</Link>
      </div>
      {steps.map((step, i) => (
        <div key={i} className="space-y-2 border-t border-white/5 pt-3 first:border-0 first:pt-0">
          <p className="text-xs text-white/70"><span className="font-mono text-[#F4D03F]">{i + 1}.</span> {step}</p>
          <Textarea
            value={drafts[i]?.note ?? ""}
            onChange={(e) => update(i, { note: e.target.value })}
            placeholder="What did you actually do for this step?"
            className="min-h-[60px] bg-black/40 border-white/10 text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={drafts[i]?.trade_key ?? ""}
              onChange={(e) => update(i, { trade_key: e.target.value })}
              className="h-8 flex-1 min-w-[200px] rounded-md border border-white/10 bg-black/40 px-2 text-xs text-white/80"
            >
              <option value="">{trades.length ? "Attach a trade (optional)" : "No trades found yet"}</option>
              {trades.map((t) => <option key={tradeKey(t)} value={tradeKey(t)}>{tradeLabel(t)}</option>)}
            </select>
            <Button size="sm" variant="outline" onClick={() => saveStep(i)} className="h-8 border-[#D4AF37]/40 text-[#F4D03F]">
              {saved[i] ? <><Check className="h-3.5 w-3.5 mr-1" /> Saved</> : "Save step"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
