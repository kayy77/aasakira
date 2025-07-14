import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Zap,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Activity,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMentorMemory } from './useMentorMemory';
import ProgressChart from './ProgressChart';
import ImageUpload from './ImageUpload';
import { useAIResponses } from './useAIResponses';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  analysis?: {
    concept: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
  };
}

interface WeaknessAnalysis {
  concept: string;
  errorCount: number;
  lastMistake: Date;
  improvements: string[];
}

const IntelligentAIMentor: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userWeaknesses, setUserWeaknesses] = useState<WeaknessAnalysis[]>([]);
  const [personalityProfile, setPersonalityProfile] = useState({
    tradingStyle: 'Conservative',
    riskTolerance: 'Medium',
    experienceLevel: 'Intermediate',
    learningPreference: 'Visual',
    commonMistakes: ['Entry timing', 'Risk management', 'Psychology']
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    state: mentorData, 
    addInteraction, 
    updateProgress 
  } = useMentorMemory();
  const { generateAIResponse } = useAIResponses();

  // Intelligent response system that adapts to user
  const generateIntelligentResponse = async (userMessage: string) => {
    const context = {
      userLevel: mentorData.userLevel,
      recentMistakes: userWeaknesses.slice(0, 3),
      tradingStyle: personalityProfile.tradingStyle,
      conversationHistory: messages.slice(-5),
      learningProgress: mentorData.progress
    };

    // Analyze user's question type
    const questionType = analyzeQuestionType(userMessage);
    
    let enhancedPrompt = '';
    
    switch (questionType) {
      case 'concept_explanation':
        enhancedPrompt = `
          As an expert SMC trader, explain this trading concept: "${userMessage}"
          
          User Profile:
          - Level: ${context.userLevel}
          - Style: ${context.tradingStyle}
          - Weaknesses: ${context.recentMistakes.map(w => w.concept).join(', ')}
          
          Provide:
          1. Clear explanation adapted to ${context.userLevel} level
          2. Real market example
          3. Common mistakes to avoid
          4. Practice drill suggestion
          
          Keep it practical and actionable. Focus on what they need to improve based on their weaknesses.
        `;
        break;
      
      case 'chart_analysis':
        enhancedPrompt = `
          Analyze this chart/scenario: "${userMessage}"
          
          The user struggles with: ${context.recentMistakes.map(w => w.concept).join(', ')}
          
          Provide step-by-step SMC analysis:
          1. Market structure assessment
          2. Key levels identification  
          3. Entry/exit strategy
          4. Risk management advice
          5. Psychology tips specific to their trading style (${context.tradingStyle})
          
          Be specific about order blocks, FVGs, and liquidity zones.
        `;
        break;
      
      case 'strategy_question':
        enhancedPrompt = `
          Strategy question: "${userMessage}"
          
          User's trading style: ${context.tradingStyle}
          Recent struggles: ${context.recentMistakes.map(w => w.concept).join(', ')}
          
          Provide:
          1. Strategy recommendation tailored to their style
          2. Risk management specific to their risk tolerance
          3. Common pitfalls they should avoid based on their history
          4. Backtesting approach
          
          Make it actionable and specific to their experience level.
        `;
        break;
      
      default:
        enhancedPrompt = `
          General trading question: "${userMessage}"
          
          User context:
          - Experience: ${context.userLevel}
          - Style: ${context.tradingStyle}
          - Learning preference: ${personalityProfile.learningPreference}
          
          Respond as their personal trading mentor who knows their strengths and weaknesses.
          Be encouraging but realistic. Provide specific, actionable advice.
        `;
    }
    
    return await generateAIResponse(enhancedPrompt, user?.id);
  };

  const analyzeQuestionType = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('what is') || lowerMessage.includes('explain') || lowerMessage.includes('understand')) {
      return 'concept_explanation';
    }
    if (lowerMessage.includes('chart') || lowerMessage.includes('analyze') || lowerMessage.includes('entry') || lowerMessage.includes('exit')) {
      return 'chart_analysis';
    }
    if (lowerMessage.includes('strategy') || lowerMessage.includes('plan') || lowerMessage.includes('approach')) {
      return 'strategy_question';
    }
    return 'general';
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await generateIntelligentResponse(message);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response,
        isUser: false,
        timestamp: new Date(),
        analysis: {
          concept: analyzeQuestionType(message),
          difficulty: mentorData.userLevel < 5 ? 'beginner' : mentorData.userLevel < 15 ? 'intermediate' : 'advanced',
          tags: extractTags(message)
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Track interaction for learning
      addInteraction({
        type: 'message',
        content: message,
        response: response,
        timestamp: new Date()
      });

      updateProgress('messages', 1);
      
      // Update weakness tracking if this was about a concept they struggle with
      updateWeaknessTracking(message, response);
      
      toast({
        title: "Personalized Response Generated",
        description: "AI analyzed your question and adapted the response to your learning profile"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const extractTags = (message: string): string[] => {
    const tradingTerms = ['smc', 'order block', 'fvg', 'bos', 'choch', 'liquidity', 'support', 'resistance', 'entry', 'exit', 'risk management'];
    return tradingTerms.filter(term => message.toLowerCase().includes(term));
  };

  const updateWeaknessTracking = (question: string, response: string) => {
    // This would analyze if the user is asking about concepts they previously struggled with
    // and track improvement over time
    const conceptsInQuestion = extractTags(question);
    
    setUserWeaknesses(prev => {
      const updated = [...prev];
      conceptsInQuestion.forEach(concept => {
        const existing = updated.find(w => w.concept === concept);
        if (existing) {
          existing.lastMistake = new Date();
        } else {
          updated.push({
            concept,
            errorCount: 1,
            lastMistake: new Date(),
            improvements: ['Continue practicing this concept']
          });
        }
      });
      return updated.slice(0, 10); // Keep only latest 10
    });
  };

  const learningPaths = [
    {
      title: 'Smart Money Concepts Mastery',
      level: mentorData.userLevel,
      progress: Math.min((mentorData.progress.messages || 0) * 10, 100),
      lessons: ['Market Structure', 'Order Blocks', 'Fair Value Gaps', 'Liquidity Zones', 'Break of Structure', 'Change of Character'],
      difficulty: 'Intermediate'
    },
    {
      title: 'Risk Management Excellence',
      level: mentorData.userLevel,
      progress: Math.min((mentorData.progress.screenshots || 0) * 15, 100),
      lessons: ['Position Sizing', 'Stop Loss Placement', 'Risk/Reward Ratios', 'Portfolio Heat', 'Drawdown Management', 'Emotional Control'],
      difficulty: 'Advanced'
    },
    {
      title: 'Chart Reading Mastery',
      level: mentorData.userLevel,
      progress: Math.min((messages.length) * 5, 100),
      lessons: ['Higher Timeframe Bias', 'Lower Timeframe Entries', 'Confluence Trading', 'News Events', 'Session Analysis', 'Correlation'],
      difficulty: 'Beginner'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intelligent Mentor Status */}
      <Card className="glass-card hover-glow border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Brain className="w-6 h-6 mr-2 text-purple-400" />
            Aasakira AI Mentor
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
              Adaptive Learning
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Profile Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{personalityProfile.experienceLevel}</div>
              <div className="text-sm text-gray-400">Experience Level</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{personalityProfile.tradingStyle}</div>
              <div className="text-sm text-gray-400">Trading Style</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{messages.length}</div>
              <div className="text-sm text-gray-400">AI Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">{userWeaknesses.length}</div>
              <div className="text-sm text-gray-400">Areas Tracked</div>
            </div>
          </div>
          
          {/* Learning Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Overall Progress</span>
              <span className="text-purple-400">{Math.min(messages.length * 3, 100)}%</span>
            </div>
            <Progress value={Math.min(messages.length * 3, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600">
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="weaknesses" className="data-[state=active]:bg-red-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Weak Points
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-blue-600">
            <Camera className="w-4 h-4 mr-2" />
            Chart Analysis
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-green-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-gold-600">
            <BookOpen className="w-4 h-4 mr-2" />
            Master Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          {/* Chat Interface */}
          <Card className="glass-card border-purple-500/20 h-96">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white mb-2">Your Personal Trading Mentor</h3>
                    <p>Ask me anything about SMC, risk management, or trading psychology. I'll adapt my responses to your learning style and experience level.</p>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isUser
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      {msg.analysis && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {msg.analysis.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-gray-300">Analyzing your question...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about SMC, risk management, psychology..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weaknesses" className="space-y-6">
          <Card className="glass-card border-red-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Weakness Analysis & Targeted Training
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userWeaknesses.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Weaknesses Detected Yet</h3>
                  <p className="text-gray-400">Continue chatting and analyzing charts to build your learning profile.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {userWeaknesses.map((weakness, index) => (
                    <Card key={index} className="bg-gray-800/30 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{weakness.concept}</h4>
                          <Badge variant="outline" className="border-red-500/30 text-red-400">
                            {weakness.errorCount} issues
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Last discussed: {weakness.lastMistake.toLocaleDateString()}
                        </p>
                        <div className="space-y-2">
                          {weakness.improvements.map((improvement, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                              <Target className="w-4 h-4 text-purple-400" />
                              {improvement}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <ImageUpload onImageAnalysis={(analysis) => {
            console.log('Chart analysis:', analysis);
            updateProgress('screenshots', 1);
          }} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressChart />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6">
            {learningPaths.map((path, index) => (
              <Card key={index} className="glass-card hover-glow border-gold-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <Crown className="w-5 h-5 mr-2 text-gold-400" />
                      {path.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-gold-500/30 text-gold-400">
                        {path.difficulty}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                        {path.progress}% Complete
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={path.progress} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    {path.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer"
                      >
                        <span className="text-sm text-gray-300">{lesson}</span>
                        {lessonIndex < path.progress / 16.67 ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : lessonIndex === Math.floor(path.progress / 16.67) ? (
                          <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
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

export default IntelligentAIMentor;