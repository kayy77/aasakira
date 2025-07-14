
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Send, 
  Image, 
  Quiz,
  TrendingUp,
  Eye,
  Sparkles,
  User,
  BookOpen,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { enhancedEducationService, type AICoachResponse, type UserEducationProfile } from '@/services/enhancedEducationService';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  visual_url?: string;
  timestamp: Date;
  follow_up_actions?: Array<{
    type: 'quiz' | 'practice' | 'visual_example';
    description: string;
    action_data: any;
  }>;
}

const EnhancedAICoach: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserEducationProfile | null>(null);
  const [skillLevelSuggestion, setSkillLevelSuggestion] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
      setInitialWelcomeMessage();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    const profile = await enhancedEducationService.getUserProfile(user.id);
    setUserProfile(profile);
  };

  const setInitialWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'ai',
      content: `🎯 **Welcome to your Personal AI Trading Coach!**

I'm Aasakira 2.0, and I'm here to guide you from where you are now to professional-level trading mastery.

✨ **What makes me different:**
• I adapt to YOUR skill level and learning style
• I provide visual chart examples for every concept
• I remember your progress and build on what you've learned
• I can generate personalized quizzes to test your knowledge

Let's start by understanding your current level. What's your experience with trading? Are you:
📚 Just getting started with the basics?
📈 Already familiar with support/resistance but want to learn Smart Money Concepts?
🏆 Experienced but looking to master institutional trading?

Or simply ask me about any trading concept you'd like to learn!`,
      timestamp: new Date(),
      follow_up_actions: [
        {
          type: 'quiz',
          description: 'Take a quick assessment to determine your skill level',
          action_data: { type: 'assessment' }
        }
      ]
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.id || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const coachResponse: AICoachResponse = await enhancedEducationService.generateAICoachResponse(
        currentInput,
        user.id
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: coachResponse.text,
        visual_url: coachResponse.visual_url,
        timestamp: new Date(),
        follow_up_actions: coachResponse.follow_up_actions
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle skill level adjustment suggestion
      if (coachResponse.skill_level_adjustment) {
        setSkillLevelSuggestion(coachResponse.skill_level_adjustment);
      }

      // Reload profile to get updated data
      await loadUserProfile();

      toast({
        title: "🧠 AI Coach Response",
        description: coachResponse.visual_url ? "Generated with visual example!" : "Personalized guidance delivered!",
      });

    } catch (error) {
      console.error('Error getting coach response:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm experiencing some technical difficulties, but I'm still here to help! Let me know what trading concept you'd like to learn about, and I'll do my best to guide you.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "AI coach is having temporary difficulties",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpAction = async (action: any) => {
    if (action.type === 'quiz') {
      const quizMessage = `Generate a personalized ${action.action_data.difficulty || 'intermediate'} level quiz on ${action.action_data.topic || 'trading concepts'}`;
      setInputMessage(quizMessage);
      setTimeout(() => handleSendMessage(), 100);
    } else if (action.type === 'visual_example') {
      const visualMessage = `Show me a visual example of ${action.action_data.topic}`;
      setInputMessage(visualMessage);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const acceptSkillLevelSuggestion = async () => {
    if (!skillLevelSuggestion || !user?.id) return;

    await enhancedEducationService.createOrUpdateProfile(user.id, {
      skill_level: skillLevelSuggestion.suggested_level
    });

    await loadUserProfile();
    setSkillLevelSuggestion(null);

    toast({
      title: "Skill Level Updated!",
      description: `Welcome to ${skillLevelSuggestion.suggested_level} level training!`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      {userProfile && (
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Your Learning Profile
              </div>
              <Badge className={`${
                userProfile.skill_level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                userProfile.skill_level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {userProfile.skill_level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{userProfile.completed_lessons.length}</div>
                <div className="text-sm text-gray-400">Lessons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{Object.keys(userProfile.quiz_scores).length}</div>
                <div className="text-sm text-gray-400">Quizzes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{userProfile.strengths.length}</div>
                <div className="text-sm text-gray-400">Strengths</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{Math.round(userProfile.total_study_time / 60)}</div>
                <div className="text-sm text-gray-400">Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Level Suggestion */}
      {skillLevelSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-yellow-400">🎯 Ready to Level Up?</h4>
                  <p className="text-sm text-gray-300">{skillLevelSuggestion.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={acceptSkillLevelSuggestion} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Upgrade to {skillLevelSuggestion.suggested_level}
                  </Button>
                  <Button onClick={() => setSkillLevelSuggestion(null)} variant="outline" size="sm">
                    Later
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Chat Interface */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-400" />
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Personal AI Trading Coach
            <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500">
              Enhanced AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-xl ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-blue-500/20 text-gray-100'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        
                        {/* Visual Display */}
                        {message.visual_url && (
                          <div className="mt-3">
                            <img 
                              src={message.visual_url} 
                              alt="AI Generated Trading Chart" 
                              className="w-full rounded-lg border border-blue-500/30 max-w-md"
                            />
                            <Badge className="mt-2 bg-blue-500/20 text-blue-400">
                              <Image className="w-3 h-3 mr-1" />
                              AI Generated Visual
                            </Badge>
                          </div>
                        )}

                        {/* Follow-up Actions */}
                        {message.follow_up_actions && message.follow_up_actions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs text-gray-400 mb-1">💡 Suggested actions:</div>
                            {message.follow_up_actions.map((action, index) => (
                              <Button
                                key={index}
                                onClick={() => handleFollowUpAction(action)}
                                variant="outline"
                                size="sm"
                                className="mr-2 mb-1 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                              >
                                {action.type === 'quiz' && <Quiz className="w-3 h-3 mr-1" />}
                                {action.type === 'visual_example' && <Eye className="w-3 h-3 mr-1" />}
                                {action.type === 'practice' && <Target className="w-3 h-3 mr-1" />}
                                {action.description}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 p-4 rounded-xl max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                        <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                        <span className="text-sm text-gray-300">Your AI coach is analyzing and generating personalized response...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            {/* Input Area */}
            <div className="p-4 border-t border-blue-500/20 bg-gray-900/50">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about any trading concept, request visual examples, or ask for a quiz..."
                  className="flex-1 bg-gray-800/50 border-blue-500/30 text-white placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-center mt-2 text-blue-400">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Enhanced with visual learning and personalized coaching
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAICoach;
