import { useState } from 'react';
import LiveTradeSignal from '@/components/LiveTradeSignal';
import VipUpgradeModal from '@/components/VipUpgradeModal';
import {
  TradeStatsBanner,
  StickyTelegramCTA,
  FloatingVipBadge,
} from '@/components/TradeHistoryConversionExtras';

export default function LiveSignals() {
  const [vipOpen, setVipOpen] = useState(false);
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl pb-28">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Trading</p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">Signals · History</h1>
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
