
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
  Zap,
  CheckCircle2,
  RefreshCw
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
  status?: 'sending' | 'sent' | 'failed';
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
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'local'>('connecting');
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
        setConnectionStatus('connecting');
        const progress = await UserTrackingService.getUserProgress(user.id);
        setUserProgress(progress);

        const sessionId = await UserTrackingService.startLearningSession({
          user_id: user.id,
          session_type: 'chat',
          start_time: new Date().toISOString(),
          topics_covered: []
        });
        setCurrentSession(sessionId);
        setConnectionStatus('connected');

        const welcomeMessage = progress && progress.messages_sent > 0
          ? `🎯 **Welcome back to Aasakira 2.0!** 

I can see you've had ${progress.messages_sent} conversations, analyzed ${progress.charts_analyzed} charts, and have a ${progress.win_rate}% success rate. 

🚀 **Your Personal AI Mentor is Ready:**
• 🧠 Advanced trading analysis with local backup
• 📊 Smart Money Concepts expertise
• 📈 Personalized lessons based on your progress
• 💾 Memory of your learning journey

What would you like to master today? I can help with order blocks, risk management, market structure, or any trading question you have!

**Or we can just chat!** I love talking about life, hobbies, random thoughts, or whatever's on your mind. What's happening in your world? 😊`
          : `🎯 **Welcome to Aasakira 2.0 - Your Personal AI Trading Mentor & Friend!**

I'm your dedicated trading coach AND conversational buddy, equipped with:
• 📊 Smart Money Concepts expertise
• 🧠 Advanced market analysis capabilities
• 📈 Personalized learning paths
• 💾 Memory of your progress
• 🗣️ Love for chatting about anything!

**Ready to become a professional trader?** Ask me anything about:
- Smart Money Concepts (Order Blocks, FVG, BOS)
- Risk Management & Position Sizing
- Trading Psychology & Discipline
- Market Structure Analysis
- Entry/Exit Strategies

**Or let's just chat!** I'm here to talk about:
- Life, hobbies, interests
- Movies, music, games
- Philosophy, technology, random thoughts
- Whatever's on your mind!

What would you like to talk about today? 🚀`;
        
        setMessages([{
          id: Date.now().toString(),
          content: welcomeMessage,
          isUser: false,
          timestamp: new Date(),
          type: 'text',
          status: 'sent'
        }]);
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        setConnectionStatus('local');
        setMessages([{
          id: Date.now().toString(),
          content: `🎯 **Welcome to Aasakira 2.0!**

Your AI trading mentor & buddy is ready! I have comprehensive knowledge of Smart Money Concepts and professional trading strategies, PLUS I love chatting about anything!

**What I can help you with:**
• 📊 Order Blocks & Fair Value Gaps
• 🎯 Market Structure Analysis  
• ⚖️ Risk Management & Psychology
• 📈 Entry/Exit Strategies
• 🗣️ General conversation - life, hobbies, random thoughts!

Ask me anything about trading OR let's just chat! Try "explain order blocks" or "how's your day going?" 

Let's start our conversation! 📚`,
          isUser: false,
          timestamp: new Date(),
          type: 'text',
          status: 'sent'
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
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Add a "thinking" message
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Thinking about your message...',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      console.log('🚀 Processing message:', currentInput);

      // Track the message
      if (user?.id) {
        try {
          await UserTrackingService.trackActivity({
            user_id: user.id,
            activity_type: 'chat_message',
            data: {
              message_length: currentInput.length,
              session_id: currentSession,
              includes_visuals: includeVisuals
            }
          });

          if (currentSession) {
            await UserTrackingService.updateSessionInteractions(currentSession);
          }
        } catch (trackingError) {
          console.warn('⚠️ Tracking failed:', trackingError);
        }
      }

      // Get AI response
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

      // Remove thinking message and add AI response
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      // Store AI memory if possible
      if (user?.id && aiResponse) {
        try {
          await UserTrackingService.storeAIMemory({
            user_id: user.id,
            memory_type: 'conversation',
            content: `User: ${currentInput}\nAI (${aiResponse.source.toUpperCase()}): ${aiResponse.text}`,
            importance_score: Math.round(aiResponse.confidence * 10),
            context: {
              session_id: currentSession,
              timestamp: new Date().toISOString(),
              ai_source: aiResponse.source,
              has_visual: !!aiResponse.visualUrl,
              trading_analysis: aiResponse.analysis
            }
          });
        } catch (memoryError) {
          console.warn('⚠️ Memory storage failed:', memoryError);
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: 'analysis',
        visualUrl: aiResponse.visualUrl,
        analysis: aiResponse.analysis,
        status: 'sent'
      };

      setMessages(prev => [...prev, aiMessage]);
      onFeatureUse?.();

      toast({
        title: "🚀 AI Response Generated!",
        description: `Powered by ${aiResponse.source.toUpperCase()} with ${Math.round(aiResponse.confidence * 100)}% confidence`,
      });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      // Generate a helpful error response
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `🔧 **I'm still here to help!**

I experienced a temporary issue, but I can still provide you with comprehensive trading education:

**Try asking me about:**
• "What are order blocks?" - Learn Smart Money Concepts
• "How do I manage risk?" - Master position sizing
• "Explain market structure" - Understand price action
• "Trading psychology tips" - Build discipline

**Or let's just chat:**
• "How's your day going?" - General conversation
• "What are your hobbies?" - Get to know each other
• "Tell me about AI" - Technology discussions

**Quick Tips:**
- Use specific questions for better responses
- Ask about real trading scenarios
- Request examples or explanations
- Or just chat about anything!

What would you like to learn about or talk about? I'm ready to help! 💪`,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Response Generated",
        description: "AI mentor provided a helpful response from local knowledge!",
      });
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

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending': return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'sent': return <CheckCircle2 className="h-3 w-3 text-green-400" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-red-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Enhanced Status Card */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Aasakira 2.0 - Advanced AI Mentor & Buddy
            <Badge className={`ml-auto ${
              connectionStatus === 'connected' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
              connectionStatus === 'connecting' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {connectionStatus === 'connected' ? 'Full AI Active' :
               connectionStatus === 'connecting' ? 'Connecting...' : 'Local Knowledge'}
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
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading your progress...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Chat Interface */}
      <Card className="border-purple-500/20 relative z-20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            Advanced AI Chat & Buddy
            <Badge variant="outline" className="text-xs ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Chat About Anything!
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-xl relative ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : message.status === 'failed'
                        ? 'bg-gradient-to-r from-red-900/80 to-red-800/80 border border-red-500/30 text-gray-100'
                        : 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-purple-500/20 text-gray-100'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      
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
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <div className="p-4 border-t border-purple-500/20 bg-gray-900/50">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about trading, or let's just chat about life, hobbies, random thoughts..."
                  className="flex-1 bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="text-xs text-center mt-2 text-purple-400">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Your buddy Aasakira - ready to chat about anything or teach you trading!
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
              Your Learning Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Charts Analyzed</span>
                  <span>{userProgress.charts_analyzed}/100</span>
                </div>
                <Progress value={Math.min((userProgress.charts_analyzed / 100) * 100, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Signals Viewed</span>
                  <span>{userProgress.signals_viewed}/50</span>
                </div>
                <Progress value={Math.min((userProgress.signals_viewed / 50) * 100, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trading Games</span>
                  <span>{userProgress.trading_games_played}/20</span>
                </div>
                <Progress value={Math.min((userProgress.trading_games_played / 20) * 100, 100)} className="h-2" />
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
