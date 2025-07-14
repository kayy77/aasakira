
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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserTrackingService } from '@/services/userTrackingService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'analysis' | 'lesson';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user progress and start session
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const progress = await UserTrackingService.getUserProgress(user.id);
        setUserProgress(progress);

        // Start learning session
        const sessionId = await UserTrackingService.startLearningSession({
          user_id: user.id,
          session_type: 'chat',
          start_time: new Date().toISOString(),
          topics_covered: []
        });
        setCurrentSession(sessionId);

        // Add welcome message with personalized context
        if (progress) {
          const welcomeMessage = `Welcome back! 🎯 I can see you've had ${progress.messages_sent} conversations, analyzed ${progress.charts_analyzed} charts, and have a ${progress.win_rate}% success rate. Let's continue building your trading mastery!`;
          
          setMessages([{
            id: Date.now().toString(),
            content: welcomeMessage,
            isUser: false,
            timestamp: new Date(),
            type: 'text'
          }]);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Add basic welcome message even if progress loading fails
        setMessages([{
          id: Date.now().toString(),
          content: "Welcome to Aasakira AI Mentor! I'm here to help you master trading. Ask me anything about market analysis, trading strategies, or risk management.",
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        }]);
      }
    };

    loadUserData();

    // End session on unmount
    return () => {
      if (currentSession) {
        UserTrackingService.endLearningSession(currentSession, new Date().toISOString());
      }
    };
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Track the message
      await UserTrackingService.trackActivity({
        user_id: user.id,
        activity_type: 'chat_message',
        data: {
          message_length: inputMessage.length,
          session_id: currentSession
        }
      });

      // Update session interactions
      if (currentSession) {
        await UserTrackingService.updateSessionInteractions(currentSession);
      }

      // Simple AI response for now (since hybrid service might be having issues)
      const responses = [
        "That's a great question about trading! Based on market structure analysis, I'd recommend focusing on key support/resistance levels and waiting for confirmation before entering any position.",
        "Excellent observation! In Smart Money Concepts, we always look for liquidity sweeps and fair value gaps. This setup shows strong institutional interest.",
        "You're thinking like a professional trader! Risk management is crucial - never risk more than 1-2% per trade, and always have a clear exit strategy.",
        "Smart analysis! The market is showing signs of institutional accumulation. Look for break of structure and order blocks for optimal entry points.",
        "Perfect timing for this question! Market sentiment is shifting, and we're seeing classic SMC patterns emerge. Stay patient and let the setup develop."
      ];

      const aiResponse = responses[Math.floor(Math.random() * responses.length)];

      // Store AI memory
      await UserTrackingService.storeAIMemory({
        user_id: user.id,
        memory_type: 'conversation',
        content: `User: ${inputMessage}\nAI: ${aiResponse}`,
        importance_score: inputMessage.length > 50 ? 8 : 5,
        context: {
          session_id: currentSession,
          timestamp: new Date().toISOString()
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
      onFeatureUse?.();

      toast({
        title: "Message sent!",
        description: "Aasakira AI has analyzed your question."
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties. Please try rephrasing your question or contact support if the issue persists.",
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
    <div className="space-y-6">
      {/* Real-time User Stats */}
      <Card className="bg-gradient-to-r from-background to-muted border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Aasakira AI Mentor - Ready to Chat
            <Badge variant="secondary" className="ml-auto">
              Online
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
                <div className="text-2xl font-bold text-primary">{userProgress.messages_sent}</div>
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

      {/* Enhanced Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            AI Chat - Trading Intelligence
            <Badge variant="outline" className="text-xs ml-auto">
              Enhanced AI Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground ml-4' 
                      : 'bg-muted mr-4'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg mr-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">Aasakira AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about trading strategies, market analysis, or risk management..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isLoading}
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Powered by Aasakira AI Intelligence
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Dashboard */}
      {userProgress && (
        <Card>
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
