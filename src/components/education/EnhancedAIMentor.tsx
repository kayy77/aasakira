
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { hybridAIService } from '@/services/hybridAIService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Brain, 
  Zap, 
  BookOpen, 
  Trophy,
  RefreshCw,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  topic: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const EnhancedAIMentor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Hello! I\'m Aasakira, your AI trading mentor and buddy. I\'m here to help you master forex trading with Smart Money Concepts, but I also love chatting about anything - life, hobbies, random thoughts! Ask me anything!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [activeSection, setActiveSection] = useState<'chat' | 'quiz'>('chat');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to hybrid AI service:', currentInput);
      
      const response = await hybridAIService.generateComprehensiveResponse(
        currentInput,
        {
          experience: userLevel,
          tradingStyle: 'Smart Money Concepts',
          riskTolerance: 'Moderate',
          winRate: quizScore.total > 0 ? Math.round((quizScore.correct / quizScore.total) * 100) : 0,
          totalStudyTime: messages.length * 2,
          chartsAnalyzed: quizScore.total,
          currentStreak: quizScore.correct,
          messagesSent: messages.filter(m => m.type === 'user').length
        },
        false
      );
      
      console.log('Received response from hybrid AI service:', response);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "✅ AI Response Generated",
        description: `Powered by ${response.source.toUpperCase()} with ${Math.round(response.confidence * 100)}% confidence`,
      });
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble responding right now. Please try asking your question again. I\'m here to help with trading concepts, life advice, or just casual conversation!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "⚠️ AI Response Failed",
        description: "Please try rephrasing your question or check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const topics = [
        'Order Blocks and Breaker Blocks',
        'Fair Value Gaps and Imbalances', 
        'Liquidity Sweeps and Stop Hunting',
        'Market Structure and Break of Structure',
        'Smart Money Concepts and Institutional Trading',
        'Risk Management and Position Sizing',
        'Support and Resistance in SMC',
        'Entry and Exit Strategies'
      ];
      
      const difficulties: ('easy' | 'medium' | 'hard')[] = 
        userLevel === 'beginner' ? ['easy', 'medium'] :
        userLevel === 'intermediate' ? ['medium', 'hard'] :
        ['medium', 'hard'];
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      console.log(`Generating ${randomDifficulty} quiz on ${randomTopic}`);
      
      // Generate a local quiz question instead of using external API
      const localQuizQuestions = {
        'Order Blocks and Breaker Blocks': {
          easy: {
            question: "What is an Order Block in Smart Money Concepts?",
            options: [
              "A random price area with high volume",
              "The last opposite candle before a strong directional move",
              "Any support or resistance level",
              "A technical indicator signal"
            ],
            correctAnswer: 1,
            explanation: "An Order Block is the last opposite candle before a strong directional move. This represents where institutional traders placed their orders, creating an imbalance that price often returns to fill."
          },
          medium: {
            question: "How do you identify a valid Order Block for trading?",
            options: [
              "Any red candle followed by green candles",
              "The highest volume candle on the chart",
              "Last opposite candle before Break of Structure with volume confirmation",
              "Any candle at support/resistance"
            ],
            correctAnswer: 2,
            explanation: "A valid Order Block is identified as the last opposite candle before a Break of Structure (BOS), ideally with volume confirmation. This shows institutional involvement and increases the probability of price returning to this level."
          }
        },
        'Risk Management and Position Sizing': {
          easy: {
            question: "What is the recommended maximum risk per trade?",
            options: ["5% of account", "10% of account", "2% of account", "1% of account"],
            correctAnswer: 2,
            explanation: "The widely accepted rule is to never risk more than 2% of your trading account on any single trade. This helps preserve capital and allows you to survive losing streaks."
          }
        }
      };

      const topicQuestions = localQuizQuestions[randomTopic as keyof typeof localQuizQuestions];
      const questionData = topicQuestions?.[randomDifficulty as keyof typeof topicQuestions] || localQuizQuestions['Risk Management and Position Sizing'].easy;
      
      const quiz: QuizQuestion = {
        ...questionData,
        difficulty: randomDifficulty,
        topic: randomTopic
      };
      
      setCurrentQuiz(quiz);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setActiveSection('quiz');
      
      toast({
        title: "🎯 New Quiz Generated",
        description: `${randomDifficulty.charAt(0).toUpperCase() + randomDifficulty.slice(1)} level question about ${randomTopic}`,
      });
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast({
        title: "Quiz Generation Failed",
        description: "Unable to generate quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !currentQuiz) return;

    const isCorrect = selectedAnswer === currentQuiz.correctAnswer;
    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    setShowExplanation(true);
    
    // Adjust user level based on performance
    if (quizScore.total >= 5) {
      const accuracy = (quizScore.correct + (isCorrect ? 1 : 0)) / (quizScore.total + 1);
      if (accuracy > 0.8 && userLevel === 'beginner') {
        setUserLevel('intermediate');
      } else if (accuracy > 0.85 && userLevel === 'intermediate') {
        setUserLevel('advanced');
      }
    }
    
    toast({
      title: isCorrect ? "🎉 Correct!" : "❌ Incorrect",
      description: isCorrect ? "+10 XP earned!" : "Keep learning, you're improving!",
      variant: isCorrect ? "default" : "destructive"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Aasakira AI Mentor & Buddy</h2>
                <p className="text-sm text-gray-400">Your personal trading education assistant and friend</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${
                userLevel === 'beginner' ? 'bg-green-500/20 text-green-400' :
                userLevel === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}
              </Badge>
              <Button
                onClick={() => setActiveSection('chat')}
                variant={activeSection === 'chat' ? 'default' : 'outline'}
                size="sm"
                className={activeSection === 'chat' ? 'bg-purple-600' : 'border-gray-600'}
              >
                <Brain className="w-4 h-4 mr-1" />
                AI Chat
              </Button>
              <Button
                onClick={() => setActiveSection('quiz')}
                variant={activeSection === 'quiz' ? 'default' : 'outline'}
                size="sm"
                className={activeSection === 'quiz' ? 'bg-purple-600' : 'border-gray-600'}
              >
                <Target className="w-4 h-4 mr-1" />
                Smart Quiz
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {/* Progress Stats */}
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">{messages.length - 1}</div>
              <div className="text-xs text-gray-400">Messages Sent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{quizScore.correct}</div>
              <div className="text-xs text-gray-400">Quiz Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {quizScore.total > 0 ? Math.round((quizScore.correct / quizScore.total) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Section */}
      {activeSection === 'chat' && (
        <Card className="glass-card border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              AI Chat Assistant & Buddy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-3 bg-gray-900/30 rounded-lg p-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-100 p-3 rounded-lg flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Aasakira is thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about trading, life, hobbies, random thoughts - anything!"
                className="flex-1 bg-gray-800 border-gray-600 resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Section */}
      {activeSection === 'quiz' && (
        <Card className="glass-card border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Smart Trading Quiz
              </div>
              <Button
                onClick={generateQuiz}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-blue-600"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    New Question
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuiz ? (
              <div className="space-y-4">
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {currentQuiz.topic}
                    </Badge>
                    <Badge className={`${
                      currentQuiz.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      currentQuiz.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {currentQuiz.difficulty}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {currentQuiz.question}
                  </h3>
                  
                  <div className="space-y-2">
                    {currentQuiz.options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        variant={selectedAnswer === index ? 'default' : 'outline'}
                        className={`w-full text-left justify-start p-3 h-auto ${
                          selectedAnswer === index ? 'bg-purple-600' : 'border-gray-600'
                        } ${
                          showExplanation
                            ? index === currentQuiz.correctAnswer
                              ? 'border-green-500 bg-green-500/20'
                              : selectedAnswer === index && index !== currentQuiz.correctAnswer
                              ? 'border-red-500 bg-red-500/20'
                              : ''
                            : ''
                        }`}
                        disabled={showExplanation}
                      >
                        <div className="flex items-center gap-2">
                          {showExplanation && index === currentQuiz.correctAnswer && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          {showExplanation && selectedAnswer === index && index !== currentQuiz.correctAnswer && (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span>{String.fromCharCode(65 + index)}) {option}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {!showExplanation && (
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={selectedAnswer === null}
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Submit Answer
                    </Button>
                  )}
                  
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                    >
                      <h4 className="font-semibold text-blue-300 mb-2">Explanation:</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {currentQuiz.explanation}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Test Your Knowledge?</h3>
                <p className="text-gray-400 mb-4">
                  Generate a smart quiz question based on your learning progress
                </p>
                <Button
                  onClick={generateQuiz}
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAIMentor;
