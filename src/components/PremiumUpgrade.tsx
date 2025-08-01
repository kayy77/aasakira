
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { stripeService } from '@/services/stripeService';

interface PremiumUpgradeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ open, onOpenChange }) => {
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
      console.log(`🚀 Starting upgrade process for plan: ${plan}`);
      
      // Get the checkout URL from our service
      const checkoutUrl = await stripeService.createCheckoutSession(plan, user.email || '');
      
      console.log('✅ Checkout URL received, redirecting...');
      
      // Show loading state
      toast({
        title: "Redirecting to Stripe...",
        description: "Please wait while we redirect you to the payment page.",
      });
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('❌ Upgrade error:', error);
      toast({
        title: "Upgrade Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-black/60 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold gradient-text flex items-center justify-center gap-2">
                <Crown className="h-6 w-6 text-yellow-400" />
                Upgrade to Premium
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-2">Monthly Plan</h3>
                  <div className="text-3xl font-bold text-purple-400 mb-4">$25/month</div>
                  <Button
                    onClick={() => handleUpgrade('premium')}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                  >
                    {isLoading ? 'Processing...' : 'Choose Monthly'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-2">Annual Plan</h3>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">$200/year</div>
                  <div className="text-sm text-green-400 mb-4">Save $100 per year!</div>
                  <Button
                    onClick={() => handleUpgrade('yearly')}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:opacity-90"
                  >
                    {isLoading ? 'Processing...' : 'Choose Annual'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white">Premium Features:</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Unlimited AI Trading Signals
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Unlimited Sports Betting Analysis
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Unlimited Meme Coin Scans
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Unlimited AI Mentor Sessions
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Priority Support
              </li>
            </ul>
          </div>

          {isLoading && (
            <div className="text-center">
              <div className="text-sm text-gray-400">
                🔄 Redirecting to secure payment...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumUpgrade;
