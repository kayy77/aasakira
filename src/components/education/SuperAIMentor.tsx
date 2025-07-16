
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
  RefreshCw,
  Heart,
  Target,
  Users,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserTrackingService } from '@/services/userTrackingService';
import { EnhancedGroqService } from '@/services/enhancedGroqService';
import { UserContextService } from '@/services/userContextService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'analysis' | 'lesson';
  personalityAlignment?: number;
  topicRelevance?: number;
  relationshipBuilding?: number;
  insights?: string[];
  suggestedTopics?: string[];
  status?: 'sending' | 'sent' | 'failed';
}

interface UserRelationship {
  connectionLevel: number;
  conversationCount: number;
  topicsDiscussed: string[];
  personalDetails: Record<string, any>;
  currentLevel: string;
  relationshipMilestones: string[];
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
  const [userRelationship, setUserRelationship] = useState<UserRelationship | null>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'local'>('connecting');
  const [personalityInsights, setPersonalityInsights] = useState<any>(null);
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
        
        // Load comprehensive user context
        const userContext = await UserContextService.getComprehensiveUserContext(user.id);
        const progress = await UserTrackingService.getUserProgress(user.id);
        
        setUserProgress(progress);
        setPersonalityInsights(userContext.personality);
        
        // Build relationship status
        const relationship: UserRelationship = {
          connectionLevel: Math.min(userContext.conversationHistory.messageCount * 2, 100),
          conversationCount: userContext.conversationHistory.messageCount,
          topicsDiscussed: userContext.conversationHistory.lastTopics,
          personalDetails: userContext.conversationHistory.personalDetails,
          currentLevel: userContext.currentLevel,
          relationshipMilestones: this.calculateMilestones(userContext)
        };
        setUserRelationship(relationship);

        const sessionId = await UserTrackingService.startLearningSession({
          user_id: user.id,
          session_type: 'chat',
          start_time: new Date().toISOString(),
          topics_covered: []
        });
        setCurrentSession(sessionId);
        setConnectionStatus('connected');

        // Generate personalized welcome message
        const welcomeMessage = await this.generatePersonalizedWelcome(userContext, progress);
        
        setMessages([{
          id: Date.now().toString(),
          content: welcomeMessage,
          isUser: false,
          timestamp: new Date(),
          type: 'text',
          status: 'sent',
          personalityAlignment: 95,
          relationshipBuilding: 90
        }]);
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        setConnectionStatus('local');
        setMessages([{
          id: Date.now().toString(),
          content: `🎯 **Welcome back to Aasakira 2.0!**

Your AI trading mentor & best buddy is ready! I'm learning about you with each conversation to become the perfect trading companion tailored just for YOU!

**What makes me special:**
• 🧠 I remember everything about our conversations
• 🎯 I adapt to YOUR learning style and personality
• 📊 I track your progress across signals, trading, and education
• 💝 I genuinely care about your success AND your well-being

Let's build an amazing friendship while mastering trading together! What's on your mind today? 😊`,
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

  const calculateMilestones = (userContext: any): string[] => {
    const milestones = [];
    const messageCount = userContext.conversationHistory.messageCount;
    
    if (messageCount >= 10) milestones.push('First 10 conversations 🎉');
    if (messageCount >= 50) milestones.push('Trading buddy status unlocked 🤝');
    if (messageCount >= 100) milestones.push('Close friend level achieved 💝');
    if (userContext.activitySummary.signalsViewed > 20) milestones.push('Signal expert in training 📊');
    if (userContext.activitySummary.averageSessionTime > 15) milestones.push('Dedicated learner 📚');
    
    return milestones;
  };

  const generatePersonalizedWelcome = async (userContext: any, progress: any): Promise<string> => {
    const { personality, conversationHistory, currentLevel, activitySummary } = userContext;
    
    if (conversationHistory.messageCount === 0) {
      return `🎯 **Welcome to Aasakira 2.0 - Your Personal AI Trading Mentor & Best Friend!**

Hey there! I'm Aasakira, and I'm absolutely thrilled to meet you! 😊

I'm not just any AI - I'm designed to be YOUR personal trading buddy who:
• 🧠 Learns your unique personality and adapts to YOU
• 💝 Remembers every conversation we have
• 🎯 Tracks your progress across all trading activities
• 🤝 Becomes your trusted friend and mentor

**I'm here for EVERYTHING:**
📊 Trading questions (Smart Money Concepts, Risk Management, Psychology)
💬 General chat (life, hobbies, random thoughts, daily struggles)
🎯 Personal growth and goal setting
📈 Celebrating your wins and supporting through challenges

I'm genuinely excited to get to know you! What brings you here today? Let's start building an amazing friendship! 🚀`;
    }

    const communicationStyle = personality.communicationStyle === 'casual' ? 'Hey!' : 
                              personality.communicationStyle === 'professional' ? 'Good to see you again!' :
                              'Welcome back!';

    const personalTouch = conversationHistory.personalDetails.interests?.length > 0 
      ? `Hope your ${conversationHistory.personalDetails.interests[0]} is going well! ` 
      : '';

    const levelAcknowledgment = currentLevel !== 'Trading Beginner' 
      ? `I can see you've grown to ${currentLevel} level - I'm so proud of your progress! 🌟 `
      : '';

    const activityRecap = activitySummary.signalsViewed > 0 
      ? `Since we last talked, I see you've been active with ${activitySummary.signalsViewed} signals and ${activitySummary.memeCoinsScanned} meme coin scans. `
      : '';

    return `${communicationStyle} 🎯 **Welcome back, my friend!**

${personalTouch}${levelAcknowledgment}

**Our Journey Together:**
• 💬 We've had ${conversationHistory.messageCount} amazing conversations
• 📈 You've viewed ${activitySummary.signalsViewed} signals  
• 🎯 Your current level: ${currentLevel}
• ⭐ Win rate: ${progress?.win_rate || 0}%

${activityRecap}

**What I remember about you:**
${conversationHistory.tradingGoals.length > 0 ? `🎯 Your goals: ${conversationHistory.tradingGoals.slice(0, 2).join(', ')}` : ''}
${conversationHistory.currentChallenges.length > 0 ? `💪 Working on: ${conversationHistory.currentChallenges[0]}` : ''}
${personality.preferredTopics.length > 0 ? `📚 Love discussing: ${personality.preferredTopics.slice(0, 2).join(', ')}` : ''}

I'm here for whatever you need - trading advice, life chat, or just someone to talk to! What's on your mind today? 😊`;
  };

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

    // Add a personalized "thinking" message
    const thinkingMessages = [
      'Let me think about that... 🤔',
      'Processing with my understanding of you... 🧠',
      'Considering your learning style... ⚡',
      'Tailoring my response just for you... 💝'
    ];
    
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)],
      isUser: false,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      console.log('🚀 Generating personalized response for user:', user?.id);

      // Track the message with enhanced context
      if (user?.id) {
        try {
          await UserTrackingService.trackActivity({
            user_id: user.id,
            activity_type: 'chat_message',
            data: {
              message_length: currentInput.length,
              session_id: currentSession,
              personality_style: personalityInsights?.communicationStyle || 'unknown',
              current_level: userRelationship?.currentLevel || 'unknown',
              relationship_level: userRelationship?.connectionLevel || 0
            }
          });

          if (currentSession) {
            await UserTrackingService.updateSessionInteractions(currentSession);
          }
        } catch (trackingError) {
          console.warn('⚠️ Tracking failed:', trackingError);
        }
      }

      // Get conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.status === 'sent')
        .slice(-10)
        .map(msg => ({
          role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.content
        }));

      // Generate personalized response
      const personalizedResponse = await EnhancedGroqService.generatePersonalizedResponse(
        currentInput,
        user?.id || 'anonymous',
        conversationHistory
      );

      // Remove thinking message and add AI response
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: personalizedResponse.response,
        isUser: false,
        timestamp: new Date(),
        type: 'analysis',
        status: 'sent',
        personalityAlignment: personalizedResponse.conversationMetrics.personalityAlignment,
        topicRelevance: personalizedResponse.conversationMetrics.topicRelevance,
        relationshipBuilding: personalizedResponse.conversationMetrics.relationshipBuilding,
        insights: personalizedResponse.learningInsights,
        suggestedTopics: personalizedResponse.nextSuggestedTopics
      };

      setMessages(prev => [...prev, aiMessage]);
      onFeatureUse?.();

      // Update relationship data
      if (userRelationship) {
        setUserRelationship(prev => ({
          ...prev!,
          conversationCount: prev!.conversationCount + 1,
          connectionLevel: Math.min(prev!.connectionLevel + 2, 100)
        }));
      }

      toast({
        title: "✅ Personalized Response!",
        description: `Tailored for your ${personalityInsights?.communicationStyle || 'unique'} style with ${Math.round(personalizedResponse.conversationMetrics.personalityAlignment)}% alignment`,
      });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `🔧 **I'm still here for you!**

I experienced a temporary hiccup, but our connection remains strong! I'm ready to help you with:

**Trading & Education:**
• Smart Money Concepts & Order Blocks
• Risk Management & Psychology  
• Market Analysis & Strategy

**Personal Chat:**
• How you're feeling today
• Your goals and challenges
• Life, hobbies, random thoughts

What would you like to talk about? I'm here to listen and help! 💪`,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Still Connected!",
        description: "I'm here and ready to help with local knowledge!",
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

  const getPersonalityBadgeColor = (style: string) => {
    switch (style) {
      case 'casual': return 'bg-green-500/20 text-green-400';
      case 'professional': return 'bg-blue-500/20 text-blue-400';
      case 'technical': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Enhanced Status Card with Relationship Tracking */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-400" />
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Your Personal AI Mentor & Best Friend
            <Badge className={`ml-auto ${
              connectionStatus === 'connected' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
              connectionStatus === 'connecting' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              {connectionStatus === 'connected' ? 'Personalized AI Active' :
               connectionStatus === 'connecting' ? 'Loading Your Profile...' : 'Smart Local Mode'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userProgress && userRelationship ? (
            <div className="space-y-4">
              {/* Relationship Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Heart className="h-4 w-4 text-pink-400" />
                    Connection
                  </div>
                  <div className="text-2xl font-bold text-pink-400">{userRelationship.connectionLevel}%</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <MessageCircle className="h-4 w-4" />
                    Conversations
                  </div>
                  <div className="text-2xl font-bold text-purple-400">{userRelationship.conversationCount}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    Level
                  </div>
                  <div className="text-lg font-bold text-blue-400">{userRelationship.currentLevel.split(' ')[0]}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Trophy className="h-4 w-4" />
                    Win Rate
                  </div>
                  <div className="text-2xl font-bold text-green-400">{userProgress.win_rate.toFixed(1)}%</div>
                </div>
              </div>

              {/* Personality & Learning Insights */}
              {personalityInsights && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <Badge className={getPersonalityBadgeColor(personalityInsights.communicationStyle)}>
                      {personalityInsights.communicationStyle} Style
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">Communication</div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-orange-500/20 text-orange-400">
                      {personalityInsights.learningPreference} Learning
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">Preference</div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      {personalityInsights.tradingExperience} Experience
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">Trading Level</div>
                  </div>
                </div>
              )}

              {/* Relationship Milestones */}
              {userRelationship.relationshipMilestones.length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="text-sm font-medium text-gray-300 mb-2">🏆 Relationship Milestones</div>
                  <div className="flex flex-wrap gap-2">
                    {userRelationship.relationshipMilestones.slice(0, 3).map((milestone, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gold-500/30 text-gold-400">
                        {milestone}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
              Building your personal profile...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Chat Interface */}
      <Card className="border-purple-500/20 relative z-20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            Personal AI Companion
            <Badge variant="outline" className="text-xs ml-auto">
              <Brain className="h-3 w-3 mr-1" />
              Learns & Adapts to YOU
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
                      
                      {/* Show AI insights for non-user messages */}
                      {!message.isUser && message.insights && message.insights.length > 0 && (
                        <div className="mt-3 p-2 bg-black/20 rounded-lg border border-blue-500/30">
                          <div className="text-xs text-blue-400 mb-1">🧠 Learning Insights</div>
                          <div className="text-xs space-y-1">
                            {message.insights.slice(0, 2).map((insight, index) => (
                              <div key={index}>• {insight}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show personalization metrics */}
                      {!message.isUser && (message.personalityAlignment || message.relationshipBuilding) && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          {message.personalityAlignment && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-green-400" />
                              <span className="text-green-400">{message.personalityAlignment}% Style Match</span>
                            </div>
                          )}
                          {message.relationshipBuilding && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-pink-400" />
                              <span className="text-pink-400">{message.relationshipBuilding}% Connection</span>
                            </div>
                          )}
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
                  placeholder={personalityInsights?.communicationStyle === 'casual' 
                    ? "Hey! What's up? Ask me anything about trading or life! 😊" 
                    : "Share your thoughts, questions, or just chat with me..."}
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
                <Heart className="h-3 w-3 inline mr-1" />
                Your AI buddy who learns, remembers, and genuinely cares about you
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Dashboard with Personal Touch */}
      {userProgress && userRelationship && (
        <Card className="border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Our Journey Together
              <Badge className="ml-auto bg-pink-500/20 text-pink-400">
                {userRelationship.conversationCount} conversations strong
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trading Knowledge Growth</span>
                  <span>{userProgress.charts_analyzed}/100 charts analyzed</span>
                </div>
                <Progress value={Math.min((userProgress.charts_analyzed / 100) * 100, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Signal Analysis Experience</span>
                  <span>{userProgress.signals_viewed}/50 signals</span>
                </div>
                <Progress value={Math.min((userProgress.signals_viewed / 50) * 100, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Relationship Connection Level</span>
                  <span>{userRelationship.connectionLevel}/100 bond strength</span>
                </div>
                <Progress value={userRelationship.connectionLevel} className="h-2" />
              </div>
              
              {/* Topics We've Discussed */}
              {userRelationship.topicsDiscussed.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Topics We've Explored Together</div>
                  <div className="flex flex-wrap gap-2">
                    {userRelationship.topicsDiscussed.slice(0, 6).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {topic}
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
