import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { enhancedEducationService } from '@/services/enhancedEducationService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  hasChart?: boolean;
  chartUrl?: string;
  followUpActions?: string[];
}

const EnhancedAICoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial messages or tutorial content here
    setMessages([
      {
        id: 'welcome',
        type: 'ai',
        content: "Hi, I'm your AI Trading Coach! Ask me anything about trading strategies, market analysis, or smart money concepts. What's on your mind today?",
        timestamp: new Date(),
        followUpActions: ['Explain Order Blocks', 'What is Risk Management?', 'Show me a chart example']
      }
    ]);
  }, []);

  const handleSkillLevelChange = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setSkillLevel(level);
    toast({
      title: "Skill Level Updated",
      description: `You've set your skill level to ${level}. I'll tailor my explanations accordingly.`,
    });
  };

  const handleStartLesson = (lesson: string) => {
    setCurrentLesson(lesson);
    toast({
      title: "Lesson Started",
      description: `Starting lesson on ${lesson}. Let's dive in!`,
    });
  };

  const handleCompleteLesson = () => {
    setCurrentLesson(null);
    toast({
      title: "Lesson Completed!",
      description: "Congratulations! You've finished the lesson. What's next?",
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await enhancedEducationService.generateResponse(
        input,
        skillLevel,
        messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }))
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.text,
        timestamp: new Date(),
        hasChart: response.hasChart,
        chartUrl: response.chartUrl,
        followUpActions: response.followUpActions
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.lessonCompleted) {
        toast({
          title: "Lesson Completed! 🎉",
          description: "You've mastered this concept. Ready for the next challenge?"
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpAction = async (action: string) => {
    setInput(action);
    await handleSendMessage();
  };

  return (
    <div className="space-y-6">
      {/* Skill Level Selector */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Your Trading Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <Button
                key={level}
                onClick={() => setSkillLevel(level)}
                variant={skillLevel === level ? "default" : "outline"}
                className={skillLevel === level ? "bg-purple-600" : ""}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            AI Trading Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-96 overflow-y-auto space-y-4 border border-gray-700 rounded-lg p-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Ask me anything about trading! I can explain concepts with visual examples.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.hasChart && message.chartUrl && (
                    <div className="mt-3">
                      <img 
                        src={message.chartUrl} 
                        alt="Trading Chart Example"
                        className="rounded border border-gray-600"
                      />
                    </div>
                  )}
                  
                  {message.followUpActions && message.followUpActions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-400">Quick actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.followUpActions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => handleFollowUpAction(action)}
                            className="text-xs"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    <span className="text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about Order Blocks, SMC, Risk Management..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAICoach;
