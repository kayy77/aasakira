import { useEffect, useState } from "react";
import { useIsAdmin, useMasterAccounts } from "@/hooks/useCopyTrading";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function CopyAdmin() {
  const isAdmin = useIsAdmin();
  const { rows: masters } = useMasterAccounts();
  const [newMaster, setNewMaster] = useState({ name: "", broker: "", server: "", account_number: "" });
  const [event, setEvent] = useState({ master_account_id: "", event_type: "OPEN", symbol: "XAUUSD", type: "BUY", volume: "0.10", sl: "", tp: "" });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("copy_events").select("*").order("created_at", { ascending: false }).limit(20);
      setEvents(data ?? []);
    })();
  }, []);

  if (!isAdmin) return <div className="p-6 text-white/60">Admin only.</div>;

  const createMaster = async () => {
    const { error } = await supabase.from("master_accounts").insert(newMaster);
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Master created" });
    setNewMaster({ name: "", broker: "", server: "", account_number: "" });
  };

  const dispatch = async () => {
    const payload: any = { symbol: event.symbol, type: event.type, volume: Number(event.volume) };
    if (event.sl) payload.sl = Number(event.sl);
    if (event.tp) payload.tp = Number(event.tp);
    const { data, error } = await supabase.functions.invoke("copy-event-dispatch", {
      body: { master_account_id: event.master_account_id, event_type: event.event_type, payload },
    });
    if (error || (data as any)?.error) return toast({ title: "Dispatch failed", description: error?.message ?? (data as any)?.error, variant: "destructive" });
    toast({ title: "Event dispatched", description: `${(data as any)?.jobs_created ?? 0} jobs queued` });
  };

  const runProcessor = async () => {
    const { data, error } = await supabase.functions.invoke("copy-job-processor", { body: {} });
    if (error) return toast({ title: "Processor failed", description: error.message, variant: "destructive" });
    toast({ title: "Processor ran", description: JSON.stringify(data) });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display gold-text">Copy Admin</h1>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader><CardTitle className="text-[#F4D03F]">Provision Master</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><Label>Name</Label><Input value={newMaster.name} onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })} /></div>
          <div><Label>Broker</Label><Input value={newMaster.broker} onChange={(e) => setNewMaster({ ...newMaster, broker: e.target.value })} /></div>
          <div><Label>Server</Label><Input value={newMaster.server} onChange={(e) => setNewMaster({ ...newMaster, server: e.target.value })} /></div>
          <div><Label>Account #</Label><Input value={newMaster.account_number} onChange={(e) => setNewMaster({ ...newMaster, account_number: e.target.value })} /></div>
          <div className="col-span-full"><Button onClick={createMaster} className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">Create Master</Button></div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#F4D03F]">Dispatch Trade Event</CardTitle>
          <Button variant="outline" onClick={runProcessor}>Run Processor Now</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Master</Label>
            <Select value={event.master_account_id} onValueChange={(v) => setEvent({ ...event, master_account_id: v })}>
              <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>{masters.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Event</Label>
            <Select value={event.event_type} onValueChange={(v) => setEvent({ ...event, event_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">OPEN</SelectItem>
                <SelectItem value="MODIFY">MODIFY</SelectItem>
                <SelectItem value="PARTIAL_CLOSE">PARTIAL_CLOSE</SelectItem>
                <SelectItem value="FULL_CLOSE">FULL_CLOSE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Symbol</Label><Input value={event.symbol} onChange={(e) => setEvent({ ...event, symbol: e.target.value })} /></div>
          <div>
            <Label>Side</Label>
            <Select value={event.type} onValueChange={(v) => setEvent({ ...event, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="BUY">BUY</SelectItem><SelectItem value="SELL">SELL</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Volume</Label><Input value={event.volume} onChange={(e) => setEvent({ ...event, volume: e.target.value })} /></div>
          <div><Label>SL</Label><Input value={event.sl} onChange={(e) => setEvent({ ...event, sl: e.target.value })} /></div>
          <div><Label>TP</Label><Input value={event.tp} onChange={(e) => setEvent({ ...event, tp: e.target.value })} /></div>
          <div className="col-span-full"><Button onClick={dispatch} className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">Dispatch Event</Button></div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader><CardTitle className="text-[#F4D03F]">Recent Events</CardTitle></CardHeader>
        <CardContent>
          {events.length === 0 ? <p className="text-white/50">No events yet.</p> : (
            <div className="space-y-1 text-xs font-mono">
              {events.map((e) => (
                <div key={e.id} className="text-white/70">{new Date(e.created_at).toLocaleTimeString()} {e.event_type} {JSON.stringify(e.payload)}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}