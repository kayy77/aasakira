
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getOpenAIService } from '@/services/enhancedOpenAIService';
import { 
  Brain, 
  MessageSquare, 
  Loader2, 
  Crown,
  Image,
  Upload,
  Camera,
  TrendingUp,
  Target,
  AlertTriangle
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

interface UserContext {
  currentStage: number;
  completedMissions: string[];
  weaknesses: string[];
  strengths: string[];
  journalEntries: number;
  avgWinRate: number;
  totalTrades: number;
}

interface EnhancedAIMentorProps {
  onFeatureUse?: () => void;
}

const EnhancedAIMentor: React.FC<EnhancedAIMentorProps> = ({ onFeatureUse }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserContext();
    }
    
    // Initial mentor message
    const welcomeMessage: Message = {
      id: Date.now(),
      role: 'assistant',
      content: `Hey there! 👋 I'm your trading mentor - think of me as your older brother in trading. I've been watching your journey and I'm here to help you grow.\n\n💡 **What I can help with:**\n• Analyze your chart screenshots\n• Give you honest advice about your trading\n• Help you understand complex concepts\n• Review your progress and suggest improvements\n\n📸 **Upload a chart** and I'll break it down for you, or just ask me anything about trading. I'm here to guide you, not judge you.\n\nWhat's on your mind today?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, [user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserContext = async () => {
    if (!user?.id) return;
    
    try {
      // Load user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Load journal entries
      const { data: trades } = await supabase
        .from('trade_journal')
        .select('*')
        .eq('user_id', user.id);
      
      if (progress && trades) {
        const winningTrades = trades.filter(t => t.pnl && t.pnl > 0);
        const avgWinRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
        
        setUserContext({
          currentStage: progress.current_stage || 1,
          completedMissions: progress.completed_missions || [],
          weaknesses: progress.weaknesses || [],
          strengths: progress.strengths || [],
          journalEntries: trades.length,
          avgWinRate,
          totalTrades: trades.length
        });
      }
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    onFeatureUse?.();
    
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input || (selectedImage ? "Please analyze this chart" : ""),
      imageUrl: selectedImage || undefined,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const openAIService = getOpenAIService();
      let response: string;
      
      if (selectedImage) {
        // Remove data URL prefix for base64
        const base64Image = selectedImage.split(',')[1];
        response = await openAIService.analyzeImage(
          base64Image,
          input || "Analyze this trading chart and provide insights on entry/exit points, patterns, and risk management"
        );
      } else {
        // Create context-aware prompt
        const contextPrompt = createContextualPrompt(input, userContext);
        response = await openAIService.generateAdvancedAnalysis(contextPrompt, userContext);
      }
      
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Connection Error",
        description: "Couldn't reach your mentor right now. Try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setInput('');
      setSelectedImage(null);
    }
  };

  const createContextualPrompt = (userInput: string, context: UserContext | null): string => {
    let prompt = `As an experienced trading mentor and older brother figure, respond to: "${userInput}"\n\n`;
    
    if (context) {
      prompt += `**Student Context:**\n`;
      prompt += `• Learning Stage: ${context.currentStage}/10\n`;
      prompt += `• Completed Missions: ${context.completedMissions.length}\n`;
      prompt += `• Trading Journal Entries: ${context.journalEntries}\n`;
      prompt += `• Win Rate: ${context.avgWinRate.toFixed(1)}%\n`;
      
      if (context.weaknesses.length > 0) {
        prompt += `• Known Weaknesses: ${context.weaknesses.join(', ')}\n`;
      }
      
      if (context.strengths.length > 0) {
        prompt += `• Strengths: ${context.strengths.join(', ')}\n`;
      }
    }
    
    prompt += `\n**Tone:** Supportive older brother who's been through the trading journey. Be honest but encouraging. Use real examples and practical advice. Keep it conversational and relatable.`;
    
    return prompt;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/30 to-black/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-purple-400">
              <AvatarImage src="/images/mentor-avatar.png" alt="Trading Mentor" />
              <AvatarFallback className="bg-purple-900 text-purple-100 font-bold text-lg">TM</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Your Trading Mentor
            </h2>
            <p className="text-sm text-gray-400">Like an older brother, but for trading</p>
          </div>
        </div>
        
        {userContext && (
          <div className="hidden md:flex items-center gap-4">
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              Stage {userContext.currentStage}/10
            </Badge>
            <Badge variant="outline" className="border-green-500/30 text-green-300">
              {userContext.avgWinRate.toFixed(0)}% Win Rate
            </Badge>
            <Badge variant="outline" className="border-blue-500/30 text-blue-300">
              {userContext.journalEntries} Trades
            </Badge>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4">
        <ScrollArea className="h-full">
          <div className="space-y-6">            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div
                    className={`rounded-xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-800/80 text-gray-100 border border-gray-700'
                    }`}
                  >
                    {message.imageUrl && (
                      <div className="mb-3">
                        <img 
                          src={message.imageUrl} 
                          alt="Uploaded chart" 
                          className="max-w-full h-auto rounded-lg border border-gray-600"
                        />
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className="mt-2 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/80 text-gray-100 max-w-[85%] p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-sm">Your mentor is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        {selectedImage && (
          <div className="mb-3 p-2 bg-gray-800 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Chart image ready to analyze</span>
              </div>
              <Button 
                onClick={() => setSelectedImage(null)}
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-gray-300"
              >
                Remove
              </Button>
            </div>
          </div>
        )}
        
        <div className="relative flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your mentor anything, or upload a chart to analyze..."
            className="flex-1 bg-gray-800 text-white border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500 pr-20"
            disabled={isLoading}
          />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
            disabled={isLoading}
          >
            <Camera className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={sendMessage}
            className="bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6"
            disabled={isLoading || (!input.trim() && !selectedImage)}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-900/30 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button
            onClick={() => setInput("What are my biggest weaknesses right now?")}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            My Weaknesses
          </Button>
          <Button
            onClick={() => setInput("How can I improve my win rate?")}
            variant="outline"
            size="sm"
            className="border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Improve Performance
          </Button>
          <Button
            onClick={() => setInput("Review my recent trading journal entries")}
            variant="outline"
            size="sm"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs"
          >
            <Target className="w-3 h-3 mr-1" />
            Review Trades
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIMentor;
