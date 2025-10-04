
import React from 'react';
import { ArrowRight, MessageSquare, Zap, Activity, Globe, Target, TrendingUp, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MultiStepSignupDialog from './MultiStepSignupDialog';

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleViewSignals = () => {
    navigate('/signals');
  };

  const stats = [
    { icon: Activity, label: '99.9% Uptime', color: 'text-green-400' },
    { icon: Zap, label: '<99ms Analysis', color: 'text-purple-400' },
    { icon: Globe, label: '1K+ Traders', color: 'text-blue-400' },
    { icon: Target, label: '15+ AI Tools', color: 'text-pink-400' },
  ];

  const sampleSignals = [
    {
      pair: 'XAUUSD',
      type: 'BUY',
      entry: '2,645.20',
      sl: '2,642.50',
      tp: '2,652.80',
      confidence: 94
    },
    {
      pair: 'US30',
      type: 'SELL',
      entry: '42,180.00',
      sl: '42,250.00',
      tp: '42,050.00',
      confidence: 89
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-pink-900/10"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-16 text-center">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Master Trading with{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-shift">
                AI Precision
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Institutional-grade AI signals, real-time market insights, and a thriving trader community
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
            <MultiStepSignupDialog>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-purple-500/25"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </MultiStepSignupDialog>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleViewSignals}
              className="border-border hover:bg-accent px-8 py-6 text-lg"
            >
              View Live Signals
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 animate-fade-in" style={{animationDelay: '0.2s'}}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-6 bg-card/50 backdrop-blur border-border">
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Live Signal Preview */}
        <div className="py-16 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Live Preview
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See AI Signals in Action
            </h2>
            <p className="text-muted-foreground">
              Real-time precision signals powered by institutional-grade algorithms
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sampleSignals.map((signal) => (
              <Card key={signal.pair} className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-border hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{signal.pair}</h3>
                      <Badge className={signal.type === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                        {signal.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-lg font-bold text-purple-400">{signal.confidence}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Entry</p>
                    <p className="font-semibold">{signal.entry}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Stop Loss</p>
                    <p className="font-semibold text-red-400">{signal.sl}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Take Profit</p>
                    <p className="font-semibold text-green-400">{signal.tp}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Community CTA */}
        <div className="py-16 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <Card className="p-8 md:p-12 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur border-purple-500/30 max-w-3xl mx-auto text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Join 1,000+ Traders Learning & Profiting Together
            </h3>
            <p className="text-muted-foreground mb-6">
              Get exclusive trading insights, live market updates, and connect with a global community
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6"
              onClick={() => window.open('https://t.me/+E3IYiJSGNqkxNTdk', '_blank')}
            >
              <MessageSquare className="mr-2 w-5 h-5" />
              Join Our Telegram
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-border mt-20">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/about')} className="hover:text-foreground transition-colors">About</button>
            <button onClick={() => navigate('/contact')} className="hover:text-foreground transition-colors">Contact</button>
            <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">Terms</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">Privacy</button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            © 2025 Aasakira. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Hero;
