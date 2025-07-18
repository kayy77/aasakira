
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, Clock, BookOpen, Brain, Trophy, Target, Zap, Star, Award, GraduationCap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string;
  keyPoints: string[];
  practiceExercises: string[];
  locked: boolean;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  lessons: Lesson[];
  completedLessons: number;
  totalLessons: number;
  estimatedHours: number;
}

const ComprehensiveLearningPath = () => {
  const [selectedModule, setSelectedModule] = useState<string>('foundations');
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const modules: Module[] = [
    {
      id: 'foundations',
      title: 'Trading Foundations',
      description: 'Master the essential basics of trading and market structure',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      estimatedHours: 12,
      completedLessons: 2,
      totalLessons: 6,
      lessons: [
        {
          id: 'intro-markets',
          title: 'Introduction to Financial Markets',
          description: 'Understanding market structure, participants, and basic terminology',
          duration: '45 min',
          difficulty: 'Beginner',
          locked: false,
          completed: true,
          content: `# Welcome to Financial Markets

Financial markets are the backbone of global economics. In this comprehensive lesson, you'll learn:

## What Are Financial Markets?
Financial markets are platforms where buyers and sellers trade financial securities, commodities, and other fungible items at low transaction costs and at prices that reflect supply and demand.

## Key Market Participants
- **Retail Traders**: Individual investors like yourself
- **Institutional Investors**: Hedge funds, pension funds, mutual funds
- **Market Makers**: Provide liquidity by buying and selling
- **Central Banks**: Control monetary policy and currency stability

## Major Market Types
1. **Forex Market**: Currency trading (largest market globally)
2. **Stock Market**: Shares of public companies
3. **Commodity Market**: Raw materials and agricultural products
4. **Crypto Market**: Digital currencies and tokens

## Trading Sessions
- **Asian Session**: 12:00 AM - 9:00 AM GMT
- **European Session**: 8:00 AM - 5:00 PM GMT  
- **American Session**: 1:00 PM - 10:00 PM GMT

Understanding these basics is crucial for your trading success.`,
          keyPoints: [
            'Markets facilitate price discovery through supply and demand',
            'Different market participants have different motivations',
            'Trading sessions affect volatility and liquidity',
            'Understanding market structure is essential for timing trades'
          ],
          practiceExercises: [
            'Identify the current trading session and its characteristics',
            'Watch market opening for different sessions',
            'Track how news affects different market participants'
          ]
        },
        {
          id: 'chart-reading',
          title: 'Chart Reading Fundamentals',
          description: 'Learn to read candlestick charts, timeframes, and basic patterns',
          duration: '60 min',
          difficulty: 'Beginner',
          locked: false,
          completed: true,
          content: `# Mastering Chart Reading

Charts are your window into market psychology. This lesson covers everything you need to know about reading price action.

## Candlestick Basics
Each candlestick represents price action over a specific time period:
- **Body**: Shows opening and closing prices
- **Wicks/Shadows**: Show highest and lowest prices
- **Green/White**: Closing price higher than opening (bullish)
- **Red/Black**: Closing price lower than opening (bearish)

## Essential Timeframes
- **M1-M5**: Scalping and quick entries
- **M15-M30**: Intraday trading
- **H1-H4**: Swing trading setups
- **D1**: Daily bias and major levels
- **W1/MN**: Long-term trend analysis

## Key Price Levels
1. **Support**: Price level where buying pressure emerges
2. **Resistance**: Price level where selling pressure appears
3. **Trend Lines**: Connect swing highs or lows
4. **Round Numbers**: Psychological levels (1.3000, 1.2500, etc.)

## Basic Patterns
- **Higher Highs/Higher Lows**: Uptrend
- **Lower Highs/Lower Lows**: Downtrend
- **Equal Highs/Lows**: Consolidation

Practice identifying these elements on live charts daily.`,
          keyPoints: [
            'Candlesticks reveal market sentiment and psychology',
            'Different timeframes serve different trading purposes',
            'Support and resistance levels are critical decision points',
            'Trends and patterns help predict future price movement'
          ],
          practiceExercises: [
            'Practice identifying candlestick patterns on different timeframes',
            'Draw support and resistance levels on EUR/USD daily chart',
            'Identify current trend direction on major pairs'
          ]
        },
        {
          id: 'market-structure',
          title: 'Market Structure Analysis',
          description: 'Understanding market phases, trends, and institutional behavior',
          duration: '75 min',
          difficulty: 'Intermediate',
          locked: false,
          completed: false,
          content: `# Advanced Market Structure

Understanding how markets move and why is crucial for consistent profitability.

## Market Phases
Markets move in predictable cycles:

### 1. Accumulation
- Smart money builds positions quietly
- Low volatility, sideways movement
- Public interest is minimal

### 2. Markup (Uptrend)
- Prices rise as demand exceeds supply
- Increased volume and volatility
- Public starts to notice

### 3. Distribution
- Smart money starts selling to retail
- High volatility, choppy movement
- Maximum public participation

### 4. Markdown (Downtrend)
- Supply exceeds demand
- Panic selling often occurs
- Public exits at worst prices

## Smart Money Concepts
- **Liquidity Hunting**: Targeting stop losses
- **Order Blocks**: Areas of significant institutional orders
- **Fair Value Gaps**: Inefficient price movements
- **Liquidity Pools**: Areas where stops accumulate

## Institutional vs Retail Behavior
**Institutions:**
- Plan entries and exits in advance
- Use large position sizes
- Focus on efficiency and risk management

**Retail Traders:**
- Often react emotionally to price moves
- Use smaller position sizes
- Frequently overtrade

Understanding this dynamic gives you a significant edge.`,
          keyPoints: [
            'Markets move in predictable cycles of accumulation and distribution',
            'Smart money moves before retail traders react',
            'Liquidity is the key driver of institutional movements',
            'Understanding market structure improves entry and exit timing'
          ],
          practiceExercises: [
            'Identify current market phase on major currency pairs',
            'Mark order blocks and fair value gaps on charts',
            'Track institutional vs retail sentiment indicators'
          ]
        },
        {
          id: 'risk-management',
          title: 'Risk Management Essentials',
          description: 'Position sizing, stop losses, and capital preservation',
          duration: '50 min',
          difficulty: 'Beginner',
          locked: false,
          completed: false,
          content: `# Risk Management: Your Trading Lifeline

Risk management is the difference between profitable traders and blown accounts.

## The 1% Rule
Never risk more than 1-2% of your account on a single trade:
- Account Size: $10,000
- Risk per Trade: $100-200 (1-2%)
- If stop loss is 50 pips, position size = $2-4 per pip

## Position Sizing Formula
Position Size = (Account Balance × Risk %) ÷ Stop Loss Distance

Example:
- Account: $5,000
- Risk: 1% = $50
- Stop Loss: 25 pips
- Position Size: $50 ÷ 25 = $2 per pip

## Types of Stop Losses
1. **Technical Stops**: Based on support/resistance levels
2. **Percentage Stops**: Fixed percentage from entry
3. **ATR Stops**: Based on Average True Range
4. **Time Stops**: Exit after predetermined time

## Risk-Reward Ratios
Always aim for at least 1:2 risk-reward:
- Risk $50 to make $100+
- This allows you to be profitable even with 40% win rate

## Money Management Rules
- Never add to losing positions
- Scale out of winning trades
- Keep detailed records of all trades
- Review and adjust risk parameters monthly

Remember: It's not about being right, it's about making money.`,
          keyPoints: [
            'Never risk more than you can afford to lose',
            'Position sizing is more important than entry timing',
            'Good risk-reward ratios allow for lower win rates',
            'Consistency in risk management leads to long-term success'
          ],
          practiceExercises: [
            'Calculate position sizes for different account balances',
            'Practice setting stop losses at technical levels',
            'Track risk-reward ratios for 20 demo trades'
          ]
        }
      ]
    },
    {
      id: 'technical-analysis',
      title: 'Technical Analysis',
      description: 'Advanced charting techniques and indicator mastery',
      icon: <Target className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      estimatedHours: 16,
      completedLessons: 0,
      totalLessons: 8,
      lessons: [
        {
          id: 'indicators',
          title: 'Technical Indicators Mastery',
          description: 'RSI, MACD, Moving Averages, and more',
          duration: '90 min',
          difficulty: 'Intermediate',
          locked: true,
          completed: false,
          content: `# Technical Indicators Deep Dive

Learn to use indicators effectively without over-relying on them.

## Moving Averages
The foundation of trend analysis:
- **Simple MA**: Average of closing prices
- **Exponential MA**: Gives more weight to recent prices
- **Common Periods**: 20, 50, 100, 200

### Trading Applications:
- **Golden Cross**: 50 MA crosses above 200 MA (bullish)
- **Death Cross**: 50 MA crosses below 200 MA (bearish)
- **Dynamic Support/Resistance**: Price bounces off moving averages

## RSI (Relative Strength Index)
Measures momentum and identifies overbought/oversold conditions:
- **Range**: 0-100
- **Overbought**: Above 70
- **Oversold**: Below 30
- **Best Use**: Divergences and momentum confirmation

## MACD (Moving Average Convergence Divergence)
Shows relationship between two moving averages:
- **Signal Line**: 9-period EMA of MACD line
- **Histogram**: Difference between MACD and Signal line
- **Bullish**: MACD crosses above signal line
- **Bearish**: MACD crosses below signal line

## Bollinger Bands
Volatility indicator that adapts to market conditions:
- **Middle Band**: 20-period moving average
- **Upper/Lower Bands**: 2 standard deviations from middle
- **Squeeze**: Low volatility, expect breakout
- **Expansion**: High volatility, trend continuation

Remember: Indicators lag price action. Use them for confirmation, not prediction.`,
          keyPoints: [
            'Indicators should confirm, not predict price movements',
            'Combine multiple indicators for better accuracy',
            'Understand what each indicator actually measures',
            'Never trade on indicators alone without price action context'
          ],
          practiceExercises: [
            'Set up charts with multiple timeframe moving averages',
            'Practice identifying RSI divergences',
            'Use MACD to time entries and exits'
          ]
        }
      ]
    },
    {
      id: 'psychology',
      title: 'Trading Psychology',
      description: 'Master your emotions and develop winning mindset',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500',
      estimatedHours: 10,
      completedLessons: 0,
      totalLessons: 5,
      lessons: [
        {
          id: 'mindset',
          title: 'Developing a Winning Mindset',
          description: 'Overcome fear, greed, and emotional trading',
          duration: '60 min',
          difficulty: 'Intermediate',
          locked: true,
          completed: false,
          content: `# The Psychology of Winning Traders

Your mindset determines your success more than any strategy.

## Common Psychological Traps

### Fear
- **Fear of Missing Out (FOMO)**: Chasing trades
- **Fear of Losing**: Leads to tight stops and small positions
- **Fear of Being Wrong**: Prevents cutting losses

### Greed
- **Overtrading**: Taking too many trades
- **Overleveraging**: Using excessive position sizes
- **Moving Targets**: Constantly changing profit targets

### Hope
- **Hoping Losers Turn Around**: Not cutting losses
- **Hoping for Perfect Entries**: Missing good opportunities
- **False Hope**: Ignoring negative signals

## Developing Mental Discipline

### 1. Accept Losses as Part of Trading
- Every trade has a probability of loss
- Focus on overall profitability, not individual trades
- Pre-define maximum acceptable loss

### 2. Create and Follow a Trading Plan
- Define entry and exit criteria
- Set risk management rules
- Stick to the plan regardless of emotions

### 3. Practice Mindfulness
- Be aware of your emotional state
- Take breaks when stressed or frustrated
- Don't trade when emotional

### 4. Keep a Trading Journal
- Record not just trades but emotions
- Identify patterns in your behavior
- Learn from both wins and losses

## Professional Trader Mindset
- Process-focused, not outcome-focused
- Accepts uncertainty and randomness
- Focuses on risk management over profits
- Views trading as a business, not gambling

The difference between profitable and unprofitable traders is rarely knowledge—it's psychology.`,
          keyPoints: [
            'Emotions are the biggest enemy of consistent profitability',
            'Developing discipline takes time and practice',
            'Focus on process, not individual trade outcomes',
            'Self-awareness is crucial for trading success'
          ],
          practiceExercises: [
            'Keep an emotion journal for one week',
            'Practice meditation for 10 minutes daily',
            'Review past trades and identify emotional mistakes'
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    if (user?.id) {
      loadUserProgress();
    }
  }, [user?.id]);

  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const completeLesson = async (lessonId: string) => {
    if (!user?.id) return;

    try {
      // Update user progress
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          skills_mastered: [...(userProgress?.skills_mastered || []), lessonId],
          total_study_time_minutes: (userProgress?.total_study_time_minutes || 0) + 45,
          updated_at: new Date().toISOString()
        });

      toast({
        title: "Lesson Completed! 🎉",
        description: "Great progress! Keep up the excellent work.",
      });

      // Refresh progress
      loadUserProgress();
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const selectedModuleData = modules.find(m => m.id === selectedModule);
  const selectedLessonData = selectedModuleData?.lessons.find(l => l.id === selectedLesson);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8 text-gold-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Professional Trading Mastery
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Complete structured learning path from beginner to professional trader. 
            Master technical analysis, risk management, and trading psychology.
          </p>
          
          {userProgress && (
            <div className="mt-6 flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{userProgress.total_study_time_minutes || 0}</div>
                <div className="text-sm text-gray-400">Minutes Studied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{userProgress.skills_mastered?.length || 0}</div>
                <div className="text-sm text-gray-400">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{userProgress.current_streak || 0}</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Module Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {modules.map((module) => (
                <Card 
                  key={module.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedModule === module.id 
                      ? 'bg-gradient-to-r ' + module.color + ' border-transparent shadow-lg' 
                      : 'glass-card border-gray-700/50 hover:border-gray-600'
                  }`}
                  onClick={() => {
                    setSelectedModule(module.id);
                    setSelectedLesson(null);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${selectedModule === module.id ? 'bg-white/20' : 'bg-gray-800'}`}>
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{module.title}</h3>
                        <p className="text-sm text-gray-300">{module.estimatedHours}h total</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-gray-300">{module.completedLessons}/{module.totalLessons}</span>
                      </div>
                      <Progress 
                        value={(module.completedLessons / module.totalLessons) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-300">{module.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedLesson ? (
              // Module Overview
              <Card className="glass-card border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedModuleData?.color}`}>
                      {selectedModuleData?.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">{selectedModuleData?.title}</CardTitle>
                      <p className="text-gray-400">{selectedModuleData?.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {selectedModuleData?.lessons.map((lesson, index) => (
                      <Card 
                        key={lesson.id}
                        className={`transition-all duration-300 ${
                          lesson.locked 
                            ? 'glass-card border-gray-700/30 opacity-60' 
                            : 'glass-card border-gray-700/50 hover:border-purple-500/50 cursor-pointer'
                        }`}
                        onClick={() => !lesson.locked && setSelectedLesson(lesson.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  lesson.completed 
                                    ? 'bg-green-500 text-white' 
                                    : lesson.locked 
                                      ? 'bg-gray-600 text-gray-400'
                                      : 'bg-purple-500 text-white'
                                }`}>
                                  {lesson.completed ? <CheckCircle className="w-4 h-4" /> : 
                                   lesson.locked ? <Lock className="w-4 h-4" /> : index + 1}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white">{lesson.title}</h3>
                                  <p className="text-sm text-gray-400">{lesson.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 mt-3">
                                <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {lesson.duration}
                                </Badge>
                                <Badge variant="outline" className={`${
                                  lesson.difficulty === 'Beginner' ? 'border-green-500/30 text-green-300' :
                                  lesson.difficulty === 'Intermediate' ? 'border-yellow-500/30 text-yellow-300' :
                                  'border-red-500/30 text-red-300'
                                }`}>
                                  {lesson.difficulty}
                                </Badge>
                                {lesson.completed && (
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                    <Award className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {!lesson.locked && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                              >
                                {lesson.completed ? 'Review' : 'Start'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Lesson Content
              <Card className="glass-card border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">{selectedLessonData?.title}</CardTitle>
                      <p className="text-gray-400">{selectedLessonData?.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedLesson(null)}
                      className="border-gray-600 text-gray-300"
                    >
                      Back to Module
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-100 leading-relaxed">
                      {selectedLessonData?.content}
                    </div>
                    
                    {selectedLessonData?.keyPoints && (
                      <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <h4 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                          <Star className="w-5 h-5" />
                          Key Takeaways
                        </h4>
                        <ul className="space-y-2">
                          {selectedLessonData.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedLessonData?.practiceExercises && (
                      <div className="mt-6 p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <h4 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Practice Exercises
                        </h4>
                        <ul className="space-y-2">
                          {selectedLessonData.practiceExercises.map((exercise, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-300">
                              <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              {exercise}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-8 flex gap-4">
                      {!selectedLessonData?.completed && (
                        <Button 
                          onClick={() => selectedLessonData && completeLesson(selectedLessonData.id)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Complete Lesson
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Ask AI Mentor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveLearningPath;
