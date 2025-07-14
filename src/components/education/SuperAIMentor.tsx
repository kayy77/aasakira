
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Send, 
  TrendingUp, 
  MessageCircle, 
  Activity,
  Star,
  Clock,
  Trophy,
  AlertCircle,
  Image,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserTrackingService } from '@/services/userTrackingService';
import { hybridAIService, type AIResponse } from '@/services/hybridAIService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'analysis' | 'lesson';
  visualUrl?: string;
  analysis?: any;
}

interface SuperAIMentorProps {
  onFeatureUse?: () => void;
}

const SuperAIMentor: React.FC<SuperAIMentorProps> = ({ onFeatureUse }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [includeVisuals, setIncludeVisuals] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const progress = await UserTrackingService.getUserProgress(user.id);
        setUserProgress(progress);

        const sessionId = await UserTrackingService.startLearningSession({
          user_id: user.id,
          session_type: 'chat',
          start_time: new Date().toISOString(),
          topics_covered: []
        });
        setCurrentSession(sessionId);

        const welcomeMessage = progress
          ? `🎯 **Welcome back to Aasakira 2.0!** 

I can see you've had ${progress.messages_sent} conversations, analyzed ${progress.charts_analyzed} charts, and have a ${progress.win_rate}% success rate. 

🚀 **Enhanced Features Now Active:**
• 🧠 GPT-4o powered analysis
• 📊 AI-generated trading charts
• 📈 Advanced market structure analysis

Let's take your trading to the next level! What would you like to master today?`
          : `🎯 **Welcome to Aasakira 2.0 - Your Advanced AI Mentor!**

I'm powered by GPT-4o and equipped with:
• 📊 Visual chart generation
• 🧠 Advanced market analysis
• 📈 Smart Money Concepts expertise

Ready to become a professional trader? Ask me anything!`;
        
        setMessages([{
          id: Date.now().toString(),
          content: welcomeMessage,
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        }]);
      } catch (error) {
        console.error('Error loading user data:', error);
        setMessages([{
          id: Date.now().toString(),
          content: `🎯 **Welcome to Aasakira 2.0!**

Your advanced AI trading mentor is ready with GPT-4o intelligence and visual chart generation. Let's master the markets together!`,
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        }]);
      }
    };

    loadUserData();

    return () => {
      if (currentSession) {
        UserTrackingService.endLearningSession(currentSession, new Date().toISOString());
      }
    };
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.id || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Track the message with correct activity type
      await UserTrackingService.trackActivity({
        user_id: user.id,
        activity_type: 'chat_message',
        data: {
          message_length: currentInput.length,
          session_id: currentSession,
          includes_visuals: includeVisuals
        }
      });

      // Update session interactions
      if (currentSession) {
        await UserTrackingService.updateSessionInteractions(currentSession);
      }

      // Get advanced AI response using the hybrid AI service
      const aiResponse: AIResponse = await hybridAIService.generateComprehensiveResponse(
        currentInput,
        {
          experience: userProgress?.trading_style || 'Intermediate',
          tradingStyle: userProgress?.trading_style || 'Swing Trading',
          riskTolerance: userProgress?.risk_tolerance || 'Moderate',
          winRate: userProgress?.win_rate || 0,
          totalStudyTime: userProgress?.total_study_time_minutes || 0,
          chartsAnalyzed: userProgress?.charts_analyzed || 0,
          currentStreak: userProgress?.current_streak || 0,
          messagesSent: userProgress?.messages_sent || 0
        },
        includeVisuals
      );

      // Store AI memory with enhanced context
      await UserTrackingService.storeAIMemory({
        user_id: user.id,
        memory_type: 'conversation',
        content: `User: ${currentInput}\nAI (GPT-4o): ${aiResponse.text}`,
        importance_score: Math.round(aiResponse.confidence * 10),
        context: {
          session_id: currentSession,
          timestamp: new Date().toISOString(),
          ai_source: aiResponse.source,
          has_visual: !!aiResponse.visualUrl,
          trading_analysis: aiResponse.analysis
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: 'analysis',
        visualUrl: aiResponse.visualUrl,
        analysis: aiResponse.analysis
      };

      setMessages(prev => [...prev, aiMessage]);
      onFeatureUse?.();

      toast({
        title: "🚀 Advanced AI Response Generated!",
        description: `Powered by ${aiResponse.source.toUpperCase()} with ${Math.round(aiResponse.confidence * 100)}% confidence`,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties with the advanced AI system. Please try rephrasing your question or contact support if the issue persists.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Enhanced Status Card */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Aasakira 2.0 - Advanced AI Mentor
            <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500">
              GPT-4o Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userProgress ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </div>
                <div className="text-2xl font-bold text-purple-400">{userProgress.messages_sent}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Win Rate
                </div>
                <div className="text-2xl font-bold text-green-400">{userProgress.win_rate.toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                  <Trophy className="h-4 w-4" />
                  Streak
                </div>
                <div className="text-2xl font-bold text-yellow-400">{userProgress.current_streak}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  Study Time
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatTime(userProgress.total_study_time_minutes)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Loading your progress...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Controls */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Zap className="h-5 w-5" />
            Advanced Features
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            onClick={() => setIncludeVisuals(!includeVisuals)}
            variant={includeVisuals ? "default" : "outline"}
            className={includeVisuals ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Image className="h-4 w-4 mr-2" />
            Visual Charts {includeVisuals && "✓"}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Chat Interface - Fixed positioning and z-index */}
      <Card className="border-purple-500/20 relative z-20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            Advanced AI Chat
            <Badge variant="outline" className="text-xs ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              GPT-4o Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Fixed height chat area with proper scrolling */}
          <div className="h-[500px] flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-xl ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-purple-500/20 text-gray-100'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      
                      {/* Visual Chart Display */}
                      {message.visualUrl && (
                        <div className="mt-3">
                          <img 
                            src={message.visualUrl} 
                            alt="AI Generated Chart" 
                            className="w-full rounded-lg border border-purple-500/30 max-w-md"
                          />
                          <Badge className="mt-2 bg-purple-500/20 text-purple-400">
                            AI Generated Chart
                          </Badge>
                        </div>
                      )}

                      {/* Trading Analysis Display */}
                      {message.analysis && (
                        <div className="mt-3 p-3 bg-black/20 rounded-lg border border-yellow-500/30">
                          <div className="text-xs text-yellow-400 mb-2">📊 Trading Analysis</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {message.analysis.pair && (
                              <div><strong>Pair:</strong> {message.analysis.pair}</div>
                            )}
                            {message.analysis.trend && (
                              <div><strong>Trend:</strong> <span className={
                                message.analysis.trend === 'bullish' ? 'text-green-400' :
                                message.analysis.trend === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                              }>{message.analysis.trend}</span></div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 p-4 rounded-xl max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                        <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                        <span className="text-sm text-gray-300">Aasakira 2.0 is analyzing with GPT-4o...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            {/* Fixed input area */}
            <div className="p-4 border-t border-purple-500/20 bg-gray-900/50">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about advanced trading strategies, market analysis, or request visual lessons..."
                  className="flex-1 bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-center mt-2 text-purple-400">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Powered by GPT-4o and Replicate AI
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Dashboard */}
      {userProgress && (
        <Card className="border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Your Learning Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Charts Analyzed</span>
                  <span>{userProgress.charts_analyzed}/100</span>
                </div>
                <Progress value={(userProgress.charts_analyzed / 100) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Signals Viewed</span>
                  <span>{userProgress.signals_viewed}/50</span>
                </div>
                <Progress value={(userProgress.signals_viewed / 50) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trading Games</span>
                  <span>{userProgress.trading_games_played}/20</span>
                </div>
                <Progress value={(userProgress.trading_games_played / 20) * 100} className="h-2" />
              </div>
              {userProgress.skills_mastered?.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Skills Mastered</div>
                  <div className="flex flex-wrap gap-2">
                    {userProgress.skills_mastered.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuperAIMentor;
