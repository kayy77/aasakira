
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Zap, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface PremiumUpgradeProps {
  feature?: string;
  onClose?: () => void;
}

export const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ feature, onClose }) => {
  const { upgradeToPremium } = useSubscription();

  const handleUpgrade = () => {
    // For now, just set to premium (later integrate with Stripe)
    upgradeToPremium();
    onClose?.();
  };

  const freeFeatures = [
    { name: '2 Signals per day', icon: TrendingUp, included: true },
    { name: '2 Meme coin scans per day', icon: Sparkles, included: true },
    { name: '10 AI Mentor messages per day', icon: MessageSquare, included: true },
    { name: 'Community access', icon: Users, included: false },
    { name: 'Unlimited signals', icon: Zap, included: false },
    { name: 'Unlimited meme coin scans', icon: Sparkles, included: false },
    { name: 'Unlimited AI Mentor', icon: MessageSquare, included: false },
    { name: 'Priority support', icon: Crown, included: false },
  ];

  const premiumFeatures = [
    { name: 'Unlimited signals', icon: Zap },
    { name: 'Unlimited meme coin scans', icon: Sparkles },
    { name: 'Unlimited AI Mentor access', icon: MessageSquare },
    { name: 'Exclusive community access', icon: Users },
    { name: 'Priority support', icon: Crown },
    { name: 'Advanced analytics', icon: TrendingUp },
  ];

  return (
    <div className="glass-card p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2">
          {feature ? `${feature} Limit Reached` : 'Upgrade to Premium'}
        </h2>
        <p className="text-gray-400">
          {feature 
            ? `You've reached your daily limit for ${feature}. Upgrade to continue using all features.`
            : 'Unlock unlimited access to all ForexAI features'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Free Plan */}
        <div className="glass-card p-6 border border-gray-500/30">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
            <div className="text-3xl font-bold text-gray-400">$0<span className="text-sm">/month</span></div>
          </div>
          
          <div className="space-y-3">
            {freeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                {feature.included ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-red-400" />
                )}
                <feature.icon className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Plan */}
        <div className="glass-card p-6 border border-purple-500/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-bold">
            POPULAR
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Premium Plan</h3>
            <div className="text-3xl font-bold gradient-text">$29<span className="text-sm text-gray-400">/month</span></div>
          </div>
          
          <div className="space-y-3 mb-6">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400" />
                <feature.icon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">{feature.name}</span>
              </div>
            ))}
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover-lift"
            onClick={handleUpgrade}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>

      {feature && (
        <div className="text-center">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      )}
    </div>
  );
};
