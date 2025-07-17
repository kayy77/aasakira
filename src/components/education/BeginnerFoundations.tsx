
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Shield,
  Brain,
  Lock,
  Trophy
} from 'lucide-react';
import LessonContent from './lessons/LessonContent';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate';
  topics: string[];
  completed: boolean;
}

const BeginnerFoundations = () => {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const foundationLessons: Lesson[] = [
    {
      id: 'forex-101',
      title: 'What is Forex Trading?',
      description: 'Master the fundamentals: currency pairs, market mechanics, and why forex exists.',
      duration: '15 min',
      difficulty: 'Beginner',
      topics: ['Currency pairs', 'Exchange rates', 'Market basics', 'Pips & Spreads'],
      completed: false
    },
    {
      id: 'reading-charts',
      title: 'Reading Charts Like a Pro',
      description: 'Decode candlesticks, timeframes, and price action - your window into market psychology.',
      duration: '20 min',
      difficulty: 'Beginner',
      topics: ['Candlesticks', 'Timeframes', 'Price action', 'Chart patterns'],
      completed: false
    },
    {
      id: 'basic-analysis',
      title: 'Support & Resistance Mastery',
      description: 'Identify key levels where institutional money makes decisions - the foundation of all trading.',
      duration: '25 min',
      difficulty: 'Beginner',
      topics: ['Support levels', 'Resistance levels', 'Role reversal', 'Level testing'],
      completed: false
    },
    {
      id: 'risk-basics',
      title: 'Risk Management (Most Important)',
      description: 'The #1 reason traders fail or succeed. Master this and you master trading.',
      duration: '30 min',
      difficulty: 'Beginner',
      topics: ['1% rule', 'Position sizing', 'Stop losses', 'Risk/Reward'],
      completed: false
    },
    {
      id: 'market-sessions',
      title: 'Trading Sessions & Timing',
      description: 'When to trade for maximum profit and when to stay away completely.',
      duration: '20 min',
      difficulty: 'Beginner',
      topics: ['London session', 'New York session', 'Overlaps', 'Volume patterns'],
      completed: false
    },
    {
      id: 'first-strategy',
      title: 'Your First Profitable Strategy',
      description: 'A complete, proven trading strategy with entry rules, exits, and risk management.',
      duration: '35 min',
      difficulty: 'Intermediate',
      topics: ['Entry signals', 'Exit rules', 'Trade management', 'Common mistakes'],
      completed: false
    }
  ];

  const markComplete = (lessonId: string) => {
    setCompletedLessons(prev => [...prev, lessonId]);
    setSelectedLesson(null);
  };

  const progressPercentage = (completedLessons.length / foundationLessons.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    return difficulty === 'Beginner' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const getIconForLesson = (lessonId: string) => {
    switch (lessonId) {
      case 'forex-101': return DollarSign;
      case 'reading-charts': return TrendingUp;
      case 'basic-analysis': return Target;
      case 'risk-basics': return Shield;
      case 'market-sessions': return Clock;
      case 'first-strategy': return Brain;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="glass-card border-blue-500/20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Complete Trading Foundation Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Overall Progress</span>
              <span className="text-white font-bold">{completedLessons.length}/{foundationLessons.length} Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{completedLessons.length * 50}</div>
                <div className="text-xs text-gray-400">XP Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {progressPercentage === 100 ? '🏆' : progressPercentage >= 50 ? '⭐' : '📚'}
                </div>
                <div className="text-xs text-gray-400">Status</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center">
              {progressPercentage === 0 && "🚀 Start your journey to becoming a profitable trader"}
              {progressPercentage > 0 && progressPercentage < 30 && "📈 Great start! Building solid foundations"}
              {progressPercentage >= 30 && progressPercentage < 70 && "🔥 Making excellent progress! Keep going"}
              {progressPercentage >= 70 && progressPercentage < 100 && "⚡ Almost there! You're becoming dangerous"}
              {progressPercentage === 100 && "🎯 Foundation mastered! Ready for advanced warfare"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Cards */}
      <div className="grid gap-4">
        {foundationLessons.map((lesson, index) => {
          const Icon = getIconForLesson(lesson.id);
          const isCompleted = completedLessons.includes(lesson.id);
          const isLocked = index > 0 && !completedLessons.includes(foundationLessons[index - 1].id);
          
          return (
            <Card 
              key={lesson.id}
              className={`glass-card transition-all duration-300 ${
                isCompleted ? 'border-green-500/50 bg-green-500/5' :
                isLocked ? 'border-gray-600/30 bg-gray-800/30' :
                'border-blue-500/20 hover:border-blue-500/40 hover:scale-[1.02] cursor-pointer'
              }`}
              onClick={() => !isLocked && !isCompleted && setSelectedLesson(lesson.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      isCompleted ? 'bg-green-500/20' :
                      isLocked ? 'bg-gray-600/20' :
                      'bg-blue-500/20'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 text-gray-500" />
                      ) : (
                        <Icon className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          isLocked ? 'text-gray-500' : 'text-white'
                        }`}>
                          {lesson.title}
                        </h3>
                        <Badge className={getDifficultyColor(lesson.difficulty)}>
                          {lesson.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-gray-400">
                          {lesson.duration}
                        </Badge>
                        {lesson.id === 'risk-basics' && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            CRITICAL
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`mb-3 ${
                        isLocked ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        {lesson.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {lesson.topics.map((topic, topicIndex) => (
                          <span 
                            key={topicIndex}
                            className={`text-xs px-2 py-1 rounded ${
                              isLocked ? 'bg-gray-700 text-gray-500' : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {isCompleted ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Trophy className="w-4 h-4 mr-1" />
                        Mastered
                      </Badge>
                    ) : isLocked ? (
                      <Badge className="bg-gray-600/20 text-gray-500 border-gray-600/30">
                        <Lock className="w-4 h-4 mr-1" />
                        Locked
                      </Badge>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLesson(lesson.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Lesson
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Steps */}
      {progressPercentage === 100 && (
        <Card className="glass-card border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              🎓 Foundation Mastered!
            </h3>
            <p className="text-gray-300 mb-4">
              Congratulations! You've completed the foundation course. You now understand more about trading 
              than 90% of people who attempt it. Ready for advanced concepts and live market analysis?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                Advanced Course
              </Button>
              <Button variant="outline" className="border-purple-500/30 text-purple-400">
                <Brain className="w-4 h-4 mr-2" />
                AI Mentor Practice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
          <DialogHeader>
            <DialogTitle className="text-purple-400">
              Interactive Trading Lesson
            </DialogTitle>
          </DialogHeader>
          {selectedLesson && (
            <LessonContent
              lessonId={selectedLesson}
              onComplete={() => markComplete(selectedLesson)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BeginnerFoundations;
