import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, Wifi, WifiOff } from "lucide-react";

type Row = {
  id: string;
  account_number: string;
  server: string;
  broker: string | null;
  connection_status: string;
  last_sync_at: string | null;
  last_error: string | null;
  balance: number | null;
  equity: number | null;
  currency: string | null;
};

type Sync = {
  follower_account_id: string;
  last_heartbeat: string | null;
  latency_ms: number | null;
  error_count: number;
  updated_at: string;
};

function ago(iso: string | null) {
  if (!iso) return "never";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function health(status: string, heartbeat: string | null) {
  if (status === "error") return { label: "Error", tone: "border-red-500 text-red-400", dot: "bg-red-500" };
  if (status === "disconnected")
    return { label: "Offline", tone: "border-white/20 text-white/50", dot: "bg-white/30" };
  const stale = !heartbeat || Date.now() - new Date(heartbeat).getTime() > 120_000;
  if (stale) return { label: "Stale", tone: "border-yellow-500 text-yellow-400", dot: "bg-yellow-500" };
  return { label: "Healthy", tone: "border-emerald-500 text-emerald-400", dot: "bg-emerald-500" };
}

export default function SyncStatusPanel() {
  const [accounts, setAccounts] = useState<Row[]>([]);
  const [syncs, setSyncs] = useState<Sync[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    const [{ data: a }, { data: s }] = await Promise.all([
      supabase.from("follower_accounts").select("*").order("created_at", { ascending: false }),
      supabase.from("sync_status").select("*"),
    ]);
    setAccounts((a as Row[]) ?? []);
    setSyncs((s as Sync[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("copy-sync-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "sync_status" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "follower_accounts" }, load)
      .subscribe();
    const poll = setInterval(load, 30_000);
    const clock = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [load]);

  const syncFor = (id: string) => syncs.find((s) => s.follower_account_id === id);

  return (
    <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[#F4D03F] flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" /> Connection Status
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={load} className="h-7 text-xs text-white/60">
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-2" data-tick={tick}>
        {loading ? (
          <p className="text-sm text-white/50">Loading…</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-white/50">No follower accounts connected yet.</p>
        ) : (
          accounts.map((a) => {
            const s = syncFor(a.id);
            const h = health(a.connection_status, s?.last_heartbeat ?? null);
            return (
              <div key={a.id} className="rounded-md border border-white/5 p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full ${h.dot} animate-pulse`} />
                    <span className="text-white text-sm truncate">{a.account_number}</span>
                    <span className="text-white/40 text-xs truncate">{a.server}</span>
                  </div>
                  <Badge variant="outline" className={`${h.tone} text-[10px]`}>
                    {h.label === "Healthy" ? (
                      <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                      <WifiOff className="h-3 w-3 mr-1" />
                    )}
                    {h.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <Metric label="Heartbeat" value={ago(s?.last_heartbeat ?? null)} />
                  <Metric label="Last sync" value={ago(a.last_sync_at)} />
                  <Metric label="Latency" value={s?.latency_ms != null ? `${s.latency_ms} ms` : "—"} />
                  <Metric label="Errors" value={String(s?.error_count ?? 0)} />
                </div>

                {(a.balance != null || a.equity != null) && (
                  <div className="flex gap-4 text-xs text-white/50">
                    <span>
                      Balance <span className="text-white/80 font-mono">{a.balance ?? "—"} {a.currency ?? ""}</span>
                    </span>
                    <span>
                      Equity <span className="text-white/80 font-mono">{a.equity ?? "—"} {a.currency ?? ""}</span>
                    </span>
                  </div>
                )}

                {a.last_error && <p className="text-xs text-red-400">{a.last_error}</p>}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="text-white/85 font-mono">{value}</div>
    </div>
  );
}
