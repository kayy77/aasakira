import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  Lock,
  Star,
  MessageSquare,
  Play,
  Award,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Lightbulb,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { comprehensiveLearningService, LearningStage, LearningMission } from '@/services/comprehensiveLearningService';
import InteractiveQuizGenerator from './InteractiveQuizGenerator';
import VisualLessonCard from './VisualLessonCard';

interface ComprehensiveLearningPathProps {
  onAskMentor?: (prompt: string) => void;
}

export const ComprehensiveLearningPath: React.FC<ComprehensiveLearningPathProps> = ({ onAskMentor }) => {
  const [stages, setStages] = useState<LearningStage[]>([]);
  const [currentStage, setCurrentStage] = useState(1);
  const [selectedMission, setSelectedMission] = useState<LearningMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [missionContent, setMissionContent] = useState<string>('');
  const [quizMode, setQuizMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadLearningPath();
    if (user?.id) {
      loadUserProgress();
    }
  }, [user?.id]);

  const loadLearningPath = async () => {
    try {
      setLoading(true);
      const learningStages = await comprehensiveLearningService.getFullLearningPath();
      setStages(learningStages);
      
      // If no stages loaded, create mock data
      if (!learningStages || learningStages.length === 0) {
        const mockStages: LearningStage[] = [
          {
            id: 1,
            title: "Trading Foundations",
            description: "Master the absolute basics - what trading really is",
            duration: "1 Week",
            completed: false,
            missions: [
              {
                id: "1-1",
                title: "What Actually Is Trading?",
                description: "Master what actually is trading? concepts",
                keyPoints: [
                  "Understanding market basics",
                  "What moves prices",
                  "Psychology fundamentals",
                  "Risk vs reward concepts"
                ],
                learningObjectives: [
                  "Define what trading means",
                  "Understand price movement",
                  "Recognize market participants",
                  "Grasp basic risk concepts"
                ],
                difficulty: "Beginner",
                estimatedTime: "30 min",
                stage: 1,
                prerequisites: [],
                completed: false,
                mentorPrompt: "I'm just starting to learn about trading. Can you explain what trading actually is and how it works?",
                content: ""
              }
            ]
          }
        ];
        setStages(mockStages);
      }
    } catch (error) {
      console.error('Error loading learning path:', error);
      // Create fallback data
      const fallbackStages: LearningStage[] = [
        {
          id: 1,
          title: "Trading Foundations", 
          description: "Master the absolute basics - what trading really is",
          duration: "1 Week",
          completed: false,
          missions: [
            {
              id: "1-1",
              title: "What Actually Is Trading?",
              description: "Master what actually is trading? concepts",
              keyPoints: [
                "Understanding market basics",
                "What moves prices", 
                "Psychology fundamentals",
                "Risk vs reward concepts"
              ],
              learningObjectives: [
                "Define what trading means",
                "Understand price movement",
                "Recognize market participants",
                "Grasp basic risk concepts"
              ],
              difficulty: "Beginner",
              estimatedTime: "30 min",
              stage: 1,
              prerequisites: [],
              completed: false,
              mentorPrompt: "I'm just starting to learn about trading. Can you explain what trading actually is and how it works?",
              content: ""
            }
          ]
        }
      ];
      setStages(fallbackStages);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    try {
      const progress = await comprehensiveLearningService.getUserProgress(user.id);
      setUserProgress(progress);
      setCurrentStage(progress.currentStage);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const startMission = async (mission: LearningMission) => {
    if (!isMissionUnlocked(mission)) {
      toast({
        title: "Mission Locked",
        description: "Complete previous missions to unlock this one.",
        variant: "destructive"
      });
      return;
    }

    setSelectedMission(mission);
    setQuizMode(false);
    setShowResults(false);
    
    // Generate content if not exists
    if (!mission.content) {
      const content = await comprehensiveLearningService.generateMissionContent(mission);
      setMissionContent(content);
      mission.content = content;
    } else {
      setMissionContent(mission.content);
    }
  };

  const startQuiz = () => {
    setQuizMode(true);
    setShowResults(false);
  };

  const handleQuizComplete = async (score: number) => {
    if (!selectedMission || !user?.id) return;
    
    setShowResults(true);
    
    // Update mission completion
    selectedMission.completed = true;
    selectedMission.score = score;
    
    await comprehensiveLearningService.updateUserProgress(user.id, selectedMission.id, score);
    
    const feedback = await comprehensiveLearningService.generatePersonalizedFeedback(
      user.id, 
      selectedMission.id, 
      score
    );
    
    toast({
      title: score >= 80 ? "Mission Complete! 🎉" : score >= 60 ? "Good Progress! 📚" : "Keep Learning! 💪",
      description: `You scored ${score}%. ${feedback.substring(0, 100)}...`,
      variant: score >= 60 ? "default" : "destructive"
    });
  };

  const askMentor = (mission: LearningMission) => {
    if (onAskMentor) {
      onAskMentor(mission.mentorPrompt);
    }
    toast({
      title: "AI Mentor Activated",
      description: "Your question has been sent to the AI mentor!",
    });
  };

  const isMissionUnlocked = (mission: LearningMission): boolean => {
    if (mission.prerequisites.length === 0) return true;
    
    return mission.prerequisites.every(prereqId => {
      const prereqMission = stages
        .flatMap(stage => stage.missions)
        .find(m => m.id === prereqId);
      return prereqMission?.completed || false;
    });
  };

  const getStageProgress = (stage: LearningStage): number => {
    const completedMissions = stage.missions.filter(m => m.completed).length;
    return (completedMissions / stage.missions.length) * 100;
  };

  const getOverallProgress = (): number => {
    const totalMissions = stages.reduce((sum, stage) => sum + stage.missions.length, 0);
    const completedMissions = stages.reduce(
      (sum, stage) => sum + stage.missions.filter(m => m.completed).length, 
      0
    );
    return totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
  };

  const getVisualType = (missionTitle: string) => {
    if (missionTitle.toLowerCase().includes('chart') || missionTitle.toLowerCase().includes('candlestick')) {
      return 'chart';
    } else if (missionTitle.toLowerCase().includes('psychology') || missionTitle.toLowerCase().includes('mindset')) {
      return 'psychology';
    } else if (missionTitle.toLowerCase().includes('strategy') || missionTitle.toLowerCase().includes('smc')) {
      return 'strategy';
    }
    return 'concept';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your personalized learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="glass-card border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            6-Month Professional Trading Mastery
            <Badge className="bg-gradient-to-r from-gold-400 to-yellow-500 text-black font-bold">
              COMPLETE JOURNEY
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-400 mb-1">{getOverallProgress().toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Progress</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
              <div className="text-3xl font-bold text-green-400 mb-1">{stages.filter(s => s.completed).length}</div>
              <div className="text-sm text-gray-400">Stages Done</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stages.reduce((sum, stage) => sum + stage.missions.filter(m => m.completed).length, 0)}
              </div>
              <div className="text-sm text-gray-400">Missions Complete</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{currentStage}</div>
              <div className="text-sm text-gray-400">Current Stage</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Journey Progress</span>
              <span>{getOverallProgress().toFixed(0)}% Complete</span>
            </div>
            <Progress value={getOverallProgress()} className="h-3 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${getOverallProgress()}%` }}
              />
            </Progress>
          </div>

          {/* Motivational Quote */}
          <div className="text-center p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-2">Remember: Trading Mastery Takes Time</h3>
            <p className="text-gray-300 text-lg mb-2">
              "You will not get rich quick. But you will get rich if you're obsessed with improving."
            </p>
            <p className="text-gray-400 text-sm">
              Take notes, practice daily, and never stop learning. Every professional trader started exactly where you are now.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedMission ? 'mission' : 'stages'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
          <TabsTrigger 
            value="stages" 
            onClick={() => setSelectedMission(null)}
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <BookOpen className="w-4 h-4" />
            Learning Stages
          </TabsTrigger>
          <TabsTrigger 
            value="mission" 
            disabled={!selectedMission}
            className="flex items-center gap-2 data-[state=active]:bg-blue-600"
          >
            <Target className="w-4 h-4" />
            Current Mission
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages">
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <Card key={stage.id} className={`glass-card transition-all duration-300 hover:border-purple-400/40 ${
                currentStage === stage.id ? 'border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/20' : 'border-gray-700/50'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        stage.completed ? 'bg-green-500/20 text-green-400 border-2 border-green-500' : 
                        currentStage === stage.id ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500' : 
                        'bg-gray-500/20 text-gray-400 border-2 border-gray-500'
                      }`}>
                        {stage.completed ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : currentStage === stage.id ? (
                          <Play className="w-8 h-8" />
                        ) : currentStage > stage.id ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          stage.id
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Stage {stage.id}: {stage.title}</h3>
                        <p className="text-gray-400 text-lg">{stage.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{stage.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-sm mb-2">
                        {stage.missions.filter(m => m.completed).length}/{stage.missions.length} Complete
                      </Badge>
                      <div className="text-sm text-gray-400">
                        {getStageProgress(stage).toFixed(0)}% Done
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <Progress value={getStageProgress(stage)} className="h-2" />
                  </div>

                  <div className="grid gap-4">
                    {stage.missions.map((mission, missionIndex) => (
                      <VisualLessonCard
                        key={mission.id}
                        title={mission.title}
                        description={mission.description}
                        keyPoints={mission.keyPoints}
                        visualType={getVisualType(mission.title)}
                        difficulty={mission.difficulty}
                      />
                    ))}
                  </div>

                  {/* Mission List */}
                  <div className="grid gap-3 mt-6">
                    {stage.missions.map((mission, missionIndex) => (
                      <div
                        key={mission.id}
                        className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:border-purple-400/40 hover:bg-purple-500/5 ${
                          mission.completed ? 'border-green-500/40 bg-green-500/5' :
                          isMissionUnlocked(mission) ? 'border-purple-500/30 bg-purple-500/5' :
                          'border-gray-600/30 bg-gray-800/20 opacity-60'
                        }`}
                        onClick={() => isMissionUnlocked(mission) && startMission(mission)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                              mission.completed ? 'bg-green-500/20 text-green-400' :
                              isMissionUnlocked(mission) ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {mission.completed ? <CheckCircle className="w-6 h-6" /> : missionIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                                {mission.title}
                              </h4>
                              <p className="text-gray-400 text-sm mt-1">{mission.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={
                              mission.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              mission.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }>
                              {mission.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {mission.estimatedTime}
                            </Badge>
                            {mission.completed && mission.score && (
                              <Badge className="bg-green-500/20 text-green-400 font-bold">
                                {mission.score}%
                              </Badge>
                            )}
                            {isMissionUnlocked(mission) && (
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mission">
          {selectedMission && (
            <div className="space-y-6">
              {/* Mission Header */}
              <Card className="glass-card border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Target className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{selectedMission.title}</h2>
                        <p className="text-gray-400 text-lg">Stage {selectedMission.stage} • {selectedMission.estimatedTime}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => askMentor(selectedMission)}
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask Mentor
                    </Button>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Mission Content */}
              {!quizMode && !showResults && (
                <Card className="glass-card">
                  <CardContent className="p-8">
                    <div className="prose prose-invert max-w-none">
                      <div 
                        className="text-gray-300 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ 
                          __html: missionContent.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') 
                        }} 
                      />
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <div className="flex gap-4">
                        <Button
                          onClick={startQuiz}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
                        >
                          <Award className="w-5 h-5 mr-2" />
                          Take Mission Quiz
                        </Button>
                        <Button
                          onClick={() => askMentor(selectedMission)}
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-6 py-3"
                        >
                          <Brain className="w-5 h-5 mr-2" />
                          Ask Questions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interactive Quiz */}
              {quizMode && !showResults && (
                <InteractiveQuizGenerator
                  missionTitle={selectedMission.title}
                  keyPoints={selectedMission.keyPoints}
                  learningObjectives={selectedMission.learningObjectives}
                  onComplete={handleQuizComplete}
                  onAskMentor={() => askMentor(selectedMission)}
                />
              )}

              {/* Quiz Results */}
              {showResults && (
                <Card className="glass-card border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <Trophy className="w-6 h-6" />
                      Mission Complete!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-6">
                      <div className="text-6xl font-bold text-green-400">
                        {selectedMission.score}%
                      </div>
                      <div className="max-w-2xl mx-auto">
                        <p className="text-gray-300 text-lg mb-4">
                          {selectedMission.score && selectedMission.score >= 80 ? 
                            "🎉 Outstanding work! You've mastered this concept and are ready to move forward." :
                            selectedMission.score && selectedMission.score >= 60 ?
                            "👏 Good progress! You understand the basics. Review any unclear areas and continue." :
                            "💪 Keep learning! This topic needs more review. Don't give up - every pro started here."
                          }
                        </p>
                        
                        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                          <p className="text-gray-400 text-sm italic">
                            "Remember: You will not get rich quick. But you will get rich if you're obsessed with improving. 
                            Every wrong answer is a step closer to mastery."
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={() => setSelectedMission(null)}
                          className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
                        >
                          <Star className="w-5 h-5 mr-2" />
                          Continue Journey
                        </Button>
                        <Button
                          onClick={() => askMentor(selectedMission)}
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-8 py-3"
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Ask Mentor
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveLearningPath;
