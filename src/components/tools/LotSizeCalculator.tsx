import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, AlertCircle } from "lucide-react";
import {
  INSTRUMENTS,
  calculateLotSize,
  getInstrument,
} from "@/lib/lotSize";

type Props = {
  variant?: "full" | "compact";
  defaultPair?: string;
  defaultStopPips?: number;
};

const GROUPS = ["FX", "JPY", "METAL", "INDEX", "CRYPTO"] as const;
const GROUP_LABEL: Record<(typeof GROUPS)[number], string> = {
  FX: "Forex Majors",
  JPY: "JPY Pairs",
  METAL: "Metals",
  INDEX: "Indices",
  CRYPTO: "Crypto",
};

export default function LotSizeCalculator({
  variant = "full",
  defaultPair = "EURUSD",
  defaultStopPips,
}: Props) {
  const [accountSize, setAccountSize] = useState<string>("5000");
  const [riskPercent, setRiskPercent] = useState<string>("1");
  const [stopPips, setStopPips] = useState<string>(
    defaultStopPips ? String(defaultStopPips) : "20",
  );
  const [pair, setPair] = useState<string>(defaultPair);

  const instrument = getInstrument(pair);

  const result = useMemo(
    () =>
      calculateLotSize({
        accountSize: Number(accountSize),
        riskPercent: Number(riskPercent),
        stopPips: Number(stopPips),
        instrument,
      }),
    [accountSize, riskPercent, stopPips, instrument],
  );

  const compact = variant === "compact";

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur">
      <CardHeader className={compact ? "pb-3" : undefined}>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-primary" />
          Lot Size Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={compact ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
          <Field label="Account size ($)">
            <Input
              type="number"
              inputMode="decimal"
              value={accountSize}
              onChange={(e) => setAccountSize(e.target.value)}
              placeholder="5000"
            />
          </Field>
          <Field label="Risk %">
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              placeholder="1"
            />
          </Field>
          <Field label="Stop loss (pips)">
            <Input
              type="number"
              inputMode="decimal"
              value={stopPips}
              onChange={(e) => setStopPips(e.target.value)}
              placeholder="20"
            />
          </Field>
          <Field label="Instrument">
            <Select value={pair} onValueChange={setPair}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {GROUPS.map((g) => {
                  const items = INSTRUMENTS.filter((i) => i.category === g);
                  if (!items.length) return null;
                  return (
                    <SelectGroup key={g}>
                      <SelectLabel>{GROUP_LABEL[g]}</SelectLabel>
                      {items.map((i) => (
                        <SelectItem key={i.symbol} value={i.symbol}>
                          {i.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {result.valid ? (
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <Stat label="Lot size" value={result.lots.toFixed(2)} accent />
            <Stat label="$ risk" value={`$${result.dollarRisk.toFixed(2)}`} />
            <Stat label="$ / pip" value={`$${result.pipValue.toFixed(2)}`} />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            {result.reason}
          </div>
        )}

        {!compact && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Estimates use standard contract sizes and approximate USD pip values.
            Always confirm with your broker before placing a trade.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-lg font-bold ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}