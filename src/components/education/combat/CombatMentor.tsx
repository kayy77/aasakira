
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageSquare, 
  Lightbulb,
  Eye,
  Zap,
  AlertTriangle,
  TrendingUp,
  Target
} from 'lucide-react';

interface CombatMentorProps {
  currentPrice: number;
  priceHistory: Array<{ price: number; direction: 'up' | 'down'; strength: string; timestamp: number }>;
  playerPrediction?: 'up' | 'down';
  timeRemaining: number;
  userStrengths: string[];
  userWeaknesses: string[];
}

interface MentorMessage {
  id: string;
  type: 'insight' | 'warning' | 'encouragement' | 'education';
  message: string;
  timestamp: number;
  icon: React.ComponentType<any>;
  color: string;
}

const CombatMentor = ({
  currentPrice,
  priceHistory,
  playerPrediction,
  timeRemaining,
  userStrengths,
  userWeaknesses
}: CombatMentorProps) => {
  const [mentorMessages, setMentorMessages] = useState<MentorMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateAIInsight = (): MentorMessage => {
    const insights = [
      {
        type: 'insight' as const,
        message: "Price is testing the 20-period moving average. Watch for a decisive break or bounce.",
        icon: Eye,
        color: 'text-blue-400'
      },
      {
        type: 'warning' as const,
        message: "High volatility detected! This could be a fake-out. Wait for confirmation.",
        icon: AlertTriangle,
        color: 'text-orange-400'
      },
      {
        type: 'education' as const,
        message: "This is a classic 'spring' pattern - price dips below support then quickly recovers.",
        icon: Lightbulb,
        color: 'text-yellow-400'
      },
      {
        type: 'encouragement' as const,
        message: "Great patience! You're waiting for proper confirmation before entering.",
        icon: Target,
        color: 'text-green-400'
      }
    ];

    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    return {
      id: Date.now().toString(),
      ...randomInsight,
      timestamp: Date.now()
    };
  };

  const analyzeMarketCondition = () => {
    if (priceHistory.length < 2) return;

    const latest = priceHistory[priceHistory.length - 1];
    const previous = priceHistory[priceHistory.length - 2];
    
    // Generate context-aware insights
    let contextMessage = "";
    let messageType: 'insight' | 'warning' | 'education' = 'insight';
    let messageColor = 'text-blue-400';
    let messageIcon = Eye;

    if (latest.strength === 'strong' && latest.direction === 'up') {
      contextMessage = "Strong bullish momentum! This could be the start of a bigger move up.";
      messageType = 'insight';
      messageColor = 'text-green-400';
      messageIcon = TrendingUp;
    } else if (latest.strength === 'strong' && latest.direction === 'down') {
      contextMessage = "Heavy selling pressure detected. Bears are in control right now.";
      messageType = 'warning';
      messageColor = 'text-red-400';
      messageIcon = AlertTriangle;
    } else if (Math.abs(latest.price - previous.price) < 0.001) {
      contextMessage = "Market is consolidating. Often the calm before the storm - stay alert!";
      messageType = 'education';
      messageColor = 'text-yellow-400';
      messageIcon = Lightbulb;
    }

    if (contextMessage) {
      const newMessage: MentorMessage = {
        id: Date.now().toString(),
        type: messageType,
        message: contextMessage,
        timestamp: Date.now(),
        icon: messageIcon,
        color: messageColor
      };

      setMentorMessages(prev => [...prev.slice(-2), newMessage]); // Keep only last 3 messages
    }
  };

  const providePredictionFeedback = () => {
    if (!playerPrediction) return;

    const feedbackMessages = [
      {
        up: "You chose UP. Smart money often buys at these levels. Let's see if the bulls agree!",
        down: "You predicted DOWN. The bears seem to be gathering strength here."
      }
    ];

    const feedback = playerPrediction === 'up' ? feedbackMessages[0].up : feedbackMessages[0].down;
    
    const feedbackMessage: MentorMessage = {
      id: `feedback-${Date.now()}`,
      type: 'insight',
      message: feedback,
      timestamp: Date.now(),
      icon: Brain,
      color: 'text-purple-400'
    };

    setMentorMessages(prev => [...prev.slice(-2), feedbackMessage]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnalyzing(true);
      setTimeout(() => {
        analyzeMarketCondition();
        setIsAnalyzing(false);
      }, 1000);
    }, 8000); // Every 8 seconds

    return () => clearInterval(interval);
  }, [priceHistory]);

  useEffect(() => {
    if (playerPrediction) {
      setTimeout(() => {
        providePredictionFeedback();
      }, 1500);
    }
  }, [playerPrediction]);

  const getPersonalizedAdvice = () => {
    if (userWeaknesses.includes('Risk Management')) {
      return "Remember: Never risk more than 2% of your account on any single trade.";
    }
    if (userWeaknesses.includes('News Trading')) {
      return "Economic news in 15 minutes. Consider the impact on your position.";
    }
    return "Your pattern recognition skills are strong. Trust your analysis!";
  };

  return (
    <Card className="glass-card border-purple-500/20 bg-black/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">AI Combat Mentor</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Live
            </Badge>
          </div>
          
          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="text-xs">Analyzing...</span>
            </div>
          )}
        </div>

        <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
          {mentorMessages.length === 0 && (
            <div className="text-center py-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">
                AI mentor is observing the market...
              </p>
            </div>
          )}
          
          {mentorMessages.map((message) => {
            const IconComponent = message.icon;
            return (
              <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <IconComponent className={`w-4 h-4 mt-0.5 ${message.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{message.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className={`text-xs ${message.color} border-current`}>
                      {message.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {Math.floor((Date.now() - message.timestamp) / 1000)}s ago
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Personalized Advice */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400">Personal Growth Tip</span>
          </div>
          <p className="text-xs text-gray-300">{getPersonalizedAdvice()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CombatMentor;
