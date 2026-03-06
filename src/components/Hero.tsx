
import React from 'react';
import { ArrowRight, MessageSquare, Zap, Activity, Globe, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MultiStepSignupDialog from './MultiStepSignupDialog';
import WeeklyResults from './WeeklyResults';

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { icon: Target, label: '3+ AI Tools', color: 'text-pink-400' },
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

      {/* Animated gradient background - subtle motion */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-pink-900/10 animate-gradient-bg"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-16 text-center">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Master Trading with{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-shift">
                AI
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AI-powered trading signals and real-time market insights
            </p>
          </div>

          {/* CTA Button with shimmer */}
          <div className="flex justify-center mb-20 animate-slide-up">
            <MultiStepSignupDialog>
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-purple-500/25 overflow-hidden hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative">Get Started</span>
                <ArrowRight className="ml-2 w-5 h-5 relative" />
              </Button>
            </MultiStepSignupDialog>
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

          {/* Weekly Results Section */}
          <WeeklyResults />

        </div>

        {/* Visual Feature Cards */}
        <div className="py-16 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful AI Trading Tools
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to analyze, trade, and master the markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-900/5 border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">⚡ Elite AI Signal Engine</h3>
                  <p className="text-muted-foreground text-sm">
                    Institutional-grade signals with multi-filter validation and real-time price scraping.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-900/20 to-pink-900/5 border-pink-500/30 hover:border-pink-500/60 transition-all hover:shadow-lg hover:shadow-pink-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">📊 Advanced Forex + Meme Coin Scanner</h3>
                  <p className="text-muted-foreground text-sm">
                    Track market sentiment, liquidity sweeps, whales, breakouts, and more.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-900/5 border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">💬 AI Mentor Coach</h3>
                  <p className="text-muted-foreground text-sm">
                    Personalized lessons. Multi-strategy analysis. Chart breakdowns on demand.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-900/20 to-pink-900/5 border-pink-500/30 hover:border-pink-500/60 transition-all hover:shadow-lg hover:shadow-pink-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">📝 Smart Trading Journal</h3>
                  <p className="text-muted-foreground text-sm">
                    Auto-sync trades from MT4/MT5, Binance, Bybit, and more with AI analysis.
                  </p>
                </div>
              </div>
            </Card>
          </div>

        </div>

        {/* Final CTA with shimmer */}
        <div className="py-16 animate-fade-in border-t border-border" style={{animationDelay: '0.6s'}}>
          <Card className="p-10 md:p-16 bg-gradient-to-br from-purple-900/30 via-background to-pink-900/30 backdrop-blur border-purple-500/40 max-w-3xl mx-auto text-center shadow-2xl shadow-purple-500/20">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              🚀 Ready to Trade Smarter?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join 1,000+ traders upgrading their trading with AI.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-foreground">
                <Target className="w-5 h-5 text-purple-400" />
                <span>Get AI signals</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-foreground">
                <Globe className="w-5 h-5 text-pink-400" />
                <span>Join the community</span>
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
                <span className="relative">Join Free Telegram Community</span>
                <ArrowRight className="ml-2 w-5 h-5 relative" />
              </Button>
              <MultiStepSignupDialog>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10 font-semibold px-8 py-6 hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Start AI Signals
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </MultiStepSignupDialog>
            </div>
          </Card>
        </div>

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
