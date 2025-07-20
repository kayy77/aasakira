
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Upload, Brain, User, Lightbulb, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

const EnhancedAIMentor = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Trading Mentor. I can help you learn trading concepts, analyze charts, and answer any trading questions you have. Feel free to upload chart images for analysis or ask me anything about trading!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string, imageUrl?: string) => {
    // Simulate AI responses for demo
    const responses = [
      "Great question! Let me explain that concept in detail...",
      "Looking at your chart, I can see several key technical indicators...",
      "This is a fundamental trading principle. Here's what you need to know...",
      "Based on your question, I recommend focusing on these key areas...",
      "That's an excellent observation! Let me build on that..."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !fileInputRef.current?.files?.[0]) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    // Handle image upload
    let imageUrl = '';
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      // For demo, we'll just create a URL for the image
      imageUrl = URL.createObjectURL(file);
      userMessage.imageUrl = imageUrl;
    }

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      // Save user activity
      if (user) {
        await supabase.from('user_activities').insert({
          user_id: user.id,
          activity_type: 'ai_mentor_message',
          data: { message: inputValue, has_image: !!imageUrl }
        });
      }

      const aiResponse = await generateAIResponse(inputValue, imageUrl);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "How do I read candlestick patterns?",
    "What is risk management?",
    "Explain support and resistance",
    "How to use moving averages?"
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Trading Mentor</h3>
              <p className="text-sm text-gray-400">Your personal trading assistant</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400">Online</Badge>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(prompt)}
              className="text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.isUser ? 'order-2' : ''}`}>
                <Card className={`${
                  message.isUser 
                    ? 'bg-purple-600 border-purple-500' 
                    : 'bg-gray-800 border-gray-700'
                }`}>
                  <CardContent className="p-3">
                    {message.imageUrl && (
                      <img 
                        src={message.imageUrl} 
                        alt="Uploaded chart" 
                        className="max-w-full h-auto rounded mb-2"
                      />
                    )}
                    <p className="text-sm text-white">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {message.isUser && (
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span className="text-sm text-gray-400 ml-2">AI is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={() => {
              if (fileInputRef.current?.files?.[0]) {
                toast({
                  title: "Image selected",
                  description: "Image ready to send with your message"
                });
              }
            }}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="px-3"
          >
            <Upload className="w-4 h-4" />
          </Button>
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your trading mentor anything..."
            className="flex-1 bg-gray-800 border-gray-600 text-white"
            disabled={isLoading}
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !fileInputRef.current?.files?.[0]) || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIMentor;
