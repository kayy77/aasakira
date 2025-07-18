
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  CheckCircle,
  Lock,
  Play,
  Brain,
  Star,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import ProgressQuiz from './ProgressQuiz';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: Lesson[];
  quiz: QuizQuestion[];
  prerequisites: string[];
  isLocked: boolean;
  completed: boolean;
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  videoUrl?: string;
  keyPoints: string[];
  completed: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

const ComprehensiveLearningPath = () => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    initializeModules();
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const initializeModules = () => {
    const learningModules: LearningModule[] = [
      {
        id: 'fundamentals',
        title: 'Trading Fundamentals',
        description: 'Master the core concepts of forex trading, market structure, and basic analysis.',
        duration: '2 weeks',
        difficulty: 'Beginner',
        prerequisites: [],
        isLocked: false,
        completed: false,
        progress: 0,
        lessons: [
          {
            id: 'intro-forex',
            title: 'Introduction to Forex Markets',
            content: `
# Introduction to Forex Markets

The Foreign Exchange (Forex) market is the world's largest financial market, with over $7 trillion traded daily.

## Key Concepts:
- **Currency Pairs**: Always traded in pairs (EUR/USD, GBP/JPY)
- **Base vs Quote Currency**: EUR/USD = Euro (base) vs US Dollar (quote)
- **Pip**: The smallest price move (usually 4th decimal place)
- **Spread**: Difference between bid and ask price

## Major Currency Pairs:
1. **EUR/USD** - Euro vs US Dollar
2. **GBP/USD** - British Pound vs US Dollar  
3. **USD/JPY** - US Dollar vs Japanese Yen
4. **USD/CHF** - US Dollar vs Swiss Franc

## Market Sessions:
- **London Session**: 8:00 AM - 5:00 PM GMT (Most Active)
- **New York Session**: 1:00 PM - 10:00 PM GMT (High Volume)
- **Tokyo Session**: 12:00 AM - 9:00 AM GMT (Asian Markets)

The overlap between London and New York sessions (1:00-5:00 PM GMT) provides the highest liquidity and volatility.
            `,
            duration: '30 min',
            keyPoints: [
              'Forex is the largest financial market globally',
              'Currencies are always traded in pairs',
              'London-New York overlap offers best trading opportunities',
              'Understanding pips and spreads is crucial'
            ],
            completed: false
          },
          {
            id: 'market-structure',
            title: 'Market Structure Basics',
            content: `
# Market Structure Basics

Understanding market structure is fundamental to successful trading. Markets move in trends and ranges.

## Trend Identification:
### Uptrend (Bullish Market):
- Higher Highs (HH) and Higher Lows (HL)
- Price consistently moves upward
- Buyers are in control

### Downtrend (Bearish Market):
- Lower Highs (LH) and Lower Lows (LL)
- Price consistently moves downward
- Sellers are in control

### Sideways/Range (Consolidation):
- Price moves between support and resistance
- No clear directional bias
- Accumulation or distribution phase

## Key Levels:
- **Support**: Price level where buying interest emerges
- **Resistance**: Price level where selling pressure increases
- **Break of Structure (BOS)**: When price breaks key levels
- **Change of Character (CHoCH)**: Shift from bullish to bearish or vice versa

## Market Phases:
1. **Accumulation**: Smart money builds positions
2. **Markup/Distribution**: Price moves in trending fashion
3. **Re-accumulation/Re-distribution**: Consolidation before next move
            `,
            duration: '45 min',
            keyPoints: [
              'Trends show clear higher highs/lows patterns',
              'Support and resistance are key decision levels',
              'Market moves in phases: accumulation, trend, consolidation',
              'Break of structure signals potential trend change'
            ],
            completed: false
          }
        ],
        quiz: [
          {
            id: 'fund-q1',
            question: 'What is the largest financial market in the world by daily trading volume?',
            options: ['Stock Market', 'Forex Market', 'Bond Market', 'Crypto Market'],
            correctAnswer: 1,
            explanation: 'The Forex market trades over $7 trillion daily, making it the largest financial market globally.',
            topic: 'fundamentals'
          },
          {
            id: 'fund-q2',
            question: 'In the currency pair EUR/USD, which is the base currency?',
            options: ['USD', 'EUR', 'Both equally', 'Neither'],
            correctAnswer: 1,
            explanation: 'EUR is the base currency, and USD is the quote currency. The price shows how many USD it takes to buy 1 EUR.',
            topic: 'fundamentals'
          },
          {
            id: 'fund-q3',
            question: 'What characterizes an uptrend in market structure?',
            options: ['Lower highs and lower lows', 'Higher highs and higher lows', 'Sideways movement', 'Random price action'],
            correctAnswer: 1,
            explanation: 'An uptrend is defined by higher highs (HH) and higher lows (HL), showing consistent upward price movement.',
            topic: 'fundamentals'
          },
          {
            id: 'fund-q4',
            question: 'Which trading session overlap provides the highest liquidity?',
            options: ['Tokyo-London', 'London-New York', 'New York-Tokyo', 'All are equal'],
            correctAnswer: 1,
            explanation: 'The London-New York overlap (1:00-5:00 PM GMT) offers the highest liquidity and volatility due to both major markets being active.',
            topic: 'fundamentals'
          },
          {
            id: 'fund-q5',
            question: 'What is a pip in forex trading?',
            options: ['A type of currency', 'The smallest price movement', 'A trading strategy', 'A market session'],
            correctAnswer: 1,
            explanation: 'A pip is the smallest price movement in a currency pair, typically the 4th decimal place (e.g., 0.0001).',
            topic: 'fundamentals'
          }
        ]
      },
      {
        id: 'smart-money',
        title: 'Smart Money Concepts',
        description: 'Learn how institutional traders think and move the markets using SMC principles.',
        duration: '3 weeks',
        difficulty: 'Intermediate',
        prerequisites: ['fundamentals'],
        isLocked: true,
        completed: false,
        progress: 0,
        lessons: [
          {
            id: 'order-blocks',
            title: 'Order Blocks',
            content: `
# Order Blocks - Institutional Footprints

Order blocks are areas where smart money (banks, institutions) have placed large orders, leaving "footprints" in the market.

## What are Order Blocks?
Order blocks are consolidation areas before significant price movements. They represent:
- Areas of unfilled orders
- Institutional interest zones
- High probability reversal areas

## Types of Order Blocks:
### Bullish Order Block:
- Forms during downtrend
- Last bearish candle before bullish move
- Often acts as support when retested

### Bearish Order Block:
- Forms during uptrend  
- Last bullish candle before bearish move
- Often acts as resistance when retested

## How to Identify Order Blocks:
1. Look for consolidation before explosive moves
2. Identify the last opposing candle before the move
3. Mark the high and low of that candle
4. Wait for retest for entry opportunity

## Trading Order Blocks:
- **Entry**: On retest of the order block
- **Stop Loss**: Beyond the order block
- **Take Profit**: Next significant level
- **Confluence**: Use with other SMC concepts
            `,
            duration: '60 min',
            keyPoints: [
              'Order blocks show where institutions placed large orders',
              'Bullish OBs form before upward moves, bearish before downward',
              'Retests of order blocks often provide high-probability entries',
              'Always use proper risk management with stop losses'
            ],
            completed: false
          }
        ],
        quiz: [
          {
            id: 'smc-q1',
            question: 'What do order blocks represent in Smart Money Concepts?',
            options: ['Random price areas', 'Areas where institutions placed large orders', 'Technical indicator signals', 'Moving average levels'],
            correctAnswer: 1,
            explanation: 'Order blocks represent areas where smart money (institutions) have placed large orders, leaving footprints that can be identified and traded.',
            topic: 'smart-money'
          }
        ]
      }
    ];

    setModules(learningModules);
  };

  const loadUserProgress = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserProgress(data);
      }
    } catch (error) {
      console.log('No user progress found, starting fresh');
    }
  };

  const handleLessonComplete = async (moduleId: string, lessonId: string) => {
    // Update lesson as completed
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? {
            ...module,
            lessons: module.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, completed: true } : lesson
            )
          }
        : module
    ));

    // Save progress to database
    if (user) {
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            lessons_completed: [lessonId],
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  const handleQuizComplete = (moduleId: string, score: number) => {
    setShowQuiz(false);
    
    if (score >= 80) {
      // Unlock next module
      setModules(prev => prev.map((module, index) => {
        if (module.id === moduleId) {
          return { ...module, completed: true };
        }
        // Unlock next module
        const currentIndex = prev.findIndex(m => m.id === moduleId);
        if (index === currentIndex + 1) {
          return { ...module, isLocked: false };
        }
        return module;
      }));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold-400" />
            6-Month Professional Trading Mastery
            <Badge className="bg-gradient-to-r from-purple-500 to-gold-500">
              ELITE PROGRAM
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {modules.filter(m => m.completed).length}/{modules.length}
              </div>
              <div className="text-gray-400">Modules Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0)}
              </div>
              <div className="text-gray-400">Lessons Finished</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round((modules.filter(m => m.completed).length / modules.length) * 100)}%
              </div>
              <div className="text-gray-400">Overall Progress</div>
            </div>
          </div>
          <Progress 
            value={(modules.filter(m => m.completed).length / modules.length) * 100} 
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid gap-6">
        {modules.map((module) => (
          <Card 
            key={module.id} 
            className={`glass-card transition-all ${
              module.isLocked 
                ? 'border-gray-600/20 opacity-60' 
                : module.completed
                ? 'border-green-500/30'
                : 'border-purple-500/20 hover:border-purple-400/40'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {module.isLocked ? (
                    <Lock className="w-6 h-6 text-gray-400" />
                  ) : module.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  )}
                  <div>
                    <CardTitle className="text-white">{module.title}</CardTitle>
                    <p className="text-gray-400 text-sm">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {module.duration}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {!module.isLocked && (
              <CardContent className="space-y-4">
                <Tabs defaultValue="lessons">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lessons">Lessons</TabsTrigger>
                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="lessons" className="space-y-3">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {lesson.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Play className="w-5 h-5 text-blue-400" />
                          )}
                          <div>
                            <div className="font-medium text-white">{lesson.title}</div>
                            <div className="text-sm text-gray-400">{lesson.duration}</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveModule(module.id);
                            setActiveLesson(lesson.id);
                          }}
                          className={lesson.completed ? 'bg-green-600/20' : 'bg-blue-600'}
                        >
                          {lesson.completed ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="quiz">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <span className="text-lg font-semibold text-white">Knowledge Test</span>
                      </div>
                      <p className="text-gray-400">
                        Test your understanding with {module.quiz.length} questions. 
                        Score 80% or higher to unlock the next module.
                      </p>
                      <Button
                        onClick={() => {
                          setActiveModule(module.id);
                          setShowQuiz(true);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                        disabled={module.lessons.some(l => !l.completed)}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Take Quiz
                      </Button>
                      {module.lessons.some(l => !l.completed) && (
                        <p className="text-sm text-yellow-400">
                          Complete all lessons before taking the quiz
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}

            {module.isLocked && (
              <CardContent>
                <div className="text-center py-4">
                  <Lock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-400">
                    Complete previous modules to unlock this content
                  </p>
                  {module.prerequisites.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Prerequisites: {module.prerequisites.join(', ')}
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Lesson Modal */}
      {activeModule && activeLesson && !showQuiz && (
        <Card className="glass-card border-blue-500/20 fixed inset-4 z-50 overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-400">
                {modules.find(m => m.id === activeModule)?.lessons.find(l => l.id === activeLesson)?.title}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveModule(null);
                  setActiveLesson(null);
                }}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lesson Content */}
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-300">
                {modules.find(m => m.id === activeModule)?.lessons.find(l => l.id === activeLesson)?.content}
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Key Takeaways
              </h4>
              <ul className="space-y-2">
                {modules.find(m => m.id === activeModule)?.lessons.find(l => l.id === activeLesson)?.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  handleLessonComplete(activeModule, activeLesson);
                  setActiveModule(null);
                  setActiveLesson(null);
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Modal */}
      {activeModule && showQuiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <ProgressQuiz
              topic={modules.find(m => m.id === activeModule)?.title || ''}
              questions={modules.find(m => m.id === activeModule)?.quiz || []}
              onComplete={(score) => handleQuizComplete(activeModule, score)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveLearningPath;
