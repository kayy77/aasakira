import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCheckForModule, loadRealTrades, type CheckResult, type TradeSource } from "@/lib/academy/realTradeChecks";
import { Activity, CheckCircle2, Link2, RefreshCw, XCircle } from "lucide-react";

type Props = {
  module: string;
  verified: boolean;
  onVerified: (evidence: { source: TradeSource; result: CheckResult }) => Promise<void>;
};

export default function RealTradeTaskPanel({ module, verified, onVerified }: Props) {
  const check = getCheckForModule(module);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<TradeSource>("none");
  const [result, setResult] = useState<CheckResult | null>(null);

  const run = useCallback(async () => {
    if (!check) return;
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setLoading(false);
    const { source, trades } = await loadRealTrades(data.user.id);
    const r = source === "none" ? null : check.evaluate(trades);
    setSource(source);
    setResult(r);
    setLoading(false);
    if (r?.passed && !verified) await onVerified({ source, result: r });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check, verified]);

  useEffect(() => { run(); }, [run]);

  if (!check) return null;

  return (
    <div className="rounded-md border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-[#F4D03F]">
          <Activity className="h-4 w-4" /> Prove it on your real trades
        </div>
        <div className="flex items-center gap-2">
          {source !== "none" && (
            <Badge variant="outline" className="text-[10px] border-white/15 text-white/60">
              {source === "account" ? "Linked account" : "Journal"} · last 90 days
            </Badge>
          )}
          <Button size="sm" variant="ghost" onClick={run} disabled={loading} className="h-7 text-white/60">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      <p className="text-sm text-white/75">{check.requirement}</p>

      {loading ? (
        <p className="text-xs text-white/40">Checking your trades…</p>
      ) : source === "none" ? (
        <div className="space-y-2">
          <p className="text-xs text-white/60">No real trades found yet. Link a trading account, or log trades in your Journal — we check whichever has data.</p>
          <Button asChild size="sm" variant="outline" className="border-[#D4AF37]/40 text-[#F4D03F]">
            <Link to="/account/trading-accounts"><Link2 className="h-3.5 w-3.5 mr-1" /> Link account</Link>
          </Button>
        </div>
      ) : result ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {result.passed || verified ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-amber-400" />
            )}
            <span className="font-mono text-sm text-white">{result.metric}</span>
            {(result.passed || verified) && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/40 text-[10px]">Proven</Badge>
            )}
          </div>
          <p className="text-xs text-white/65"><span className="text-[#F4D03F]">Your insight: </span>{result.insight}</p>
        </div>
      ) : null}
    </div>
  );
}
