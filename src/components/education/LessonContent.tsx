
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle, 
  PlayCircle,
  Lightbulb,
  TrendingUp,
  Shield,
  Target,
  Eye,
  Brain
} from 'lucide-react';

interface LessonSection {
  id: string;
  title: string;
  content: string;
  examples: string[];
  keyTakeaways: string[];
  completed: boolean;
}

interface LessonContentProps {
  missionId: string;
  missionTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  onLessonComplete: () => void;
  onStartQuiz: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({
  missionId,
  missionTitle,
  difficulty,
  onLessonComplete,
  onStartQuiz
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  // Lesson content based on mission
  const getLessonSections = (missionId: string): LessonSection[] => {
    switch (missionId) {
      case 'mission-1':
        return [
          {
            id: 'basics',
            title: 'What Are Financial Markets?',
            content: 'Financial markets are platforms where people buy and sell financial instruments like currencies, stocks, and commodities. Think of it like a giant marketplace where traders exchange money for different currencies - for example, trading US Dollars for Euros.',
            examples: [
              'EUR/USD: Trading Euros against US Dollars',
              'GBP/JPY: Trading British Pounds against Japanese Yen',
              'When EUR/USD price rises, it means Euro is getting stronger vs Dollar'
            ],
            keyTakeaways: [
              'Markets operate 24/5 for forex trading',
              'Prices move based on supply and demand',
              'Each currency pair shows relative strength'
            ],
            completed: false
          },
          {
            id: 'price-action',
            title: 'Understanding Price Movement',
            content: 'Price action is simply how the price of a currency pair moves up and down over time. Every price movement tells a story about what buyers and sellers are thinking. When more people want to buy than sell, price goes up. When more people want to sell than buy, price goes down.',
            examples: [
              'Strong upward movement = Bulls (buyers) in control',
              'Strong downward movement = Bears (sellers) in control',
              'Sideways movement = Indecision between buyers and sellers'
            ],
            keyTakeaways: [
              'Price reflects market sentiment',
              'Volume confirms price movements',
              'Patterns repeat due to human psychology'
            ],
            completed: false
          },
          {
            id: 'support-resistance',
            title: 'Support and Resistance Levels',
            content: 'Support and resistance are like invisible floors and ceilings for price. Support is a level where price tends to bounce up from (like a floor), while resistance is a level where price tends to bounce down from (like a ceiling). These levels form because many traders remember previous prices and make decisions based on them.',
            examples: [
              'If EUR/USD bounced up from 1.0800 three times, that\'s a strong support',
              'If price keeps getting rejected at 1.0950, that\'s resistance',
              'When resistance breaks, it often becomes new support'
            ],
            keyTakeaways: [
              'Support = price floor where buyers step in',
              'Resistance = price ceiling where sellers step in',
              'Broken levels often flip roles (support becomes resistance)'
            ],
            completed: false
          }
        ];
      
      case 'mission-2':
        return [
          {
            id: 'candlesticks',
            title: 'Reading Candlestick Charts',
            content: 'Candlesticks are like mini-stories of price action. Each candle shows you four crucial pieces of information: where price opened, where it closed, and the highest and lowest points during that time period. Green/white candles mean price closed higher than it opened (bullish), while red/black candles mean price closed lower (bearish).',
            examples: [
              'Long green candle = Strong buying pressure',
              'Long red candle = Strong selling pressure',
              'Small body with long wicks = Indecision and rejection'
            ],
            keyTakeaways: [
              'Body shows open-to-close range',
              'Wicks show high-to-low range',
              'Color indicates bullish or bearish sentiment'
            ],
            completed: false
          },
          {
            id: 'patterns',
            title: 'Common Chart Patterns',
            content: 'Chart patterns are like footprints that repeat because human emotions in trading are predictable. Patterns like triangles, flags, and head & shoulders form when traders react similarly to certain market conditions. Learning to spot these gives you an edge in predicting where price might go next.',
            examples: [
              'Triangle = Consolidation before breakout',
              'Flag = Brief pause in strong trend',
              'Head & Shoulders = Potential trend reversal'
            ],
            keyTakeaways: [
              'Patterns reflect market psychology',
              'Volume confirms pattern validity',
              'Wait for breakout confirmation'
            ],
            completed: false
          }
        ];

      case 'mission-3':
        return [
          {
            id: 'position-sizing',
            title: 'Position Sizing Fundamentals',
            content: 'Position sizing is the most important skill in trading - it determines how much you risk on each trade. The golden rule is to never risk more than 1-2% of your account on a single trade. This ensures that even a series of losses won\'t destroy your account, giving you the staying power to be profitable long-term.',
            examples: [
              '$10,000 account: Risk max $100-200 per trade',
              '$1,000 account: Risk max $10-20 per trade',
              'Calculate: (Account Size × Risk %) ÷ Stop Loss Distance = Position Size'
            ],
            keyTakeaways: [
              'Risk 1-2% max per trade',
              'Position size = Risk amount ÷ Stop distance',
              'Consistent sizing prevents account destruction'
            ],
            completed: false
          },
          {
            id: 'stop-losses',
            title: 'Setting Proper Stop Losses',
            content: 'A stop loss is your safety net - it automatically closes your trade if price moves against you by a certain amount. Good stop losses are placed at logical levels where your trade idea is proven wrong, not just random distances. This could be below support levels for long trades, or above resistance for short trades.',
            examples: [
              'Long trade: Stop below recent swing low',
              'Short trade: Stop above recent swing high',
              'Don\'t use round numbers - use logical price levels'
            ],
            keyTakeaways: [
              'Stop losses limit maximum loss per trade',
              'Place at logical levels, not random distances',
              'Account for spread and slippage'
            ],
            completed: false
          }
        ];

      default:
        return [];
    }
  };

  const sections = getLessonSections(missionId);
  const progress = (completedSections.size / sections.length) * 100;
  const currentSectionData = sections[currentSection];
  const allSectionsCompleted = completedSections.size === sections.length;

  const handleSectionComplete = () => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(currentSection);
    setCompletedSections(newCompleted);

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else if (newCompleted.size === sections.length) {
      onLessonComplete();
    }
  };

  const handleSectionSelect = (index: number) => {
    if (index <= Math.max(...Array.from(completedSections)) + 1) {
      setCurrentSection(index);
    }
  };

  if (!currentSectionData) {
    return <div>Loading lesson content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              Learning: {missionTitle}
            </div>
            <Badge className={`${
              difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
              difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {difficulty}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Lesson Progress</span>
              <span>{completedSections.size} of {sections.length} sections</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lesson Navigation */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Lesson Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => handleSectionSelect(index)}
                disabled={index > Math.max(...Array.from(completedSections)) + 1}
                className={`w-full p-3 text-left rounded-lg border transition-all ${
                  currentSection === index
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : completedSections.has(index)
                    ? 'border-green-500/50 bg-green-500/5 text-green-400'
                    : index <= Math.max(...Array.from(completedSections)) + 1
                    ? 'border-gray-600 hover:border-gray-500 text-white'
                    : 'border-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  {completedSections.has(index) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : currentSection === index ? (
                    <PlayCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-current" />
                  )}
                  <span className="text-sm font-medium">{section.title}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                {currentSectionData.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-gray-300 leading-relaxed">
                {currentSectionData.content}
              </div>

              {/* Examples Section */}
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  Examples
                </h4>
                <div className="space-y-2">
                  {currentSectionData.examples.map((example, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                      <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{example}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Takeaways */}
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Key Takeaways
                </h4>
                <div className="space-y-2">
                  {currentSectionData.keyTakeaways.map((takeaway, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                      <Target className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!completedSections.has(currentSection) && (
                  <Button
                    onClick={handleSectionComplete}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
                
                {allSectionsCompleted && (
                  <Button
                    onClick={onStartQuiz}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonContent;
