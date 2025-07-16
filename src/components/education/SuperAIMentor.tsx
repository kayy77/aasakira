
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedGroqService } from '@/services/enhancedGroqService';
import { userContextService } from '@/services/userContextService';
import { Loader2 } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface SuperAIMentorProps {
  onFeatureUse?: () => void;
}

export const SuperAIMentor: React.FC<SuperAIMentorProps> = ({ onFeatureUse }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);

    onFeatureUse?.();

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

  const avatarStyle = {
    width: '30px',
    height: '30px'
  };

  return (
    <Card className="h-full flex flex-col glass-card">
      <CardHeader>
        <CardTitle className="text-md font-semibold">
          Super AI Trading Mentor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col space-y-4 p-3">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-row items-start">
                  {message.role === 'assistant' && (
                    <Avatar style={avatarStyle} className="mr-2">
                      <AvatarImage src="/ai-mentor.png" alt="AI Mentor" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 text-sm w-64 md:w-96 ${message.role === 'user' ? 'bg-blue-500/20 text-right' : 'bg-gray-800/40'}`}>
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <Avatar style={avatarStyle} className="ml-2">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.user_metadata?.full_name || "User"} />
                      <AvatarFallback>{user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || 'US'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row items-start">
                  <Avatar style={avatarStyle} className="mr-2">
                    <AvatarImage src="/ai-mentor.png" alt="AI Mentor" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 text-sm w-64 md:w-96 bg-gray-800/40">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="w-full flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
