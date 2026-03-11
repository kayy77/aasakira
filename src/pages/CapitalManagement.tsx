import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Shield, Target, DollarSign, BarChart3, Clock, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import { useIsMobile } from '@/hooks/use-mobile';
import backtest2023 from '@/assets/backtest-2023-2024.jpeg';
import backtest2024 from '@/assets/backtest-2024-2025.jpeg';

const WHATSAPP_LINK = 'https://api.whatsapp.com/message/GOHILXTX2HIFO1?autoload=1&app_absent=0';

const CapitalManagement = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const stats = [
    { label: 'Weekly Returns', value: '0.8–1.1%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Monthly Returns', value: '4–5%', icon: BarChart3, color: 'text-blue-400' },
    { label: 'Annual Returns', value: '40–60%', icon: Target, color: 'text-purple-400' },
    { label: 'Win Rate', value: '65–75%', icon: Shield, color: 'text-yellow-400' },
    { label: 'Risk Per Trade', value: '2%', icon: DollarSign, color: 'text-red-400' },
    { label: 'Min Capital', value: '$2,500+', icon: Users, color: 'text-cyan-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}

      <div className="relative z-10 pt-20 md:pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <div className="mb-6">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size={isMobile ? 'sm' : 'default'}
              className="flex items-center space-x-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium mb-4">
              <Shield className="w-3.5 h-3.5" />
              Professional Capital Management
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">Grow Your Capital</span>
              <br />
              <span className="text-white/90">With Proven Strategies</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Institutional-grade forex management for <strong className="text-white">personal deposits</strong> and <strong className="text-white">funded accounts</strong>.
              Whether you have your own capital or a funded challenge account, we trade it with
              consistent returns backed by 2+ years of verified backtesting.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-medium">✓ Personal Capital</span>
              <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium">✓ Funded Accounts</span>
              <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium">✓ Prop Firm Challenges</span>
            </div>
          </div>

          {/* Performance Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                  <div className={`text-xl sm:text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How It Works */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-10">
            <CardContent className="p-5 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                How It Works
              </h2>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <div className="text-purple-400 font-bold text-lg mb-1">01</div>
                  <div className="font-semibold text-white mb-1">Connect</div>
                  <p className="text-muted-foreground text-xs">Deposit a minimum of $2,500 into your personal or funded trading account.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <div className="text-purple-400 font-bold text-lg mb-1">02</div>
                  <div className="font-semibold text-white mb-1">We Trade</div>
                  <p className="text-muted-foreground text-xs">Our proven strategy trades your capital with strict 2% risk per trade management.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <div className="text-purple-400 font-bold text-lg mb-1">03</div>
                  <div className="font-semibold text-white mb-1">You Earn</div>
                  <p className="text-muted-foreground text-xs">Watch your capital grow with consistent 0.8–1.1% weekly returns.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backtest Results */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5 text-center">Verified Backtest Results</h2>
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-white">2023 – 2024 Performance</span>
                  </div>
                  <img
                    src={backtest2023}
                    alt="Backtest results 2023-2024 showing consistent equity growth"
                    className="w-full rounded-lg border border-white/10"
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">2024 – 2025 Performance</span>
                  </div>
                  <img
                    src={backtest2024}
                    alt="Backtest results 2024-2025 showing continued equity growth"
                    className="w-full rounded-lg border border-white/10"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to Grow Your Capital?</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                  Get started with a minimum deposit of $2,500. Message us on WhatsApp to learn more.
                </p>
                <Button
                  size="lg"
                  onClick={() => window.open(WHATSAPP_LINK, '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Contact via WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Past performance is not indicative of future results. Trading involves risk.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapitalManagement;
