
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Activity } from 'lucide-react';

const MYFXBOOK_ACCOUNT_ID = '11992764';

const MyFxBookStats = () => {
  return (
    <div className="py-16 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-medium mb-4">
          <Activity className="w-3.5 h-3.5" />
          Verified Track Record
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Live Account Performance
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real, verified results from our personal trading account — fully transparent and audited on MyFxBook.
        </p>
      </div>

      <Card className="p-4 md:p-6 bg-gradient-to-br from-green-900/15 via-background to-blue-900/10 border-green-500/20 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <img 
              src="https://static.mfbcdn.net/images/logo.png" 
              alt="MyFxBook" 
              className="h-6 opacity-80"
            />
            <div>
              <h3 className="font-bold text-lg">KHAI Account</h3>
              <p className="text-xs text-muted-foreground">Real (GBP) · STARTRADER · 1:500 · MT5</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              ✓ Track Record Verified
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              ✓ Live Update
            </Badge>
          </div>
        </div>

        {/* MyFxBook Large Widget - shows growth chart + stats */}
        <div className="rounded-lg overflow-hidden border border-white/10 mb-4 bg-black/20">
          <iframe
            src={`https://widgets.myfxbook.com/widgets/${MYFXBOOK_ACCOUNT_ID}/large.html`}
            width="100%"
            height="350"
            style={{ border: 'none' }}
            title="MyFxBook Live Performance"
            allowTransparency
          />
        </div>

        {/* MyFxBook Small Widget - compact summary */}
        <div className="rounded-lg overflow-hidden border border-white/10 mb-6 bg-black/20">
          <iframe
            src={`https://widgets.myfxbook.com/widgets/${MYFXBOOK_ACCOUNT_ID}/small.html`}
            width="100%"
            height="80"
            style={{ border: 'none' }}
            title="MyFxBook Account Summary"
            allowTransparency
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10 gap-2"
            onClick={() => window.open(`https://www.myfxbook.com/members/Aasakira/khai/${MYFXBOOK_ACCOUNT_ID}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            View Full Account on MyFxBook
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MyFxBookStats;
