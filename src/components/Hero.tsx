
import React from 'react';
import { ArrowRight, Zap, Target, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartTrading = () => {
    // Open broker link in new tab
    window.open('https://myaccountnew.fxlvls.com/registration?lang=en&campaignid=1000541&affiliateid=10812', '_blank');
  };

  const handleViewLiveDemo = () => {
    if (!isAuthenticated) {
      // Show login dialog by navigating to a route that triggers auth
      navigate('/signals'); // This will trigger AuthGuard to show login
    } else {
      navigate('/signals');
    }
  };

  const stats = [
    { label: 'Signal Accuracy', value: '95%', icon: Target },
    { label: 'Active Users', value: '10K+', icon: TrendingUp },
    { label: 'Response Time', value: '<100ms', icon: Zap },
    { label: 'Success Rate', value: '87%', icon: Sparkles },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Optimized floating elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Beta Notice */}
        <div className="mb-8 animate-fade-in">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Revolutionary Trading Technology
          </Badge>
        </div>

        {/* Main Heading */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Future of{' '}
            <span className="gradient-text neon-text">AI Trading</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Experience the power of advanced artificial intelligence combined with 
            institutional-grade trading tools. Transform your trading with precision, 
            speed, and intelligence.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.2s'}}>
          <Button 
            size="lg" 
            onClick={handleStartTrading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 text-lg hover-lift cyber-glow"
          >
            Start Trading Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={handleViewLiveDemo}
            className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg hover-glow"
          >
            View Live Demo
            <Sparkles className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="glass-card p-6 hover-lift group"
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-2 gradient-text">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Telegram Announcement */}
        <div className="mt-12 mb-8 animate-fade-in" style={{animationDelay: '0.5s'}}>
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Join Our FREE Telegram Community
              </h3>
              <p className="text-gray-300 mb-4">
                Get exclusive trading insights, live market updates, and connect with fellow traders
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 text-lg hover-lift"
                onClick={() => window.open('https://t.me/aasakirafree', '_blank')}
              >
                <MessageSquare className="mr-2 w-5 h-5" />
                Join FREE Telegram
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Used by traders in 30+ countries</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Compatible with MetaTrader 4/5</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>99.9% Signal Accuracy Rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
