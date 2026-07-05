import { useState } from "react";
import { useFollowerAccounts } from "@/hooks/useCopyTrading";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function CopyAccounts() {
  const { rows, loading, refresh } = useFollowerAccounts();
  const [form, setForm] = useState({ account_number: "", server: "", broker: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.account_number || !form.server || !form.password) {
      toast({ title: "Missing fields", description: "Account, server and password are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("follower-account-connect", { body: form });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: "Account connected", description: "Encrypted credentials stored securely." });
      setForm({ account_number: "", server: "", broker: "", password: "" });
      await refresh();
    } catch (e: any) {
      toast({ title: "Connection failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const disconnect = async (id: string) => {
    await supabase.functions.invoke("copy-emergency-stop", { body: { action: "disconnect", scope: "follower", target_id: id } });
    await refresh();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display gold-text">My Accounts</h1>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader><CardTitle className="text-[#F4D03F]">Connect Trading Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Account Number</Label><Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} /></div>
            <div><Label>Server</Label><Input value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} placeholder="e.g. ICMarkets-Live01" /></div>
            <div><Label>Broker (optional)</Label><Input value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })} /></div>
            <div><Label>Investor Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <p className="text-xs text-white/50">Credentials are encrypted with AES-256-GCM before storage. Use your investor (read-only) password when available.</p>
          <Button onClick={submit} disabled={submitting} className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">{submitting ? "Connecting…" : "Connect Account"}</Button>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader><CardTitle className="text-[#F4D03F]">Connected Accounts</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-white/50">Loading…</p> : rows.length === 0 ? (
            <p className="text-white/50">No accounts connected yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between border border-white/5 rounded-md p-3">
                  <div>
                    <div className="text-white">{r.account_number} <span className="text-white/40 text-xs ml-2">{r.server}</span></div>
                    <div className="text-xs text-white/50">{r.broker ?? "—"} • last sync {r.last_sync_at ? new Date(r.last_sync_at).toLocaleString() : "never"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={r.connection_status === "connected" ? "border-emerald-500 text-emerald-400" : r.connection_status === "error" ? "border-red-500 text-red-400" : "border-yellow-500 text-yellow-400"}>{r.connection_status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => disconnect(r.id)}>Disconnect</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}