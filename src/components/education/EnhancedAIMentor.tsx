
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedGroqService } from '@/services/enhancedGroqService';
import { userContextService } from '@/services/userContextService';
import { 
  Brain, 
  MessageSquare, 
  Loader2, 
  Plus, 
  LucideIcon,
  BookOpenCheck,
  Sparkles,
  Lightbulb,
  Rocket,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Clock,
  HelpCircle,
  Settings,
  UserRoundCog,
  Coins,
  Gem,
  PiggyBank,
  Trophy,
  GraduationCap,
  FileSliders,
  FileText,
  FileCode2,
  FileHeart,
  FileLock2,
  FileSearch2,
  FileQuestion,
  FileWarning,
  FileDown,
  FileUp,
  FileJson2,
  FileKey2,
  FileTerminal,
  FileVideo2,
  FileAudio2,
  FileImage,
  FileArchive,
  FileScan,
  FileSignature,
  FileInput,
  FileCog,
  FileBadge,
  FileCheck2,
  FileX2,
  AlertTriangle,
  CheckSquare,
  Star,
  AlertCircle,
  X
} from "lucide-react";

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface EnhancedAIMentorProps {
  onFeatureUse?: () => void;
}

const EnhancedAIMentor: React.FC<EnhancedAIMentorProps> = ({ onFeatureUse }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Track feature usage
    onFeatureUse?.();
    
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Track user activity and get personalized response
      if (user?.id) {
        await userContextService.updateUserActivity(user.id, 'ai_message', { message: input });
        
        const response = await EnhancedGroqService.generatePersonalizedResponse(
          input,
          user.id,
          messages.map(msg => ({ role: msg.role, content: msg.content }))
        );
        
        if (response) {
          const assistantMessage: Message = {
            id: Date.now() + 1,
            role: 'assistant',
            content: response.response
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Store conversation memory
          await userContextService.storeConversationMemory(
            user.id,
            `User: ${input}\nAssistant: ${response.response}`,
            7
          );
        } else {
          throw new Error('No response received');
        }
      } else {
        // Fallback for non-authenticated users
        const fallbackResponse = "I'm here to help with your trading questions! Please sign in for a more personalized experience.";
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
        title: "Error",
        description: "Failed to send message. Please try again.",
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/images/ai-mentor.png" alt="AI Mentor" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-gray-900" />
          </div>
          <h2 className="text-lg font-semibold text-white">Enhanced AI Mentor</h2>
        </div>
        <Button variant="ghost" className="text-gray-400 hover:text-gray-300">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Message History */}
      <div className="flex-grow overflow-y-auto p-4">
        <ScrollArea className="h-full">
          <div className="space-y-3">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-3 w-fit max-w-[80%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="relative">
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about trading..."
            className="pr-12 bg-gray-900 text-white border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIMentor;
