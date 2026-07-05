import { useCopyRelationships } from "@/hooks/useCopyTrading";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function CopySettings() {
  const { rows, refresh } = useCopyRelationships();

  const setStatus = async (id: string, status: "active" | "paused" | "stopped") => {
    const { error } = await supabase.from("copy_relationships").update({ status }).eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    refresh();
  };

  const emergencyStopAll = async () => {
    await supabase.functions.invoke("copy-emergency-stop", { body: { action: "stop", scope: "user" } });
    toast({ title: "All copy relationships stopped" });
    refresh();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display gold-text">Copy Settings</h1>
        <Button variant="destructive" onClick={emergencyStopAll}>Emergency Stop All</Button>
      </div>
      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader><CardTitle className="text-[#F4D03F]">Subscriptions</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? <p className="text-white/50">No subscriptions.</p> : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between border border-white/5 rounded-md p-3">
                  <div>
                    <div className="text-white">{r.master_accounts?.name}</div>
                    <div className="text-xs text-white/50">Account {r.follower_accounts?.account_number} • {r.copy_mode}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={r.status === "active" ? "border-emerald-500 text-emerald-400" : r.status === "paused" ? "border-yellow-500 text-yellow-400" : "border-red-500 text-red-400"}>{r.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => setStatus(r.id, r.status === "active" ? "paused" : "active")}>{r.status === "active" ? "Pause" : "Resume"}</Button>
                    <Button size="sm" variant="destructive" onClick={() => setStatus(r.id, "stopped")}>Stop</Button>
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