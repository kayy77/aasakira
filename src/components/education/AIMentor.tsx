
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import QuickStartSection from './QuickStartSection';
import ChatInterface from './ChatInterface';
import { useAIResponses } from './useAIResponses';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { useAuth } from '@/contexts/AuthContext';

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
  const { canUseFeature, incrementUsage, usageToday, dailyLimits, isPremium } = useSubscription();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Welcome to Aasakira 2.0 — Your Personal AI Trading Mentor ✨\n\nI'm powered by Google's Gemini AI and designed to guide YOU specifically from beginner to professional trader!\n\n🎯 **What Makes Me Different:**\n• I remember your progress and adapt to your learning style\n• I teach proven strategies: Breakout+Retest, Trend Continuation, Smart Money Concepts\n• I explain the 'WHY' behind every trade, not just rules\n• I build your skills systematically for consistent profitability\n\nReady to start your personalized trading journey? Tell me about your current experience level and what you want to achieve! 📈",
      isUser: false,
      timestamp: new Date(),
      isGeminiPowered: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!canUseFeature('aiMentorMessages')) {
      setShowUpgrade(true);
      return;
    }

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
      // Pass user ID for personalization
      const aiResponse = await generateAIResponse(currentMessage, user?.id);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        isGeminiPowered: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
      incrementUsage('aiMentorMessages');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickStart = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const remainingMessages = dailyLimits.aiMentorMessages - usageToday.aiMentorMessages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center space-x-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
          
          {!isPremium && (
            <div className="text-right">
              <p className="text-sm text-purple-400">
                {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} remaining today
              </p>
              <button 
                onClick={() => setShowUpgrade(true)}
                className="text-xs text-gray-400 hover:text-purple-300 underline"
              >
                Upgrade for unlimited personalized guidance
              </button>
            </div>
          )}
        </div>
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

      <PremiumUpgrade open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
};

export default AIMentor;
