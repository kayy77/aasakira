
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center relative">
        <Bot className="w-4 h-4" />
        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
      </div>
      <div className="bg-white/10 border border-white/20 p-4 rounded-lg">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
