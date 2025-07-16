import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedGroqService } from '@/services/enhancedGroqService';
import { UserContextService } from '@/services/userContextService';
import { UserTrackingService } from '@/services/userTrackingService';
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
  Eye,
  Heart,
  Users,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  personalityMetrics?: {
    alignment: number;
    relevance: number;
    relationship: number;
  };
  insights?: string[];
}

const EnhancedAIMentor: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [activeSection, setActiveSection] = useState<'chat' | 'quiz'>('chat');
  const [userPersonality, setUserPersonality] = useState<any>(null);
  const [userLevel, setUserLevel] = useState<string>('Trading Beginner');
  const [relationshipLevel, setRelationshipLevel] = useState(0);
  const { toast } = useToast();
  const { 
    learningData, 
    updateLearningProgress, 
    getMentorPersonality, 
    getQuizDifficulty 
  } = useAdaptiveLearning();

  useEffect(() => {
    const initializeUser = async () => {
      if (!user?.id) return;

      try {
        // Load comprehensive user context
        const userContext = await UserContextService.getComprehensiveUserContext(user.id);
        setUserPersonality(userContext.personality);
        setUserLevel(userContext.currentLevel);
        setRelationshipLevel(userContext.conversationHistory.messageCount * 2);

        // Generate personalized welcome
        const welcomeResponse = await EnhancedGroqService.generatePersonalizedResponse(
          "Welcome message initialization",
          user.id,
          []
        );

        const welcomeMessage: ChatMessage = {
          id: '1',
          type: 'ai',
          content: userContext.conversationHistory.messageCount === 0 
            ? `👋 **Welcome to your personal trading journey!**

Hey there! I'm Aasakira, your AI trading mentor who's designed to learn YOU. I'll remember every conversation, adapt to your personality, and grow with you as a trader and friend.

**What makes me special:**
🧠 I learn your communication style and adapt
📊 I track your progress across all trading activities  
💝 I remember personal details and build genuine connection
🎯 I provide level-appropriate education just for you

Tell me about yourself! What brings you to trading? What are your goals? I'm genuinely excited to get to know you! 🚀`
            : welcomeResponse.response,
          timestamp: new Date(),
          personalityMetrics: {
            alignment: 95,
            relevance: 90,
            relationship: userContext.conversationHistory.messageCount > 10 ? 85 : 60
          }
        };

        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Error initializing user:', error);
        setMessages([{
          id: '1',
          type: 'ai',
          content: '👋 Hello! I\'m Aasakira, your personalized AI trading mentor. I\'m here to learn about you and provide tailored trading education. Let\'s start our journey together!',
          timestamp: new Date()
        }]);
      }
    };

    initializeUser();
  }, [user]);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user?.id) return;

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
      console.log('🤖 Generating personalized response for:', currentInput);
      
      // Get conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
      }));

      // Generate personalized response using enhanced service
      const personalizedResponse = await EnhancedGroqService.generatePersonalizedResponse(
        currentInput,
        user.id,
        conversationHistory
      );
      
      console.log('✅ Received personalized response:', personalizedResponse);
      
      // Convert to bushido quote occasionally for advanced users
      const finalResponse = learningData.level === 'Advanced Strategist' || learningData.level === 'Smart Money Aware' 
        ? convertToBushidoQuote(personalizedResponse.response) 
        : personalizedResponse.response;
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: finalResponse,
        timestamp: new Date(),
        personalityMetrics: {
          alignment: personalizedResponse.conversationMetrics.personalityAlignment,
          relevance: personalizedResponse.conversationMetrics.topicRelevance,
          relationship: personalizedResponse.conversationMetrics.relationshipBuilding
        },
        insights: personalizedResponse.learningInsights
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update relationship level
      setRelationshipLevel(prev => Math.min(prev + 2, 100));
      
      toast({
        title: `🎯 ${learningData.level} Response`,
        description: `${Math.round(personalizedResponse.conversationMetrics.personalityAlignment)}% personality match • ${Math.round(personalizedResponse.conversationMetrics.relationshipBuilding)}% connection building`,
      });
    } catch (error) {
      console.error('❌ Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble connecting right now. I\'m still here to help with trading concepts and personal conversation though! Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "⚠️ Connection Issue",
        description: "Temporary issue, but I'm still here to help!",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Generate personalized quiz based on user level and weak areas
      const userContext = await UserContextService.getComprehensiveUserContext(user.id);
      
      const topics = userContext.personality.weakAreas.length > 0 
        ? userContext.personality.weakAreas
        : ['Order Blocks and Breaker Blocks', 'Fair Value Gaps', 'Market Structure'];
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      console.log(`Generating personalized quiz for ${userContext.currentLevel} on ${randomTopic}`);
      
      // Use enhanced service to generate quiz
      const quizPrompt = `Generate a quiz question about "${randomTopic}" specifically for a ${userContext.currentLevel} trader with ${userContext.personality.communicationStyle} communication style.`;
      
      const quizResponse = await EnhancedGroqService.generatePersonalizedResponse(
        quizPrompt,
        user.id,
        []
      );

      // Parse quiz (simplified for this example)
      const quiz: QuizQuestion = {
        question: `What is the key principle of ${randomTopic} in Smart Money Concepts?`,
        options: [
          "It's based on retail trader behavior",
          "It identifies institutional order zones",
          "It predicts exact price movements",
          "It guarantees profitable trades"
        ],
        correctAnswer: 1,
        explanation: `${randomTopic} helps identify where institutional traders have placed their orders, creating zones of imbalance that price often returns to fill.`,
        difficulty: userContext.currentLevel,
        topic: randomTopic
      };
      
      setCurrentQuiz(quiz);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setActiveSection('quiz');
      
      toast({
        title: "🎯 Personalized Quiz",
        description: `Custom question for ${userContext.currentLevel}`,
      });
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
        title: "📚 Quiz Ready",
        description: "Generated a practice question for you",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !currentQuiz || !user?.id) return;

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
    
    // Track quiz performance with enhanced context
    await UserTrackingService.trackActivity({
      user_id: user.id,
      activity_type: 'chat_message',
      data: {
        quiz_correct: isCorrect ? 1 : 0,
        quiz_total: 1,
        difficulty: currentQuiz.difficulty,
        topic: currentQuiz.topic,
        user_level: userLevel
      }
    });
    
    setShowExplanation(true);
    
    toast({
      title: isCorrect ? "🎉 Excellent!" : "📚 Learning Opportunity",
      description: isCorrect ? 
        `Great job! Your ${userLevel} knowledge is showing!` : 
        "Every mistake is a step forward in your journey!",
      variant: isCorrect ? "default" : "destructive"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPersonalityBadgeColor = (style: string) => {
    switch (style) {
      case 'casual': return 'bg-green-500/20 text-green-400';
      case 'professional': return 'bg-blue-500/20 text-blue-400';
      case 'technical': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Personality Display */}
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
                  Personalized AI Mentor
                  <Heart className="w-4 h-4 text-pink-400" />
                </h2>
                <p className="text-sm text-gray-400">Learning & Adapting to YOU • Advanced Groq AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userPersonality && (
                <Badge className={getPersonalityBadgeColor(userPersonality.communicationStyle)}>
                  {userPersonality.communicationStyle} Style
                </Badge>
              )}
              <Button
                onClick={() => setActiveSection('chat')}
                variant={activeSection === 'chat' ? 'default' : 'outline'}
                size="sm"
                className={activeSection === 'chat' ? 'bg-purple-600' : 'border-gray-600'}
              >
                <Brain className="w-4 h-4 mr-1" />
                Personal Chat
              </Button>
              <Button
                onClick={() => setActiveSection('quiz')}
                variant={activeSection === 'quiz' ? 'default' : 'outline'}
                size="sm"
                className={activeSection === 'quiz' ? 'bg-purple-600' : 'border-gray-600'}
              >
                <Target className="w-4 h-4 mr-1" />
                Custom Quiz
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {/* Personality & Relationship Status */}
        <CardContent className="pt-0">
          <LevelBadge 
            level={learningData.level} 
            score={learningData.score} 
            nextRequirements={learningData.nextLevelRequirements}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{userLevel.split(' ')[0]}</div>
              <div className="text-sm text-gray-400">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-pink-400">{relationshipLevel}%</div>
              <div className="text-sm text-gray-400">Connection</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{messages.length}</div>
              <div className="text-sm text-gray-400">Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{((quizScore.correct / Math.max(quizScore.total, 1)) * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Quiz Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeSection === 'chat' && (
        <SamuraiEffects showPetals>
          <Card className="glass-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Personal AI Companion
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  ⚡ Learns Your Style
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
                              
                              {/* Show personality metrics for AI messages */}
                              {message.type === 'ai' && message.personalityMetrics && (
                                <div className="mt-2 pt-2 border-t border-gray-600 grid grid-cols-3 gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3 text-green-400" />
                                    <span className="text-green-400">{message.personalityMetrics.alignment}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3 text-blue-400" />
                                    <span className="text-blue-400">{message.personalityMetrics.relevance}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3 text-pink-400" />
                                    <span className="text-pink-400">{message.personalityMetrics.relationship}%</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Show learning insights */}
                              {message.insights && message.insights.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-600">
                                  <div className="text-xs text-yellow-400 mb-1">🧠 Insights:</div>
                                  {message.insights.slice(0, 2).map((insight, index) => (
                                    <div key={index} className="text-xs text-gray-300">• {insight}</div>
                                  ))}
                                </div>
                              )}
                              
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
                        <span>Creating personalized response...</span>
                      </div>
                    </SamuraiEffects>
                  </motion.div>
                )}
              </div>

              {/* Chart Upload Analysis */}
              <ChartUploadAnalysis
                onImageUpload={(analysis) => {
                  console.log('Chart analysis:', analysis);
                  const analysisMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: `📊 **Personal Chart Analysis:**\n\n${analysis}`,
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
                  placeholder={userPersonality?.communicationStyle === 'casual' 
                    ? "Hey! What's on your mind? Trading, life, goals - anything!" 
                    : "Share your thoughts, questions, or experiences with me..."}
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
                Personalized Trading Quiz
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
                    Generate My Quiz
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
                <h3 className="text-xl font-semibold text-white mb-2">Personalized Knowledge Test</h3>
                <p className="text-gray-400 mb-4">
                  Custom quiz questions based on your level ({userLevel}) and learning style
                </p>
                <Button
                  onClick={generateQuiz}
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate My Quiz
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
