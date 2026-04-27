
import React, { useState } from 'react';
import { ArrowRight, MessageSquare, Zap, Activity, Globe, Target, TrendingUp, Star, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MultiStepSignupDialog from './MultiStepSignupDialog';
import WeeklyResults from './WeeklyResults';
import MyFxBookStats from './MyFxBookStats';
import VipUpgradeModal from './VipUpgradeModal';

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [vipOpen, setVipOpen] = useState(false);

  const stats = [
    { icon: Target, label: '3+ Trading Tools', color: 'text-pink-400' },
    { icon: Activity, label: '24/7 Real-time Signals', color: 'text-green-400' },
    { icon: Globe, label: '1K+ Trusted Traders', color: 'text-blue-400' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Urgency Ribbon */}
      <div className="relative z-20 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-gradient-shift">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center">
          <p className="text-sm md:text-base text-white font-semibold flex items-center justify-center gap-2">
            <span className="animate-pulse">🔥</span>
            24/7 AI Signal Engine – New update released this week!
            <span className="hidden sm:inline">→</span>
            <button 
              onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
              className="underline hover:text-purple-200 transition-colors"
            >
              Join the Private Telegram Group
            </button>
          </p>
        </div>
      </div>

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-pink-900/10 animate-gradient-bg"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-12 text-center">
          <div className="mb-6 animate-fade-in">
            <Badge className="mb-4 bg-neon-green-500/20 text-neon-green-400 border-neon-green-500/30 text-sm px-4 py-1.5">
              📈 Trusted by 1,000+ Traders Worldwide
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-shift">
                AASAKIRA
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Premium trading signals delivered straight to your Telegram. VIP & Free channels with proven results.
            </p>
          </div>

          {/* Primary CTA — Push Free Telegram */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-slide-up">
            <Button 
              size="lg"
              className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-10 py-7 text-lg shadow-lg shadow-purple-500/25 overflow-hidden hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
            >
              <span className="absolute inset-0 -translate-x-full animate-[shimmer_6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative">Join FREE Telegram Group</span>
              <ArrowRight className="ml-2 w-5 h-5 relative" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="group relative border-purple-500/40 text-purple-300 hover:bg-purple-500/10 font-semibold px-8 py-6 text-lg overflow-hidden hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => setVipOpen(true)}
            >
              <Star className="mr-2 w-5 h-5 relative fill-current" />
              <span className="relative">Upgrade to VIP</span>
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in border-t border-b border-border py-12" style={{animationDelay: '0.2s'}}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className={`w-10 h-10 mx-auto mb-3 ${stat.color}`} />
                  <p className="text-lg font-semibold">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Weekly Signal Results - PROMINENT */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium">
              <Activity className="w-3.5 h-3.5" />
              Live Signal Performance
            </div>
          </div>
          <WeeklyResults />

        </div>

        {/* MyFxBook Performance — Live Stats */}
        <MyFxBookStats />

        {/* Final CTA */}
        <div className="py-16 animate-fade-in border-t border-border" style={{animationDelay: '0.6s'}}>
          <Card className="p-10 md:p-16 bg-gradient-to-br from-purple-900/30 via-background to-pink-900/30 backdrop-blur border-purple-500/40 max-w-3xl mx-auto text-center shadow-2xl shadow-purple-500/20">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              🚀 Ready to Trade Smarter?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join 1,000+ traders getting free signals daily in our Telegram group.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-foreground">
                <Target className="w-5 h-5 text-purple-400" />
                <span>Get AI signals in Telegram</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-foreground">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Upgrade to VIP for premium signals</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span>Level up your trading</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 shadow-lg shadow-purple-500/30 border-2 border-purple-400/50 hover:border-purple-300/70 transition-all overflow-hidden hover:scale-105 hover:-translate-y-0.5 duration-200"
                onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
              >
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative">Join FREE Telegram Group</span>
                <ArrowRight className="ml-2 w-5 h-5 relative" />
              </Button>
              <Button
                size="lg"
                className="group relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold px-8 py-6 shadow-lg shadow-amber-500/30 overflow-hidden hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setVipOpen(true)}
              >
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <Star className="mr-2 w-5 h-5 relative fill-current" />
              <span className="relative">Upgrade to VIP</span>
              </Button>
            </div>
          </Card>
        </div>

        <VipUpgradeModal open={vipOpen} onOpenChange={setVipOpen} />

        {/* Footer */}
        <footer className="py-8 border-t border-border mt-12">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-4">
            <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">Terms</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">Privacy</button>
            <button onClick={() => navigate('/contact')} className="hover:text-foreground transition-colors">Contact</button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            © 2025 Aasakira. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Hero;
