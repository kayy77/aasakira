
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Brain
} from 'lucide-react';

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

  const foundationLessons: Lesson[] = [
    {
      id: 'forex-101',
      title: 'What is Forex Trading?',
      description: 'Learn the absolute basics: what forex is, how currencies work, and why people trade them.',
      duration: '10 min',
      difficulty: 'Beginner',
      topics: ['Currency pairs', 'Exchange rates', 'Market basics'],
      completed: false
    },
    {
      id: 'reading-charts',
      title: 'Reading Your First Chart',
      description: 'Understand candlesticks, timeframes, and how to read price movements.',
      duration: '15 min',
      difficulty: 'Beginner',
      topics: ['Candlesticks', 'Timeframes', 'Price action'],
      completed: false
    },
    {
      id: 'basic-analysis',
      title: 'Support and Resistance',
      description: 'Learn to identify key levels where price tends to bounce or break.',
      duration: '20 min',
      difficulty: 'Beginner',
      topics: ['Support levels', 'Resistance levels', 'Level testing'],
      completed: false
    },
    {
      id: 'risk-basics',
      title: 'Risk Management Fundamentals',
      description: 'The most important lesson: how to protect your money and manage risk.',
      duration: '25 min',
      difficulty: 'Beginner',
      topics: ['Position sizing', 'Stop losses', '1% rule'],
      completed: false
    },
    {
      id: 'market-sessions',
      title: 'Trading Sessions & Times',
      description: 'When to trade and when to stay away from the markets.',
      duration: '15 min',
      difficulty: 'Beginner',
      topics: ['London session', 'New York session', 'Market overlap'],
      completed: false
    },
    {
      id: 'first-strategy',
      title: 'Your First Trading Strategy',
      description: 'A simple, proven strategy to get you started with actual trading concepts.',
      duration: '30 min',
      difficulty: 'Intermediate',
      topics: ['Entry rules', 'Exit rules', 'Trade management'],
      completed: false
    }
  ];

  const markComplete = (lessonId: string) => {
    setCompletedLessons(prev => [...prev, lessonId]);
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
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Foundation Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Overall Progress</span>
              <span className="text-white font-bold">{completedLessons.length}/{foundationLessons.length} Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-gray-400">
              {progressPercentage === 0 && "Start your trading journey with the absolute basics."}
              {progressPercentage > 0 && progressPercentage < 50 && "Great start! Keep building your foundation."}
              {progressPercentage >= 50 && progressPercentage < 100 && "You're making excellent progress!"}
              {progressPercentage === 100 && "🎉 Foundation complete! Ready for advanced concepts."}
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
                'border-blue-500/20 hover:border-blue-500/40'
              }`}
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
                      ) : (
                        <Icon className={`w-6 h-6 ${isLocked ? 'text-gray-500' : 'text-blue-400'}`} />
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
                        ✓ Complete
                      </Badge>
                    ) : isLocked ? (
                      <Badge className="bg-gray-600/20 text-gray-500 border-gray-600/30">
                        🔒 Locked
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => markComplete(lesson.id)}
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
            <h3 className="text-xl font-bold text-white mb-4">🎓 Foundation Complete!</h3>
            <p className="text-gray-300 mb-4">
              Excellent work! You've mastered the fundamentals. Ready for advanced concepts?
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue to Intermediate Course
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BeginnerFoundations;
