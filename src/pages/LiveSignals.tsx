import LiveTradeSignal from '@/components/LiveTradeSignal';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function LiveSignals() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Trade Signals</h1>
        <p className="text-muted-foreground">
          Real-time signals from our Telegram channel. Updates automatically.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={() => window.open('https://t.me/+your_channel', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Join Telegram Channel
        </Button>
      </div>
      
      <LiveTradeSignal />
    </div>
  );
}
