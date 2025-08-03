
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { Crown, TrendingUp, BarChart3, Brain } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { isPremium, usageToday, dailyLimits, getUsagePercentage } = useSubscription();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-white text-xl">Please sign in to view your profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black">
      <Navigation />
      <MobileNavigation />
      
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{user.email?.[0].toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-white text-3xl font-bold">{user.email}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isPremium ? "default" : "secondary"} className="flex items-center gap-1">
                {isPremium ? <Crown className="w-3 h-3" /> : null}
                {isPremium ? 'Premium' : 'Free'} Trader
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">AI Signals Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{usageToday.signals}/{isPremium ? '∞' : dailyLimits.signals}</div>
              {!isPremium && (
                <Progress value={getUsagePercentage('signals')} className="mt-2" />
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Meme Coin Scans</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{usageToday.memeCoins}/{isPremium ? '∞' : dailyLimits.memeCoins}</div>
              {!isPremium && (
                <Progress value={getUsagePercentage('memeCoins')} className="mt-2" />
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">AI Mentor Messages</CardTitle>
              <Brain className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{usageToday.aiMentorMessages}/{isPremium ? '∞' : dailyLimits.aiMentorMessages}</div>
              {!isPremium && (
                <Progress value={getUsagePercentage('aiMentorMessages')} className="mt-2" />
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Account Type</span>
              <Badge variant={isPremium ? "default" : "secondary"}>
                {isPremium ? 'Premium' : 'Free'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Member Since</span>
              <span className="text-white">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
