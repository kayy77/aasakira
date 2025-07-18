
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare, GraduationCap, BookOpen, Brain, Play, Lock, Star } from 'lucide-react';
import LessonContent from './LessonContent';
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Lesson {
  title: string;
  content: string;
  keyPoints: string[];
  learningObjectives: string[];
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isCompleted?: boolean;
  isLocked?: boolean;
}

const learningPath: { [month: string]: Lesson[] } = {
  "Month 1: Foundations of Trading": [
    {
      title: "Introduction to Financial Markets",
      duration: "45 min",
      difficulty: "Beginner",
      content: `Welcome to the world of trading! In this comprehensive lesson, we'll explore:

**What are Financial Markets?**
Financial markets are platforms where buyers and sellers trade financial instruments like stocks, bonds, currencies, and commodities. These markets facilitate price discovery and provide liquidity to the global economy.

**Key Market Participants:**
- Retail Traders: Individual investors trading for personal accounts
- Institutional Investors: Banks, hedge funds, pension funds
- Market Makers: Provide liquidity by continuously buying and selling
- Brokers: Connect buyers and sellers, execute trades

**Types of Financial Instruments:**
- Stocks (Equities): Ownership shares in companies
- Bonds: Debt instruments issued by governments and corporations
- Forex: Currency pairs traded in the foreign exchange market
- Commodities: Physical goods like gold, oil, wheat
- Derivatives: Options, futures, and other complex instruments

**Market Structure:**
Understanding how markets operate, including order books, bid-ask spreads, and market hours is crucial for successful trading.`,
      keyPoints: [
        "Financial markets facilitate buying and selling of assets globally",
        "Multiple participants create market dynamics and liquidity",
        "Different asset classes offer various risk-reward profiles",
        "Market structure affects how trades are executed and priced"
      ],
      learningObjectives: [
        "Define financial markets and explain their economic importance",
        "Identify and describe key market participants and their roles",
        "Understand basic trading terminology and market mechanics",
        "Recognize different types of financial instruments and their characteristics"
      ]
    },
    {
      title: "Understanding Charts and Price Action",
      duration: "60 min",
      difficulty: "Beginner",
      content: `Charts are the trader's primary tool for market analysis. This lesson covers:

**Types of Charts:**
- Line Charts: Simple representation showing closing prices over time
- Bar Charts: Display open, high, low, and close (OHLC) for each period
- Candlestick Charts: Visual representation of price action with body and wicks

**Reading Candlestick Patterns:**
- Bullish Candles: Close higher than open (typically green/white)
- Bearish Candles: Close lower than open (typically red/black)
- Doji: Open and close are nearly equal, indicating indecision
- Hammer/Shooting Star: Reversal patterns with long wicks

**Timeframes and Their Significance:**
- Short-term: 1m, 5m, 15m for scalping and intraday trading
- Medium-term: 1H, 4H for swing trading
- Long-term: Daily, Weekly for position trading

**Price Action Basics:**
Understanding how price moves, support and resistance levels, and trend identification forms the foundation of technical analysis.`,
      keyPoints: [
        "Candlestick charts provide the most information about price action",
        "Different timeframes serve different trading strategies",
        "Price patterns repeat due to human psychology and market behavior",
        "Understanding price action is fundamental to all trading strategies"
      ],
      learningObjectives: [
        "Interpret different types of charts and their components",
        "Recognize common candlestick patterns and their meanings",
        "Select appropriate timeframes for different trading styles",
        "Identify basic support and resistance levels on charts"
      ]
    },
    {
      title: "Technical Analysis Fundamentals",
      duration: "75 min",
      difficulty: "Beginner",
      content: `Technical analysis is the study of price movements to predict future market direction:

**Core Principles:**
1. Price action discounts everything
2. Prices move in trends
3. History repeats itself due to market psychology

**Support and Resistance:**
- Support: Price level where buying interest emerges
- Resistance: Price level where selling pressure increases
- Role reversal: Support becomes resistance and vice versa

**Trend Analysis:**
- Uptrend: Series of higher highs and higher lows
- Downtrend: Series of lower highs and lower lows
- Sideways: Price moves within a range

**Basic Chart Patterns:**
- Head and Shoulders: Reversal pattern indicating trend change
- Double Top/Bottom: Reversal patterns at market extremes
- Triangles: Continuation patterns showing consolidation
- Flags and Pennants: Brief consolidation in trending markets

**Volume Analysis:**
Volume confirms price movements. High volume on breakouts suggests strong moves, while low volume may indicate weak or false signals.`,
      keyPoints: [
        "Technical analysis assumes all information is reflected in price",
        "Support and resistance levels are key decision points for traders",
        "Trend identification is crucial for directional bias",
        "Volume confirms the strength of price movements"
      ],
      learningObjectives: [
        "Apply the three core principles of technical analysis",
        "Identify and draw support and resistance levels accurately",
        "Recognize and classify different types of market trends",
        "Spot basic chart patterns and understand their implications"
      ]
    }
  ],
  "Month 2: Advanced Trading Strategies": [
    {
      title: "Technical Indicators and Oscillators",
      duration: "90 min",
      difficulty: "Intermediate",
      content: `Technical indicators help traders identify trends, momentum, and potential reversal points:

**Moving Averages:**
- Simple Moving Average (SMA): Equal weight to all periods
- Exponential Moving Average (EMA): More weight to recent prices
- Moving Average Crossovers: Signal trend changes
- Dynamic Support/Resistance: MAs act as key levels

**Momentum Oscillators:**
- RSI (Relative Strength Index): Measures overbought/oversold conditions (0-100)
- Stochastic: Compares closing price to price range over period
- MACD: Shows relationship between two moving averages

**Trend Following Indicators:**
- Bollinger Bands: Price channels based on standard deviation
- Average Directional Index (ADX): Measures trend strength
- Parabolic SAR: Provides stop-loss levels in trending markets

**Volume Indicators:**
- On-Balance Volume (OBV): Relates volume to price changes
- Volume Weighted Average Price (VWAP): Institution trading benchmark

**Fibonacci Tools:**
- Retracements: Identify potential support/resistance levels
- Extensions: Project price targets
- Key levels: 23.6%, 38.2%, 50%, 61.8%, 78.6%`,
      keyPoints: [
        "Indicators should confirm price action, not replace it",
        "Different indicators work better in trending vs. ranging markets",
        "Overbought/oversold conditions don't always mean immediate reversals",
        "Multiple timeframe analysis improves indicator reliability"
      ],
      learningObjectives: [
        "Apply moving averages to identify trends and dynamic levels",
        "Use RSI and Stochastic to identify momentum extremes",
        "Interpret MACD signals for trend and momentum analysis",
        "Apply Fibonacci retracements to identify potential reversal zones"
      ]
    },
    {
      title: "Risk Management and Position Sizing",
      duration: "60 min",
      difficulty: "Intermediate",
      content: `Risk management is the most critical aspect of successful trading:

**Position Sizing Fundamentals:**
- Never risk more than 1-2% of capital per trade
- Position size = (Account Risk) / (Trade Risk)
- Trade Risk = Entry Price - Stop Loss Price

**Stop Loss Strategies:**
- Technical Stops: Based on support/resistance levels
- Percentage Stops: Fixed percentage from entry
- Volatility Stops: Based on Average True Range (ATR)
- Time Stops: Exit after predetermined time period

**Take Profit Methods:**
- Fixed Risk-Reward Ratios: 1:1, 1:2, 1:3
- Technical Targets: Resistance levels, pattern projections
- Trailing Stops: Lock in profits while allowing for continuation
- Partial Profit Taking: Reduce position size at key levels

**Portfolio Risk Management:**
- Correlation Risk: Avoid too many similar trades
- Sector/Currency Exposure: Diversify across different markets
- Maximum Drawdown Limits: Stop trading after significant losses
- Risk-Adjusted Returns: Focus on Sharpe ratio, not just profits

**Psychology of Risk:**
- Loss Aversion: Natural tendency to avoid losses
- Revenge Trading: Attempting to quickly recover losses
- Position Size Comfort: Trade size that allows clear thinking`,
      keyPoints: [
        "Position sizing determines long-term success more than entry/exit timing",
        "Stop losses should be placed at logical technical levels",
        "Risk-reward ratios must favor the trader over many trades",
        "Emotional control is easier with proper risk management"
      ],
      learningObjectives: [
        "Calculate appropriate position sizes based on account risk",
        "Set stop losses using multiple methodologies",
        "Develop take profit strategies aligned with market structure",
        "Implement portfolio-level risk management rules"
      ]
    },
    {
      title: "Trading Psychology and Emotional Control",
      duration: "75 min",
      difficulty: "Intermediate",
      content: `Trading psychology often determines success more than technical knowledge:

**Common Psychological Biases:**
- Confirmation Bias: Seeking information that confirms existing beliefs
- Anchoring: Over-relying on first piece of information
- Overconfidence: Excessive confidence in trading abilities
- Loss Aversion: Fear of losses outweighs potential gains

**Emotional Cycles in Trading:**
- Hope: Holding losing trades too long
- Fear: Missing good opportunities or early exits
- Greed: Increasing position sizes after wins
- Regret: Dwelling on missed opportunities

**Developing Mental Discipline:**
- Trading Plan: Detailed rules for entries, exits, and risk management
- Trading Journal: Record trades and emotional states
- Meditation/Mindfulness: Improve emotional awareness
- Regular Breaks: Prevent decision fatigue

**Performance Evaluation:**
- Focus on Process: Judge trades by decision quality, not outcomes
- Statistical Thinking: Understand that losses are part of the game
- Continuous Learning: Adapt and improve based on results
- Realistic Expectations: Understand that consistent profits take time

**Building Confidence:**
- Start Small: Build confidence with smaller position sizes
- Paper Trading: Practice without financial pressure
- Back-testing: Verify strategy effectiveness historically
- Education: Continuous learning improves confidence`,
      keyPoints: [
        "Emotional control is a skill that must be consciously developed",
        "Trading plans help remove emotions from decision-making",
        "Keeping a trading journal improves self-awareness and performance",
        "Small consistent profits are better than large inconsistent gains"
      ],
      learningObjectives: [
        "Identify and overcome common psychological trading biases",
        "Develop emotional awareness and control techniques",
        "Create and follow a comprehensive trading plan",
        "Implement performance tracking and evaluation systems"
      ]
    }
  ],
  "Month 3: Mastering Market Dynamics": [
    {
      title: "Smart Money Concepts (SMC)",
      duration: "120 min",
      difficulty: "Advanced",
      content: `Smart Money Concepts reveal how institutional traders move markets:

**Market Structure:**
- Break of Structure (BOS): Confirms trend continuation
- Change of Character (CHoCH): Indicates potential trend reversal
- Market Structure Shifts: Higher highs/lows in uptrend, lower highs/lows in downtrend

**Order Blocks:**
- Institutional Order Blocks: Areas where smart money placed large orders
- Bullish Order Block: Last down candle before significant move up
- Bearish Order Block: Last up candle before significant move down
- Order Block Validation: Price must return and react to the level

**Fair Value Gaps (FVG):**
- Imbalance in price action shown by gaps between candles
- Inefficiencies that market often returns to fill
- High probability reversal or continuation zones
- Multiple timeframe gap analysis

**Liquidity Concepts:**
- Buy-Side Liquidity: Stop losses above highs (sell stops become market orders)
- Sell-Side Liquidity: Stop losses below lows (buy stops become market orders)
- Liquidity Sweeps: Smart money triggers stops to fill large orders
- Equal Highs/Lows: Areas likely to contain liquidity

**Institutional Trading Model:**
- Accumulation: Smart money builds positions quietly
- Manipulation: Create false moves to trigger retail stops
- Distribution: Execute large orders into retail buying/selling`,
      keyPoints: [
        "Institutional money moves markets, retail money provides liquidity",
        "Market structure changes indicate shifts in institutional sentiment",
        "Order blocks represent areas of institutional interest",
        "Liquidity sweeps are common before major moves"
      ],
      learningObjectives: [
        "Identify market structure and structural changes accurately",
        "Locate and trade from institutional order blocks",
        "Recognize and utilize fair value gaps for entries and targets",
        "Understand liquidity concepts and how institutions manipulate price"
      ]
    },
    {
      title: "Economic Events and Fundamental Analysis",
      duration: "90 min",
      difficulty: "Advanced",
      content: `Understanding fundamental drivers behind price movements:

**Economic Indicators:**
- GDP (Gross Domestic Product): Overall economic health
- Inflation Data (CPI, PPI): Price level changes affect currency value
- Employment Data: Unemployment rate, non-farm payrolls
- Interest Rates: Central bank policy directly affects currency strength

**Central Bank Policy:**
- Monetary Policy: Interest rate decisions and forward guidance
- Quantitative Easing: Money supply expansion affects currency value
- Hawkish vs. Dovish: Central bank stance on inflation and growth
- Policy Divergence: Different central bank policies create trading opportunities

**Economic Calendar Usage:**
- High Impact Events: Major market movers requiring caution
- Medium Impact: May cause volatility in specific currency pairs
- Low Impact: Generally safe to trade through
- Consensus vs. Actual: Surprises cause strongest market reactions

**Fundamental vs. Technical Analysis:**
- Long-term: Fundamentals drive major trends
- Short-term: Technical analysis better for timing entries
- Confluence: Best trades combine both fundamental and technical factors
- News Trading: Specific strategies for trading around events

**Global Market Interconnections:**
- Risk-On/Risk-Off Sentiment: Global appetite for risk affects all markets
- Commodity Currencies: AUD, CAD, NZD affected by commodity prices
- Safe Haven Assets: USD, JPY, CHF, Gold during uncertainty
- Correlation Analysis: Understanding how different markets move together`,
      keyPoints: [
        "Economic data releases can cause significant price volatility",
        "Central bank policy changes have lasting effects on currency trends",
        "Combining fundamental and technical analysis improves trade quality",
        "Global market sentiment affects all asset classes"
      ],
      learningObjectives: [
        "Interpret key economic indicators and their market impact",
        "Understand central bank policy and its effect on currencies",
        "Use economic calendars to plan trading around major events",
        "Analyze global market sentiment and its trading implications"
      ]
    },
    {
      title: "Advanced Trading Strategies and Systems",
      duration: "105 min",
      difficulty: "Advanced",
      content: `Developing systematic approaches to consistent profitability:

**Strategy Development Process:**
- Market Analysis: Identify market conditions where strategy works best
- Entry Rules: Specific criteria that must be met before entering
- Exit Rules: Both profit targets and stop loss criteria
- Risk Management: Position sizing and maximum risk per trade
- Back-testing: Historical validation of strategy performance

**Trend Following Strategies:**
- Moving Average Crossovers: Multiple timeframe confirmation
- Breakout Systems: Trading range breaks with volume confirmation
- Momentum Trading: Following strong moves in trending markets
- Pullback Strategies: Entering trends on temporary corrections

**Mean Reversion Strategies:**
- Overbought/Oversold: Using RSI, Stochastic for entries
- Bollinger Band Bounces: Trading range-bound markets
- Support/Resistance Trading: Buying support, selling resistance
- Gap Trading: Trading gaps that are likely to fill

**Multi-Timeframe Analysis:**
- Top-Down Approach: Start with higher timeframes for bias
- Entry Timeframe: Lower timeframe for precise entries
- Trend Alignment: Ensure all timeframes agree on direction
- Divergence Spotting: Higher timeframe divergences are more reliable

**System Optimization:**
- Parameter Testing: Finding optimal indicator settings
- Walk-Forward Analysis: Testing on out-of-sample data
- Monte Carlo Testing: Understanding worst-case scenarios
- Performance Metrics: Win rate, average win/loss, maximum drawdown

**Portfolio Construction:**
- Strategy Diversification: Multiple uncorrelated strategies
- Asset Diversification: Trading different markets/timeframes
- Risk Budgeting: Allocating risk across different strategies
- Rebalancing: Adjusting allocations based on performance`,
      keyPoints: [
        "Systematic approaches remove emotions from trading decisions",
        "Back-testing is essential but not guarantee of future performance",
        "Diversification across strategies and markets reduces risk",
        "Continuous monitoring and optimization keeps strategies effective"
      ],
      learningObjectives: [
        "Develop and test systematic trading strategies",
        "Implement multi-timeframe analysis for better trade timing",
        "Create portfolio-level strategy diversification",
        "Optimize and maintain trading systems for consistent performance"
      ]
    }
  ]
};

const ComprehensiveLearningPath = () => {
  const [currentMonth, setCurrentMonth] = useState<string>("Month 1: Foundations of Trading");
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<{[month: string]: boolean[]}>({
    "Month 1: Foundations of Trading": [false, false, false],
    "Month 2: Advanced Trading Strategies": [false, false, false],
    "Month 3: Mastering Market Dynamics": [false, false, false],
  });
  const [showMentor, setShowMentor] = useState(false);
  const { toast } = useToast()

  useEffect(() => {
    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem('learningProgress');
    if (savedProgress) {
      setCompletedLessons(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage whenever completedLessons changes
    localStorage.setItem('learningProgress', JSON.stringify(completedLessons));
  }, [completedLessons]);

  const months = Object.keys(learningPath);
  const lessons = learningPath[currentMonth];

  const completeLesson = (month: string, lessonIndex: number) => {
    const updatedCompletedLessons = {
      ...completedLessons,
      [month]: completedLessons[month].map((lesson, idx) => idx === lessonIndex ? true : lesson)
    };
    setCompletedLessons(updatedCompletedLessons);
    toast({
      title: "Lesson Completed! 🎉",
      description: "You've successfully completed this lesson. Keep up the great work!",
    })
  };

  const moveToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      const currentMonthIndex = months.indexOf(currentMonth);
      if (currentMonthIndex < months.length - 1) {
        setCurrentMonth(months[currentMonthIndex + 1]);
        setCurrentLessonIndex(0);
      } else {
        toast({
          title: "Congratulations! 🎓",
          description: "You've completed the entire trading education program!",
        });
      }
    }
  };

  const isLessonLocked = (monthIndex: number, lessonIndex: number) => {
    if (monthIndex === 0 && lessonIndex === 0) return false; // First lesson is always unlocked
    
    if (lessonIndex === 0) {
      // First lesson of a month - check if previous month is completed
      const prevMonthKey = months[monthIndex - 1];
      return !completedLessons[prevMonthKey]?.every(completed => completed);
    } else {
      // Check if previous lesson in same month is completed
      return !completedLessons[currentMonth][lessonIndex - 1];
    }
  };

  const getCompletionPercentage = () => {
    const totalLessons = Object.values(completedLessons).flat().length;
    const completedCount = Object.values(completedLessons).flat().filter(Boolean).length;
    return Math.round((completedCount / totalLessons) * 100);
  };

  const currentLesson = lessons[currentLessonIndex];
  const currentMonthIndex = months.indexOf(currentMonth);
  const isCurrentLessonLocked = isLessonLocked(currentMonthIndex, currentLessonIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header with Progress */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 gradient-text">
            Professional Trading Mastery Program
          </h1>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Overall Progress</span>
              <span className="text-sm text-purple-400 font-semibold">{getCompletionPercentage()}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <Card className="glass-card border-purple-500/30 sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-400">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {months.map((month, monthIndex) => {
                  const monthLessons = learningPath[month];
                  const monthCompleted = completedLessons[month]?.filter(Boolean).length || 0;
                  const monthProgress = Math.round((monthCompleted / monthLessons.length) * 100);
                  
                  return (
                    <div key={monthIndex} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-white">{month.split(':')[0]}</h3>
                        <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                          {monthProgress}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1 mb-3">
                        <div 
                          className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${monthProgress}%` }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        {monthLessons.map((lesson, lessonIndex) => {
                          const isCompleted = completedLessons[month]?.[lessonIndex];
                          const isLocked = isLessonLocked(monthIndex, lessonIndex);
                          const isCurrent = currentMonth === month && currentLessonIndex === lessonIndex;
                          
                          return (
                            <div
                              key={lessonIndex}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                                isCurrent ? 'bg-purple-500/20 border border-purple-500/50' :
                                isCompleted ? 'bg-green-500/10 hover:bg-green-500/20' :
                                isLocked ? 'bg-gray-800/50 opacity-50 cursor-not-allowed' :
                                'hover:bg-gray-700/50'
                              }`}
                              onClick={() => {
                                if (!isLocked) {
                                  setCurrentMonth(month);
                                  setCurrentLessonIndex(lessonIndex);
                                }
                              }}
                            >
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                {isLocked ? (
                                  <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                ) : isCompleted ? (
                                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                ) : isCurrent ? (
                                  <Play className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                ) : (
                                  <BookOpen className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className={`text-xs font-medium truncate ${
                                    isCurrent ? 'text-purple-400' :
                                    isCompleted ? 'text-green-400' :
                                    isLocked ? 'text-gray-500' :
                                    'text-gray-300'
                                  }`}>
                                    {lesson.title}
                                  </div>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <Badge variant="outline" className={`text-xs px-1 py-0 ${
                                      lesson.difficulty === 'Beginner' ? 'border-green-500/30 text-green-400' :
                                      lesson.difficulty === 'Intermediate' ? 'border-yellow-500/30 text-yellow-400' :
                                      'border-red-500/30 text-red-400'
                                    }`}>
                                      {lesson.difficulty}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* Enhanced Main Content */}
          <main className="lg:col-span-3">
            {isCurrentLessonLocked ? (
              <Card className="glass-card border-yellow-500/30">
                <CardContent className="p-8 text-center">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-yellow-400 mb-2">Lesson Locked</h2>
                  <p className="text-gray-400 mb-6">
                    Complete the previous lessons to unlock this content.
                  </p>
                  <Button
                    onClick={() => {
                      // Navigate to the previous incomplete lesson
                      const prevLessonIndex = currentLessonIndex - 1;
                      if (prevLessonIndex >= 0) {
                        setCurrentLessonIndex(prevLessonIndex);
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Go to Previous Lesson
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Lesson Header */}
                <Card className="glass-card border-purple-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${
                        currentLesson.difficulty === 'Beginner' ? 'bg-green-600' :
                        currentLesson.difficulty === 'Intermediate' ? 'bg-yellow-600' :
                        'bg-red-600'
                      } text-white`}>
                        {currentLesson.difficulty}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                        {currentLesson.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      {currentLesson.title}
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Lesson Content */}
                <LessonContent
                  lesson={currentLesson}
                  onComplete={() => completeLesson(currentMonth, currentLessonIndex)}
                  onAskMentor={() => setShowMentor(true)}
                />

                {/* Navigation */}
                <Card className="glass-card border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentLessonIndex > 0) {
                            setCurrentLessonIndex(currentLessonIndex - 1);
                          } else {
                            const currentMonthIndex = months.indexOf(currentMonth);
                            if (currentMonthIndex > 0) {
                              const prevMonth = months[currentMonthIndex - 1];
                              setCurrentMonth(prevMonth);
                              setCurrentLessonIndex(learningPath[prevMonth].length - 1);
                            }
                          }
                        }}
                        disabled={currentMonth === months[0] && currentLessonIndex === 0}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        ← Previous Lesson
                      </Button>

                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Lesson {currentLessonIndex + 1} of {lessons.length}</span>
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>{currentMonth.split(':')[0]}</span>
                      </div>

                      <Button
                        onClick={moveToNextLesson}
                        disabled={!completedLessons[currentMonth]?.[currentLessonIndex]}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next Lesson →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* AI Mentor Dialog */}
      <Dialog open={showMentor} onOpenChange={setShowMentor}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Trading Mentor
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Get personalized guidance and insights about "{currentLesson?.title}" from our AI mentor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
              <h4 className="text-purple-400 font-semibold mb-2">Current Lesson Context</h4>
              <p className="text-gray-300 text-sm">{currentLesson?.title}</p>
              <p className="text-gray-400 text-xs mt-1">
                {currentLesson?.difficulty} • {currentLesson?.duration}
              </p>
            </div>
            <p className="text-gray-300">
              Ask questions about the current lesson, request clarification on concepts, 
              or get additional examples and trading scenarios related to this topic.
            </p>
          </div>
          <div className="flex justify-between">
            <Button 
              onClick={() => setShowMentor(false)} 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowMentor(false);
                // Navigate to mentor tab would go here
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Open AI Mentor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveLearningPath;
