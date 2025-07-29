
import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap, Star } from 'lucide-react';

interface FeatureGateProps {
  feature: 'signals' | 'memeScans' | 'mentorMessages';
  children: React.ReactNode;
  onFeatureUse?: () => void;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  onFeatureUse 
}) => {
  const { subscription, user } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Feature limits for free users
  const featureLimits = {
    signals: 3,
    memeScans: 5,
    mentorMessages: 10
  };

  const featureNames = {
    signals: 'AI Signals',
    memeScans: 'Meme Scans',
    mentorMessages: 'Mentor Messages'
  };

  const isPremium = subscription?.tier === 'premium';
  const dailyLimit = featureLimits[feature];
  const featureName = featureNames[feature];

  // Simple usage tracking (in real app, this would be from backend)
  const getUsageCount = () => {
    const today = new Date().toDateString();
    const key = `${feature}_usage_${today}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored) : 0;
  };

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const key = `${feature}_usage_${today}`;
    const current = getUsageCount();
    localStorage.setItem(key, (current + 1).toString());
  };

  const usageCount = getUsageCount();
  const canUseFeature = isPremium || usageCount < dailyLimit;

  const handleFeatureUse = () => {
    if (!canUseFeature) {
      setShowUpgradeDialog(true);
      return;
    }

    if (!isPremium) {
      incrementUsage();
    }

    onFeatureUse?.();
  };

  // Upgrade Dialog Component
  const UpgradeDialog = () => (
    <Card className="glass-card border-yellow-500/20 mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-yellow-400 flex items-center justify-center gap-2">
          <Crown className="w-6 h-6" />
          Upgrade to Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-gray-300 mb-4">
            You've reached your daily limit for {featureName}
          </p>
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">
              🚀 Premium Benefits
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Unlimited {featureName}</li>
              <li>• Priority support</li>
              <li>• Advanced features</li>
              <li>• No daily limits</li>
            </ul>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowUpgradeDialog(false)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // In real app, this would redirect to payment
              console.log('Upgrade clicked');
              setShowUpgradeDialog(false);
            }}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (showUpgradeDialog) {
    return <UpgradeDialog />;
  }

  if (!canUseFeature) {
    return (
      <Card className="glass-card border-red-500/20">
        <CardContent className="p-6 text-center">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Daily Limit Reached
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            You've used all {dailyLimit} daily {featureName} for today.
          </p>
          <Button
            onClick={() => setShowUpgradeDialog(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Clone children and pass the handleFeatureUse function
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onFeatureUse: handleFeatureUse });
    }
    return child;
  });

  return (
    <div className="space-y-4">
      {!isPremium && (
        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">
              {featureName}: {usageCount}/{dailyLimit} used today
            </span>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Free Plan
          </Badge>
        </div>
      )}
      
      {enhancedChildren}
    </div>
  );
};

export default FeatureGate;
