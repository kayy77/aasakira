
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { eliteGroqService } from '@/services/eliteGroqService';
import { 
  Brain, 
  MessageSquare, 
  Loader2, 
  Crown,
  Zap,
  Settings,
  Target,
  TrendingUp
} from "lucide-react";

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  severity?: 'tactical' | 'warning' | 'correction' | 'analysis';
}

interface EnhancedAIMentorProps {
  onFeatureUse?: () => void;
}

const EnhancedAIMentor: React.FC<EnhancedAIMentorProps> = ({ onFeatureUse }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mentorMode, setMentorMode] = useState<'elite' | 'standard'>('elite');
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    onFeatureUse?.();
    
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (user?.id && mentorMode === 'elite') {
        const response = await eliteGroqService.generateEliteResponse(
          input,
          user.id
        );
        
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.response,
          severity: response.severity
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback for standard mode or non-authenticated users
        const fallbackResponse = "Elite systems require authentication. Sign in for tactical analysis.";
        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: fallbackResponse
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "System Error",
        description: "Elite mentor temporarily offline. Retry connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }

    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">WARNING</Badge>;
      case 'correction':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">CORRECTION</Badge>;
      case 'analysis':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">ANALYSIS</Badge>;
      default:
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">TACTICAL</Badge>;
    }
  };

  const getSeverityBorder = (severity?: string) => {
    switch (severity) {
      case 'warning': return 'border-l-4 border-l-yellow-500';
      case 'correction': return 'border-l-4 border-l-red-500';
      case 'analysis': return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-purple-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Elite Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/30 to-black/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-gold-400">
              <AvatarImage src="/images/elite-mentor.png" alt="Elite Mentor" />
              <AvatarFallback className="bg-purple-900 text-gold-400 font-bold">AA</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold-400" />
              Aasakira Elite
            </h2>
            <p className="text-xs text-gray-400">Tactical Trading Strategist</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setMentorMode(mentorMode === 'elite' ? 'standard' : 'elite')}
            variant="outline"
            size="sm"
            className={`border-purple-500/30 text-purple-400 hover:bg-purple-500/20 ${
              mentorMode === 'elite' ? 'bg-purple-500/20' : ''
            }`}
          >
            {mentorMode === 'elite' ? <Zap className="w-4 h-4 mr-1" /> : <Brain className="w-4 h-4 mr-1" />}
            {mentorMode.toUpperCase()}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-grow overflow-y-auto p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Crown className="w-16 h-16 mx-auto mb-4 text-gold-400" />
                <h3 className="text-xl font-bold text-white mb-2">Elite Strategic Assessment</h3>
                <p className="text-gray-400 mb-4">State your framework. Show your analysis. Expect tactical precision.</p>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  <Button
                    onClick={() => setInput("Analyze my last trade setup")}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                  >
                    <Target className="w-4 h-4 mr-1" />
                    Trade Review
                  </Button>
                  <Button
                    onClick={() => setInput("What's my biggest weakness?")}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Weakness
                  </Button>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : `bg-gray-800/80 text-gray-100 ${getSeverityBorder(message.severity)}`
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && message.severity && (
                      <div className="mt-3 pt-2 border-t border-gray-600">
                        {getSeverityBadge(message.severity)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/80 text-gray-100 max-w-[85%] p-4 rounded-lg border-l-4 border-l-purple-500">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-sm">Analyzing tactical framework...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Elite Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="relative">
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mentorMode === 'elite' ? "State your analysis or framework question..." : "Ask about trading strategies..."}
            className="pr-12 bg-gray-800 text-white border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed p-2"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIMentor;
