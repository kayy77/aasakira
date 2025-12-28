import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Zap, 
  MessageSquare, 
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Clock,
  Shield,
  Wallet,
  Eye,
  MousePointer,
  UserPlus
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Affiliate = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Earn Recurring Revenue From Your Trading Audience
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Partner with Aasakira and earn revenue when your audience trades.
            </p>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-slide-up">
            <div className="flex items-center justify-center gap-3 bg-secondary/50 border border-border rounded-xl p-4">
              <DollarSign className="h-6 w-6 text-chart-4" />
              <span className="text-lg font-semibold text-foreground">Up to £18 Per Lot</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-secondary/50 border border-border rounded-xl p-4">
              <BarChart3 className="h-6 w-6 text-chart-2" />
              <span className="text-lg font-semibold text-foreground">Real-Time Tracking</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-secondary/50 border border-border rounded-xl p-4">
              <Clock className="h-6 w-6 text-chart-1" />
              <span className="text-lg font-semibold text-foreground">Weekly Payouts</span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="text-center mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Button 
              size="lg" 
              className="h-14 px-10 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => window.open('https://wa.me/447500659269?text=Hi%2C%20I%27m%20interested%20in%20becoming%20an%20affiliate', '_blank')}
            >
              Get Your Affiliate Link
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Approval usually within 24 hours
            </p>
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

          {/* Who It's For */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Who This Is For</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: MessageSquare, label: 'Telegram & Discord Owners' },
                { icon: Users, label: 'Trading Educators' },
                { icon: TrendingUp, label: 'Content Creators' },
                { icon: Zap, label: 'Trading Communities' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex flex-col items-center text-center p-5 bg-secondary/30 border border-border rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <item.icon className="h-8 w-8 text-primary mb-3" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">How You Get Paid</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative">
                <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Apply & Get Your Link</h3>
                    <p className="text-sm text-muted-foreground">
                      Quick approval process. Get your unique tracking link within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Share With Your Audience</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your link with your community. Every signup is tracked.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="flex items-start gap-4 p-6 bg-card border border-border rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Earn Per Trade</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn up to £18 for every lot your referrals trade. Passive income.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Preview (Blurred) */}
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <Card className="border-border bg-card/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-secondary/30 px-6 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Your Affiliate Dashboard</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">Preview</span>
                </div>
                <div className="p-6 relative">
                  {/* Blurred preview */}
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
                  {/* Overlay CTA */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <Button 
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => window.open('https://wa.me/447500659269?text=Hi%2C%20I%27m%20interested%20in%20becoming%20an%20affiliate', '_blank')}
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
          <div className="flex flex-wrap justify-center gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.6s' }}>
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
              <span className="text-sm">Transparent stats</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-chart-2" />
              <span className="text-sm">Trusted by 100+ affiliates</span>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="text-center animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <Card className="border-border bg-secondary/20 p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Start Earning?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                We partner directly with brokers so you earn recurring revenue from traders you already know.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => window.open('https://wa.me/447500659269?text=Hi%2C%20I%27m%20interested%20in%20becoming%20an%20affiliate', '_blank')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Apply on WhatsApp
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-border"
                  onClick={() => window.open('https://t.me/khaiwh', '_blank')}
                >
                  Contact on Telegram
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                +44 7500 659269 • Usually responds within hours
              </p>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Affiliate;
