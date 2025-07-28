
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Lock, 
  Crown, 
  Star, 
  Zap 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  featureName: string;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ children, feature, featureName }) => {
  const { user, canUseFeature, getRemainingUsage, incrementUsage } = useAuth();
  const { toast } = useToast();
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  console.log('FeatureGate rendering for feature:', feature, 'user:', user);

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <Card className="glass-card border-gray-500/20">
        <CardContent className="p-6 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Sign In Required
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Please sign in to access {featureName}
          </p>
          <Button 
            onClick={() => toast({
              title: "Sign In Required",
              description: "Please sign in to access this feature",
            })}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  const canUse = canUseFeature(feature);
  const remaining = getRemainingUsage(feature);
  const subscription = user.subscription;
  const isPremium = subscription?.tier === 'premium';

  console.log('Feature gate check:', {
    feature,
    canUse,
    remaining,
    isPremium,
    subscription
  });

  // Show upgrade prompt if user has reached limits
  if (!canUse && !isPremium) {
    return (
      <Card className="glass-card border-yellow-500/20">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Daily Limit Reached
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            You've reached your daily limit for {featureName}. Upgrade to Premium for unlimited access.
          </p>
          <Button 
            onClick={() => setShowUpgrade(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show usage warning for free users approaching limits
  if (!isPremium && remaining <= 2 && remaining > 0) {
    return (
      <>
        <Card className="glass-card border-yellow-500/20 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-400">
                  {remaining} {featureName} uses remaining today
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUpgrade(true)}
                className="text-yellow-400 hover:text-yellow-300"
              >
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {children}
      </>
    );
  }

  // Handle feature usage tracking
  const handleFeatureUse = () => {
    console.log('Feature use triggered for:', feature);
    if (!isPremium) {
      incrementUsage(feature);
      const newRemaining = remaining - 1;
      
      if (newRemaining === 0) {
        toast({
          title: "Daily Limit Reached",
          description: `You've used all your ${featureName} for today. Upgrade for unlimited access!`,
          action: (
            <Button
              size="sm"
              onClick={() => setShowUpgrade(true)}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Upgrade
            </Button>
          ),
        });
      } else if (newRemaining <= 2) {
        toast({
          title: "Usage Warning",
          description: `${newRemaining} ${featureName} uses remaining today`,
        });
      }
    }
  };

  return (
    <>
      {/* Usage indicator for free users */}
      {!isPremium && (
        <Card className="glass-card border-purple-500/20 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-300">
                  {remaining} {featureName} uses remaining today
                </span>
              </div>
              <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                Free Plan
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div>
        {React.isValidElement(children) ? 
          React.cloneElement(children as React.ReactElement<any>, { onFeatureUse: handleFeatureUse }) : 
          children
        }
      </div>
      
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="glass-card border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-400">
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Get unlimited access to all features, including unlimited {featureName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Premium Benefits:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Unlimited {featureName}</li>
                <li>• Priority support</li>
                <li>• Advanced analytics</li>
                <li>• Early access to new features</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowUpgrade(false)}
                variant="ghost"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={() => {
                  setShowUpgrade(false);
                  toast({
                    title: "Upgrade Feature",
                    description: "Premium upgrade feature coming soon!",
                  });
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeatureGate;
