
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { Crown, LogOut, Zap } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-white text-xl">Please sign in to access settings</div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black">
      <Navigation />
      <MobileNavigation />
      
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-white text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-semibold">Current Plan</div>
                  <div className="text-gray-400 text-sm">
                    {isPremium ? 'Premium - Unlimited access to all features' : 'Free - Limited daily usage'}
                  </div>
                </div>
                <Badge variant={isPremium ? "default" : "secondary"} className="flex items-center gap-1">
                  {isPremium ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                  {isPremium ? 'Premium' : 'Free'}
                </Badge>
              </div>
              
              {!isPremium && (
                <div className="pt-4 border-t border-gray-700">
                  <PremiumUpgrade />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="text-white font-medium">Email Address</div>
                  <div className="text-gray-400 text-sm">{user.email}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="text-white font-medium">Account Created</div>
                  <div className="text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
