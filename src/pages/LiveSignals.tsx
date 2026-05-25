import { useState } from 'react';
import LiveTradeSignal from '@/components/LiveTradeSignal';
import BackButton from '@/components/common/BackButton';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import VipUpgradeModal from '@/components/VipUpgradeModal';
import {
  TradeStatsBanner,
  StickyTelegramCTA,
  FloatingVipBadge,
} from '@/components/TradeHistoryConversionExtras';

export default function LiveSignals() {
  const [vipOpen, setVipOpen] = useState(false);
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl pb-28">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <BackButton className="-ml-2" />

          <button
            onClick={() => setVipOpen(true)}
            className="group relative inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-b from-zinc-900 to-black px-4 py-2 text-sm font-semibold text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-amber-300/70 hover:text-white"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 transition group-hover:text-amber-300" />
            <span className="tracking-wide">Upgrade to VIP</span>
            <span className="ml-1 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/30">
              −50%
            </span>
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-1">Trade History</h1>
        <p className="text-muted-foreground text-sm">
          Every trade we've sent — wins, losses, and pips. Updated in real time.
        </p>
      </header>

      <TradeStatsBanner />

      <main>
        <LiveTradeSignal />
      </main>
      <VipUpgradeModal open={vipOpen} onOpenChange={setVipOpen} />
      <FloatingVipBadge onClick={() => setVipOpen(true)} />
      <StickyTelegramCTA />
    </div>
  );
}
