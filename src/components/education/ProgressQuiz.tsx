
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Target,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface ProgressQuizProps {
  topic: string;
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const ProgressQuiz: React.FC<ProgressQuizProps> = ({
  topic,
  questions,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setUserAnswers([...userAnswers, selectedAnswer]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setShowResult(true);
      const finalScore = Math.round((score / questions.length) * 100);
      onComplete(finalScore);
      
      if (finalScore >= 80) {
        toast({
          title: "🎉 Excellent Work!",
          description: `You scored ${finalScore}% - Ready for the next topic!`,
        });
      } else if (finalScore >= 60) {
        toast({
          title: "👍 Good Job!",
          description: `You scored ${finalScore}% - Consider reviewing before advancing.`,
        });
      } else {
        toast({
          title: "📚 Keep Learning!",
          description: `You scored ${finalScore}% - Review the material and try again.`,
        });
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
    setUserAnswers([]);
    setScore(0);
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <Card className="glass-card border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-green-400">
            {score}/{questions.length}
          </div>
          <div className="text-xl text-white">
            {percentage}% Score
          </div>
          <Progress value={percentage} className="w-full" />
          <div className="flex justify-center">
            <Badge className={`${
              percentage >= 80 ? 'bg-green-500/20 text-green-400' :
              percentage >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {percentage >= 80 ? 'Mastery Achieved!' :
               percentage >= 60 ? 'Good Understanding' : 'Needs Review'}
            </Badge>
          </div>
          <Button 
            onClick={restartQuiz}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Brain className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="glass-card border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-400" />
            {topic} Quiz
          </div>
          <Badge className="bg-blue-500/20 text-blue-400">
            {currentQuestion + 1} / {questions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="w-full" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {currentQ.question}
          </h3>
          
          <div className="space-y-2">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQ.correctAnswer;
              const showColors = showExplanation;
              
              let buttonClass = `w-full text-left justify-start h-auto p-4 transition-all ${
                showColors
                  ? isCorrect
                    ? 'bg-green-600/20 border-green-500 hover:bg-green-600/30'
                    : isSelected
                    ? 'bg-red-600/20 border-red-500 hover:bg-red-600/30'
                    : 'bg-gray-800/50 border-gray-600'
                  : isSelected
                  ? 'bg-blue-600 hover:bg-blue-700 border-blue-500'
                  : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600'
              }`;

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  variant="outline"
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-3">
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </span>
                    {showColors && (
                      <div>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {showExplanation && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-blue-400">Explanation</span>
            </div>
            <p className="text-gray-300">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex justify-center">
          {!showExplanation ? (
            <Button
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {currentQuestion + 1 === questions.length ? (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  View Results
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Next Question
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressQuiz;
