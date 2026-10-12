import { useCallback, useEffect, useState } from "react";
import { useIsAdmin } from "@/hooks/useCopyTrading";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Pause, Play, Square, RefreshCw, Send } from "lucide-react";

type Action = "pause" | "resume" | "stop" | "disconnect";

const card = "bg-[#0a0a0a] border-[#D4AF37]/20";
const gold = "bg-[#D4AF37] text-black hover:bg-[#F4D03F]";

function tone(s: string) {
  if (["active", "connected", "completed"].includes(s)) return "border-emerald-500 text-emerald-400";
  if (["paused", "pending", "processing", "connecting", "syncing"].includes(s)) return "border-yellow-500 text-yellow-400";
  return "border-red-500 text-red-400";
}
const S = ({ s }: { s: string }) => <Badge variant="outline" className={`${tone(s)} text-[10px]`}>{s}</Badge>;
const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

async function control(action: Action, scope: string, target_id?: string) {
  const { data, error } = await supabase.functions.invoke("copy-emergency-stop", { body: { action, scope, target_id } });
  if (error || (data as any)?.error) {
    toast({ title: "Action failed", description: error?.message ?? (data as any)?.error, variant: "destructive" });
    return false;
  }
  toast({ title: `Copying ${action === "resume" ? "resumed" : action === "stop" ? "stopped" : action === "disconnect" ? "disconnected" : "paused"}` });
  return true;
}

function Controls({ status, scope, id, onDone, disconnect }: { status: string; scope: string; id?: string; onDone: () => void; disconnect?: boolean }) {
  const run = async (a: Action) => { if (await control(a, scope, id)) onDone(); };
  return (
    <div className="flex gap-1 justify-end">
      {status === "paused" || status === "stopped" ? (
        <Button size="sm" variant="ghost" className="h-7 text-emerald-400" onClick={() => run("resume")}><Play className="h-3.5 w-3.5 mr-1" />Resume</Button>
      ) : (
        <Button size="sm" variant="ghost" className="h-7 text-yellow-400" onClick={() => run("pause")}><Pause className="h-3.5 w-3.5 mr-1" />Pause</Button>
      )}
      {status !== "stopped" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 text-red-400"><Square className="h-3.5 w-3.5 mr-1" />Stop</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Stop copying?</AlertDialogTitle>
              <AlertDialogDescription>New trades will no longer be copied. Positions already open stay open until closed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => run("stop")}>Stop copying</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {disconnect && <Button size="sm" variant="ghost" className="h-7 text-white/50" onClick={() => run("disconnect")}>Disconnect</Button>}
    </div>
  );
}

export default function CopyAdmin() {
  const isAdmin = useIsAdmin();
  const [masters, setMasters] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [rels, setRels] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [newMaster, setNewMaster] = useState({ name: "", broker: "", server: "", account_number: "" });
  const [ev, setEv] = useState({ master_account_id: "", event_type: "OPEN", symbol: "XAUUSD", type: "BUY", volume: "0.10", sl: "", tp: "" });
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const [m, f, r, j] = await Promise.all([
      supabase.from("master_accounts").select("*").order("created_at", { ascending: false }),
      supabase.from("follower_accounts").select("id, user_id, account_number, server, broker, connection_status, balance, equity, currency, last_sync_at, last_error").order("created_at", { ascending: false }),
      supabase.from("copy_relationships").select("id, status, copy_mode, copy_config, created_at, master_accounts(name), follower_accounts(account_number)").order("created_at", { ascending: false }),
      supabase.from("copy_jobs").select("id, status, broker_ticket, executed_volume, executed_price, last_error, created_at, executed_at, follower_accounts(account_number), copy_events(event_type, payload)").order("created_at", { ascending: false }).limit(40),
    ]);
    setMasters(m.data ?? []); setFollowers(f.data ?? []); setRels(r.data ?? []); setJobs(j.data ?? []);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    load();
    const ch = supabase.channel("copy-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "copy_jobs" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "copy_relationships" }, load)
      .subscribe();
    const t = setInterval(load, 20_000);
    return () => { supabase.removeChannel(ch); clearInterval(t); };
  }, [isAdmin, load]);

  if (!isAdmin) return <div className="p-6 text-white/60">Admin only.</div>;

  const createMaster = async () => {
    if (!newMaster.name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    const { error } = await supabase.from("master_accounts").insert(newMaster);
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Master created" });
    setNewMaster({ name: "", broker: "", server: "", account_number: "" });
    load();
  };

  const dispatch = async () => {
    if (!ev.master_account_id) return toast({ title: "Choose a master first", variant: "destructive" });
    const vol = Number(ev.volume);
    if (!ev.symbol.trim() || !(vol > 0)) return toast({ title: "Enter a symbol and a lot size above 0", variant: "destructive" });
    const payload: any = { symbol: ev.symbol.trim().toUpperCase(), type: ev.type, volume: vol };
    if (ev.sl) payload.sl = Number(ev.sl);
    if (ev.tp) payload.tp = Number(ev.tp);
    setSending(true);
    const { data, error } = await supabase.functions.invoke("copy-event-dispatch", { body: { master_account_id: ev.master_account_id, event_type: ev.event_type, payload } });
    setSending(false);
    if (error || (data as any)?.error) return toast({ title: "Send failed", description: error?.message ?? (data as any)?.error, variant: "destructive" });
    const x = (data as any)?.execution;
    toast({ title: "Trade sent to followers", description: `${(data as any)?.jobs_created ?? 0} copies queued${x ? ` · ${x.processed ?? 0} done, ${x.failed ?? 0} failed, ${x.rejected ?? 0} refused` : ""}` });
    load();
  };

  const runProcessor = async () => {
    const { data, error } = await supabase.functions.invoke("copy-job-processor", { body: {} });
    if (error) return toast({ title: "Retry failed", description: error.message, variant: "destructive" });
    toast({ title: "Pending copies processed", description: `${(data as any)?.processed ?? 0} done, ${(data as any)?.failed ?? 0} failed` });
    load();
  };

  const activeRels = rels.filter((r) => r.status === "active").length;
  const connected = followers.filter((f) => f.connection_status === "connected").length;
  const failed24 = jobs.filter((j) => j.status === "failed" && Date.now() - new Date(j.created_at).getTime() < 86_400_000).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display gold-text">Copy Trading Admin</h1>
          <p className="text-sm text-white/60">Send master trades, manage followers and pause or stop copying.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5 mr-1" />Refresh</Button>
          <Button variant="outline" size="sm" className="text-emerald-400" onClick={async () => (await control("resume", "all")) && load()}><Play className="h-3.5 w-3.5 mr-1" />Resume all</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive"><Pause className="h-3.5 w-3.5 mr-1" />Pause all copying</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Pause copying for everyone?</AlertDialogTitle>
                <AlertDialogDescription>Every active follower stops receiving new trades until you resume. Open positions are not closed.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={async () => (await control("pause", "all")) && load()}>Pause all</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["Masters", masters.length], ["Followers connected", `${connected} / ${followers.length}`], ["Active copies", activeRels], ["Failed (24h)", failed24]].map(([l, v]) => (
          <Card key={String(l)} className={card}><CardContent className="p-4">
            <div className="text-xs uppercase tracking-widest text-white/50">{l}</div>
            <div className="text-2xl font-display text-[#F4D03F] mt-1">{v}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="trade">
        <TabsList>
          <TabsTrigger value="trade">Master trade</TabsTrigger>
          <TabsTrigger value="masters">Masters</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="copies">Copy links</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="trade">
          <Card className={card}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#F4D03F]">Enter master trade</CardTitle>
              <Button variant="outline" size="sm" onClick={runProcessor}>Retry pending copies</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Master</Label>
                <Select value={ev.master_account_id} onValueChange={(v) => setEv({ ...ev, master_account_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                  <SelectContent>{masters.filter((m) => m.is_active).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select value={ev.event_type} onValueChange={(v) => setEv({ ...ev, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="MODIFY">Change SL / TP</SelectItem>
                    <SelectItem value="PARTIAL_CLOSE">Partial close</SelectItem>
                    <SelectItem value="FULL_CLOSE">Full close</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Symbol</Label><Input value={ev.symbol} onChange={(e) => setEv({ ...ev, symbol: e.target.value })} /></div>
              <div>
                <Label>Side</Label>
                <Select value={ev.type} onValueChange={(v) => setEv({ ...ev, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="BUY">Buy</SelectItem><SelectItem value="SELL">Sell</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Lots</Label><Input type="number" step="0.01" value={ev.volume} onChange={(e) => setEv({ ...ev, volume: e.target.value })} /></div>
              <div><Label>Stop loss</Label><Input type="number" value={ev.sl} onChange={(e) => setEv({ ...ev, sl: e.target.value })} /></div>
              <div><Label>Take profit</Label><Input type="number" value={ev.tp} onChange={(e) => setEv({ ...ev, tp: e.target.value })} /></div>
              <div className="col-span-full flex items-center gap-3">
                <Button onClick={dispatch} disabled={sending} className={gold}><Send className="h-4 w-4 mr-1" />{sending ? "Sending…" : "Send to followers"}</Button>
                <span className="text-xs text-yellow-400/80">Orders go to followers' cTrader demo accounts only.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="masters" className="space-y-4">
          <Card className={card}>
            <CardHeader><CardTitle className="text-[#F4D03F]">Add master</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(["name", "broker", "server", "account_number"] as const).map((k) => (
                <div key={k}><Label className="capitalize">{k.replace("_", " ")}</Label><Input value={newMaster[k]} onChange={(e) => setNewMaster({ ...newMaster, [k]: e.target.value })} /></div>
              ))}
              <div className="col-span-full"><Button onClick={createMaster} className={gold}>Create master</Button></div>
            </CardContent>
          </Card>
          <Card className={card}><CardContent className="p-4 space-y-2">
            {masters.length === 0 ? <p className="text-sm text-white/50">No masters yet.</p> : masters.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 text-sm">
                <div className="min-w-0">
                  <span className="text-white">{m.name}</span> <span className="text-white/40 text-xs">{m.broker} {m.account_number}</span>
                  <div className="text-xs text-white/40">{rels.filter((r) => r.master_accounts?.name === m.name && r.status === "active").length} active followers</div>
                </div>
                <div className="flex items-center gap-2"><S s={m.status} /><Controls status={m.status === "disabled" ? "stopped" : m.status} scope="master" id={m.id} onDone={load} /></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="followers">
          <Card className={card}><CardContent className="p-4 space-y-2">
            {followers.length === 0 ? <p className="text-sm text-white/50">No follower accounts yet.</p> : followers.map((f) => {
              const fr = rels.filter((r) => r.follower_accounts?.account_number === f.account_number);
              const status = fr.some((r) => r.status === "active") ? "active" : fr.some((r) => r.status === "paused") ? "paused" : "stopped";
              return (
                <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-2 text-sm">
                  <div className="min-w-0">
                    <span className="text-white font-mono">{f.account_number}</span> <span className="text-white/40 text-xs">{f.broker ?? ""} {f.server}</span>
                    <div className="text-xs text-white/40">
                      Balance {f.balance ?? "—"} {f.currency ?? ""} · Last sync {when(f.last_sync_at)}
                      {f.last_error && <span className="text-red-400"> · {f.last_error}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2"><S s={f.connection_status} /><S s={status} /><Controls status={status} scope="follower" id={f.id} onDone={load} disconnect /></div>
                </div>
              );
            })}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="copies">
          <Card className={card}><CardContent className="p-4 space-y-2">
            {rels.length === 0 ? <p className="text-sm text-white/50">No copy links yet.</p> : rels.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-2 text-sm">
                <div>
                  <span className="text-white">{r.master_accounts?.name ?? "—"}</span>
                  <span className="text-white/40"> → </span>
                  <span className="text-white font-mono">{r.follower_accounts?.account_number ?? "—"}</span>
                  <div className="text-xs text-white/40">{r.copy_mode.replace("_", " ")} · {JSON.stringify(r.copy_config)}</div>
                </div>
                <div className="flex items-center gap-2"><S s={r.status} /><Controls status={r.status} scope="relationship" id={r.id} onDone={load} /></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className={card}><CardContent className="p-4 space-y-1.5">
            {jobs.length === 0 ? <p className="text-sm text-white/50">No copied orders yet.</p> : jobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between gap-2 text-xs border-b border-white/5 pb-1.5">
                <div className="min-w-0 truncate">
                  <span className="text-white/80">{j.copy_events?.event_type}</span>{" "}
                  <span className="text-white/60">{j.copy_events?.payload?.symbol}</span>{" "}
                  <span className="text-white/40 font-mono">{j.follower_accounts?.account_number}</span>{" "}
                  {j.executed_volume != null && <span className="text-white/40">{j.executed_volume} lots</span>}{" "}
                  {j.executed_price != null && <span className="text-white/40 font-mono">@ {j.executed_price}</span>}
                  {j.broker_ticket && <span className="text-white/30 font-mono"> #{j.broker_ticket}</span>}
                  {j.last_error && j.status !== "completed" && <span className="text-red-400/80"> — {j.last_error}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0"><S s={j.status} /><span className="text-white/40">{when(j.executed_at ?? j.created_at)}</span></div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
