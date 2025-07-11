
import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isGeminiPowered?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`flex items-start space-x-3 ${
      message.isUser ? 'flex-row-reverse space-x-reverse' : ''
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
        message.isUser 
          ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
          : 'bg-gradient-to-r from-cyan-500 to-blue-600'
      }`}>
        {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        {message.isGeminiPowered && !message.isUser && (
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
        )}
      </div>
      <div className={`max-w-[80%] p-4 rounded-lg ${
        message.isUser
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-auto'
          : 'bg-white/10 text-gray-100 border border-white/20'
      }`}>
        <div className="whitespace-pre-line text-sm leading-relaxed">
          {message.content}
        </div>
        {message.isGeminiPowered && !message.isUser && (
          <div className="flex items-center space-x-1 mt-2 text-xs text-yellow-400">
            <Sparkles className="w-3 h-3" />
            <span>Enhanced by Gemini AI</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
