import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  User, 
  TrendingUp, 
  Brain, 
  Target, 
  BookOpen,
  Lightbulb,
  MessageCircle,
  Zap,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { improvedAIService } from '@/services/improvedAIService';
import TypingIndicator from './TypingIndicator';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'quiz' | 'visual';
}

interface UserProgress {
  level: number;
  xp: number;
  streak: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  weaknesses: string[];
  strengths: string[];
}

const BuddyAIMentor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    streak: 0,
    skillLevel: 'beginner',
    learningGoals: ['Technical Analysis', 'Risk Management'],
    weaknesses: ['Chart Reading', 'Psychology'],
    strengths: ['Quick Learning']
  });
  const [mentorPersonality, setMentorPersonality] = useState('friendly');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Welcome message based on user progress
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: getPersonalizedWelcome(),
      timestamp: new Date(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPersonalizedWelcome = () => {
    const greetings = [
      `Hey there, trading warrior! 🚀 I'm Aasakira, your personal AI mentor. I see you're level ${userProgress.level} - let's level up together!`,
      `What's up, future trading legend! 💫 Ready to turn those charts into profit? I'm here to guide you every step of the way.`,
      `Hello, my trading apprentice! 🌟 I've been analyzing the markets all night - got some killer insights to share with you!`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const generateMentorResponse = async (userMessage: string) => {
    try {
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const contextualPrompt = `
        User Profile: Level ${userProgress.level}, ${userProgress.skillLevel} trader
        Current Goals: ${userProgress.learningGoals.join(', ')}
        Known Weaknesses: ${userProgress.weaknesses.join(', ')}
        Strengths: ${userProgress.strengths.join(', ')}
        Current Streak: ${userProgress.streak} days
        
        As Aasakira, their buddy AI mentor, respond with personality and encouragement.
        Use emojis, trading slang, and make it personal. Always remember their progress.
        If they ask about trading concepts, explain in their skill level.
        If they seem stuck, offer specific actionable advice.
        Be motivational but realistic about trading risks.
        
        User Message: ${userMessage}
      `;

      const response = await improvedAIService.generateResponse(
        contextualPrompt,
        userProgress.skillLevel,
        chatHistory
      );

      return response.text;
    } catch (error) {
      console.error('Error generating mentor response:', error);
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = (userMessage: string) => {
    const fallbacks = [
      "I'm having a brain freeze 🧠❄️ but let me share this: The best traders aren't the ones who never lose, they're the ones who learn from every trade!",
      "Connection hiccup! 📡 But here's a golden nugget: Risk management isn't just about stop losses - it's about position sizing and emotional control too!",
      "My circuits are a bit foggy 🤖💭 but remember: The market rewards patience and punishes greed. What specific aspect of trading are you struggling with?",
      "Technical difficulties on my end! ⚡ But I always tell my students: Focus on process over profit. Good trades with bad outcomes are still good trades!"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate realistic typing delay
    setTimeout(async () => {
      try {
        const mentorResponse = await generateMentorResponse(input);
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: mentorResponse,
          timestamp: new Date(),
          type: 'text'
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Update user progress
        setUserProgress(prev => ({
          ...prev,
          xp: prev.xp + 10,
          streak: prev.streak + (Math.random() > 0.7 ? 1 : 0)
        }));

      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Connection Error",
          description: "Unable to send message. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsTyping(false);
      }
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What's the biggest mistake new traders make?",
    "How do I read candlestick patterns?",
    "What's your take on risk management?",
    "Can you explain support and resistance?",
    "How do I control my emotions when trading?"
  ];

  const getMessageIcon = (role: string) => {
    return role === 'user' ? (
      <User className="w-4 h-4" />
    ) : (
      <Bot className="w-4 h-4 text-purple-400" />
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mentor Status & Progress */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-purple-400" />
            🧠 Aasakira - Your AI Trading Buddy
            <Heart className="w-4 h-4 text-red-400 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-purple-400 font-bold text-lg">{userProgress.level}</div>
              <div className="text-gray-400">Level</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">{userProgress.xp}</div>
              <div className="text-gray-400">XP</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">{userProgress.streak}</div>
              <div className="text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 capitalize">
                {userProgress.skillLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader className="border-b border-gray-700/50">
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Chat with Aasakira
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Online</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {getMessageIcon(message.role)}
                  </div>
                  
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500/20 text-white'
                        : 'bg-gray-700/50 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t border-gray-700/50">
              <p className="text-sm text-gray-400 mb-3">💡 Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(question)}
                    className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Aasakira anything about trading..."
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-green-400" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Current Goals
              </h4>
              <div className="space-y-2">
                {userProgress.learningGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-gray-300 text-sm">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Working On
              </h4>
              <div className="space-y-2">
                {userProgress.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-gray-300 text-sm">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuddyAIMentor;