
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
      title: 'AI Trading Assistant',
      description: 'Intelligent AI mentor that analyzes your trades, provides personalized feedback, and guides your learning journey',
      gradient: 'from-blue-500 to-purple-500',
      delay: '0s'
    },
    {
      icon: Target,
      title: 'Smart Trade Analysis',
      description: 'Advanced pattern recognition and trade breakdown tools to identify your strengths and improvement areas',
      gradient: 'from-green-500 to-emerald-500',
      delay: '0.1s'
    },
    {
      icon: Shield,
      title: 'Risk Management Tools',
      description: 'Comprehensive position sizing calculators and risk assessment tools to protect your capital',
      gradient: 'from-red-500 to-pink-500',
      delay: '0.2s'
    },
    {
      icon: Zap,
      title: 'Real-Time Insights',
      description: 'Instant market analysis and educational content delivered when you need it most',
      gradient: 'from-yellow-500 to-orange-500',
      delay: '0.3s'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Deep dive into your trading performance with advanced analytics and visualization tools',
      gradient: 'from-purple-500 to-violet-500',
      delay: '0.4s'
    },
    {
      icon: Users,
      title: 'Trading Community',
      description: 'Connect with fellow traders, share insights, and learn from experienced professionals in our active community',
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
            AI-Powered Trading Tools
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive suite of AI tools and community resources designed to 
            accelerate your trading education and performance
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
              <span className="text-purple-400 font-semibold">Learn. Analyze. Excel.</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Master Trading with AI?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our community of traders using cutting-edge AI tools to develop consistent profitability, 
              master market psychology, and accelerate their path to trading success.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 hover-lift"
              onClick={() => window.open('https://t.me/aasakirafree', '_blank')}
            >
              Join Our Community
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
