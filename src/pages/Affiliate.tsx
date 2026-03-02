import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Zap, 
  Plane,
  CheckCircle2,
  ArrowRight,
  Clock,
  Shield,
  Wallet,
  Eye,
  MousePointer,
  UserPlus,
  ExternalLink,
  Globe,
  Sparkles
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const AFFILIATE_TELEGRAM = 'https://t.me/+CEg8DUQuPXQ5MWRk';

const Affiliate = () => {
  const isMobile = useIsMobile();

  const handleJoinTraining = () => {
    window.open(AFFILIATE_TELEGRAM, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 p-8 md:p-14 mb-12 animate-fade-in" style={{ background: 'linear-gradient(135deg, hsl(0 0% 8%), hsl(0 0% 5%))' }}>
            {/* Sakura glow decorations */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-20" style={{ background: 'rgba(255, 174, 225, 0.4)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-15" style={{ background: 'rgba(255, 174, 225, 0.3)' }} />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-foreground border border-border/50 bg-secondary/50 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" style={{ color: 'rgba(255, 174, 225, 0.9)' }} />
                  Affiliate Programme
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight font-zen-maru">
                  Earn Up To <span style={{ color: 'rgba(255, 174, 225, 0.9)' }}>£12 Per Trade</span>
                  <br />Live Life On Your Terms
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl">
                  Join our exclusive affiliate training where we teach you how to build 
                  <strong className="text-foreground"> 4-6 figures/month</strong> in passive income. 
                  Travel the world while earning.
                </p>
                <Button 
                  onClick={handleJoinTraining}
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

          {/* Metric Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-slide-up">
            <div className="flex items-center justify-center gap-3 bg-secondary/50 border border-border rounded-xl p-4">
              <DollarSign className="h-6 w-6 text-chart-4" />
              <span className="text-lg font-semibold text-foreground">Up to £12 Per Trade</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-secondary/50 border border-border rounded-xl p-4">
              <Plane className="h-6 w-6 text-chart-1" />
              <span className="text-lg font-semibold text-foreground">Freedom Lifestyle</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-secondary/50 border border-border rounded-xl p-4">
              <Clock className="h-6 w-6 text-chart-2" />
              <span className="text-lg font-semibold text-foreground">Weekly Payouts</span>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-foreground text-center mb-8 font-zen-maru">Why Become an Aasakira Affiliate?</h2>
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
          </div>

          {/* Proof Card - Example Earnings */}
          <Card className="mb-16 border-border bg-card/80 backdrop-blur overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-0">
              <div className="bg-secondary/30 px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                  Example Affiliate Earnings
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-1">42</div>
                    <div className="text-sm text-muted-foreground">Users Referred</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-1">18</div>
                    <div className="text-sm text-muted-foreground">Active Traders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1" style={{ color: 'rgba(255, 174, 225, 0.9)' }}>£1,240</div>
                    <div className="text-sm text-muted-foreground">Monthly Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-chart-4 mb-1">£14,880</div>
                    <div className="text-sm text-muted-foreground">Yearly Potential</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-foreground text-center mb-8 font-zen-maru">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Join Our Training', desc: 'Join our private Telegram where we train you step-by-step on building your affiliate income.' },
                { step: '2', title: 'Share With Your Network', desc: 'Get your unique link and share it with your audience. Every signup is tracked automatically.' },
                { step: '3', title: 'Earn £12 Per Trade', desc: 'Earn up to £12 for every trade your referrals place. Passive, recurring income — weekly payouts.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: 'rgba(255, 174, 225, 0.15)', color: 'rgba(255, 174, 225, 0.9)' }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview (Blurred) */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Card className="border-border bg-card/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-secondary/30 px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Your Affiliate Dashboard</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">Preview</span>
                </div>
                <div className="p-6 relative">
                  <div className="blur-sm pointer-events-none select-none">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { icon: MousePointer, label: 'Clicks', value: '1,247' },
                        { icon: UserPlus, label: 'Signups', value: '89' },
                        { icon: Eye, label: 'Active', value: '42' },
                        { icon: Wallet, label: 'Earnings', value: '£2,840' },
                      ].map((item, i) => (
                        <div key={i} className="bg-secondary/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <item.icon className="h-4 w-4" />
                            <span className="text-xs">{item.label}</span>
                          </div>
                          <div className="text-2xl font-bold text-foreground">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-32 bg-secondary/30 rounded-lg"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <Button 
                      size="lg"
                      className="glow-soft"
                      style={{ background: 'rgba(255, 174, 225, 0.15)', border: '1px solid rgba(255, 174, 225, 0.3)', color: 'rgba(255, 174, 225, 0.95)' }}
                      onClick={handleJoinTraining}
                    >
                      Unlock Your Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            {[
              { icon: CheckCircle2, label: 'Real-time tracking' },
              { icon: CheckCircle2, label: 'No minimum payouts' },
              { icon: CheckCircle2, label: 'Free training provided' },
              { icon: Shield, label: 'Trusted by 100+ affiliates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="h-5 w-5" style={{ color: 'rgba(255, 174, 225, 0.7)' }} />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <Card className="border-border/50 overflow-hidden relative animate-slide-up" style={{ animationDelay: '0.6s', background: 'linear-gradient(135deg, hsl(0 0% 6%), hsl(0 0% 4%))' }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20" style={{ background: 'rgba(255, 174, 225, 0.4)' }} />
            <CardContent className="p-8 relative z-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(255, 174, 225, 0.1)' }}>
                  <Zap className="h-8 w-8" style={{ color: 'rgba(255, 174, 225, 0.8)' }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2 font-zen-maru">Ready to Start Earning?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join our private Telegram where we'll train you step-by-step on how to earn 4-6 figures/month as an Aasakira affiliate. 
                Travel the world, live free, build passive income.
              </p>
              <Button 
                onClick={handleJoinTraining}
                size="lg"
                className="glow-soft font-semibold px-8 py-6 rounded-xl transition-all hover:scale-105 text-lg"
                style={{ background: 'rgba(255, 174, 225, 0.15)', border: '1px solid rgba(255, 174, 225, 0.3)', color: 'rgba(255, 174, 225, 0.95)' }}
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Join Affiliate Training on Telegram
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Free to join • No experience needed • Start earning this week
              </p>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Affiliate;
