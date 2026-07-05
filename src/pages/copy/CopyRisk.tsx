import { useEffect, useState } from "react";
import { useFollowerAccounts } from "@/hooks/useCopyTrading";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function CopyRisk() {
  const { rows: followers } = useFollowerAccounts();
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      if (!followers.length) return;
      const { data } = await supabase.from("risk_profiles").select("*").in("follower_account_id", followers.map((f) => f.id));
      const map: Record<string, any> = {};
      (data ?? []).forEach((p) => { map[p.follower_account_id] = p; });
      setProfiles(map);
    })();
  }, [followers]);

  const save = async (followerId: string) => {
    const p = profiles[followerId];
    const { error } = await supabase.from("risk_profiles").update({
      max_daily_drawdown_pct: Number(p.max_daily_drawdown_pct),
      max_drawdown_pct: Number(p.max_drawdown_pct),
      max_lot_size: Number(p.max_lot_size),
      max_open_trades: Number(p.max_open_trades),
      min_margin_level: Number(p.min_margin_level),
      equity_floor: p.equity_floor ? Number(p.equity_floor) : null,
    }).eq("follower_account_id", followerId);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Risk profile saved" });
  };

  const upd = (id: string, k: string, v: any) => setProfiles({ ...profiles, [id]: { ...profiles[id], [k]: v } });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display gold-text">Risk Settings</h1>
      {followers.length === 0 && <p className="text-white/50">Connect an account first.</p>}
      {followers.map((f) => {
        const p = profiles[f.id] ?? {};
        return (
          <Card key={f.id} className="bg-[#0a0a0a] border-[#D4AF37]/20">
            <CardHeader><CardTitle className="text-[#F4D03F]">{f.account_number} <span className="text-xs text-white/50">{f.server}</span></CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Max Daily DD %" value={p.max_daily_drawdown_pct} onChange={(v) => upd(f.id, "max_daily_drawdown_pct", v)} />
              <Field label="Max Total DD %" value={p.max_drawdown_pct} onChange={(v) => upd(f.id, "max_drawdown_pct", v)} />
              <Field label="Max Lot Size" value={p.max_lot_size} onChange={(v) => upd(f.id, "max_lot_size", v)} />
              <Field label="Max Open Trades" value={p.max_open_trades} onChange={(v) => upd(f.id, "max_open_trades", v)} />
              <Field label="Min Margin Level %" value={p.min_margin_level} onChange={(v) => upd(f.id, "min_margin_level", v)} />
              <Field label="Equity Floor" value={p.equity_floor ?? ""} onChange={(v) => upd(f.id, "equity_floor", v)} />
              <div className="col-span-full"><Button onClick={() => save(f.id)} className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">Save</Button></div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: any; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs text-white/50">{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}