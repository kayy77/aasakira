import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getGroqService } from '@/services/groqService';
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
  Sparkles,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import ConceptVisualizer from './visual/ConceptVisualizer';
import LessonCard from './visual/LessonCard';
import SamuraiEffects from './visual/SamuraiEffects';
import ChartUploadAnalysis from './visual/ChartUploadAnalysis';
import LevelBadge from './LevelBadge';

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
  const [activeSection, setActiveSection] = useState<'chat' | 'quiz'>('chat');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const { toast } = useToast();
  const { 
    learningData, 
    updateLearningProgress, 
    getMentorPersonality, 
    getQuizDifficulty 
  } = useAdaptiveLearning();

  const detectConcepts = (text: string): string[] => {
    const concepts = [
      'market structure',
      'order block',
      'fair value gap',
      'liquidity',
      'break of structure',
      'breaker block',
      'imbalance',
      'stop hunt',
      'smart money'
    ];
    
    return concepts.filter(concept => 
      text.toLowerCase().includes(concept)
    );
  };

  const generateLessonCard = (concept: string) => {
    const lessons = {
      'market structure': {
        topic: 'Market Structure Analysis',
        strategy: 'Identify swing highs/lows and break of structure',
        rule: 'Only trade in direction of structure break',
        visual: 'Higher highs & higher lows for bullish structure'
      },
      'order block': {
        topic: 'Order Block Trading',
        strategy: 'Enter on return to institutional order zone',
        rule: 'Use last opposite candle before strong directional move',
        visual: 'Highlighted supply/demand zones on chart'
      },
      'fair value gap': {
        topic: 'Fair Value Gap (FVG)',
        strategy: 'Enter when price returns to fill the imbalance',
        rule: 'Look for three candle pattern with gap',
        visual: 'Visible gap between candle wicks'
      },
      'liquidity': {
        topic: 'Liquidity Concepts',
        strategy: 'Target areas where stops are likely resting',
        rule: 'Above/below swing points hold stop losses',
        visual: 'Zones above highs and below lows'
      }
    };
    
    return lessons[concept.toLowerCase()] || null;
  };

  const convertToBushidoQuote = (text: string): string => {
    if (Math.random() > 0.3) return text; // 30% chance for bushido quote
    
    const quotes = [
      "The patient trader strikes only when the market bows. " + text,
      "Like cherry blossoms in spring, opportunities bloom for those who wait. " + text,
      "A samurai's discipline in battle mirrors a trader's patience in chaos. " + text,
      "The way of the market is like the way of the sword - precision over force. " + text,
      "In stillness, find strength. In movement, find opportunity. " + text
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const generatePersonalizedPrompt = (userInput: string) => {
    const personality = getMentorPersonality();
    
    return `You are Aasakira, an AI trading mentor. The user is at ${learningData.level} level.

**Adaptation Guidelines:**
- Tone: ${personality.tone}
- Use: ${personality.terminology}
- Examples: ${personality.examples}
- Encouragement: "${personality.encouragement}"

**User's Progress:**
- Level Score: ${learningData.score}/100
- Quiz Accuracy: ${(learningData.metrics.quizAccuracy * 100).toFixed(1)}%
- Advanced Terms Mastered: ${learningData.metrics.advancedTermsUsed.length}
- Total Interactions: ${learningData.metrics.totalInteractions}

**Current Level Requirements:**
${learningData.nextLevelRequirements.map(req => `- ${req}`).join('\n')}

Respond to: "${userInput}"

Keep responses appropriate for their level - ${learningData.level === 'Novice' ? 'explain basics simply' : 
learningData.level === 'Intermediate' ? 'provide detailed explanations' :
learningData.level === 'Smart Money Aware' ? 'use institutional concepts' :
'engage as a peer expert'}`;
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

    // Update learning progress based on message
    await updateLearningProgress({
      type: 'message',
      data: { message: currentInput }
    });

    try {
      console.log('🤖 Sending adaptive message to Groq AI service:', currentInput);
      
      // Get conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
      }));

      const groqService = getGroqService();
      
      // Use personalized prompt based on user level
      const personalizedPrompt = generatePersonalizedPrompt(currentInput);
      
      const response = await groqService.generateResponse([
        { role: 'system', content: personalizedPrompt },
        ...conversationHistory,
        { role: 'user', content: currentInput }
      ], 'llama3-8b-8192', 0.7);
      
      console.log('✅ Received adaptive response from Groq AI:', response);
      
      // Convert to bushido quote occasionally for advanced users
      const finalResponse = learningData.level === 'Advanced Strategist' || learningData.level === 'Smart Money Aware' 
        ? convertToBushidoQuote(response) 
        : response;
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: finalResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: `⚡ ${learningData.level} Response`,
        description: `Adaptive AI response for ${learningData.level} trader`,
      });
    } catch (error) {
      console.error('❌ Groq AI response error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble connecting to my AI service right now. Please try again in a moment. I\'m here to help with trading concepts, life advice, or just casual conversation!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "⚠️ Connection Issue",
        description: "There was a temporary issue. Please try again.",
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
      
      // Get difficulty based on user level
      const difficulty = getQuizDifficulty();
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      console.log(`Generating ${difficulty} quiz for ${learningData.level} on ${randomTopic}`);
      
      // Generate quiz using Groq AI with level-appropriate difficulty
      const groqService = getGroqService();
      const quizPrompt = `Generate a ${difficulty} level multiple choice quiz question about "${randomTopic}" for forex trading education suitable for a ${learningData.level} trader.

${learningData.level === 'Novice' ? 'Use simple terminology and basic concepts.' :
  learningData.level === 'Intermediate' ? 'Include intermediate trading concepts and proper terminology.' :
  learningData.level === 'Smart Money Aware' ? 'Focus on institutional concepts and smart money principles.' :
  'Create advanced questions about complex market dynamics and institutional strategies.'}

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
        { role: 'system', content: `You are a professional forex trading educator creating ${difficulty} level quiz questions for ${learningData.level} traders.` },
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
          difficulty,
          topic: randomTopic
        };
        
        setCurrentQuiz(quiz);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setActiveSection('quiz');
        
        toast({
          title: "🎯 Adaptive AI Quiz",
          description: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level for ${learningData.level}`,
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
        difficulty: learningData.level === 'Novice' ? 'easy' : learningData.level === 'Intermediate' ? 'medium' : 'hard',
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

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !currentQuiz) return;

    const isCorrect = selectedAnswer === currentQuiz.correctAnswer;
    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    // Update learning progress based on quiz performance
    await updateLearningProgress({
      type: 'quiz',
      data: {
        correct: isCorrect ? 1 : 0,
        total: 1,
        difficulty: currentQuiz.difficulty,
        topic: currentQuiz.topic
      }
    });
    
    setShowExplanation(true);
    
    toast({
      title: isCorrect ? "🎉 Correct!" : "❌ Incorrect",
      description: isCorrect ? 
        `+${learningData.level === 'Advanced Strategist' ? '10' : '5'} XP earned!` : 
        "Keep learning, you're improving!",
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
      {/* Enhanced Header with Level Display */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SamuraiEffects showGlow>
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
              </SamuraiEffects>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Aasakira AI Mentor & Buddy
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </h2>
                <p className="text-sm text-gray-400">Adaptive Trading Sensei • Powered by Groq AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LevelBadge 
                level={learningData.level} 
                score={learningData.score} 
                compact={true}
              />
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
        
        {/* Level Progress Card */}
        <CardContent className="pt-0">
          <LevelBadge 
            level={learningData.level} 
            score={learningData.score} 
            nextRequirements={learningData.nextLevelRequirements}
          />
        </CardContent>
      </Card>

      {/* Chat Section */}
      {activeSection === 'chat' && (
        <SamuraiEffects showPetals>
          <Card className="glass-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                Visual Trading Sensei
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  ⚡ Enhanced with Charts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="h-96 overflow-y-auto space-y-3 bg-gray-900/30 rounded-lg p-4">
                <AnimatePresence>
                  {messages.map((message) => {
                    const detectedConcepts = message.type === 'ai' ? detectConcepts(message.content) : [];
                    const lessonConcept = detectedConcepts[0];
                    const lessonData = lessonConcept ? generateLessonCard(lessonConcept) : null;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[85%] space-y-3">
                          <SamuraiEffects showGlow>
                            <div
                              className={`p-3 rounded-lg ${
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
                          </SamuraiEffects>
                          
                          {/* Auto-embed concept visualizations */}
                          {message.type === 'ai' && detectedConcepts.map((concept, index) => (
                            <ConceptVisualizer
                              key={index}
                              concept={concept}
                              explanation={message.content}
                            />
                          ))}
                          
                          {/* Show lesson card for main concept */}
                          {message.type === 'ai' && lessonData && (
                            <LessonCard
                              topic={lessonData.topic}
                              strategy={lessonData.strategy}
                              rule={lessonData.rule}
                              visual={lessonData.visual}
                              onPractice={() => {
                                toast({
                                  title: "🎯 Practice Mode",
                                  description: `Starting practice session for ${lessonData.topic}`,
                                });
                              }}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <SamuraiEffects showGlow>
                      <div className="bg-gray-700 text-gray-100 p-3 rounded-lg flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Aasakira is thinking with Groq AI...</span>
                      </div>
                    </SamuraiEffects>
                  </motion.div>
                )}
              </div>

              {/* Chart Upload Analysis */}
              <ChartUploadAnalysis
                onImageUpload={(analysis) => {
                  const analysisMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: `📊 **Chart Analysis Complete:**\n\n${analysis}`,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, analysisMessage]);
                }}
              />

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about trading, upload charts, or chat about anything!"
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
        </SamuraiEffects>
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
