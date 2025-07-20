import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Send, 
  Sparkles, 
  Target, 
  TrendingUp,
  User,
  Bot,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface UserProgressData {
  total_study_time_minutes: number;
  win_rate: number;
  current_streak: number;
  skills_mastered: string[];
}

const EnhancedAIMentor = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUserProgress();
      loadChatHistory();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user progress:', error);
        return;
      }

      setUserProgress(data || {
        total_study_time_minutes: 0,
        win_rate: 0,
        current_streak: 0,
        skills_mastered: []
      });
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .select('*')
        .eq('user_id', user.id)
        .eq('memory_type', 'chat_message')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      if (data) {
        const chatMessages = data.map(item => ({
          id: item.id,
          text: item.content,
          isUser: item.context?.isUser || false,
          timestamp: new Date(item.created_at)
        }));
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* User Progress Summary */}
      {userProgress && (
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-purple-400" />
              Your Trading Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.floor(userProgress.total_study_time_minutes / 60)}h
                </div>
                <div className="text-sm text-gray-400">Study Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {userProgress.win_rate?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {userProgress.current_streak || 0}
                </div>
                <div className="text-sm text-gray-400">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {userProgress.skills_mastered?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Skills Mastered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <Card className="glass-card border-purple-500/20 h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Trading Mentor
            <Badge className="bg-purple-500/20 text-purple-400">Enhanced</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.isUser ? (
                        <User className="w-4 h-4 mt-1" />
                      ) : (
                        <Bot className="w-4 h-4 mt-1 text-purple-400" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about trading..."
              className="flex-1 min-h-[60px] bg-gray-800/50 border-gray-600"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  async function handleSendMessage() {
    if (!input.trim() || isLoading || !user) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase.from('ai_memory').insert({
        user_id: user.id,
        memory_type: 'chat_message',
        content: userMessage.text,
        context: { isUser: true }
      });

      // Generate AI response (simplified for now)
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about: "${userMessage.text}". As your AI mentor, I'm here to help you learn trading. Let me provide some guidance...`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

      // Save AI response to database
      await supabase.from('ai_memory').insert({
        user_id: user.id,
        memory_type: 'chat_message',
        content: aiResponse.text,
        context: { isUser: false }
      });

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }
};

export default EnhancedAIMentor;
