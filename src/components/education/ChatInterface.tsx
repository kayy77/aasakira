
import React from 'react';
import { Bot, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isGeminiPowered?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  inputMessage: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

const ChatInterface = ({ 
  messages, 
  inputMessage, 
  isTyping, 
  onInputChange, 
  onSendMessage 
}: ChatInterfaceProps) => {
  return (
    <Card className="glass-card border-purple-500/20 h-[700px] flex flex-col">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-pink-400">
            <Bot className="w-6 h-6" />
            <span>Ask Aasakira 2.0 — Your AI Mentor</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Gemini Powered</span>
            </div>
            <div className="bg-cyan-500 text-white text-xs px-3 py-1 rounded-full">
              Online
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}
      </CardContent>

      <div className="px-6 py-2 border-t border-white/10">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Powered by Gemini AI - Try:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
            <span className="bg-white/5 px-2 py-1 rounded">"What is forex?" or "How do I place a trade?"</span>
            <span className="bg-white/5 px-2 py-1 rounded">"Create a learning plan for me"</span>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask me anything about trading... (Powered by Gemini AI)"
            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
          />
          <Button
            onClick={onSendMessage}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={!inputMessage.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
