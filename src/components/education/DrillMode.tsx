import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Target, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  Brain,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

interface DrillModeProps {
  onFeatureUse?: () => void;
}

interface DrillQuestion {
  id: string;
  chartPattern: ChartPattern;
  question: string;
  options: string[];
  correct: number;
  concept: string;
  explanation: string;
}

interface ChartPattern {
  type: 'break_of_structure' | 'liquidity_sweep' | 'order_block' | 'fair_value_gap' | 'change_of_character';
  direction: 'bullish' | 'bearish';
  strength: 'weak' | 'medium' | 'strong';
  timeframe: '1m' | '5m' | '15m' | '1h';
}

interface DrillStats {
  totalAnswered: number;
  correct: number;
  streak: number;
  bestStreak: number;
  accuracy: number;
  weakConcepts: string[];
  avgResponseTime: number;
}

const DrillMode = ({ onFeatureUse }: DrillModeProps) => {
  const [currentDrill, setCurrentDrill] = useState<DrillQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  const [stats, setStats] = useState<DrillStats>({
    totalAnswered: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    accuracy: 0,
    weakConcepts: [],
    avgResponseTime: 0
  });

  const drillQuestions: DrillQuestion[] = [
    {
      id: '1',
      chartPattern: {
        type: 'break_of_structure',
        direction: 'bullish',
        strength: 'strong',
        timeframe: '15m'
      },
      question: "What is happening in this market structure?",
      options: [
        "Liquidity sweep with reversal",
        "Break of Structure (BOS) - Bullish",
        "Fair Value Gap formation",
        "Order Block mitigation"
      ],
      correct: 1,
      concept: "Break of Structure",
      explanation: "Clear break above previous high with strong momentum - indicating bullish BOS and potential continuation."
    },
    {
      id: '2',
      chartPattern: {
        type: 'liquidity_sweep',
        direction: 'bearish',
        strength: 'medium',
        timeframe: '5m'
      },
      question: "Identify the smart money concept at play:",
      options: [
        "Bullish order block",
        "Liquidity sweep below lows",
        "Change of Character (CHoCH)",
        "Imbalance fill"
      ],
      correct: 1,
      concept: "Liquidity Hunt",
      explanation: "Price swept below equal lows to grab liquidity, creating a potential reversal setup."
    },
    {
      id: '3',
      chartPattern: {
        type: 'order_block',
        direction: 'bullish',
        strength: 'strong',
        timeframe: '1h'
      },
      question: "What type of institutional footprint is this?",
      options: [
        "Demand zone (Order Block)",
        "Supply zone formation",
        "Breaker block pattern",
        "Mitigation block"
      ],
      correct: 0,
      concept: "Order Blocks",
      explanation: "Strong bullish candle followed by consolidation - classic demand order block where institutions accumulated."
    },
    {
      id: '4',
      chartPattern: {
        type: 'fair_value_gap',
        direction: 'bearish',
        strength: 'medium',
        timeframe: '15m'
      },
      question: "What inefficiency needs to be addressed?",
      options: [
        "Volume imbalance",
        "Fair Value Gap (FVG)",
        "Displacement void",
        "Momentum gap"
      ],
      correct: 1,
      concept: "Imbalances",
      explanation: "Gap in price with no trading activity - market will likely return to fill this inefficiency."
    },
    {
      id: '5',
      chartPattern: {
        type: 'change_of_character',
        direction: 'bearish',
        strength: 'strong',
        timeframe: '1h'
      },
      question: "What shift in market behavior is shown?",
      options: [
        "Trend continuation",
        "Change of Character (CHoCH)",
        "Range formation",
        "Consolidation pattern"
      ],
      correct: 1,
      concept: "Market Structure",
      explanation: "Clear shift from bullish to bearish structure - internal structure broke, indicating change of character."
    }
  ];

  const generateRandomDrill = (): DrillQuestion => {
    return drillQuestions[Math.floor(Math.random() * drillQuestions.length)];
  };

  const startDrill = () => {
    const newDrill = generateRandomDrill();
    setCurrentDrill(newDrill);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(5);
    setIsActive(true);
    setStartTime(Date.now());
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !isActive) return;
    
    setSelectedAnswer(answerIndex);
    setIsActive(false);
    
    const responseTime = Date.now() - startTime;
    const isCorrect = answerIndex === currentDrill!.correct;
    
    // Update stats
    setStats(prev => {
      const newTotal = prev.totalAnswered + 1;
      const newCorrect = prev.correct + (isCorrect ? 1 : 0);
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newAccuracy = Math.round((newCorrect / newTotal) * 100);
      
      // Track weak concepts
      const weakConcepts = [...prev.weakConcepts];
      if (!isCorrect && !weakConcepts.includes(currentDrill!.concept)) {
        weakConcepts.push(currentDrill!.concept);
      }
      
      return {
        totalAnswered: newTotal,
        correct: newCorrect,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        accuracy: newAccuracy,
        weakConcepts,
        avgResponseTime: Math.round((prev.avgResponseTime * prev.totalAnswered + responseTime) / newTotal)
      };
    });
    
    setShowResult(true);
    onFeatureUse?.();
  };

  // Timer countdown
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isActive) {
      // Time's up - mark as incorrect
      handleAnswer(-1);
    }
  }, [timeLeft, isActive]);

  const ChartVisualization = ({ pattern }: { pattern: ChartPattern }) => {
    const getPatternVisual = () => {
      switch (pattern.type) {
        case 'break_of_structure':
          return (
            <div className="relative">
              {/* Simplified chart representation */}
              <div className="w-full h-32 bg-gray-900 rounded-lg p-4 flex items-end justify-between">
                <div className="w-8 h-16 bg-red-500 rounded-sm"></div>
                <div className="w-8 h-20 bg-red-500 rounded-sm"></div>
                <div className="w-8 h-12 bg-green-500 rounded-sm"></div>
                <div className="w-8 h-24 bg-green-500 rounded-sm"></div>
                <div className="w-8 h-28 bg-green-500 rounded-sm animate-pulse"></div>
              </div>
              <div className="absolute top-2 right-2 text-green-400 text-xs font-bold">
                BOS ↗️
              </div>
            </div>
          );
        
        case 'liquidity_sweep':
          return (
            <div className="relative">
              <div className="w-full h-32 bg-gray-900 rounded-lg p-4 flex items-end justify-between">
                <div className="w-8 h-20 bg-green-500 rounded-sm"></div>
                <div className="w-8 h-16 bg-green-500 rounded-sm"></div>
                <div className="w-8 h-8 bg-red-500 rounded-sm animate-pulse"></div>
                <div className="w-8 h-24 bg-green-500 rounded-sm"></div>
                <div className="w-8 h-28 bg-green-500 rounded-sm"></div>
              </div>
              <div className="absolute bottom-2 left-2 text-red-400 text-xs font-bold">
                💧 Sweep
              </div>
            </div>
          );
        
        default:
          return (
            <div className="w-full h-32 bg-gray-900 rounded-lg p-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          );
      }
    };

    return getPatternVisual();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Stats */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-400" />
              SMC Drill Mode
              <Zap className="w-6 h-6 ml-2 text-yellow-400" />
            </h2>
            <p className="text-gray-300">Fast pattern recognition training - 5 seconds per question!</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.accuracy}%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.streak}</div>
              <div className="text-sm text-gray-400">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.bestStreak}</div>
              <div className="text-sm text-gray-400">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.totalAnswered}</div>
              <div className="text-sm text-gray-400">Total Drills</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drill Interface */}
      {currentDrill ? (
        <Card className="glass-card">
          <CardContent className="p-6">
            {/* Timer & Progress */}
            <div className="flex items-center justify-between mb-6">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {currentDrill.concept}
              </Badge>
              
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                timeLeft <= 2 ? 'bg-red-900/40 border border-red-500' : 
                timeLeft <= 3 ? 'bg-yellow-900/40 border border-yellow-500' :
                'bg-green-900/40 border border-green-500'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">{timeLeft}s</span>
              </div>
            </div>

            {/* Chart Pattern */}
            <div className="mb-6">
              <ChartVisualization pattern={currentDrill.chartPattern} />
            </div>

            {/* Question */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">{currentDrill.question}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentDrill.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null || !isActive}
                    variant="outline"
                    className={`p-4 h-auto text-left justify-start ${
                      showResult && index === currentDrill.correct
                        ? 'bg-green-600 border-green-500 text-white'
                        : showResult && index === selectedAnswer && index !== currentDrill.correct
                        ? 'bg-red-600 border-red-500 text-white'
                        : selectedAnswer === index
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {showResult && index === currentDrill.correct && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {showResult && index === selectedAnswer && index !== currentDrill.correct && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Result Explanation */}
            {showResult && (
              <div className={`p-4 rounded-xl mb-6 ${
                selectedAnswer === currentDrill.correct
                  ? 'bg-green-900/40 border border-green-500'
                  : 'bg-red-900/40 border border-red-500'
              }`}>
                <div className="flex items-start space-x-3">
                  <Brain className="w-6 h-6 text-blue-400 mt-1" />
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-1">
                      {selectedAnswer === currentDrill.correct ? '🎯 Correct!' : '📚 Learn from this:'}
                    </h4>
                    <p className="text-white">{currentDrill.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center">
              {showResult ? (
                <Button onClick={startDrill} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Next Drill
                </Button>
              ) : !isActive && !currentDrill ? (
                <Button onClick={startDrill} className="bg-green-600 hover:bg-green-700 rounded-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Drill
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Start Screen */
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Eye className="w-16 h-16 mx-auto mb-6 text-blue-400" />
            <h3 className="text-2xl font-bold text-white mb-4">SMC Pattern Recognition Drills</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Build lightning-fast pattern recognition skills. You'll have 5 seconds to identify key SMC concepts
              like Order Blocks, Liquidity Sweeps, Fair Value Gaps, and Market Structure breaks.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <h4 className="font-semibold text-white mb-1">Precision Training</h4>
                <p className="text-xs text-gray-400">Rapid-fire questions build muscle memory</p>
              </div>
              
              <div className="p-4 bg-green-900/20 rounded-xl border border-green-500/20">
                <Brain className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h4 className="font-semibold text-white mb-1">Instant Feedback</h4>
                <p className="text-xs text-gray-400">Learn the 'why' behind each pattern</p>
              </div>
              
              <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <h4 className="font-semibold text-white mb-1">Track Progress</h4>
                <p className="text-xs text-gray-400">Monitor accuracy and weak concepts</p>
              </div>
            </div>
            
            <Button onClick={startDrill} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl">
              <Zap className="w-5 h-5 mr-2" />
              Start SMC Drills
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weak Concepts Alert */}
      {stats.weakConcepts.length > 0 && (
        <Card className="glass-card border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-orange-400" />
              <div>
                <h4 className="font-semibold text-orange-400">Focus Areas</h4>
                <p className="text-sm text-gray-300">
                  Review these concepts: {stats.weakConcepts.join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DrillMode;