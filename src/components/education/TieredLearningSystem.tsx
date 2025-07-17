
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  Lock,
  Star,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  month: number;
  topics: string[];
  prerequisites: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
  estimatedHours: number;
}

interface TieredLearningSystemProps {
  userId?: string;
}

export const TieredLearningSystem: React.FC<TieredLearningSystemProps> = ({ userId }) => {
  const [currentMonth, setCurrentMonth] = useState(1);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const { toast } = useToast();

  const learningModules: LearningModule[] = [
    // Month 1: Foundation Building
    {
      id: 'foundations-1',
      title: 'Trading Fundamentals',
      description: 'Master the absolute basics of forex trading, market structure, and terminology',
      duration: '2 weeks',
      difficulty: 'beginner',
      month: 1,
      topics: ['Currency Pairs', 'Pips & Spreads', 'Market Sessions', 'Order Types'],
      prerequisites: [],
      isUnlocked: true,
      isCompleted: false,
      progress: 0,
      estimatedHours: 15
    },
    {
      id: 'chart-basics-1',
      title: 'Chart Reading Mastery',
      description: 'Learn to read price action, candlestick patterns, and basic market structure',
      duration: '2 weeks',
      difficulty: 'beginner',
      month: 1,
      topics: ['Candlestick Patterns', 'Support & Resistance', 'Trend Analysis', 'Chart Timeframes'],
      prerequisites: ['foundations-1'],
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      estimatedHours: 20
    },
    
    // Month 2: Strategy Development
    {
      id: 'smc-intro-2',
      title: 'Smart Money Concepts',
      description: 'Understanding institutional trading concepts and market structure',
      duration: '3 weeks',
      difficulty: 'intermediate',
      month: 2,
      topics: ['Order Blocks', 'Fair Value Gaps', 'Liquidity Sweeps', 'Market Structure'],
      prerequisites: ['foundations-1', 'chart-basics-1'],
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      estimatedHours: 25
    },
    {
      id: 'ict-concepts-2',
      title: 'ICT Trading Methodology',
      description: 'Advanced price action concepts and institutional thinking',
      duration: '3 weeks',
      difficulty: 'intermediate',
      month: 2,
      topics: ['PD Arrays', 'Optimal Trade Entry', 'Market Maker Models', 'Time-based Analysis'],
      prerequisites: ['smc-intro-2'],
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      estimatedHours: 30
    },
    
    // Month 3+: Advanced Mastery
    {
      id: 'psychology-3',
      title: 'Trading Psychology Mastery',
      description: 'Master your emotions and develop disciplined trading habits',
      duration: '4 weeks',
      difficulty: 'advanced',
      month: 3,
      topics: ['Risk Management Psychology', 'Emotional Control', 'Discipline Building', 'Performance Analysis'],
      prerequisites: ['ict-concepts-2'],
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      estimatedHours: 35
    },
    {
      id: 'advanced-strategies-3',
      title: 'Advanced Strategy Development',
      description: 'Create and backtest your own professional trading strategies',
      duration: '6 weeks',
      difficulty: 'advanced',
      month: 3,
      topics: ['Strategy Creation', 'Backtesting', 'Risk Management', 'Portfolio Theory'],
      prerequisites: ['psychology-3'],
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      estimatedHours: 40
    }
  ];

  const [modules, setModules] = useState(learningModules);

  useEffect(() => {
    // Load user progress and unlock appropriate modules
    loadUserProgress();
  }, [userId]);

  const loadUserProgress = async () => {
    // In a real implementation, load from database
    const mockProgress = {
      'foundations-1': 75,
      'chart-basics-1': 30,
      'smc-intro-2': 0
    };
    
    setUserProgress(mockProgress);
    
    // Update module states based on progress
    setModules(prevModules => 
      prevModules.map(module => ({
        ...module,
        progress: mockProgress[module.id] || 0,
        isCompleted: (mockProgress[module.id] || 0) >= 100,
        isUnlocked: module.prerequisites.length === 0 || 
                   module.prerequisites.every(prereq => (mockProgress[prereq] || 0) >= 100)
      }))
    );
  };

  const startModule = async (module: LearningModule) => {
    if (!module.isUnlocked) {
      toast({
        title: "Module Locked",
        description: "Complete prerequisite modules to unlock this content",
        variant: "destructive"
      });
      return;
    }

    setSelectedModule(module);
    toast({
      title: `Starting: ${module.title}`,
      description: `Beginning your ${module.duration} learning journey`,
    });
  };

  const continueModule = async (module: LearningModule) => {
    setSelectedModule(module);
    toast({
      title: `Continuing: ${module.title}`,
      description: `Resuming from ${module.progress}% completion`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMonthModules = (month: number) => {
    return modules.filter(module => module.month === month);
  };

  const calculateMonthProgress = (month: number) => {
    const monthModules = getMonthModules(month);
    const totalProgress = monthModules.reduce((sum, module) => sum + module.progress, 0);
    return monthModules.length > 0 ? totalProgress / monthModules.length : 0;
  };

  const totalEstimatedHours = modules.reduce((sum, module) => sum + module.estimatedHours, 0);
  const completedHours = modules.reduce((sum, module) => sum + (module.estimatedHours * module.progress / 100), 0);

  return (
    <div className="space-y-6">
      {/* Learning Path Overview */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            Professional Trading Mastery Program
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">
              {totalEstimatedHours}+ Hours
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{completedHours.toFixed(0)}h</div>
              <div className="text-sm text-gray-400">Hours Completed</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{modules.filter(m => m.isCompleted).length}</div>
              <div className="text-sm text-gray-400">Modules Mastered</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{currentMonth}</div>
              <div className="text-sm text-gray-400">Current Month</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Overall Progress</span>
              <span>{((completedHours / totalEstimatedHours) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={(completedHours / totalEstimatedHours) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Month Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3].map(month => (
          <Button
            key={month}
            onClick={() => setCurrentMonth(month)}
            variant={currentMonth === month ? "default" : "outline"}
            className={`min-w-fit ${currentMonth === month ? 'bg-purple-600' : ''}`}
          >
            Month {month}
            <div className="ml-2 text-xs">
              {calculateMonthProgress(month).toFixed(0)}%
            </div>
          </Button>
        ))}
      </div>

      {/* Current Month Modules */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Month {currentMonth} Learning Path
        </h3>
        
        {getMonthModules(currentMonth).map((module, index) => (
          <Card key={module.id} className={`glass-card transition-all duration-200 hover:border-purple-400/40 ${
            !module.isUnlocked ? 'opacity-60' : ''
          }`}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Module Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      module.isCompleted ? 'bg-green-500/20' : 
                      module.progress > 0 ? 'bg-blue-500/20' : 
                      module.isUnlocked ? 'bg-purple-500/20' : 'bg-gray-500/20'
                    }`}>
                      {module.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : module.isUnlocked ? (
                        <BookOpen className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{module.title}</h4>
                      <p className="text-sm text-gray-400">{module.description}</p>
                    </div>
                  </div>
                  
                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {module.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Progress */}
                  {module.isUnlocked && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Module Meta & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {module.duration}
                    </Badge>
                  </div>
                  
                  <div className="text-right text-sm text-gray-400">
                    <div>{module.estimatedHours} hours</div>
                  </div>
                  
                  <div className="flex gap-2">
                    {module.isCompleted ? (
                      <Button size="sm" variant="outline" onClick={() => continueModule(module)}>
                        <Star className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    ) : module.progress > 0 ? (
                      <Button size="sm" onClick={() => continueModule(module)}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Continue
                      </Button>
                    ) : module.isUnlocked ? (
                      <Button size="sm" onClick={() => startModule(module)}>
                        <Zap className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <Lock className="w-4 h-4 mr-1" />
                        Locked
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Prerequisites */}
              {module.prerequisites.length > 0 && !module.isUnlocked && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Prerequisites: Complete {module.prerequisites.join(', ')} first</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Learning Companion */}
      <Card className="glass-card border-blue-500/20">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">AI Learning Companion</h3>
          <p className="text-gray-400 mb-4">
            Get personalized guidance, answer questions, and receive feedback throughout your learning journey
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Brain className="w-4 h-4 mr-2" />
            Chat with AI Mentor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TieredLearningSystem;
