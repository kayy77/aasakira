
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, X, Trophy, Brain, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  concept: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const frameworkQuizzes: Quiz[] = [
  {
    id: 'bos-1',
    concept: 'Break of Structure',
    question: 'Which candle represents a valid Break of Structure (BOS) in an uptrend?',
    options: [
      'A candle that closes above the previous high',
      'A candle that wicks above but closes below the previous high',
      'Any candle that touches the previous high',
      'A candle that gaps above the previous high'
    ],
    correctAnswer: 0,
    explanation: 'A valid BOS requires a candle to CLOSE above the previous high, not just wick above it. Institutional traders focus on closes for structure breaks.',
    difficulty: 'beginner'
  },
  {
    id: 'fvg-1',
    concept: 'Fair Value Gap',
    question: 'What creates a Fair Value Gap (FVG)?',
    options: [
      'Three consecutive candles where price gaps without overlap',
      'A single large candle that moves quickly',
      'When price rejects from a key level',
      'Two candles with small bodies'
    ],
    correctAnswer: 0,
    explanation: 'An FVG forms when there are three consecutive candles where the middle candle creates a gap that the first and third candles do not fill.',
    difficulty: 'intermediate'
  },
  {
    id: 'liquidity-1',
    concept: 'Liquidity Sweep',
    question: 'What is the primary purpose of a liquidity sweep?',
    options: [
      'To create new support/resistance levels',
      'To hunt stop losses before reversing direction',
      'To confirm trend continuation',
      'To signal market close'
    ],
    correctAnswer: 1,
    explanation: 'Liquidity sweeps are designed to hunt retail stop losses placed at obvious levels before the market reverses in the opposite direction.',
    difficulty: 'advanced'
  }
];

const FrameworkTraining: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const { toast } = useToast();

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === frameworkQuizzes[currentQuiz].correctAnswer;
    setShowResult(true);

    if (isCorrect) {
      const xpGained = frameworkQuizzes[currentQuiz].difficulty === 'advanced' ? 15 : 
                      frameworkQuizzes[currentQuiz].difficulty === 'intermediate' ? 10 : 5;
      setScore(score + 1);
      setXpEarned(xpEarned + xpGained);
      toast({
        title: "Correct! 🎯",
        description: `+${xpGained} XP earned`,
        variant: "default"
      });
    } else {
      toast({
        title: "Incorrect",
        description: "Study the explanation and try again",
        variant: "destructive"
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuiz < frameworkQuizzes.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      const finalScore = Math.round((score / frameworkQuizzes.length) * 100);
      toast({
        title: "Training Complete! 🏆",
        description: `Final Score: ${finalScore}% | Total XP: ${xpEarned}`,
        variant: "default"
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setXpEarned(0);
  };

  const quiz = frameworkQuizzes[currentQuiz];
  const progress = ((currentQuiz + 1) / frameworkQuizzes.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getAnswerStyle = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index 
        ? 'border-purple-500 bg-purple-500/20' 
        : 'border-gray-600 hover:border-purple-400 bg-gray-800/50';
    }

    if (index === quiz.correctAnswer) {
      return 'border-green-500 bg-green-500/20 text-green-400';
    }

    if (selectedAnswer === index && index !== quiz.correctAnswer) {
      return 'border-red-500 bg-red-500/20 text-red-400';
    }

    return 'border-gray-600 bg-gray-800/30 text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Framework Training
            </h2>
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Trophy className="w-4 h-4 mr-1" />
                {xpEarned} XP
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {score}/{frameworkQuizzes.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Progress</span>
              <span>{currentQuiz + 1} of {frameworkQuizzes.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quiz Card */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              {quiz.concept}
            </CardTitle>
            <Badge className={getDifficultyColor(quiz.difficulty)}>
              {quiz.difficulty.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg text-gray-200 font-medium">
            {quiz.question}
          </div>

          <div className="space-y-3">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${getAnswerStyle(index)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                  {showResult && index === quiz.correctAnswer && (
                    <CheckCircle className="w-5 h-5 ml-auto text-green-400" />
                  )}
                  {showResult && selectedAnswer === index && index !== quiz.correctAnswer && (
                    <X className="w-5 h-5 ml-auto text-red-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">Explanation:</h4>
              <p className="text-gray-300">{quiz.explanation}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!showResult ? (
              <Button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Submit Answer
              </Button>
            ) : (
              <>
                {currentQuiz < frameworkQuizzes.length - 1 ? (
                  <Button
                    onClick={nextQuestion}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    onClick={resetQuiz}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrameworkTraining;
