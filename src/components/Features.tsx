
import React from 'react';
import { 
  Brain, 
  Target, 
  Shield, 
  Zap, 
  BarChart3, 
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Signals',
      description: 'Advanced machine learning algorithms analyze market data in real-time to generate high-probability trading signals',
      gradient: 'from-blue-500 to-purple-500',
      delay: '0s'
    },
    {
      icon: Target,
      title: 'Precision Targeting',
      description: 'Pinpoint entry and exit points with surgical precision using institutional-grade analysis tools',
      gradient: 'from-green-500 to-emerald-500',
      delay: '0.1s'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Intelligent risk assessment and position sizing to protect your capital and maximize returns',
      gradient: 'from-red-500 to-pink-500',
      delay: '0.2s'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time market analysis and instant signal delivery to never miss a profitable opportunity',
      gradient: 'from-yellow-500 to-orange-500',
      delay: '0.3s'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive market analysis with technical indicators, sentiment data, and trend prediction',
      gradient: 'from-purple-500 to-violet-500',
      delay: '0.4s'
    },
    {
      icon: Users,
      title: 'Copy Trading',
      description: 'Follow and copy successful traders automatically with intelligent position scaling',
      gradient: 'from-cyan-500 to-blue-500',
      delay: '0.5s'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Cutting-Edge Features
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Powered by advanced AI and machine learning to give you the 
            competitive edge in trading
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.title}
                className="group glass-card p-8 hover-lift animate-slide-up"
                style={{animationDelay: feature.delay}}
              >
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <Button 
                  variant="ghost" 
                  className="text-purple-400 hover:text-purple-300 p-0 h-auto group-hover:translate-x-2 transition-transform duration-300"
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-400 mr-2" />
              <span className="text-purple-400 font-semibold">Stop Guessing. Start Evolving.</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Trading?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of traders using Aasakira to develop consistency, reduce emotional trading,
              and accelerate their journey to funded accounts.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 hover-lift"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
