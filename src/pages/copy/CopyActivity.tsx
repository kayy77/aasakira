import { useCopyActivity } from "@/hooks/useCopyTrading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CopyActivity() {
  const rows = useCopyActivity(100);
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-display gold-text">Copy Activity</h1>
      <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
        <CardHeader><CardTitle className="text-[#F4D03F]">Execution Feed</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? <p className="text-white/50">No activity.</p> : (
            <table className="w-full text-sm">
              <thead className="text-white/40 text-xs uppercase">
                <tr><th className="text-left py-2">Time</th><th className="text-left">Action</th><th className="text-left">Symbol</th><th className="text-right">Volume</th><th className="text-right">Result</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-2 text-white/60 text-xs">{new Date(r.occurred_at).toLocaleString()}</td>
                    <td className="text-white">{r.action}</td>
                    <td className="text-white/80">{r.symbol ?? "—"}</td>
                    <td className="text-right text-white/80">{r.volume ?? "—"}</td>
                    <td className="text-right"><Badge variant="outline" className={r.result === "success" ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"}>{r.result ?? "—"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}