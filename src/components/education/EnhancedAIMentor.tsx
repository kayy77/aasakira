
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getGroqService, initializeGroqService } from '@/services/groqService';
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
  Target,
  Settings
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
      content: '👋 Hello! I\'m Aasakira, your AI trading mentor powered by Groq\'s lightning-fast AI. I\'m here to help you master forex trading with Smart Money Concepts! Ask me anything about trading, life, or just chat casually - I\'m your buddy too! 🚀',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [activeSection, setActiveSection] = useState<'chat' | 'quiz' | 'setup'>('setup');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [isGroqInitialized, setIsGroqInitialized] = useState(false);
  const { toast } = useToast();

  // Check if Groq is initialized on component mount
  useEffect(() => {
    try {
      getGroqService();
      setIsGroqInitialized(true);
      setActiveSection('chat');
    } catch (error) {
      setIsGroqInitialized(false);
      setActiveSection('setup');
    }
  }, []);

  const handleInitializeGroq = () => {
    if (!groqApiKey.trim()) {
      toast({
        title: "⚠️ API Key Required",
        description: "Please enter your Groq API key to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      initializeGroqService(groqApiKey);
      setIsGroqInitialized(true);
      setActiveSection('chat');
      toast({
        title: "✅ Groq AI Connected",
        description: "Lightning-fast AI responses are now ready!",
      });
    } catch (error) {
      toast({
        title: "❌ Connection Failed",
        description: "Please check your API key and try again.",
        variant: "destructive"
      });
    }
  };

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
      console.log('🤖 Sending message to Groq AI service:', currentInput);
      
      // Get conversation history for context - fix the type conversion
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
      }));

      const groqService = getGroqService();
      const response = await groqService.generateTradingAnalysis(
        currentInput,
        {
          tradingStyle: userLevel,
          level: userLevel,
          riskTolerance: 'Medium',
          totalInteractions: messages.filter(m => m.type === 'user').length,
          winRate: quizScore.total > 0 ? Math.round((quizScore.correct / quizScore.total) * 100) : 0,
          currentStreak: quizScore.correct
        },
        conversationHistory
      );
      
      console.log('✅ Received response from Groq AI:', response);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "⚡ Groq AI Response",
        description: "Lightning-fast response generated successfully!",
      });
    } catch (error) {
      console.error('❌ Groq AI response error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble connecting to my AI service right now. Please make sure the Groq API key is configured properly. I\'m here to help with trading concepts, life advice, or just casual conversation once we get connected!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "⚠️ Connection Issue",
        description: "Please check if the Groq API key is properly configured.",
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
      
      // Generate quiz using Groq AI
      const groqService = getGroqService();
      const quizPrompt = `Generate a ${randomDifficulty} level multiple choice quiz question about "${randomTopic}" for forex trading education. 

Format your response EXACTLY like this:
QUESTION: [Your question here]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
CORRECT: [A, B, C, or D]
EXPLANATION: [Detailed explanation of why the answer is correct]

Make it educational and relevant to Smart Money Concepts in forex trading.`;

      const quizResponse = await groqService.generateResponse([
        { role: 'system', content: 'You are a professional forex trading educator creating quiz questions.' },
        { role: 'user', content: quizPrompt }
      ], 'llama3-8b-8192', 0.3);

      // Parse the quiz response
      const lines = quizResponse.split('\n').filter(line => line.trim());
      const questionLine = lines.find(line => line.startsWith('QUESTION:'));
      const optionLines = lines.filter(line => /^[A-D]\)/.test(line.trim()));
      const correctLine = lines.find(line => line.startsWith('CORRECT:'));
      const explanationLine = lines.find(line => line.startsWith('EXPLANATION:'));

      if (questionLine && optionLines.length === 4 && correctLine && explanationLine) {
        const question = questionLine.replace('QUESTION:', '').trim();
        const options = optionLines.map(line => line.substring(2).trim());
        const correctLetter = correctLine.replace('CORRECT:', '').trim().toUpperCase();
        const correctAnswer = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
        const explanation = explanationLine.replace('EXPLANATION:', '').trim();

        const quiz: QuizQuestion = {
          question,
          options,
          correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
          explanation,
          difficulty: randomDifficulty,
          topic: randomTopic
        };
        
        setCurrentQuiz(quiz);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setActiveSection('quiz');
        
        toast({
          title: "🎯 AI-Generated Quiz",
          description: `${randomDifficulty.charAt(0).toUpperCase() + randomDifficulty.slice(1)} level question about ${randomTopic}`,
        });
      } else {
        throw new Error('Failed to parse quiz response');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      
      // Fallback to local quiz
      const localQuiz: QuizQuestion = {
        question: "What is an Order Block in Smart Money Concepts?",
        options: [
          "A random price area with high volume",
          "The last opposite candle before a strong directional move",
          "Any support or resistance level",
          "A technical indicator signal"
        ],
        correctAnswer: 1,
        explanation: "An Order Block is the last opposite candle before a strong directional move. This represents where institutional traders placed their orders, creating an imbalance that price often returns to fill.",
        difficulty: userLevel,
        topic: "Order Blocks"
      };
      
      setCurrentQuiz(localQuiz);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setActiveSection('quiz');
      
      toast({
        title: "📚 Fallback Quiz",
        description: "Generated a local quiz question about Order Blocks",
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

  // Setup section for API key configuration
  if (activeSection === 'setup') {
    return (
      <div className="space-y-6">
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Setup Groq AI</h2>
                <p className="text-sm text-gray-400">Configure your lightning-fast AI mentor</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-blue-300 mb-2">🚀 Get Your Groq API Key</h3>
              <p className="text-gray-300 text-sm mb-3">
                Groq provides ultra-fast AI inference. Get your free API key at:
              </p>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://console.groq.com/keys
              </a>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Groq API Key</label>
              <Input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="Enter your Groq API key"
                className="bg-gray-800 border-gray-600"
              />
            </div>
            
            <Button
              onClick={handleInitializeGroq}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Initialize Groq AI
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <p className="text-sm text-gray-400">Powered by Groq AI - Lightning-fast responses</p>
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
                onClick={() => setActiveSection('setup')}
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                <Settings className="w-4 h-4 mr-1" />
                Setup
              </Button>
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
              Groq AI Chat Assistant & Buddy
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                ⚡ Lightning Fast
              </Badge>
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
                    <span>Aasakira is thinking with Groq AI...</span>
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
                AI-Generated Trading Quiz
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
                    New AI Question
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
                  Generate an AI-powered quiz question using Groq's lightning-fast AI
                </p>
                <Button
                  onClick={generateQuiz}
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate AI Quiz
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
