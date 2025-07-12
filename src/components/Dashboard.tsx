import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  Target, 
  Brain, 
  Users, 
  TrendingUp, 
  Sparkles,
  Activity,
  Settings,
  Home,
  MessageCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CherryBlossomBackground from './CherryBlossomBackground';
import PremiumUpgrade from './PremiumUpgrade';
import UserProfile from './UserProfile';
import { useSubscription } from '@/contexts/SubscriptionContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { usageToday, dailyLimits, isPremium, getUsagePercentage, getTimeUntilReset } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleJoinCommunity = () => {
    if (isPremium) {
      window.open('https://t.me/+BVlQ6Le1ORtiZTU0', '_blank');
    } else {
      setShowUpgrade(true);
    }
  };

  const handleBackToHome = () => {
    console.log('Navigating back to home...');
    window.location.href = '/';
  };

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative overflow-hidden">
        <CherryBlossomBackground />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Navigation */}
          <div className="flex items-center mb-8">
            <Button
              onClick={() => setShowProfile(false)}
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative overflow-hidden">
      <CherryBlossomBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Logo and Navigation */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            {/* New Aasakira Logo */}
            <img 
              src="/lovable-uploads/b8d9ec60-b2f7-4ad0-9d21-dbc7e5d67c6e.png" 
              alt="Aasakira Logo" 
              className="h-16 w-auto object-contain mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold gradient-text">
                Welcome back, {user.username}
              </h1>
              <div className="flex items-center justify-center mt-2">
                {isPremium ? (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                    <Crown className="w-4 h-4 mr-1" />
                    Premium Member
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    Free Member
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-lg mb-6">
            Your AI-powered trading companion dashboard
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Usage Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* AI Signals Usage */}
          <Card className="glass-card hover-glow border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                AI Trading Signals
              </CardTitle>
              <Zap className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">
                {isPremium ? (
                  <span className="text-green-400">Unlimited</span>
                ) : (
                  `${usageToday.signals}/${dailyLimits.signals}`
                )}
              </div>
              {!isPremium && (
                <Progress 
                  value={getUsagePercentage('signals')} 
                  className="w-full h-2 mb-2"
                />
              )}
              <p className="text-xs text-gray-400">
                {isPremium ? 'Premium access active' : 'Daily limit'}
              </p>
            </CardContent>
          </Card>

          {/* Meme Coin Scanner Usage */}
          <Card className="glass-card hover-glow border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Meme Coin Scanner
              </CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">
                {isPremium ? (
                  <span className="text-green-400">Unlimited</span>
                ) : (
                  `${usageToday.memeCoins}/${dailyLimits.memeCoins}`
                )}
              </div>
              {!isPremium && (
                <Progress 
                  value={getUsagePercentage('memeCoins')} 
                  className="w-full h-2 mb-2"
                />
              )}
              <p className="text-xs text-gray-400">
                {isPremium ? 'Premium access active' : 'Daily limit'}
              </p>
            </CardContent>
          </Card>

          {/* AI Mentor Usage */}
          <Card className="glass-card hover-glow border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                AI Trading Mentor
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">
                {isPremium ? (
                  <span className="text-green-400">Unlimited</span>
                ) : (
                  `${usageToday.aiMentorMessages}/${dailyLimits.aiMentorMessages}`
                )}
              </div>
              {!isPremium && (
                <Progress 
                  value={getUsagePercentage('aiMentorMessages')} 
                  className="w-full h-2 mb-2"
                />
              )}
              <p className="text-xs text-gray-400">
                {isPremium ? 'Premium access active' : `Resets in ${getTimeUntilReset()}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Premium Community */}
          <Card className="glass-card hover-glow border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Users className="w-6 h-6 mr-2 text-purple-400" />
                Elite Trading Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Join our exclusive Telegram community with elite traders:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2 text-purple-400" />
                  Real-time trade alerts & setups
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                  Live market analysis discussions
                </li>
                <li className="flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-400" />
                  Direct access to pro traders
                </li>
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                  Exclusive premium strategies
                </li>
              </ul>
              
              <Button 
                onClick={handleJoinCommunity}
                className={`w-full font-semibold py-3 hover-lift ${
                  isPremium 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    : 'bg-gray-700 text-gray-300 cursor-not-allowed'
                }`}
                disabled={!isPremium}
              >
                {isPremium ? (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Join Premium Community
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Premium Members Only
                  </>
                )}
              </Button>
              
              {!isPremium && (
                <p className="text-xs text-center text-gray-500">
                  Upgrade to Premium to unlock community access
                </p>
              )}
            </CardContent>
          </Card>

          {/* Premium Features */}
          <Card className="glass-card hover-glow border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Crown className="w-6 h-6 mr-2 text-purple-400" />
                Premium Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Unlimited AI Signals</span>
                  {isPremium ? (
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-600 text-gray-400">2/day</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Unlimited AI Mentor</span>
                  {isPremium ? (
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-600 text-gray-400">5/day</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Premium Community</span>
                  {isPremium ? (
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-600 text-gray-400">Locked</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Priority Support</span>
                  {isPremium ? (
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-600 text-gray-400">Locked</Badge>
                  )}
                </div>
              </div>
              
              {!isPremium && (
                <Button 
                  onClick={() => setShowUpgrade(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 hover-lift cyber-glow mt-6"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings Card */}
        <Card className="glass-card hover-glow border-purple-500/20 mb-12">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <Settings className="w-6 h-6 mr-2 text-purple-400" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Email</h4>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Member Since</h4>
                <p className="text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowProfile(true)}
              className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover-lift"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <PremiumUpgrade open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default Dashboard;
