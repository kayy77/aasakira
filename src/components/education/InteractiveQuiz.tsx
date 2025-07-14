
import React, { useState, useEffect } from 'react';
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
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { geminiEducationService } from '@/services/geminiEducationService';
import VisualExplanationCard from './VisualExplanationCard';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  visualPrompt?: string;
}

interface InteractiveQuizProps {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (score: number) => void;
}

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  topic,
  difficulty = 'medium',
  onComplete
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const { toast } = useToast();

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const questionPromises = Array.from({ length: 5 }, () =>
        geminiEducationService.generateQuizQuestion(topic, difficulty)
      );
      
      const generatedQuestions = await Promise.all(questionPromises);
      setQuestions(generatedQuestions);
    } catch (error) {
      toast({
        title: "Quiz Loading Failed",
        description: "Unable to generate quiz questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [topic, difficulty]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newUserAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newUserAnswers);

    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      const finalScore = newUserAnswers.reduce((acc, answer, index) => {
        return acc + (answer === questions[index].correctAnswer ? 1 : 0);
      }, 0);
      onComplete?.(finalScore);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setUserAnswers([]);
    loadQuestions();
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-blue-500/20">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-white mb-2">Generating Smart Quiz...</h3>
          <p className="text-gray-400">Creating questions tailored to your level</p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="glass-card border-red-500/20">
        <CardContent className="p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Quiz Unavailable</h3>
          <p className="text-gray-400 mb-4">Unable to load quiz questions for this topic.</p>
          <Button onClick={loadQuestions} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    
    return (
      <div className="space-y-6">
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(score, questions.length)}`}>
              {score}/{questions.length}
            </div>
            <div className="text-xl text-white">
              {percentage}% Accuracy
            </div>
            <Progress value={percentage} className="w-full" />
            <div className="flex justify-center gap-2">
              <Badge className={`${
                percentage >= 80 ? 'bg-green-500/20 text-green-400' :
                percentage >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {percentage >= 80 ? 'Excellent!' :
                 percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
              </Badge>
            </div>
            <Button 
              onClick={resetQuiz}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Show explanations for all questions */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <VisualExplanationCard
              key={index}
              title={`Question ${index + 1} ${userAnswers[index] === question.correctAnswer ? '✅' : '❌'}`}
              explanation={question.explanation}
              visualPrompt={question.visualPrompt}
              concepts={[topic]}
            />
          ))}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            {topic} Quiz
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
              {difficulty}
            </Badge>
          </div>
          <div className="text-sm text-gray-400">
            {currentQuestion + 1} / {questions.length}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="w-full" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {currentQ.question}
          </h3>
          
          <div className="space-y-2">
            {currentQ.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`w-full text-left justify-start h-auto p-4 ${
                  selectedAnswer === index 
                    ? 'bg-purple-600 hover:bg-purple-700 border-purple-500' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600'
                }`}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Score: {score}/{currentQuestion}
          </div>
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            {currentQuestion + 1 === questions.length ? (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Finish Quiz
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Next Question
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveQuiz;
