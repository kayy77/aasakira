import { useState } from 'react';
import LiveTradeSignal from '@/components/LiveTradeSignal';
import BackButton from '@/components/common/BackButton';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
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

          <Button
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold"
            onClick={() => setVipOpen(true)}
          >
            <Star className="w-4 h-4 mr-1 fill-current" />
            Upgrade to VIP
          </Button>
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
