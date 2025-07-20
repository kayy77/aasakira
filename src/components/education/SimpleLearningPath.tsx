
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  Play, 
  Award,
  Clock,
  Target
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  unlocked: boolean;
}

const SimpleLearningPath = () => {
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Trading Basics',
      description: 'Learn the fundamentals of trading',
      unlocked: true,
      lessons: [
        {
          id: '1-1',
          title: 'What is Trading?',
          description: 'Introduction to financial markets and trading',
          duration: 15,
          completed: false
        },
        {
          id: '1-2',
          title: 'Market Types',
          description: 'Forex, Stocks, Crypto, and Commodities',
          duration: 20,
          completed: false
        },
        {
          id: '1-3',
          title: 'Basic Terminology',
          description: 'Essential trading terms you need to know',
          duration: 25,
          completed: false
        }
      ]
    },
    {
      id: '2',
      title: 'Chart Analysis',
      description: 'Learn to read and analyze price charts',
      unlocked: false,
      lessons: [
        {
          id: '2-1',
          title: 'Candlestick Patterns',
          description: 'Understanding price action through candlesticks',
          duration: 30,
          completed: false
        },
        {
          id: '2-2',
          title: 'Support and Resistance',
          description: 'Identifying key price levels',
          duration: 35,
          completed: false
        }
      ]
    },
    {
      id: '3',
      title: 'Risk Management',
      description: 'Protect your capital and manage risk',
      unlocked: false,
      lessons: [
        {
          id: '3-1',
          title: 'Position Sizing',
          description: 'How much to risk per trade',
          duration: 25,
          completed: false
        },
        {
          id: '3-2',
          title: 'Stop Loss Orders',
          description: 'Limiting your losses effectively',
          duration: 30,
          completed: false
        }
      ]
    }
  ]);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const completeLesson = (moduleId: string, lessonId: string) => {
    setModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        const updatedLessons = module.lessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        );
        
        // Check if all lessons in module are completed
        const allCompleted = updatedLessons.every(lesson => lesson.completed);
        
        return { ...module, lessons: updatedLessons };
      }
      return module;
    }));

    // Unlock next module if current one is completed
    setModules(prev => {
      const moduleIndex = prev.findIndex(m => m.id === moduleId);
      if (moduleIndex >= 0 && moduleIndex < prev.length - 1) {
        const currentModule = prev[moduleIndex];
        const allCompleted = currentModule.lessons.every(l => l.completed);
        
        if (allCompleted) {
          return prev.map((module, index) => 
            index === moduleIndex + 1 ? { ...module, unlocked: true } : module
          );
        }
      }
      return prev;
    });

    setCurrentLesson(null);
  };

  const startLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const calculateProgress = () => {
    const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
    const completedLessons = modules.reduce((total, module) => 
      total + module.lessons.filter(lesson => lesson.completed).length, 0
    );
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  const getLessonContent = (lessonId: string) => {
    const content: { [key: string]: string } = {
      '1-1': 'Trading is the buying and selling of financial instruments to profit from price movements. Markets operate 24/5 for forex, providing opportunities around the clock.',
      '1-2': 'Different markets have unique characteristics: Forex (currency pairs), Stocks (company shares), Crypto (digital assets), and Commodities (gold, oil, etc.).',
      '1-3': 'Key terms: Pip (smallest price movement), Spread (buy/sell difference), Leverage (borrowed capital), Margin (required deposit).',
      '2-1': 'Candlesticks show open, high, low, close prices. Green/white = bullish, Red/black = bearish. Patterns like doji, hammer indicate market sentiment.',
      '2-2': 'Support = price level where buying interest emerges. Resistance = level where selling pressure increases. These levels often repeat.',
      '3-1': 'Never risk more than 1-2% of account per trade. Position size = (Account * Risk%) / (Entry - Stop Loss). This ensures survival during losing streaks.',
      '3-2': 'Stop loss orders automatically close losing trades at predetermined levels. Place below support for longs, above resistance for shorts.'
    };
    return content[lessonId] || 'Lesson content loading...';
  };

  if (currentLesson) {
    const moduleId = modules.find(m => m.lessons.some(l => l.id === currentLesson.id))?.id || '1';
    
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{currentLesson.title}</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setCurrentLesson(null)}
              >
                Back to Path
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{currentLesson.duration} minutes</span>
            </div>
            
            <div className="p-6 bg-gray-800/50 rounded-lg">
              <p className="text-gray-300 leading-relaxed">
                {getLessonContent(currentLesson.id)}
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => completeLesson(moduleId, currentLesson.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Learning Progress</h2>
            <Badge className="bg-purple-500/20 text-purple-400">
              {Math.round(calculateProgress())}% Complete
            </Badge>
          </div>
          <Progress value={calculateProgress()} className="w-full" />
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <div className="space-y-4">
        {modules.map((module) => (
          <Card 
            key={module.id} 
            className={`glass-card ${
              module.unlocked ? 'border-purple-500/30' : 'border-gray-500/20 opacity-60'
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    module.unlocked ? 'bg-purple-500/20' : 'bg-gray-500/20'
                  }`}>
                    <BookOpen className={`w-5 h-5 ${
                      module.unlocked ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg">{module.title}</h3>
                    <p className="text-sm text-gray-400">{module.description}</p>
                  </div>
                </div>
                {!module.unlocked && (
                  <Badge variant="outline" className="border-gray-500/30 text-gray-400">
                    Locked
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            
            {module.unlocked && (
              <CardContent>
                <div className="space-y-3">
                  {module.lessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                        )}
                        <div>
                          <h4 className="text-white font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-400">{lesson.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{lesson.duration}min</span>
                        {!lesson.completed && (
                          <Button 
                            size="sm"
                            onClick={() => startLesson(lesson)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimpleLearningPath;
