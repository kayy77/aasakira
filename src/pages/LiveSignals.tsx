import LiveTradeSignal from '@/components/LiveTradeSignal';
import BackButton from '@/components/common/BackButton';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function LiveSignals() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <BackButton className="-ml-2" />

          <Button
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold"
            onClick={() => window.open('https://wa.me/message/GOHILXTX2HIFO1', '_blank')}
          >
            <Star className="w-4 h-4 mr-1 fill-current" />
            Upgrade to VIP
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-1">Live Trade Signals</h1>
        <p className="text-muted-foreground text-sm">
          Real-time signals from our Telegram channels. Updates automatically.
        </p>
      </header>

      <main>
        <LiveTradeSignal />
      </main>
    </div>
  );
}
