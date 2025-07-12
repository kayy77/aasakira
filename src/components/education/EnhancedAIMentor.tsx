
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen, Target, TrendingUp, Star, Award } from 'lucide-react';
import ChatInterface from './ChatInterface';
import ProgressChart from './ProgressChart';
import ImageUpload from './ImageUpload';
import { useMentorMemory } from './MentorMemory';
import { useSubscription } from '@/contexts/SubscriptionContext';

const EnhancedAIMentor = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'progress' | 'analysis'>('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const { userProgress, updateProgress, getPersonalizedContent } = useMentorMemory();
  const { canUseFeature, incrementUsage } = useSubscription();

  useEffect(() => {
    // Initialize with personalized welcome message
    const personalizedContent = getPersonalizedContent();
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Welcome back! Based on your ${userProgress.level} level and progress, here's what we should focus on today:\n\n${personalizedContent.slice(0, 3).map(item => `• ${item}`).join('\n')}\n\nWhat would you like to work on first?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, [userProgress.level]);

  const handleSendMessage = async (message: string) => {
    if (!canUseFeature('mentorMessages')) {
      return;
    }

    incrementUsage('mentorMessages');

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Enhanced AI response with memory context
    setTimeout(() => {
      const aiResponse = generatePersonalizedResponse(message, userProgress);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  const generatePersonalizedResponse = (message: string, progress: typeof userProgress): string => {
    const lowerMessage = message.toLowerCase();
    
    // Context-aware responses based on user's level and history
    if (lowerMessage.includes('risk') || lowerMessage.includes('management')) {
      if (progress.level === 'Beginner') {
        return `Great question about risk management! Since you're at the ${progress.level} level, let's start with the fundamentals:\n\n• **2% Rule**: Never risk more than 2% of your account on a single trade\n• **Position Sizing**: Calculate your position size before entering any trade\n• **Stop Losses**: Always set your stop loss BEFORE entering a position\n\n**Your personalized tip**: I notice you haven't completed the risk management basics yet. Would you like me to create a custom lesson plan for you?`;
      } else {
        return `Excellent! As an ${progress.level} trader, you're ready for advanced risk management:\n\n• **Kelly Criterion**: Optimize position sizing based on win rate and average R:R\n• **Portfolio Heat**: Monitor total risk across all open positions\n• **Correlation Risk**: Avoid taking multiple trades on correlated pairs\n\n**Based on your progress**: You've mastered the basics. Let's work on portfolio-level risk management next.`;
      }
    }

    if (lowerMessage.includes('strategy') || lowerMessage.includes('trading plan')) {
      const tradingStyle = progress.tradingStyle || 'Day Trader';
      return `Perfect timing! Let's build a strategy that matches your ${tradingStyle} style:\n\n**For ${tradingStyle}s like you:**\n• **Timeframes**: Focus on 15M-1H charts for entries\n• **Session Focus**: ${tradingStyle === 'Scalper' ? 'London/NY overlap' : 'Major sessions with high volatility'}\n• **Risk-Reward**: Target minimum 1:2 R:R ratios\n\n**Personalized for you**: Based on your ${progress.level} level, I recommend starting with 1-2 setups you can master completely. Quality over quantity!`;
    }

    if (lowerMessage.includes('psychology') || lowerMessage.includes('emotions')) {
      return `Trading psychology is crucial, especially at your ${progress.level} level! Here's what I recommend:\n\n• **Journaling**: Track your emotional state for each trade\n• **Meditation**: Just 5 minutes daily can improve decision-making\n• **Acceptance**: Losses are part of the game - focus on process over profits\n\n**Your personal challenge**: Try keeping an emotion log for the next 10 trades. Rate your confidence and fear levels 1-10 before each trade.`;
    }

    // Default personalized response
    return `That's a great question! As a ${progress.level} trader with ${progress.completedLessons.length} completed lessons, here's my personalized advice:\n\n${getPersonalizedContent().slice(0, 2).map(item => `• ${item}`).join('\n')}\n\nRemember, consistent progress beats perfection. You're doing great - keep building on what you've learned!\n\nWhat specific aspect would you like to dive deeper into?`;
  };

  const handleImageAnalysis = (analysis: string) => {
    const analysisMessage = {
      id: Date.now(),
      type: 'ai',
      content: `📊 **Chart Analysis Complete:**\n\n${analysis}\n\n**Personalized Note**: Based on your ${userProgress.level} level, ${userProgress.level === 'Beginner' ? 'focus on understanding the pattern first before risking real money' : 'this looks like a solid setup that matches your trading style'}. \n\nWould you like me to explain any part of this analysis in more detail?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, analysisMessage]);
  };

  const tabs = [
    { id: 'chat', label: 'AI Mentor', icon: Brain },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'analysis', label: 'Chart Analysis', icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* User Progress Summary */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Trading Mentor</h3>
                <p className="text-gray-400">Personalized guidance for your trading journey</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {userProgress.level}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Lessons Completed</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{userProgress.completedLessons.length}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Strengths</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{userProgress.strengths.length}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Active Goals</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">{userProgress.goals.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className={`flex-1 ${
              activeTab === tab.id 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <ChatInterface 
          messages={messages}
          onSendMessage={handleSendMessage}
          placeholder="Ask me anything about trading, strategies, risk management..."
        />
      )}

      {activeTab === 'progress' && <ProgressChart />}

      {activeTab === 'analysis' && (
        <ImageUpload onImageAnalysis={handleImageAnalysis} />
      )}
    </div>
  );
};

export default EnhancedAIMentor;
