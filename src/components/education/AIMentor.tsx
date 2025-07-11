
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import QuickStartSection from './QuickStartSection';
import ChatInterface from './ChatInterface';
import { useAIResponses } from './useAIResponses';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isGeminiPowered?: boolean;
}

const AIMentor = () => {
  const navigate = useNavigate();
  const { generateAIResponse } = useAIResponses();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Welcome to Aasakira 2.0 — Your AI Trading Mentor ✨\n\nI'm now powered by Google's Gemini AI for even more intelligent and personalized trading education!\n\nReady to level up your trading skills with advanced AI insights?\n\nAsk me anything about trading, or use our professional tools to practice what you learn.",
      isUser: false,
      timestamp: new Date(),
      isGeminiPowered: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(currentMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        isGeminiPowered: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickStart = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto mb-6">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="flex items-center space-x-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickStartSection onQuickStart={handleQuickStart} />
        
        <div className="lg:col-span-2">
          <ChatInterface
            messages={messages}
            inputMessage={inputMessage}
            isTyping={isTyping}
            onInputChange={setInputMessage}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default AIMentor;
