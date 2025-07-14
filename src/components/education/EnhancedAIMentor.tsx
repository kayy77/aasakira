
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Camera, 
  TrendingUp, 
  BookOpen, 
  Target,
  MessageCircle,
  Gamepad2,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMentorMemory } from './useMentorMemory';
import ProgressChart from './ProgressChart';
import ImageUpload from './ImageUpload';
import SuperAIMentor from './SuperAIMentor';
import RealTimeUserStats from './RealTimeUserStats';
import InteractiveQuiz from './InteractiveQuiz';
import AasakiraAIButton from './AasakiraAIButton';

interface EnhancedAIMentorProps {
  onFeatureUse?: () => void;
}

const EnhancedAIMentor = ({ onFeatureUse }: EnhancedAIMentorProps) => {
  const { toast } = useToast();
  const { 
    state: mentorData, 
    addInteraction, 
    updateProgress
  } = useMentorMemory();

  const [selectedQuizTopic, setSelectedQuizTopic] = useState('Smart Money Concepts');

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

  const handleQuizComplete = (score: number) => {
    updateProgress('quizzes', 1);
    onFeatureUse?.();
    
    toast({
      title: "🎯 Quiz Complete!",
      description: `You scored ${score} points. Great job learning!`
    });
  };

  const learningTopics = [
    {
      title: 'Smart Money Concepts',
      description: 'Order blocks, liquidity, market structure',
      difficulty: 'intermediate' as const,
      icon: Brain,
      color: 'purple'
    },
    {
      title: 'Risk Management',
      description: 'Position sizing, stop losses, R:R ratios',
      difficulty: 'beginner' as const,
      icon: Target,
      color: 'green'
    },
    {
      title: 'Market Structure',
      description: 'Trends, support/resistance, breakouts',
      difficulty: 'intermediate' as const,
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Trading Psychology',
      description: 'Emotions, discipline, mindset',
      difficulty: 'advanced' as const,
      icon: Brain,
      color: 'pink'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Mentor Status Card */}
      <Card className="glass-card hover-glow border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Brain className="w-6 h-6 mr-2 text-purple-400" />
            Aasakira AI Education Hub
            <Sparkles className="w-5 h-5 ml-2 text-yellow-400" />
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
              Level {mentorData.userLevel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">
                {mentorData.progress.quizzes || 0}
              </div>
              <div className="text-sm text-gray-400">Quizzes Completed</div>
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
          <TabsTrigger value="quiz" className="data-[state=active]:bg-blue-600">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Smart Quizzes
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-pink-600">
            <Camera className="w-4 h-4 mr-2" />
            Chart Analysis
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-yellow-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid gap-6">
            {learningTopics.map((topic, index) => (
              <Card key={index} className="glass-card hover-glow border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <topic.icon className={`w-5 h-5 mr-2 text-${topic.color}-400`} />
                      {topic.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`border-${topic.color}-500/30 text-${topic.color}-400`}>
                        {topic.difficulty}
                      </Badge>
                      <AasakiraAIButton 
                        topic={topic.title}
                        context={topic.description}
                        userLevel={topic.difficulty}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">{topic.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedQuizTopic(topic.title);
                        // Switch to quiz tab
                        const quizTab = document.querySelector('[value="quiz"]') as HTMLElement;
                        quizTab?.click();
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Gamepad2 className="w-4 h-4 mr-1" />
                      Take Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <SuperAIMentor onFeatureUse={onFeatureUse} />
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <div className="grid gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-blue-400" />
              Interactive Smart Quizzes
            </h2>
            <div className="flex flex-wrap gap-2">
              {learningTopics.map(topic => (
                <Button
                  key={topic.title}
                  onClick={() => setSelectedQuizTopic(topic.title)}
                  variant={selectedQuizTopic === topic.title ? "default" : "outline"}
                  size="sm"
                  className={selectedQuizTopic === topic.title ? `bg-${topic.color}-600` : ''}
                >
                  {topic.title}
                </Button>
              ))}
            </div>
          </div>
          
          <InteractiveQuiz
            key={selectedQuizTopic} // Force re-render when topic changes
            topic={selectedQuizTopic}
            difficulty="medium"
            onComplete={handleQuizComplete}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <ImageUpload onImageAnalysis={handleImageAnalysis} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <RealTimeUserStats />
          <ProgressChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIMentor;
