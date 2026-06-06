import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function ComingSoon({ title, description, items }: { title: string; description: string; items?: string[] }) {
  return (
    <div className="p-8">
      <Card className="lux-glass p-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 text-[10px] tracking-[0.3em] uppercase text-[#F4D03F] mb-6">
          <Sparkles className="w-3 h-3" /> Coming Soon
        </div>
        <h1 className="font-display text-4xl gold-text mb-3">{title}</h1>
        <p className="text-white/60 max-w-xl mx-auto">{description}</p>
        {items && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
            {items.map((i) => (
              <div key={i} className="lux-glass rounded-xl px-4 py-3 text-sm text-white/70">{i}</div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
