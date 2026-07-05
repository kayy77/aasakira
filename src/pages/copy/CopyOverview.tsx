import { useFollowerAccounts, useCopyRelationships, useCopyActivity, useMasterAccounts } from "@/hooks/useCopyTrading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CopyOverview() {
  const { rows: followers } = useFollowerAccounts();
  const { rows: rels } = useCopyRelationships();
  const activity = useCopyActivity(10);
  const { rows: masters } = useMasterAccounts();

  const connected = followers.filter((f) => f.connection_status === "connected").length;
  const active = rels.filter((r) => r.status === "active").length;
  const success = activity.filter((a) => a.result === "success").length;
  const successRate = activity.length ? Math.round((success / activity.length) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display gold-text">Copy Trading Overview</h1>
          <p className="text-sm text-white/60">Real-time mirror of your master subscriptions.</p>
        </div>
        <Link to="/copy/masters"><Button className="bg-[#D4AF37] text-black hover:bg-[#F4D03F]">Browse Masters</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Connected Accounts" value={`${connected} / ${followers.length}`} />
        <StatCard label="Active Subscriptions" value={String(active)} />
        <StatCard label="Available Masters" value={String(masters.length)} />
        <StatCard label="Recent Success Rate" value={`${successRate}%`} />
      </div>

      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader><CardTitle className="text-[#F4D03F]">Recent Copy Activity</CardTitle></CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-white/50">No copy activity yet. Connect an account and subscribe to a master to begin.</p>
          ) : (
            <div className="space-y-2">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <div>
                    <span className="text-white/80 mr-2">{a.action}</span>
                    <span className="text-white/60">{a.symbol}</span>
                    <span className="text-white/40 ml-2">{a.volume ? `${a.volume} lots` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={a.result === "success" ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"}>{a.result}</Badge>
                    <span className="text-white/40 text-xs">{new Date(a.occurred_at).toLocaleTimeString()}</span>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-widest text-white/50">{label}</div>
        <div className="text-2xl font-display text-[#F4D03F] mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}