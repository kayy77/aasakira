import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, GraduationCap, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

type Row = {
  id: string; pair: string; direction: string; strategy: string; status: string;
  entry_price: number; exit_price: number | null; entry_time: string; exit_time: string | null;
  lot_size: number | null; result_pips: number | null; result_percentage: number | null;
  fees: number | null; notes: string | null; feelings: string | null; mistakes: string | null;
};

const num = (v: string) => (v.trim() === "" ? null : Number(v));
const schema = z.object({
  pair: z.string().trim().min(2, "Enter a symbol").max(20).regex(/^[A-Za-z0-9./]+$/, "Letters and numbers only"),
  direction: z.enum(["LONG", "SHORT"]),
  status: z.enum(["OPEN", "CLOSED", "CANCELLED"]),
  strategy: z.string().trim().min(1, "Enter a strategy or setup").max(100),
  entry_price: z.number({ invalid_type_error: "Entry price required" }).positive("Entry price required"),
  exit_price: z.number().positive().nullable(),
  lot_size: z.number().positive().max(1000).nullable(),
  result_pips: z.number().min(-100000).max(100000).nullable(),
  result_percentage: z.number().min(-100).max(1000).nullable(),
  fees: z.number().min(0).nullable(),
  entry_time: z.string().min(1, "Entry time required"),
  exit_time: z.string().nullable(),
  notes: z.string().max(2000).nullable(),
  feelings: z.string().max(500).nullable(),
  mistakes: z.string().max(500).nullable(),
});

const empty = {
  pair: "", direction: "LONG", status: "CLOSED", strategy: "", entry_price: "", exit_price: "",
  lot_size: "", result_pips: "", result_percentage: "", fees: "", entry_time: "", exit_time: "",
  notes: "", feelings: "", mistakes: "",
};
type Form = typeof empty;
const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default function TradingJournal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [sendLive, setSendLive] = useState(false);
  const [slTp, setSlTp] = useState({ sl: "", tp: "" });

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("journal_entries").select("*").eq("user_id", user.id).order("entry_time", { ascending: false }).limit(500);
    if (error) toast({ title: "Couldn't load journal", description: error.message, variant: "destructive" });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id]);

  const stats = useMemo(() => {
    const closed = rows.filter((r) => r.status === "CLOSED" && r.result_pips != null);
    const wins = closed.filter((r) => (r.result_pips ?? 0) > 0).length;
    return {
      total: rows.length,
      open: rows.filter((r) => r.status === "OPEN").length,
      winRate: closed.length ? Math.round((wins / closed.length) * 100) : null,
      pips: closed.reduce((s, r) => s + (r.result_pips ?? 0), 0),
    };
  }, [rows]);

  const startNew = () => { setEditId(null); setForm({ ...empty, entry_time: toLocal(new Date().toISOString()) }); setOpen(true); };
  const startEdit = (r: Row) => {
    setEditId(r.id);
    setForm({
      pair: r.pair, direction: r.direction, status: r.status, strategy: r.strategy,
      entry_price: String(r.entry_price), exit_price: r.exit_price?.toString() ?? "", lot_size: r.lot_size?.toString() ?? "",
      result_pips: r.result_pips?.toString() ?? "", result_percentage: r.result_percentage?.toString() ?? "", fees: r.fees?.toString() ?? "",
      entry_time: toLocal(r.entry_time), exit_time: toLocal(r.exit_time), notes: r.notes ?? "", feelings: r.feelings ?? "", mistakes: r.mistakes ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!user) return;
    const parsed = schema.safeParse({
      ...form,
      entry_price: num(form.entry_price) ?? NaN, exit_price: num(form.exit_price), lot_size: num(form.lot_size),
      result_pips: num(form.result_pips), result_percentage: num(form.result_percentage), fees: num(form.fees),
      exit_time: form.exit_time || null, notes: form.notes.trim() || null, feelings: form.feelings.trim() || null, mistakes: form.mistakes.trim() || null,
    });
    if (!parsed.success) return toast({ title: "Check the form", description: parsed.error.issues[0].message, variant: "destructive" });
    const d = parsed.data;
    const payload = {
      ...d, user_id: user.id, pair: d.pair.toUpperCase(),
      entry_time: new Date(d.entry_time).toISOString(), exit_time: d.exit_time ? new Date(d.exit_time).toISOString() : null,
    } as any;
    const execute = !editId && sendLive && d.status === "OPEN";
    if (execute) {
      if (!d.lot_size) return toast({ title: "Lot size required", description: "Enter a lot size to place a live order.", variant: "destructive" });
      if (!confirm(`Place a REAL ${d.direction === "LONG" ? "BUY" : "SELL"} order for ${d.lot_size} lots of ${payload.pair} on your cTrader account?`)) return;
    }
    setSaving(true);
    const res = editId
      ? await supabase.from("journal_entries").update(payload).eq("id", editId).select("id").single()
      : await supabase.from("journal_entries").insert(payload).select("id").single();
    if (res.error) { setSaving(false); return toast({ title: "Couldn't save trade", description: res.error.message, variant: "destructive" }); }
    if (execute) {
      const { data, error } = await supabase.functions.invoke("ctrader-execute", {
        body: { journalEntryId: res.data.id, symbol: payload.pair, side: d.direction === "LONG" ? "BUY" : "SELL", lots: d.lot_size, stopLoss: num(slTp.sl), takeProfit: num(slTp.tp) },
      });
      let msg = error?.message;
      if (error && (error as any).context?.json) { try { msg = (await (error as any).context.json()).error ?? msg; } catch { /* keep */ } }
      if (error) toast({ title: "Saved, but cTrader order failed", description: String(msg), variant: "destructive" });
      else toast({ title: "Order filled on cTrader", description: `Position ${data.positionId ?? ""}${data.fillPrice ? ` @ ${data.fillPrice}` : ""}${data.live ? "" : " (demo account)"}` });
    } else toast({ title: editId ? "Trade updated" : "Trade added" });
    setSaving(false);
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this trade?")) return;
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) return toast({ title: "Couldn't delete", description: error.message, variant: "destructive" });
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const f = (k: keyof Form) => ({ value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold"><BookOpen className="h-6 w-6 text-primary" /> Trading Journal</h1>
          <p className="text-sm text-muted-foreground">Log your trades, positions and results. Academy tasks and the Academy Journal read from here.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/academy/journal"><GraduationCap className="mr-2 h-4 w-4" />Academy Journal</Link></Button>
          <Button onClick={startNew}><Plus className="mr-2 h-4 w-4" />New trade</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Trades", stats.total], ["Open positions", stats.open],
          ["Win rate", stats.winRate == null ? "—" : `${stats.winRate}%`],
          ["Net pips", `${stats.pips > 0 ? "+" : ""}${stats.pips.toFixed(1)}`],
        ].map(([l, v]) => (
          <Card key={l as string}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 font-mono text-xl font-semibold">{v}</div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No trades yet. Press “New trade” to log your first one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-muted-foreground">
                  <tr>{["Date", "Symbol", "Side", "Size", "Entry", "Exit", "Pips", "Status", "Setup", ""].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(r.entry_time).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-3 py-2 font-medium">{r.pair}</td>
                      <td className="px-3 py-2"><Badge variant={r.direction === "LONG" ? "default" : "destructive"}>{r.direction === "LONG" ? "Buy" : "Sell"}</Badge></td>
                      <td className="px-3 py-2 font-mono">{r.lot_size ?? "—"}</td>
                      <td className="px-3 py-2 font-mono">{r.entry_price}</td>
                      <td className="px-3 py-2 font-mono">{r.exit_price ?? "—"}</td>
                      <td className={`px-3 py-2 font-mono ${(r.result_pips ?? 0) > 0 ? "text-primary" : (r.result_pips ?? 0) < 0 ? "text-destructive" : ""}`}>{r.result_pips ?? "—"}</td>
                      <td className="px-3 py-2"><Badge variant="outline">{r.status.toLowerCase()}</Badge></td>
                      <td className="px-3 py-2 max-w-[160px] truncate text-muted-foreground">{r.strategy}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(r)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit trade" : "New trade"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div><Label>Symbol</Label><Input placeholder="XAUUSD" {...f("pair")} /></div>
            <div><Label>Side</Label>
              <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="LONG">Buy</SelectItem><SelectItem value="SHORT">Sell</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="OPEN">Open</SelectItem><SelectItem value="CLOSED">Closed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Lot size</Label><Input type="number" step="0.01" {...f("lot_size")} /></div>
            <div><Label>Entry price</Label><Input type="number" step="any" {...f("entry_price")} /></div>
            <div><Label>Exit price</Label><Input type="number" step="any" {...f("exit_price")} /></div>
            <div><Label>Entry time</Label><Input type="datetime-local" {...f("entry_time")} /></div>
            <div><Label>Exit time</Label><Input type="datetime-local" {...f("exit_time")} /></div>
            <div><Label>Result (pips)</Label><Input type="number" step="any" {...f("result_pips")} /></div>
            <div><Label>Result (%)</Label><Input type="number" step="any" {...f("result_percentage")} /></div>
            <div><Label>Fees</Label><Input type="number" step="any" {...f("fees")} /></div>
            <div><Label>Setup / strategy</Label><Input placeholder="London breakout" {...f("strategy")} /></div>
            <div className="col-span-2 md:col-span-3"><Label>Notes</Label><Textarea rows={3} {...f("notes")} /></div>
            <div className="col-span-2 md:col-span-1"><Label>How you felt</Label><Input {...f("feelings")} /></div>
            <div className="col-span-2"><Label>Mistakes</Label><Input {...f("mistakes")} /></div>
          </div>
          {!editId && form.status === "OPEN" && (
            <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={sendLive} onChange={(e) => setSendLive(e.target.checked)} />
                Also place this as a real market order on my cTrader account
              </label>
              {sendLive && (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Stop loss price</Label><Input type="number" step="any" value={slTp.sl} onChange={(e) => setSlTp({ ...slTp, sl: e.target.value })} /></div>
                  <div><Label>Take profit price</Label><Input type="number" step="any" value={slTp.tp} onChange={(e) => setSlTp({ ...slTp, tp: e.target.value })} /></div>
                  <p className="col-span-2 text-xs text-muted-foreground">Fills at market price. Real money is at risk.</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save trade</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
