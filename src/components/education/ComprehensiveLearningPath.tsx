
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Zap, 
  CheckCircle2, 
  Lock,
  Play,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SimpleLearningPath from './SimpleLearningPath';

const ComprehensiveLearningPath = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProgress, setUserProgress] = useState<any>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showSimplePath, setShowSimplePath] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching progress:', error);
        return;
      }

      if (data) {
        setUserProgress(data);
        // Use current_streak instead of current_stage
        setCurrentLevel(Math.floor(data.current_streak / 5) + 1);
      } else {
        // Create initial progress record
        const { data: newProgress, error: createError } = await supabase
          .from('user_progress')
          .insert([
            {
              user_id: user.id,
              current_streak: 0,
              max_streak: 0,
              total_lessons_completed: 0,
              preferred_timeframes: ['15m', '1h'],
              risk_tolerance: 'moderate'
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating progress:', createError);
        } else {
          setUserProgress(newProgress);
          setCurrentLevel(1);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const learningLevels = [
    {
      id: 1,
      title: "Trading Foundations",
      description: "Master the basics of forex trading and market fundamentals",
      lessons: 5,
      xp: 100,
      unlocked: true,
      topics: ["Market Structure", "Currency Pairs", "Pip Values", "Basic Analysis", "Risk Management"]
    },
    {
      id: 2,
      title: "Technical Analysis",
      description: "Learn chart patterns, indicators, and price action",
      lessons: 8,
      xp: 200,
      unlocked: currentLevel >= 2,
      topics: ["Support/Resistance", "Trend Lines", "Candlesticks", "Moving Averages", "RSI", "MACD"]
    },
    {
      id: 3,
      title: "Smart Money Concepts",
      description: "Understand institutional trading and market maker moves",
      lessons: 10,
      xp: 300,
      unlocked: currentLevel >= 3,
      topics: ["Order Blocks", "Fair Value Gaps", "Liquidity Sweeps", "Break of Structure", "Mitigation"]
    },
    {
      id: 4,
      title: "Advanced Strategies",
      description: "Master complex trading strategies and psychology",
      lessons: 12,
      xp: 500,
      unlocked: currentLevel >= 4,
      topics: ["Multi-timeframe Analysis", "Correlation", "News Trading", "Psychology", "Position Sizing"]
    }
  ];

  const handleStartLevel = (levelId: number) => {
    if (levelId === 1 || currentLevel >= levelId) {
      setShowSimplePath(true);
      toast({
        title: "Starting Level",
        description: `Beginning ${learningLevels.find(l => l.id === levelId)?.title}`,
      });
    } else {
      toast({
        title: "Level Locked",
        description: "Complete previous levels to unlock this content",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (showSimplePath) {
    return <SimpleLearningPath onBack={() => setShowSimplePath(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">Your Learning Journey</CardTitle>
              <p className="text-gray-400 mt-1">Master trading through structured progression</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{userProgress?.current_streak || 0}</div>
                <div className="text-sm text-gray-400">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{userProgress?.total_lessons_completed || 0}</div>
                <div className="text-sm text-gray-400">Lessons Complete</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Levels */}
      <div className="grid gap-6">
        {learningLevels.map((level, index) => (
          <Card 
            key={level.id} 
            className={`glass-card transition-all duration-300 ${
              level.unlocked 
                ? 'border-purple-500/30 hover:border-purple-500/50' 
                : 'border-gray-600/30 opacity-60'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    level.unlocked 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'bg-gray-600/20 border border-gray-600/30'
                  }`}>
                    {level.unlocked ? (
                      currentLevel > level.id ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-purple-400" />
                      )
                    ) : (
                      <Lock className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">Level {level.id}: {level.title}</h3>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        +{level.xp} XP
                      </Badge>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{level.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {level.topics.map((topic, topicIndex) => (
                        <Badge 
                          key={topicIndex} 
                          variant="outline" 
                          className="text-xs border-purple-500/30 text-purple-300"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {level.lessons} Lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {level.xp} XP Reward
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleStartLevel(level.id)}
                  disabled={!level.unlocked}
                  className={`${
                    level.unlocked
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {currentLevel > level.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Review
                    </>
                  ) : level.unlocked ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </>
                  )}
                </Button>
              </div>
              
              {/* Progress Bar for Current Level */}
              {currentLevel === level.id && level.unlocked && (
                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-purple-300">Progress</span>
                    <span className="text-sm text-purple-300">
                      {Math.min(userProgress?.current_streak || 0, level.lessons)}/{level.lessons}
                    </span>
                  </div>
                  <Progress 
                    value={(Math.min(userProgress?.current_streak || 0, level.lessons) / level.lessons) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Section */}
      <Card className="glass-card border-green-500/20">
        <CardContent className="p-6 text-center">
          <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Ready to Start?</h3>
          <p className="text-gray-400 mb-4">
            Begin your trading education journey with our structured learning path
          </p>
          <Button
            onClick={() => handleStartLevel(1)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Start Learning Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveLearningPath;
