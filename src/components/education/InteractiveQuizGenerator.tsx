
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  CheckCircle, 
  X, 
  Brain, 
  Target,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { groqService } from '@/services/groqService';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  visual?: string;
}

interface InteractiveQuizGeneratorProps {
  missionTitle: string;
  keyPoints: string[];
  learningObjectives: string[];
  onComplete: (score: number) => void;
  onAskMentor: () => void;
}

export const InteractiveQuizGenerator: React.FC<InteractiveQuizGeneratorProps> = ({
  missionTitle,
  keyPoints,
  learningObjectives,
  onComplete,
  onAskMentor
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    generateQuiz();
  }, [missionTitle, keyPoints, learningObjectives]);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      
      const prompt = `Generate a 5-question multiple choice quiz for this forex trading lesson:

Mission: ${missionTitle}
Key Learning Points: ${keyPoints.join(', ')}
Learning Objectives: ${learningObjectives.join(', ')}

Create questions that test deep understanding, not just memorization.
Make the questions practical and scenario-based where possible.
Include one tricky question that tests common misconceptions.

For each question:
1. Make it clear and specific
2. Provide 4 realistic options (mix obvious wrong answers with subtle incorrect ones)
3. Include detailed explanations for why the correct answer is right
4. Add a visual element description if applicable (e.g., "Picture a candlestick chart showing...")

Format as JSON:
{
  "questions": [
    {
      "question": "Clear, specific question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct and why others are wrong",
      "visual": "Brief description of a helpful visual element"
    }
  ]
}

Make it engaging and educational!`;

      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 2000
      });

      const quizData = JSON.parse(response);
      const formattedQuestions = quizData.questions.map((q: any, index: number) => ({
        id: `${missionTitle}-q${index + 1}`,
        ...q
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Quiz Generation Failed",
        description: "Couldn't generate quiz questions. Please try again.",
        variant: "destructive"
      });
      
      // Fallback questions
      setQuestions([
        {
          id: 'fallback-1',
          question: `What is the main concept of ${missionTitle}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'This tests your understanding of the core concept.',
          visual: 'Think about the key diagram shown in the lesson'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: answerIndex
    }));
  };

  const showAnswerExplanation = () => {
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setIsComplete(true);
    onComplete(finalScore);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsComplete(false);
    setScore(0);
    generateQuiz(); // Generate new questions
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-white mb-2">Generating Your Quiz</h3>
          <p className="text-gray-400">Creating personalized questions based on what you just learned...</p>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="glass-card border-green-500/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-green-400 mb-4">{score}%</div>
          
          <div className="space-y-3">
            {score >= 80 ? (
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-green-400 mb-2">🎉 Outstanding Mastery!</h3>
                <p className="text-gray-300">You've demonstrated excellent understanding. Ready for the next challenge!</p>
              </div>
            ) : score >= 60 ? (
              <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">👏 Good Progress!</h3>
                <p className="text-gray-300">You understand the basics well. Review any unclear areas before moving on.</p>
              </div>
            ) : (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <h3 className="text-lg font-bold text-red-400 mb-2">💪 Keep Learning!</h3>
                <p className="text-gray-300">This topic needs more review. Every expert started where you are now!</p>
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm italic">
              "You will not get rich quick. But you will get rich if you're obsessed with improving. 
              Every wrong answer is a step closer to mastery."
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={restartQuiz} variant="outline" className="border-purple-500/30">
              <Brain className="w-4 h-4 mr-2" />
              Try New Quiz
            </Button>
            <Button onClick={onAskMentor} className="bg-blue-600 hover:bg-blue-700">
              <Target className="w-4 h-4 mr-2" />
              Ask Mentor
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQ.id];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="glass-card border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Award className="w-6 h-6" />
            Mission Quiz: {missionTitle}
          </CardTitle>
          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
            {currentQuestion + 1} / {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </Progress>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visual Element */}
        {currentQ.visual && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold">Visual Guide</span>
            </div>
            <p className="text-gray-300 text-sm">{currentQ.visual}</p>
          </div>
        )}

        {/* Question */}
        <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h3 className="font-bold text-white mb-4 text-lg">
            {currentQ.question}
          </h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQ.correctAnswer;
              const showResult = showExplanation;
              
              let buttonClass = "w-full p-4 text-left rounded-lg border transition-all duration-200 ";
              
              if (showResult) {
                if (isCorrect) {
                  buttonClass += "bg-green-500/20 border-green-500 text-green-300";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "bg-red-500/20 border-red-500 text-red-300";
                } else {
                  buttonClass += "bg-gray-700/50 border-gray-600 text-gray-400";
                }
              } else if (isSelected) {
                buttonClass += "bg-purple-500/20 border-purple-500 text-purple-300";
              } else {
                buttonClass += "bg-gray-700/30 border-gray-600 hover:bg-gray-600/30 text-gray-300 hover:border-purple-500/50";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option}</span>
                    {showResult && (
                      <div className="ml-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : isSelected ? (
                          <X className="w-5 h-5 text-red-400" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-blue-400">Explanation</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {!showExplanation ? (
            <Button
              onClick={showAnswerExplanation}
              disabled={selectedAnswer === undefined}
              className="bg-yellow-600 hover:bg-yellow-700 px-8 py-3"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Check Answer
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              {currentQuestion < questions.length - 1 ? (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Next Question
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Complete Quiz
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={onAskMentor}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-8 py-3"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Need Help?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveQuizGenerator;
