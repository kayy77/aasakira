import AccountLayout from "./_AccountLayout";
import { Card } from "@/components/ui/card";

export default function AIPreferences() {
  return (
    <AccountLayout title="AI Preferences" subtitle="Tune how the AI Coach analyzes your trading.">
      <Card className="lux-glass p-8 text-center">
        <div className="text-xs tracking-widest uppercase text-[#D4AF37]/70">Coming Soon</div>
        <p className="mt-3 text-sm text-white/55 max-w-md mx-auto">
          Coaching tone, risk style, trade-review depth and journal autopilot configuration ship with the AI Coach release.
        </p>
      </Card>
    </AccountLayout>
  );
}