import LotSizeCalculator from "@/components/tools/LotSizeCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function LotSizeCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Tools
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Lot Size Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Size every trade with precision. Plug in your account, risk, and stop —
          we'll do the math.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LotSizeCalculator variant="full" />
        </div>
        <Card className="border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="p-4 space-y-3 text-sm">
            <h3 className="font-semibold text-foreground">How it works</h3>
            <ol className="space-y-2 text-muted-foreground text-xs leading-relaxed list-decimal list-inside">
              <li>Enter your account size in USD.</li>
              <li>Choose how much you're willing to risk per trade (1–2% is standard).</li>
              <li>Enter your stop loss in pips for the trade.</li>
              <li>Pick the instrument you're trading.</li>
            </ol>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="font-semibold text-primary mb-1">Pro tip</div>
              <p className="text-muted-foreground leading-relaxed">
                Risking the same % per trade keeps your equity curve smooth.
                A losing streak at 1% risk is survivable. At 5% it's catastrophic.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}