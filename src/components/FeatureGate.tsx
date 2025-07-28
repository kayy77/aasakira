
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: 'signals' | 'memeScans' | 'mentorMessages';
  featureName: string;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ children, feature, featureName }) => {
  const { user, canUseFeature, getRemainingUsage, incrementUsage } = useAuth();
  const { toast } = useToast();
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Lock className="w-5 h-5 mr-2 text-purple-400" />
            Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            Please sign in to access {featureName}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if user can use the feature
  const canUse = canUseFeature(feature);
  const remaining = getRemainingUsage(feature);
  const isPremium = user.role === 'premium';

  // If user can't use the feature, show upgrade prompt
  if (!canUse && !isPremium) {
    return (
      <div className="space-y-6">
        <Card className="glass-card border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Crown className="w-5 h-5 mr-2 text-orange-400" />
              Daily Limit Reached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              You've reached your daily limit for {featureName}. Upgrade to Premium for unlimited access!
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowUpgrade(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
          <DialogContent className="glass-card border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="flex items-center text-white">
                <Crown className="w-5 h-5 mr-2 text-purple-400" />
                Upgrade to Premium
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-300">
                Get unlimited access to all premium features including:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• Unlimited AI Signals</li>
                <li>• Advanced Meme Coin Scanner</li>
                <li>• Priority Support</li>
                <li>• Advanced Analytics</li>
              </ul>
              <Button 
                onClick={() => setShowUpgrade(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Contact Support for Upgrade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Wrap children with usage tracking
  const handleFeatureUse = () => {
    if (!isPremium) {
      incrementUsage(feature);
      const newRemaining = remaining - 1;
      
      if (newRemaining <= 1) {
        toast({
          title: "Usage Limit Warning",
          description: `You have ${newRemaining} ${featureName.toLowerCase()} left today. Consider upgrading to Premium for unlimited access.`,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {!isPremium && (
        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  {featureName} remaining today: <span className="font-bold text-blue-400">{remaining}</span>
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowUpgrade(true)}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {React.cloneElement(children as React.ReactElement, { 
        onFeatureUse: handleFeatureUse 
      })}
      
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="glass-card border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center text-white">
              <Crown className="w-5 h-5 mr-2 text-purple-400" />
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              Get unlimited access to all premium features including:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Unlimited AI Signals</li>
              <li>• Advanced Meme Coin Scanner</li>
              <li>• Priority Support</li>
              <li>• Advanced Analytics</li>
            </ul>
            <Button 
              onClick={() => setShowUpgrade(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Contact Support for Upgrade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureGate;
