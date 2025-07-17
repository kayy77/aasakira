
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
  Trophy,
  Zap,
  AlertTriangle,
  Star,
  BarChart3
} from 'lucide-react';
import LessonContent from './lessons/LessonContent';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  completed: boolean;
  sections: number;
  estimatedHours: number;
}

const BeginnerFoundations = () => {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const foundationLessons: Lesson[] = [
    {
      id: 'forex-101',
      title: 'Complete Forex Trading Mastery - Foundation Level',
      description: 'Master the $7.5 trillion market: currency pairs, market psychology, institutional flow, economic drivers, and global sessions. This isn\'t basic knowledge - this is professional-grade foundation.',
      duration: '2-3 hours',
      difficulty: 'Beginner',
      topics: [
        'Market Structure & Participants', 
        'Currency Pair Analysis', 
        'Economic Calendar Mastery', 
        'Session Trading', 
        'Institutional Flow',
        'Smart Money Concepts',
        'Pip & Spread Calculations',
        'Global Market Psychology'
      ],
      completed: false,
      sections: 8,
      estimatedHours: 3
    },
    {
      id: 'reading-charts',
      title: 'Professional Chart Analysis & Price Action Mastery',
      description: 'Decode institutional footprints through advanced candlestick patterns, multi-timeframe analysis, market structure, and professional chart reading techniques used by fund managers.',
      duration: '3-4 hours',
      difficulty: 'Beginner',
      topics: [
        'Japanese Candlestick Mastery', 
        'Reversal Pattern Systems', 
        'Multi-Timeframe Analysis', 
        'Market Structure Reading',
        'Price Action Psychology',
        'Professional Chart Setup',
        'Confluence Trading',
        'Pattern Recognition'
      ],
      completed: false,
      sections: 10,
      estimatedHours: 4
    },
    {
      id: 'basic-analysis',
      title: 'Institutional Support & Resistance + Order Flow',
      description: 'Understand how banks and institutions use support/resistance. Learn order blocks, liquidity zones, fair value gaps, and supply/demand analysis like professional traders.',
      duration: '4-5 hours',
      difficulty: 'Intermediate',
      topics: [
        'Institutional S&R Levels', 
        'Order Block Theory', 
        'Liquidity Zone Mapping', 
        'Fair Value Gap Analysis',
        'Supply & Demand Zones',
        'Market Maker Manipulation',
        'Break of Structure',
        'Confluence Trading'
      ],
      completed: false,
      sections: 12,
      estimatedHours: 5
    },
    {
      id: 'risk-basics',
      title: 'Advanced Risk Management & Capital Preservation',
      description: 'The #1 skill that separates profitable traders from losers. Master position sizing, portfolio theory, drawdown management, and psychological risk control used by hedge funds.',
      duration: '3-4 hours',
      difficulty: 'Beginner',
      topics: [
        'Portfolio Risk Theory', 
        'Position Sizing Models', 
        'Drawdown Management', 
        'Risk/Reward Optimization',
        'Capital Preservation',
        'Psychology of Risk',
        'Risk Calculators',
        'Professional Money Management'
      ],
      completed: false,
      sections: 9,
      estimatedHours: 4
    },
    {
      id: 'market-sessions',
      title: 'Global Session Trading & Market Microstructure',
      description: 'Master when institutional money flows, understand session characteristics, overlap strategies, and optimize your trading schedule for maximum profitability.',
      duration: '2-3 hours',
      difficulty: 'Intermediate',
      topics: [
        'London Session Mastery', 
        'New York Power Hour', 
        'Asian Range Trading', 
        'Session Overlap Strategies',
        'Volume Profile Analysis',
        'Market Microstructure',
        'News Trading Systems',
        'Optimal Timing'
      ],
      completed: false,
      sections: 7,
      estimatedHours: 3
    },
    {
      id: 'first-strategy',
      title: 'Complete Professional Trading System',
      description: 'Your first institutional-grade strategy: entry rules, exit systems, trade management, position sizing, and complete trading plan. This alone could make you profitable.',
      duration: '4-6 hours',
      difficulty: 'Advanced',
      topics: [
        'Complete Strategy Framework', 
        'Entry Signal Systems', 
        'Exit Rule Optimization', 
        'Trade Management',
        'Position Sizing Integration',
        'Risk Management Rules',
        'Backtest Analysis',
        'Live Trading Protocol'
      ],
      completed: false,
      sections: 15,
      estimatedHours: 6
    }
  ];

  const markComplete = (lessonId: string) => {
    setCompletedLessons(prev => [...prev, lessonId]);
    setSelectedLesson(null);
  };

  const progressPercentage = (completedLessons.length / foundationLessons.length) * 100;
  const totalEstimatedHours = foundationLessons.reduce((sum, lesson) => sum + lesson.estimatedHours, 0);
  const completedHours = foundationLessons
    .filter(lesson => completedLessons.includes(lesson.id))
    .reduce((sum, lesson) => sum + lesson.estimatedHours, 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
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

  const getLevelBadge = () => {
    if (progressPercentage === 0) return { text: "Rookie Trader", color: "bg-gray-500/20 text-gray-400", icon: "📚" };
    if (progressPercentage < 30) return { text: "Learning Foundation", color: "bg-blue-500/20 text-blue-400", icon: "📈" };
    if (progressPercentage < 60) return { text: "Developing Skills", color: "bg-green-500/20 text-green-400", icon: "⚡" };
    if (progressPercentage < 90) return { text: "Advanced Learner", color: "bg-purple-500/20 text-purple-400", icon: "🎯" };
    return { text: "Foundation Master", color: "bg-yellow-500/20 text-yellow-400", icon: "🏆" };
  };

  const levelBadge = getLevelBadge();

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <Card className="glass-card border-blue-500/20 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-indigo-900/20">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center text-2xl">
            <BookOpen className="w-8 h-8 mr-3" />
            Professional Trading Foundation Course
          </CardTitle>
          <p className="text-gray-300 text-lg">
            Transform from complete beginner to professional trader with institutional-grade education
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-lg">Course Progress</span>
                  <span className="text-white font-bold text-xl">{completedLessons.length}/{foundationLessons.length} Lessons</span>
                </div>
                <Progress value={progressPercentage} className="h-4" />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{Math.round(progressPercentage)}% Complete</span>
                  <span>{completedHours}/{totalEstimatedHours} Hours</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400">{completedLessons.length * 250}</div>
                  <div className="text-sm text-gray-400">XP Earned</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-400">{completedHours}</div>
                  <div className="text-sm text-gray-400">Hours Studied</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-3xl">⭐</div>
                  <div className="text-sm text-gray-400">Pro Level</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-2xl">{levelBadge.icon}</div>
                  <div className="text-sm text-gray-400">Status</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Badge className={`${levelBadge.color} text-lg px-4 py-2`}>
                {levelBadge.text}
              </Badge>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-lg border border-purple-500/20">
              <h4 className="text-white font-bold text-lg mb-2 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Course Intensity Level: MAXIMUM
              </h4>
              <p className="text-gray-300 mb-4">
                This isn't your typical "intro to forex" course. You're getting the same level of education 
                that fund managers and institutional traders receive. Expect {totalEstimatedHours}+ hours of intensive, 
                professional-grade content that will fundamentally change how you view markets.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Institutional-grade content
                </div>
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Real trading strategies
                </div>
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Professional depth
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Cards */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white mb-4">Complete Foundation Curriculum</h3>
        
        <div className="grid gap-6">
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
                  'border-blue-500/20 hover:border-blue-500/40 hover:scale-[1.01] cursor-pointer shadow-lg hover:shadow-blue-500/20'
                }`}
                onClick={() => !isLocked && !isCompleted && setSelectedLesson(lesson.id)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6 flex-1">
                      <div className={`p-4 rounded-xl ${
                        isCompleted ? 'bg-green-500/20 ring-2 ring-green-500/30' :
                        isLocked ? 'bg-gray-600/20' :
                        'bg-blue-500/20 ring-2 ring-blue-500/30'
                      }`}>
                        {isCompleted ? (
                          <Trophy className="w-8 h-8 text-green-400" />
                        ) : isLocked ? (
                          <Lock className="w-8 h-8 text-gray-500" />
                        ) : (
                          <Icon className="w-8 h-8 text-blue-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className={`text-2xl font-bold ${
                              isLocked ? 'text-gray-500' : 'text-white'
                            }`}>
                              {lesson.title}
                            </h3>
                            <Badge className={getDifficultyColor(lesson.difficulty)}>
                              {lesson.difficulty}
                            </Badge>
                            {lesson.id === 'risk-basics' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                                CRITICAL
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-6 mb-4 text-sm">
                            <div className="flex items-center text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {lesson.duration}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {lesson.sections} Sections
                            </div>
                            <div className="flex items-center text-gray-400">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              {lesson.estimatedHours}h Intensive
                            </div>
                          </div>
                          
                          <p className={`text-lg leading-relaxed mb-4 ${
                            isLocked ? 'text-gray-600' : 'text-gray-300'
                          }`}>
                            {lesson.description}
                          </p>
                          
                          <div className="space-y-3">
                            <h4 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                              What You'll Master:
                            </h4>
                            <div className="grid md:grid-cols-2 gap-2">
                              {lesson.topics.map((topic, topicIndex) => (
                                <span 
                                  key={topicIndex}
                                  className={`text-sm px-3 py-2 rounded-lg ${
                                    isLocked 
                                      ? 'bg-gray-700 text-gray-500' 
                                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  }`}
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 text-center">
                      {isCompleted ? (
                        <div className="space-y-3">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-4 py-2">
                            <Trophy className="w-5 h-5 mr-2" />
                            MASTERED
                          </Badge>
                          <div className="text-green-400 font-bold text-lg">+{lesson.estimatedHours * 50} XP</div>
                        </div>
                      ) : isLocked ? (
                        <div className="space-y-3">
                          <Badge className="bg-gray-600/20 text-gray-500 border-gray-600/30 text-lg px-4 py-2">
                            <Lock className="w-5 h-5 mr-2" />
                            LOCKED
                          </Badge>
                          <div className="text-gray-500 text-sm">Complete previous lesson</div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLesson(lesson.id);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-6 py-3"
                          >
                            <Play className="w-5 h-5 mr-2" />
                            START LEARNING
                          </Button>
                          <div className="text-blue-400 font-bold">+{lesson.estimatedHours * 50} XP Available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Next Steps */}
      {progressPercentage === 100 && (
        <Card className="glass-card border-yellow-500/20 bg-gradient-to-r from-yellow-900/20 via-orange-900/20 to-red-900/20">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="text-6xl">🎓</div>
              <h3 className="text-3xl font-bold text-white">
                Foundation MASTERED!
              </h3>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Congratulations! You've completed {totalEstimatedHours} hours of institutional-grade education. 
                You now understand forex trading at a deeper level than 95% of retail traders. 
                You're ready for advanced institutional strategies and live market warfare.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">{totalEstimatedHours * 50}</div>
                  <div className="text-sm text-gray-400">Total XP Earned</div>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">95%</div>
                  <div className="text-sm text-gray-400">Above Retail Level</div>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">PRO</div>
                  <div className="text-sm text-gray-400">Status Unlocked</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  UNLOCK ADVANCED WARFARE
                </Button>
                <Button variant="outline" className="border-purple-500/30 text-purple-400 text-lg px-8 py-4">
                  <Brain className="w-5 h-5 mr-2" />
                  AI MENTOR LIVE PRACTICE
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning for incomplete progress */}
      {progressPercentage > 0 && progressPercentage < 100 && (
        <Card className="glass-card border-orange-500/20 bg-gradient-to-r from-orange-900/20 to-red-900/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <h4 className="text-xl font-bold text-white">Foundation In Progress</h4>
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-gray-300 mb-4">
              You're building solid foundations, but the real power comes from completing the entire curriculum. 
              Each lesson builds upon the previous one - complete them all to unlock your full potential.
            </p>
            <div className="text-orange-400 font-bold">
              {foundationLessons.length - completedLessons.length} lessons remaining to master the foundation
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto glass-card">
          <DialogHeader>
            <DialogTitle className="text-purple-400 text-2xl">
              Professional Trading Education
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
