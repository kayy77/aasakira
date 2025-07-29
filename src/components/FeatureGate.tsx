
import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap, Star } from 'lucide-react';

interface FeatureGateProps {
  feature: 'signals' | 'memeScans' | 'mentorMessages';
  featureName?: string;
  children: React.ReactNode;
  onFeatureUse?: () => void;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  featureName,
  children, 
  onFeatureUse 
}) => {
  const { subscription, isPremium, usageStats, dailyLimits } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Feature limits for free users
  const featureLimits = {
    signals: 1,
    memeScans: 2,
    mentorMessages: 3
  };

  const featureNames = {
    signals: 'AI Signals',
    memeScans: 'Meme Scans',
    mentorMessages: 'Mentor Messages'
  };

  const displayName = featureName || featureNames[feature];
  const dailyLimit = featureLimits[feature];

  // Get usage count from subscription context
  const getUsageCount = () => {
    if (!usageStats) return 0;
    
    switch (feature) {
      case 'signals':
        return usageStats.signals || 0;
      case 'memeScans':
        return usageStats.meme_scans || 0;
      case 'mentorMessages':
        return usageStats.mentor_messages || 0;
      default:
        return 0;
    }
  };

  const usageCount = getUsageCount();
  const canUseFeature = isPremium || usageCount < dailyLimit;

  const handleFeatureUse = () => {
    if (!canUseFeature) {
      setShowUpgradeDialog(true);
      return;
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
            You've reached your daily limit for {displayName}
          </p>
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">
              🚀 Premium Benefits
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Unlimited {displayName}</li>
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
            You've used all {dailyLimit} daily {displayName} for today.
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

  // Enhanced children with feature use handler
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      // Only clone if it's a custom component that might accept onFeatureUse
      try {
        return React.cloneElement(child as React.ReactElement<any>, { 
          onFeatureUse: handleFeatureUse 
        });
      } catch (error) {
        // If cloning fails, return original child
        return child;
      }
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
              {displayName}: {usageCount}/{dailyLimit} used today
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
