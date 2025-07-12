
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown, Zap } from 'lucide-react';
import PremiumUpgrade from './PremiumUpgrade';
import { useToast } from '@/hooks/use-toast';

interface FeatureGateProps {
  feature: 'signals' | 'memeScans' | 'mentorMessages';
  children: React.ReactNode;
  featureName: string;
}

const FeatureGate = ({ feature, children, featureName }: FeatureGateProps) => {
  const { user, canUseFeature, getRemainingUsage, incrementUsage } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { toast } = useToast();

  if (!user) {
    return (
      <Alert className="border-red-500/30 bg-red-500/10">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">
          Please log in to access {featureName}.
        </AlertDescription>
      </Alert>
    );
  }

  const canUse = canUseFeature(feature);
  const remaining = getRemainingUsage(feature);
  const isPremium = user.role === 'premium';

  // If user can't use the feature, show upgrade prompt
  if (!canUse) {
    return (
      <div className="glass-card p-8 text-center border-orange-500/20">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
        <p className="text-gray-300 mb-4">
          You've used all your {featureName} for today. Upgrade to Premium for unlimited access!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-orange-400">0</div>
            <div className="text-sm text-gray-400">{featureName} Remaining</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-purple-400">∞</div>
            <div className="text-sm text-gray-400">Premium Access</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-green-400">24h</div>
            <div className="text-sm text-gray-400">Until Reset</div>
          </div>
        </div>

        <Button 
          onClick={() => setShowUpgrade(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 hover-lift cyber-glow"
        >
          <Crown className="w-5 h-5 mr-2" />
          Upgrade to Premium
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          Limits reset daily at midnight UTC
        </p>

        <PremiumUpgrade open={showUpgrade} onOpenChange={setShowUpgrade} />
      </div>
    );
  }

  // Clone children and add usage tracking
  const enhancedChildren = React.cloneElement(children as React.ReactElement, {
    onFeatureUse: () => {
      if (!isPremium) {
        incrementUsage(feature);
        toast({
          title: `${featureName} Used`,
          description: `You have ${remaining - 1} ${featureName.toLowerCase()} remaining today.`,
        });
      }
    }
  });

  return (
    <div>
      {/* Usage indicator */}
      {!isPremium && (
        <div className="mb-6 glass-card p-4 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">{featureName} Usage</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {remaining} remaining today
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowUpgrade(true)}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            </div>
          </div>
          
          {remaining <= 1 && (
            <Alert className="mt-3 border-orange-500/30 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-300">
                <strong>Low Usage Warning:</strong> You have {remaining} {featureName.toLowerCase()} remaining. 
                Consider upgrading to Premium for unlimited access.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {enhancedChildren}

      <PremiumUpgrade open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default FeatureGate;
