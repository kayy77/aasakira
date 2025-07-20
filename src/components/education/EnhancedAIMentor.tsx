
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Brain, 
  Send, 
  Sparkles, 
  Target, 
  TrendingUp, 
  BookOpen,
  MessageSquare,
  Crown,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiEducationService } from '@/services/geminiEducationService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  topic?: string;
}

const EnhancedAIMentor = () => {
  const { user } = useAuth();
  const { subscription, usageStats, checkUsageLimit, incrementUsage } = useSubscription();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mentorPersonality, setMentorPersonality] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const dailyLimit = subscription?.tier === 'premium' ? 50 : 3;
  const mentorUsage = usageStats?.mentor_messages || 0;
  const canSendMessage = mentorUsage < dailyLimit;

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: `Hi! I'm your AI Trading Mentor. I'm here to help you master forex trading with personalized guidance. What would you like to learn today?

Some topics I can help with:
• Market analysis and chart reading
• Risk management strategies
• Trading psychology and discipline
• Technical indicators and patterns
• Smart Money Concepts (SMC)
• Trade planning and execution

What's your current experience level?`,
        timestamp: new Date(),
        topic: 'welcome'
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    if (!canSendMessage) {
      toast({
        title: "Daily Limit Reached",
        description: `You've used ${mentorUsage}/${dailyLimit} AI mentor messages today. Upgrade to Premium for unlimited access.`,
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Increment usage
      await incrementUsage('mentor_messages');

      const response = await geminiEducationService.generateEducationalResponse({
        question: inputMessage,
        userLevel: mentorPersonality,
        context: messages.slice(-5).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })),
        focusArea: 'trading'
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        topic: response.topic
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show upgrade prompt for free users after 2 messages
      if (subscription?.tier !== 'premium' && mentorUsage >= 2) {
        setTimeout(() => {
          toast({
            title: "🔥 Unlock Unlimited AI Mentoring",
            description: "Get unlimited AI mentor messages, advanced strategies, and personalized learning paths with Premium!",
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "AI Mentor Unavailable",
        description: "Please try again in a moment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "How do I read candlestick patterns?",
    "What's the best risk management strategy?",
    "Explain Smart Money Concepts",
    "How to identify market structure?",
    "What are the best trading sessions?",
    "How to manage trading psychology?"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/20">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white">AI Trading Mentor</CardTitle>
                <p className="text-gray-400 text-sm">Your personal trading coach</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                {mentorUsage}/{dailyLimit} messages used
              </Badge>
              {subscription?.tier !== 'premium' && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade for Unlimited
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mentor Personality Selector */}
      <Card className="glass-card border-gray-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Mentor Level:</span>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <Button
                  key={level}
                  onClick={() => setMentorPersonality(level)}
                  variant={mentorPersonality === level ? 'default' : 'outline'}
                  size="sm"
                  className={mentorPersonality === level ? 'bg-purple-600' : ''}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                      <span className="text-gray-400 text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2 mb-3">
              <Input
                placeholder={canSendMessage ? "Ask your trading question..." : "Daily limit reached - upgrade for unlimited access"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!canSendMessage || isLoading}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!canSendMessage || !inputMessage.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {!canSendMessage ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Quick Questions */}
            <div className="flex flex-wrap gap-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    setInputMessage(question);
                    handleSendMessage();
                  }}
                  variant="outline"
                  size="sm"
                  disabled={!canSendMessage || isLoading}
                  className="text-xs border-gray-600 hover:border-purple-500"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats for Free Users */}
      {subscription?.tier !== 'premium' && (
        <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300">
                  {mentorUsage}/{dailyLimit} daily AI mentor messages used
                </span>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade for Unlimited
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAIMentor;
