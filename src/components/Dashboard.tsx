
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
  ArrowLeft,
  Settings,
  Cherry
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CherryBlossomBackground from './CherryBlossomBackground';
import PremiumUpgrade from './PremiumUpgrade';
import UserProfile from './UserProfile';

const Dashboard = () => {
  const { user, getRemainingUsage } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const signalsRemaining = getRemainingUsage('signals');
  const memeScansRemaining = getRemainingUsage('memeScans');
  const mentorMessagesRemaining = getRemainingUsage('mentorMessages');

  const isPremium = user.role === 'premium';

  const getUsagePercentage = (used: number, limit: number) => {
    if (isPremium) return 0;
    return (used / limit) * 100;
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
              <ArrowLeft className="w-5 h-5 mr-2" />
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
            {/* Aasakira Logo */}
            <div className="w-20 h-20 mr-4 flex items-center justify-center">
              <img 
                src="/lovable-uploads/68ed1ae9-42f1-4e05-9393-155056ac2672.png" 
                alt="Aasakira Logo" 
                className="w-16 h-16 object-contain filter brightness-0 invert"
              />
            </div>
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
          <p className="text-gray-400 text-lg">
            Your AI-powered trading companion dashboard
          </p>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Button
              onClick={() => navigate('/signals')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-lift"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Signals
            </Button>
            <Button
              onClick={() => navigate('/memecoins')}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover-lift"
            >
              <Target className="w-4 h-4 mr-2" />
              Meme Scanner
            </Button>
            <Button
              onClick={() => navigate('/education')}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover-lift"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Mentor
            </Button>
            <Button
              onClick={() => setShowProfile(true)}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Profile Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
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
                  `${signalsRemaining}/2`
                )}
              </div>
              {!isPremium && (
                <Progress 
                  value={getUsagePercentage(user.aiSignalsUsedToday, 2)} 
                  className="w-full h-2 mb-2"
                />
              )}
              <p className="text-xs text-gray-400">
                {isPremium ? 'Premium access active' : 'Signals remaining today'}
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
                  `${memeScansRemaining}/3`
                )}
              </div>
              {!isPremium && (
                <Progress 
                  value={getUsagePercentage(user.memeScansUsedToday, 3)} 
                  className="w-full h-2 mb-2"
                />
              )}
              <p className="text-xs text-gray-400">
                {isPremium ? 'Premium access active' : 'Scans remaining today'}
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
                  `${mentorMessagesRemaining}/10`
                )}
              </div>
              {!isPremium && (
                <Progress 
                  value={getUsagePercentage(user.mentorMessagesUsedToday, 10)} 
                  className="w-full h-2 mb-2"
                />
              )}
              <p className="text-xs text-gray-400">
                {isPremium ? 'Premium access active' : 'Messages remaining today'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Premium Features */}
          <Card className="glass-card hover-glow border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-purple-400" />
                Premium Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Unlimited AI Signals</span>
                {isPremium ? (
                  <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-600 text-gray-400">Locked</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Unlimited Meme Coin Scans</span>
                {isPremium ? (
                  <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-600 text-gray-400">Locked</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Community Access</span>
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

          {/* Community Access */}
          <Card className="glass-card hover-glow border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Users className="w-6 h-6 mr-2 text-purple-400" />
                Elite Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Join our exclusive premium trading community with:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-purple-400" />
                  Real-time trade alerts
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                  Market analysis discussions
                </li>
                <li className="flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-400" />
                  Expert trader insights
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-400" />
                  Direct access to our team
                </li>
              </ul>
              
              {isPremium ? (
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 hover-lift"
                  onClick={() => window.open('https://discord.gg/aasakira', '_blank')}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Premium Community
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowUpgrade(true)}
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Unlock Community Access
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="glass-card hover-glow border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Daily Reset</h4>
                <p className="text-white">
                  {new Date(user.resetAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PremiumUpgrade open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default Dashboard;
