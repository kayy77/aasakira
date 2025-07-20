import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  Trophy, 
  Clock, 
  CheckCircle, 
  BookOpen,
  Zap,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  stage: number;
}

interface Stage {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const stages: Stage[] = [
  {
    id: '1',
    title: 'Foundations of Trading',
    description: 'Learn the basic concepts and terminology of financial markets.',
    lessons: [
      {
        id: '101',
        title: 'Introduction to Financial Markets',
        description: 'Overview of stocks, forex, commodities, and indices.',
        content: 'Detailed content about financial markets...',
        duration: 30,
        stage: 1,
      },
      {
        id: '102',
        title: 'Key Trading Terminology',
        description: 'Understanding essential terms like leverage, margin, and pips.',
        content: 'Explanation of key trading terms...',
        duration: 45,
        stage: 1,
      },
    ],
  },
  {
    id: '2',
    title: 'Technical Analysis',
    description: 'Master the art of reading charts and identifying trading opportunities.',
    lessons: [
      {
        id: '201',
        title: 'Chart Patterns',
        description: 'Identifying and interpreting common chart patterns.',
        content: 'In-depth analysis of chart patterns...',
        duration: 60,
        stage: 2,
      },
      {
        id: '202',
        title: 'Technical Indicators',
        description: 'Using indicators like RSI, MACD, and moving averages.',
        content: 'How to use technical indicators...',
        duration: 75,
        stage: 2,
      },
    ],
  },
  {
    id: '3',
    title: 'Risk Management',
    description: 'Learn how to protect your capital and manage risk effectively.',
    lessons: [
      {
        id: '301',
        title: 'Position Sizing',
        description: 'Determining the appropriate position size for each trade.',
        content: 'Strategies for position sizing...',
        duration: 45,
        stage: 3,
      },
      {
        id: '302',
        title: 'Stop-Loss Orders',
        description: 'Using stop-loss orders to limit potential losses.',
        content: 'How to set effective stop-loss orders...',
        duration: 60,
        stage: 3,
      },
    ],
  },
];

const ComprehensiveLearningPath = () => {
  const { user } = useAuth();
  const [currentStage, setCurrentStage] = useState(1);
  const [userProgress, setUserProgress] = useState(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [testScores, setTestScores] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user progress:', error);
        return;
      }

      setUserProgress(data || {
        current_stage: 1,
        completed_lessons: [],
      });

      if (data) {
        setCurrentStage(data.current_stage || 1);
        setCompletedLessons(data.completed_lessons || []);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const updateProgress = async (stage: number, lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            current_stage: stage,
            completed_lessons: [...completedLessons, lessonId],
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error updating user progress:', error);
      } else {
        console.log('User progress updated successfully');
        loadUserProgress();
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  };

  const calculateTotalLessons = () => {
    let total = 0;
    stages.forEach((stage) => {
      total += stage.lessons.length;
    });
    return total;
  };

  const calculateCompletedPercentage = () => {
    const totalLessons = calculateTotalLessons();
    const completed = completedLessons.length;
    return (completed / totalLessons) * 100;
  };

  const currentStageData = stages.find((stage) => stage.id === currentStage.toString());

  const renderStageContent = (stage: any) => {
    return (
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-purple-400" />
            {stage.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stage.lessons.map((lesson: any, index: number) => (
              <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">{lesson.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{lesson.description}</p>
                
                {/* Add interactive test component */}
                <div className="flex justify-between items-center">
                  <Button 
                    size="sm" 
                    onClick={() => startLesson(lesson.id)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Start Lesson
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => takeTest(lesson.id)}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    Take Test
                  </Button>
                </div>
                
                {/* Show test score if available */}
                {testScores[lesson.id] && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={testScores[lesson.id] >= 80 ? "default" : "destructive"}>
                      Test Score: {testScores[lesson.id]}%
                    </Badge>
                    {testScores[lesson.id] < 80 && (
                      <Button size="sm" variant="ghost" onClick={() => retakeTest(lesson.id)}>
                        Retake Test
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const startLesson = (lessonId: string) => {
    // Track lesson start
    console.log(`Starting lesson: ${lessonId}`);
  };

  const takeTest = (lessonId: string) => {
    // Generate random test score for demo
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    setTestScores(prev => ({
      ...prev,
      [lessonId]: score
    }));
  };

  const retakeTest = (lessonId: string) => {
    // Allow retaking test
    takeTest(lessonId);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-4">
          Comprehensive Trading Education
        </h2>
        <p className="text-gray-400 text-lg">
          Unlock your trading potential with our structured learning path
        </p>
      </div>

      {/* Progress Section */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">Total Progress:</span>
            <span className="text-white">{calculateCompletedPercentage().toFixed(0)}%</span>
          </div>
          <Progress value={calculateCompletedPercentage()} className="w-full" />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Stage</TabsTrigger>
          <TabsTrigger value="overview">Full Path</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-4">
          {currentStageData ? (
            renderStageContent(currentStageData)
          ) : (
            <p className="text-gray-400">No current stage data available.</p>
          )}
        </TabsContent>
        
        <TabsContent value="overview" className="space-y-4">
          {stages.map((stage) => (
            <Card key={stage.id} className="glass-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  {stage.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {stage.lessons.map((lesson) => (
                    <li key={lesson.id} className="text-gray-300">
                      {lesson.title}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="tests" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Test Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(testScores).map(([lessonId, score]) => (
                  <div key={lessonId} className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                    <span className="text-gray-300">Lesson {lessonId}</span>
                    <Badge variant={score >= 80 ? "default" : "destructive"}>
                      {score}%
                    </Badge>
                  </div>
                ))}
                {Object.keys(testScores).length === 0 && (
                  <p className="text-gray-400 text-center">No tests taken yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveLearningPath;
