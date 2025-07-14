
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
  HelpCircle,
  Send,
  Sparkles
} from 'lucide-react';
import { improvedAIService, AIResponse, ChatMessage } from '@/services/improvedAIService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  hasChart?: boolean;
  chartUrl?: string;
  followUpActions?: string[];
}

const EnhancedAICoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 'welcome',
        type: 'ai',
        content: "👋 Welcome! I'm Aasakira, your AI trading mentor. I specialize in Smart Money Concepts, institutional trading, and professional market analysis.\n\n🎯 I'm here to help you master:\n• Order Blocks & Market Structure\n• Risk Management & Position Sizing\n• Trading Psychology & Discipline\n• Professional Chart Analysis\n• Smart Money Concepts (SMC)\n\nWhat would you like to learn about today?",
        timestamp: new Date(),
        followUpActions: ['Explain Order Blocks', 'Teach me risk management', 'What are Smart Money Concepts?']
      }
    ]);
  }, []);

  const handleSkillLevelChange = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setSkillLevel(level);
    toast({
      title: "Skill Level Updated",
      description: `I'll now tailor my explanations for ${level} level trading.`,
    });
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('🤖 Sending message to AI:', textToSend);
      
      // Convert messages to chat format for context
      const chatContext: ChatMessage[] = messages
        .slice(-6) // Last 6 messages for context
        .map(m => ({ 
          role: m.type === 'user' ? 'user' : 'assistant', 
          content: m.content 
        }));

      const response: AIResponse = await improvedAIService.generateResponse(
        textToSend,
        skillLevel,
        chatContext
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.text,
        timestamp: new Date(),
        hasChart: response.hasChart,
        chartUrl: response.chartUrl,
        followUpActions: response.followUpActions
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.lessonCompleted) {
        toast({
          title: "Lesson Completed! 🎉",
          description: "Great job! You've mastered this concept. Ready for the next challenge?"
        });
      }

      console.log('✅ AI response received and displayed');
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having a temporary issue. Let me help you with some key trading concepts:\n\n📊 **Order Blocks**: Institutional levels where banks place large orders\n⚠️ **Risk Management**: Never risk more than 1-2% per trade\n💡 **Smart Money**: Follow institutional money flow\n\nTry asking me about any of these topics, and I'll do my best to help!",
        timestamp: new Date(),
        followUpActions: ['Explain Order Blocks', 'Risk management tips', 'What is Smart Money?']
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      
      toast({
        title: "Connection Issue",
        description: "I'm having a small hiccup, but I'm still here to help with fallback responses!",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startQuickQuiz = async () => {
    const topics = ['order blocks', 'risk management', 'liquidity sweeps', 'market structure'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    try {
      const quiz = await improvedAIService.generateQuiz(randomTopic, skillLevel === 'beginner' ? 'easy' : skillLevel === 'advanced' ? 'hard' : 'medium');
      
      const quizMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `🧠 **Quick Quiz Time!**\n\n**Topic**: ${randomTopic.charAt(0).toUpperCase() + randomTopic.slice(1)}\n\n**Question**: ${quiz.question}\n\n**Options**:\nA) ${quiz.options[0]}\nB) ${quiz.options[1]}\nC) ${quiz.options[2]}\nD) ${quiz.options[3]}\n\nTake your time and think it through!`,
        timestamp: new Date(),
        followUpActions: [`Answer: ${quiz.options[0]}`, `Answer: ${quiz.options[1]}`, `Answer: ${quiz.options[2]}`]
      };
      
      setMessages(prev => [...prev, quizMessage]);
      
      // Store correct answer for validation (in real app, this would be more secure)
      setTimeout(() => {
        const explanationMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `💡 **Correct Answer**: ${quiz.options[quiz.correctAnswer]}\n\n**Explanation**: ${quiz.explanation}\n\nWell done! Ready for another challenge?`,
          timestamp: new Date(),
          followUpActions: ['Another quiz please', 'Explain this topic more', 'Move to next topic']
        };
        setMessages(prev => [...prev, explanationMessage]);
      }, 10000); // Show answer after 10 seconds
      
    } catch (error) {
      toast({
        title: "Quiz Error",
        description: "Couldn't generate quiz right now, but feel free to ask me any trading questions!",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Skill Level Selector */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Your Trading Level
            </div>
            <Button 
              onClick={startQuickQuiz}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Zap className="w-4 h-4 mr-1" />
              Quick Quiz
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <Button
                key={level}
                onClick={() => handleSkillLevelChange(level)}
                variant={skillLevel === level ? "default" : "outline"}
                className={skillLevel === level ? "bg-purple-600" : ""}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            AI Trading Coach
            <Badge className="ml-2 bg-green-500/20 text-green-400">
              Enhanced
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-96 overflow-y-auto space-y-4 border border-gray-700 rounded-lg p-4 bg-gray-900/50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Ask me anything about trading! I provide detailed explanations with examples.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.hasChart && message.chartUrl && (
                    <div className="mt-3">
                      <div className="bg-gray-700 p-3 rounded border text-center text-sm text-gray-300">
                        📊 Chart visualization would appear here
                        <br />
                        <span className="text-xs">(Chart generation in development)</span>
                      </div>
                    </div>
                  )}
                  
                  {message.followUpActions && message.followUpActions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-400">💡 Quick actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.followUpActions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => handleFollowUpAction(action)}
                            className="text-xs hover:bg-purple-500/20 border-purple-500/30"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    <span className="text-gray-400">Aasakira is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Order Blocks, SMC, Risk Management, Psychology..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick starters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-400">Quick start:</span>
            {['Order Blocks', 'Risk Management', 'Market Structure', 'Trading Psychology'].map((topic) => (
              <Button
                key={topic}
                size="sm"
                variant="outline"
                onClick={() => handleSendMessage(`Explain ${topic}`)}
                className="text-xs border-gray-600 hover:bg-gray-700"
              >
                {topic}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAICoach;
