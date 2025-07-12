import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Zap, Crown, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface UsageLimit {
  feature: string;
  used: number;
  limit: number;
  resetTime?: Date;
}

interface UsageLimitsProps {
  onUpgrade?: () => void;
}

const UsageLimits: React.FC<UsageLimitsProps> = ({ onUpgrade }) => {
  const { isPremium } = useSubscription();
  const [limits, setLimits] = useState<UsageLimit[]>([
    { feature: 'AI Signals', used: 3, limit: 5, resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { feature: 'Meme Scans', used: 8, limit: 10, resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { feature: 'AI Mentor', used: 15, limit: 20, resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { feature: 'Chart Analysis', used: 2, limit: 3, resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  ]);

  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const resetTime = limits[0]?.resetTime;
      if (resetTime) {
        const timeDiff = resetTime.getTime() - now.getTime();
        if (timeDiff > 0) {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilReset(`${hours}h ${minutes}m`);
        } else {
          setTimeUntilReset('Resetting...');
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [limits]);

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBadgeVariant = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'secondary';
    return 'default';
  };

  if (isPremium) {
    return (
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-full">
              <Crown className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Premium Member</h3>
              <p className="text-sm text-gray-400">Unlimited access to all features</p>
            </div>
            <div className="ml-auto">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Premium
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Daily Usage Limits
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            Resets in {timeUntilReset}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {limits.map((limit) => {
          const percentage = (limit.used / limit.limit) * 100;
          const isNearLimit = percentage >= 80;
          
          return (
            <div key={limit.feature} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{limit.feature}</span>
                <div className="flex items-center gap-2">
                  {isNearLimit && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                  <Badge variant={getBadgeVariant(limit.used, limit.limit)}>
                    {limit.used}/{limit.limit}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
              />
              {isNearLimit && (
                <p className="text-xs text-yellow-400">
                  You're approaching your daily limit for {limit.feature}
                </p>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t border-white/10">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-400">
              Upgrade to unlock unlimited access to all features
            </p>
            <Button 
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageLimits;