
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  ChevronRight,
  Star,
  CheckCircle,
  Lock,
  PlayCircle,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Award,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InteractiveQuizGenerator } from './InteractiveQuizGenerator';
import VisualLessonCard from './VisualLessonCard';
import LessonContent from './LessonContent';

interface LearningMission {
  id: string;
  title: string;
  description: string;
  week: number;
  keyPoints: string[];
  learningObjectives: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  stage: number;
  prerequisites: string[];
  completed: boolean;
  lessonCompleted: boolean;
  mentorPrompt: string;
  content: string;
  practicalExercises: string[];
  quiz: {
    questions: Array<{
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }>;
  };
}

interface ComprehensiveLearningPathProps {
  onAskMentor: (prompt: string) => void;
}

const ComprehensiveLearningPath: React.FC<ComprehensiveLearningPathProps> = ({ onAskMentor }) => {
  const [selectedMission, setSelectedMission] = useState<LearningMission | null>(null);
  const [userProgress, setUserProgress] = useState({ completedMissions: 0, currentStage: 1 });
  const [showQuiz, setShowQuiz] = useState(false);
  const [showLesson, setShowLesson] = useState(false);
  const { user } = useAuth();

  // Sample mission data with all required properties
  const [learningMissions, setLearningMissions] = useState<LearningMission[]>([
    {
      id: 'mission-1',
      title: 'Trading Fundamentals',
      description: 'Master the basic concepts of financial markets and trading',
      week: 1,
      keyPoints: ['Market basics', 'Price action', 'Support & Resistance'],
      learningObjectives: ['Understand market structure', 'Identify key levels'],
      difficulty: 'Beginner' as const,
      estimatedTime: '2-3 hours',
      stage: 1,
      prerequisites: [],
      completed: false,
      lessonCompleted: false,
      mentorPrompt: 'Explain the basics of trading and market structure',
      content: 'Learn about financial markets, how they work, and basic trading concepts.',
      practicalExercises: [
        'Identify support and resistance levels on a chart',
        'Practice drawing trendlines',
        'Analyze market structure'
      ],
      quiz: {
        questions: [
          {
            question: 'What is a support level?',
            options: ['Price ceiling', 'Price floor', 'Random level', 'Trend line'],
            correct: 1,
            explanation: 'A support level acts as a price floor where buying interest typically emerges.'
          }
        ]
      }
    },
    {
      id: 'mission-2',
      title: 'Chart Analysis Mastery',
      description: 'Learn to read charts and identify patterns',
      week: 2,
      keyPoints: ['Candlestick patterns', 'Chart patterns', 'Trend analysis'],
      learningObjectives: ['Read candlestick patterns', 'Identify chart formations'],
      difficulty: 'Beginner' as const,
      estimatedTime: '3-4 hours',
      stage: 1,
      prerequisites: [],
      completed: false,
      lessonCompleted: false,
      mentorPrompt: 'Teach me about chart analysis and pattern recognition',
      content: 'Master the art of reading price charts and identifying profitable patterns.',
      practicalExercises: [
        'Identify 10 different candlestick patterns',
        'Spot head and shoulders formations',
        'Practice trend line analysis'
      ],
      quiz: {
        questions: [
          {
            question: 'What does a doji candlestick indicate?',
            options: ['Strong uptrend', 'Market indecision', 'Strong downtrend', 'High volume'],
            correct: 1,
            explanation: 'A doji represents market indecision where open and close prices are nearly equal.'
          }
        ]
      }
    },
    {
      id: 'mission-3',
      title: 'Risk Management',
      description: 'Learn proper risk management techniques',
      week: 3,
      keyPoints: ['Position sizing', 'Stop losses', 'Risk-reward ratios'],
      learningObjectives: ['Calculate position sizes', 'Set proper stop losses'],
      difficulty: 'Intermediate' as const,
      estimatedTime: '4-5 hours',
      stage: 2,
      prerequisites: ['mission-1'],
      completed: false,
      lessonCompleted: false,
      mentorPrompt: 'Teach me about risk management in trading',
      content: 'Master the crucial skill of managing risk to protect your capital.',
      practicalExercises: [
        'Calculate position sizes for different account sizes',
        'Practice setting stop losses',
        'Analyze risk-reward scenarios'
      ],
      quiz: {
        questions: [
          {
            question: 'What should your maximum risk per trade be?',
            options: ['1-2% of account', '10% of account', '50% of account', 'All available capital'],
            correct: 0,
            explanation: 'Professional traders typically risk 1-2% of their account per trade to preserve capital.'
          }
        ]
      }
    }
  ]);

  const handleMissionSelect = (mission: LearningMission) => {
    setSelectedMission(mission);
    setShowQuiz(false);
    setShowLesson(false);
  };

  const handleStartLearning = () => {
    if (selectedMission) {
      setShowLesson(true);
      setShowQuiz(false);
    }
  };

  const handleLessonComplete = () => {
    if (selectedMission) {
      const updatedMissions = learningMissions.map(mission =>
        mission.id === selectedMission.id
          ? { ...mission, lessonCompleted: true }
          : mission
      );
      setLearningMissions(updatedMissions);
      setSelectedMission({ ...selectedMission, lessonCompleted: true });
    }
  };

  const handleStartQuiz = () => {
    if (selectedMission && selectedMission.lessonCompleted) {
      setShowQuiz(true);
      setShowLesson(false);
    }
  };

  const handleAskMentorClick = () => {
    if (selectedMission) {
      onAskMentor(selectedMission.mentorPrompt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="glass-card border-gold-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-gold-400" />
              6-Month Professional Trading Path
            </div>
            <Badge className="bg-gold-500/20 text-gold-400">
              Stage {userProgress.currentStage}/6
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={(userProgress.completedMissions / learningMissions.length) * 100} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gold-400">{userProgress.completedMissions}</div>
                <div className="text-sm text-gray-400">Missions Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{learningMissions.length}</div>
                <div className="text-sm text-gray-400">Total Missions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">85%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">24h</div>
                <div className="text-sm text-gray-400">Study Time</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Learning Missions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {learningMissions.map((mission, index) => (
              <div
                key={mission.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedMission?.id === mission.id
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}
                onClick={() => handleMissionSelect(mission)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {mission.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : mission.lessonCompleted ? (
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                    ) : index <= userProgress.completedMissions ? (
                      <PlayCircle className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <h4 className="font-semibold text-white">{mission.title}</h4>
                      <p className="text-sm text-gray-400">{mission.description}</p>
                      {mission.lessonCompleted && !mission.completed && (
                        <Badge className="mt-1 bg-blue-500/20 text-blue-400 text-xs">
                          Ready for Quiz
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={mission.difficulty === 'Beginner' ? 'default' : 'secondary'}>
                    {mission.difficulty}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mission Detail */}
        <div className="space-y-4">
          {selectedMission ? (
            <>
              {showLesson ? (
                <LessonContent
                  missionId={selectedMission.id}
                  missionTitle={selectedMission.title}
                  difficulty={selectedMission.difficulty}
                  onLessonComplete={handleLessonComplete}
                  onStartQuiz={handleStartQuiz}
                />
              ) : showQuiz ? (
                <InteractiveQuizGenerator
                  missionTitle={selectedMission.title}
                  keyPoints={selectedMission.keyPoints}
                  learningObjectives={selectedMission.learningObjectives}
                  onComplete={(score) => {
                    console.log('Quiz completed with score:', score);
                    setShowQuiz(false);
                  }}
                  onAskMentor={handleAskMentorClick}
                />
              ) : (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedMission.title}</span>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {selectedMission.estimatedTime}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">{selectedMission.content}</p>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Learning Objectives
                      </h4>
                      <ul className="space-y-1">
                        {selectedMission.learningObjectives.map((objective, index) => (
                          <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                            <ChevronRight className="w-3 h-3" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Key Points
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMission.keyPoints.map((point, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-yellow-400">Learning Path</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Complete the lesson first to understand the concepts, then take the quiz to test your knowledge.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      {!selectedMission.lessonCompleted ? (
                        <Button 
                          onClick={handleStartLearning}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Start Learning
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleStartQuiz}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                      )}
                      
                      <Button 
                        onClick={handleAskMentorClick}
                        variant="outline"
                        className="flex-1"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Ask AI Mentor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Visual Learning Component - only show when not in lesson or quiz mode */}
              {!showLesson && !showQuiz && (
                <VisualLessonCard
                  title="Visual Learning: Chart Patterns"
                  description="Interactive visualization of trading concepts"
                  keyPoints={selectedMission.keyPoints}
                  visualType="chart"
                  difficulty={selectedMission.difficulty}
                />
              )}
            </>
          ) : (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Select a Mission
                </h3>
                <p className="text-gray-500">
                  Choose a learning mission from the left to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveLearningPath;
