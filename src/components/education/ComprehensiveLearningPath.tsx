
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
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { comprehensiveLearningService, LearningStage, LearningMission } from '@/services/comprehensiveLearningService';

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
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
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
    } catch (error) {
      console.error('Error loading learning path:', error);
      toast({
        title: "Error",
        description: "Failed to load learning path. Please try again.",
        variant: "destructive"
      });
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
    
    if (!mission.content) {
      const content = await comprehensiveLearningService.generateMissionContent(mission);
      setMissionContent(content);
      mission.content = content;
    } else {
      setMissionContent(mission.content);
    }

    if (mission.quiz.length === 0) {
      const quiz = await comprehensiveLearningService.generateQuiz(mission);
      mission.quiz = quiz;
    }
  };

  const startQuiz = () => {
    setQuizMode(true);
    setQuizAnswers({});
    setShowResults(false);
  };

  const submitQuiz = async () => {
    if (!selectedMission || !user?.id) return;

    const correctAnswers = selectedMission.quiz.filter(
      (q, index) => quizAnswers[q.id] === q.correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / selectedMission.quiz.length) * 100);
    
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-gold-400" />
            6-Month Professional Trading Mastery Program
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">
              Complete Path
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{getOverallProgress().toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Overall Progress</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{stages.filter(s => s.completed).length}</div>
              <div className="text-sm text-gray-400">Stages Completed</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {stages.reduce((sum, stage) => sum + stage.missions.filter(m => m.completed).length, 0)}
              </div>
              <div className="text-sm text-gray-400">Missions Complete</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{currentStage}</div>
              <div className="text-sm text-gray-400">Current Stage</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Journey Progress</span>
              <span>{getOverallProgress().toFixed(0)}%</span>
            </div>
            <Progress value={getOverallProgress()} className="h-3" />
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Remember: Trading Mastery Takes Time</h3>
            <p className="text-gray-300 text-sm">
              "You will not get rich quick. But you will get rich if you're obsessed with improving."
              <br />Take notes, practice daily, and never stop learning.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedMission ? 'mission' : 'stages'} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="stages" 
            onClick={() => setSelectedMission(null)}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Learning Stages
          </TabsTrigger>
          <TabsTrigger 
            value="mission" 
            disabled={!selectedMission}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Current Mission
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stages">
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <Card key={stage.id} className={`glass-card transition-all duration-200 hover:border-purple-400/40 ${
                currentStage === stage.id ? 'border-purple-500/50 bg-purple-500/5' : 'border-gray-700/50'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        stage.completed ? 'bg-green-500/20 text-green-400' : 
                        currentStage === stage.id ? 'bg-purple-500/20 text-purple-400' : 
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {stage.completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : currentStage === stage.id ? (
                          <Play className="w-6 h-6" />
                        ) : currentStage > stage.id ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Stage {stage.id}: {stage.title}</h3>
                        <p className="text-gray-400">{stage.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stage.duration}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Stage Progress</span>
                      <span>{getStageProgress(stage).toFixed(0)}%</span>
                    </div>
                    <Progress value={getStageProgress(stage)} className="h-2" />
                  </div>

                  <div className="grid gap-3">
                    {stage.missions.map((mission, missionIndex) => (
                      <div
                        key={mission.id}
                        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:border-purple-400/40 ${
                          mission.completed ? 'border-green-500/30 bg-green-500/5' :
                          isMissionUnlocked(mission) ? 'border-purple-500/30 bg-purple-500/5' :
                          'border-gray-600/30 bg-gray-800/20 opacity-60'
                        }`}
                        onClick={() => isMissionUnlocked(mission) && startMission(mission)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              mission.completed ? 'bg-green-500/20 text-green-400' :
                              isMissionUnlocked(mission) ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {mission.completed ? '✓' : missionIndex + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{mission.title}</h4>
                              <p className="text-sm text-gray-400">{mission.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(mission.difficulty)}>
                              {mission.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {mission.estimatedTime}
                            </Badge>
                            {mission.completed && mission.score && (
                              <Badge className="bg-green-500/20 text-green-400">
                                {mission.score}%
                              </Badge>
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
              <Card className="glass-card border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedMission.title}</h2>
                        <p className="text-gray-400">Stage {selectedMission.stage} • {selectedMission.estimatedTime}</p>
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
                      <div dangerouslySetInnerHTML={{ __html: missionContent.replace(/\n/g, '<br />') }} />
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <div className="flex gap-4">
                        <Button
                          onClick={startQuiz}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Take Mission Quiz
                        </Button>
                        <Button
                          onClick={() => askMentor(selectedMission)}
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Ask Questions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quiz Mode */}
              {quizMode && !showResults && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Mission Quiz: {selectedMission.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedMission.quiz.map((question, index) => (
                      <div key={question.id} className="p-4 bg-gray-800/30 rounded-lg">
                        <h3 className="font-semibold text-white mb-3">
                          {index + 1}. {question.question}
                        </h3>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-700/30"
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={optionIndex}
                                onChange={(e) => setQuizAnswers(prev => ({
                                  ...prev,
                                  [question.id]: parseInt(e.target.value)
                                }))}
                                className="text-purple-500"
                              />
                              <span className="text-gray-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length < selectedMission.quiz.length}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Quiz & Complete Mission
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Quiz Results */}
              {showResults && (
                <Card className="glass-card border-green-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <Trophy className="w-5 h-5" />
                      Mission Complete!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold text-green-400">
                        {selectedMission.score}%
                      </div>
                      <p className="text-gray-300">
                        {selectedMission.score && selectedMission.score >= 80 ? 
                          "Excellent work! You've mastered this concept." :
                          selectedMission.score && selectedMission.score >= 60 ?
                          "Good progress! Review and move forward." :
                          "Keep learning! Review the material and try again."
                        }
                      </p>
                      
                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={() => setSelectedMission(null)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Next Mission
                        </Button>
                        <Button
                          onClick={() => askMentor(selectedMission)}
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
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
