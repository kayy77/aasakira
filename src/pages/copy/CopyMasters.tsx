import { useState } from "react";
import { useMasterAccounts, useFollowerAccounts, useCopyRelationships } from "@/hooks/useCopyTrading";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function CopyMasters() {
  const { rows: masters } = useMasterAccounts();
  const { rows: followers } = useFollowerAccounts();
  const { rows: rels, refresh } = useCopyRelationships();
  const [selected, setSelected] = useState<Record<string, { follower: string; mode: string; value: string }>>({});

  const subscribe = async (masterId: string) => {
    const s = selected[masterId];
    if (!s?.follower) { toast({ title: "Choose an account", variant: "destructive" }); return; }
    const config: any = s.mode === "fixed_lot" ? { lot_size: Number(s.value || 0.01) }
      : s.mode === "risk_percent" ? { risk_pct: Number(s.value || 1) }
      : { multiplier: Number(s.value || 1) };
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("copy_relationships").insert({
      master_account_id: masterId,
      follower_account_id: s.follower,
      user_id: userRes.user!.id,
      copy_mode: s.mode as any,
      copy_config: config,
      status: "active",
    });
    if (error) { toast({ title: "Subscribe failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Subscribed" });
    refresh();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display gold-text">Masters</h1>
      {masters.length === 0 && <p className="text-white/50">No master accounts available yet. Ask an admin to provision AASAKIRA masters.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {masters.map((m) => {
          const s = selected[m.id] ?? { follower: "", mode: "fixed_lot", value: "0.01" };
          const subscribed = rels.some((r) => r.master_account_id === m.id);
          return (
            <Card key={m.id} className="bg-[#0a0a0a] border-[#D4AF37]/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#F4D03F]">{m.name}</CardTitle>
                {subscribed && <Badge className="bg-emerald-600">Subscribed</Badge>}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-white/60">{m.broker ?? "—"} • {m.server ?? "—"}</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div><div className="text-white/40">Balance</div><div className="text-white">{m.balance ?? "—"}</div></div>
                  <div><div className="text-white/40">Growth</div><div className="text-emerald-400">{m.growth ?? "—"}%</div></div>
                  <div><div className="text-white/40">DD</div><div className="text-red-400">{m.drawdown ?? "—"}%</div></div>
                  <div><div className="text-white/40">Status</div><div>{m.status}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={s.follower} onValueChange={(v) => setSelected({ ...selected, [m.id]: { ...s, follower: v } })}>
                    <SelectTrigger><SelectValue placeholder="Your account" /></SelectTrigger>
                    <SelectContent>{followers.map((f) => <SelectItem key={f.id} value={f.id}>{f.account_number}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={s.mode} onValueChange={(v) => setSelected({ ...selected, [m.id]: { ...s, mode: v } })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed_lot">Fixed Lot</SelectItem>
                      <SelectItem value="risk_percent">Risk %</SelectItem>
                      <SelectItem value="balance_multiplier">Balance Multiplier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-white/50">
                    {s.mode === "fixed_lot" ? "Lot size" : s.mode === "risk_percent" ? "Risk % per trade" : "Multiplier (x)"}
                  </Label>
                  <Input value={s.value} onChange={(e) => setSelected({ ...selected, [m.id]: { ...s, value: e.target.value } })} />
                </div>
                <Button className="w-full bg-[#D4AF37] text-black hover:bg-[#F4D03F]" onClick={() => subscribe(m.id)}>Subscribe</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}