import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare, GraduationCap, BookOpen, Brain } from 'lucide-react';
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
}

const learningPath: { [month: string]: Lesson[] } = {
  "Month 1: Foundations of Trading": [
    {
      title: "Introduction to Financial Markets",
      content: `Welcome to the world of trading! In this lesson, we'll cover:
      - What are financial markets and their importance.
      - Key players: brokers, traders, and institutions.
      - Basic terminology: assets, securities, and derivatives.
      - Understanding market hours and trading sessions.`,
      keyPoints: ["Financial markets facilitate buying and selling of assets.", "Brokers connect buyers and sellers.", "Assets include stocks, bonds, and commodities."],
      learningObjectives: ["Define financial markets and their role.", "Identify key market participants.", "Understand basic trading terminology."]
    },
    {
      title: "Understanding Charts and Timeframes",
      content: `Charts are essential tools for traders. This lesson includes:
      - Types of charts: line, bar, and candlestick.
      - Reading candlestick patterns.
      - Importance of different timeframes (daily, hourly, etc.).
      - How to select the right timeframe for your trading style.`,
      keyPoints: ["Candlestick charts show open, close, high, and low prices.", "Timeframes affect the level of detail in your analysis.", "Choose timeframes that match your trading strategy."],
      learningObjectives: ["Interpret different types of charts.", "Recognize common candlestick patterns.", "Select appropriate timeframes for analysis."]
    },
    {
      title: "Basic Technical Analysis",
      content: `Technical analysis involves studying historical price and volume data to identify patterns and trends. We'll cover:
      - Support and resistance levels.
      - Trendlines and channels.
      - Basic chart patterns: head and shoulders, double tops/bottoms.
      - Using volume to confirm price movements.`,
      keyPoints: ["Support and resistance levels indicate potential price reversals.", "Trendlines help identify the direction of price movement.", "Chart patterns provide clues about future price action."],
      learningObjectives: ["Identify support and resistance levels.", "Draw and interpret trendlines.", "Recognize basic chart patterns."]
    }
  ],
  "Month 2: Advanced Trading Strategies": [
    {
      title: "Advanced Technical Indicators",
      content: `Building on basic technical analysis, this lesson covers:
      - Moving averages: simple and exponential.
      - RSI (Relative Strength Index) and its applications.
      - MACD (Moving Average Convergence Divergence).
      - Fibonacci retracements and extensions.`,
      keyPoints: ["Moving averages smooth out price data.", "RSI measures the speed and change of price movements.", "MACD identifies changes in the strength, direction, momentum, and duration of a trend."],
      learningObjectives: ["Apply moving averages to identify trends.", "Use RSI to identify overbought and oversold conditions.", "Interpret MACD signals."]
    },
    {
      title: "Risk Management Techniques",
      content: `Protecting your capital is crucial. This lesson includes:
      - Setting stop-loss orders.
      - Calculating position size.
      - Understanding risk-reward ratios.
      - Managing emotions and avoiding common mistakes.`,
      keyPoints: ["Stop-loss orders limit potential losses.", "Position size should be based on your risk tolerance.", "Risk-reward ratio helps evaluate potential trades."],
      learningObjectives: ["Set effective stop-loss orders.", "Calculate appropriate position sizes.", "Apply risk-reward ratios to trading decisions."]
    },
    {
      title: "Trading Psychology",
      content: `The mental side of trading is often overlooked. This lesson covers:
      - Overcoming fear and greed.
      - Developing discipline and patience.
      - Maintaining a trading journal.
      - Staying focused and avoiding distractions.`,
      keyPoints: ["Emotions can lead to poor trading decisions.", "Discipline and patience are essential for success.", "A trading journal helps track and analyze your trades."],
      learningObjectives: ["Recognize and manage emotional biases.", "Develop a disciplined trading approach.", "Use a trading journal to improve performance."]
    }
  ],
  "Month 3: Mastering Market Dynamics": [
    {
      title: "Understanding Market Sentiment",
      content: `Market sentiment reflects the overall attitude of investors. This lesson includes:
      - Identifying bullish and bearish sentiment.
      - Using sentiment indicators.
      - Analyzing news and economic events.
      - Understanding the impact of social media.`,
      keyPoints: ["Market sentiment can drive price movements.", "News and economic events influence sentiment.", "Social media can amplify sentiment."],
      learningObjectives: ["Identify bullish and bearish sentiment.", "Use sentiment indicators to gauge market mood.", "Analyze the impact of news and social media on trading."]
    },
    {
      title: "Economic Indicators and News Events",
      content: `Economic data releases can significantly impact markets. This lesson covers:
      - Key economic indicators: GDP, inflation, unemployment.
      - Understanding central bank policies.
      - Trading around news events.
      - Using an economic calendar.`,
      keyPoints: ["Economic indicators provide insights into the health of the economy.", "Central bank policies affect interest rates and money supply.", "News events can create volatility."],
      learningObjectives: ["Interpret key economic indicators.", "Understand the impact of central bank policies.", "Develop strategies for trading around news events."]
    },
    {
      title: "Developing a Trading Plan",
      content: `A well-defined trading plan is essential for consistent results. This lesson includes:
      - Setting clear goals and objectives.
      - Defining your trading style and strategy.
      - Establishing risk management rules.
      - Regularly reviewing and adjusting your plan.`,
      keyPoints: ["A trading plan provides structure and direction.", "Your plan should align with your goals and risk tolerance.", "Regular review helps adapt to changing market conditions."],
      learningObjectives: ["Set clear trading goals.", "Define your trading style and strategy.", "Create a comprehensive trading plan."]
    }
  ]
};

const ComprehensiveLearningPath = () => {
  const [currentMonth, setCurrentMonth] = useState<string>("Month 1: Foundations of Trading");
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<{[month: string]: boolean[][]}>({
    "Month 1: Foundations of Trading": [[false, false, false]],
    "Month 2: Advanced Trading Strategies": [[false, false, false]],
    "Month 3: Mastering Market Dynamics": [[false, false, false]],
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
      [month]: completedLessons[month].map((lessons, index) => {
        if (index === 0) {
          return lessons.map((lesson, idx) => idx === lessonIndex ? true : lesson);
        }
        return lessons;
      })
    };
    setCompletedLessons(updatedCompletedLessons);
    toast({
      title: "Lesson Completed",
      description: "You've successfully completed this lesson!",
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
        alert("Congratulations! You've completed all lessons.");
      }
    }
  };

  const renderLessonContent = (lesson: any) => {
    return (
      <LessonContent
        lesson={lesson}
        onComplete={() => completeLesson(currentMonth, currentLessonIndex)}
        onAskMentor={() => setShowMentor(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">Comprehensive Trading Education</h1>
          <p className="text-gray-400">Unlock your trading potential with our structured learning path.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
              <CardContent className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Modules</h2>
                {months.map((month, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-lg mb-1">{month}</h3>
                    <ul className="space-y-2">
                      {learningPath[month].map((lesson, lessonIndex) => (
                        <li key={lessonIndex} className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            className={`w-full justify-start ${currentMonth === month && currentLessonIndex === lessonIndex ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                            onClick={() => {
                              setCurrentMonth(month);
                              setCurrentLessonIndex(lessonIndex);
                            }}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {lesson.title}
                          </Button>
                          {completedLessons[month][0][lessonIndex] && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            {lessons && renderLessonContent(lessons[currentLessonIndex])}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  const currentMonthIndex = months.indexOf(currentMonth);
                  if (currentMonthIndex > 0) {
                    setCurrentMonth(months[currentMonthIndex - 1]);
                    setCurrentLessonIndex(0);
                  }
                }}
                disabled={months.indexOf(currentMonth) === 0}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                Previous Module
              </Button>
              <Button
                onClick={moveToNextLesson}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
              >
                Next Lesson
              </Button>
            </div>
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
              Get personalized guidance and insights from our AI mentor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-300">
              Ask your questions about the lesson or trading in general. Our AI mentor is here to help you understand complex concepts and improve your trading skills.
            </p>
            {/* Add an interactive chat component here */}
          </div>
          <Button onClick={() => setShowMentor(false)} variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
            Close Mentor
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveLearningPath;
