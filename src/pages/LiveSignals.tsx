import LiveTradeSignal from '@/components/LiveTradeSignal';
import BackButton from '@/components/common/BackButton';
import AasakiraAIButton from '@/components/education/AasakiraAIButton';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function LiveSignals() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <BackButton className="-ml-2" />

          <div className="flex items-center gap-2">
            <AasakiraAIButton
              topic="Live trade signals"
              context="You are viewing the Live Trade Signals page. Help explain what the trade history means and how to interpret TP hits, stop loss, and breakeven."
              userLevel="intermediate"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://t.me/+your_channel', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Telegram Channel
            </Button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Live Trade Signals</h1>
        <p className="text-muted-foreground">
          Real-time signals from our Telegram channel. Updates automatically.
        </p>
      </header>

      <main>
        <LiveTradeSignal />
      </main>
    </div>
  );
}

