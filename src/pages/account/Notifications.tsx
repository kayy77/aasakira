import AccountLayout from "./_AccountLayout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function Notifications() {
  return (
    <AccountLayout title="Notifications" subtitle="Choose where AASAKIRA reaches you.">
      <div className="space-y-4 max-w-2xl">
        {[
          { k: "Signal alerts", d: "New live signals fire instantly." },
          { k: "Trade closures", d: "Win / loss results pushed in real time." },
          { k: "Weekly recap email", d: "Monday 9am performance digest." },
          { k: "AI Coach reviews", d: "Daily + weekly intelligence summaries." },
        ].map((i) => (
          <Card key={i.k} className="lux-glass p-5 flex items-center justify-between">
            <div>
              <div className="text-sm">{i.k}</div>
              <div className="text-xs text-white/45 mt-0.5">{i.d}</div>
            </div>
            <Switch defaultChecked />
          </Card>
        ))}
        <p className="text-[11px] text-white/40 tracking-widest uppercase">Preferences sync coming soon.</p>
      </div>
    </AccountLayout>
  );
}