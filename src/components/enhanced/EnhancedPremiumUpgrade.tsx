
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Star, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { stripeService } from '@/services/stripeService';

interface EnhancedPremiumUpgradeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedPremiumUpgrade: React.FC<EnhancedPremiumUpgradeProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (plan: 'premium' | 'yearly') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your account",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the checkout URL from our service
      const checkoutUrl = await stripeService.createCheckoutSession(plan, user.email);
      
      // Open Stripe checkout in current window
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: 'premium',
      name: 'Shogun Premium',
      price: '$49',
      period: '/month',
      description: 'For serious traders who want unlimited access',
      features: [
        'Unlimited AI Trading Signals',
        'Unlimited Meme Coin Scans',
        'Unlimited AI Mentor Sessions',
        'Elite Trading Community Access',
        'Real-time Trade Alerts',
        'Advanced Chart Analysis',
        'Priority Customer Support',
        'Mobile App Access'
      ],
      recommended: true,
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'yearly',
      name: 'Sage Lifetime',
      price: '$497',
      period: '/year',
      description: 'Best value - Save 2 months!',
      features: [
        'Everything in Shogun Premium',
        'Exclusive Sage-only features',
        'Direct access to platform creators',
        'Alpha testing new features',
        'Custom trading strategies',
        'One-on-one mentorship calls',
        'Exclusive market reports',
        'Lifetime updates & support'
      ],
      recommended: false,
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="bg-black/60 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
                  <Crown className="h-8 w-8 text-yellow-400" />
                  Unlock Your Trading Potential
                </CardTitle>
                <p className="text-gray-400 mt-2">
                  Join elite traders and crush the markets with unlimited access to all Aasakira features
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Feature Comparison */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 text-center">What You're Missing as a Free User</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                    <Zap className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-bold text-white">AI Signals</h4>
                    <p className="text-red-400 text-2xl font-bold">2/day</p>
                    <p className="text-xs text-gray-400">Limited access</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
                    <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <h4 className="font-bold text-white">Meme Scans</h4>
                    <p className="text-yellow-400 text-2xl font-bold">3/day</p>
                    <p className="text-xs text-gray-400">Basic scanning</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                    <Crown className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="font-bold text-white">Community</h4>
                    <p className="text-purple-400 text-2xl font-bold">Locked</p>
                    <p className="text-xs text-gray-400">No access</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden ${
                    plan.recommended
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50'
                      : 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className={`text-2xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleUpgrade(plan.id as 'premium' | 'yearly')}
                      disabled={isLoading}
                      className={`w-full font-bold py-3 text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}
                    >
                      {isLoading ? 'Redirecting to Payment...' : `Upgrade to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-center space-y-4">
              <div className="flex justify-center items-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Secure Payments
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Cancel Anytime
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  30-Day Guarantee
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Powered by Stripe • Your payment information is secure and encrypted
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPremiumUpgrade;
