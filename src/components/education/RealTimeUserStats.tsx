import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  MessageCircle, 
  ChartBar, 
  Target, 
  Clock, 
  Trophy,
  Eye,
  Gamepad2,
  Brain,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserTrackingService } from '@/services/userTrackingService';

const RealTimeUserStats: React.FC = () => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProgress = async () => {
      if (!user?.id) return;

      try {
        const progress = await UserTrackingService.getUserProgress(user.id);
        setUserProgress(progress);
      } catch (error) {
        console.error('Error loading user progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProgress();
    
    // Refresh every 30 seconds to show real-time updates
    const interval = setInterval(loadUserProgress, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressLevel = (activity: number, max: number) => {
    return Math.min((activity / max) * 100, 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProgress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Start Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Begin using the platform to see your real-time progress tracking!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Real-Time Learning Analytics
            </div>
            <Badge variant="secondary">Live Tracking</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">{userProgress.win_rate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Win Rate
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-yellow-500">{userProgress.current_streak}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4" />
                Current Streak
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-500">
                {formatTime(userProgress.total_study_time_minutes)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Study Time
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-500">{userProgress.messages_sent}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MessageCircle className="h-4 w-4" />
                AI Chats
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="h-5 w-5" />
            Activity Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ChartBar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Charts Analyzed</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {userProgress.charts_analyzed}/100
                </span>
              </div>
              <Progress value={getProgressLevel(userProgress.charts_analyzed, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Signals Viewed</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {userProgress.signals_viewed}/50
                </span>
              </div>
              <Progress value={getProgressLevel(userProgress.signals_viewed, 50)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Meme Coins Scanned</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {userProgress.meme_coins_scanned}/200
                </span>
              </div>
              <Progress value={getProgressLevel(userProgress.meme_coins_scanned, 200)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Trading Games</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {userProgress.trading_games_played}/25
                </span>
              </div>
              <Progress value={getProgressLevel(userProgress.trading_games_played, 25)} className="h-2" />
            </div>
          </div>

          {/* Skills & Preferences */}
          {(userProgress.skills_mastered?.length > 0 || userProgress.trading_style) && (
            <div className="pt-4 border-t space-y-4">
              {userProgress.skills_mastered?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Skills Mastered
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {userProgress.skills_mastered.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {userProgress.trading_style && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Trading Profile</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">{userProgress.trading_style}</Badge>
                    {userProgress.risk_tolerance && (
                      <Badge variant="outline">{userProgress.risk_tolerance} Risk</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {userProgress.max_streak}
              </div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {Math.floor(userProgress.total_study_time_minutes / 60)}
              </div>
              <div className="text-sm text-muted-foreground">Hours Learned</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-500 mb-1">
                {(userProgress.charts_analyzed + userProgress.signals_viewed + userProgress.meme_coins_scanned)}
              </div>
              <div className="text-sm text-muted-foreground">Total Analysis</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeUserStats;