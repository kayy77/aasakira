
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Send, 
  Camera, 
  TrendingUp, 
  BookOpen, 
  Target,
  Star,
  MessageCircle,
  ChevronRight,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMentorMemory } from './useMentorMemory';
import ProgressChart from './ProgressChart';
import ImageUpload from './ImageUpload';
import ChatInterface from './ChatInterface';
import LearningProgress from './combat/LearningProgress';
import { useAIResponses } from './useAIResponses';

interface EnhancedAIMentorProps {
  onFeatureUse?: () => void;
}

// Transform MentorInteraction to Message format for ChatInterface
const transformInteractionsToMessages = (interactions: any[]) => {
  return interactions.map((interaction, index) => ({
    id: `msg-${index}`,
    content: interaction.response || interaction.content,
    isUser: false,
    timestamp: interaction.timestamp,
    isGeminiPowered: true
  }));
};

const EnhancedAIMentor = ({ onFeatureUse }: EnhancedAIMentorProps) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { 
    state: mentorData, 
    addInteraction, 
    updateProgress, 
    addGoal, 
    markGoalComplete 
  } = useMentorMemory();
  const { generateAIResponse } = useAIResponses();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    onFeatureUse?.();

    try {
      const response = await generateAIResponse(message);

      addInteraction({
        type: 'message',
        content: message,
        response: response,
        timestamp: new Date()
      });

      // Update progress based on interaction
      updateProgress('messages', 1);
      
      setMessage('');
      
      toast({
        title: "AI Mentor Response",
        description: "Your personalized lesson has been generated!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleImageAnalysis = (analysis: string) => {
    addInteraction({
      type: 'image',
      content: 'Chart analysis completed',
      response: analysis,
      timestamp: new Date()
    });
    
    updateProgress('screenshots', 1);
    onFeatureUse?.();
  };

  const learningPaths = [
    {
      title: 'Smart Money Concepts',
      level: mentorData.userLevel,
      progress: mentorData.progress.concepts || 0,
      lessons: ['Market Structure', 'Order Blocks', 'Fair Value Gaps', 'Liquidity Zones']
    },
    {
      title: 'Risk Management',
      level: mentorData.userLevel,
      progress: mentorData.progress.risk || 0,
      lessons: ['Position Sizing', 'Stop Loss Strategy', 'Risk/Reward Ratios', 'Portfolio Management']
    },
    {
      title: 'Psychology & Discipline',
      level: mentorData.userLevel,
      progress: mentorData.progress.psychology || 0,
      lessons: ['Emotional Control', 'Trading Plan', 'Journal Analysis', 'Mindset Development']
    }
  ];

  // Transform interactions for ChatInterface
  const chatMessages = transformInteractionsToMessages(mentorData.interactions);

  return (
    <div className="space-y-8">
      {/* Enhanced Mentor Status Card */}
      <Card className="glass-card hover-glow border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Brain className="w-6 h-6 mr-2 text-purple-400" />
            AI Trading Mentor
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
              Level {mentorData.userLevel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {mentorData.interactions.length}
              </div>
              <div className="text-sm text-gray-400">AI Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {mentorData.goals.filter(g => g.completed).length}
              </div>
              <div className="text-sm text-gray-400">Skills Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {mentorData.progress.screenshots || 0}
              </div>
              <div className="text-sm text-gray-400">Charts Analyzed</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Learning Progress</span>
              <span className="text-purple-400">{Math.round((mentorData.progress.messages || 0) * 2)}%</span>
            </div>
            <Progress value={(mentorData.progress.messages || 0) * 2} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="learning" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="learning" className="data-[state=active]:bg-green-600">
            <Target className="w-4 h-4 mr-2" />
            Learning Hub
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600">
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600">
            <Camera className="w-4 h-4 mr-2" />
            Chart Analysis
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="lessons" className="data-[state=active]:bg-purple-600">
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="space-y-6">
          <LearningProgress 
            userStats={{
              wins: 12,
              losses: 3,
              streak: 5,
              points: 1847,
              tradingStyle: 'Day Trader'
            }}
            onLearningUpdate={(data) => {
              console.log('Learning data updated:', data);
            }}
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <ChatInterface 
            messages={chatMessages}
            inputMessage={message}
            isTyping={isLoading}
            onInputChange={setMessage}
            onSendMessage={handleSendMessage}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <ImageUpload onImageAnalysis={handleImageAnalysis} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressChart />
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6">
          <div className="grid gap-6">
            {learningPaths.map((path, index) => (
              <Card key={index} className="glass-card hover-glow border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-purple-400" />
                      {path.title}
                    </div>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                      {path.progress}% Complete
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={path.progress} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    {path.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30"
                      >
                        <span className="text-sm text-gray-300">{lesson}</span>
                        {lessonIndex < path.progress / 25 ? (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIMentor;
