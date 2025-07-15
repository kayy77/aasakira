
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
  CheckCircle2
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
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'failed'>('connecting');
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

🚀 **Enhanced Features Active:**
• 🧠 GPT-4o powered analysis with fallback system
• 📊 AI-generated trading charts  
• 📈 Advanced market structure analysis
• 💾 Persistent memory of your learning journey

Let's continue building your trading expertise! What would you like to master today?`
          : `🎯 **Welcome to Aasakira 2.0 - Your Advanced AI Mentor!**

I'm your personal trading coach, powered by advanced AI and equipped with:
• 📊 Visual chart generation
• 🧠 Advanced market analysis
• 📈 Smart Money Concepts expertise
• 💾 Memory of your learning progress

Ready to become a professional trader? Ask me anything about:
- Smart Money Concepts
- Market Structure Analysis  
- Risk Management
- Trading Psychology
- Entry/Exit Strategies

Let's start your journey! 🚀`;
        
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
        setConnectionStatus('failed');
        setMessages([{
          id: Date.now().toString(),
          content: `🎯 **Welcome to Aasakira 2.0!**

Your advanced AI trading mentor is ready! While I'm having some connection issues, I can still provide you with comprehensive trading education.

Ask me about Smart Money Concepts, risk management, or any trading questions you have! 📈`,
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
      content: 'Analyzing your question...',
      isUser: false,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      console.log('🚀 Sending message to AI:', currentInput);

      // Track the message
      if (user?.id) {
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
      }

      // Get AI response with retry logic
      let aiResponse: AIResponse;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          console.log(`🔄 AI request attempt ${attempts + 1}/${maxAttempts}`);
          
          aiResponse = await hybridAIService.generateComprehensiveResponse(
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
          break;
        } catch (error) {
          attempts++;
          console.warn(`⚠️ AI attempt ${attempts} failed:`, error);
          
          if (attempts >= maxAttempts) {
            throw new Error('All AI attempts failed');
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      // Remove thinking message and add AI response
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      // Store AI memory
      if (user?.id && aiResponse) {
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
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `🔧 **System Update in Progress**

I'm currently experiencing some technical difficulties, but I'm still here to help! While my advanced AI features are temporarily unavailable, I can still provide you with:

• **Trading Education** - Ask about SMC, risk management, psychology
• **Strategy Guidance** - Entry/exit strategies and market analysis  
• **Learning Resources** - Personalized recommendations based on your level

Please try asking your question again, or ask something simpler to get started. I'm working to restore full functionality! 💪

*Tip: Try asking "Explain order blocks" or "What is risk management?"*`,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        status: 'failed'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "AI mentor is working on reduced functionality. Try a simpler question!",
        variant: "destructive"
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
      case 'sending': return <Clock className="h-3 w-3 animate-spin" />;
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
            Aasakira 2.0 - Advanced AI Mentor
            <Badge className={`ml-auto ${
              connectionStatus === 'connected' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
              connectionStatus === 'connecting' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`}>
              {connectionStatus === 'connected' ? 'GPT-4o Ready' :
               connectionStatus === 'connecting' ? 'Connecting...' : 'Backup Mode'}
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

      {/* Enhanced Chat Interface */}
      <Card className="border-purple-500/20 relative z-20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            Advanced AI Chat
            <Badge variant="outline" className="text-xs ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              {connectionStatus === 'connected' ? 'GPT-4o Active' : 'Backup Mode'}
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
                  placeholder={connectionStatus === 'connected' 
                    ? "Ask me about advanced trading strategies, market analysis, or request visual lessons..."
                    : "Ask me about trading concepts, risk management, or basic strategies..."
                  }
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
                {connectionStatus === 'connected' 
                  ? 'Powered by GPT-4o and Replicate AI'
                  : 'Running in backup mode - full features coming soon!'
                }
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
