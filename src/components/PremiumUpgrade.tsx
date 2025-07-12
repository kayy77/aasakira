
import React, { useState } from 'react';
import { Crown, Star, Zap, Users, TrendingUp, Shield, Check, X, Clock, BarChart3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { stripeService } from '@/services/stripeService';

interface PremiumUpgradeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PremiumUpgrade = ({ open, onOpenChange }: PremiumUpgradeProps) => {
  const { toast } = useToast();
  const { user, upgradeToPremium } = useAuth();
  const { usageToday, dailyLimits, getUsagePercentage, getTimeUntilReset } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upgrade to Premium.",
        variant: "destructive"
      });
      return;
    }

    setIsUpgrading(true);
    
    try {
      const priceId = selectedPlan === 'monthly' ? 'price_monthly_premium' : 'price_annual_premium';
      const checkoutUrl = await stripeService.createCheckoutSession(priceId, user.email);
      
      // Open Stripe checkout in a new tab
      window.open(checkoutUrl, '_blank');
      
      // For demo purposes, simulate successful upgrade after a delay
      setTimeout(() => {
        upgradeToPremium();
        toast({
          title: "🎉 Welcome to Premium!",
          description: "Your account has been upgraded successfully. Enjoy unlimited access to all features!",
        });
        onOpenChange(false);
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const features = [
    { name: 'Unlimited AI Trading Signals', free: '2/day', premium: true, icon: <Zap className="w-4 h-4" /> },
    { name: 'Unlimited AI Mentor Messages', free: '5/day', premium: true, icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Unlimited Meme Coin Scans', free: '3/day', premium: true, icon: <TrendingUp className="w-4 h-4" /> },
    { name: 'Premium Community Access', free: false, premium: true, icon: <Users className="w-4 h-4" /> },
    { name: 'Priority Customer Support', free: false, premium: true, icon: <Shield className="w-4 h-4" /> },
    { name: 'Advanced Analytics Dashboard', free: false, premium: true, icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Real-time Market Alerts', free: false, premium: true, icon: <Star className="w-4 h-4" /> },
    { name: 'Personalized Trading Strategies', free: false, premium: true, icon: <Crown className="w-4 h-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl glass-card border-purple-500/20 p-0 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <DialogHeader className="text-center space-y-4 mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold gradient-text">
              Upgrade to Aasakira Premium
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-lg">
              Unlock unlimited AI-powered trading features
            </DialogDescription>
          </DialogHeader>

          {/* Current Usage Status */}
          <Card className="glass-card border-orange-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-400" />
                Your Current Usage Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">AI Signals</span>
                    <span className="text-gray-400">{usageToday.signals}/{dailyLimits.signals}</span>
                  </div>
                  <Progress value={getUsagePercentage('signals')} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">AI Mentor</span>
                    <span className="text-gray-400">{usageToday.aiMentorMessages}/{dailyLimits.aiMentorMessages}</span>
                  </div>
                  <Progress value={getUsagePercentage('aiMentorMessages')} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Meme Scans</span>
                    <span className="text-gray-400">{usageToday.memeCoins}/{dailyLimits.memeCoins}</span>
                  </div>
                  <Progress value={getUsagePercentage('memeCoins')} className="h-2" />
                </div>
              </div>
              <div className="text-center text-sm text-orange-400">
                ⏰ Limits reset in: {getTimeUntilReset()}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`glass-card cursor-pointer transition-all duration-300 ${
                selectedPlan === 'monthly' 
                  ? 'border-purple-500 ring-2 ring-purple-500/50' 
                  : 'border-purple-500/20 hover:border-purple-500/40'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-white">Monthly Plan</CardTitle>
                <div className="text-3xl font-bold text-white">
                  $25<span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">Perfect for getting started</p>
              </CardHeader>
              <CardContent>
                <Button 
                  className={`w-full ${
                    selectedPlan === 'monthly'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-gray-700'
                  }`}
                  onClick={() => setSelectedPlan('monthly')}
                >
                  Select Monthly
                </Button>
              </CardContent>
            </Card>

            <Card 
              className={`glass-card cursor-pointer transition-all duration-300 relative ${
                selectedPlan === 'annual' 
                  ? 'border-purple-500 ring-2 ring-purple-500/50' 
                  : 'border-purple-500/20 hover:border-purple-500/40'
              }`}
              onClick={() => setSelectedPlan('annual')}
            >
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                Save 17%
              </Badge>
              <CardHeader className="text-center pt-6">
                <CardTitle className="text-xl font-bold text-white">Annual Plan</CardTitle>
                <div className="text-3xl font-bold text-white">
                  $200<span className="text-lg text-gray-400">/year</span>
                </div>
                <p className="text-gray-400">Best value for serious traders</p>
                <p className="text-sm text-green-400">Save $100 per year!</p>
              </CardHeader>
              <CardContent>
                <Button 
                  className={`w-full ${
                    selectedPlan === 'annual'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-gray-700'
                  }`}
                  onClick={() => setSelectedPlan('annual')}
                >
                  Select Annual
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Feature Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">What You Get With Premium</h3>
            <div className="glass-card">
              <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-700">
                <div className="font-bold text-white">Features</div>
                <div className="font-bold text-gray-400 text-center">Free</div>
                <div className="font-bold text-purple-400 text-center">Premium</div>
              </div>
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b border-gray-800 last:border-b-0">
                  <div className="flex items-center text-gray-300">
                    {feature.icon}
                    <span className="ml-2">{feature.name}</span>
                  </div>
                  <div className="text-center">
                    {feature.free === false ? (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    ) : feature.free === true ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <span className="text-gray-400">{feature.free}</span>
                    )}
                  </div>
                  <div className="text-center">
                    {feature.premium ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Button */}
          <Button 
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg hover-lift cyber-glow"
          >
            {isUpgrading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing Upgrade...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium - ${selectedPlan === 'monthly' ? '25/month' : '200/year'}
              </>
            )}
          </Button>

          <div className="text-center mt-4 space-y-2">
            <p className="text-xs text-gray-500">
              • Cancel anytime • No hidden fees • 30-day money-back guarantee
            </p>
            <p className="text-xs text-gray-500">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgrade;
