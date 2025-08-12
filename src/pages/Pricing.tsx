import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { stripeService } from '@/services/stripeService';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';

const Pricing = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const handleUpgrade = async () => {
    if (!user?.email) {
      console.error('No user email available');
      return;
    }

    try {
      const checkoutUrl = await stripeService.createCheckoutSession('premium', user.email);
      window.open(checkoutUrl, '_blank');
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Get started with basic trading tools',
      features: [
        '1 AI signal per day',
        '2 meme coin scans per day', 
        'Basic education content',
        '1 trading game per day',
        'Community access'
      ],
      buttonText: 'Current Plan',
      disabled: true,
      current: !isPremium
    },
    {
      name: 'Premium',
      price: '$25',
      period: '/month',
      description: 'For those using our trade copier',
      popular: true,
      features: [
        'Unlimited AI signals',
        'Unlimited meme coin scanning',
        'Advanced AI education with visuals',
        'Unlimited trading games',
        'Live market data feeds',
        'Priority support',
        'Advanced analytics',
        'Custom alerts',
        'Economic News Calendar',
        'Portfolio Analytics',
        'Equity Protection',
        'All Features Included'
      ],
      buttonText: isPremium ? 'Current Plan' : 'Register Now',
      disabled: isPremium,
      current: isPremium
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Unlock the full power of Aasakira's AI trading platform
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name}
                className={`relative glass-card border-2 ${
                  plan.popular 
                    ? 'border-green-500/50 ring-2 ring-green-500/30' 
                    : plan.current 
                      ? 'border-blue-500/50' 
                      : 'border-gray-500/30'
                } bg-gradient-to-br ${
                  plan.popular ? 'from-green-500/5 to-emerald-500/5' : 'from-gray-500/5 to-gray-600/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white font-bold px-4 py-1">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-xl text-gray-400 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={plan.disabled ? undefined : handleUpgrade}
                    disabled={plan.disabled}
                    className={`w-full py-4 text-lg font-semibold ${
                      plan.disabled
                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                        : plan.popular
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    }`}
                  >
                    {plan.current && (
                      <Crown className="w-5 h-5 mr-2" />
                    )}
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-400 mb-4">
              🔒 Secure payment • Cancel anytime • 7-day money-back guarantee
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>Premium Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;