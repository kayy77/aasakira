import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plane, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Zap
} from 'lucide-react';

const AFFILIATE_TELEGRAM = 'https://t.me/+CEg8DUQuPXQ5MWRk';

const AffiliateSection = () => {
  const handleJoinTelegram = () => {
    window.open(AFFILIATE_TELEGRAM, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 p-8 md:p-12" style={{ background: 'linear-gradient(135deg, hsl(0 0% 8%), hsl(0 0% 5%))' }}>
        {/* Sakura glow decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-20" style={{ background: 'rgba(255, 174, 225, 0.4)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-15" style={{ background: 'rgba(255, 174, 225, 0.3)' }} />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-foreground border border-border/50 bg-secondary/50 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" style={{ color: 'rgba(255, 174, 225, 0.9)' }} />
              Affiliate Programme
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight font-zen-maru">
              Earn Up To <span style={{ color: 'rgba(255, 174, 225, 0.9)' }}>£12 Per Trade</span>
              <br />Live Life On Your Terms
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Join our exclusive affiliate training where we teach you how to build 
              <strong className="text-foreground"> 4-6 figures/month</strong> in passive income. 
              Travel the world while earning.
            </p>
            <Button 
              onClick={handleJoinTelegram}
              size="lg"
              className="glow-soft font-bold text-lg px-8 py-6 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(255, 174, 225, 0.15)', border: '1px solid rgba(255, 174, 225, 0.3)', color: 'rgba(255, 174, 225, 0.95)' }}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Join Affiliate Training
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Earnings Visual */}
          <div className="shrink-0">
            <div className="rounded-2xl p-6 border space-y-4 min-w-[260px] backdrop-blur-md" style={{ background: 'rgba(255, 174, 225, 0.05)', borderColor: 'rgba(255, 174, 225, 0.15)' }}>
              <p className="text-muted-foreground text-sm font-medium text-center">Potential Monthly Earnings</p>
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">£3,600</span>
                <span className="text-muted-foreground text-sm block mt-1">300 referral trades/month</span>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Per trade</span>
                  <span className="font-semibold text-foreground">£12</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Recurring</span>
                  <span className="font-semibold" style={{ color: 'rgba(255, 174, 225, 0.9)' }}>✓ Lifetime</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Payouts</span>
                  <span className="font-semibold text-foreground">Weekly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, title: '£12 Per Trade', desc: 'Earn every time your referrals trade. No caps, no limits.' },
          { icon: TrendingUp, title: '4-6 Figures/Month', desc: 'Learn our proven system to scale your affiliate income fast.' },
          { icon: Plane, title: 'Freedom Lifestyle', desc: 'Work from anywhere. Travel the world with passive income.' },
          { icon: Globe, title: 'Global Community', desc: 'Join a network of affiliates all building financial freedom.' },
        ].map((item, i) => (
          <Card key={i} className="bg-secondary/30 border-border/50 hover:border-border transition-all hover:scale-[1.02]">
            <CardContent className="p-5 space-y-3">
              <div className="p-3 rounded-xl bg-secondary/50 w-fit" style={{ color: 'rgba(255, 174, 225, 0.8)' }}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Card */}
      <Card className="border-border/50 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, hsl(0 0% 6%), hsl(0 0% 4%))' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20" style={{ background: 'rgba(255, 174, 225, 0.4)' }} />
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="p-4 rounded-2xl shrink-0" style={{ background: 'rgba(255, 174, 225, 0.1)' }}>
              <Zap className="h-8 w-8" style={{ color: 'rgba(255, 174, 225, 0.8)' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1 font-zen-maru">
                Ready to Start Earning?
              </h3>
              <p className="text-muted-foreground">
                Join our private Telegram where we'll train you step-by-step on how to build your affiliate empire with Aasakira.
              </p>
            </div>
            <Button 
              onClick={handleJoinTelegram}
              className="glow-soft font-semibold px-6 py-5 rounded-xl shrink-0 transition-all hover:scale-105"
              style={{ background: 'rgba(255, 174, 225, 0.15)', border: '1px solid rgba(255, 174, 225, 0.3)', color: 'rgba(255, 174, 225, 0.95)' }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Training Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSection;
