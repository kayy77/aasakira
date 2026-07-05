import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CopyPerformance() {
  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, rejected: 0, pnl: 0 });
  useEffect(() => {
    (async () => {
      const { data: jobs } = await supabase.from("copy_jobs").select("status");
      const { data: acts } = await supabase.from("copy_activity").select("pnl");
      const total = jobs?.length ?? 0;
      const completed = jobs?.filter((j: any) => j.status === "completed").length ?? 0;
      const failed = jobs?.filter((j: any) => j.status === "failed").length ?? 0;
      const rejected = jobs?.filter((j: any) => j.status === "rejected").length ?? 0;
      const pnl = (acts ?? []).reduce((s: number, a: any) => s + (Number(a.pnl) || 0), 0);
      setStats({ total, completed, failed, rejected, pnl });
    })();
  }, []);
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display gold-text">Performance</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Jobs" value={String(stats.total)} />
        <StatCard label="Completed" value={String(stats.completed)} />
        <StatCard label="Failed" value={String(stats.failed)} />
        <StatCard label="Rejected" value={String(stats.rejected)} />
        <StatCard label="PnL" value={stats.pnl.toFixed(2)} />
      </div>
      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader><CardTitle className="text-[#F4D03F]">AI Reports</CardTitle></CardHeader>
        <CardContent><p className="text-white/50 text-sm">AI trader scores, risk reports and copy insights will populate here once analysis runs are enabled.</p></CardContent>
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