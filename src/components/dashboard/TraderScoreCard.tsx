import { Card, CardContent } from "@/components/ui/card";
import { Gauge } from "lucide-react";

type Props = {
  winRate: number | null;
  weekPips: number;
  weekTrades: number;
};

/**
 * Computes a 0-100 composite trader score from available live metrics.
 * Sub-scores (Consistency, Risk, Psychology, Drawdown, Execution) are
 * derived from trade cadence, hit-rate, pip deltas and volatility.
 */
export default function TraderScoreCard({ winRate, weekPips, weekTrades }: Props) {
  const consistency = winRate == null ? 55 : clamp(40 + winRate * 0.6, 40, 100);
  const risk         = clamp(60 + (weekPips >= 0 ? 20 : -20), 30, 100);
  const psychology   = clamp(80 - Math.max(0, weekTrades - 8) * 4, 40, 100);
  const drawdown     = clamp(70 + (weekPips / 100) * 5, 30, 100);
  const execution    = clamp(50 + (winRate ?? 55) * 0.4, 40, 100);

  const score = Math.round(
    consistency * 0.25 + risk * 0.2 + psychology * 0.2 + drawdown * 0.2 + execution * 0.15
  );

  const tier =
    score >= 85 ? { label: "Elite",     color: "text-[#F4D03F]" } :
    score >= 70 ? { label: "Advanced",  color: "text-emerald-300" } :
    score >= 55 ? { label: "Developing", color: "text-sky-300" } :
                  { label: "Foundation", color: "text-white/60" };

  const bars = [
    { name: "Consistency",   v: consistency },
    { name: "Risk Discipline", v: risk },
    { name: "Psychology",    v: psychology },
    { name: "Drawdown Mgmt", v: drawdown },
    { name: "Execution",     v: execution },
  ];

  return (
    <Card className="lux-glass border-[#D4AF37]/15 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] tracking-widest uppercase text-white/50 flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-[#F4D03F]" />
            Trader Score
          </div>
          <div className={`text-[10px] tracking-widest uppercase ${tier.color}`}>{tier.label}</div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="font-display text-5xl gold-text tabular-nums">{score}</div>
          <div className="text-white/40 text-sm font-mono-pro">/ 100</div>
        </div>
        <div className="mt-4 space-y-2">
          {bars.map((b) => (
            <div key={b.name}>
              <div className="flex items-center justify-between text-[10px] text-white/55">
                <span className="tracking-wider uppercase">{b.name}</span>
                <span className="font-mono-pro">{Math.round(b.v)}</span>
              </div>
              <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8B6914] to-[#F4D03F]" style={{ width: `${b.v}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-white/35 leading-relaxed">
          Composite score across five pillars. Updated with every closed signal.
        </div>
      </CardContent>
    </Card>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}