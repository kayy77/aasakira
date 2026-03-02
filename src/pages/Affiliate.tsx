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
  BarChart3,
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-8 md:p-14 mb-12 animate-fade-in">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left space-y-5">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-white">
                  <Sparkles className="h-4 w-4" />
                  Affiliate Programme
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  Earn Up To <span className="text-yellow-300">£12 Per Trade</span>
                  <br />Live Life On Your Terms
                </h1>
                <p className="text-emerald-50 text-lg max-w-xl">
                  Join our exclusive affiliate training where we teach you how to build 
                  <strong className="text-white"> 4-6 figures/month</strong> in passive income. 
                  Travel the world while earning.
                </p>
                <Button 
                  onClick={handleJoinTraining}
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-yellow-50 font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-all hover:scale-105"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Join Affiliate Training
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Earnings Visual */}
              <div className="shrink-0">
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4 min-w-[260px]">
                  <p className="text-emerald-100 text-sm font-medium text-center">Potential Monthly Earnings</p>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white">£3,600</span>
                    <span className="text-emerald-200 text-sm block mt-1">300 referral trades/month</span>
                  </div>
                  <div className="h-px bg-white/20" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-emerald-100">
                      <span>Per trade</span>
                      <span className="font-semibold text-white">£12</span>
                    </div>
                    <div className="flex justify-between text-emerald-100">
                      <span>Recurring</span>
                      <span className="font-semibold text-yellow-300">✓ Lifetime</span>
                    </div>
                    <div className="flex justify-between text-emerald-100">
                      <span>Payouts</span>
                      <span className="font-semibold text-white">Weekly</span>
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
              <Plane className="h-6 w-6 text-chart-2" />
              <span className="text-lg font-semibold text-foreground">Freedom Lifestyle</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-secondary/50 border border-border rounded-xl p-4">
              <Clock className="h-6 w-6 text-chart-1" />
              <span className="text-lg font-semibold text-foreground">Weekly Payouts</span>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Why Become an Aasakira Affiliate?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: DollarSign, title: '£12 Per Trade', desc: 'Earn every time your referrals trade. No caps, no limits.', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/20' },
                { icon: TrendingUp, title: '4-6 Figures/Month', desc: 'Learn our proven system to scale your affiliate income fast.', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/20' },
                { icon: Plane, title: 'Freedom Lifestyle', desc: 'Work from anywhere. Travel the world with passive income.', color: 'text-sky-400', bg: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-500/20' },
                { icon: Globe, title: 'Global Community', desc: 'Join a network of affiliates all building financial freedom.', color: 'text-purple-400', bg: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/20' },
              ].map((item, i) => (
                <Card key={i} className={`bg-gradient-to-br ${item.bg} ${item.border} hover:scale-[1.02] transition-transform`}>
                  <CardContent className="p-5 space-y-3">
                    <div className={`p-3 rounded-xl bg-background/50 w-fit ${item.color}`}>
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
                    <div className="text-3xl font-bold text-chart-2 mb-1">£1,240</div>
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
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Join Our Training', desc: 'Join our private Telegram where we train you step-by-step on building your affiliate income.' },
                { step: '2', title: 'Share With Your Network', desc: 'Get your unique link and share it with your audience. Every signup is tracked automatically.' },
                { step: '3', title: 'Earn £12 Per Trade', desc: 'Earn up to £12 for every trade your referrals place. Passive, recurring income — weekly payouts.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
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
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MousePointer className="h-4 w-4" />
                          <span className="text-xs">Clicks</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">1,247</div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <UserPlus className="h-4 w-4" />
                          <span className="text-xs">Signups</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">89</div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">Active</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">42</div>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Wallet className="h-4 w-4" />
                          <span className="text-xs">Earnings</span>
                        </div>
                        <div className="text-2xl font-bold text-chart-2">£2,840</div>
                      </div>
                    </div>
                    <div className="h-32 bg-secondary/30 rounded-lg"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <Button 
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
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
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
              <span className="text-sm">Real-time tracking</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
              <span className="text-sm">No minimum payouts</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
              <span className="text-sm">Free training provided</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-chart-2" />
              <span className="text-sm">Trusted by 100+ affiliates</span>
            </div>
          </div>

          {/* Final CTA */}
          <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/30 overflow-hidden relative animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <CardContent className="p-8 relative z-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-emerald-500/20">
                  <Zap className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Start Earning?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join our private Telegram where we'll train you step-by-step on how to earn 4-6 figures/month as an Aasakira affiliate. 
                Travel the world, live free, build passive income.
              </p>
              <Button 
                onClick={handleJoinTraining}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-105 text-lg"
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
